"use client";

import { useEffect, useMemo, useState } from "react";
import { addEvent, readEventsTrail } from "../../../lib/presence";
import { CANON_QUOTES } from "../../../lib/dominion";

export default function Archive() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    addEvent("route_archive");
    const unlocked = readEventsTrail().some((event) => event.type.includes("breach") || event.type.includes("takeover"));
    setOpen(unlocked);
  }, []);

  const blocks = useMemo(
    () => [CANON_QUOTES[7], CANON_QUOTES[8], open ? CANON_QUOTES[12] : "[REDACTED BLOCK // waiting anomaly]"] ,
    [open],
  );

  return (
    <section>
      <p className="section-head">ARCHIVE // restricted</p>
      {blocks.map((line, index) => (
        <p key={`${line}-${index}`}>{line}</p>
      ))}
      <p>{open ? "access granted // anomaly" : "restricted"}</p>
    </section>
  );
}
