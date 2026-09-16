import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How The Heritage Edit collects, protects, and uses customer information.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Legal"
      title="Privacy Policy"
      intro="Your privacy matters to us. This policy explains the customer information we collect, why we use it, and the safeguards applied to payment and order data."
      sections={[
        { title: "Data collection", paragraphs: ["We collect customer details including name, email address, phone number, and shipping address solely to process orders and provide customer support."] },
        { title: "Data protection", paragraphs: ["Customer payment details are handled securely by regulated payment processors. We do not store full credit or debit card numbers."] },
        { title: "Data sharing", paragraphs: ["Personal information is never sold, traded, or rented to third parties. Information may be handled by trusted service providers only when necessary to process an order, deliver a package, or provide customer support."] },
        { title: "Privacy questions", paragraphs: ["Queries regarding personal data can be directed to officialtheheritageedit@gmail.com."] },
      ]}
    />
  );
}
