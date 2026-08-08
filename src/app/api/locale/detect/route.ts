import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cfCountry = request.headers.get("cf-ipcountry");
  if (cfCountry && cfCountry !== "XX" && cfCountry !== "T1") {
    return NextResponse.json({ countryCode: cfCountry.toUpperCase() });
  }

  const vercelCountry = request.headers.get("x-vercel-ip-country");
  if (vercelCountry) {
    return NextResponse.json({ countryCode: vercelCountry.toUpperCase() });
  }

  const acceptLang = request.headers.get("accept-language") ?? "";
  const primary = acceptLang.split(",")[0]?.trim() ?? "";
  const parts = primary.split("-");
  if (parts.length >= 2) {
    return NextResponse.json({ countryCode: parts[1].toUpperCase() });
  }

  const langMap: Record<string, string> = {
    fr: "FR", de: "DE", es: "ES", it: "IT", pt: "PT", ja: "JP",
    ko: "KR", zh: "CN", nl: "NL", sv: "SE", da: "DK", nb: "NO",
  };
  const mapped = langMap[parts[0]?.toLowerCase() ?? ""];
  if (mapped) {
    return NextResponse.json({ countryCode: mapped });
  }

  return NextResponse.json({ countryCode: "NG" });
}
