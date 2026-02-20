"use client";

import { useEffect, useMemo, useState } from "react";
import { addEvent } from "../../lib/presence";
import {
  localTelemetry,
  markEvent,
  randomQuotePair,
  registerSession,
  shouldGuaranteeBreach,
  shouldTriggerTakeover,
  shuffledTimeline,
} from "../../lib/dominion";

type EventMode = "none" | "breach" | "takeover";

export function DominionEvents({
  onRollback,
}: {
  onRollback: (payload: { integrityDrop: number; learningForMs: number; accelerateForMs: number }) => void;
}) {
  const [mode, setMode] = useState<EventMode>("none");
  const [lines, setLines] = useState<string[]>([]);
  const [debug, setDebug] = useState(false);

  const triggerBreach = useMemo(
    () => () => {
      const telemetry = localTelemetry();
      const [q1, q2] = randomQuotePair();
      setLines([
        `LOCAL TIME // ${telemetry.localTime}`,
        `TIMEZONE // ${telemetry.timezone}`,
        `LANGUAGE // ${telemetry.language}`,
        `OS // ${telemetry.os}`,
        `DEVICE CLASS // ${telemetry.deviceClass}`,
        "SynthTech // decision architecture active",
        q1,
        q2,
        "UNAUTHORIZED TEMPORAL ACCESS",
        "ROLLBACK INITIATED",
      ]);
      setMode("breach");
      markEvent("breach");
      addEvent("environmental_breach");
      window.setTimeout(() => {
        setMode("none");
        onRollback({ integrityDrop: -0.35, learningForMs: 20_000, accelerateForMs: 10_000 });
      }, 9_500);
    },
    [onRollback],
  );

  const triggerTakeover = useMemo(
    () => () => {
      const timeline = shuffledTimeline();
      const variant = Math.random() > 0.5 ? "historical stream // unstable" : "historical stream // rewritten";
      setLines([variant, ...timeline, "NUVE // continuity asserted", "UNAUTHORIZED TEMPORAL ACCESS", "ROLLBACK INITIATED"]);
      setMode("takeover");
      markEvent("takeover");
      addEvent("historical_takeover");
      window.setTimeout(() => {
        setMode("none");
        onRollback({ integrityDrop: -0.41, learningForMs: 20_000, accelerateForMs: 10_000 });
      }, 8_000);
    },
    [onRollback],
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDebug(params.get("debug") === "1");
    registerSession();

    if (shouldGuaranteeBreach()) {
      const wait = 10_000 + Math.round(Math.random() * 18_000);
      const timer = window.setTimeout(() => triggerBreach(), wait);
      return () => window.clearTimeout(timer);
    }

    if (shouldTriggerTakeover()) {
      const timer = window.setTimeout(() => triggerTakeover(), 14_000 + Math.round(Math.random() * 14_000));
      return () => window.clearTimeout(timer);
    }
  }, [triggerBreach, triggerTakeover]);

  if (mode === "none") {
    return debug ? (
      <aside className="debug-panel">
        <button onClick={triggerBreach}>trigger breach</button>
        <button onClick={triggerTakeover}>trigger takeover</button>
        <button
          onClick={() => {
            Object.keys(window.localStorage)
              .filter((key) => key.startsWith("irreverso."))
              .forEach((key) => window.localStorage.removeItem(key));
          }}
        >
          reset irreverso.*
        </button>
      </aside>
    ) : null;
  }

  return (
    <section className={`dominion-overlay dominion-overlay--${mode}`}>
      <div>
        {lines.map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
    </section>
  );
}
