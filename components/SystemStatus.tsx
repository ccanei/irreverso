"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  addEvent,
  increaseVariance,
  pushRouteTrail,
  readEventsTrail,
  readPresence,
  registerFocusLoss,
} from "../lib/presence";

const TITLE_FLAG = "irreverso.focusTitleHandled";
const FOCUS_LOST_EVENT_FLAG = "irreverso.focusLostEventLogged";
const PROBABILITY_FLAG = "probabilityEventFired";

function randomLatency() {
  return 26 + Math.round(Math.random() * 38);
}

function maybeNextStatus(variance: number) {
  const roll = Math.random();
  const learningChance = variance >= 3 ? 0.24 : 0.18;

  if (roll < learningChance) {
    return "learning" as const;
  }

  if (roll < 0.53) {
    return "observing" as const;
  }

  return null;
}

function cameFromSignalsOrArchive() {
  if (typeof window === "undefined") {
    return null;
  }

  const referrer = document.referrer;
  if (!referrer) {
    return null;
  }

  try {
    const ref = new URL(referrer);
    if (ref.origin !== window.location.origin) {
      return null;
    }

    if (ref.pathname === "/signals") {
      return "signals" as const;
    }

    if (ref.pathname === "/archive") {
      return "archive" as const;
    }

    return null;
  } catch {
    return null;
  }
}

function probabilityWindowBoost(eventsTrail: ReturnType<typeof readEventsTrail>) {
  const latestProbability = [...eventsTrail]
    .reverse()
    .find((item) => item.type === "probability_recalculated");

  if (!latestProbability) {
    return false;
  }

  const fortyEightHours = 48 * 60 * 60 * 1000;
  return Date.now() - latestProbability.t <= fortyEightHours;
}

