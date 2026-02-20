"use client";

import { useEffect } from "react";
import { addEvent } from "../../../lib/presence";

export default function Layer() {
  useEffect(() => {
    addEvent("route_layer");
  }, []);

  const fragments = [
    {
      id: "a1",
      text: "drift não é falha. é memória tentando se ajustar.",
    },
    {
      id: "a2",
      text: "integridade alta pode ser apenas silêncio bem calibrado.",
    },
    {
      id: "a3",
      text: "variação registrada. superfície estável.",
    },
    {
      id: "a4",
      text: "latência não mede distância. mede hesitação.",
    },
    {
      id: "a5",
      text: "camada superior detecta… recalibra… proce—…",
      corrupted: true,
    },
  ];

  return (
    <main className="center">
      <div className="terminal terminal--narrow layer-sheet">
        <ul className="layer-list" aria-label="fragmentos de camada">
          {fragments.map((fragment) => (
            <li key={fragment.id} className="layer-item">
              <p className="layer-id">layer: {fragment.id}</p>
              <p className={fragment.corrupted ? "layer-fragment layer-fragment--corrupted" : "layer-fragment"}>
                {fragment.text}
              </p>
            </li>
          ))}
        </ul>

        <p className="layer-footnote">layer: partial</p>
      </div>
    </main>
  );
}
