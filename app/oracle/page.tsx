"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function OraclePage() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!question.trim()) return;
    setAnswer("arquivo ainda não disponível");
  };

  return (
    <main className="oracle-shell">
      <section className="oracle-panel scan">
        <p className="panel-title">oracle</p>
        <form onSubmit={onSubmit}>
          <input
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="faça sua pergunta"
            value={question}
          />
          <button type="submit">perguntar</button>
        </form>

        {answer ? (
          <article className="oracle-answer">
            <p>{answer}</p>
          </article>
        ) : null}

        <div className="oracle-actions">
          <Link href="/core">voltar ao core</Link>
        </div>
      </section>
    </main>
  );
}
