"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { answer } from "../../lib/oracle";

type ChatEntry = { id: string; role: "user" | "system"; text: string };

export default function OraclePage() {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<ChatEntry[]>([]);

  const canSubmit = useMemo(() => question.trim().length > 0, [question]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = question.trim();
    if (!q) return;
    const response = answer(q, { route: "/oracle" });
    setHistory((prev) => ([...prev, { id: `${Date.now()}-q`, role: "user" as const, text: q }, { id: `${Date.now()}-a`, role: "system" as const, text: response.text }]).slice(-8));
    setQuestion("");
  };

  return (
    <main className="oracle-shell">
      <section className="oracle-panel scan">
        <p className="panel-title">NUVE/OS</p>
        <form onSubmit={onSubmit}>
          <input onChange={(event) => setQuestion(event.target.value)} placeholder="interrogar camada canônica" value={question} />
          <button type="submit" disabled={!canSubmit}>perguntar</button>
        </form>

        <div className="oracle-history">
          {history.map((entry) => (
            <article key={entry.id}>
              <strong>{entry.role === "user" ? "você" : "NUVE/OS"}</strong>
              <p>{entry.text}</p>
            </article>
          ))}
        </div>

        <div className="oracle-actions">
          <Link href="/core">voltar ao kernel</Link>
        </div>
      </section>
    </main>
  );
}
