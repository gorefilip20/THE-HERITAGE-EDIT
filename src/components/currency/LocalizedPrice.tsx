"use client";

import { useEffect, useState } from "react";
import { currencyForLocale, formatLocalizedPrice, type DisplayCurrency } from "@/lib/currency";

export function LocalizedPrice({ cents, className }: { cents: number; className?: string }) {
  const [currency, setCurrency] = useState<DisplayCurrency>("NGN");

  useEffect(() => {
    setCurrency(currencyForLocale(navigator.language));
  }, []);

  return <span className={className}>{formatLocalizedPrice(cents, currency)}</span>;
}
