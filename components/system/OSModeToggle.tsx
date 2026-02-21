"use client";

import { usePathname, useRouter } from "next/navigation";

type ModeRoute = "/core" | "/archive";

type OSMode = "core" | "archive";

function resolveMode(pathname: string): OSMode {
  return pathname.startsWith("/archive") ? "archive" : "core";
}

function jumpToMode(router: ReturnType<typeof useRouter>, destination: ModeRoute) {
  router.push(destination);
}

export function OSModeToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const mode = resolveMode(pathname);

  return (
    <div className="os-mode-toggle" role="group" aria-label="Navegação entre kernel e archive">
      <button
        aria-pressed={mode === "core"}
        className={`mode-option ${mode === "core" ? "active" : ""}`}
        onClick={() => jumpToMode(router, "/core")}
        type="button"
      >
        Kernel ativo
      </button>
      <button
        aria-pressed={mode === "archive"}
        className={`mode-option ${mode === "archive" ? "active" : ""}`}
        onClick={() => jumpToMode(router, "/archive")}
        type="button"
      >
        Archive Matrix
      </button>
    </div>
  );
}
