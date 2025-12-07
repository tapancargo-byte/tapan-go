export interface UICustomer {
  dbId: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  shipments: number;
  totalRevenue: number;
  city: string;
  joinDate: string;
  outstandingAmount: number;
  lastInvoiceDate: string;
}
