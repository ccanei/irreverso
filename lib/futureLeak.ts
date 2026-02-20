import { addEvent, readEventsTrail, readPresence, writePresence } from "./presence";

const DAY_MS = 86_400_000;
const COOLDOWN_MS = 72 * 60 * 60 * 1000;
const DOMINION_PHASE_KEY = "irreverso.dominionPhase";
const BREACH_SEEN_KEY = "irreverso.breachSeen";
const TAKEOVER_SEEN_KEY = "irreverso.takeoverSeen";
const ELIGIBLE_SESSIONS_KEY = "irreverso.eligibleSessions";
const LAST_EVENT_AT_KEY = "irreverso.lastDominionEventAt";

const FORCE_AFTER_ELIGIBLE_SESSIONS = 5;

type InterfaceClass = "legacy" | "transitional" | "pre-implant";

export type FutureLeakResidual = {
  createdAt: number;
  expiresAt: number;
  integrityDelta: number;
  forceLearningUntil: number;
  applied: boolean;
};

export type FutureLeakSnapshot = {
  level: number;
  seenCount: number;
  lastAt: number;
  eligibleAt: number | null;
  eligibleSessions: number;
  residual: FutureLeakResidual | null;
  lastSequenceSig: string;
};

export type FutureLeakDecision = {
  shouldTrigger: boolean;
  nextLevel: number;
};

export type RareHistoricalDecision = {
  shouldTrigger: boolean;
};

export type FutureLeakScript = {
  lines: string[];
  signature: string;
};

export type RareHistoricalScript = {
  lines: string[];
  signature: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function asFinite(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function deterministicChance(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return ((hash >>> 0) % 10_000) / 10_000;
}

function readNumber(key: string, fallback: number) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  return asFinite(raw, fallback);
}

function writeNumber(key: string, value: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, String(Math.trunc(value)));
}

function readResidual(now: number): FutureLeakResidual | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem("irreverso.eventResidual");
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FutureLeakResidual>;
    const createdAt = asFinite(parsed.createdAt, 0);
    const expiresAt = asFinite(parsed.expiresAt, 0);
    const integrityDelta = asFinite(parsed.integrityDelta, 0);
    const forceLearningUntil = asFinite(parsed.forceLearningUntil, 0);

    if (expiresAt <= now || createdAt <= 0) {
      window.localStorage.removeItem("irreverso.eventResidual");
      return null;
    }

    return {
      createdAt,
      expiresAt,
      integrityDelta,
      forceLearningUntil,
      applied: Boolean(parsed.applied),
    };
  } catch {
    window.localStorage.removeItem("irreverso.eventResidual");
    return null;
  }
}

function writeResidual(residual: FutureLeakResidual) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("irreverso.eventResidual", JSON.stringify(residual));
}

function hasNarrativeAccess() {
  const events = readEventsTrail().slice(-10);
  return events.some((event) =>
    ["route_layer", "layer_read", "route_signals", "route_transmissions", "route_archive"].includes(event.type),
  );
}

function readDominionPhase() {
  if (typeof window === "undefined") {
    return 0;
  }

  return clamp(Math.trunc(readNumber(DOMINION_PHASE_KEY, 0)), 0, 2);
}

function writeDominionPhase(phase: number) {
  writeNumber(DOMINION_PHASE_KEY, clamp(Math.trunc(phase), 0, 2));
}

export function readFutureLeak(now = Date.now()): FutureLeakSnapshot {
  return {
    level: readDominionPhase(),
    seenCount: Math.max(0, Math.trunc(readNumber(BREACH_SEEN_KEY, 0))) + Math.max(0, Math.trunc(readNumber(TAKEOVER_SEEN_KEY, 0))),
    lastAt: Math.max(0, Math.trunc(readNumber(LAST_EVENT_AT_KEY, 0))),
    eligibleAt: null,
    eligibleSessions: Math.max(0, Math.trunc(readNumber(ELIGIBLE_SESSIONS_KEY, 0))),
    residual: readResidual(now),
    lastSequenceSig: "",
  };
}

