"use client";

import { useEffect, useMemo, useState } from "react";

type Lang = "pt" | "en";

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}

const DICT = {
  pt: {
    header: "IRREVERSO OS // INSTÂNCIA TEMPORAL",
    bioDetected: "Instância biológica detectada.",
    region: "Região",
    timezone: "Timezone",
    yearConfirmed: "Ano local confirmado",
    temporalDrift: "Desvio temporal",
    years: "anos",
    cognitive: "Integração cognitiva",
    notInitiated: "não iniciada",
    access: "Permissão de acesso",
    partial: "parcial",
    intervention: "Intervenção necessária",
    none: "nenhuma",
    gai2026: "Índice Global de Autonomia (2026)",
    pai2107: "Índice Projetado de Autonomia (2107)",
    stability: "Desvio de Estabilidade",
    within: "dentro da tolerância",
    msg1: "Nada do que você decide é totalmente seu.",
    msg2: "Mas ainda é necessário que você acredite que é.",
    unknown: "Desconhecido",
  },
  en: {
    header: "IRREVERSO OS // TEMPORAL INSTANCE",
    bioDetected: "Biological instance detected.",
    region: "Region",
    timezone: "Timezone",
    yearConfirmed: "Local year confirmed",
    temporalDrift: "Temporal drift",
    years: "years",
    cognitive: "Cognitive integration",
    notInitiated: "not initiated",
    access: "Access permission",
    partial: "partial",
    intervention: "Required intervention",
    none: "none",
    gai2026: "Global Autonomy Index (2026)",
    pai2107: "Projected Autonomy Index (2107)",
    stability: "Stability drift",
    within: "within tolerance",
    msg1: "Nothing you decide is entirely yours.",
    msg2: "Yet you still need to believe it is.",
    unknown: "Unknown",
  },
} as const;

function formatPct(n: number, lang: Lang) {
  // pt -> 97,2% | en -> 97.2%
  return `${n.toLocaleString(lang === "pt" ? "pt-BR" : "en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })}%`;
}

export default function TempAccessPage() {
  const lang = useMemo(() => detectLang(), []);
  const T = useMemo(() => DICT[lang], [lang]);

  const [phase, setPhase] = useState(0);
  const [metrics, setMetrics] = useState({
    region: "",
    tz: "",
    year: "",
  });

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const year = new Date().getFullYear();

    setMetrics({
      region: tz.split("/")[0] || T.unknown,
      tz: tz || T.unknown,
      year: String(year),
    });

    const t1 = setTimeout(() => setPhase(1), 4000);
    const t2 = setTimeout(() => setPhase(2), 9000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [T.unknown]);

  const yearNum = Number(metrics.year || 0);
  const drift = yearNum > 0 ? Math.max(0, 2107 - yearNum) : 0;

  return (
    <div className="nuve-root">
      <div className="neural-bg" />

      <div className="nuve-panel">
        <div className="nuve-header">{T.header}</div>

        <div className="nuve-log">
          <p>{T.bioDetected}</p>
          <p>
            {T.region}: {metrics.region}
          </p>
          <p>
            {T.timezone}: {metrics.tz}
          </p>
          <p>
            {T.yearConfirmed}: {metrics.year}
          </p>
          <p>
            {T.temporalDrift}: {drift} {T.years}
          </p>
          <p>
            {T.cognitive}: {T.notInitiated}
          </p>
          <p>
            {T.access}: {T.partial}
          </p>
          <p>
            {T.intervention}: {T.none}
          </p>
        </div>

        {phase >= 1 && (
          <div className="nuve-shift">
            {T.gai2026}: {formatPct(34, lang)}
            <br />
            {T.pai2107}: {formatPct(97.2, lang)}
            <br />
            {T.stability}: {T.within}
          </div>
        )}

        {phase >= 2 && (
          <div className="nuve-message">
            {T.msg1}
            <br />
            {T.msg2}
          </div>
        )}
      </div>
    </div>
  );
}
