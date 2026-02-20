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
import { addEvent, readPresence } from "../lib/presence";

type LeakState = "idle" | "flash" | "cursor" | "running" | "rollback" | "rare";

function linePause(line: string) {
  if (/^\d{4}\s*>/.test(line)) {
    return 180 + Math.round(Math.random() * 290);
  }

  return 0;
}

function detectDeviceType() {
  if (typeof window === "undefined") {
    return "desktop";
  }

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  return coarse ? "mobile" : "desktop";
}

export function FutureLeak() {
  const [state, setState] = useState<LeakState>("idle");
  const [visibleLines, setVisibleLines] = useState<string[]>([]);

  const finalLines = useMemo(() => ["UNAUTHORIZED TEMPORAL ACCESS", "ROLLBACK INITIATED"], []);

  useEffect(() => {
    const now = Date.now();
    const rareDecision = decideRareHistoricalEvent(now);
    const presence = readPresence(now);

    if (rareDecision.shouldTrigger) {
      const rareScript = buildRareHistoricalScript(now);
      markRareHistoricalEvent(rareScript.signature, now);
      addEvent(`telemetry:lang:${navigator.language || "unknown"}`);
      addEvent(`telemetry:tz:${Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown"}`);
      addEvent(`telemetry:device:${detectDeviceType()}`);

      const totalMs = 8_200 + Math.round(Math.random() * 3_100);
      const preRollbackBudget = totalMs - 1_000;
      const basePerLine = Math.max(220, Math.floor(preRollbackBudget / rareScript.lines.length));

      const timers: number[] = [];
      setState("flash");
      timers.push(
        window.setTimeout(() => {
          setState("cursor");
          setVisibleLines(["> _"]);
        }, 40),
      );

      timers.push(
        window.setTimeout(() => {
          setState("rare");
          setVisibleLines([]);
          let elapsed = 0;

          rareScript.lines.forEach((line) => {
            elapsed += basePerLine + Math.round(Math.random() * 130) + linePause(line);
            timers.push(
              window.setTimeout(() => {
                setVisibleLines((prev) => [...prev, line]);
              }, elapsed),
            );
          });

          const rollbackAt = Math.min(totalMs - 700, elapsed + 210);
          timers.push(
            window.setTimeout(() => {
              setState("rollback");
              setVisibleLines((prev) => [...prev, ...finalLines]);
            }, rollbackAt),
          );
        }, 1_540),
      );

      timers.push(
        window.setTimeout(() => {
          setState("idle");
          setVisibleLines([]);
          completeFutureLeakRollback();
        }, totalMs),
      );

      return () => {
        timers.forEach((timer) => window.clearTimeout(timer));
      };
    }

    const decision = decideFutureLeak(now);
    if (!decision.shouldTrigger) {
      return;
    }

    const script = buildFutureLeakScript(decision.nextLevel, presence.visits, now);
    markFutureLeakTriggered(decision.nextLevel, script.signature, now);

    addEvent(`telemetry:lang:${navigator.language || "unknown"}`);
    addEvent(`telemetry:tz:${Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown"}`);
    addEvent(`telemetry:device:${detectDeviceType()}`);

    const totalMs = 8_000 + Math.round(Math.random() * 4_000);
    const preRollbackBudget = totalMs - 1_100;
    const basePerLine = Math.max(210, Math.floor(preRollbackBudget / script.lines.length));

    setState("flash");
    const timers: number[] = [];

    timers.push(
      window.setTimeout(() => {
        setState("cursor");
        setVisibleLines(["> _"]);
      }, 40),
    );

    timers.push(
      window.setTimeout(() => {
        setState("running");
        setVisibleLines([]);
        let elapsed = 0;

        script.lines.forEach((line) => {
          elapsed += basePerLine + Math.round(Math.random() * 140) + linePause(line);
          timers.push(
            window.setTimeout(() => {
              setVisibleLines((prev) => [...prev, line]);
            }, elapsed),
          );
        });

        const rollbackAt = Math.min(totalMs - 740, elapsed + 220);
        timers.push(
          window.setTimeout(() => {
            setState("rollback");
            setVisibleLines((prev) => [...prev, ...finalLines]);
          }, rollbackAt),
        );
      }, 1_540),
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
    <div
      className={`future-leak future-leak--${state}${state === "rare" ? " future-leak--rare" : ""}`}
      aria-hidden
      role="presentation"
    >
      <div className="future-leak__terminal">
        {visibleLines.map((line, index) => (
          <p className={`future-leak__line ${state === "cursor" ? "future-leak__line--cursor" : ""}`} key={`${line}-${index}`}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}
