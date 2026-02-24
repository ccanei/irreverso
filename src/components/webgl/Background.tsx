"use client";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

export default function Background() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    // movimento mínimo de fundo (placeholder)
    mesh.current.rotation.z = Math.sin(clock.elapsedTime * 0.03) * 0.03;
  });

  return (
    <mesh ref={mesh} position={[0, 0, -1]}>
      <planeGeometry args={[6, 6, 1, 1]} />
      <meshBasicMaterial color="#05040A" />
    </mesh>
  );
}
