"use client";

import { useEffect, useState } from "react";

type InstanceState = "active" | "observing" | "learning";

export function SystemStatus({ integrityOffset, learningUntil }: { integrityOffset: number; learningUntil: number }) {
  const [latency, setLatency] = useState(44);
  const [integrity, setIntegrity] = useState(99.42);
  const [variance, setVariance] = useState(0.22);
  const [instance, setInstance] = useState<InstanceState>("active");

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = Date.now();
      setLatency((prev) => Math.max(18, Math.min(89, prev + (Math.random() - 0.5) * 9)));
      setVariance((prev) => Math.max(0.1, Math.min(2.8, prev + (Math.random() - 0.5) * 0.16)));
      setIntegrity((prev) => Math.max(97.2, Math.min(99.96, prev + (Math.random() - 0.5) * 0.04 + integrityOffset)));
      setInstance(now < learningUntil ? "learning" : Math.random() > 0.55 ? "observing" : "active");
    }, 1500);

    return () => window.clearInterval(timer);
  }, [integrityOffset, learningUntil]);

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
