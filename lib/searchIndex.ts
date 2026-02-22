import MiniSearch from "minisearch";
import { BOOK_QUOTES, CANON_ENTITIES, CANON_EVENTS } from "./bookCanon";
import { ERA_MATRIX, ERA_TIMELINE, type EraKey } from "./eraMatrix";

export type SearchResultType = "CHAR" | "ENTITY" | "ERA" | "QUOTE";

type SearchDoc = {
  id: string;
  type: SearchResultType;
  title: string;
  text: string;
  year?: number;
  slug?: string;
  canon: boolean;
};

export type SearchResult = {
  id: string;
  type: SearchResultType;
  title: string;
  snippet: string;
  href: string;
  year?: number;
  canon: boolean;
  score: number;
};

let index: MiniSearch<SearchDoc> | null = null;
let docs: SearchDoc[] = [];

function classifyEntityType(slug: string): SearchResultType {
  if (["lucas", "taina", "mateo", "ayla", "julian", "eleonor", "ld-ferraro"].includes(slug)) return "CHAR";
  return "ENTITY";
}

function toDocs(): SearchDoc[] {
  const entityDocs = CANON_ENTITIES.map((entity) => ({
    id: `ent-${entity.slug}`,
    type: classifyEntityType(entity.slug),
    title: entity.name,
    text: [entity.name, entity.slug, ...(entity.aliases || [])].join(" "),
    slug: entity.slug,
    canon: true,
  } satisfies SearchDoc));

  const eraDocs = ERA_TIMELINE.map((year) => {
    const snap = ERA_MATRIX[year];
    const compact = [snap.whisper, ...snap.summary, ...snap.entities.map((v) => v.label), ...snap.characters.map((v) => v.label)].join(" ");
    return {
      id: `era-${year}`,
      type: "ERA",
      title: `Era ${year}`,
      text: compact,
      year,
      canon: true,
    } satisfies SearchDoc;
  });

  const eventDocs = CANON_EVENTS.map((event) => ({
    id: `evt-${event.year}-${event.title}`,
    type: "ERA",
    title: `${event.year} — ${event.title}`,
    text: [event.title, ...event.details, ...event.related].join(" "),
    year: event.year,
    canon: true,
  } satisfies SearchDoc));

  const quoteDocs = BOOK_QUOTES.slice(0, 28).map((quote, index) => ({
    id: `quote-${index}`,
    type: "QUOTE",
    title: `Quote ${index + 1}`,
    text: quote,
    canon: true,
  } satisfies SearchDoc));

  return [...entityDocs, ...eraDocs, ...eventDocs, ...quoteDocs];
}

export function buildIndex() {
  docs = toDocs();
  index = new MiniSearch<SearchDoc>({
    fields: ["title", "text"],
    storeFields: ["id", "type", "title", "text", "year", "slug", "canon"],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      boost: { title: 2 },
    },
  });
  index.addAll(docs);
  return index;
}

function hrefFor(doc: SearchDoc): string {
  if ((doc.type === "CHAR" || doc.type === "ENTITY") && doc.slug) return `/core/dossier/${doc.slug}`;
  if (doc.type === "ERA" && doc.year) return `/archive?era=${doc.year}`;
  return "/archive";
}

export function queryIndex(q: string): SearchResult[] {
  const term = q.trim();
  if (!term) return [];
  if (!index) buildIndex();
  if (!index) return [];

  const found = index.search(term, { combineWith: "OR" }).slice(0, 10);
  return found.map((item) => {
    const doc = item as unknown as SearchDoc & { score: number };
    return {
      id: doc.id,
      type: doc.type,
      title: doc.title,
      snippet: doc.text.slice(0, 130),
      href: hrefFor(doc),
      year: doc.year,
      canon: doc.canon,
      score: doc.score,
    };
  });
}

export function findCanonMatches(q: string) {
  return queryIndex(q).filter((hit) => hit.canon);
}

export function yearFromHits(hits: SearchResult[]): EraKey | undefined {
  const year = hits.find((hit) => typeof hit.year === "number")?.year;
  if (!year) return undefined;
  if ((ERA_TIMELINE as readonly number[]).includes(year)) {
    return year as EraKey;
  }
  return undefined;
}
