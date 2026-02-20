"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addEvent } from "../../../lib/presence";
import { calculateTransmissionUnlockState, readReadTransmissions, transmissions } from "../../../lib/transmissions";

export default function TransmissionsPage() {
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    addEvent("route_transmissions");

    const unlockState = calculateTransmissionUnlockState();
    setUnlockedIds(unlockState.unlockedIds);
    setReadIds(readReadTransmissions());
  }, []);

  const feed = useMemo(
    () =>
      transmissions.map((item) => {
        const isUnlocked = unlockedIds.has(item.id);
        const isRead = readIds.has(item.id);

        return {
          ...item,
          isUnlocked,
          isRead,
          displayTitle: isUnlocked ? item.title : "transmission: locked",
          displaySnippet: isUnlocked
            ? isRead && item.readSnippet
              ? item.readSnippet
              : item.snippet
            : "available after alignment",
        };
      }),
    [readIds, unlockedIds],
  );

  return (
    <main className="center">
      <div className="terminal transmissions-shell">
        <p className="transmissions-headline">transmissions // pós-livro</p>

        <ul className="transmissions-list" aria-label="feed de transmissões">
          {feed.map((item) => (
            <li key={item.id} className={item.isUnlocked ? "transmission-card" : "transmission-card transmission-card--locked"}>
              <p className="transmission-meta">
                {item.timestamp} · {item.signal}
              </p>

              {item.isUnlocked ? (
                <Link href={`/transmissions/${item.id}`} className="transmission-link">
                  {item.displayTitle}
                </Link>
              ) : (
                <p className="transmission-link transmission-link--locked">{item.displayTitle}</p>
              )}

              <p className="transmission-snippet">{item.displaySnippet}</p>
              {item.isRead ? <p className="transmission-read">read</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
