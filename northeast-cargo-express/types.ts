export interface TrackingEvent {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

export interface TrackingResult {
  awb: string;
  currentStatus: 'Delivered' | 'In Transit' | 'Out for Delivery' | 'Pending' | 'Exception';
  estimatedDelivery: string;
  origin: string;
  destination: string;
  history: TrackingEvent[];
}

export interface QuoteRequest {
  origin: string;
  destination: string;
  weight: string;
  type: string;
}

export interface QuoteResult {
  price: string;
  serviceType: string;
  estimatedTime: string;
  details: string;
}
