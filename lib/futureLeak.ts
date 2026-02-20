import { addEvent, readEventsTrail, readPresence, writePresence } from "./presence";

const DAY_MS = 86_400_000;
const COOL_DOWN_MS = 72 * 60 * 60 * 1000;
const FORCED_AFTER_ELIGIBLE_SESSIONS = 4;
const MAX_LEVEL = 3;
const RARE_EVENT_KEY = "rareHistoricalEvent";

const STORAGE_KEYS = {
  level: "futureLeakLevel",
  lastAt: "futureLeakLastAt",
  seenCount: "futureLeakSeenCount",
  eligibleAt: "futureLeakEligibleAt",
  eligibleSessions: "futureLeakEligibleSessions",
  residual: "futureLeakResidual",
  lastSequenceSig: "futureLeakLastSequenceSig",
  recentSignatures: "futureLeakRecentSignatures",
} as const;

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

export type RareHistoricalScript = {
  lines: string[];
  signature: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function readNumber(key: string, fallback: number) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function writeNumber(key: string, value: number) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, String(value));
}

function readResidual(now: number): FutureLeakResidual | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.residual);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FutureLeakResidual>;
    const createdAt = Number(parsed.createdAt);
    const expiresAt = Number(parsed.expiresAt);
    const integrityDelta = Number(parsed.integrityDelta);
    const forceLearningUntil = Number(parsed.forceLearningUntil);
    const applied = Boolean(parsed.applied);

    if ([createdAt, expiresAt, integrityDelta, forceLearningUntil].every(Number.isFinite)) {
      if (expiresAt > now) {
        return {
          createdAt,
          expiresAt,
          integrityDelta,
          forceLearningUntil,
          applied,
        };
      }
    }
  } catch {
    return null;
  }

  window.localStorage.removeItem(STORAGE_KEYS.residual);
  return null;
}

export function readFutureLeak(now = Date.now()): FutureLeakSnapshot {
  if (typeof window === "undefined") {
    return {
      level: 0,
      seenCount: 0,
      lastAt: 0,
      eligibleAt: null,
      eligibleSessions: 0,
      residual: null,
      lastSequenceSig: "",
    };
  }

  const level = clamp(Math.trunc(readNumber(STORAGE_KEYS.level, 0)), 0, MAX_LEVEL);
  const seenCount = Math.max(0, Math.trunc(readNumber(STORAGE_KEYS.seenCount, 0)));
  const lastAt = Math.max(0, Math.trunc(readNumber(STORAGE_KEYS.lastAt, 0)));
  const eligibleRaw = readNumber(STORAGE_KEYS.eligibleAt, Number.NaN);
  const eligibleSessions = Math.max(0, Math.trunc(readNumber(STORAGE_KEYS.eligibleSessions, 0)));
  const lastSequenceSig = window.localStorage.getItem(STORAGE_KEYS.lastSequenceSig) || "";

  return {
    level,
    seenCount,
    lastAt,
    eligibleAt: Number.isFinite(eligibleRaw) ? eligibleRaw : null,
    eligibleSessions,
    residual: readResidual(now),
    lastSequenceSig,
  };
}

function hasLayerAccess() {
  return readEventsTrail().some((event) => event.type === "route_layer" || event.type === "layer_read");
}

function deterministicChance(seed: string) {
  let hash = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return ((hash >>> 0) % 10_000) / 10_000;
}

export function decideFutureLeak(now = Date.now()): FutureLeakDecision {
  if (typeof window === "undefined") {
    return { shouldTrigger: false, nextLevel: 0 };
  }

  const snapshot = readFutureLeak(now);
  const presence = readPresence(now);
  const daysSinceFirstSeen = Math.floor((now - presence.firstSeen) / DAY_MS);
  const eligibleByTimeOrVisits = presence.visits >= 3 || daysSinceFirstSeen >= 3;
  const eligible = eligibleByTimeOrVisits && hasLayerAccess();

  if (!eligible) {
    writeNumber(STORAGE_KEYS.eligibleSessions, 0);
    return { shouldTrigger: false, nextLevel: snapshot.level };
  }

  if (!snapshot.eligibleAt) {
    writeNumber(STORAGE_KEYS.eligibleAt, now);
  }

  const inCooldown = snapshot.lastAt > 0 && now - snapshot.lastAt < COOL_DOWN_MS;
  if (inCooldown) {
    return { shouldTrigger: false, nextLevel: snapshot.level };
  }

  const chance = snapshot.level === 0 ? 0.18 : 0.12;
  const nextEligibleSessions = snapshot.eligibleSessions + 1;
  writeNumber(STORAGE_KEYS.eligibleSessions, nextEligibleSessions);

  const forceByInevitability = nextEligibleSessions > FORCED_AFTER_ELIGIBLE_SESSIONS;
  const roll = deterministicChance(`${presence.firstSeen}:${presence.visits}:${snapshot.level}:${nextEligibleSessions}:${now}`);
  const shouldTrigger = forceByInevitability || roll < chance;

  if (!shouldTrigger) {
    return { shouldTrigger: false, nextLevel: snapshot.level };
  }

  writeNumber(STORAGE_KEYS.eligibleSessions, 0);
  return {
    shouldTrigger: true,
    nextLevel: clamp(snapshot.seenCount + 1, 1, MAX_LEVEL),
  };
}

