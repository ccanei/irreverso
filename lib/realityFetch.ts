import { REALITY_SOURCES, type RealityCategory } from "./realitySources";

export type RealityItem = {
  id: string;
  sourceId: string;
  sourceName: string;
  title: string;
  link: string;
  publishedAt: string;
  summary: string;
  category: RealityCategory;
};

const MAX_ITEMS_PER_SOURCE = 5;

function stripTags(input: string) {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTag(block: string, tag: string) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return stripTags(match?.[1] || "");
}

function parseBlocks(xml: string) {
  const itemBlocks = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].map((item) => item[0]);
  if (itemBlocks.length > 0) return itemBlocks;
  return [...xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)].map((entry) => entry[0]);
}

function extractLink(block: string) {
  const atomHref = block.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?\s*>/i)?.[1];
  if (atomHref) return atomHref.trim();
  return extractTag(block, "link");
}

function sanitizeUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function makeId(sourceId: string, title: string, link: string) {
  const base = `${sourceId}|${title.toLowerCase()}|${link.toLowerCase()}`;
  let hash = 0;
  for (let index = 0; index < base.length; index += 1) {
    hash = (hash << 5) - hash + base.charCodeAt(index);
    hash |= 0;
  }
  return `${sourceId}-${Math.abs(hash)}`;
}

async function fetchSource(source: (typeof REALITY_SOURCES)[number]): Promise<RealityItem[]> {
  try {
    const response = await fetch(source.url, {
      headers: { "user-agent": "IRREVERSO-RealityLayer/1.0" },
      next: { revalidate: 1800 },
    });

    if (!response.ok) return [];

    const xml = await response.text();
    const blocks = parseBlocks(xml).slice(0, MAX_ITEMS_PER_SOURCE);

    return blocks.map((block): RealityItem | null => {
      const title = extractTag(block, "title");
      const link = sanitizeUrl(extractLink(block));
      const publishedAt = extractTag(block, "pubDate") || extractTag(block, "updated") || extractTag(block, "published");
      const summary = extractTag(block, "description") || extractTag(block, "summary") || extractTag(block, "content");

      if (!title || !link) return null;

      return {
        id: makeId(source.id, title, link),
        sourceId: source.id,
        sourceName: source.name,
        title: title.slice(0, 220),
        link,
        publishedAt: publishedAt || new Date().toISOString(),
        summary: summary.slice(0, 280),
        category: source.category,
      };
    }).filter((item): item is RealityItem => item !== null);
  } catch {
    return [];
  }
}

export async function fetchRealityItems() {
  const all = await Promise.all(REALITY_SOURCES.map((source) => fetchSource(source)));
  const dedupe = new Map<string, RealityItem>();

  all.flat().forEach((item) => {
    const key = `${item.title.toLowerCase()}::${item.link.toLowerCase()}`;
    if (!dedupe.has(key)) dedupe.set(key, item);
  });

  return Array.from(dedupe.values())
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 80);
}
