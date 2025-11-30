import type { Metadata } from "next";
import { CustomerSupportClient } from "@/components/support/customer-support-client";

export const metadata: Metadata = {
  title: "Customer support - Tapan Go",
  description:
    "Raise a shipment issue or question with the Tapan Go support team using your email.",
};

export default function CustomerSupportPage() {
  return <CustomerSupportClient />;
}
