"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDwellTime, readEventsTrail, readPresence, trackVisit } from "../../../lib/presence";

const baseText = "O medo é uma forma de reconhecimento";

function mutateWhisper(text: string, seed: number) {
  const mode = seed % 3;

  if (mode === 0) {
    return `${text} .`;
  }

  if (mode === 1) {
    return "Uma forma de reconhecimento é o medo";
  }

  return text.replace(" de ", "  de ");
}

export function PresenceWhisper() {
  const [text, setText] = useState(baseText);
  const [fontWeight, setFontWeight] = useState<number>(340);
  const [delayReady, setDelayReady] = useState(false);
  const startedAt = useRef(0);

  useEffect(() => {
    const now = Date.now();
    const path = window.location.pathname;
    const before = readPresence(now);
    const previousRoute = before.lastRoute;
    const strongEvent = readEventsTrail()
      .slice(-6)
      .some((item) => item.type === "rollback_success" || item.type === "rare_historical_terminal");

    const after = trackVisit(path, now);
    startedAt.current = performance.now();

    const baseDelay = Math.floor(90 + Math.random() * 320);
    const integrityDelay = after.integrity < 99.7 ? Math.floor(120 + Math.random() * 160) : 0;
    const delay = baseDelay + integrityDelay;
    const timer = window.setTimeout(() => {
      let nextText = baseText;

      if (before.visits % 2 === 1 || previousRoute === "/signals") {
        nextText = `${nextText}.`;
      }

      if (strongEvent) {
        nextText = mutateWhisper(nextText, before.visits + after.variance);
      }

      setText(nextText);
      const subtleWeight = 330 + ((before.visits + (previousRoute ? 1 : 0)) % 3) * 20;
      setFontWeight(subtleWeight);
      setDelayReady(true);
    }, delay);

    const activeTimer = window.setTimeout(() => {
      setText((current) => (current.includes("ativo") ? current : `${current} ativo`));
    }, 15000);

    const flushDwell = () => {
      const elapsed = performance.now() - startedAt.current;
      if (elapsed > 0) {
        addDwellTime(elapsed);
        startedAt.current = performance.now();
      }
    };

    window.addEventListener("pagehide", flushDwell);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(activeTimer);
      window.removeEventListener("pagehide", flushDwell);
      flushDwell();
    };
  }, []);

  const style = useMemo(
    () => ({
      fontWeight,
      opacity: delayReady ? 1 : 0.92,
      transition: "opacity 260ms ease",
    }),
    [delayReady, fontWeight],
  );

  return (
    <p className="whisper" style={style}>
      {text}
    </p>
  );
}
