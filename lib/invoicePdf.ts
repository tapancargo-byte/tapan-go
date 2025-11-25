import puppeteer from "puppeteer";
import QRCode from "qrcode";
import { supabaseAdmin } from "./supabaseAdmin";
import { uploadBufferToStorage, createSignedUrl } from "./storageHelpers";
import { sendInvoiceFailureAlert } from "./slackAlerts";
import { companyProfile, bankDetails, paymentConfig } from "./companyConfig";

const STORAGE_PREFIX = "invoices";

export async function generateInvoicePdf(invoiceId: string) {
  const startedAt = Date.now();
  let logId: string | null = null;

  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .select("id, invoice_ref, customer_id, amount, status, invoice_date, due_date")
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError) {
    throw invoiceError;
  }

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("id, name, phone, city")
    .eq("id", invoice.customer_id)
    .maybeSingle();

  const { data: customerInvoices } = await supabaseAdmin
    .from("invoices")
    .select("id, amount, status, invoice_date")
    .eq("customer_id", invoice.customer_id);

  const { data: invoiceItems } = await supabaseAdmin
    .from("invoice_items")
    .select("shipment_id, amount")
    .eq("invoice_id", invoice.id);

  const isUnpaid = (status: string | null | undefined) => {
    const normalized = (status ?? "").toLowerCase();
    return normalized === "pending" || normalized === "overdue";
  };

  let previousBalance = 0;
  let totalOutstanding = 0;

  if (Array.isArray(customerInvoices)) {
    const all = customerInvoices as any[];
    const invoiceDate: string | null = (invoice as any).invoice_date ?? null;

    totalOutstanding = all.reduce((sum, row) => {
      if (!isUnpaid(row.status)) return sum;
      return sum + Number(row.amount ?? 0);
    }, 0);

    if (invoiceDate) {
      previousBalance = all.reduce((sum, row) => {
        if (row.id === invoice.id) return sum;
        if (!isUnpaid(row.status)) return sum;
        if (!row.invoice_date || row.invoice_date >= invoiceDate) return sum;
        return sum + Number(row.amount ?? 0);
      }, 0);
    } else {
      previousBalance = Math.max(
        0,
        totalOutstanding - Number((invoice as any).amount ?? 0)
      );
    }
  }

  const invoiceAmount = Number((invoice as any).amount ?? 0);
  const amountDue = totalOutstanding > 0 ? totalOutstanding : invoiceAmount;

  let lineItems: { description: string; weight: number; amount: number }[] = [];
  let itemsSubTotal = 0;

  if (Array.isArray(invoiceItems) && invoiceItems.length > 0) {
    const allItems = invoiceItems as any[];
    const shipmentIds = Array.from(
      new Set(
        allItems
          .map((row) => row.shipment_id as string | null)
          .filter((id): id is string => !!id)
      )
    );

    let shipmentsById: Record<string, any> = {};

    if (shipmentIds.length > 0) {
      const { data: shipmentRows, error: shipmentsError } = await supabaseAdmin
        .from("shipments")
        .select("id, shipment_ref, origin, destination, weight")
        .in("id", shipmentIds);

      if (!shipmentsError && Array.isArray(shipmentRows)) {
        (shipmentRows as any[]).forEach((s) => {
          shipmentsById[s.id] = s;
        });
      }
    }

    lineItems = allItems.map((item, index) => {
      const shipmentId = item.shipment_id as string | null;
      const shipment = shipmentId ? shipmentsById[shipmentId] : null;
      const weight = Number(shipment?.weight ?? 0);
      const amount = Number(item.amount ?? 0);
      itemsSubTotal += amount;

      const parts: string[] = [];
      if (shipment?.shipment_ref) {
        parts.push(String(shipment.shipment_ref));
      }
      if (shipment?.origin || shipment?.destination) {
        const route = `${shipment.origin ?? ""}  ${shipment.destination ?? ""}`.trim();
        if (route) parts.push(route);
      }

      const description =
        parts.join(" | ") || `Shipment ${index + 1}`;

      return { description, weight, amount };
    });
  }

  if (lineItems.length === 0) {
    if (invoiceAmount > 0) {
      itemsSubTotal = invoiceAmount;
      lineItems = [
        {
          description: "Logistics services",
          weight: 0,
          amount: invoiceAmount,
        },
      ];
    }
  }

  const upiUri = `upi://pay?pa=${encodeURIComponent(
    paymentConfig.upiVpa
  )}&pn=${encodeURIComponent(
    paymentConfig.upiPayeeName
  )}&am=${amountDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `Invoice ${invoice.invoice_ref ?? invoice.id}`
  )}`;

  const qrDataUrl = await QRCode.toDataURL(upiUri);

  const { data: log } = await supabaseAdmin
    .from("invoice_generation_logs")
    .insert([
      {
        invoice_id: invoice.id,
        status: "pending",
        message: "Generation started",
        started_at: new Date().toISOString(),
      },
    ])
    .select("id")
    .single();

  logId = log?.id ?? null;

  try {
    const html = buildInvoiceHtml({
      invoice,
      customer,
      amountDue,
      previousBalance,
      lineItems,
      itemsSubTotal,
      qrDataUrl,
    });

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "12mm", bottom: "12mm", left: "10mm", right: "10mm" },
    });
    await browser.close();

    const pdfPath = `${STORAGE_PREFIX}/${invoice.id}/invoice.pdf`;
    await uploadBufferToStorage(pdfPath, pdfBuffer, "application/pdf");

    await supabaseAdmin
      .from("invoices")
      .update({ pdf_path: pdfPath })
      .eq("id", invoice.id);

    const finishedAt = Date.now();

    if (logId) {
      await supabaseAdmin
        .from("invoice_generation_logs")
        .update({
          status: "success",
          message: "Invoice PDF generated successfully",
          finished_at: new Date().toISOString(),
          duration_ms: finishedAt - startedAt,
        })
        .eq("id", logId);
    }

    const pdfUrl = await createSignedUrl(pdfPath, 60 * 60 * 24);

    return { pdfPath, pdfUrl };
  } catch (error: any) {
    const finishedAt = Date.now();

    if (logId) {
      await supabaseAdmin
        .from("invoice_generation_logs")
        .update({
          status: "failed",
          message: error?.message ?? "Invoice PDF generation failed",
          finished_at: new Date().toISOString(),
          duration_ms: finishedAt - startedAt,
        })
        .eq("id", logId);
    }

    try {
      const { data: recentLogs, error: logsError } = await supabaseAdmin
        .from("invoice_generation_logs")
        .select("status, started_at")
        .eq("invoice_id", invoice.id)
        .order("started_at", { ascending: false })
        .limit(3);

      if (!logsError && recentLogs && recentLogs.length >= 3) {
        const allFailed = recentLogs.every((row: any) => row.status === "failed");

        if (allFailed) {
          await sendInvoiceFailureAlert({
            invoiceId: invoice.id,
            invoiceRef: invoice.invoice_ref,
            errorMessage: error?.message ?? "Invoice PDF generation failed",
            failureCount: recentLogs.length,
          });
        }
      }
    } catch (alertError) {
      console.error("Failed to process Slack alert for invoice generation failure", alertError);
    }

    throw error;
  }
}