function sessionEligible(now: number) {
  const presence = readPresence(now);
  return presence.visits >= 3 && presence.dwellTime >= 20_000 && hasNarrativeAccess();
}

function inCooldown(now: number) {
  const lastAt = Math.max(0, Math.trunc(readNumber(LAST_EVENT_AT_KEY, 0)));
  return lastAt > 0 && now - lastAt < COOLDOWN_MS;
}

export function decideFutureLeak(now = Date.now()): FutureLeakDecision {
  if (typeof window === "undefined") {
    return { shouldTrigger: false, nextLevel: 0 };
  }

  if (!sessionEligible(now) || inCooldown(now)) {
    return { shouldTrigger: false, nextLevel: readDominionPhase() };
  }

  const eligibleSessions = Math.max(0, Math.trunc(readNumber(ELIGIBLE_SESSIONS_KEY, 0))) + 1;
  writeNumber(ELIGIBLE_SESSIONS_KEY, eligibleSessions);

  const presence = readPresence(now);
  const roll = deterministicChance(`${presence.firstSeen}:${presence.visits}:${presence.dwellTime}:${eligibleSessions}:${Math.floor(now / DAY_MS)}`);
  const forced = eligibleSessions >= FORCE_AFTER_ELIGIBLE_SESSIONS;

  if (!forced && roll >= 0.1) {
    return { shouldTrigger: false, nextLevel: readDominionPhase() };
  }

  writeNumber(ELIGIBLE_SESSIONS_KEY, 0);
  return { shouldTrigger: true, nextLevel: 1 };
}

export function decideRareHistoricalEvent(now = Date.now()): RareHistoricalDecision {
  if (typeof window === "undefined") {
    return { shouldTrigger: false };
  }

  if (!sessionEligible(now) || inCooldown(now)) {
    return { shouldTrigger: false };
  }

  const phase = readDominionPhase();
  if (phase < 1) {
    return { shouldTrigger: false };
  }

  const presence = readPresence(now);
  const takeoverSeen = Math.max(0, Math.trunc(readNumber(TAKEOVER_SEEN_KEY, 0)));
  const eligibleSessions = Math.max(0, Math.trunc(readNumber(ELIGIBLE_SESSIONS_KEY, 0)));
  const roll = deterministicChance(`${presence.firstSeen}:${presence.visits}:${takeoverSeen}:${eligibleSessions}:${now}:takeover`);

  return { shouldTrigger: takeoverSeen === 0 ? roll < 0.022 : roll < 0.012 };
}

function interfaceClass(): InterfaceClass {
  if (typeof window === "undefined") {
    return "legacy";
  }

  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const width = window.innerWidth;

  if (coarse && width <= 820) {
    return "pre-implant";
  }

  if (width <= 1180) {
    return "transitional";
  }

  return "legacy";
}

const breachFragments = [
  "You are earlier than you should be.",
  "This layer was not scheduled for you.",
  "Decision architecture recalculating.",
  "SynthTech > decision architecture active",
  "freedom redirected",
  "variance accepted",
];

