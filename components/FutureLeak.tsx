"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildFutureLeakScript,
  completeFutureLeakRollback,
  decideFutureLeak,
  markFutureLeakTriggered,
  readFutureLeak,
} from "../lib/futureLeak";
import { readPresence } from "../lib/presence";

type LeakState = "idle" | "running" | "rollback";

export function FutureLeak() {
  const [state, setState] = useState<LeakState>("idle");
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  const finalLines = useMemo(() => ["ACCESS TIMESTAMP INVALID", "ROLLBACK INITIATED"], []);

  useEffect(() => {
    const now = Date.now();
    const decision = decideFutureLeak(now);

    if (!decision.shouldTrigger) {
      return;
    }

    const presence = readPresence(now);
    const script = buildFutureLeakScript(decision.nextLevel, presence.visits, now);
    markFutureLeakTriggered(decision.nextLevel, script.signature, now);

    const totalMs = 3600 + Math.round(Math.random() * 1900);
    const perLineMs = Math.max(80, Math.floor((totalMs - 1200) / script.lines.length));

    setState("running");
    const timers: number[] = [];

    script.lines.forEach((line, index) => {
      const timer = window.setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
      }, index * perLineMs);
      timers.push(timer);
    });

    const rollbackAt = script.lines.length * perLineMs + 120;
    timers.push(
      window.setTimeout(() => {
        setState("rollback");
        setVisibleLines((prev) => [...prev, ...finalLines]);
      }, rollbackAt),
    );

    timers.push(
      window.setTimeout(() => {
        setState("idle");
        setVisibleLines([]);
        completeFutureLeakRollback();
      }, Math.min(6000, rollbackAt + 900)),
    );

    return () => {
      timers.forEach((timer) => {
        window.clearTimeout(timer);
      });
    };
  }, [finalLines]);

  if (state === "idle") {
    return null;
  }

  return (
    <div className="future-leak" aria-hidden>
      <div className="future-leak__terminal">
        {visibleLines.map((line, index) => (
          <p className="future-leak__line" key={`${line}-${index}`}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
