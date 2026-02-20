export type PresenceState = {
  visits: number;
  lastRoute: string;
  dwellTime: number;
  firstSeen: number;
};

const STORAGE_KEY = "irreverso.presence";

function fallbackState(now: number): PresenceState {
  return {
    visits: 0,
    lastRoute: "",
    dwellTime: 0,
    firstSeen: now,
  };
}

export function readPresence(now = Date.now()): PresenceState {
  if (typeof window === "undefined") {
    return fallbackState(now);
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return fallbackState(now);
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PresenceState>;

    return {
      visits: Number.isFinite(parsed.visits) ? Number(parsed.visits) : 0,
      lastRoute: typeof parsed.lastRoute === "string" ? parsed.lastRoute : "",
      dwellTime: Number.isFinite(parsed.dwellTime) ? Number(parsed.dwellTime) : 0,
      firstSeen: Number.isFinite(parsed.firstSeen) ? Number(parsed.firstSeen) : now,
    };
  } catch {
    return fallbackState(now);
  }
}

export function writePresence(state: PresenceState): PresenceState {
  if (typeof window === "undefined") {
    return state;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

export function trackVisit(route: string, now = Date.now()): PresenceState {
  const previous = readPresence(now);

  return writePresence({
    ...previous,
    visits: previous.visits + 1,
    lastRoute: route,
    firstSeen: previous.firstSeen || now,
  });
}

export function addDwellTime(ms: number, now = Date.now()): PresenceState {
  const previous = readPresence(now);

  return writePresence({
    ...previous,
    dwellTime: previous.dwellTime + Math.max(0, Math.round(ms)),
    firstSeen: previous.firstSeen || now,
  });
}
