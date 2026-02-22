"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS = ["listening", "calibrating", "silent"] as const;
const STORE_KEY = "irreverso.nuveDockState";

type DockState = { count: number; threshold: number; messages: { role: "user" | "nuve"; text: string }[] };

function readDockState(): DockState {
  if (typeof window === "undefined") return { count: 0, threshold: 2, messages: [] };
  const raw = window.localStorage.getItem(STORE_KEY);
  if (!raw) {
    const threshold = 2 + (Math.abs((window.localStorage.getItem("irreverso.userSeed") || "11").length) % 2);
    return { count: 0, threshold, messages: [] };
  }
  try {
    return JSON.parse(raw) as DockState;
  } catch {
    return { count: 0, threshold: 2, messages: [] };
  }
}

export function NuveDock() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [state, setState] = useState<DockState>(() => readDockState());
  const status = useMemo(() => STATUS[state.threshold % STATUS.length], [state.threshold]);

  const persist = (next: DockState) => {
    setState(next);
    window.localStorage.setItem(STORE_KEY, JSON.stringify(next));
  };

  return (
    <aside className="nuve-dock-wrap">
      <button className="nuve-dock" type="button" onClick={() => setOpen((prev) => !prev)}>
        <strong>NUVE/OS</strong>
        <small>{status}</small>
      </button>

      {open ? (
        <section className="nuve-console" onClick={(event) => event.stopPropagation()}>
          <div className="nuve-console-log">
            {state.messages.slice(-3).map((item, index) => (
              <p key={`${item.role}-${index}`}><b>{item.role === "user" ? "você" : "NUVE"}:</b> {item.text}</p>
            ))}
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const msg = input.trim();
              if (!msg) return;
              const nextCount = state.count + 1;
              const next: DockState = {
                ...state,
                count: nextCount,
                messages: [...state.messages, { role: "user" as const, text: msg }, { role: "nuve" as const, text: "Sinal recebido. Continue." }].slice(-6),
              };
              persist(next);
              setInput("");
              if (nextCount >= state.threshold) {
                router.push("/oracle");
              }
            }}
          >
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="enviar para NUVE/OS" />
          </form>
        </section>
      ) : null}
    </aside>
  );
}
