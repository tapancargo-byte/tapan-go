import { z } from "zod";

// --- Common Field Validations ---
const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Basic E.164 format

const common = {
  id: z.string().uuid(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(phoneRegex, "Invalid phone number format").optional().or(z.literal("")),
  nonNegativeNumber: z.coerce.number().min(0, "Value cannot be negative"),
  positiveNumber: z.coerce.number().positive("Value must be greater than 0"),
  dateString: z.string().datetime({ offset: true }),
};

// --- Domain Schemas ---

// 1. Customer Schema
export const customerSchema = z.object({
  name: common.name,
  email: common.email.optional().or(z.literal("")),
  phone: common.phone,
  city: z.string().optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

// 2. Rate Schema (with advanced fields for Phase 3)
export const rateSchema = z.object({
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  ratePerKg: common.positiveNumber,
  baseFee: common.nonNegativeNumber,
  minWeight: common.nonNegativeNumber.default(0),
  serviceType: z.enum(["standard", "express", "air", "surface"]).default("standard"),
});

export type RateFormValues = z.infer<typeof rateSchema>;

// 3. Shipment Schema
export const shipmentSchema = z.object({
  shipmentRef: z.string().min(3, "Shipment Ref is required"),
  customerId: z.string().min(1, "Customer is required"),
  origin: z.string().min(2, "Origin is required"),
  destination: z.string().min(2, "Destination is required"),
  weight: common.positiveNumber,
  pieces: z.coerce.number().int().positive().default(1),
  description: z.string().max(200).optional(),
  serviceType: z.enum(["standard", "express"]).default("standard"),
  declaredValue: common.nonNegativeNumber.optional(),
});

export type ShipmentFormValues = z.infer<typeof shipmentSchema>;

// 4. Invoice Schema
export const invoiceSchema = z.object({
  invoiceRef: z.string().min(3, "Invoice reference is required"),
  customerId: z.string().min(1, "Customer is required"),
  amount: common.positiveNumber,
  dueDate: z.string().optional().or(z.literal("")),
  status: z.enum(["pending", "paid", "overdue", "partially_paid"]).default("pending"),
  items: z.array(
    z.object({
      shipmentId: z.string().optional(),
      description: z.string().min(1),
      amount: common.positiveNumber,
      weight: common.nonNegativeNumber.optional(),
    })
  ).optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

// 5. Payment Schema (for Phase 3)
export const paymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: common.positiveNumber,
  paymentDate: z.string().default(() => new Date().toISOString()),
  paymentMode: z.enum(["cash", "bank_transfer", "upi", "cheque"]),
  reference: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
