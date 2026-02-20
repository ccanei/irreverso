"use client";

import { useEffect } from "react";
import { addEvent } from "../../../lib/presence";
import { CANON_QUOTES } from "../../../lib/dominion";

export default function Signals() {
  useEffect(() => {
    addEvent("route_signals");
  }, []);

  return (
    <section>
      <p className="section-head">SIGNALS // minimal</p>
      <p>{CANON_QUOTES[4]}</p>
      <p>{CANON_QUOTES[5]}</p>
      <p>{CANON_QUOTES[6]}</p>
    </section>
  );
}
