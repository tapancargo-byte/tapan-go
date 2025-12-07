export type InvoiceStatus = "paid" | "pending" | "overdue" | string;

export interface UIInvoice {
  dbId: string;
  id: string;
  customerId: string | null;
  customerName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  shipments: number;
}

export interface ARBucket {
  invoiceCount: number;
  invoiceAmount: number;
  outstanding: number;
}

export interface ARSummary {
  totalInvoiced: number;
  totalPaid: number;
  totalOutstanding: number;
  buckets: {
    paid: ARBucket;
    pending: ARBucket;
    overdue: ARBucket;
    partially_paid: ARBucket;
    other: ARBucket;
  };
}