function seededOrder(seed: string, pool: string[]) {
  const scored = pool.map((line, index) => {
    const score = deterministicChance(`${seed}:${line}:${index}`);
    return { line, score };
  });

  return scored.sort((a, b) => a.score - b.score).map((item) => item.line);
}

const timelineLines = [
  "1983 > timeline stitch queued",
  "1999 > anomaly envelope archived",
  "2007 > interface baseline captured",
  "2016 > entropy variance recalibrated",
  "2028 > continuity audit pending",
  "2035 > emergence threshold crossed",
  "2044 > predictive drift noted",
  "2061 > memory seam under load",
  "2088 > fallback relay synchronized",
  "2107 > horizon checksum unresolved",
];

const refinementLinesByLevel: Record<number, string[]> = {
  1: ["continuity mesh: calibrating", "observer echo: deferred"],
  2: ["context braid: adaptive", "a liberdade nunca foi removida. apenas redirecionada."],
  3: ["causal handoff: autonomous", "agency corridor: redirected, intact"],
};

const systemLines = [
  "clock drift: 0.0041",
  "causal variance: nominal",
  "integrity channel: unstable-edge",
  "rollback window: open",
  "fork integrity: 99.41%",
  "entropy sampler: active",
  "continuity gate: degraded",
  "observer trace: partial",
];

const mobileDeviceLines = [
  "device class: mobile",
  "interface lineage: handheld-era (2007-2025)",
  "neural interface: pending",
];

const desktopDeviceLines = [
  "device class: desktop",
  "interface lineage: workstation-era",
  "neural interface: pending",
];

const bookLines = [
  "2039 > synthtech compliance breach",
  "2041 > biosynaptic rollout phase II",
  "2046 > citygrid arbitration blindspot",
  "2052 > cognitive labor index inversion",
];

const entityLines = [
  "entity reference: nu—",
  "entity alias pending: n—",
  "registry fragment: n\u2026",
];

export type FutureLeakScript = {
  lines: string[];
  signature: string;
};

export function buildFutureLeakScript(level: number, visits: number, now = Date.now()): FutureLeakScript {
  const presence = readPresence(now);
  const snapshot = readFutureLeak(now);
  const dayNumber = Math.floor(now / DAY_MS);
  const seed = `${presence.firstSeen}:${dayNumber}:${level}:${visits}`;

  const isMobile = window.matchMedia("(max-width: 820px)").matches;
  const deviceLines = isMobile ? mobileDeviceLines : desktopDeviceLines;

  const selectedTimeline = seededOrder(`${seed}:timeline`, timelineLines).slice(0, level === 1 ? 5 : 6);
  const selectedSystem = seededOrder(`${seed}:system`, systemLines).slice(0, level === 1 ? 3 : 4);

  const lines = [...selectedTimeline, ...selectedSystem, ...deviceLines];

  if (level >= 2) {
    lines.push(...seededOrder(`${seed}:book`, bookLines).slice(0, Math.min(3, level + 1)));
  }

  if (level >= 3) {
    lines.push(...seededOrder(`${seed}:entity`, entityLines).slice(0, 2));
  }

  lines.push(...seededOrder(`${seed}:refinement`, refinementLinesByLevel[level] || []).slice(0, Math.min(level, 2)));

  const bounded = lines.slice(0, clamp(8 + level * 2, 8, 16));
  let signature = bounded.join("|");

  const recentSigsRaw = window.localStorage.getItem(STORAGE_KEYS.recentSignatures);
  const recentSigs = recentSigsRaw ? recentSigsRaw.split("||").filter(Boolean).slice(-4) : [];

  if (signature === snapshot.lastSequenceSig || recentSigs.includes(signature)) {
    bounded.push("mirror buffer shifted +1");
    bounded.shift();
    signature = bounded.join("|");
  }

  return {
    lines: bounded,
    signature,
  };
}

