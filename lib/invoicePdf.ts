import puppeteer, { Browser } from "puppeteer";
import QRCode from "qrcode";
import path from "path";
import { supabaseAdmin } from "./supabaseAdmin";
import { uploadBufferToStorage, createSignedUrl } from "./storageHelpers";
import { sendInvoiceFailureAlert } from "./slackAlerts";
import { companyProfile, bankDetails, paymentConfig } from "./companyConfig";

const STORAGE_PREFIX = "invoices";

// Singleton browser instance to improve performance
let browserInstance: Browser | null = null;

async function getBrowser() {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }
  
  browserInstance = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true
  });
  
  // Automatically reset instance if browser crashes or disconnects
  browserInstance.on("disconnected", () => {
    console.warn("Puppeteer browser disconnected. Resetting singleton.");
    browserInstance = null;
  });
  
  return browserInstance;
}

/**
 * PDF Color Palette - Modern Professional Design
 * Clean, minimal colors for a premium invoice look
 */
const PDF_COLORS = {
  // Base colors
  text: "#1a1a2e",                        // Deep navy text
  textMuted: "#64748b",                   // Slate gray
  textLight: "#94a3b8",                   // Light slate
  background: "#f8fafc",                  // Very light gray
  white: "#ffffff",                       // Pure white
  
  // Borders
  border: "#e2e8f0",                      // Light border
  borderLight: "#f1f5f9",                 // Very light border
  
  // Brand/Accent - Tapan Associate Blue
  brand: "#3b82f6",                       // Primary blue
  brandDark: "#1e40af",                   // Dark blue
  brandLight: "#dbeafe",                  // Light blue bg
  
  // Status colors
  success: "#10b981",                     // Emerald green
  successLight: "#d1fae5",                // Light green bg
  warning: "#f59e0b",                     // Amber
  warningLight: "#fef3c7",                // Light amber bg
  
  // Accent
  accent: "#8b5cf6",                      // Purple accent
};

