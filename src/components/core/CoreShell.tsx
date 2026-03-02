"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import HiddenMenu from "@/components/core/HiddenMenu";
import RightRail from "@/components/core/RightRail";
import Timeline from "@/components/core/Timeline";
import EntityCore from "@/components/core/EntityCore";
import CanonSearch from "@/components/core/CanonSearch";
import { detectLang, I18N, type Lang } from "@/lib/i18n";

type Telemetry = {
  lat: string;
  loss: string;
  uptime: string;
  drift: string;
  canon: string;
  region: string;
  tz: string;
  build: string;
  access: string;
  inst: string;
};

function makeSeed() {
  const raw = globalThis.crypto?.randomUUID?.() ?? String(Math.random()).slice(2);
  return raw.replaceAll("-", "").slice(0, 7).toUpperCase();
}

function makeTelemetry(year: number): Telemetry {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Sao_Paulo";
  const region = tz.split("/")[0] || "AMERICA";

  const lat = `${Math.floor(18 + Math.random() * 18)}ms`;
  const loss = `${(Math.random() * 0.12).toFixed(2)}%`;
  const uptime = `${(94 + Math.random() * 5).toFixed(1)}%`;
  const drift = `${(Math.random() * 0.9).toFixed(3)}`;

  const build = `IRR.${new Date().getFullYear()}.${String(new Date().getMonth() + 1).padStart(2, "0")}.${String(
    new Date().getDate()
  ).padStart(2, "0")}-${makeSeed()}`;

  return {
    lat,
    loss,
    uptime,
    drift,
    canon: "partial",
    region,
    tz,
    build,
    access: makeSeed() + makeSeed(),
    inst: `NUVE_CORE_${makeSeed()}`,
  };
}

export default function CoreShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const sp = useSearchParams();

  const isHome = pathname === "/core" || pathname === "/core/";

  // ✅ evita hydration mismatch: só decide idioma depois de montar
  const [mounted, setMounted] = useState(false);
  const [lang, setLang] = useState<Lang>("en");

  const T = useMemo(() => I18N[lang], [lang]);

  const [year, setYear] = useState(2026);

  // client-only values
  const [seed, setSeed] = useState<string>("");
  const [tel, setTel] = useState<Telemetry | null>(null);

  useEffect(() => {
    setMounted(true);
    setLang(detectLang());
    setSeed(makeSeed());
    setTel(makeTelemetry(year));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    setTel(makeTelemetry(year));
  }, [mounted, year]);

  // ✅ “linhas extras” quando vier do nuve.network (entry=direct)
  const entry = sp.get("entry"); // direct
  const handshake = sp.get("handshake"); // bypassed

  const extraLine =
    mounted && entry === "direct"
      ? lang === "pt"
        ? `entry: direct-node • handshake: ${handshake ?? "ok"} • trust: elevado • latency: 0.01ms`
        : `entry: direct-node • handshake: ${handshake ?? "ok"} • trust: elevated • latency: 0.01ms`
      : "";

  // Enquanto não montou, evita texto com idioma errado no SSR
  if (!mounted) {
    return (
      <div className={`coreHUDRoot ${isHome ? "isHomeOnly" : ""}`}>
        <div className="nuveWallpaper" aria-hidden="true" />
        <footer className="hudBottom">
          <div className="bottomLeft">
            <span className="dot" aria-hidden="true" />
            <span className="brand">NUVE OS</span>
          </div>
          <div className="bottomCenter">
            <span className="pill">
              window <b>{isHome ? 2034 : year}</b>
            </span>
          </div>
          <div className="bottomRight">
            <span className="pill">
              seed <b>—</b>
            </span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className={`coreHUDRoot ${isHome ? "isHomeOnly" : ""}`}>
      {/* FULL wallpaper: NUVE */}
      <div className="nuveWallpaper" aria-hidden="true" />

      {/* MENU (top-left) — se quiser manter no HOME, descomente aqui:
      <div className="hudMenu">
        <HiddenMenu lang={lang} />
      </div>
      */}

      {/* HOME ONLY: não renderiza o resto */}
      {!isHome && (
        <>
          <aside className="coreLeft">
            <Timeline lang={lang} activeYear={year} onPickYear={setYear} />
          </aside>

          <main className="coreCenter">
            <header className="hudTop">
              <div className="hudLeft">
                <div className="hudBrand">
                  <span className="hudLogoDot" aria-hidden="true" />
                  <span className="hudTitle">NUVE OS</span>
                  <span className="hudSub">
                    {lang === "pt" ? "registro autorizado • nuve ativa" : "authorized record • nuve active"}
                  </span>
                </div>
              </div>

              <div className="hudCenter">
                <div className="hudPill">
                  {lang === "pt" ? "passe o cursor • toque • a nuve observa" : "hover • touch • nuve observes"}
                </div>
              </div>

              <div className="hudRight" />
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
        </>
      )}

      {/* BARRA INFERIOR — sempre */}
      <footer className="hudBottom">
        <div className="bottomLeft">
          <span className="dot" aria-hidden="true" />
          <span className="brand">NUVE OS</span>
          <span className="sub">{lang === "pt" ? "registro autorizado • nuve ativa" : "authorized record • nuve active"}</span>
        </div>

        <div className="bottomCenter">
          <span className="pill">
            window <b>{isHome ? 2034 : year}</b>
          </span>
          <span className="pill">
            lat <b>{tel ? tel.lat : "—"}</b>
          </span>
          <span className="pill">
            loss <b>{tel ? tel.loss : "—"}</b>
          </span>
          <span className="pill">
            uptime <b>{tel ? tel.uptime : "—"}</b>
          </span>
          <span className="pill">
            drift <b>{tel ? tel.drift : "—"}</b>
          </span>

          {/* ✅ extra apenas no direct entry */}
          {extraLine ? <span className="pill subtle">{extraLine}</span> : null}
        </div>

        <div className="bottomRight">
          <span className="pill">
            seed <b>{seed || "—"}</b>
          </span>
          <span className="pill">
            canon <b>{tel ? tel.canon : "—"}</b>
          </span>
        </div>
      </footer>
    </div>
  );
}