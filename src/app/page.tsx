"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BootSequence from "@/components/ui/BootSequence";

const STORAGE_KEY = "nuve_last_access";

function getHost() {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase();
}

export default function Home() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [directDomain, setDirectDomain] = useState(false);

  useEffect(() => {
    const host = getHost();

    // ✅ nuve.network (ou subdomínios) = entra direto no CORE
    const isDirect = host === "nuve.network" || host.endsWith(".nuve.network");
    setDirectDomain(isDirect);

    // Marca acesso (mantém, caso você queira usar depois)
    localStorage.setItem(STORAGE_KEY, String(Date.now()));

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (directDomain) {
      router.replace("/core?entry=direct&handshake=bypassed");
    }
  }, [ready, directDomain, router]);

  if (!ready) return null;

  // ✅ directDomain pula tudo, vai direto pro core
  if (directDomain) return null;

  // ✅ irreversouniverse SEMPRE mostra boot e depois vai pro core (sem temp_access)
  return (
    <BootSequence
      durationMs={15000}
      onFinish={() => {
        router.replace("/core");
      }}
    />
  );
}