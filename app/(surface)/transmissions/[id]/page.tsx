"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addEvent } from "../../../../lib/presence";
import { calculateUnlockedIds, findTransmissionById, markTransmissionAsRead } from "../../../../lib/transmissions";

export default function TransmissionDetailPage({ params }: { params: { id: string } }) {
  const tx = findTransmissionById(params.id);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!tx) return;
    const unlocked = calculateUnlockedIds();
    const canOpen = unlocked.has(tx.id);
    setAllowed(canOpen);
    if (canOpen) {
      markTransmissionAsRead(tx.id);
      addEvent(`transmission_read:${tx.id}`);
    }
  }, [tx]);

  if (!tx) {
    return <p>TX absent.</p>;
  }

  return (
    <section>
      <p className="section-head">{tx.title}</p>
      {allowed ? tx.body.map((line) => <p key={line}>{line}</p>) : <p>TX locked // integrity gate</p>}
      <Link href="/transmissions">return transmissions</Link>
    </section>
  );
}
