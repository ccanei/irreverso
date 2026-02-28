"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Lang = "pt" | "en";

function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}

const TEXT = {
  pt: {
    header: "NUVE OS // INSTÂNCIA TEMPORAL",
    bio: "Instância biológica detectada.",
    region: "Região",
    tz: "Timezone",
    year: "Ano local confirmado",
    drift: "Desvio temporal",
    years: "anos",
    cog: "Integração cognitiva",
    cogNo: "não iniciada",
    access: "Permissão de acesso",
    partial: "parcial",
    intervention: "Intervenção necessária",
    none: "nenhuma",
    gai: "Índice Global de Autonomia (2026)",
    pai: "Índice Projetado (2107)",
    stability: "Deriva de estabilidade",
    within: "dentro da tolerância",
    elegant: "Processo de consciência: latente",
    redirect: "Redirecionamento automático para /core em",
    seconds: "segundos.",
  },
  en: {
    header: "NUVE OS // TEMPORAL INSTANCE",
    bio: "Biological instance detected.",
    region: "Region",
    tz: "Timezone",
    year: "Local year confirmed",
    drift: "Temporal drift",
    years: "years",
    cog: "Cognitive integration",
    cogNo: "not initiated",
    access: "Access permission",
    partial: "partial",
    intervention: "Intervention required",
    none: "none",
    gai: "Global Autonomy Index (2026)",
    pai: "Projected Autonomy Index (2107)",
    stability: "Stability drift",
    within: "within tolerance",
    elegant: "Consciousness process: latent",
    redirect: "Automatic redirect to /core in",
    seconds: "seconds.",
  },
} as const;

export default function TempAccessPage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("en");
  const [phase, setPhase] = useState(0);
  const [countdown, setCountdown] = useState(15);

  const T = useMemo(() => TEXT[lang], [lang]);

  const [metrics, setMetrics] = useState({
    region: "",
    tz: "",
    year: "",
  });

  useEffect(() => {
    setLang(detectLang());

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
    const year = new Date().getFullYear();

    setMetrics({
      region: tz.split("/")[0] || "Unknown",
      tz,
      year: String(year),
    });

    // fases
    const t1 = window.setTimeout(() => setPhase(1), 5000);
    const t2 = window.setTimeout(() => setPhase(2), 10000);

    // redirect em 15 segundos
    const redirectTimer = window.setTimeout(() => {
      router.push("/core");
    }, 15000);

    // countdown
    const start = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, 15 - elapsed);
      setCountdown(remaining);
    }, 250);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(redirectTimer);
      window.clearInterval(interval);
    };
  }, [router]);

  const driftYears = 2107 - Number(metrics.year || 0);

  return (
    <div className="nuve-root">
      <div className="neural-bg" />

      <div className="nuve-panel">
        <div className="nuve-header">{T.header}</div>

        <div className="nuve-log">
          <p>{T.bio}</p>
          <p>
            {T.region}: {metrics.region || "—"}
          </p>
          <p>
            {T.tz}: {metrics.tz || "—"}
          </p>
          <p>
            {T.year}: {metrics.year || "—"}
          </p>
          <p>
            {T.drift}: {driftYears} {T.years}
          </p>
          <p>
            {T.cog}: {T.cogNo}
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
            {T.gai}: 34%
            <br />
            {T.pai}: 97.2%
            <br />
            {T.stability}: {T.within}
          </div>
        )}

        {phase >= 2 && (
          <div className="nuve-message">
            {/* alternativa elegante */}
            <p>{T.elegant}</p>

            {/* redirecionamento */}
            <p style={{ marginTop: "18px", opacity: 0.85 }}>
              {T.redirect} <b>{countdown}</b> {T.seconds}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}