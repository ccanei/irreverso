"use client";

import { ReactNode, useMemo, useState } from "react";
import { detectLang, I18N, type Lang } from "@/lib/i18n";
import HiddenMenu from "@/components/core/HiddenMenu";
import RightRail from "@/components/core/RightRail";
import Timeline from "@/components/core/Timeline";
import EntityCore from "@/components/core/EntityCore";
import CanonSearch from "@/components/core/CanonSearch";

export default function CoreShell({ children }: { children: ReactNode }) {
  const lang = useMemo<Lang>(() => detectLang(), []);
  const T = I18N[lang];
  const [year, setYear] = useState(2026);

  return (
    <div className="coreRoot">
      <div className="coreBg" aria-hidden="true" />
      <HiddenMenu lang={lang} />

      <div className="coreGrid">
        <aside className="coreLeft">
          <Timeline lang={lang} activeYear={year} onPickYear={setYear} />
        </aside>

        <main className="coreCenter">
          <header className="coreHeader">
            <div>
              <div className="coreTitle">{T.coreTitle}</div>
              <div className="coreSub">{T.subtitle}</div>
            </div>
            <div className="coreHint">{T.hint}</div>
          </header>

          <div className="entityWrap">
            <EntityCore lang={lang} year={year} />
          </div>

          <div className="searchBox">
            <CanonSearch lang={lang} year={year} />
          </div>

          <div className="coreBody">{children}</div>
        </main>

        <aside className="coreRight">
          <RightRail lang={lang} year={year} />
        </aside>
      </div>
    </div>
  );
}
