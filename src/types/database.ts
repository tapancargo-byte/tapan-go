export interface Customer {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    address?: string | null;
    created_at?: string;
}

export interface Invoice {
    id: string;
    invoiceDate?: string;
    invoiceRef?: string;
    shipperName?: string | null;
    shipperAddress?: string | null;
    shipperPhone?: string | null;
    consigneeName?: string | null;
    consigneeAddress?: string | null;
    consigneePhone?: string | null;
    customerId?: string | null;
    consignorId?: string | null;
    consigneeId?: string | null;
    origin?: string | null;
    destination?: string | null;
    pieces?: number | null;
    actualWeight?: number | null;
    chargedWeight?: number | null;
    rate?: number | null;
    transportMode?: "air" | "surface" | "express" | "train" | string;
    paymentMode?: string | null;
    freightAmount?: number | null;
    pickupCharge?: number | null;
    packingCharge?: number | null;
    docketCharge?: number | null;
    deliveryCharge?: number | null;
    insuranceCharge?: number | null;
    gstPercent?: number | null;
    gstAmount?: number | null;
    otherCharge?: number | null;
    advancePaid?: number | null;
    balanceDue?: number | null;
    notes?: string | null;
    remarks?: string | null;
    status: "pending" | "paid" | "overdue" | "partially_paid" | string;
    amount: number;
    dueDate?: string | null;
}

export interface ShipmentRate {
    id: string;
    origin: string;
    destination: string;
    transportMode: "air" | "surface" | "express" | "train" | string;
    ratePerKg: number;
    baseFee?: number | null;
    minWeight?: number | null;
    serviceType?: string | null;
}
