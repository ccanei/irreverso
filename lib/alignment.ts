import { readFutureLeak } from "./futureLeak";
import { readEventsTrail, readPresence } from "./presence";
import { readReadTransmissions } from "./transmissions";

const ALIGNMENT_SCORE_KEY = "irreverso.alignmentScore";
const ALIGNMENT_PHASE_KEY = "irreverso.alignmentPhase";
const ALIGNMENT_LAST_AT_KEY = "irreverso.alignmentLastAt";
const SESSION_UPDATE_KEY = "irreverso.alignmentUpdatedThisSession";
const MIN_UPDATE_INTERVAL_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 86_400_000;

export type AlignmentState = {
  score: number;
  phase: number;
  lastAt: number;
};

export type AlignmentInputs = {
  visits: number;
  daysSinceFirstSeen: number;
  variance: number;
  futureLeakLevel: number;
  readTxCount: number;
  hasLayerRead: boolean;
  dwellTimeMinutes: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function asFiniteNumber(value: string | null, fallback: number) {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
}

function normalizeScore(score: number) {
  return clamp(Math.round(score), 0, 100);
}

function normalizePhase(phase: number) {
  return clamp(Math.trunc(phase), 0, 5);
}

function readStoredState(): AlignmentState {
  if (typeof window === "undefined") {
    return {
      score: 0,
      phase: 0,
      lastAt: 0,
    };
  }

  const score = normalizeScore(asFiniteNumber(window.localStorage.getItem(ALIGNMENT_SCORE_KEY), 0));
  const phase = normalizePhase(asFiniteNumber(window.localStorage.getItem(ALIGNMENT_PHASE_KEY), computePhase(score)));
  const lastAt = Math.max(0, asFiniteNumber(window.localStorage.getItem(ALIGNMENT_LAST_AT_KEY), 0));

  return {
    score,
    phase,
    lastAt,
  };
}

function persistAlignment(state: AlignmentState) {
  if (typeof window === "undefined") {
    return state;
  }

  window.localStorage.setItem(ALIGNMENT_SCORE_KEY, String(normalizeScore(state.score)));
  window.localStorage.setItem(ALIGNMENT_PHASE_KEY, String(normalizePhase(state.phase)));
  window.localStorage.setItem(ALIGNMENT_LAST_AT_KEY, String(Math.max(0, Math.trunc(state.lastAt))));
  return state;
}

function shouldUpdate(now: number, lastAt: number) {
  if (typeof window === "undefined") {
    return false;
  }

  const elapsed = now - lastAt;
  if (lastAt > 0 && elapsed < MIN_UPDATE_INTERVAL_MS) {
    return false;
  }

  if (window.sessionStorage.getItem(SESSION_UPDATE_KEY) === "1") {
    return false;
  }

  return true;
}

function gatherAlignmentInputs(now: number): AlignmentInputs {
  const presence = readPresence(now);
  const futureLeak = readFutureLeak(now);
  const eventsTrail = readEventsTrail();
  const readTxCount = readReadTransmissions().size;

  const daysSinceFirstSeen = presence.firstSeen > 0 ? Math.max(0, Math.floor((now - presence.firstSeen) / DAY_MS)) : 0;
  const hasLayerRead = eventsTrail.some((event) => event.type === "layer_read" || event.type === "route_layer");

  return {
    visits: presence.visits,
    daysSinceFirstSeen,
    variance: presence.variance,
    futureLeakLevel: futureLeak.level,
    readTxCount,
    hasLayerRead,
    dwellTimeMinutes: presence.dwellTime / 60_000,
  };
}

function calculateDelta(inputs: AlignmentInputs) {
  let delta = 0;
  delta += Math.min(10, Math.max(0, inputs.visits));
  delta += Math.min(15, Math.max(0, inputs.daysSinceFirstSeen) * 2);
  delta += Math.max(0, inputs.futureLeakLevel) * 8;
  delta += Math.min(12, Math.max(0, inputs.readTxCount) * 2);
  delta += inputs.hasLayerRead ? 6 : 0;
  delta += Math.min(10, Math.max(0, Math.floor(inputs.dwellTimeMinutes / 3)));
  delta += Math.min(8, Math.max(0, inputs.variance) * 2);
  return delta;
}

export function computePhase(score: number) {
  const normalized = normalizeScore(score);

  if (normalized >= 85) return 5;
  if (normalized >= 65) return 4;
  if (normalized >= 45) return 3;
  if (normalized >= 30) return 2;
  if (normalized >= 15) return 1;
  return 0;
}

export function getAlignment(): AlignmentState {
  return readStoredState();
}

export function updateAlignment(inputs?: Partial<AlignmentInputs>) {
  const now = Date.now();
  const previous = readStoredState();

  if (!shouldUpdate(now, previous.lastAt)) {
    return {
      score: previous.score,
      phase: previous.phase,
      changedPhase: false,
    };
  }

  const calculated = gatherAlignmentInputs(now);
  const nextInputs = {
    ...calculated,
    ...inputs,
  };

  const delta = calculateDelta(nextInputs);
  const gradualIncrease = clamp(delta, 1, 6);
  const candidateScore = Math.max(previous.score, previous.score + gradualIncrease);
  const score = normalizeScore(candidateScore);
  const phase = computePhase(score);
  const changedPhase = phase > previous.phase;

  persistAlignment({
    score,
    phase,
    lastAt: now,
  });

  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(SESSION_UPDATE_KEY, "1");
  }

  return {
    score,
    phase,
    changedPhase,
  };
}
