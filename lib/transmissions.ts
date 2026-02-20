import { CANON_QUOTES } from "./dominion";
import { readEventsTrail, readPresence } from "./presence";

export type Transmission = {
  id: string;
  title: string;
  signal: string;
  snippet: string;
  body: string[];
};

export const transmissions: Transmission[] = [
  { id: "tx-01", title: "TX-01 // internal register", signal: "confidential", snippet: CANON_QUOTES[0], body: [CANON_QUOTES[0], CANON_QUOTES[9], CANON_QUOTES[7]] },
  { id: "tx-02", title: "TX-02 // leak fragment", signal: "internal", snippet: CANON_QUOTES[1], body: [CANON_QUOTES[1], CANON_QUOTES[10], CANON_QUOTES[11]] },
  { id: "tx-03", title: "TX-03 // continuity", signal: "sealed", snippet: CANON_QUOTES[12], body: [CANON_QUOTES[12], CANON_QUOTES[13], CANON_QUOTES[4]] },
  { id: "tx-04", title: "TX-04 // redacted", signal: "gate", snippet: "integrity gate active", body: [CANON_QUOTES[5], CANON_QUOTES[6], CANON_QUOTES[8]] },
  { id: "tx-05", title: "TX-05 // machine witness", signal: "restricted", snippet: "machine witness unavailable", body: [CANON_QUOTES[14], CANON_QUOTES[15], CANON_QUOTES[16]] },
  { id: "tx-06", title: "TX-06 // integrity gate", signal: "restricted", snippet: "confidence threshold pending", body: [CANON_QUOTES[2], CANON_QUOTES[3], CANON_QUOTES[17]] },
];

const READ_TRANSMISSIONS_KEY = "irreverso.transmissions.read";

export function calculateUnlockedIds(now = Date.now()) {
  if (typeof window === "undefined") {
    return new Set(transmissions.slice(0, 3).map((item) => item.id));
  }

  const presence = readPresence(now);
  const events = readEventsTrail();
  const dwellPoints = presence.dwellTime > 20_000 ? 1 : 0;
  const visitsPoints = presence.visits > 2 ? 1 : 0;
  const eventPoints = events.some((event) => event.type.includes("breach") || event.type.includes("takeover")) ? 2 : 0;
  const routePoints = events.some((event) => event.type.includes("transmissions")) ? 1 : 0;

  const unlockedCount = Math.min(transmissions.length, 3 + dwellPoints + visitsPoints + routePoints + eventPoints);
  return new Set(transmissions.slice(0, unlockedCount).map((item) => item.id));
}

export function readReadTransmissions() {
  if (typeof window === "undefined") return new Set<string>();
  const raw = window.localStorage.getItem(READ_TRANSMISSIONS_KEY);
  if (!raw) return new Set<string>();
  try {
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set<string>();
  }
}

export function markTransmissionAsRead(id: string) {
  if (typeof window === "undefined") return;
  const read = readReadTransmissions();
  read.add(id);
  window.localStorage.setItem(READ_TRANSMISSIONS_KEY, JSON.stringify(Array.from(read)));
}

export function findTransmissionById(id: string) {
  return transmissions.find((item) => item.id === id);
}
