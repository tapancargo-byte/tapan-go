"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { companyProfile, bankDetails } from "@/lib/companyConfig";
import { Loader2, X, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

interface InvoicePreviewProps {
  invoiceId: string;
  onClose: () => void;
}

interface InvoiceData {
  id: string;
  invoice_ref: string | null;
  amount: number;
  status: string;
  invoice_date: string | null;
  due_date: string | null;
  customer: {
    name: string;
    phone: string | null;
    city: string | null;
  } | null;
  lineItems: {
    description: string;
    weight: number;
    amount: number;
  }[];
  previousBalance: number;
  totalDue: number;
}

// Color palette matching the PDF
const COLORS = {
  brand: "#3b82f6",
  brandLight: "#dbeafe",
  text: "#1a1a2e",
  textMuted: "#64748b",
  border: "#e2e8f0",
  background: "#f8fafc",
  success: "#10b981",
};

export function InvoicePreview({ invoiceId, onClose }: InvoicePreviewProps) {
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadInvoice() {
      try {
        // Fetch invoice
        const { data: inv, error: invError } = await supabase
          .from("invoices")
          .select("id, invoice_ref, customer_id, amount, status, invoice_date, due_date")
          .eq("id", invoiceId)
          .single();

        if (invError || !inv) {
          throw new Error("Invoice not found");
        }

        // Fetch customer
        let customer = null;
        if (inv.customer_id) {
          const { data: cust } = await supabase
            .from("customers")
            .select("name, phone, city")
            .eq("id", inv.customer_id)
            .single();
          customer = cust;
        }

        // Fetch invoice items
        const { data: items } = await supabase
          .from("invoice_items")
          .select("shipment_id, amount")
          .eq("invoice_id", invoiceId);

        let lineItems: InvoiceData["lineItems"] = [];
        let itemsSubTotal = 0;

        if (items && items.length > 0) {
          const shipmentIds = items
            .map((i) => i.shipment_id)
            .filter((id): id is string => !!id);

          let shipmentsById: Record<string, any> = {};
          if (shipmentIds.length > 0) {
            const { data: shipments } = await supabase
              .from("shipments")
              .select("id, shipment_ref, origin, destination, weight")
              .in("id", shipmentIds);

            if (shipments) {
              shipments.forEach((s) => {
                shipmentsById[s.id] = s;
              });
            }
          }

          lineItems = items.map((item, index) => {
            const shipment = item.shipment_id ? shipmentsById[item.shipment_id] : null;
            const weight = Number(shipment?.weight ?? 0);
            const amount = Number(item.amount ?? 0);
            itemsSubTotal += amount;

            const parts: string[] = [];
            if (shipment?.shipment_ref) parts.push(shipment.shipment_ref);
            if (shipment?.origin || shipment?.destination) {
              parts.push(`${shipment.origin ?? ""} → ${shipment.destination ?? ""}`);
            }

            return {
              description: parts.join(" | ") || `Shipment ${index + 1}`,
              weight,
              amount,
            };
          });
        }

        if (lineItems.length === 0 && inv.amount > 0) {
          itemsSubTotal = inv.amount;
          lineItems = [{ description: "Logistics services", weight: 0, amount: inv.amount }];
        }

        // Calculate previous balance
        const { data: allInvoices } = await supabase
          .from("invoices")
          .select("id, amount, status, invoice_date")
          .eq("customer_id", inv.customer_id);

        let previousBalance = 0;
        let totalOutstanding = 0;

        if (allInvoices) {
          const isUnpaid = (status: string) => 
            status?.toLowerCase() === "pending" || status?.toLowerCase() === "overdue";

          totalOutstanding = allInvoices.reduce((sum, row) => {
            if (!isUnpaid(row.status)) return sum;
            return sum + Number(row.amount ?? 0);
          }, 0);

          if (inv.invoice_date) {
            previousBalance = allInvoices.reduce((sum, row) => {
              if (row.id === inv.id) return sum;
              if (!isUnpaid(row.status)) return sum;
              if (!row.invoice_date || row.invoice_date >= inv.invoice_date!) return sum;
              return sum + Number(row.amount ?? 0);
            }, 0);
          }
        }

        const totalDue = totalOutstanding > 0 ? totalOutstanding : inv.amount;

        // Generate QR code
        const upiUri = `upi://pay?pa=${encodeURIComponent(
          process.env.NEXT_PUBLIC_UPI_VPA || "tapan@upi"
        )}&pn=${encodeURIComponent(
          process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "TAPAN CARGO SERVICE"
        )}&am=${totalDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(
          `Invoice ${inv.invoice_ref ?? inv.id}`
        )}`;

        const qr = await QRCode.toDataURL(upiUri);
        setQrDataUrl(qr);

        setInvoice({
          id: inv.id,
          invoice_ref: inv.invoice_ref,
          amount: inv.amount,
          status: inv.status,
          invoice_date: inv.invoice_date,
          due_date: inv.due_date,
          customer,
          lineItems,
          previousBalance,
          totalDue,
        });
      } catch (error) {
        console.error("Failed to load invoice", error);
        toast({
          title: "Error",
          description: "Failed to load invoice details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    loadInvoice();
  }, [invoiceId, toast]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Always regenerate PDF to ensure latest design is used
      const genRes = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      const genJson = await genRes.json();

      if (!genRes.ok || !genJson?.success) {
        throw new Error(genJson?.error || "Failed to generate PDF");
      }

      const pdfPath: string | undefined =
        typeof genJson.pdfPath === "string" ? genJson.pdfPath : undefined;

      const params = new URLSearchParams({
        invoiceId,
        t: String(Date.now()),
      });

      if (pdfPath) {
        params.append("path", pdfPath);
      }

      // Download the freshly generated PDF with cache busting and explicit path
      const downloadRes = await fetch(`/api/invoices/download?${params.toString()}`);
      if (!downloadRes.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await downloadRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Invoice-${invoice?.invoice_ref ?? invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Downloaded",
        description: "Invoice PDF downloaded successfully",
      });
    } catch (error) {
      console.error("Download failed", error);
      toast({
        title: "Download failed",
        description: "Could not download the invoice PDF",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return "₹" + amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return { bg: COLORS.success, text: "#fff" };
      case "OVERDUE":
        return { bg: "#dc2626", text: "#fff" };
      default:
        return { bg: COLORS.brand, text: "#fff" };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-lg p-8 flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span>Loading invoice...</span>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-destructive mb-4">Invoice not found</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  const statusStyle = getStatusStyle(invoice.status);
  const subTotal = invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-auto">
      {/* Actions bar */}
      <div className="fixed top-4 right-4 z-[60] print:hidden">
        <div className="flex items-center gap-2 rounded-full bg-slate-900/80 text-white shadow-lg ring-1 ring-black/40 backdrop-blur">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrint}
            className="h-9 px-3 py-1.5 bg-transparent hover:bg-slate-800 text-white"
          >
            <Printer className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            className="h-9 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Download PDF
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 rounded-full bg-transparent hover:bg-slate-800 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Invoice */}
      <div 
        className="bg-white shadow-2xl w-full max-w-[210mm] print:max-w-none print:shadow-none"
        style={{ minHeight: "297mm" }}
      >
        {/* Header */}
        <div 
          className="px-9 py-7 border-b-[3px]"
          style={{ borderColor: COLORS.brand }}
        >
          <div className="flex justify-between items-start">
            {/* Brand */}
            <div className="flex items-center gap-3.5">
              <div 
                className="w-[52px] h-[52px] rounded-[10px] flex items-center justify-center border"
                style={{ background: COLORS.brandLight, borderColor: COLORS.border }}
              >
                <svg viewBox="0 0 56 56" className="w-11 h-11">
                  <path
                    d="M28 8L48 18V38L28 48L8 38V18L28 8Z"
                    stroke={COLORS.brand}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M28 8V28M28 28L48 18M28 28L8 18"
                    stroke={COLORS.brand}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path d="M8 38L18 43.5" stroke={COLORS.brand} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M48 38L38 43.5" stroke={COLORS.brand} strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h1 className="text-[26px] font-extrabold tracking-[0.02em]" style={{ color: COLORS.text }}>
                  TAPAN
                </h1>
                <div 
                  className="text-[11px] font-semibold tracking-[0.12em] uppercase mt-0.5"
                  style={{ color: COLORS.brand }}
                >
                  Associate Cargo
                </div>
                <div className="flex gap-[5px] mt-1.5">
                  <span className="h-1 w-9 rounded-sm" style={{ background: COLORS.brand }} />
                  <span className="h-1 w-[26px] rounded-sm opacity-65" style={{ background: COLORS.brand }} />
                  <span className="h-1 w-[18px] rounded-sm opacity-35" style={{ background: COLORS.brand }} />
                </div>
              </div>
            </div>

            {/* Invoice title */}
            <div className="text-right">
              <div 
                className="text-4xl font-light tracking-[0.08em] mb-2"
                style={{ color: COLORS.text }}
              >
                INVOICE
              </div>
              <div 
                className="text-[10px] leading-[1.6] max-w-[220px] ml-auto"
                style={{ color: COLORS.textMuted }}
              >
                {companyProfile.addressLines.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
                <div className="mt-1">Tel: {companyProfile.phonePrimary}</div>
                <div>Email: {companyProfile.email}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-9 py-7">
          {/* Invoice To & Meta */}
          <div className="flex justify-between gap-10 mb-7">
            <div className="flex-1">
              <h3 
                className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-2.5"
                style={{ color: COLORS.brand }}
              >
                Invoice To
              </h3>
              <div className="text-lg font-semibold" style={{ color: COLORS.text }}>
                {invoice.customer?.name || "—"}
              </div>
              <div className="text-xs leading-[1.6]" style={{ color: COLORS.textMuted }}>
                {invoice.customer?.city && <div>{invoice.customer.city}</div>}
                {invoice.customer?.phone && <div>{invoice.customer.phone}</div>}
              </div>
            </div>

            <div className="text-right">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-end gap-4">
                  <span style={{ color: COLORS.textMuted }}>Invoice No</span>
                  <span className="font-semibold min-w-[100px] text-right" style={{ color: COLORS.text }}>
                    {invoice.invoice_ref || invoice.id}
                  </span>
                </div>
                <div className="flex justify-end gap-4">
                  <span style={{ color: COLORS.textMuted }}>Invoice Date</span>
                  <span className="font-semibold min-w-[100px] text-right" style={{ color: COLORS.text }}>
                    {formatDate(invoice.invoice_date)}
                  </span>
                </div>
                <div className="flex justify-end gap-4">
                  <span style={{ color: COLORS.textMuted }}>Due Date</span>
                  <span className="font-semibold min-w-[100px] text-right" style={{ color: COLORS.text }}>
                    {formatDate(invoice.due_date)}
                  </span>
                </div>
                <div className="flex justify-end gap-4">
                  <span style={{ color: COLORS.textMuted }}>Status</span>
                  <span className="min-w-[100px] text-right">
                    <span 
                      className="inline-block px-3.5 py-1 rounded text-[11px] font-bold tracking-[0.05em]"
                      style={{ background: statusStyle.bg, color: statusStyle.text }}
                    >
                      {invoice.status?.toUpperCase() || "PENDING"}
                    </span>
                  </span>
                </div>
              </div>
              <div 
                className="inline-flex items-center gap-4 mt-3 px-5 py-2.5 rounded-md"
                style={{ background: COLORS.brand }}
              >
                <span className="text-[11px] uppercase tracking-[0.05em] text-white/90">Total Due</span>
                <span className="text-xl font-bold text-white">{formatCurrency(invoice.totalDue)}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: COLORS.brand }}>
                  <th className="py-3 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-white w-[60px]">
                    Item
                  </th>
                  <th className="py-3 px-4 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-white">
                    Description
                  </th>
                  <th className="py-3 px-4 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-white w-[100px]">
                    Weight
                  </th>
                  <th className="py-3 px-4 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-white w-[120px]">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineItems.map((item, index) => (
                  <tr 
                    key={index}
                    className={index % 2 === 1 ? "" : ""}
                    style={{ background: index % 2 === 1 ? COLORS.background : "transparent" }}
                  >
                    <td 
                      className="py-3.5 px-4 text-xs"
                      style={{ borderBottom: `1px solid ${COLORS.border}` }}
                    >
                      {index + 1}
                    </td>
                    <td 
                      className="py-3.5 px-4 text-xs font-medium"
                      style={{ borderBottom: `1px solid ${COLORS.border}`, color: COLORS.text }}
                    >
                      {item.description}
                    </td>
                    <td 
                      className="py-3.5 px-4 text-xs text-right"
                      style={{ borderBottom: `1px solid ${COLORS.border}` }}
                    >
                      {item.weight > 0 ? `${item.weight.toFixed(2)} kg` : "—"}
                    </td>
                    <td 
                      className="py-3.5 px-4 text-xs text-right font-semibold"
                      style={{ borderBottom: `1px solid ${COLORS.border}` }}
                    >
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Row */}
          <div className="flex justify-between gap-10 mb-6">
            {/* Payment Method */}
            <div className="flex-1">
              <h4 
                className="text-[11px] font-semibold uppercase tracking-[0.1em] mb-3"
                style={{ color: COLORS.brand }}
              >
                Payment Method
              </h4>
              <div className="flex items-start gap-5">
                <div 
                  className="w-[100px] h-[100px] rounded-lg p-1.5 border"
                  style={{ borderColor: COLORS.border, background: "#fff" }}
                >
                  {qrDataUrl && (
                    <img src={qrDataUrl} alt="Scan to pay" className="w-full h-full" />
                  )}
                </div>
                <div className="text-[11px] leading-[1.7]" style={{ color: COLORS.textMuted }}>
                  <div className="font-semibold mb-2" style={{ color: COLORS.text }}>Scan to Pay via UPI</div>
                  <div><strong style={{ color: COLORS.text }}>Bank:</strong> {bankDetails.bankName}</div>
                  <div><strong style={{ color: COLORS.text }}>A/C Name:</strong> {bankDetails.accountName}</div>
                  <div><strong style={{ color: COLORS.text }}>A/C No:</strong> {bankDetails.accountNumber}</div>
                  <div><strong style={{ color: COLORS.text }}>IFSC:</strong> {bankDetails.ifsc}</div>
                </div>
              </div>
            </div>

            {/* Totals */}
            <div className="w-[260px]">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2 text-xs" style={{ color: COLORS.textMuted }}>Subtotal</td>
                    <td className="py-2 text-xs text-right font-medium">{formatCurrency(subTotal)}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-xs" style={{ color: COLORS.textMuted }}>Previous Balance</td>
                    <td className="py-2 text-xs text-right font-medium">{formatCurrency(invoice.previousBalance)}</td>
                  </tr>
                  <tr style={{ background: COLORS.brand }}>
                    <td className="py-3 px-3.5 text-sm font-bold text-white">TOTAL AMOUNT</td>
                    <td className="py-3 px-3.5 text-sm font-bold text-white text-right">
                      {formatCurrency(invoice.totalDue)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="px-9 py-5 border-t"
          style={{ borderColor: COLORS.border, background: COLORS.background }}
        >
          <div className="flex justify-between gap-10">
            <div className="flex-1">
              <h4 
                className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2.5"
                style={{ color: COLORS.brand }}
              >
                Bank Details
              </h4>
              <div className="text-[10px] leading-[1.7]" style={{ color: COLORS.textMuted }}>
                <div><strong style={{ color: COLORS.text }}>Bank:</strong> {bankDetails.bankName}</div>
                <div><strong style={{ color: COLORS.text }}>Branch:</strong> {bankDetails.branch}</div>
                <div><strong style={{ color: COLORS.text }}>Account:</strong> {bankDetails.accountNumber}</div>
                <div><strong style={{ color: COLORS.text }}>IFSC:</strong> {bankDetails.ifsc}</div>
              </div>
            </div>
            <div className="flex-1">
              <h4 
                className="text-[10px] font-semibold uppercase tracking-[0.1em] mb-2.5"
                style={{ color: COLORS.brand }}
              >
                Terms & Conditions
              </h4>
              <ol className="text-[9px] leading-[1.6] pl-3.5 m-0" style={{ color: COLORS.textMuted }}>
                <li>Consignee must declare contents and value before booking.</li>
                <li>Fragile items shipped at owner's risk unless special arrangement.</li>
                <li>Company not liable for perishable damage or leakage.</li>
                <li>Unclaimed items after 30 days disposed per company policy.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div className="px-9 py-6 flex justify-between items-end">
          <div>
            <div className="text-[11px] mb-9" style={{ color: COLORS.textMuted }}>
              For {companyProfile.name}
            </div>
            <div 
              className="w-[150px] border-t pt-1.5 text-[10px]"
              style={{ borderColor: COLORS.text, color: COLORS.textMuted }}
            >
              Authorised Signatory
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-base font-bold mb-1" style={{ color: COLORS.brand }}>
              THANKS FOR YOUR BUSINESS
            </h3>
            <p className="text-[10px]" style={{ color: COLORS.textMuted }}>
              Generated by TAPAN GO Cargo System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
