"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { readPresence, writePresence } from "../lib/presence";
import { readClearance, updateClearance } from "../lib/clearance";
import { useSystemState } from "./system/SystemProvider";
import {
  buildIntrusionPayload,
  pushIntrusionTrail,
  shouldTriggerIntrusion,
  type IntrusionPayload,
} from "../lib/intrusionEngine";
import type { RealityItem } from "../lib/realityFetch";

export function IntrusionTransmission() {
  const pathname = usePathname();
  const { activeEra, refreshClearance } = useSystemState();
  const [payload, setPayload] = useState<IntrusionPayload | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!(pathname.startsWith("/core") || pathname.startsWith("/archive"))) {
      return;
    }

    const presence = readPresence();
    if (!shouldTriggerIntrusion(presence.visits, presence.dwellTime)) return;

    const load = async () => {
      const response = await fetch("/api/reality", { cache: "force-cache" });
      if (!response.ok) return;
      const data = (await response.json()) as { items?: RealityItem[] };
      const intrusion = buildIntrusionPayload(data.items || [], activeEra);
      if (!intrusion) return;
      setPayload(intrusion);
      setOpen(true);
    };

    load();
  }, [activeEra, pathname]);

  useEffect(() => {
    if (!open || !payload) return;
    const timer = window.setTimeout(() => {
      setOpen(false);
      pushIntrusionTrail({ type: "intrusion_interrupted", at: Date.now(), id: payload.id });
      const presence = readPresence();
      writePresence({ ...presence, integrity: Math.max(98.8, Number((presence.integrity - 0.03).toFixed(2))) });
      const current = readClearance();
      updateClearance({ interactions: Math.max(0, current.interactions - 1) });
      refreshClearance();
    }, payload.autoCloseMs);

    return () => window.clearTimeout(timer);
  }, [open, payload, refreshClearance]);

  const closeAsInterrupted = () => {
    if (!payload) return;
    setOpen(false);
    pushIntrusionTrail({ type: "intrusion_interrupted", at: Date.now(), id: payload.id });
  };

  const confirmRead = () => {
    if (!payload) return;
    setOpen(false);
    pushIntrusionTrail({ type: "intrusion_read", at: Date.now(), id: payload.id });
    const presence = readPresence();
    writePresence({ ...presence, integrity: Math.min(99.99, Number((presence.integrity + 0.02).toFixed(2))) });
    const current = readClearance();
    updateClearance({ interactions: current.interactions + 1 });
    refreshClearance();
  };

  const timestamp = new Date().toLocaleTimeString("pt-BR", { hour12: false });

  if (!open || !payload) return null;

  return (
    <div className="intrusion-shell" onClick={closeAsInterrupted}>
      <aside className="intrusion-pane" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <p className="intrusion-mark">transmission interceptada // {timestamp}</p>
        <p className="intrusion-quote">“{payload.quote}”</p>
        <a href={payload.item.link} rel="noreferrer" target="_blank" className="intrusion-headline">
          {payload.item.title}
        </a>
        <p className="intrusion-meta">{payload.item.sourceName} · {payload.category}</p>
        <p className="intrusion-note">vazamento do futuro detectado na camada atual.</p>
        <button type="button" onClick={confirmRead}>registrar leitura</button>
      </aside>
    </div>
  );
}
