"use client";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { useState } from "react";
import Background from "./Background";
import NuveEntity from "./NuveEntity";

export default function Scene() {
  const [dpr, setDpr] = useState(1.25);

  return (
    <Canvas
      className="r3fCanvas"
      dpr={dpr}
      camera={{ position: [0, 0, 2.2], fov: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} />
      <Background />
      <NuveEntity />
    </Canvas>
  );
}
