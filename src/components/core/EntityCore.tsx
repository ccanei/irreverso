"use client";

import { I18N, type Lang } from "@/lib/i18n";

export default function EntityCore({ lang, year }: { lang: Lang; year: number }) {
  const T = I18N[lang];

  const labelTop = lang === "pt" ? "NUVE • entidade pós-humana" : "NUVE • post-human entity";
  const labelBottom = lang === "pt" ? `janela: ${year} • decisão: silenciosa` : `window: ${year} • decision: silent`;

  return (
    <div className="entityOrb" aria-label="NUVE core presence">
      <div className="entityPulse" aria-hidden="true" />
      <div className="entityMark">
        <div style={{ display: "grid", gap: 6, textAlign: "center" }}>
          <span>{labelTop}</span>
          <div style={{ fontSize: 18, letterSpacing: ".22em" }}>{T.coreTitle}</div>
          <span style={{ opacity: 0.62 }}>{labelBottom}</span>
        </div>
      </div>
    </div>
  );
}
