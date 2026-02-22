"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { answer, type OracleAnswer } from "../../lib/oracle";
import { addEvent } from "../../lib/presence";
import { useSystemState } from "../../components/system/SystemProvider";

type OracleHistoryItem = {
  q: string;
  a: OracleAnswer;
};

export default function OraclePage() {
  const { activeEra } = useSystemState();
  const [q, setQ] = useState("");
  const [history, setHistory] = useState<OracleHistoryItem[]>([]);

  useEffect(() => {
    const raw = window.localStorage.getItem("irreverso.oracle.history");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as OracleHistoryItem[];
      if (Array.isArray(parsed)) setHistory(parsed.slice(0, 6));
    } catch {
      // ignore malformed local history
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("irreverso.oracle.history", JSON.stringify(history.slice(0, 6)));
  }, [history]);

  const latest = useMemo(() => history[0], [history]);

  return (
    <main className="oracle-shell">
      <section className="oracle-panel scan">
        <p className="panel-title">ORACLE // IA ARG</p>
        <p className="oracle-sub">instância limitada • últimas 6 interações</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!q.trim()) return;
            addEvent("oracle_query");
            const a = answer(q, { era: activeEra, route: "/oracle" });
            if (a.kind === "future_denied") addEvent("oracle_future_denied");
            if (a.kind === "canon_hint") addEvent("oracle_canon_hint");
            setHistory((prev) => [{ q, a }, ...prev].slice(0, 6));
            setQ("");
          }}
        >
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Faça uma pergunta ao Oracle" />
          <button type="submit">consultar</button>
        </form>

        {latest ? (
          <article className="oracle-answer">
            <p>{latest.a.text}</p>
            {latest.a.citations?.map((citation) => (
              <small key={citation}>{citation}</small>
            ))}
          </article>
        ) : null}

        <div className="oracle-history">
          {history.map((item, idx) => (
            <article key={`${item.q}-${idx}`}>
              <p className="oracle-q">Q: {item.q}</p>
              <p className="oracle-a">A: {item.a.text}</p>
            </article>
          ))}
        </div>

        <div className="oracle-actions">
          <button
            onClick={() => {
              window.localStorage.removeItem("irreverso.oracle.history");
              setHistory([]);
            }}
            type="button"
          >
            limpar rastros
          </button>
          <Link href="/core">voltar ao kernel</Link>
        </div>
      </section>
    </main>
  );
}
