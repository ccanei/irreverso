export type PresenceState = {
  visits: number;
  lastRoute: string;
  dwellTime: number;
  firstSeen: number;
  lastSeen: number;
  integrity: number;
  variance: number;
  focusLossCount: number;
  routeTrail: string[];
};

export type PresenceEvent = {
  type: string;
  t: number;
};

const STORAGE_KEY = "irreverso.presence";
const EVENTS_TRAIL_KEY = "irreverso.eventsTrail";
const EVENTS_TRAIL_MAX_ITEMS = 12;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function asFiniteNumber(value: unknown, fallback: number) {
  const next = typeof value === "number" ? value : Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function asRouteTrail(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as string[];
  }

  const routes = value.filter((item): item is string => typeof item === "string" && item.length > 0);
  return routes.slice(-5);
}

function asEventsTrail(value: unknown) {
  if (!Array.isArray(value)) {
    return [] as PresenceEvent[];
  }

  const events = value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const nextType = (item as { type?: unknown }).type;
      const nextTime = (item as { t?: unknown }).t;

      if (typeof nextType !== "string" || nextType.length === 0) {
        return null;
      }

      const t = asFiniteNumber(nextTime, NaN);
      if (!Number.isFinite(t)) {
        return null;
      }

      return {
        type: nextType,
        t,
      };
    })
    .filter((item): item is PresenceEvent => item !== null);

  return events.slice(-EVENTS_TRAIL_MAX_ITEMS);
}

function driftIntegrity(current: number) {
  const next = current - (0.01 + Math.random() * 0.06);
  return clamp(Number(next.toFixed(2)), 98.8, 99.99);
}

function fallbackState(now: number): PresenceState {
  return {
    visits: 0,
    lastRoute: "",
    dwellTime: 0,
    firstSeen: now,
    lastSeen: now,
    integrity: 99.94,
    variance: 0,
    focusLossCount: 0,
    routeTrail: [],
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
    const firstSeen = asFiniteNumber(parsed.firstSeen, now);
    const lastSeen = asFiniteNumber(parsed.lastSeen, firstSeen);
    const integrity = clamp(asFiniteNumber(parsed.integrity, 99.94), 98.8, 99.99);

    return {
      visits: Math.max(0, Math.trunc(asFiniteNumber(parsed.visits, 0))),
      lastRoute: typeof parsed.lastRoute === "string" ? parsed.lastRoute : "",
      dwellTime: Math.max(0, Math.round(asFiniteNumber(parsed.dwellTime, 0))),
      firstSeen,
      lastSeen,
      integrity,
      variance: Math.max(0, Math.trunc(asFiniteNumber(parsed.variance, 0))),
      focusLossCount: Math.max(0, Math.trunc(asFiniteNumber(parsed.focusLossCount, 0))),
      routeTrail: asRouteTrail(parsed.routeTrail),
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

function trailWith(routeTrail: string[], route: string) {
  const trimmed = route.trim();
  if (!trimmed) {
    return routeTrail;
  }

  if (routeTrail[routeTrail.length - 1] === trimmed) {
    return routeTrail.slice(-5);
  }

  const nextTrail = [...routeTrail, trimmed];
  return nextTrail.slice(-5);
}

export function trackVisit(route: string, now = Date.now()): PresenceState {
  const previous = readPresence(now);

  return writePresence({
    ...previous,
    visits: previous.visits + 1,
    lastRoute: route,
    firstSeen: previous.firstSeen || now,
    lastSeen: now,
    integrity: driftIntegrity(previous.integrity),
    routeTrail: trailWith(previous.routeTrail, route),
  });
}

export function addDwellTime(ms: number, now = Date.now()): PresenceState {
  const previous = readPresence(now);

  return writePresence({
    ...previous,
    dwellTime: previous.dwellTime + Math.max(0, Math.round(ms)),
    firstSeen: previous.firstSeen || now,
    lastSeen: now,
  });
}

export function increaseVariance(step = 1, now = Date.now()): PresenceState {
  const previous = readPresence(now);

  return writePresence({
    ...previous,
    variance: previous.variance + Math.max(0, Math.trunc(step)),
    lastSeen: now,
  });
}

export function registerFocusLoss(now = Date.now()): PresenceState {
  const previous = readPresence(now);

  return writePresence({
    ...previous,
    focusLossCount: previous.focusLossCount + 1,
    lastSeen: now,
  });
}

export function pushRouteTrail(route: string, now = Date.now()): PresenceState {
  const previous = readPresence(now);

  return writePresence({
    ...previous,
    lastRoute: route || previous.lastRoute,
    routeTrail: trailWith(previous.routeTrail, route),
    lastSeen: now,
  });
}

export function readEventsTrail(): PresenceEvent[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(EVENTS_TRAIL_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return asEventsTrail(parsed);
  } catch {
    return [];
  }
}

export function addEvent(type: string, now = Date.now()): PresenceEvent[] {
  if (typeof window === "undefined") {
    return [];
  }

  const current = readEventsTrail();
  const next = [...current, { type, t: now }].slice(-EVENTS_TRAIL_MAX_ITEMS);
  window.localStorage.setItem(EVENTS_TRAIL_KEY, JSON.stringify(next));
  return next;
}
