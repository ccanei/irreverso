"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type ModeRoute = "/core" | "/archive";

type OSMode = "core" | "archive";

function resolveMode(pathname: string): OSMode {
  return pathname.startsWith("/archive") ? "archive" : "core";
}

export function OSModeToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const [transitioning, setTransitioning] = useState(false);
  const [target, setTarget] = useState<ModeRoute | null>(null);
  const mode = resolveMode(pathname);

  const handleToggle = useCallback(() => {
    const destination: ModeRoute = mode === "core" ? "/archive" : "/core";
    setTransitioning(true);
    setTarget(destination);
  }, [mode]);

  useEffect(() => {
    if (!transitioning || !target) return;

    const pushTimer = window.setTimeout(() => {
      router.push(target);
    }, 210);

    const resetTimer = window.setTimeout(() => {
      setTransitioning(false);
      setTarget(null);
    }, 470);

    return () => {
      window.clearTimeout(pushTimer);
      window.clearTimeout(resetTimer);
    };
  }, [router, target, transitioning]);

  return (
    <>
      <button className="os-mode-toggle" onClick={handleToggle} type="button">
        {mode === "core" ? "Ativar Archive Matrix" : "Kernel ativo"}
      </button>
      <div aria-hidden="true" className={`os-mode-transition ${transitioning ? "active" : ""}`} />
    </>
  );
}
