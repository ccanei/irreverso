"use client";
import { useState } from "react";

export default function CanonSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  return (
    <div className={open ? "canonSearch open" : "canonSearch"}>
      <button className="canonBtn" onClick={() => setOpen((v) => !v)} aria-label="Search">
        ⌕
      </button>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="search canon…"
        className="canonInput"
      />
    </div>
  );
}
