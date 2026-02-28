"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "@/lib/i18n";
import { I18N } from "@/lib/i18n";

type Props = {
  lang: Lang;
  year: number;
};

type Telemetry = {
  region: string;
  tz: string;
  build: string;
  uptime: string;
  access: string;
  inst: string;
};

function safeUpper(v: unknown, fallback = ""): string {
  const s = typeof v === "string" ? v : fallback;
  return (s || fallback).toUpperCase();
}

function randHex(len = 7) {
  const chars = "0123456789ABCDEF";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function RightRail({ lang, year }: Props) {
  const T = I18N?.[lang] ?? I18N.en;

  const [tel, setTel] = useState<Telemetry>({
    region: "UNKNOWN",
    tz: "UTC",
    build: `IRR.${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, "0")}.${String(
      new Date().getDate()
    ).padStart(2, "0")}-${randHex(5)}`,
    uptime: "99.90%",
    access: "PARTIAL",
    inst: `NUVE_CORE_${randHex(4)} • RELAY_${randHex(4)} • OBS_${randHex(4)}`,
  });

  useEffect(() => {
    // opcional: recalcula tz/region no client
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const region = (tz.split("/")[0] || "UNKNOWN").toUpperCase();
      setTel((p) => ({ ...p, tz, region }));
    } catch {
      // mantém defaults
    }
  }, []);

  const vertLine = useMemo(() => {
    // ✅ NÃO assume que T.* existe
    const lblInstance = safeUpper((T as any)?.instance, "INSTÂNCIA");
    const lblRegion = safeUpper((T as any)?.region, "REGIÃO");
    const lblTz = safeUpper((T as any)?.tz, "TZ");
    const lblBuild = safeUpper((T as any)?.build, "BUILD");
    const lblUptime = safeUpper((T as any)?.uptime, "ESTABILIDADE");
    const lblAccess = safeUpper((T as any)?.access, "ACCESS");
    const lblMesh = safeUpper((T as any)?.mesh, "MESH");

    // ✅ NÃO assume que tel.* existe
    const region = tel?.region ?? "UNKNOWN";
    const tz = tel?.tz ?? "UTC";
    const build = tel?.build ?? "IRR.UNKNOWN";
    const uptime = tel?.uptime ?? "—";
    const access = tel?.access ?? "—";
    const inst = tel?.inst ?? "NUVE_CORE";

    return `${lblInstance}: ${year} • ${lblRegion}: ${region} • ${lblTz}: ${tz} • ${lblBuild}: ${build} • ${lblUptime}: ${uptime} • ${lblAccess}: ${access} • ${lblMesh}: ${inst}`;
  }, [T, tel, year]);

  return (
    <aside className="rightRail">
      {/* sua UI normal (cards etc) pode continuar aqui */}
      {/* Linha vertical (CSS cuida da escrita em pé) */}
      <div className="rightRailVert" aria-label="telemetry">
        {vertLine}
      </div>
    </aside>
  );
}