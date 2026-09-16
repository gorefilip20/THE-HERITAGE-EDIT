import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy",
  description: "Shipping and delivery timelines for The Heritage Edit orders in Nigeria and internationally.",
};

export default function ShippingDeliveryPage() {
  return (
    <PolicyPage
      eyebrow="Client services"
      title="Shipping & Delivery"
      intro="We prepare every order with care and work with trusted courier partners to deliver your Heritage Edit pieces in Nigeria and around the world."
      sections={[
        { title: "Order processing", paragraphs: ["Orders are processed within 1–2 business days. Processing begins after payment has been successfully confirmed."] },
        { title: "Domestic shipping — Nigeria", items: ["Delivery within Lagos takes approximately 1–3 business days.", "Delivery outside Lagos, across Nigeria, takes approximately 3–5 business days."] },
        { title: "International shipping", paragraphs: ["International delivery timelines range from 7–14 business days depending on the destination and courier processing. Customs or local import procedures may affect the final delivery time."] },
        { title: "Tracking", paragraphs: ["Tracking details will be emailed to you as soon as your order is dispatched. Please check your inbox and spam folder for the dispatch notification."] },
      ]}
    />
  );
}
