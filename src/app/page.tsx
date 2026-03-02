"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BootSequence from "@/components/ui/BootSequence";

const STORAGE_KEY = "nuve_last_access";
const DAYS_30_MS = 30 * 24 * 60 * 60 * 1000;

function getHost() {
  if (typeof window === "undefined") return "";
  return window.location.hostname.toLowerCase();
}

function readLastAccess(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(STORAGE_KEY);
  const n = Number(raw || "0");
  return Number.isFinite(n) ? n : 0;
}

function isRecent(last: number) {
  const now = Date.now();
  return last > 0 && now - last < DAYS_30_MS;
}

export default function Home() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"boot" | "skip" | "direct">("boot");

  useEffect(() => {
    const host = getHost();

    // Domínios que entram direto no CORE (sem boot)
    const isDirect =
      host === "nuve.network" ||
      host.endsWith(".nuve.network");

    if (isDirect) {
      // marca acesso mesmo assim
      localStorage.setItem(STORAGE_KEY, String(Date.now()));
      setMode("direct");
      setReady(true);
      return;
    }

    // irreversouniverse: decide boot vs skip baseado no último acesso
    const last = readLastAccess();
    const recent = isRecent(last);

    // ✅ só atualiza o last_access depois que decidiu o modo
    // (pra não “auto-fazer recente” na mesma visita)
    localStorage.setItem(STORAGE_KEY, String(Date.now()));

    setMode(recent ? "skip" : "boot");
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (mode === "direct") {
      router.replace("/core?entry=direct&handshake=bypassed");
      return;
    }

    if (mode === "skip") {
      router.replace("/core");
      return;
    }
  }, [ready, mode, router]);

  if (!ready) return null;

  // direct/skip: já redirecionou
  if (mode === "direct" || mode === "skip") return null;

  // boot: roda sequência e depois /core (sem temp_access)
  return (
    <BootSequence
      durationMs={15000}
      onFinish={() => router.replace("/core")}
    />
  );
}