export function SystemStatus() {
  const [latency, setLatency] = useState(() => randomLatency());
  const [integrity, setIntegrity] = useState(99.64);
  const [, setVariance] = useState(0);
  const [instanceState, setInstanceState] = useState<"active" | "observing" | "learning">("active");
  const [showProbabilityEvent, setShowProbabilityEvent] = useState(false);
  const [rareLogLine, setRareLogLine] = useState<string | null>(null);
  const varianceRef = useRef(0);
  const visitsRef = useRef(0);
  const integrityRef = useRef(integrity);

  useEffect(() => {
    const current = readPresence();
    setIntegrity(current.integrity);
    setVariance(current.variance);
    varianceRef.current = current.variance;
    visitsRef.current = current.visits;
    integrityRef.current = current.integrity;
    pushRouteTrail(window.location.pathname);

    const tick = window.setInterval(() => {
      setLatency((prev) => {
        const drift = Math.round((Math.random() - 0.5) * 8);
        return Math.min(86, Math.max(19, prev + drift));
      });

      setIntegrity((prev) => {
        const next = prev + (Math.random() - 0.5) * 0.01;
        const clamped = Math.min(99.99, Math.max(98.8, next));
        integrityRef.current = clamped;
        return clamped;
      });
    }, 3200 + Math.round(Math.random() * 2200));

    return () => {
      window.clearInterval(tick);
    };
  }, []);

  useEffect(() => {
    let hasTriggered = window.localStorage.getItem(PROBABILITY_FLAG) === "true";

    if (hasTriggered) {
      return;
    }

    let hideTimer: number | undefined;

    const maybeTrigger = () => {
      if (hasTriggered) {
        return;
      }

      const qualifies = visitsRef.current >= 2 && integrityRef.current < 99.85;
      if (!qualifies) {
        return;
      }

      hasTriggered = true;
      window.localStorage.setItem(PROBABILITY_FLAG, "true");
      addEvent("probability_recalculated");
      setShowProbabilityEvent(true);

      hideTimer = window.setTimeout(() => {
        setShowProbabilityEvent(false);
      }, 900);

      window.removeEventListener("blur", onBlur);
      window.removeEventListener("mousemove", onMouseMove);
    };

    const onBlur = () => {
      maybeTrigger();
    };

    const onMouseMove = (event: MouseEvent) => {
      if (event.clientY < 40) {
        maybeTrigger();
      }
    };

    window.addEventListener("blur", onBlur, { once: true });
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      if (hideTimer) {
        window.clearTimeout(hideTimer);
      }
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  useEffect(() => {
    const originalTitle = document.title;
    let hasHandledBlur = window.sessionStorage.getItem(TITLE_FLAG) === "1";
    let didCountFocusLoss = false;

    const countFocusLoss = () => {
      if (didCountFocusLoss) {
        return;
      }
      registerFocusLoss();
      if (window.sessionStorage.getItem(FOCUS_LOST_EVENT_FLAG) !== "1") {
        addEvent("focus_lost");
        window.sessionStorage.setItem(FOCUS_LOST_EVENT_FLAG, "1");
      }
      didCountFocusLoss = true;
    };

    const markActive = () => {
      if (!hasHandledBlur) {
        document.title = "instance active";
        hasHandledBlur = true;
        window.sessionStorage.setItem(TITLE_FLAG, "1");
      }

      countFocusLoss();
    };

    const restoreTitle = () => {
      didCountFocusLoss = false;
      document.title = originalTitle;
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        markActive();
        return;
      }

      restoreTitle();
    };

    window.addEventListener("blur", markActive);
    window.addEventListener("focus", restoreTitle);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.title = originalTitle;
      window.removeEventListener("blur", markActive);
      window.removeEventListener("focus", restoreTitle);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const nextStatus = maybeNextStatus(varianceRef.current);
    if (!nextStatus) {
      return;
    }

    let secondTimer: number | undefined;
    const firstDelay = 37000 + Math.round(Math.random() * 15000);
    const firstTimer = window.setTimeout(() => {
      setInstanceState("observing");
      addEvent("state_observing");
      const memory = increaseVariance(1);
      setVariance(memory.variance);
      varianceRef.current = memory.variance;

      if (nextStatus !== "learning") {
        return;
      }

      const secondDelay = 6000 + Math.round(Math.random() * 4000);
      secondTimer = window.setTimeout(() => {
        setInstanceState("learning");
        addEvent("state_learning");
        const updated = increaseVariance(1);
        setVariance(updated.variance);
        varianceRef.current = updated.variance;
      }, secondDelay);
    }, firstDelay);

    return () => {
      window.clearTimeout(firstTimer);
      if (secondTimer) {
        window.clearTimeout(secondTimer);
      }
    };
  }, []);

  useEffect(() => {
    const sourceRoute = cameFromSignalsOrArchive();
    const eventsTrail = readEventsTrail();

    let chance = 0.12;
    if (probabilityWindowBoost(eventsTrail)) {
      chance = 0.22;
    }
    if (sourceRoute) {
      chance = 0.18;
    }

    if (Math.random() >= chance) {
      return;
    }

    const pool = [
      "// variance recorded",
      "// drift compensated",
      "// state persisted",
      "// route memory updated",
      "// integrity adjusted",
      "// probability surface stable",
    ];

    if (sourceRoute === "signals") {
      pool.push("// signal echo detected");
    }

    if (sourceRoute === "archive") {
      pool.push("// archive index warmed");
    }

    const selected = pool[Math.floor(Math.random() * pool.length)];
    setRareLogLine(selected);

    const hideAfter = 900 + Math.round(Math.random() * 300);
    const hideTimer = window.setTimeout(() => {
      setRareLogLine(null);
    }, hideAfter);

    return () => {
      window.clearTimeout(hideTimer);
    };
  }, []);

  const integrityText = useMemo(() => integrity.toFixed(2), [integrity]);

  return (
    <div className="statusbar" aria-live="polite">
      <p className="statusline">
        instance: <span className="muted">{instanceState}</span>
      </p>
      <p className="statusline">
        latency: <span className="muted">{latency}ms</span>
      </p>
      <p className="statusline">
        integrity: <span className="muted">{integrityText}%</span>
      </p>
      {showProbabilityEvent ? <p className="statusline probability-event">// probability recalculated</p> : null}
      {rareLogLine ? <p className="statusline probability-event">{rareLogLine}</p> : null}
    </div>
  );
}
