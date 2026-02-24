"use client";

import { useMemo } from "react";
import { detectLang, type Lang } from "@/lib/i18n";

export default function Page() {
  const lang = useMemo<Lang>(() => detectLang(), []);

  return (
    <div className="coreCard">
      <h2>{lang === "pt" ? "signals" : "signals"}</h2>
      <p>{lang === "pt" ? "Sinais de 2026 não são provas. São pequenas coincidências, repetidas demais para serem acaso — e discretas demais para serem notícia." : "Signals in 2026 aren’t proofs. They’re coincidences repeated too often to be chance — and too subtle to be news."}</p>
      <p className="coreMono" style={{ opacity: 0.82 }}>
        {lang === "pt"
          ? "nota: conteúdo canônico • leitura parcial • sem spoilers"
          : "note: canonical content • partial reading • no spoilers"}
      </p>
    </div>
  );
}
