"use client";

import { useEffect, useState } from "react";
import { readPresence } from "../../../lib/presence";

export function RealityFragment() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const presence = readPresence();
    const interactions = presence.visits + presence.variance + presence.focusLossCount;

    if (interactions < 7) {
      return;
    }

    const revealDelay = 700 + Math.round(Math.random() * 1300);
    const showTimer = window.setTimeout(() => {
      setVisible(true);
    }, revealDelay);

    const hideTimer = window.setTimeout(() => {
      setVisible(false);
    }, revealDelay + 2000);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <p className={`reality-fragment ${visible ? "reality-fragment--visible" : ""}`} aria-hidden>
      Fragmentos da Realidade — Parte I
      <br />
      O Ano que Não Existiu
    </p>
  );
}
