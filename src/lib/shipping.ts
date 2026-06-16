import type { ShippingOption, TaxDutyEstimate } from "@/types";
import { calculateDutyRate, calculateTaxRate } from "./utils";

const SHIPPING_TIERS: Record<
  string,
  Array<{ service: string; carrier: string; days: number; baseCents: number }>
> = {
  US: [
    { service: "Standard Ground", carrier: "FedEx", days: 5, baseCents: 0 },
    { service: "Express 2-Day", carrier: "FedEx", days: 2, baseCents: 2500 },
    { service: "Priority Overnight", carrier: "FedEx", days: 1, baseCents: 4500 },
  ],
  GB: [
    { service: "Standard International", carrier: "DHL", days: 7, baseCents: 3500 },
    { service: "Express International", carrier: "DHL", days: 3, baseCents: 6500 },
  ],
  EU: [
    { service: "Standard International", carrier: "DHL", days: 7, baseCents: 3000 },
    { service: "Express International", carrier: "DHL", days: 3, baseCents: 5500 },
  ],
  APAC: [
    { service: "Standard International", carrier: "DHL", days: 10, baseCents: 4500 },
    { service: "Express International", carrier: "DHL", days: 4, baseCents: 7500 },
  ],
  DEFAULT: [
    { service: "International Standard", carrier: "DHL", days: 12, baseCents: 5000 },
    { service: "International Express", carrier: "DHL", days: 5, baseCents: 8500 },
  ],
};

const EU_COUNTRIES = [
  "DE", "FR", "IT", "ES", "NL", "BE", "AT", "SE", "DK", "FI",
  "PT", "IE", "GR", "PL", "CZ", "RO", "HU", "HR", "BG", "SK",
  "LT", "LV", "EE", "SI", "CY", "LU", "MT",
];

const APAC_COUNTRIES = ["JP", "AU", "SG", "KR", "CN", "HK", "TW", "NZ", "TH", "MY"];

function getRegion(country: string): string {
  if (country === "US") return "US";
  if (country === "GB") return "GB";
  if (EU_COUNTRIES.includes(country)) return "EU";
  if (APAC_COUNTRIES.includes(country)) return "APAC";
  return "DEFAULT";
}

const FREE_SHIPPING_THRESHOLD_CENTS = 50000;

export function getShippingOptions(
  country: string,
  subtotalCents: number,
): ShippingOption[] {
  const region = getRegion(country);
  const tiers = SHIPPING_TIERS[region];

  return tiers.map((tier, idx) => {
    let priceCents = tier.baseCents;
    if (idx === 0 && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS) {
      priceCents = 0;
    }

    return {
      id: `${tier.carrier.toLowerCase()}-${tier.service.toLowerCase().replace(/\s+/g, "-")}`,
      carrier: tier.carrier,
      service: tier.service,
      estimatedDays: tier.days,
      priceCents,
      currency: "USD",
    };
  });
}

export function calculateTaxAndDuty(
  subtotalCents: number,
  country: string,
  state?: string,
): TaxDutyEstimate {
  const dutyRate = calculateDutyRate(country);
  const taxRate = calculateTaxRate(country, state);

  return {
    taxCents: Math.round(subtotalCents * taxRate),
    dutyCents: Math.round(subtotalCents * dutyRate),
    currency: "USD",
    country,
  };
}
