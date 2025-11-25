"use client";

import { useEffect, useMemo, useState } from "react";
import DashboardPageLayout from "@/components/dashboard/layout";
import EmailIcon from "@/components/icons/email";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UIPayment {
  id: string;
  invoiceId: string;
  invoiceRef: string;
  customerId: string | null;
  customerName: string;
  amount: number;
  mode: string;
  paymentDate: string;
  reference: string;
}

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd/MM/yyyy");
};

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [modeFilter, setModeFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [payments, setPayments] = useState<UIPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;

    async function loadUserRole() {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          if (!cancelled) {
            setUserRole(null);
            setRoleLoaded(true);
          }
          return;
        }

        const { data, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (cancelled) return;

        if (userError || !data) {
          setUserRole(null);
        } else {
          setUserRole((data.role as string | null) ?? null);
        }
        setRoleLoaded(true);
      } catch (err) {
        if (cancelled) return;
        console.warn("Failed to load user role for payments page", err);
        setUserRole(null);
        setRoleLoaded(true);
      }
    }

    loadUserRole();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadPayments() {
      setLoading(true);
      try {
        const { data: paymentRows, error: paymentsError } = await supabase
          .from("invoice_payments")
          .select(
            "id, invoice_id, amount, payment_date, payment_mode, reference, created_at"
          );

        if (paymentsError) {
          throw paymentsError;
        }

        const rows = (paymentRows ?? []) as {
          id: string;
          invoice_id: string | null;
          amount: number | null;
          payment_date: string | null;
          payment_mode: string | null;
          reference: string | null;
          created_at: string;
        }[];

        if (rows.length === 0) {
          if (!cancelled) {
            setPayments([]);
            setLoading(false);
          }
          return;
        }

        const invoiceIds = Array.from(
          new Set(
            rows
              .map((p) => p.invoice_id as string | null)
              .filter((id): id is string => !!id)
          )
        );

        const invoicesMap = new Map<
          string,
          { id: string; invoice_ref: string | null; customer_id: string | null }
        >();
        const customersMap = new Map<string, { id: string; name: string | null }>();

        if (invoiceIds.length > 0) {
          try {
            const { data: invoiceRows, error: invoicesError } = await supabase
              .from("invoices")
              .select("id, invoice_ref, customer_id")
              .in("id", invoiceIds);

            if (invoicesError) {
              console.warn(
                "Supabase invoices for payments error",
                invoicesError.message
              );
            } else {
              (invoiceRows ?? []).forEach((inv: any) => {
                invoicesMap.set(inv.id, {
                  id: inv.id as string,
                  invoice_ref: (inv.invoice_ref as string | null) ?? null,
                  customer_id: (inv.customer_id as string | null) ?? null,
                });
              });

              const customerIds = Array.from(
                new Set(
                  (invoiceRows ?? [])
                    .map((inv: any) => inv.customer_id as string | null)
                    .filter((id): id is string => !!id)
                )
              );

              if (customerIds.length > 0) {
                try {
                  const { data: customerRows, error: customersError } =
                    await supabase
                      .from("customers")
                      .select("id, name")
                      .in("id", customerIds);

                  if (customersError) {
                    console.warn(
                      "Supabase customers for payments error",
                      customersError.message
                    );
                  } else {
                    (customerRows ?? []).forEach((c: any) => {
                      customersMap.set(c.id, {
                        id: c.id as string,
                        name: (c.name as string | null) ?? null,
                      });
                    });
                  }
                } catch (customersErr) {
                  console.warn("Supabase customers for payments error", customersErr);
                }
              }
            }
          } catch (invoicesErr) {
            console.warn("Supabase invoices for payments error", invoicesErr);
          }
        }

        const normalized: UIPayment[] = rows.map((row) => {
          const invoice = row.invoice_id
            ? invoicesMap.get(row.invoice_id)
            : undefined;
          const customer = invoice?.customer_id
            ? customersMap.get(invoice.customer_id)
            : undefined;

          return {
            id: row.id,
            invoiceId: row.invoice_id ?? "",
            invoiceRef: invoice?.invoice_ref ?? row.invoice_id ?? row.id,
            customerId: invoice?.customer_id ?? null,
            customerName: customer?.name ?? "",
            amount: Number(row.amount ?? 0),
            mode: row.payment_mode ?? "",
            paymentDate: row.payment_date ?? row.created_at,
            reference: row.reference ?? "",
          };
        });

        if (!cancelled) {
          setPayments(normalized);
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load payments from Supabase", err);
        toast({
          title: "Could not load payments",
          description:
            (err as any)?.message ||
            "Something went wrong while loading the payments ledger.",
          variant: "destructive",
        });
        setPayments([]);
        setLoading(false);
      }
    }

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  const filteredPayments = useMemo(
    () =>
      payments.filter((p) => {
        const matchesSearch = (() => {
          if (!searchTerm.trim()) return true;
          const term = searchTerm.toLowerCase();
          return (
            p.invoiceRef.toLowerCase().includes(term) ||
            p.customerName.toLowerCase().includes(term) ||
            p.reference.toLowerCase().includes(term)
          );
        })();

        const matchesMode =
          modeFilter === "all" || p.mode === modeFilter || (!p.mode && modeFilter === "none");

        const matchesDate = (() => {
          if (!dateFrom && !dateTo) return true;
          const ts = new Date(p.paymentDate).getTime();
          if (Number.isNaN(ts)) return true;
          if (dateFrom) {
            const fromTs = new Date(dateFrom).getTime();
            if (!Number.isNaN(fromTs) && ts < fromTs) return false;
          }
          if (dateTo) {
            const toTs = new Date(dateTo).getTime();
            if (!Number.isNaN(toTs) && ts > toTs) return false;
          }
          return true;
        })();

        return matchesSearch && matchesMode && matchesDate;
      }),
    [payments, searchTerm, modeFilter, dateFrom, dateTo]
  );

  const totalPaid = useMemo(
    () =>
      filteredPayments.reduce(
        (sum, p) => sum + (Number.isFinite(p.amount) ? p.amount : 0),
        0
      ),
    [filteredPayments]
  );

  const handleExportPaymentsCsv = () => {
    if (!filteredPayments.length) {
      toast({
        title: "No payments to export",
        description:
          "Adjust filters so that at least one payment is visible before exporting.",
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Payment Date",
      "Invoice",
      "Customer",
      "Amount",
      "Mode",
      "Reference",
    ];

    const rows = filteredPayments.map((p) => [
      formatDate(p.paymentDate),
      p.invoiceRef,
      p.customerName,
      p.amount,
      p.mode,
      p.reference,
    ]);

    const escapeCell = (value: unknown) => {
      const s = String(value ?? "");
      if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `payments-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardPageLayout
      header={{
        title: "Payments",
        description: "View and reconcile invoice payments",
        icon: EmailIcon,
      }}
    >
      <div className="flex flex-col gap-6">
        <div className="flex gap-4 flex-col lg:flex-row items-end">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Search by invoice, customer, or reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input text-foreground"
            />
          </div>

          <div className="w-full sm:w-[180px]">
            <label className="text-sm font-medium mb-2 block">Mode</label>
            <Select
              value={modeFilter}
              onValueChange={(value) => setModeFilter(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modes</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="none">Not set</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">From</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">To</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>

        <Card className="p-4 border-pop flex flex-col gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payments in view</span>
            <span className="font-medium">
              {filteredPayments.length.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total amount</span>
            <span className="font-semibold">
              ₹{totalPaid.toLocaleString("en-IN")}
            </span>
          </div>
          <div className="flex justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportPaymentsCsv}
            >
              Export CSV
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden border-pop">
          <table className="w-full text-sm">
            <thead className="bg-accent/50 border-b border-pop">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Date</th>
                <th className="px-6 py-3 text-left font-semibold">Invoice</th>
                <th className="px-6 py-3 text-left font-semibold">Customer</th>
                <th className="px-6 py-3 text-left font-semibold">Amount</th>
                <th className="px-6 py-3 text-left font-semibold">Mode</th>
                <th className="px-6 py-3 text-left font-semibold">Reference</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-muted-foreground">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-muted-foreground">
                    No payments found
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-pop last:border-b-0 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-6 py-3">
                      {formatDate(p.paymentDate)}
                    </td>
                    <td className="px-6 py-3 font-mono text-primary">
                      {p.invoiceRef}
                    </td>
                    <td className="px-6 py-3">
                      {p.customerName || ""}
                    </td>
                    <td className="px-6 py-3 font-semibold">
                      ₹{p.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-3">
                      {p.mode ? (
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {p.mode.replace("_", " ").toUpperCase()}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-xs text-muted-foreground">
                      {p.reference || ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </Card>

        {roleLoaded && userRole && userRole !== "admin" && userRole !== "manager" && (
          <Card className="p-4 border-pop text-xs text-muted-foreground">
            You have read-only access to the payments ledger.
          </Card>
        )}
      </div>
    </DashboardPageLayout>
  );
}
