import { addDwellTime, addEvent, readPresence, trackVisit } from "./presence";

export const SEEN_COOKIE = "irv_seen";
export const SEEN_STORAGE = "irreverso.seen";
const MAX_AGE = 180 * 24 * 60 * 60;

const RESIDUAL_KEY = "irreverso.residual.integrity";
const LEARNING_KEY = "irreverso.instance.learningUntil";
const FEED_ACCEL_KEY = "irreverso.feed.acceleratedUntil";

export function markSeen() {
  if (typeof window === "undefined") return;
  localStorage.setItem(SEEN_STORAGE, "1");
  document.cookie = `${SEEN_COOKIE}=1; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax`;
}

export function seenAlready() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SEEN_STORAGE) === "1";
}

export function applyResidualAfterBreach(now = Date.now()) {
  if (typeof window === "undefined") return;
  const current = Number(localStorage.getItem(RESIDUAL_KEY) || "0");
  localStorage.setItem(RESIDUAL_KEY, String(Math.min(6, current + 0.8)));
  localStorage.setItem(LEARNING_KEY, String(now + 20_000));
  localStorage.setItem(FEED_ACCEL_KEY, String(now + 10_000));
  addEvent("breach.rollback", now);
}

export function readResidualState(now = Date.now()) {
  if (typeof window === "undefined") {
    return { integrityDrop: 0, learning: false, accelerated: false };
  }
  const integrityDrop = Number(localStorage.getItem(RESIDUAL_KEY) || "0");
  const learningUntil = Number(localStorage.getItem(LEARNING_KEY) || "0");
  const acceleratedUntil = Number(localStorage.getItem(FEED_ACCEL_KEY) || "0");
  return {
    integrityDrop: Number.isFinite(integrityDrop) ? integrityDrop : 0,
    learning: now < learningUntil,
    accelerated: now < acceleratedUntil,
  };
}

export function trackCoreSession(path: string, now = Date.now()) {
  trackVisit(path, now);
  addEvent(`route:${path}`, now);
}

export function pulseDwell() {
  addDwellTime(1000);
}

export function restrictedUnlocks() {
  const presence = readPresence();
  const breachSeen = seenAlready();
  const force = typeof window !== "undefined" && localStorage.getItem("irreverso.debug.unlockAll") === "1";

  const state = {
    visitsUnlock: force || presence.visits >= 2,
    breachUnlock: force || breachSeen,
    dwellUnlock: force || presence.dwellTime >= 60_000,
  };

  return {
    ...state,
    unlockedCount: Number(state.visitsUnlock) + Number(state.breachUnlock) + Number(state.dwellUnlock),
  };
}

export function resetWorldState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SEEN_STORAGE);
  localStorage.removeItem(RESIDUAL_KEY);
  localStorage.removeItem(LEARNING_KEY);
  localStorage.removeItem(FEED_ACCEL_KEY);
  localStorage.removeItem("irreverso.debug.forceBreach");
  localStorage.removeItem("irreverso.debug.unlockAll");
  document.cookie = `${SEEN_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
}
