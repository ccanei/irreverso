"use client";

import { useEffect, useMemo, useState } from "react";

type InstanceState = "active" | "observing" | "learning";

export function SystemStatus({
  integrityOffset,
  learningUntil,
  residualIntegrity,
}: {
  integrityOffset: number;
  learningUntil: number;
  residualIntegrity: number;
}) {
  const [latency, setLatency] = useState(44);
  const [integrity, setIntegrity] = useState(99.42);
  const [variance, setVariance] = useState(0.22);
  const [instance, setInstance] = useState<InstanceState>("active");

  const floor = useMemo(() => Math.max(95.2, 97.2 - residualIntegrity), [residualIntegrity]);
  const ceiling = useMemo(() => Math.max(floor + 0.8, 99.96 - residualIntegrity / 2), [floor, residualIntegrity]);

  useEffect(() => {
    setIntegrity((prev) => Math.max(floor, Math.min(ceiling, prev - residualIntegrity * 0.02)));
  }, [ceiling, floor, residualIntegrity]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      setLatency((prev) => Math.max(18, Math.min(89, prev + (Math.random() - 0.5) * 9)));
      setVariance((prev) => Math.max(0.1, Math.min(2.8, prev + (Math.random() - 0.5) * 0.16)));
      setIntegrity((prev) => Math.max(floor, Math.min(ceiling, prev + (Math.random() - 0.5) * 0.04 + integrityOffset)));
      setInstance(now < learningUntil ? "learning" : Math.random() > 0.55 ? "observing" : "active");
    }, 1500);

    return () => window.clearInterval(timer);
  }, [ceiling, floor, integrityOffset, learningUntil]);

  return (
    <div className="panel panel-status">
      <p className="panel-title">STATUS DO SISTEMA</p>
      <p>integrity: {integrity.toFixed(2)}%</p>
      <p>latency: {Math.round(latency)}ms</p>
      <p>instance: {instance}</p>
      <p>drift: {(100 - integrity).toFixed(2)}</p>
      <p>variance: {variance.toFixed(2)}</p>
    </div>
  );
}
