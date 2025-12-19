import InvoiceBarcode from "@/components/invoices/invoice-barcode";

import QRCode from "qrcode";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { createSignedUrl } from "@/lib/storageHelpers";
import { companyProfile, bankDetails, paymentConfig } from "@/lib/companyConfig";
import { notFound } from "next/navigation";

interface InvoicePublicPageProps {
  params: { invoiceId: string };
}

export default async function InvoicePublicPage({
  params,
}: InvoicePublicPageProps) {
  const invoiceId = params.invoiceId;

  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .select(
      "id, invoice_ref, customer_id, consignor_id, consignee_id, amount, status, invoice_date, due_date, pdf_path, origin, destination, pieces, charged_weight, declared_value, payment_mode"
    )
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError) {
    console.error("Public invoice fetch error", invoiceError);
    throw invoiceError;
  }

  if (!invoice) {
    notFound();
  }

  const { data: customer } = await supabaseAdmin
    .from("customers")
    .select("id, name, phone, city")
    .eq("id", invoice.customer_id)
    .maybeSingle();

  const { data: consignor } = await supabaseAdmin
    .from("customers")
    .select("id, name, phone, city")
    .eq("id", (invoice as any).consignor_id)
    .maybeSingle();

  const { data: consignee } = await supabaseAdmin
    .from("customers")
    .select("id, name, phone, city")
    .eq("id", (invoice as any).consignee_id)
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

  const invoiceAmount = Number(invoice.amount ?? 0);
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
        const route = `${shipment.origin ?? ""} → ${shipment.destination ?? ""}`.trim();
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

  let pdfUrl: string | null = null;
  if (invoice.pdf_path) {
    pdfUrl = await createSignedUrl(invoice.pdf_path, 60 * 60 * 24);
  }

  const upiUri = `upi://pay?pa=${encodeURIComponent(
    paymentConfig.upiVpa
  )}&pn=${encodeURIComponent(
    paymentConfig.upiPayeeName
  )}&am=${amountDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
    `Invoice ${invoice.invoice_ref ?? invoice.id}`
  )}`;

  const qrDataUrl = await QRCode.toDataURL(upiUri);

  const invoiceDateDisplay = invoice.invoice_date
    ? new Date(invoice.invoice_date).toLocaleDateString("en-IN")
    : "";
  const dueDateDisplay = invoice.due_date
    ? new Date(invoice.due_date).toLocaleDateString("en-IN")
    : "";

  const amountDueDisplay = amountDue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const previousBalanceDisplay = previousBalance.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const subTotalValue = itemsSubTotal > 0 ? itemsSubTotal : invoiceAmount;

  const invoiceTotalDisplay = subTotalValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const customerName = customer?.name ?? "";
  const customerPhone = customer?.phone ?? "";
  const customerCity = customer?.city ?? "";

  const consignorName = consignor?.name ?? "";
  const consignorPhone = consignor?.phone ?? "";
  const consignorCity = consignor?.city ?? "";

  const consigneeName = consignee?.name ?? "";
  const consigneePhone = consignee?.phone ?? "";
  const consigneeCity = consignee?.city ?? "";

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-10 px-4">
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200">
        <div className="bg-sky-500 text-white px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] opacity-80">
              Amount due
            </div>
            <div className="text-3xl font-semibold mt-1">₹{amountDueDisplay}</div>
          </div>
          <div className="flex items-center gap-2">
            {pdfUrl && (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded bg-white text-sky-700 text-xs font-semibold shadow-sm hover:bg-sky-50"
              >
                Download
              </a>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold tracking-[0.15em] uppercase">
              {companyProfile.name}
            </h1>
            <div className="mt-1 text-xs text-slate-700 space-y-0.5">
              {companyProfile.addressLines.map((line) => (
                <div key={line}>{line}</div>
              ))}
              <div>GSTIN: {companyProfile.gstin}</div>
              <div>Phone: {companyProfile.phonePrimary}</div>
              <div>Email: {companyProfile.email}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="text-xs font-medium text-slate-700">Scan to pay</div>
            <div className="bg-white border rounded-lg p-2">
              <img
                src={qrDataUrl}
                alt="Scan to pay"
                className="w-32 h-32 object-contain"
              />
            </div>
            <div className="text-[10px] text-slate-500">UPI / QR payment</div>
          </div>
        </div>

        <div className="px-6 py-4 border-b grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-800">
          <div className="space-y-3">
            <div>
              <div className="uppercase tracking-[0.18em] text-[10px] text-slate-500 mb-1">
                Bill To
              </div>
              <div className="font-semibold text-sm">{customerName}</div>
              <div>{customerCity}</div>
              <div>{customerPhone}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="uppercase tracking-[0.18em] text-[10px] text-slate-500 mb-1">
                  Consignor
                </div>
                <div className="font-semibold text-xs">{consignorName || "-"}</div>
                <div>{consignorCity}</div>
                <div>{consignorPhone}</div>
              </div>
              <div>
                <div className="uppercase tracking-[0.18em] text-[10px] text-slate-500 mb-1">
                  Consignee
                </div>
                <div className="font-semibold text-xs">{consigneeName || "-"}</div>
                <div>{consigneeCity}</div>
                <div>{consigneePhone}</div>
              </div>
            </div>
          </div>
          <div className="md:text-right space-y-0.5">
            <div className="uppercase tracking-[0.18em] text-[10px] text-slate-500 mb-1">
              Consignment
            </div>
            <div>
              <span className="font-semibold">Invoice No:</span>{" "}
              {invoice.invoice_ref ?? invoice.id}
            </div>
            <div className="py-1 flex justify-end">
              <InvoiceBarcode
                value={invoice.invoice_ref || invoice.id}
                height={30}
                width={1}
                showValue={false}
              />
            </div>
            <div>
              <span className="font-semibold">Date:</span> {invoiceDateDisplay}
            </div>
            <div>
              <span className="font-semibold">Due Date:</span> {dueDateDisplay || "-"}
            </div>
            <div>
              <span className="font-semibold">Status:</span> {(invoice.status ?? "pending").toString().toUpperCase()}
            </div>
            {(invoice as any).origin || (invoice as any).destination ? (
              <div>
                <span className="font-semibold">Route:</span>{" "}
                {(invoice as any).origin || "?"}
                <span className="mx-1">→</span>
                {(invoice as any).destination || "?"}
              </div>
            ) : null}
            {(invoice as any).pieces != null && (
              <div>
                <span className="font-semibold">Pieces:</span>{" "}
                {(invoice as any).pieces}
              </div>
            )}
            {(invoice as any).charged_weight != null && (
              <div>
                <span className="font-semibold">Charged weight:</span>{" "}
                {(invoice as any).charged_weight} kg
              </div>
            )}
            {(invoice as any).declared_value != null && (
              <div>
                <span className="font-semibold">Declared value:</span>{" "}
                ₹{(invoice as any).declared_value.toLocaleString("en-IN")}
              </div>
            )}
            {(invoice as any).payment_mode && (
              <div>
                <span className="font-semibold">Payment mode:</span>{" "}
                {(invoice as any).payment_mode}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-b">
          <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">
            Items
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-2 px-2 w-10">Sr</th>
                  <th className="text-left py-2 px-2">Description</th>
                  <th className="text-right py-2 px-2 w-28">Weight (kg)</th>
                  <th className="text-right py-2 px-2 w-28">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.length > 0 ? (
                  lineItems.map((item, index) => (
                    <tr key={`${item.description}-${index}`} className="border-b border-slate-100">
                      <td className="py-2 px-2 align-top">{index + 1}</td>
                      <td className="py-2 px-2 align-top">{item.description}</td>
                      <td className="py-2 px-2 text-right align-top">
                        {item.weight > 0
                          ? item.weight.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })
                          : "-"}
                      </td>
                      <td className="py-2 px-2 text-right align-top">
                        ₹
                        {item.amount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-3 px-2 text-center text-slate-500 text-xs"
                    >
                      No line items recorded for this invoice.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="px-6 py-4 border-b grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2">
              Bank Details
            </div>
            <div className="space-y-0.5 text-slate-700">
              <div>
                <span className="font-semibold">Bank:</span> {bankDetails.bankName}
              </div>
              <div>
                <span className="font-semibold">Branch:</span> {bankDetails.branch}
              </div>
              <div>
                <span className="font-semibold">Account Name:</span> {bankDetails.accountName}
              </div>
              <div>
                <span className="font-semibold">Account No:</span> {bankDetails.accountNumber}
              </div>
              <div>
                <span className="font-semibold">IFSC:</span> {bankDetails.ifsc}
              </div>
            </div>
          </div>

          <div className="md:text-right space-y-1 text-slate-700">
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500 mb-2 md:text-right text-left">
              Summary
            </div>
            <div>
              <span className="font-semibold">Sub Total:</span> ₹{invoiceTotalDisplay}
            </div>
            <div>
              <span className="font-semibold">Previous Balance:</span> ₹{previousBalanceDisplay}
            </div>
            <div className="font-semibold text-base mt-1">
              <span>Total Due:</span> ₹{amountDueDisplay}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 flex items-end justify-between text-[10px] text-slate-600">
          <div>
            <div>For: {companyProfile.name}</div>
            <div className="mt-6 border-t border-slate-300 w-40 pt-1 text-center">
              Authorised Signatory
            </div>
          </div>
          <div className="text-right">
            <div>Generated by TAPAN GO cargo system.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
