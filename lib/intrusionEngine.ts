import { CANON_QUOTES } from "./canonQuotes";
import type { RealityCategory } from "./realitySources";
import type { RealityItem } from "./realityFetch";

const KEY = "irreverso.intrusion.v1";
const TRAIL_KEY = "irreverso.intrusion.trail";
const SESSION_KEY = "irreverso.intrusion.eligible.session";
const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export type IntrusionState = {
  eligibleSessions: number;
  withoutTrigger: number;
  triggeredCount: number;
  lastTriggeredAt: number;
};

export const DEFAULT_INTRUSION_STATE: IntrusionState = {
  eligibleSessions: 0,
  withoutTrigger: 0,
  triggeredCount: 0,
  lastTriggeredAt: 0,
};

export type IntrusionTrailEvent = {
  type: "intrusion_read" | "intrusion_interrupted";
  at: number;
  id: string;
};

export type IntrusionPayload = {
  id: string;
  quote: string;
  item: RealityItem;
  category: RealityCategory;
  autoCloseMs: number;
};

const ERA_CATEGORY_MAP: Record<string, RealityCategory[]> = {
  "1983": ["science", "geopolitics"],
  "1991": ["platforms", "science"],
  "1997": ["platforms", "economy"],
  "2007": ["security", "platforms"],
  "2025": ["ai", "security"],
  "2035": ["security", "economy"],
  "2044": ["ai", "geopolitics"],
  "2078": ["platforms", "economy"],
  "2107": ["science", "ai"],
};

function readState(): IntrusionState {
  if (typeof window === "undefined") return DEFAULT_INTRUSION_STATE;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return DEFAULT_INTRUSION_STATE;

  try {
    const parsed = JSON.parse(raw) as Partial<IntrusionState>;
    return {
      eligibleSessions: Math.max(0, Math.trunc(Number(parsed.eligibleSessions || 0))),
      withoutTrigger: Math.max(0, Math.trunc(Number(parsed.withoutTrigger || 0))),
      triggeredCount: Math.max(0, Math.trunc(Number(parsed.triggeredCount || 0))),
      lastTriggeredAt: Math.max(0, Math.trunc(Number(parsed.lastTriggeredAt || 0))),
    };
  } catch {
    return DEFAULT_INTRUSION_STATE;
  }
}

function writeState(state: IntrusionState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function computeAutoCloseMs(text: string) {
  const readingMs = (wordCount(text) / 160) * 60_000;
  return Math.min(55_000, Math.max(8_000, Math.round(readingMs)));
}

export function isEligible(visits: number, dwellMs: number) {
  return visits >= 2 && dwellMs >= 45_000;
}

export function shouldTriggerIntrusion(visits: number, dwellMs: number, now = Date.now()) {
  if (typeof window === "undefined") return false;
  if (!isEligible(visits, dwellMs)) return false;

  const state = readState();
  if (now - state.lastTriggeredAt < COOLDOWN_MS) return false;

  if (!window.sessionStorage.getItem(SESSION_KEY)) {
    state.eligibleSessions += 1;
    state.withoutTrigger += 1;
    window.sessionStorage.setItem(SESSION_KEY, "1");
  }

  const guaranteed = state.withoutTrigger >= 6;
  const trigger = guaranteed || Math.random() < 0.08;

  if (trigger) {
    state.withoutTrigger = 0;
    state.triggeredCount += 1;
    state.lastTriggeredAt = now;
  }

  writeState(state);
  return trigger;
}

export function buildIntrusionPayload(items: RealityItem[], era: number): IntrusionPayload | null {
  if (items.length === 0) return null;

  const categories = ERA_CATEGORY_MAP[String(era)] || ["ai", "security", "science"];
  const category = categories[Math.floor(Math.random() * categories.length)] || "ai";
  const filtered = items.filter((item) => item.category === category);
  const pool = filtered.length > 0 ? filtered : items;
  const item = pool[Math.floor(Math.random() * pool.length)];

  const quote = CANON_QUOTES[Math.floor(Math.random() * CANON_QUOTES.length)] || CANON_QUOTES[0];
  const text = `${quote} ${item.title}`;

  return {
    id: `intr-${Date.now()}-${item.id}`,
    quote,
    item,
    category,
    autoCloseMs: computeAutoCloseMs(text),
  };
}

export function pushIntrusionTrail(event: IntrusionTrailEvent) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(TRAIL_KEY);
  const current = raw ? ((JSON.parse(raw) as IntrusionTrailEvent[]) || []) : [];
  const next = [...current, event].slice(-30);
  window.localStorage.setItem(TRAIL_KEY, JSON.stringify(next));
}
