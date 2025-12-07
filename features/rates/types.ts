import type { RateFormValues } from "@/lib/validations";

export interface UIRate {
  id: string;
  origin: string;
  destination: string;
  ratePerKg: number;
  baseFee: number;
  minWeight: number;
  serviceType: RateFormValues["serviceType"];
  createdAt: string;
}
