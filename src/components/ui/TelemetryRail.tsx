"use client";
import { useEffect, useMemo, useState } from "react";

function pick(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function TelemetryRail() {
  const regions = useMemo(() => ["LATAM-WEST", "EU-CENTRAL", "APAC-NODE"], []);
  const [region, setRegion] = useState("LATAM-WEST");
  const [latency, setLatency] = useState(24);

  useEffect(() => {
    setRegion(pick(regions));
    const i = setInterval(() => {
      setLatency((v) => Math.max(8, Math.min(120, v + (Math.random() > 0.5 ? 3 : -3) + Math.round(Math.random() * 4))));
    }, 14000);
    return () => clearInterval(i);
  }, [regions]);

  const build = "IRREVERSO_OS v3.7.4";
  const last = new Date().toISOString().slice(0, 10).replaceAll("-", ".");

  return (
    <aside className="telemetryRail" aria-label="System Telemetry">
      <div className="telemetryVertical">
        <span>INSTANCE: NUVE_CORE_0110</span>
        <span>REGION: {region}</span>
        <span>BUILD: {build}</span>
        <span>LAST UPDATE: {last}</span>
        <span>LATENCY: {latency}ms</span>
      </div>
    </aside>
  );
}
