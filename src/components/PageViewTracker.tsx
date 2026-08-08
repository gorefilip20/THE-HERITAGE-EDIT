"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem("_he_sid");
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem("_he_sid", sid);
  }
  return sid;
}

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (pathname === lastPath.current) return;
    if (pathname.startsWith("/admin")) return;

    lastPath.current = pathname;

    const sessionId = getSessionId();
    if (!sessionId) return;

    const timer = setTimeout(() => {
      fetch("/api/tracking/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pathname,
          referrer: document.referrer || null,
          sessionId,
        }),
      }).catch(() => {});
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
