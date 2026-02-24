"use client";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useIrreverso } from "@/lib/store";

export default function NuveEntity() {
  const { year } = useIrreverso();
  const group = useRef<THREE.Group>(null);

  const intensity = useMemo(() => {
    const t = Math.min(1, Math.max(0, (year - 1983) / (2107 - 1983)));
    return 0.22 + t * 0.55;
  }, [year]);

  useFrame(({ clock }) => {
    if (!group.current) return;
    const e = clock.elapsedTime;
    group.current.rotation.z = e * 0.08;
    group.current.scale.setScalar(1 + Math.sin(e * 0.8) * 0.01);
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh>
        <ringGeometry args={[0.28, 0.34, 64]} />
        <meshBasicMaterial color="#0C0A12" />
      </mesh>

      <mesh>
        <ringGeometry args={[0.38, 0.41, 64]} />
        <meshBasicMaterial
          color={new THREE.Color().setHSL(0.72, 0.95, intensity)}
          transparent
          opacity={0.22}
        />
      </mesh>
    </group>
  );
}
