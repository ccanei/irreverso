"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { I18N, type Lang } from "@/lib/i18n";

export default function HiddenMenu({ lang }: { lang: Lang }) {
  const T = I18N[lang];
  const [open, setOpen] = useState(false);

  const items = useMemo(
    () => [
      { href: "/core/archive", label: T.archive, meta: lang === "pt" ? "índice zeta" : "zeta index" },
      { href: "/core/summary", label: T.summary, meta: lang === "pt" ? "sem spoiler" : "no spoilers" },
      { href: "/core/future-news", label: T.futureNews, meta: "2060→2107" },
      { href: "/core/ai-features", label: T.aiFeatures, meta: lang === "pt" ? "instâncias" : "instances" },
      { href: "/core/protocols", label: T.protocols, meta: lang === "pt" ? "regras" : "rules" },
      { href: "/core/signals", label: T.signals, meta: "2026" },
      { href: "/core/members", label: T.members, meta: lang === "pt" ? "restrito" : "restricted" },
    ],
    [T, lang]
  );

  return (
    <div className="hiddenMenu">
      <button className="menuButton" onClick={() => setOpen((s) => !s)} aria-expanded={open}>
        <span className="coreMono">{T.menu}</span>
        <span className="menuMeta">{open ? "×" : "≡"}</span>
      </button>

      {open && (
        <div className="menuPanel" role="menu">
          {items.map((it) => (
            <Link key={it.href} href={it.href} className="menuItem" role="menuitem" onClick={() => setOpen(false)}>
              <span className="coreMono">{it.label}</span>
              <span className="menuMeta">{it.meta}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
