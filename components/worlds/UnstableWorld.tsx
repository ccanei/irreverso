"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BOOK_QUOTES } from "../../lib/bookCanon";
import { applyResidualAfterBreach, markSeen, pulseDwell, trackCoreSession } from "../../lib/worldState";

const MODULES = [
  { id: "signals", label: "signals", status: "restricted" },
  { id: "archive", label: "archive", status: "redacted" },
  { id: "transmissions", label: "transmissions", status: "restricted" },
];

function randomLine() {
  const quote = BOOK_QUOTES[Math.floor(Math.random() * BOOK_QUOTES.length)];
  return `${new Date().toLocaleTimeString([], { hour12: false })} // ${quote}`;
}

export function UnstableWorld() {
  const [feed, setFeed] = useState<string[]>([]);
  const [integrity, setIntegrity] = useState(99.4);
  const [latency, setLatency] = useState(32);
  const [instance, setInstance] = useState("active");
  const [drift, setDrift] = useState(0.1);
  const [variance, setVariance] = useState(0.22);
  const [unlocked, setUnlocked] = useState<string | null>(null);
  const [breach, setBreach] = useState(false);
  const [flash, setFlash] = useState(false);
  const [breachLines, setBreachLines] = useState<string[]>([]);

  useEffect(() => {
    trackCoreSession("/");
    const t = window.setInterval(() => pulseDwell(), 1000);
    return () => window.clearInterval(t);
  }, []);

  useEffect(() => {
    setFeed([randomLine(), randomLine(), randomLine()]);
    let active = true;
    const loop = () => {
      const delay = 1200 + Math.random() * 1200;
      window.setTimeout(() => {
        if (!active) return;
        setFeed((prev) => [randomLine(), ...prev].slice(0, 16));
        setIntegrity((v) => Math.max(95, Math.min(99.9, v + (Math.random() - 0.5) * 0.06)));
        setLatency((v) => Math.max(10, Math.min(90, v + (Math.random() - 0.5) * 8)));
        setDrift((v) => Math.max(0.05, Math.min(4, v + (Math.random() - 0.5) * 0.2)));
        setVariance((v) => Math.max(0.1, Math.min(2.4, v + (Math.random() - 0.5) * 0.1)));
        setInstance(Math.random() > 0.7 ? "observing" : "active");
        loop();
      }, delay);
    };
    loop();

    const unlockTimer = window.setTimeout(() => setUnlocked("transmissions"), 4600);
    const forceBreach = window.localStorage.getItem("irreverso.debug.forceBreach") === "1";
    const breachStart = window.setTimeout(() => {
      setFlash(true);
      window.setTimeout(() => setFlash(false), 40);
      setTimeout(() => {
        setBreachLines([
          `LOCAL TIME // ${new Date().toLocaleTimeString([], { hour12: false })}`,
          `TIMEZONE // ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
          `LANGUAGE // ${navigator.language}`,
          `OS // ${navigator.platform}`,
          `DEVICE CLASS // ${window.matchMedia("(pointer: coarse)").matches ? "mobile" : "desktop"}`,
          "SYNTHTECH // decision architecture active",
          BOOK_QUOTES[11],
          BOOK_QUOTES[31],
          BOOK_QUOTES[41],
          "NUVE // continuity asserted",
          "UNAUTHORIZED TEMPORAL ACCESS",
          "ROLLBACK INITIATED",
        ]);
        setBreach(true);
      }, 1500);
    }, forceBreach ? 1200 : 5000 + Math.random() * 5000);

    return () => {
      active = false;
      clearTimeout(unlockTimer);
      clearTimeout(breachStart);
    };
  }, []);

  useEffect(() => {
    if (!breach) return;
    const endTimer = window.setTimeout(() => {
      window.localStorage.removeItem("irreverso.debug.forceBreach");
      markSeen();
      applyResidualAfterBreach();
      window.location.replace("/core");
    }, 8000 + Math.random() * 4000);
    return () => clearTimeout(endTimer);
  }, [breach]);

  if (breach) {
    return (
      <section className="takeover-screen">
        <div className="takeover-cursor">_</div>
        <div className="takeover-lines">
          {breachLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </section>
    );
  }

  return (
    <main className="unstable-shell">
      {flash ? <div className="micro-flash" /> : null}
      <section className="panel"><p className="panel-title">LIVE FEED</p>{feed.map((line, i) => <p key={`${line}-${i}`} className="feed-line">{line}</p>)}</section>
      <section className="panel"><p className="panel-title">ACTIVE LAYER</p>
        {MODULES.map((module) => (
          <div key={module.id} className="module-row">
            <span>{module.label}</span>
            {unlocked === module.id ? <Link href="/core" className="module-open">open</Link> : <span>{module.status}</span>}
          </div>
        ))}
      </section>
      <section className="panel"><p className="panel-title">STATUS</p>
        <p>integrity: {integrity.toFixed(2)}%</p><p>latency: {Math.round(latency)}ms</p><p>instance: {instance}</p><p>drift: {drift.toFixed(2)}</p><p>variance: {variance.toFixed(2)}</p>
      </section>
    </main>
  );
}
