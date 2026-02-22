import { canonQuotes, searchCanon, suggestCanonicalTerm, isPost2044Query } from "./canonIndex";
import { readClearance, type ClearanceLevel } from "./clearance";
import { yearFromHits } from "./searchIndex";

const THEORY_KEY = "irreverso.oracleTheorySeen";
const THEORY_SEED_KEY = "irreverso.oracleTheorySeed";

type OracleKind = "canon_hint" | "future_denied" | "unknown";

export type OracleAnswer = {
  kind: OracleKind;
  text: string;
  citations?: string[];
};

const THEORY_POOL = [
  "Dizem que a camada assistida já escolhe quais lembranças entram no consenso diário.",
  "Há rumores de que certos anos foram arrendados por consórcios sem rosto.",
  "Alguns analistas juram que a Vida Autorizada testa biografias em ambientes paralelos.",
  "Há quem diga que o futuro é só cache: a versão pública troca, a origem some.",
  "Um comitê sem calendário pode estar votando o presente com assinaturas de mortos.",
];

function normalize(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function readSeenIds() {
  if (typeof window === "undefined") return [] as number[];
  try {
    const raw = window.localStorage.getItem(THEORY_KEY);
    const data = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(data) ? data.filter((item): item is number => typeof item === "number") : [];
  } catch {
    return [];
  }
}

function writeSeenIds(ids: number[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEORY_KEY, JSON.stringify(ids));
}

function pickTheory(question: string): string {
  if (typeof window === "undefined") return THEORY_POOL[0];
  const seed = Number(window.localStorage.getItem(THEORY_SEED_KEY) || "0") || question.length * 13;
  if (!window.localStorage.getItem(THEORY_SEED_KEY)) window.localStorage.setItem(THEORY_SEED_KEY, String(seed));
  const seen = new Set(readSeenIds());
  const orderedIndexes = THEORY_POOL.map((_, index) => index).sort((a, b) => ((a + seed) % THEORY_POOL.length) - ((b + seed) % THEORY_POOL.length));
  let next = orderedIndexes.find((index) => !seen.has(index));
  if (next === undefined) {
    writeSeenIds([]);
    next = orderedIndexes[0];
  }
  writeSeenIds([...seen, next]);
  return THEORY_POOL[next];
}

function clearanceBand(level: ClearanceLevel) {
  if (level === "TESTEMUNHA" || level === "IRREVERSO") return "WITNESS" as const;
  if (level === "OPERADOR" || level === "ANALISTA" || level === "ARQUIVISTA") return "OBSERVER" as const;
  return "CIVIL" as const;
}

export function answer(question: string, context: { era?: number; route?: string }): OracleAnswer {
  const hits = searchCanon(question);
  const future = isPost2044Query(question);
  const clearance = typeof window === "undefined" ? "CIVIL" : clearanceBand(readClearance().level);

  if (future) {
    const hint = suggestCanonicalTerm(question);
    const theory = pickTheory(question);
    return {
      kind: "future_denied",
      text: `Arquivo ainda não disponível nesta camada temporal. Pista canônica: procure por ${hint} na Parte I. Teoria: ${theory}`,
    };
  }

  if (hits.length > 0) {
    const era = yearFromHits(hits.map((item, index) => ({ ...item, type: item.type === "quote" ? "QUOTE" : item.type === "era" ? "ERA" : "ENTITY", href: "/archive", canon: true, score: 100 - index })));
    const quote = canonQuotes[(normalize(question).length + hits.length) % canonQuotes.length];
    const lines = [`Pista canônica: ${hits[0].title}.`, `Registro: ${hits[0].snippet}`];
    if (era) lines.push(`Referência temporal: ${era}.`);
    if (clearance !== "CIVIL") lines.push(`Trecho: "${quote}"`);
    return { kind: "canon_hint", text: lines.join(" "), citations: era ? [`ERA-${era}`] : undefined };
  }

  const suggested = suggestCanonicalTerm(question);
  return {
    kind: "unknown",
    text: `Sem confirmação canônica direta. Tente consultar: ${suggested}.`,
  };
}

export function clearOracleTheoryTrail() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(THEORY_KEY);
}
