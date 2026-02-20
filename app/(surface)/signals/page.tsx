"use client";

import { useEffect } from "react";
import { addEvent } from "../../../lib/presence";

export default function Signals() {
  useEffect(() => {
    addEvent("route_signals");
  }, []);

  return (
    <main className="center">
      <div className="terminal terminal--narrow">
        <p>pulso 01: ruído em maré baixa</p>
        <p>pulso 02: eco sem origem</p>
        <p>pulso 03: retorno fragmentado</p>
        <p>pulso 04: janela instável</p>

        <p className="whisper">A rede caiu. O eco começou.</p>
      </div>
    </main>
  );
}
