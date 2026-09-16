import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions governing purchases from The Heritage Edit.",
};

export default function TermsConditionsPage() {
  return (
    <PolicyPage
      eyebrow="Legal"
      title="Terms & Conditions"
      intro="These terms explain the basis on which The Heritage Edit presents products, accepts orders, processes payments, and protects its creative work."
      sections={[
        { title: "Business information", paragraphs: ["The Heritage Edit is operated under the registered business name THE-HERITAGE-EDIT BUSINESSES (RC / Reg No: 9670611, Nigeria)."] },
        { title: "Products and pricing", paragraphs: ["All products, descriptions, and pricing are subject to availability and may change without notice. All items listed on this website are owned and sold directly by the business."] },
        { title: "Payment and checkout", paragraphs: ["Payments are securely processed via integrated third-party payment gateways. An order is confirmed only after payment has been successfully authorised by the relevant payment processor."] },
        { title: "Intellectual property", paragraphs: ["All graphics, designs, logos, photography, written content, and other materials on this site are the property of The Heritage Edit and may not be copied, reproduced, or used without permission."] },
        { title: "Governing law", paragraphs: ["These terms are governed by the laws of the Federal Republic of Nigeria."] },
      ]}
    />
  );
}
