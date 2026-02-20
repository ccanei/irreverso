"use client";

import { useEffect, useMemo, useState } from "react";

const INTEGRITY_KEY = "irreverso.statusIntegrity";
const TITLE_FLAG = "irreverso.focusTitleHandled";

function randomLatency() {
  return 26 + Math.round(Math.random() * 38);
}

function maybeNextStatus() {
  const roll = Math.random();

  if (roll < 0.18) {
    return "learning" as const;
  }

  if (roll < 0.53) {
    return "observing" as const;
  }

  return null;
}

function readSessionIntegrity() {
  if (typeof window === "undefined") {
    return 99.64;
  }

  const existing = window.sessionStorage.getItem(INTEGRITY_KEY);
  if (existing) {
    const parsed = Number.parseFloat(existing);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const seeded = 99.45 + Math.random() * 0.42;
  window.sessionStorage.setItem(INTEGRITY_KEY, seeded.toFixed(2));
  return seeded;
}

export function SystemStatus() {
  const [latency, setLatency] = useState(() => randomLatency());
  const [integrity, setIntegrity] = useState(99.64);
  const [instanceState, setInstanceState] = useState<"active" | "observing" | "learning">("active");

  useEffect(() => {
    setIntegrity(readSessionIntegrity());

    const tick = window.setInterval(() => {
      setLatency((prev) => {
        const drift = Math.round((Math.random() - 0.5) * 8);
        return Math.min(86, Math.max(19, prev + drift));
      });

      setIntegrity((prev) => {
        const next = Math.max(99.02, Math.min(99.98, prev + (Math.random() - 0.5) * 0.02));
        window.sessionStorage.setItem(INTEGRITY_KEY, next.toFixed(2));
        return next;
      });
    }, 3200 + Math.round(Math.random() * 2200));

    return () => {
      window.clearInterval(tick);
    };
  }, []);


  useEffect(() => {
    const originalTitle = document.title;
    let hasHandledBlur = window.sessionStorage.getItem(TITLE_FLAG) === "1";

    const markActive = () => {
      if (hasHandledBlur) {
        return;
      }

      document.title = "instance active";
      hasHandledBlur = true;
      window.sessionStorage.setItem(TITLE_FLAG, "1");
    };

    const restoreTitle = () => {
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
    const nextStatus = maybeNextStatus();
    if (!nextStatus) {
      return;
    }

    let secondTimer: number | undefined;
    const firstDelay = 37000 + Math.round(Math.random() * 15000);
    const firstTimer = window.setTimeout(() => {
      setInstanceState("observing");

      if (nextStatus !== "learning") {
        return;
      }

      const secondDelay = 6000 + Math.round(Math.random() * 4000);
      secondTimer = window.setTimeout(() => {
        setInstanceState("learning");
      }, secondDelay);
    }, firstDelay);

    return () => {
      window.clearTimeout(firstTimer);
      if (secondTimer) {
        window.clearTimeout(secondTimer);
      }
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
    </div>
  );
}
