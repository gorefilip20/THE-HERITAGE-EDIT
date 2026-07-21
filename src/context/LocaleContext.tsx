"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { type LocaleConfig, getLocaleForCountry, getDefaultLocale, formatLocalizedPrice, t } from "@/lib/locale";

interface LocaleContextValue {
  locale: LocaleConfig;
  setCountry: (countryCode: string) => void;
  formatPrice: (cents: number, overrideCurrency?: string) => string;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function detectCountryFromBrowser(): string | null {
  if (typeof navigator === "undefined") return null;
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "";
  const parts = lang.split("-");
  if (parts.length >= 2) {
    return parts[1].toUpperCase();
  }
  const langMap: Record<string, string> = {
    fr: "FR", de: "DE", es: "ES", it: "IT", pt: "PT", ja: "JP",
    ko: "KR", zh: "CN", nl: "NL", sv: "SE", da: "DK", nb: "NO", no: "NO",
  };
  return langMap[parts[0].toLowerCase()] ?? null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<LocaleConfig>(getDefaultLocale());

  useEffect(() => {
    const stored = localStorage.getItem("the-locale-country");
    if (stored) {
      setLocale(getLocaleForCountry(stored));
      return;
    }

    async function detect() {
      try {
        const res = await fetch("/api/locale/detect");
        if (res.ok) {
          const data = await res.json();
          if (data.countryCode) {
            setLocale(getLocaleForCountry(data.countryCode));
            localStorage.setItem("the-locale-country", data.countryCode);
            return;
          }
        }
      } catch {}

      const browserCountry = detectCountryFromBrowser();
      if (browserCountry) {
        setLocale(getLocaleForCountry(browserCountry));
        localStorage.setItem("the-locale-country", browserCountry);
      }
    }

    detect();
  }, []);

  const setCountry = useCallback((countryCode: string) => {
    const config = getLocaleForCountry(countryCode);
    setLocale(config);
    localStorage.setItem("the-locale-country", countryCode);
  }, []);

  const formatPriceFn = useCallback(
    (cents: number, overrideCurrency?: string) => {
      return formatLocalizedPrice(
        cents,
        overrideCurrency ?? locale.currency,
        locale.locale,
      );
    },
    [locale],
  );

  const tFn = useCallback(
    (key: string) => t(key, locale.language),
    [locale],
  );

  return (
    <LocaleContext.Provider value={{ locale, setCountry, formatPrice: formatPriceFn, t: tFn }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}
