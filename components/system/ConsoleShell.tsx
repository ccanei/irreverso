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
import {
  getLearningUntil,
  getMode,
  getResidualIntegrity,
  localTelemetry,
  randomQuotePair,
  resetSeen,
  setLearningUntil,
  setResidualIntegrity,
  setSeen,
  SiteMode,
} from "../../lib/dominion";

const LAYER_ROUTES: Route[] = ["/", "/signals", "/archive", "/transmissions"];

function BreachSequence({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    const telemetry = localTelemetry();
    const [q1, q2] = randomQuotePair();
    setLines([
      `LOCAL TIME // ${telemetry.localTime}`,
      `TIMEZONE // ${telemetry.timezone}`,
      `LANGUAGE // ${telemetry.language}`,
      `OS // ${telemetry.os}`,
      `DEVICE CLASS // ${telemetry.deviceClass}`,
      "SynthTech // decision architecture active",
      q1,
      q2,
      "UNAUTHORIZED TEMPORAL ACCESS",
      "ROLLBACK INITIATED",
    ]);

    const finalizeTimer = window.setTimeout(() => {
      setSeen();
      const nextResidual = getResidualIntegrity() + 0.12;
      setResidualIntegrity(nextResidual);
      setLearningUntil(Date.now() + 20_000);
      window.setTimeout(() => onComplete(), 300);
    }, 9_500);

    return () => window.clearTimeout(finalizeTimer);
  }, [onComplete]);

  return (
    <section className="dominion-overlay dominion-overlay--breach">
      <div>
        {lines.map((line, index) => (
          <p key={`${line}-${index}`}>{line}</p>
        ))}
      </div>
    </section>
  );
}

function StableConsole({
  children,
  integrityOffset,
  learningUntil,
  residualIntegrity,
  onForceBreach,
}: {
  children: ReactNode;
  integrityOffset: number;
  learningUntil: number;
  residualIntegrity: number;
  onForceBreach: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [acceleratedUntil, setAcceleratedUntil] = useState(0);
  const [debug, setDebug] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDebug(params.get("debug") === "1");
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
        <SystemStatus integrityOffset={integrityOffset} learningUntil={learningUntil} residualIntegrity={residualIntegrity} />
      </main>
      <DominionEvents
        allowBreach={false}
        onRollback={({ integrityDrop, learningForMs, accelerateForMs }) => {
          const now = Date.now();
          setAcceleratedUntil(now + accelerateForMs);
          setLearningUntil(now + learningForMs);
          setResidualIntegrity(Math.max(0, getResidualIntegrity() + Math.abs(integrityDrop) / 2));
        }}
      />
      {debug ? (
        <aside className="debug-panel">
          <button onClick={onForceBreach}>force breach</button>
          <button
            onClick={() => {
              resetSeen();
              setResidualIntegrity(0);
              setLearningUntil(0);
            }}
          >
            reset seen
          </button>
          <button
            onClick={() => {
              Object.keys(window.localStorage)
                .filter((key) => key.startsWith("irreverso."))
                .forEach((key) => window.localStorage.removeItem(key));
              resetSeen();
            }}
          >
            reset irreverso.*
          </button>
        </aside>
      ) : null}
      <div className="nuve-watermark">NUVE</div>
    </>
  );
}

export function ConsoleShell({ children, initialMode }: { children: ReactNode; initialMode: SiteMode }) {
  const [mode, setMode] = useState<SiteMode>(initialMode);
  const [learningUntil, setLearningUntilState] = useState(0);
  const [integrityOffset, setIntegrityOffset] = useState(0);
  const [residualIntegrity, setResidualIntegrityState] = useState(0);

  useEffect(() => {
    setMode(getMode());
    setResidualIntegrityState(getResidualIntegrity());
    setLearningUntilState(getLearningUntil());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setResidualIntegrityState(getResidualIntegrity());
      setLearningUntilState(getLearningUntil());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const updateLearning = (until: number) => {
    setLearningUntil(until);
    setLearningUntilState(until);
  };

  const updateResidual = (residual: number) => {
    setResidualIntegrity(residual);
    setResidualIntegrityState(residual);
  };

  if (mode === "breach") {
    return (
      <>
        <BreachSequence
          onComplete={() => {
            updateResidual(getResidualIntegrity());
            updateLearning(getLearningUntil());
            setIntegrityOffset(-0.12);
            window.setTimeout(() => setIntegrityOffset(0), 1500);
            setMode("stable");
          }}
        />
        <div className="breach-blackframe" aria-hidden />
      </>
    );
  }

  return (
    <StableConsole
      integrityOffset={integrityOffset}
      learningUntil={learningUntil}
      residualIntegrity={residualIntegrity}
      onForceBreach={() => setMode("breach")}
    >
      {children}
    </StableConsole>
  );
}
