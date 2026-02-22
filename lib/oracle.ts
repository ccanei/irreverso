import { BOOK_QUOTES, CANON_ENTITIES } from "./bookCanon";
import { readClearance, type ClearanceLevel } from "./clearance";
import { findCanonMatches, yearFromHits } from "./searchIndex";

const THEORY_KEY = "irreverso.oracleTheorySeen";
const THEORY_SEED_KEY = "irreverso.oracleTheorySeed";

type OracleKind = "canon_hint" | "future_denied" | "unknown";

export type OracleAnswer = {
  kind: OracleKind;
  text: string;
  citations?: string[];
};

const THEORY_POOL = [
  { id: "t1", text: "A Parte III parece já escrita, mas em blocos mutuamente excludentes: cada decisão pública cria um arquivo paralelo com pequenas diferenças de autoria." },
  { id: "t2", text: "Há indícios de que 2107 não é destino, e sim sandbox regulatório: versões de cidadãos testadas antes da continuidade principal." },
  { id: "t3", text: "Os cortes de energia podem ser ensaios de sincronização social; quando as luzes voltam, o consenso já veio pré-editado." },
  { id: "t4", text: "Alguns protocolos tratam dúvida coletiva como ameaça estatística. O futuro pode ser apenas a versão com menor atrito político." },
  { id: "t5", text: "Relatórios sem emissor sugerem comitês temporais que votam fora do relógio civil, depois injetam decisões como fato consumado." },
  { id: "t6", text: "A teoria dominante: memória pública virou cache. Quando enche, o sistema descarrega trechos humanos e preserva só métricas de conformidade." },
  { id: "t7", text: "Existe suspeita de que a 'continuidade' use assinaturas de mortos como quorum silencioso para aprovar revisões do presente." },
  { id: "t8", text: "Sinais de 2044 indicam que certos anos podem ser alugados. Quem paga decide a resolução temporal disponível ao restante da população." },
  { id: "t9", text: "A entidade que arbitra latência talvez não preveja o futuro; talvez force cenários até que só um pareça natural." },
  { id: "t10", text: "Parte II pode ser um treinamento de obediência sem instrutor explícito: interfaces neutras, escolhas estreitas, culpa distribuída." },
];

function normalize(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function isFutureQuestion(question: string) {
  const q = normalize(question);
  return /(204[5-9]|20[5-9]\d|2107|parte ii|parte iii|o que vai acontecer|no futuro|futuro)/.test(q);
}

function readSeenIds() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const raw = window.localStorage.getItem(THEORY_KEY);
    const data = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(data) ? data.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function writeSeenIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEORY_KEY, JSON.stringify(ids));
}

function seededOrder() {
  if (typeof window === "undefined") return THEORY_POOL;
  const existing = Number(window.localStorage.getItem(THEORY_SEED_KEY) || "0") || Date.now();
  if (!window.localStorage.getItem(THEORY_SEED_KEY)) window.localStorage.setItem(THEORY_SEED_KEY, String(existing));
  return [...THEORY_POOL].sort((a, b) => ((a.id.charCodeAt(1) * 31 + existing) % 97) - ((b.id.charCodeAt(1) * 31 + existing) % 97));
}

function pickTheory(): string {
  const seen = new Set(readSeenIds());
  const ordered = seededOrder();
  let next = ordered.find((item) => !seen.has(item.id));
  if (!next) {
    writeSeenIds([]);
    next = ordered[0];
  }
  if (!next) return "Há ruído demais para uma teoria estável.";
  writeSeenIds([...seen, next.id]);
  return next.text;
}

function clearanceBand(level: ClearanceLevel) {
  if (level === "TESTEMUNHA" || level === "IRREVERSO") return "WITNESS" as const;
  if (level === "OPERADOR" || level === "ANALISTA" || level === "ARQUIVISTA") return "OBSERVER" as const;
  return "CIVIL" as const;
}

export function answer(question: string, context: { era?: number; route?: string }): OracleAnswer {
  const hits = findCanonMatches(question);
  const future = isFutureQuestion(question);
  const clearance = typeof window === "undefined" ? "CIVIL" : clearanceBand(readClearance().level);

  if (future) {
    const theory = pickTheory();
    return {
      kind: "future_denied",
      text: `Arquivo ainda não disponível para esse horizonte. ${theory}`,
    };
  }

  if (hits.length > 0) {
    const era = yearFromHits(hits) || context.era;
    const entityHint = CANON_ENTITIES.find((ent) => normalize(question).includes(normalize(ent.name)) || question.toLowerCase().includes(ent.slug));
    const quote = BOOK_QUOTES[(hits[0].id.length + question.length) % BOOK_QUOTES.length];

    const lines = [
      `Pista canônica: ${hits[0].title}.`,
      era ? `Referência temporal: ${era}.` : "Referência temporal parcial.",
    ];

    if (clearance !== "CIVIL") {
      lines.push(`Sinal residual: "${quote}"`);
    }

    if (clearance === "WITNESS" && entityHint) {
      lines.push(`Entidade associada: ${entityHint.name}.`);
    }

    return {
      kind: "canon_hint",
      text: lines.join(" "),
      citations: era ? [`ERA-${era}`] : undefined,
    };
  }

  return {
    kind: "unknown",
    text: "Sem confirmação canônica direta. Compare entidades, era e protocolo antes de concluir.",
  };
}

export function clearOracleTheoryTrail() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(THEORY_KEY);
}
