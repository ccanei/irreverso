"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addEvent } from "../../../lib/presence";
import { calculateUnlockedIds, readReadTransmissions, transmissions } from "../../../lib/transmissions";

export default function TransmissionsPage() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [read, setRead] = useState<Set<string>>(new Set());

  useEffect(() => {
    addEvent("route_transmissions");
    setUnlocked(calculateUnlockedIds());
    setRead(readReadTransmissions());
  }, []);

  const rows = useMemo(
    () =>
      transmissions.map((tx) => ({
        ...tx,
        locked: !unlocked.has(tx.id),
        seen: read.has(tx.id),
      })),
    [read, unlocked],
  );

  return (
    <section>
      <p className="section-head">TRANSMISSIONS // leak registry</p>
      {rows.map((tx) => (
        <article key={tx.id} className={tx.locked ? "tx tx--locked" : "tx"}>
          <p>{tx.title}</p>
          <p>{tx.signal}</p>
          {tx.locked ? <p>locked // integrity gate</p> : <Link href={`/transmissions/${tx.id}`}>{tx.snippet}</Link>}
          {tx.seen ? <p>read</p> : null}
        </article>
      ))}
    </section>
  );
}
