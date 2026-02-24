"use client";

import { useMemo } from "react";
import { detectLang, type Lang } from "@/lib/i18n";

export default function Page() {
  const lang = useMemo<Lang>(() => detectLang(), []);

  return (
    <div className="coreCard">
      <h2>{lang === "pt" ? "archive" : "archive"}</h2>
      <p>{lang === "pt" ? "Índice ZETA ativo. Blocos classificados por integridade temporal. Alguns registros existem antes de existir." : "ZETA index online. Blocks classified by temporal integrity. Some records exist before they exist."}</p>
      <p className="coreMono" style={{ opacity: 0.82 }}>
        {lang === "pt"
          ? "nota: conteúdo canônico • leitura parcial • sem spoilers"
          : "note: canonical content • partial reading • no spoilers"}
      </p>
    </div>
  );
}
