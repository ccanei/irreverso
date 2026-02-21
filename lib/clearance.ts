export const CLEARANCE_LEVELS = ["CIVIL", "OPERADOR", "ANALISTA", "ARQUIVISTA", "TESTEMUNHA", "IRREVERSO"] as const;

export type ClearanceLevel = (typeof CLEARANCE_LEVELS)[number];

export type ClearanceState = {
  interactions: number;
  erasVisited: number[];
  openedEntities: string[];
  sessionMs: number;
  level: ClearanceLevel;
  updatedAt: number;
};

export const CLEARANCE_STORAGE_KEY = "irreverso.clearance.v1";

const defaultState: ClearanceState = {
  interactions: 0,
  erasVisited: [],
  openedEntities: [],
  sessionMs: 0,
  level: "CIVIL",
  updatedAt: 0,
};

export function calculateClearanceLevel(state: Omit<ClearanceState, "level" | "updatedAt">): ClearanceLevel {
  const score =
    state.interactions * 2 +
    state.erasVisited.length * 8 +
    state.openedEntities.length * 3 +
    Math.floor(state.sessionMs / 60_000) * 2;

  if (score >= 160) return "IRREVERSO";
  if (score >= 110) return "TESTEMUNHA";
  if (score >= 80) return "ARQUIVISTA";
  if (score >= 45) return "ANALISTA";
  if (score >= 20) return "OPERADOR";
  return "CIVIL";
}

export function readClearance(): ClearanceState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(CLEARANCE_STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<ClearanceState>;
    const normalized: Omit<ClearanceState, "level" | "updatedAt"> = {
      interactions: Number(parsed.interactions || 0),
      erasVisited: Array.isArray(parsed.erasVisited) ? parsed.erasVisited.filter((era): era is number => typeof era === "number") : [],
      openedEntities: Array.isArray(parsed.openedEntities) ? parsed.openedEntities.filter((slug): slug is string => typeof slug === "string") : [],
      sessionMs: Number(parsed.sessionMs || 0),
    };
    return { ...normalized, level: calculateClearanceLevel(normalized), updatedAt: Number(parsed.updatedAt || 0) };
  } catch {
    return defaultState;
  }
}

export function writeClearance(state: ClearanceState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLEARANCE_STORAGE_KEY, JSON.stringify(state));
}

export function updateClearance(patch: Partial<Omit<ClearanceState, "level" | "updatedAt">>) {
  const current = readClearance();
  const merged: Omit<ClearanceState, "level" | "updatedAt"> = {
    interactions: patch.interactions ?? current.interactions,
    erasVisited: patch.erasVisited ?? current.erasVisited,
    openedEntities: patch.openedEntities ?? current.openedEntities,
    sessionMs: patch.sessionMs ?? current.sessionMs,
  };
  const next: ClearanceState = {
    ...merged,
    level: calculateClearanceLevel(merged),
    updatedAt: Date.now(),
  };
  writeClearance(next);
  return next;
}
