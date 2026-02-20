"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildFutureLeakScript,
  buildRareHistoricalScript,
  completeFutureLeakRollback,
  decideFutureLeak,
  decideRareHistoricalEvent,
  markFutureLeakTriggered,
  markRareHistoricalEvent,
} from "../lib/futureLeak";
import { readPresence } from "../lib/presence";

type LeakState = "idle" | "running" | "rollback" | "rare";

function yearPause(line: string) {
  return /^\d{4}\s*>/.test(line) ? 180 + Math.round(Math.random() * 320) : 0;
}

export function FutureLeak() {
  const [state, setState] = useState<LeakState>("idle");
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  const finalLines = useMemo(() => ["ACCESS TIMESTAMP INVALID", "ROLLBACK INITIATED"], []);

  useEffect(() => {
    const now = Date.now();
    const rareDecision = decideRareHistoricalEvent(now);

    if (rareDecision.shouldTrigger) {
      const rareScript = buildRareHistoricalScript(now);
      markRareHistoricalEvent(rareScript.signature, now);
      setState("rare");
      setVisibleLines(rareScript.lines);

      const timer = window.setTimeout(() => {
        setState("idle");
        setVisibleLines([]);
      }, 8_000);

      return () => {
        window.clearTimeout(timer);
      };
    }

    const decision = decideFutureLeak(now);
    if (!decision.shouldTrigger) {
      return;
    }

    const presence = readPresence(now);
    const script = buildFutureLeakScript(decision.nextLevel, presence.visits, now);
    markFutureLeakTriggered(decision.nextLevel, script.signature, now);

    const totalMs = 7000 + Math.round(Math.random() * 2000);
    const preRollbackBudget = totalMs - 1400;
    const basePerLine = Math.max(180, Math.floor(preRollbackBudget / script.lines.length));

    setState("running");
    const timers: number[] = [];
    let elapsed = 0;

    script.lines.forEach((line) => {
      elapsed += basePerLine + Math.round(Math.random() * 140) + yearPause(line);
      timers.push(
        window.setTimeout(() => {
          setVisibleLines((prev) => [...prev, line]);
        }, elapsed),
      );
    });

    const rollbackAt = Math.min(totalMs - 900, elapsed + 180);
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
      }, totalMs),
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
    <div className={`future-leak ${state === "rare" ? "future-leak--rare" : ""}`} aria-hidden>
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