export async function generateInvoicePdf(invoiceId: string) {
  const startedAt = Date.now();
  let logId: string | null = null;

  const { data: invoice, error: invoiceError } = await supabaseAdmin
    .from("invoices")
    .select("id, invoice_ref, customer_id, amount, status, invoice_date, due_date, pdf_path")
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

    const browser = await getBrowser();
    const page = await browser.newPage();
    
    let pdfBuffer: Uint8Array;
    try {
      await page.setContent(html, { waitUntil: "networkidle0" });

      // In development, capture a debug screenshot to inspect layout issues
      if (process.env.NODE_ENV !== "production") {
        try {
          const screenshotPath = path.join(process.cwd(), `invoice-debug-${invoice.id}.png`);
          await page.screenshot({
            path: screenshotPath as `${string}.png`,
            fullPage: true,
          });
        } catch (screenshotError) {
          console.warn("Failed to capture invoice debug screenshot", screenshotError);
        }
      }

      pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "0", bottom: "0", left: "0", right: "0" },
        preferCSSPageSize: true,
        // Slightly shrink content so the full invoice stays on a single A4 page
        scale: 0.9,
      });
    } finally {
      // Only close the page, keep browser alive
      await page.close();
    }

    // Use a timestamp to ensure the filename is unique and bypasses any storage caching
    const timestamp = Date.now();
    const pdfPath = `${STORAGE_PREFIX}/${invoice.id}/invoice-${timestamp}.pdf`;
    
    console.log(`[DEBUG] Generating PDF for ${invoice.id}`);
    console.log(`[DEBUG] New PDF Path: ${pdfPath}`);

    // Delete old PDF if it exists to keep storage clean
    if (invoice.pdf_path) {
      try {
        await supabaseAdmin.storage.from(STORAGE_PREFIX).remove([invoice.pdf_path]);
      } catch (cleanupError) {
        console.warn("Failed to cleanup old PDF", cleanupError);
      }
    }

    await uploadBufferToStorage(pdfPath, pdfBuffer, "application/pdf");

    const { error: updateError } = await supabaseAdmin
      .from("invoices")
      .update({ pdf_path: pdfPath })
      .eq("id", invoice.id);

    if (updateError) {
      console.error("[DEBUG] DB Update Failed:", updateError);
      throw updateError;
    } else {
      console.log("[DEBUG] DB Updated Successfully with path:", pdfPath);
      
      // Verify the update
      const { data: verify } = await supabaseAdmin
        .from("invoices")
        .select("pdf_path")
        .eq("id", invoice.id)
        .single();
      console.log("[DEBUG] Immediate Verification Read:", verify?.pdf_path);
    }

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
  const status = (invoice.status ?? "PENDING").toUpperCase();
  const invoiceDate = invoice.invoice_date
    ? new Date(invoice.invoice_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";
  const dueDate = invoice.due_date
    ? new Date(invoice.due_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "";

  const customerName = customer?.name ?? "—";
  const customerPhone = customer?.phone ?? "";
  const customerCity = customer?.city ?? "";

  const subTotalValue = itemsSubTotal > 0 ? itemsSubTotal : amount;

  const formatCurrency = (value: number) => "₹" + value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Tapan Associate Logo SVG (inline for PDF) - matches dashboard branding
  const logoSvg = `
    <svg viewBox="0 0 56 56" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
      <path d="M28 8L48 18V38L28 48L8 38V18L28 8Z" stroke="${PDF_COLORS.brand}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M28 8V28M28 28L48 18M28 28L8 18" stroke="${PDF_COLORS.brand}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M8 38L18 43.5" stroke="${PDF_COLORS.brand}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M48 38L38 43.5" stroke="${PDF_COLORS.brand}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    </svg>
  `;

  // Status badge styling
  const getStatusStyle = (s: string) => {
    switch (s) {
      case "PAID": return { bg: PDF_COLORS.success, text: "#fff" };
      case "OVERDUE": return { bg: "#dc2626", text: "#fff" };
      default: return { bg: PDF_COLORS.brand, text: "#fff" };
    }
  };
  const statusStyle = getStatusStyle(status);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Invoice ${ref}</title>
    <style>
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { 
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; 
        color: ${PDF_COLORS.text}; 
        background: ${PDF_COLORS.background};
        font-size: 13px;
        line-height: 1.5;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page {
        width: 210mm;
        min-height: 297mm;
        padding: 0;
        margin: 0 auto;
        background: ${PDF_COLORS.white};
        position: relative;
        page-break-inside: avoid;
        page-break-after: avoid;
      }
      /* Header with brand accent */
      .header {
        background: ${PDF_COLORS.white};
        padding: 28px 36px 24px;
        border-bottom: 3px solid ${PDF_COLORS.brand};
      }
      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .brand {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .brand-icon {
        width: 52px;
        height: 52px;
        background: ${PDF_COLORS.brandLight};
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid ${PDF_COLORS.border};
      }
      .brand-text h1 {
        font-size: 26px;
        font-weight: 800;
        color: ${PDF_COLORS.text};
        letter-spacing: 0.02em;
        margin: 0;
      }
      .brand-text .tagline {
        font-size: 11px;
        color: ${PDF_COLORS.brand};
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-top: 2px;
      }
      .brand-bars {
        display: flex;
        gap: 5px;
        margin-top: 6px;
      }
      .brand-bars span {
        height: 4px;
        border-radius: 2px;
        background: ${PDF_COLORS.brand};
      }
      .brand-bars .b1 { width: 36px; }
      .brand-bars .b2 { width: 26px; opacity: 0.65; }
      .brand-bars .b3 { width: 18px; opacity: 0.35; }
      
      .header-right {
        text-align: right;
      }
      .invoice-title {
        font-size: 36px;
        font-weight: 300;
        color: ${PDF_COLORS.text};
        letter-spacing: 0.08em;
        margin-bottom: 8px;
      }
      .company-details {
        font-size: 10px;
        color: ${PDF_COLORS.textMuted};
        line-height: 1.6;
        max-width: 220px;
        margin-left: auto;
      }
      
      /* Main content */
      .content {
        padding: 28px 36px;
      }
      
      /* Invoice To & Details Row */
      .info-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 28px;
        gap: 40px;
      }
      .invoice-to {
        flex: 1;
      }
      .invoice-to h3 {
        font-size: 11px;
        font-weight: 600;
        color: ${PDF_COLORS.brand};
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 10px;
      }
      .customer-name {
        font-size: 18px;
        font-weight: 600;
        color: ${PDF_COLORS.text};
        margin-bottom: 4px;
      }
      .customer-details {
        font-size: 12px;
        color: ${PDF_COLORS.textMuted};
        line-height: 1.6;
      }
      
      .invoice-meta {
        text-align: right;
      }
      .meta-row {
        display: flex;
        justify-content: flex-end;
        gap: 16px;
        margin-bottom: 6px;
        font-size: 12px;
      }
      .meta-row .label {
        color: ${PDF_COLORS.textMuted};
      }
      .meta-row .value {
        font-weight: 600;
        color: ${PDF_COLORS.text};
        min-width: 100px;
        text-align: right;
      }
      .total-due-box {
        background: ${PDF_COLORS.brand};
        color: #fff;
        padding: 10px 20px;
        border-radius: 6px;
        margin-top: 12px;
        display: inline-flex;
        gap: 16px;
        align-items: center;
      }
      .total-due-box .label {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        opacity: 0.9;
      }
      .total-due-box .amount {
        font-size: 20px;
        font-weight: 700;
      }
      
      /* Items Table */
      .items-section {
        margin-bottom: 24px;
      }
      .items-table {
        width: 100%;
        border-collapse: collapse;
      }
      .items-table thead tr {
        background: ${PDF_COLORS.brand};
        color: #fff;
      }
      .items-table th {
        padding: 12px 16px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        text-align: left;
      }
      .items-table th:nth-child(3),
      .items-table th:nth-child(4) {
        text-align: right;
      }
      .items-table td {
        padding: 14px 16px;
        border-bottom: 1px solid ${PDF_COLORS.border};
        font-size: 12px;
        vertical-align: top;
      }
      .items-table td:nth-child(3),
      .items-table td:nth-child(4) {
        text-align: right;
      }
      .items-table tbody tr:nth-child(even) {
        background: ${PDF_COLORS.background};
      }
      .item-desc {
        font-weight: 500;
        color: ${PDF_COLORS.text};
      }
      
      /* Summary Section */
      .summary-row {
        display: flex;
        justify-content: space-between;
        gap: 40px;
        margin-bottom: 24px;
      }
      .payment-section {
        flex: 1;
      }
      .payment-section h4 {
        font-size: 11px;
        font-weight: 600;
        color: ${PDF_COLORS.brand};
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 12px;
      }
      .qr-container {
        display: flex;
        align-items: flex-start;
        gap: 20px;
      }
      .qr-code {
        width: 100px;
        height: 100px;
        border: 1px solid ${PDF_COLORS.border};
        border-radius: 8px;
        padding: 6px;
        background: #fff;
      }
      .qr-code img {
        width: 100%;
        height: 100%;
      }
      .payment-info {
        font-size: 11px;
        color: ${PDF_COLORS.textMuted};
        line-height: 1.7;
      }
      .payment-info strong {
        color: ${PDF_COLORS.text};
      }
      
      .totals-section {
        width: 260px;
      }
      .totals-table {
        width: 100%;
      }
      .totals-table tr td {
        padding: 8px 0;
        font-size: 12px;
      }
      .totals-table tr td:first-child {
        color: ${PDF_COLORS.textMuted};
      }
      .totals-table tr td:last-child {
        text-align: right;
        font-weight: 500;
      }
      .totals-table .total-row {
        background: ${PDF_COLORS.brand};
        color: #fff;
      }
      .totals-table .total-row td {
        padding: 12px 14px;
        font-size: 14px;
        font-weight: 700;
      }
      
      /* Footer */
      .footer {
        padding: 20px 36px;
        border-top: 1px solid ${PDF_COLORS.border};
        background: ${PDF_COLORS.background};
      }
      .footer-content {
        display: flex;
        justify-content: space-between;
        gap: 40px;
      }
      .bank-info, .terms-info {
        flex: 1;
      }
      .bank-info h4, .terms-info h4 {
        font-size: 10px;
        font-weight: 600;
        color: ${PDF_COLORS.brand};
        text-transform: uppercase;
        letter-spacing: 0.1em;
        margin-bottom: 10px;
      }
      .bank-info p, .terms-info p {
        font-size: 10px;
        color: ${PDF_COLORS.textMuted};
        line-height: 1.7;
        margin: 0;
      }
      .bank-info strong {
        color: ${PDF_COLORS.text};
      }
      .terms-info ol {
        font-size: 9px;
        color: ${PDF_COLORS.textMuted};
        margin: 0;
        padding-left: 14px;
        line-height: 1.6;
      }
      
      /* Signature & Thank You */
      .signature-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        padding: 24px 36px 20px;
      }
      .signature-box {
        text-align: left;
      }
      .signature-box .for-text {
        font-size: 11px;
        color: ${PDF_COLORS.textMuted};
        margin-bottom: 36px;
      }
      .signature-box .line {
        width: 150px;
        border-top: 1px solid ${PDF_COLORS.text};
        padding-top: 6px;
        font-size: 10px;
        color: ${PDF_COLORS.textMuted};
      }
      .thank-you {
        text-align: right;
      }
      .thank-you h3 {
        font-size: 16px;
        font-weight: 700;
        color: ${PDF_COLORS.brand};
        margin-bottom: 4px;
      }
      .thank-you p {
        font-size: 10px;
        color: ${PDF_COLORS.textMuted};
      }
      
      /* Status Badge */
      .status-badge {
        display: inline-block;
        padding: 4px 14px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.05em;
      }
    </style>
  </head>
  <body>
    <div class="page">
      <!-- Header -->
      <div class="header">
        <div class="header-content">
          <div class="brand">
            <div class="brand-icon">${logoSvg}</div>
            <div class="brand-text">
              <h1>TAPAN</h1>
              <div class="tagline">Associate Cargo</div>
              <div class="brand-bars">
                <span class="b1"></span>
                <span class="b2"></span>
                <span class="b3"></span>
              </div>
            </div>
          </div>
          <div class="header-right">
            <div class="invoice-title">INVOICE</div>
            <div class="company-details">
              ${companyProfile.addressLines.join("<br>")}
              <br>Tel: ${companyProfile.phonePrimary}
              <br>Email: ${companyProfile.email}
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <div class="info-row">
          <div class="invoice-to">
            <h3>Invoice To</h3>
            <div class="customer-name">${customerName}</div>
            <div class="customer-details">
              ${customerCity ? customerCity + "<br>" : ""}
              ${customerPhone}
            </div>
          </div>
          
          <div class="invoice-meta">
            <div class="meta-row">
              <span class="label">Invoice No</span>
              <span class="value">${ref}</span>
            </div>
            <div class="meta-row">
              <span class="label">Date</span>
              <span class="value">${invoiceDate || "—"}</span>
            </div>
            <div class="meta-row">
              <span class="label">Due Date</span>
              <span class="value">${dueDate || "—"}</span>
            </div>
            <div class="meta-row">
              <span class="label">Status</span>
              <span class="value">
                <span class="status-badge" style="background:${statusStyle.bg}; color:${statusStyle.text};">${status}</span>
              </span>
            </div>
            <div class="total-due-box">
              <span class="label">Total Due</span>
              <span class="amount">${formatCurrency(amountDue)}</span>
            </div>
          </div>
        </div>
        
        <!-- Items Table -->
        <div class="items-section">
          <table class="items-table">
            <thead>
              <tr>
                <th style="width:60px;">Item</th>
                <th>Description</th>
                <th style="width:100px;">Weight</th>
                <th style="width:120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${lineItems.length > 0 
                ? lineItems.map((item, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td class="item-desc">${item.description}</td>
                    <td>${item.weight > 0 ? item.weight.toFixed(2) + " kg" : "—"}</td>
                    <td style="font-weight:600;">${formatCurrency(item.amount)}</td>
                  </tr>
                `).join("")
                : `<tr><td colspan="4" style="text-align:center; color:${PDF_COLORS.textMuted}; padding:32px;">No line items</td></tr>`
              }
            </tbody>
          </table>
        </div>
        
        <!-- Summary Row -->
        <div class="summary-row">
          <div class="payment-section">
            <h4>Payment Method</h4>
            <div class="qr-container">
              <div class="qr-code">
                <img src="${qrDataUrl}" alt="Scan to pay" />
              </div>
              <div class="payment-info">
                <strong>Scan to Pay via UPI</strong><br><br>
                <strong>Bank:</strong> ${bankDetails.bankName}<br>
                <strong>A/C Name:</strong> ${bankDetails.accountName}<br>
                <strong>A/C No:</strong> ${bankDetails.accountNumber}<br>
                <strong>IFSC:</strong> ${bankDetails.ifsc}
              </div>
            </div>
          </div>
          <div class="totals-section">
            <table class="totals-table">
              <tr>
                <td>Subtotal</td>
                <td>${formatCurrency(subTotalValue)}</td>
              </tr>
              <tr>
                <td>Previous Balance</td>
                <td>${formatCurrency(previousBalance)}</td>
              </tr>
              <tr class="total-row">
                <td>TOTAL AMOUNT</td>
                <td>${formatCurrency(amountDue)}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="footer">
        <div class="footer-content">
          <div class="bank-info">
            <h4>Bank Details</h4>
            <p>
              <strong>Bank:</strong> ${bankDetails.bankName}<br>
              <strong>Branch:</strong> ${bankDetails.branch}<br>
              <strong>Account:</strong> ${bankDetails.accountNumber}<br>
              <strong>IFSC:</strong> ${bankDetails.ifsc}
            </p>
          </div>
          <div class="terms-info">
            <h4>Terms & Conditions</h4>
            <ol>
              <li>Consignee must declare contents and value before booking.</li>
              <li>Fragile items shipped at owner's risk unless special arrangement.</li>
              <li>Company not liable for perishable damage or leakage.</li>
              <li>Unclaimed items after 30 days disposed per company policy.</li>
            </ol>
          </div>
        </div>
      </div>
      
      <!-- Signature -->
      <div class="signature-row">
        <div class="signature-box">
          <div class="for-text">For ${companyProfile.name}</div>
          <div class="line">Authorised Signatory</div>
        </div>
        <div class="thank-you">
          <h3>THANKS FOR YOUR BUSINESS</h3>
          <p>Generated by TAPAN GO Cargo System</p>
        </div>
      </div>
    </div>
  </body>
</html>`;
}
