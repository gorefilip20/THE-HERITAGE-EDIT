export type DisplayCurrency = "NGN" | "USD" | "GBP" | "EUR" | "GHS" | "KES" | "ZAR" | "CAD" | "AUD" | "JPY" | "AED" | "ARS";

// Approximate display-only rates. Orders and payment requests remain stored and charged in NGN.
const NGN_PER_UNIT: Record<DisplayCurrency, number> = {
  NGN: 1,
  USD: 1600,
  GBP: 2050,
  EUR: 1750,
  GHS: 125,
  KES: 12,
  ZAR: 90,
  CAD: 1150,
  AUD: 1050,
  JPY: 10,
  AED: 435,
  ARS: 1500,
};

const COUNTRY_CURRENCY: Record<string, DisplayCurrency> = {
  NG: "NGN", US: "USD", CA: "CAD", GB: "GBP", IE: "EUR", FR: "EUR", DE: "EUR", ES: "EUR", IT: "EUR",
  GH: "GHS", KE: "KES", ZA: "ZAR", AU: "AUD", JP: "JPY", AE: "AED", AR: "ARS",
};

export function currencyForLocale(locale: string): DisplayCurrency {
  const country = locale.split("-")[1]?.toUpperCase() ?? "NG";
  return COUNTRY_CURRENCY[country] ?? "USD";
}

export function formatLocalizedPrice(ngnKobo: number, currency: DisplayCurrency): string {
  const amount = (Number.isFinite(ngnKobo) ? ngnKobo / 100 : 0) / NGN_PER_UNIT[currency];
  return new Intl.NumberFormat(currency === "NGN" ? "en-NG" : undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: currency === "JPY" ? 0 : 2,
    maximumFractionDigits: currency === "JPY" ? 0 : 2,
  }).format(amount);
}
