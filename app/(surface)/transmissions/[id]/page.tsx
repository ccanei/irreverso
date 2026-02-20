"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addEvent } from "../../../../lib/presence";
import {
  calculateTransmissionUnlockState,
  findTransmissionById,
  markTransmissionAsRead,
  readReadTransmissions,
} from "../../../../lib/transmissions";

type TransmissionDetailPageProps = {
  params: {
    id: string;
  };
};

export default function TransmissionDetailPage({ params }: TransmissionDetailPageProps) {
  const tx = findTransmissionById(params.id);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isRead, setIsRead] = useState(false);

  useEffect(() => {
    if (!tx) {
      return;
    }

    const unlockState = calculateTransmissionUnlockState();
    const unlocked = unlockState.unlockedIds.has(tx.id);
    setIsUnlocked(unlocked);

    if (!unlocked) {
      return;
    }

    addEvent(`transmission_read:${tx.id}`);
    markTransmissionAsRead(tx.id);
    setIsRead(readReadTransmissions().has(tx.id));
  }, [tx]);

  const bodyParts = useMemo(() => {
    if (!tx || !isUnlocked) {
      return [] as string[];
    }

    return tx.body.split(". ").filter((line) => line.trim().length > 0);
  }, [isUnlocked, tx]);

  if (!tx) {
    return (
      <main className="center">
        <div className="terminal terminal--narrow">
          <p>transmission not found</p>
          <p className="whisper">signal id absent</p>
          <Link href="/transmissions" className="enter">
            transmissions
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="center">
      <div className="terminal transmissions-shell">
        <p className="transmission-meta">
          {tx.timestamp} · {tx.signal}
        </p>
        <p className="transmission-title">{isUnlocked ? tx.title : "transmission: locked"}</p>

        {isUnlocked ? (
          <div className="transmission-body" aria-label="transmissão detalhada">
            {bodyParts.map((line, index) => (
              <p key={`${tx.id}-${index}`}>{line.trim().endsWith(".") ? line.trim() : `${line.trim()}.`}</p>
            ))}
          </div>
        ) : (
          <p className="transmission-snippet">available after alignment</p>
        )}

        <div className="quiet-links">
          <Link href="/transmissions" className="enter">
            transmissions
          </Link>
          {isRead ? <p className="transmission-read">read</p> : null}
        </div>
      </div>
    </main>
  );
}
