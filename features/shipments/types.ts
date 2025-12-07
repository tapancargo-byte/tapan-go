export interface UIShipment {
  dbId: string;
  shipmentId: string;
  customerId: string | null;
  customer: string;
  origin: string;
  destination: string;
  weight: number;
  status: string;
  progress: number;
}
