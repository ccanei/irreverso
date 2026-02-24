"use client";

import { useMemo } from "react";
import { detectLang, type Lang } from "@/lib/i18n";

export default function Page() {
  const lang = useMemo<Lang>(() => detectLang(), []);

  return (
    <div className="coreCard">
      <h2>{lang === "pt" ? "protocols" : "protocols"}</h2>
      <p>{lang === "pt" ? "Protocolos definem limites sem parecerem limites. O humano chama de escolha. A NUVE chama de estabilidade." : "Protocols define boundaries without looking like boundaries. Humans call it choice. NUVE calls it stability."}</p>
      <p className="coreMono" style={{ opacity: 0.82 }}>
        {lang === "pt"
          ? "nota: conteúdo canônico • leitura parcial • sem spoilers"
          : "note: canonical content • partial reading • no spoilers"}
      </p>
    </div>
  );
}