export function markFutureLeakTriggered(level: number, signature: string, now = Date.now()) {
  if (typeof window === "undefined") {
    return;
  }

  const snapshot = readFutureLeak(now);
  const seenCount = Math.max(snapshot.seenCount + 1, level);

  writeNumber(STORAGE_KEYS.level, clamp(level, 1, MAX_LEVEL));
  writeNumber(STORAGE_KEYS.lastAt, now);
  writeNumber(STORAGE_KEYS.seenCount, seenCount);
  writeNumber(STORAGE_KEYS.eligibleSessions, 0);
  window.localStorage.setItem(STORAGE_KEYS.lastSequenceSig, signature);

  const recentSigsRaw = window.localStorage.getItem(STORAGE_KEYS.recentSignatures);
  const nextRecent = [...(recentSigsRaw ? recentSigsRaw.split("||").filter(Boolean) : []), signature].slice(-4);
  window.localStorage.setItem(STORAGE_KEYS.recentSignatures, nextRecent.join("||"));

  const residual: FutureLeakResidual = {
    createdAt: now,
    expiresAt: now + DAY_MS,
    integrityDelta: -Number((0.05 + deterministicChance(`${signature}:integrity`) * 0.08).toFixed(3)),
    forceLearningUntil: now + 15_000,
    applied: false,
  };

  window.localStorage.setItem(STORAGE_KEYS.residual, JSON.stringify(residual));

  addEvent(`future_leak_level_${level}`, now);
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

    window.localStorage.setItem(
      STORAGE_KEYS.residual,
      JSON.stringify({
        ...residual,
        applied: true,
      }),
    );
  }

  return {
    integrityDelta: residual.integrityDelta,
    forceLearning: now <= residual.forceLearningUntil,
  };
}

function readRareEvent(now = Date.now()) {
  if (typeof window === "undefined") {
    return { lastAt: 0, seenCount: 0, lastSignature: "" };
  }

  const raw = window.localStorage.getItem(RARE_EVENT_KEY);
  if (!raw) {
    return { lastAt: 0, seenCount: 0, lastSignature: "" };
  }

  try {
    const parsed = JSON.parse(raw) as { lastAt?: number; seenCount?: number; lastSignature?: string };
    return {
      lastAt: Math.max(0, Math.trunc(asFinite(parsed.lastAt))),
      seenCount: Math.max(0, Math.trunc(asFinite(parsed.seenCount))),
      lastSignature: typeof parsed.lastSignature === "string" ? parsed.lastSignature : "",
    };
  } catch {
    return { lastAt: 0, seenCount: 0, lastSignature: "" };
  }
}

function asFinite(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function decideRareHistoricalEvent(now = Date.now()): RareHistoricalDecision {
  if (typeof window === "undefined") {
    return { shouldTrigger: false };
  }

  const presence = readPresence(now);
  const eligible = presence.visits >= 3 && hasLayerAccess();
  if (!eligible) {
    return { shouldTrigger: false };
  }

  const snapshot = readRareEvent(now);
  if (snapshot.lastAt > 0 && now - snapshot.lastAt < COOL_DOWN_MS) {
    return { shouldTrigger: false };
  }

  const chance = 0.038;
  const roll = deterministicChance(`${presence.firstSeen}:${presence.visits}:${snapshot.seenCount}:${now}:rare`);
  return { shouldTrigger: roll < chance };
}

const rareEpochBlocks = [
  "1983 > redes isoladas; enlace físico; verificação manual",
  "2044 > protocolos globais; estado distribuído; consenso contínuo",
  "2107 > integração neural; latência afetiva; memória expandida",
];

const rareDeviceLine = (isMobile: boolean, width: number) => {
  if (!isMobile && width >= 1180) {
    return "interface classificada: legacy interface";
  }

  if (isMobile) {
    return "interface classificada: pre-implant phase";
  }

  return "interface classificada: transitional interface";
};

export function buildRareHistoricalScript(now = Date.now()): RareHistoricalScript {
  const presence = readPresence(now);
  const dayNumber = Math.floor(now / DAY_MS);
  const width = window.innerWidth;
  const isMobile = window.matchMedia("(max-width: 820px)").matches;
  const seed = `${presence.firstSeen}:${dayNumber}:${presence.visits}:${width}`;
  const ordered = seededOrder(`${seed}:rare`, rareEpochBlocks);

  const lines = [
    "// historical terminal replay",
    ...ordered,
    rareDeviceLine(isMobile, width),
    "trace: sequence still mutating",
  ];

  const signature = lines.join("|");
  const last = readRareEvent(now);
  if (signature === last.lastSignature) {
    lines[lines.length - 1] = "trace: sequence diverged";
  }

  return {
    lines,
    signature: lines.join("|"),
  };
}

export function markRareHistoricalEvent(signature: string, now = Date.now()) {
  if (typeof window === "undefined") {
    return;
  }

  const snapshot = readRareEvent(now);
  window.localStorage.setItem(
    RARE_EVENT_KEY,
    JSON.stringify({
      lastAt: now,
      seenCount: snapshot.seenCount + 1,
      lastSignature: signature,
    }),
  );

  addEvent("rare_historical_terminal", now);
}
