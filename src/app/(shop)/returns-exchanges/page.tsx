import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Returns & Exchanges Policy",
  description: "Returns and exchanges information for The Heritage Edit customers.",
};

export default function ReturnsExchangesPage() {
  return (
    <PolicyPage
      eyebrow="Client services"
      title="Returns & Exchanges"
      intro="We want every Heritage Edit purchase to feel right. If you need to request a return or exchange, please review the conditions below and contact our support team promptly."
      sections={[
        { title: "Return window", paragraphs: ["Customers may request a return or exchange within 7 days of receiving their package."] },
        { title: "Condition of returned items", items: ["Items must be unworn, unwashed, and unused.", "Items must be returned in their original packaging with all tags attached."] },
        { title: "How to initiate a return", paragraphs: ["Contact officialtheheritageedit@gmail.com with your order number to initiate a return or exchange. Our support team will provide the next steps."] },
        { title: "Non-returnable items", paragraphs: ["Final sale items, swimwear, and intimate apparel are non-returnable for hygiene reasons."] },
        { title: "Return shipping costs", paragraphs: ["Return shipping costs are covered by the customer unless the item delivered was defective or incorrect."] },
      ]}
    />
  );
}
