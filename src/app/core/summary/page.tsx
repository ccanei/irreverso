"use client";

import { useMemo } from "react";
import { detectLang, type Lang } from "@/lib/i18n";

export default function Page() {
  const lang = useMemo<Lang>(() => detectLang(), []);

  return (
    <div className="coreCard">
      <h2>{lang === "pt" ? "summary" : "summary"}</h2>
      <p>{lang === "pt" ? "O relato que você procura não é uma sinopse. É um aviso. A história não prevê o futuro — ela revela o que já estava decidido." : "What you seek is not a synopsis. It is a warning. The story doesn’t predict the future — it reveals what was already decided."}</p>
      <p className="coreMono" style={{ opacity: 0.82 }}>
        {lang === "pt"
          ? "nota: conteúdo canônico • leitura parcial • sem spoilers"
          : "note: canonical content • partial reading • no spoilers"}
      </p>
    </div>
  );
}
