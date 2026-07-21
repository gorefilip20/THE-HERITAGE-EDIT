import type { ShippingOption, TaxDutyEstimate } from "@/types";

const SHIPPING_OPTIONS: Array<{
  id: string;
  service: string;
  carrier: string;
  days: number;
  priceCents: number;
  freeAboveCents: number | null;
  lagosOnly?: boolean;
}> = [
  {
    id: "dhl-express",
    service: "DHL Express Worldwide",
    carrier: "DHL",
    days: 3,
    priceCents: 2_500_000,
    freeAboveCents: 50_000_000,
  },
  {
    id: "standard-courier",
    service: "Standard Courier",
    carrier: "Courier",
    days: 7,
    priceCents: 800_000,
    freeAboveCents: null,
  },
  {
    id: "lagos-same-day",
    service: "Lagos Same-Day Delivery",
    carrier: "Local",
    days: 0,
    priceCents: 500_000,
    freeAboveCents: null,
    lagosOnly: true,
  },
];

export function getShippingOptions(
  country: string,
  subtotalCents: number,
): ShippingOption[] {
  return SHIPPING_OPTIONS
    .filter((opt) => {
      if (opt.lagosOnly && country !== "NG") return false;
      return true;
    })
    .map((opt) => {
      let priceCents = opt.priceCents;
      if (opt.freeAboveCents && subtotalCents >= opt.freeAboveCents) {
        priceCents = 0;
      }

      return {
        id: opt.id,
        carrier: opt.carrier,
        service: opt.service,
        estimatedDays: opt.days,
        priceCents,
        currency: "NGN",
      };
    });
}

export function calculateTaxAndDuty(
  subtotalCents: number,
  country: string,
  _state?: string,
): TaxDutyEstimate {
  if (country === "NG") {
    return {
      taxCents: Math.round(subtotalCents * 0.075),
      dutyCents: 0,
      currency: "NGN",
      country,
    };
  }

  return {
    taxCents: 0,
    dutyCents: 0,
    currency: "NGN",
    country,
  };
}
