"use client";

import { useMemo } from "react";
import { detectLang, type Lang } from "@/lib/i18n";

export default function Page() {
  const lang = useMemo<Lang>(() => detectLang(), []);

  return (
    <div className="coreCard">
      <h2>{lang === "pt" ? "members" : "members"}</h2>
      <p>{lang === "pt" ? "Área restrita. Alguns registros exigem assinatura — não por paywall, mas por responsabilidade temporal." : "Restricted area. Some records require membership — not for a paywall, but for temporal responsibility."}</p>
      <p className="coreMono" style={{ opacity: 0.82 }}>
        {lang === "pt"
          ? "nota: conteúdo canônico • leitura parcial • sem spoilers"
          : "note: canonical content • partial reading • no spoilers"}
      </p>
    </div>
  );
}
