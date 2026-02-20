"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CANON_ENTITIES, CANON_EVENTS, CORE_TRANSMISSIONS } from "../../lib/bookCanon";
import { pulseDwell, readResidualState, resetWorldState, restrictedUnlocks, trackCoreSession } from "../../lib/worldState";

function NeuralMap() {
  const nodes = useMemo(() => CANON_ENTITIES.slice(0, 10), []);
  return (
    <div className="neural-map">
      {nodes.map((node, index) => (
        <span
          key={node.slug}
          className="node"
          style={{ left: `${10 + (index * 9) % 82}%`, top: `${12 + ((index * 17) % 68)}%`, animationDelay: `${index * 0.3}s` }}
        >
          {node.name}
        </span>
      ))}
    </div>
  );
}

export function CorePortal() {
  const [year, setYear] = useState(2044);
  const [query, setQuery] = useState("");
  const [debug, setDebug] = useState(false);
  const [residual, setResidual] = useState(readResidualState());
  const [unlockState, setUnlockState] = useState(restrictedUnlocks());

  useEffect(() => {
    trackCoreSession("/core");
    const params = new URLSearchParams(window.location.search);
    setDebug(params.get("debug") === "1");
    const t = window.setInterval(() => {
      pulseDwell();
      setResidual(readResidualState());
      setUnlockState(restrictedUnlocks());
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const selectedEvent = CANON_EVENTS.find((item) => item.year === year) || CANON_EVENTS[0];

  const searchRows = CANON_ENTITIES.filter((entity) => {
    const target = `${entity.name} ${(entity.aliases || []).join(" ")}`.toLowerCase();
    return target.includes(query.toLowerCase());
  }).slice(0, 8);

  return (
    <main className="core-shell">
      <header className="core-header">
        <p>PORTAL // IRREVERSO</p>
        <p>integrity: {(99.2 - residual.integrityDrop).toFixed(2)}% | instance: {residual.learning ? "learning" : "stable"}</p>
      </header>

      <section className="core-panel">
        <p className="panel-title">TEMPORAL NAVIGATOR</p>
        <div className="timeline">{CANON_EVENTS.map((event) => <button key={event.year} onClick={() => setYear(event.year)} className={event.year === year ? "active" : ""}>{event.year}</button>)}</div>
        <div className="scan-card"><p>{selectedEvent.title}</p>{selectedEvent.details.map((detail) => <p key={detail}>{detail}</p>)}</div>
      </section>

      <section className="core-panel">
        <p className="panel-title">DOSSIER SEARCH</p>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="buscar entidade, termo, lugar" className="terminal-input" />
        <div className="search-results">{searchRows.map((item) => <Link key={item.slug} href={`/core/dossier/${item.slug}`}>{item.name}</Link>)}</div>
      </section>

      <section className="core-panel">
        <p className="panel-title">NEURAL MAP</p>
        <NeuralMap />
      </section>

      <section className="core-panel">
        <p className="panel-title">TRANSMISSIONS</p>
        {CORE_TRANSMISSIONS.map((tx) => <article key={tx.id} className="tx"><p>{tx.title}</p>{tx.body.map((line) => <p key={line}>{line}</p>)}</article>)}
      </section>

      <section className="core-panel restricted">
        <p className="panel-title">RESTRICTED ARCHIVES // unlocked {unlockState.unlockedCount}/3</p>
        <div className="restricted-grid">
          <article>{unlockState.visitsUnlock ? "BLOCO A LIBERADO" : "[REDACTED] visits ≥ 2"}</article>
          <article>{unlockState.breachUnlock ? "BLOCO B LIBERADO" : "[REDACTED] breach seen"}</article>
          <article>{unlockState.dwellUnlock ? "BLOCO C LIBERADO" : "[REDACTED] dwell ≥ 60s"}</article>
        </div>
      </section>

      {debug ? (
        <aside className="debug-panel">
          <button onClick={() => { localStorage.setItem("irreverso.debug.forceBreach", "1"); window.location.href = "/?anomaly=1"; }}>triggerBreach</button>
          <button onClick={() => { resetWorldState(); window.location.href = "/"; }}>resetSeen</button>
          <button onClick={() => localStorage.setItem("irreverso.debug.unlockAll", "1")}>unlockAllRestricted</button>
        </aside>
      ) : null}
    </main>
  );
}