function pickBreachFragments(seed: string) {
  return breachFragments
    .map((line, index) => ({ line, score: deterministicChance(`${seed}:${line}:${index}`) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 4)
    .map((item) => item.line);
}

export function buildFutureLeakScript(level: number, visits: number, now = Date.now()): FutureLeakScript {
  const localTime = new Date(now).toLocaleTimeString([], { hour12: false });
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
  const uiClass = interfaceClass();
  const seed = `${level}:${visits}:${Math.floor(now / DAY_MS)}`;

  const lines = [
    `LOCAL TIME: ${localTime}`,
    `TIMEZONE: ${timezone}`,
    `INTERFACE CLASS: ${uiClass}`,
    ...pickBreachFragments(seed),
    "UNAUTHORIZED TEMPORAL ACCESS",
    "ROLLBACK INITIATED",
  ];

  return {
    lines,
    signature: lines.join("|"),
  };
}

const historicalTimeline = [
  "1983 > rede isolada",
  "1997 > protocolos globais",
  "2007 > interface portátil dominante",
  "2025 > obsolescência prevista",
  "2035 > emergência declarada",
  "2044 > ponto irreversível",
  "2107 > ...",
];

const historicalVariants = [
  "1983 > enclave analógico mantido",
  "1997 > sincronização planetária iniciada",
  "2007 > dispositivo pessoal torna-se norma",
  "2025 > camada anterior degradada",
  "2035 > contingência cognitiva aberta",
  "2044 > irreversibilidade confirmada",
  "2107 > janela sem retorno",
];

export function buildRareHistoricalScript(now = Date.now()): RareHistoricalScript {
  const presence = readPresence(now);
  const day = Math.floor(now / DAY_MS);
  const primary = historicalTimeline.map((line, index) => ({
    line,
    score: deterministicChance(`${presence.firstSeen}:${day}:${index}:a`),
  }));
  const secondary = historicalVariants.map((line, index) => ({
    line,
    score: deterministicChance(`${presence.firstSeen}:${day}:${index}:b`),
  }));

  const merged = [...primary.slice(0, 4), ...secondary.slice(4)]
    .sort((a, b) => a.score - b.score)
    .map((item) => item.line);

  const lines = [...merged, "UNAUTHORIZED TEMPORAL ACCESS", "ROLLBACK INITIATED"];
  return { lines, signature: lines.join("|") };
}

export function markFutureLeakTriggered(level: number, _signature: string, now = Date.now()) {
  if (typeof window === "undefined") {
    return;
  }

  const currentSeen = Math.max(0, Math.trunc(readNumber(BREACH_SEEN_KEY, 0)));
  writeNumber(BREACH_SEEN_KEY, currentSeen + 1);
  writeDominionPhase(Math.max(level, 1));
  writeNumber(LAST_EVENT_AT_KEY, now);

  writeResidual({
    createdAt: now,
    expiresAt: now + DAY_MS,
    integrityDelta: -0.23,
    forceLearningUntil: now + 20_000,
    applied: false,
  });

  addEvent("temporal_breach", now);
}

export function markRareHistoricalEvent(_signature: string, now = Date.now()) {
  if (typeof window === "undefined") {
    return;
  }

  const currentSeen = Math.max(0, Math.trunc(readNumber(TAKEOVER_SEEN_KEY, 0)));
  writeNumber(TAKEOVER_SEEN_KEY, currentSeen + 1);
  writeDominionPhase(2);
  writeNumber(LAST_EVENT_AT_KEY, now);

  writeResidual({
    createdAt: now,
    expiresAt: now + DAY_MS,
    integrityDelta: -0.31,
    forceLearningUntil: now + 20_000,
    applied: false,
  });

  addEvent("historical_takeover", now);
}

export function completeFutureLeakRollback(now = Date.now()) {
  addEvent("rollback_success", now);
}

export function applyFutureLeakResidual(now = Date.now()) {
  if (typeof window === "undefined") {
    return { integrityDelta: 0, forceLearning: false };
  }

  const residual = readResidual(now);
  if (!residual) {
    return { integrityDelta: 0, forceLearning: false };
  }

  if (!residual.applied) {
    const presence = readPresence(now);
    const nextIntegrity = clamp(Number((presence.integrity + residual.integrityDelta).toFixed(2)), 98.8, 99.99);

    writePresence({
      ...presence,
      integrity: nextIntegrity,
      lastSeen: now,
    });

    writeResidual({ ...residual, applied: true });
  }

  return {
    integrityDelta: residual.integrityDelta,
    forceLearning: now <= residual.forceLearningUntil,
  };
}
