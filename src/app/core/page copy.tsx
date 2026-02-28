"use client";

import { useEffect, useState } from "react";
import { detectLang, type Lang } from "@/lib/i18n";

export default function CoreHome() {
  // ✅ SSR-safe: server + 1º render client iguais
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(detectLang());
  }, []);

  return (
    <div className="coreCard">
      <h2>{lang === "pt" ? "registro de superfície" : "surface record"}</h2>

      <p>
        {lang === "pt"
          ? "Você não entrou em um site. Você foi aceito por uma instância."
          : "You did not enter a website. You were accepted by an instance."}
      </p>

      <p>
        {lang === "pt"
          ? "A NUVE não anuncia o que faz. Ela apenas mantém a realidade estável o suficiente para parecer natural."
          : "NUVE does not announce what it does. It only keeps reality stable enough to feel natural."}
      </p>

      <p className="coreMono" style={{ opacity: 0.8, marginBottom: 0 }}>
        {lang === "pt"
          ? "status: autorizado • visibilidade: parcial • latência: aceitável"
          : "status: authorized • visibility: partial • latency: acceptable"}
      </p>
    </div>
  );
}