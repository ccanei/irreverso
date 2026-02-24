"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BootSequence from "@/components/ui/BootSequence";

const STORAGE_KEY = "irreverso:lastSeen";
const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

export default function Home() {
  const router = useRouter();
  const [showBoot, setShowBoot] = useState(false);

  useEffect(() => {
    const now = Date.now();
    const lastSeen = Number(localStorage.getItem(STORAGE_KEY) || "0");
    const recentlyVisited =
      lastSeen > 0 && now - lastSeen < DAYS_30_MS;

    if (recentlyVisited) {
      // Atualiza timestamp
      localStorage.setItem(STORAGE_KEY, String(now));

      // Redireciona direto (sem boot)
      router.replace("/temp_access");
      return;
    }

    // Primeira visita ou passou de 30 dias
    setShowBoot(true);
  }, [router]);

  const handleFinish = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    router.replace("/temp_access");
  };

  if (!showBoot) {
    return null;
  }

  return (
    <BootSequence
      durationMs={15000}
      onFinish={handleFinish}
    />
  );
}