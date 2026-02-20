"use client";

import { useEffect, useMemo, useState } from "react";

const BOOT_LINES = [
  "irv.kernel::init",
  "mounting decision architecture",
  "temporal checksum...ok",
  "signal lattice...stable",
  "authority profile...limited",
];

export function BootSequence() {
  const [visible, setVisible] = useState(true);
  const [lineCount, setLineCount] = useState(0);
  const [granted, setGranted] = useState(false);
  const lines = useMemo(() => BOOT_LINES, []);

  useEffect(() => {
    const timers: number[] = [];
    lines.forEach((_, index) => {
      timers.push(window.setTimeout(() => setLineCount(index + 1), 320 + index * 320));
    });

    timers.push(window.setTimeout(() => setGranted(true), 1800));
    timers.push(window.setTimeout(() => setVisible(false), 2200));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [lines]);

  if (!visible) {
    return null;
  }

  return (
    <section className="boot-screen" aria-live="polite">
      <div className="boot-lines">
        {lines.slice(0, lineCount).map((line) => (
          <p key={line}>{line}</p>
        ))}
        <p className="boot-cursor">_</p>
        {granted ? <p className="boot-granted">ACCESS GRANTED // limited</p> : null}
      </div>
    </section>
  );
}
