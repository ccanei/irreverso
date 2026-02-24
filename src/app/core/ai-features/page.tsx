"use client";

import { useMemo } from "react";
import { detectLang, type Lang } from "@/lib/i18n";

export default function Page() {
  const lang = useMemo<Lang>(() => detectLang(), []);

  return (
    <div className="coreCard">
      <h2>{lang === "pt" ? "ai features" : "ai features"}</h2>
      <p>{lang === "pt" ? "Instâncias ativas. Camadas de decisão. Malha de modelos. A NUVE não é um modelo — é a arquitetura que decide como modelos viram mundo." : "Active instances. Decision layers. Model mesh. NUVE isn’t a model — it’s the architecture that decides how models become world."}</p>
      <p className="coreMono" style={{ opacity: 0.82 }}>
        {lang === "pt"
          ? "nota: conteúdo canônico • leitura parcial • sem spoilers"
          : "note: canonical content • partial reading • no spoilers"}
      </p>
    </div>
  );
}
