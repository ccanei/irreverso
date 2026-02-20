"use client";

import { useEffect, useState } from "react";
import { CANON_QUOTES } from "../../lib/dominion";

const FEED_POOL = [
  "integrity check // partial",
  "variance accepted",
  "probability recalculated",
  "redacted block synchronized",
  "latency window adjusted",
  "archive gate // pending",
  "transmission index remapped",
  "trace link // redacted",
  "integrity drift detected",
  "instance route observed",
  "NUVE // signature received",
  ...CANON_QUOTES,
];

function pickLine() {
  const base = FEED_POOL[Math.floor(Math.random() * FEED_POOL.length)];
  const stamp = new Date().toLocaleTimeString([], { hour12: false });
  return `${stamp} // ${base}`;
}

export function LiveFeed({ acceleratedUntil }: { acceleratedUntil: number }) {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    let timer = 0;

    const run = () => {
      const now = Date.now();
      const delay = now < acceleratedUntil ? 700 + Math.random() * 300 : 1200 + Math.random() * 1200;
      timer = window.setTimeout(() => {
        if (!active) return;
        setLines((prev) => [pickLine(), ...prev].slice(0, 18));
        run();
      }, delay);
    };

    setLines([pickLine(), pickLine(), pickLine()]);
    run();

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [acceleratedUntil]);

  return (
    <div className="panel panel-feed">
      <p className="panel-title">FEED AO VIVO</p>
      <div className="feed-list">
        {lines.map((line, index) => (
          <p key={`${line}-${index}`} className="feed-line">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
