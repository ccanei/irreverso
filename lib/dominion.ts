export const CANON_QUOTES = [
  "Você foi autorizado.",
  "Entre o primeiro bit... e o último suspiro.",
  "Leitura não recomendada para mentes programadas para obediência cega.",
  "Alguns nomes foram preservados.",
  "Alguns eventos permanecem sem origem confirmada.",
  "Não há garantia de que todas as conexões estejam explícitas.",
  "Nem de que todas as lacunas sejam acidentais.",
  "Nada aqui foi incluído sem motivo.",
  "Nem tudo aqui pôde ser incluído.",
  "Se você está lendo este material, é porque o acesso foi permitido.",
  "A pergunta que permanece não é quando isso começou,",
  "mas em que momento deixou de ser possível interromper.",
  "Era como abrir uma porta sem saber para onde levava. Mas entrar mesmo assim.",
  "Mas ninguém ouvia. Porque ainda era cedo.",
  "— Isso apareceu sozinho…",
  "— Às vezes, a máquina continua de onde a gente parou.",
  "Sem nobreak, sem estabilizador. Tela preta. Tudo se foi em um segundo.",
  "“O medo é uma forma de reconhecimento.”",
] as const;

const SEEN_COOKIE = "irv_seen";
const SEEN_STORAGE = "irreverso.seen";
const MAX_SEEN_AGE_SECONDS = 180 * 24 * 60 * 60;

export type SiteMode = "breach" | "stable";

export const DOMINION_KEYS = {
  breachSeen: "irreverso.dominion.breachSeen",
  takeoverSeen: "irreverso.dominion.takeoverSeen",
  sessions: "irreverso.dominion.sessions",
  eventLog: "irreverso.dominion.eventLog",
  integrityResidual: "irreverso.dominion.integrityResidual",
  learningUntil: "irreverso.dominion.learningUntil",
} as const;

export type DominionEventType = "breach" | "takeover";

export function getMode(): SiteMode {
  if (typeof window === "undefined") return "breach";
  const cookieSeen = document.cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${SEEN_COOKIE}=1`);
  const localSeen = window.localStorage.getItem(SEEN_STORAGE) === "true";
  return cookieSeen || localSeen ? "stable" : "breach";
}

export function setSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEEN_STORAGE, "true");
  document.cookie = `${SEEN_COOKIE}=1; Max-Age=${MAX_SEEN_AGE_SECONDS}; Path=/; SameSite=Lax`;
}

export function resetSeen() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SEEN_STORAGE);
  document.cookie = `${SEEN_COOKIE}=0; Max-Age=0; Path=/; SameSite=Lax`;
}

export function readNumber(key: string, fallback = 0) {
  if (typeof window === "undefined") return fallback;
  const raw = window.localStorage.getItem(key);
  const next = Number(raw);
  return Number.isFinite(next) ? next : fallback;
}

export function writeNumber(key: string, value: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, String(value));
}

export function getResidualIntegrity() {
  return Math.max(0, readNumber(DOMINION_KEYS.integrityResidual, 0));
}

export function setResidualIntegrity(next: number) {
  writeNumber(DOMINION_KEYS.integrityResidual, Math.max(0, Math.round(next * 1000) / 1000));
}

export function getLearningUntil() {
  return readNumber(DOMINION_KEYS.learningUntil, 0);
}

export function setLearningUntil(timestamp: number) {
  writeNumber(DOMINION_KEYS.learningUntil, timestamp);
}

export function registerSession(now = Date.now()) {
  if (typeof window === "undefined") return 1;
  const sessionKey = `irreverso.session.${new Date(now).toDateString()}.${Math.floor(now / 1_800_000)}`;
  const existing = window.sessionStorage.getItem(sessionKey);
  if (existing) {
    return readNumber(DOMINION_KEYS.sessions, 1);
  }

  const next = readNumber(DOMINION_KEYS.sessions, 0) + 1;
  writeNumber(DOMINION_KEYS.sessions, next);
  window.sessionStorage.setItem(sessionKey, "1");
  return next;
}

export function shouldGuaranteeBreach() {
  if (typeof window === "undefined") return false;
  return readNumber(DOMINION_KEYS.breachSeen, 0) === 0;
}

export function shouldTriggerTakeover() {
  if (typeof window === "undefined") return false;
  const sessions = readNumber(DOMINION_KEYS.sessions, 1);
  const takeoverSeen = readNumber(DOMINION_KEYS.takeoverSeen, 0);
  if (takeoverSeen > 0) {
    return false;
  }

  if (sessions < 3) {
    return false;
  }

  if (sessions >= 4) {
    return true;
  }

  return Math.random() > 0.4;
}

export function markEvent(type: DominionEventType, now = Date.now()) {
  if (typeof window === "undefined") return;
  if (type === "breach") {
    writeNumber(DOMINION_KEYS.breachSeen, readNumber(DOMINION_KEYS.breachSeen, 0) + 1);
  }

  if (type === "takeover") {
    writeNumber(DOMINION_KEYS.takeoverSeen, readNumber(DOMINION_KEYS.takeoverSeen, 0) + 1);
  }

  const eventLog = JSON.parse(window.localStorage.getItem(DOMINION_KEYS.eventLog) ?? "[]") as Array<{ type: DominionEventType; at: number }>;
  const next = [...eventLog, { type, at: now }].slice(-10);
  window.localStorage.setItem(DOMINION_KEYS.eventLog, JSON.stringify(next));
}

export function localTelemetry(now = Date.now()) {
  const date = new Date(now);
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
  const os = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || "unknown";
  const deviceClass = window.matchMedia("(pointer: coarse)").matches ? "mobile" : "desktop";
  return {
    localTime: date.toLocaleTimeString([], { hour12: false }),
    timezone,
    language: navigator.language || "unknown",
    os,
    deviceClass,
  };
}

export function shuffledTimeline() {
  const years = ["1983", "1997", "2007", "2025", "2035", "2044", "2107"];
  return years
    .map((year) => ({ year, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.year);
}

export function randomQuotePair() {
  const first = CANON_QUOTES[Math.floor(Math.random() * CANON_QUOTES.length)];
  let second = CANON_QUOTES[Math.floor(Math.random() * CANON_QUOTES.length)];
  if (second === first) {
    second = CANON_QUOTES[(CANON_QUOTES.indexOf(first) + 3) % CANON_QUOTES.length];
  }
  return [first, second];
}
