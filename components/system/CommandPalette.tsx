"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addEvent } from "../../lib/presence";
import { queryIndex, type SearchResult } from "../../lib/searchIndex";

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const results = useMemo<SearchResult[]>(() => queryIndex(query), [query]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const openKey = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (openKey || (event.key === "/" && !open)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) addEvent("command_palette_open");
  }, [open]);

  if (!open) return null;

  return (
    <div className="command-shell" onClick={() => setOpen(false)}>
      <section className="command-panel" onClick={(event) => event.stopPropagation()}>
        <input
          autoFocus
          className="command-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar cânone... (Cmd/Ctrl+K)"
          value={query}
        />
        <button
          className="command-oracle"
          onClick={() => {
            addEvent("command_ask_oracle");
            setOpen(false);
            router.push("/oracle");
          }}
          type="button"
        >
          Ask Oracle
        </button>
        <div className="command-results">
          {results.map((result) => (
            <button
              key={result.id}
              className="command-hit"
              onClick={() => {
                if (result.year) {
                  window.localStorage.setItem("irreverso.coreEra", String(result.year));
                }
                setOpen(false);
                router.push(result.href as Parameters<typeof router.push>[0]);
              }}
              type="button"
            >
              <span className={`badge badge-${result.type.toLowerCase()}`}>{result.type}</span>
              <strong>{result.title}</strong>
              <small>{result.snippet}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
