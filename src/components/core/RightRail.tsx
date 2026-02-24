"use client";

import { useMemo } from "react";
import { I18N, type Lang } from "@/lib/i18n";

function randHex(n = 8) {
  return Math.random().toString(16).slice(2, 2 + n).toUpperCase();
}
function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function RightRail({ lang, year }: { lang: Lang; year: number }) {
  const T = I18N[lang];

  const telemetry = useMemo(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const region = tz.split("/")[0] || "EDGE";
    const d = new Date();
    const stamp = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(
      d.getMinutes()
    )}`;
    const build = `IRR.${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}-${randHex(6)}`;
    const inst = `NUVE_CORE_${randHex(4)} • RELAY_${randHex(4)} • OBS_${randHex(4)}`;
    const uptime = `${(96 + Math.random() * 3.8).toFixed(2)}%`;
    const access = randHex(12);

    return { tz, region, stamp, build, inst, uptime, access };
  }, []);

  return (
    <div>
      <div className="rightRailTitle">
        {T.instance.toUpperCase()} • {year}
      </div>

      <div className="kv">
        <div className="k">{T.region}</div>
        <div className="v">{telemetry.region}</div>
      </div>

      <div className="kv">
        <div className="k">tz</div>
        <div className="v">{telemetry.tz}</div>
      </div>

      <div className="kv">
        <div className="k">{T.build}</div>
        <div className="v">{telemetry.build}</div>
      </div>

      <div className="kv">
        <div className="k">{T.uptime}</div>
        <div className="v">{telemetry.uptime}</div>
      </div>

      <div className="kv">
        <div className="k">access</div>
        <div className="v">{telemetry.access}</div>
      </div>

      <div className="kv">
        <div className="k">mesh</div>
        <div className="v">{telemetry.inst}</div>
      </div>

      <div className="vertRail">
        {telemetry.stamp} • {T.timeline.toUpperCase()} • {year} • NUVE
      </div>
    </div>
  );
}
