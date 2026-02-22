"use client";

import { useEffect, useMemo, useState } from "react";
import { canonQuotes } from "../lib/canonIndex";

const COOLDOWN_KEY = "irreverso.canonLeakCooldown";
const READ_KEY = "irreverso.canonLeakRead";

function readList() {
  try {
    const raw = window.localStorage.getItem(READ_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === "number") : [];
  } catch {
    return [];
  }
}

export function CanonLeakPopup() {
  const [quoteIndex, setQuoteIndex] = useState<number | null>(null);
  const quote = useMemo(() => (quoteIndex === null ? null : canonQuotes[quoteIndex]), [quoteIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const cooldown = Number(window.localStorage.getItem(COOLDOWN_KEY) || "0");
      if (Date.now() - cooldown < 12 * 60 * 60 * 1000) return;
      if (Math.random() > 0.03) return;
      const seen = new Set(readList());
      const available = canonQuotes.map((_, index) => index).filter((index) => !seen.has(index));
      if (!available.length) return;
      const next = available[Math.floor(Math.random() * available.length)];
      setQuoteIndex(next);
      const words = canonQuotes[next].split(/\s+/).length;
      const durationMs = Math.max(8000, words * 2000);
      window.localStorage.setItem(COOLDOWN_KEY, String(Date.now()));
      window.setTimeout(() => setQuoteIndex(null), durationMs);
    }, 25000 + Math.round(Math.random() * 15000));

    return () => window.clearInterval(timer);
  }, []);

  if (!quote || quoteIndex === null) return null;

  return (
    <div
      className="canon-leak-shell"
      onClick={() => {
        const seen = new Set(readList());
        seen.add(quoteIndex);
        window.localStorage.setItem(READ_KEY, JSON.stringify([...seen]));
        setQuoteIndex(null);
      }}
    >
      <aside className="canon-leak-popup" onClick={(event) => event.stopPropagation()}>
        <p>{quote}</p>
        <small>leak: canonical / access not requested</small>
      </aside>
    </div>
  );
}