function buildInvoiceHtml({
  invoice,
  customer,
  amountDue,
  previousBalance,
  lineItems,
  itemsSubTotal,
  qrDataUrl,
}: {
  invoice: {
    id?: string | null;
    invoice_ref?: string | null;
    amount?: number | null;
    status?: string | null;
    invoice_date?: string | null;
    due_date?: string | null;
  };
  customer?: { name?: string | null; phone?: string | null; city?: string | null } | null;
  amountDue: number;
  previousBalance: number;
  lineItems: { description: string; weight: number; amount: number }[];
  itemsSubTotal: number;
  qrDataUrl: string;
}) {
  const ref = invoice.invoice_ref ?? "";
  const amount = invoice.amount ?? 0;
  const status = (invoice.status ?? "").toUpperCase();
  const invoiceDate = invoice.invoice_date
    ? new Date(invoice.invoice_date).toLocaleDateString("en-IN")
    : "";
  const dueDate = invoice.due_date
    ? new Date(invoice.due_date).toLocaleDateString("en-IN")
    : "";

  const customerName = customer?.name ?? "";
  const customerPhone = customer?.phone ?? "";
  const customerCity = customer?.city ?? "";

  const subTotalValue = itemsSubTotal > 0 ? itemsSubTotal : amount;

  const amountDueDisplay = amountDue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const previousBalanceDisplay = previousBalance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const invoiceTotalDisplay = subTotalValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${ref}</title>
  </head>
  <body style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#111; padding:24px; background:#f3f4f6;">
    <div style="max-width:800px; margin:0 auto; background:#fff; box-shadow:0 10px 30px rgba(15,23,42,0.12); border-radius:8px; overflow:hidden; border:1px solid #e5e7eb;">
      <header style="display:flex; justify-content:space-between; padding:20px 24px; background:linear-gradient(135deg,#1d4ed8,#7c3aed); color:#fff;">
        <div>
          <h1 style="margin:0 0 4px 0; font-size:22px; letter-spacing:0.06em; text-transform:uppercase;">${
            companyProfile.name
          }</h1>
          <div style="font-size:11px; opacity:0.9;">GSTIN: ${
            companyProfile.gstin
          }</div>
          <div style="font-size:11px; opacity:0.9; margin-top:4px;">State: 07-Delhi</div>
        </div>
        <div style="text-align:right; font-size:11px; max-width:260px;">
          ${companyProfile.addressLines
            .map((line) => `<div>${line}</div>`)
            .join("")}
          <div style="margin-top:6px; display:flex; justify-content:flex-end; gap:10px; align-items:center;">
            <span>📞 ${companyProfile.phonePrimary}</span>
            <span>📧 ${companyProfile.email}</span>
          </div>
        </div>
      </header>

      <section style="display:flex; padding:16px 24px; border-bottom:1px solid #e5e7eb;">
        <div style="flex:1; font-size:13px;">
          <div style="font-size:11px; letter-spacing:0.08em; color:#6b7280; text-transform:uppercase; margin-bottom:4px;">Bill To</div>
          <div style="font-weight:600; font-size:14px;">${customerName}</div>
          <div>${customerCity || ""}</div>
          <div>${customerPhone}</div>
        </div>
        <div style="flex:1; font-size:12px; text-align:right;">
          <div style="font-size:11px; letter-spacing:0.08em; color:#6b7280; text-transform:uppercase; margin-bottom:6px;">Consignment</div>
          <div><strong>Invoice No:</strong> ${ref || invoice.id}</div>
          <div><strong>Date:</strong> ${invoiceDate}</div>
          <div><strong>Due Date:</strong> ${dueDate || "-"}</div>
          <div><strong>Status:</strong> ${status || "PENDING"}</div>
        </div>
      </section>

      <section style="padding:16px 24px; border-bottom:1px solid #e5e7eb;">
        <div style="font-size:11px; letter-spacing:0.08em; color:#6b7280; text-transform:uppercase; margin-bottom:6px;">Items</div>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left; padding:8px; border-bottom:1px solid #e5e7eb; width:40px;">Sr</th>
              <th style="text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;">Description</th>
              <th style="text-align:right; padding:8px; border-bottom:1px solid #e5e7eb; width:110px;">Weight (kg)</th>
              <th style="text-align:right; padding:8px; border-bottom:1px solid #e5e7eb; width:120px;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${
              lineItems.length > 0
                ? lineItems
                    .map((item, index) => {
                      const weightDisplay =
                        item.weight > 0
                          ? item.weight.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })
                          : "-";
                      const amountDisplay = item.amount.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      });
                      return `<tr>
                        <td style="padding:8px; border-bottom:1px solid #f3f4f6;">${
                          index + 1
                        }</td>
                        <td style="padding:8px; border-bottom:1px solid #f3f4f6;">${
                          item.description
                        }</td>
                        <td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right;">${weightDisplay}</td>
                        <td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right;">₹${amountDisplay}</td>
                      </tr>`;
                    })
                    .join("")
                : `<tr>
                    <td style="padding:8px; border-bottom:1px solid #f3f4f6;" colspan="4">No line items recorded for this invoice.</td>
                  </tr>`
            }
          </tbody>
        </table>
      </section>

      <section style="display:flex; padding:16px 24px; border-bottom:1px solid #e5e7eb; align-items:flex-start; gap:24px;">
        <div style="flex:2;">
          <div style="font-size:11px; letter-spacing:0.08em; color:#6b7280; text-transform:uppercase; margin-bottom:6px;">Summary</div>
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead>
              <tr>
                <th style="text-align:left; padding:8px; border-bottom:1px solid #e5e7eb;">Description</th>
                <th style="text-align:right; padding:8px; border-bottom:1px solid #e5e7eb;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:8px; border-bottom:1px solid #f3f4f6;">Logistics services</td>
                <td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right;">₹${invoiceTotalDisplay}</td>
              </tr>
              <tr>
                <td style="padding:8px; border-bottom:1px solid #f3f4f6;">Previous balance</td>
                <td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right;">₹${previousBalanceDisplay}</td>
              </tr>
              <tr>
                <td style="padding:8px; font-weight:600;">Amount due</td>
                <td style="padding:8px; font-weight:700; text-align:right; color:#16a34a;">₹${amountDueDisplay}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="flex:1; text-align:center;">
          <div style="font-size:11px; letter-spacing:0.08em; color:#6b7280; text-transform:uppercase; margin-bottom:6px;">Scan to Pay</div>
          <div style="background:#f9fafb; padding:8px; border-radius:8px; display:inline-block; border:1px solid #e5e7eb;">
            <img src="${qrDataUrl}" alt="Scan to pay" style="width:140px; height:140px; display:block;" />
            <div style="font-size:10px; color:#6b7280; margin-top:6px;">UPI / QR payment</div>
          </div>
        </div>
      </section>

      <section style="padding:16px 24px; border-bottom:1px solid #e5e7eb; font-size:11px; display:flex; gap:24px;">
        <div style="flex:1;">
          <div style="font-size:11px; letter-spacing:0.08em; color:#6b7280; text-transform:uppercase; margin-bottom:6px;">Bank Details</div>
          <div><strong>Bank:</strong> ${bankDetails.bankName}</div>
          <div><strong>Branch:</strong> ${bankDetails.branch}</div>
          <div><strong>Account Name:</strong> ${bankDetails.accountName}</div>
          <div><strong>Account No:</strong> ${bankDetails.accountNumber}</div>
          <div><strong>IFSC:</strong> ${bankDetails.ifsc}</div>
        </div>
        <div style="flex:1; font-size:10px; color:#4b5563;">
          <div style="font-size:11px; letter-spacing:0.08em; color:#6b7280; text-transform:uppercase; margin-bottom:6px;">Terms & Conditions</div>
          <ol style="margin:0; padding-left:16px; line-height:1.5;">
            <li>The consignee must declare the contents, value and condition of the items before booking.</li>
            <li>Fragile items will be considered as shipment at owner's risk unless booked under special arrangement.</li>
            <li>Company will not be responsible for leakage or perishable damage.</li>
            <li>Any consignment found damaged, lost or misdelivered will be compensated by the weight of the items with regard to value of goods.</li>
            <li>Consignment not taken delivery within 30 days may be treated as unclaimed and disposed as per company norms.</li>
          </ol>
        </div>
      </section>

      <section style="padding:16px 24px; font-size:11px; display:flex; justify-content:space-between; align-items:flex-end;">
        <div>
          <div>For: ${companyProfile.name}</div>
          <div style="margin-top:28px; border-top:1px solid #d1d5db; width:160px; font-size:10px; padding-top:4px;">Authorised Signatory</div>
        </div>
        <div style="text-align:right; font-size:10px; color:#6b7280;">
          <div>Generated by TAPAN GO cargo system.</div>
        </div>
      </section>
    </div>
  </body>
</html>`;
}
