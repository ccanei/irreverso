"use client";

import { useEffect } from "react";
import { addEvent } from "../../../lib/presence";

export default function Archive() {
  useEffect(() => {
    addEvent("route_archive");
  }, []);

  return (
    <main className="center">
      <div className="terminal terminal--narrow">
        <p>arquivo em leitura parcial</p>
        <p>segmentos preservados</p>

        <p className="whisper">Você foi autorizado a recordar.</p>
      </div>
    </main>
  );
}
