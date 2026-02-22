import { canonEntities, canonQuotes, searchCanon, type CanonResult } from "./canonIndex";
import { ERA_TIMELINE, type EraKey } from "./eraMatrix";

export type SearchResultType = "CHAR" | "ENTITY" | "ERA" | "QUOTE";

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

function mapType(type: CanonResult["type"], title: string): SearchResultType {
  if (type === "quote") return "QUOTE";
  if (type === "era") return "ERA";
  if (["lucas", "tainá", "leandro"].includes(title.toLowerCase())) return "CHAR";
  return "ENTITY";
}

export function queryIndex(q: string): SearchResult[] {
  const hits = searchCanon(q);
  return hits.map((hit, index) => ({
    id: hit.id,
    type: mapType(hit.type, hit.title),
    title: hit.title,
    snippet: hit.snippet,
    href: hit.year ? `/archive?era=${hit.year}` : "/archive",
    year: hit.year,
    canon: true,
    score: 100 - index,
  }));
}

export function findCanonMatches(q: string) {
  return queryIndex(q).filter((hit) => hit.canon);
}

export function yearFromHits(hits: SearchResult[]): EraKey | undefined {
  const year = hits.find((hit) => typeof hit.year === "number")?.year;
  if (!year) return undefined;
  return (ERA_TIMELINE as readonly number[]).includes(year) ? (year as EraKey) : undefined;
}

export function hasCanonicalTerm(q: string) {
  const lower = q.toLowerCase();
  return canonEntities.some((entity) => lower.includes(entity.toLowerCase())) || canonQuotes.some((quote) => quote.toLowerCase().includes(lower));
}
