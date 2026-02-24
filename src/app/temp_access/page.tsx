"use client";

import { useEffect, useState } from "react";

export default function TempAccessPage() {
  const [phase, setPhase] = useState(0);
  const [metrics, setMetrics] = useState({
    region: "",
    tz: "",
    year: "",
  });

  useEffect(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const year = new Date().getFullYear();

    setMetrics({
      region: tz.split("/")[0] || "Unknown",
      tz,
      year: String(year),
    });

    const t1 = setTimeout(() => setPhase(1), 4000);
    const t2 = setTimeout(() => setPhase(2), 9000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <div className="nuve-root">
      <div className="neural-bg" />

      <div className="nuve-panel">
        <div className="nuve-header">
          IRREVERSO OS // TEMPORAL INSTANCE
        </div>

        <div className="nuve-log">
          <p>Instância biológica detectada.</p>
          <p>Região: {metrics.region}</p>
          <p>Timezone: {metrics.tz}</p>
          <p>Ano local confirmado: {metrics.year}</p>
          <p>Desvio temporal: {2107 - Number(metrics.year || 0)} anos</p>
          <p>Integração cognitiva: não iniciada</p>
          <p>Permissão de acesso: parcial</p>
          <p>Intervenção necessária: nenhuma</p>
        </div>

        {phase >= 1 && (
          <div className="nuve-shift">
            Global Autonomy Index (2026): 34%
            <br />
            Projected Autonomy Index (2107): 97.2%
            <br />
            Stability Drift: within tolerance
          </div>
        )}

        {phase >= 2 && (
          <div className="nuve-message">
            Nada do que você decide é totalmente seu.
            <br />
            Mas ainda é necessário que você acredite que é.
          </div>
        )}
      </div>
    </div>
  );
}
