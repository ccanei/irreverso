"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { addDwellTime, readPresence, trackVisit } from "../../../lib/presence";

const baseText = "O medo é uma forma de reconhecimento";

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

    trackVisit(path, now);
    startedAt.current = performance.now();

    const delay = Math.floor(90 + Math.random() * 320);
    const timer = window.setTimeout(() => {
      let nextText = baseText;

      if (before.visits % 2 === 1 || previousRoute === "/signals") {
        nextText = `${nextText}.`;
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
