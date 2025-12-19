export type InvoiceStatus = "paid" | "pending" | "overdue" | string;

export type PaymentMode =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "cheque"
  | "to_pay"
  | "on_account";

export type StronglyTypedPaymentMode =
  | "cash"
  | "upi"
  | "bank_transfer"
  | "cheque"
  | "to_pay"
  | "on_account";

export interface UIInvoice {
  dbId: string;
  id: string;
  customerId: string | null;
  customerName: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  shipments: number;
  consignorId?: string | null;
  consigneeId?: string | null;
  consignorName?: string;
  consigneeName?: string;
  origin?: string | null;
  destination?: string | null;
  pieces?: number | null;
  chargedWeight?: number | null;
  declaredValue?: number | null;
  paymentMode?: PaymentMode | null;
  freightAmount?: number | null;
  pickupCharge?: number | null;
  deliveryCharge?: number | null;
  docketCharge?: number | null;
  otherCharge?: number | null;
  advancePaid?: number | null;
  balanceDue?: number | null;
  notes?: string | null;
}

export interface ARBucket {
  invoiceCount: number;
  invoiceAmount: number;
  outstanding: number;
}

export interface AgingBucket {
  count: number;
  amount: number;
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
  aging?: {
    current: AgingBucket;
    days1to30: AgingBucket;
    days31to60: AgingBucket;
    days61plus: AgingBucket;
  };
}
