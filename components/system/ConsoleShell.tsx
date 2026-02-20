"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { BootSequence } from "./BootSequence";
import { DominionEvents } from "./DominionEvents";
import { LiveFeed } from "./LiveFeed";
import { SystemStatus } from "./SystemStatus";
import { addEvent, trackVisit } from "../../lib/presence";

const LAYER_ROUTES: Route[] = ["/", "/signals", "/archive", "/transmissions"];

export function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [learningUntil, setLearningUntil] = useState(0);
  const [acceleratedUntil, setAcceleratedUntil] = useState(0);
  const [integrityOffset, setIntegrityOffset] = useState(0);

  useEffect(() => {
    trackVisit(pathname || "/");
    addEvent(`route:${pathname}`);
  }, [pathname]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index <= 3) {
        router.push(LAYER_ROUTES[index]);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [router]);

  const cards = useMemo(
    () => [
      { id: "01", title: "signals layer", href: "/signals" as Route, text: "sinais mínimos, sem contexto expandido" },
      { id: "02", title: "archive layer", href: "/archive" as Route, text: "fragmentos confidenciais e blocos redacted" },
      { id: "03", title: "transmissions", href: "/transmissions" as Route, text: "registros vazados em cadeia" },
    ],
    [],
  );

  return (
    <>
      <BootSequence />
      <div className="console-bg" aria-hidden />
      <main className="console-shell">
        <LiveFeed acceleratedUntil={acceleratedUntil} />
        <section className="panel panel-center">
          <p className="panel-title">CAMADA ATIVA // {pathname || "/"}</p>
          <div className="dossier-cards">
            {cards.map((card) => (
              <Link key={card.id} href={card.href} className="dossier-card">
                <p>{card.id}</p>
                <strong>{card.title}</strong>
                <span>{card.text}</span>
              </Link>
            ))}
          </div>
          <div className="layer-content">{children}</div>
          <p className="key-hint">keys: [1]root [2]signals [3]archive [4]transmissions</p>
        </section>
        <SystemStatus integrityOffset={integrityOffset} learningUntil={learningUntil} />
      </main>
      <DominionEvents
        onRollback={({ integrityDrop, learningForMs, accelerateForMs }) => {
          const now = Date.now();
          setIntegrityOffset(integrityDrop);
          setLearningUntil(now + learningForMs);
          setAcceleratedUntil(now + accelerateForMs);
          window.setTimeout(() => setIntegrityOffset(0), 1500);
        }}
      />
      <div className="nuve-watermark">NUVE</div>
    </>
  );
}
