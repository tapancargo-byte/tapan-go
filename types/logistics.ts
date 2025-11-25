// Shared logistics domain types, aligned with Supabase schema

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Warehouse {
  id: string;
  name?: string | null;
  location?: string | null;
  capacity_used?: number | null; // percentage
  items_stored?: number | null;
  items_in_transit?: number | null;
  status?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShipmentRecord {
  id: string;
  shipment_ref: string;
  customer_id?: string | null;
  origin?: string | null;
  destination?: string | null;
  weight?: number | null;
  status?: string | null;
  progress?: number | null;
  created_at: string;
  updated_at: string;
}

export interface BarcodeRecord {
  id: string;
  barcode_number: string;
  shipment_id?: string | null;
  status?: string | null;
  last_scanned_at?: string | null;
  last_scanned_location?: string | null;
  created_at: string;
}

export interface PackageScanRecord {
  id: string;
  barcode_id: string;
  scanned_at: string;
  scanned_by?: string | null;
  location?: string | null;
  scan_type?: string | null;
  manifest_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ManifestRecord {
  id: string;
  manifest_ref: string;
  origin_hub?: string | null;
  destination?: string | null;
  airline_code?: string | null;
  manifest_date?: string | null;
  total_weight?: number | null;
  total_pieces?: number | null;
  status?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface ManifestItemRecord {
  id: string;
  manifest_id: string;
  shipment_id?: string | null;
  barcode_id?: string | null;
  weight?: number | null;
}

export interface InvoiceRecord {
  id: string;
  invoice_ref: string;
  customer_id?: string | null;
  amount?: number | null;
  status?: string | null; // paid/pending/overdue
  invoice_date?: string | null;
  due_date?: string | null;
  pdf_path?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date?: string | null;
  payment_mode?: string | null;
  reference?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface UserRecord {
  id: string;
  email?: string | null;
  name?: string | null;
  role?: string | null; // operator | manager | admin
  created_at: string;
}

// UI-level shipment shape used in the existing Shipments page
export interface UIShipment {
  shipmentId: string;
  customer: string;
  origin: string;
  destination: string;
  weight: number;
  status: string;
  progress: number;
}
