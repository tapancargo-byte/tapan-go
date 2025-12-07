export interface UIInvoiceAlert {
  id: string;
  customerName: string;
  amount: number;
  status: string;
  dueDate: string;
  daysOverdue: number;
}

export interface UIShipmentAlert {
  id: string;
  shipmentRef: string;
  customerName: string;
  status: string;
  createdAt: string;
  daysInState: number;
}

export interface UITicketAlert {
  id: string;
  subject: string;
  customerName: string;
  priority: string;
  status: string;
  createdAt: string;
}
