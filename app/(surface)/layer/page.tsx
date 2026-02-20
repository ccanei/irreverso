"use client";

import { useEffect, useMemo, useState } from "react";
import { addEvent, readPresence, writePresence } from "../../../lib/presence";

type LayerVariant = "VAR_A" | "VAR_B" | "VAR_C";

type LayerFragment = {
  id: string;
  text: string;
  corrupted?: boolean;
};

type StoredLayerVariant = {
  variant: LayerVariant;
  chosenAt: number;
};

const DAY_MS = 86_400_000;
const VARIANT_KEY = "irreverso.layerVariant";

const VAR_A: LayerFragment[] = [
  { id: "a1", text: "drift não é falha. é memória tentando se ajustar." },
  { id: "a2", text: "integridade alta pode ser apenas silêncio bem calibrado." },
  { id: "a3", text: "variação registrada. superfície estável." },
  { id: "a4", text: "latência não mede distância. mede hesitação." },
  { id: "a5", text: "camada superior detecta… proce…", corrupted: true },
  { id: "a6", text: "checksum respira em ciclos curtos." },
];

const VAR_B: LayerFragment[] = [
  { id: "a1", text: "drift não é falha. é memória tentando reajustar." },
  { id: "a2", text: "integridade alta pode soar como silêncio bem calibrado." },
  { id: "a3", text: "variação registrada. superfície quase estável." },
  { id: "a4", text: "latência não mede distância. mede breve hesitação." },
  { id: "a5", text: "camada superior detecta ruído mínimo… recalibra… proce…", corrupted: true },
  { id: "a6", text: "checksum respira em ciclos curtos." },
];

const VAR_C: LayerFragment[] = [
  { id: "a1", text: "drift não é falha. é memória testando novo alinhamento." },
  { id: "a2", text: "integridade alta às vezes mascara ruído de baixa amplitude." },
  { id: "a3", text: "variação registrada. superfície estável em borda instável." },
  { id: "a4", text: "latência não mede distância. mede a dobra entre estados." },
  { id: "a5", text: "camada superior detecta ruído mínimo… recalibra… proce… ⟂", corrupted: true },
  { id: "a6", text: "checksum mantém pulso, mesmo fora de fase." },
];

function readStoredVariant(now: number): StoredLayerVariant | null {
  const raw = window.localStorage.getItem(VARIANT_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredLayerVariant>;
    const chosenAt = Number(parsed.chosenAt);

    if ((parsed.variant === "VAR_A" || parsed.variant === "VAR_B" || parsed.variant === "VAR_C") && Number.isFinite(chosenAt)) {
      if (now - chosenAt < DAY_MS) {
        return {
          variant: parsed.variant,
          chosenAt,
        };
      }
    }
  } catch {
    return null;
  }

  return null;
}

function saveVariant(variant: LayerVariant, now: number) {
  const payload: StoredLayerVariant = { variant, chosenAt: now };
  window.localStorage.setItem(VARIANT_KEY, JSON.stringify(payload));
}

function pickWithThreshold(score: number, primary: LayerVariant, secondary: LayerVariant, primaryRatio: number) {
  return score < primaryRatio ? primary : secondary;
}

function chooseLayerVariant(now: number): LayerVariant {
  const cached = readStoredVariant(now);
  if (cached) {
    return cached.variant;
  }

  const presence = readPresence(now);
  const daysSinceFirstSeen = Math.floor((now - presence.firstSeen) / DAY_MS);
  const signal = `${daysSinceFirstSeen}:${presence.visits}:${presence.variance}`;
  const value = signal.split("").reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 0);
  const score = (value % 100) / 100;

  let variant: LayerVariant = "VAR_A";

  if (daysSinceFirstSeen < 3) {
    variant = "VAR_A";
  } else if (daysSinceFirstSeen < 7) {
    variant = pickWithThreshold(score, "VAR_A", "VAR_B", 0.7);
  } else {
    variant = pickWithThreshold(score, "VAR_B", "VAR_C", 0.65);
  }

  if (presence.variance >= 3) {
    variant = pickWithThreshold(score, "VAR_B", "VAR_C", 0.65);
  }

  saveVariant(variant, now);
  return variant;
}

function fragmentsForVariant(variant: LayerVariant): LayerFragment[] {
  if (variant === "VAR_B") {
    return VAR_B;
  }

  if (variant === "VAR_C") {
    return VAR_C;
  }

  return VAR_A;
}

export default function Layer() {
  const [variant, setVariant] = useState<LayerVariant>("VAR_A");

  useEffect(() => {
    const now = Date.now();
    setVariant(chooseLayerVariant(now));

    addEvent("route_layer", now);
    addEvent("layer_read", now);

    const presence = readPresence(now);
    writePresence({
      ...presence,
      firstSeen: presence.firstSeen || now,
      lastSeen: now,
    });
  }, []);

  const fragments = useMemo(() => fragmentsForVariant(variant), [variant]);

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
