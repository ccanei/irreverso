export type RealityCategory = "ai" | "security" | "geopolitics" | "science" | "platforms" | "economy";

export type RealitySource = {
  id: string;
  name: string;
  url: string;
  category: RealityCategory;
};

export const REALITY_SOURCES: RealitySource[] = [
  { id: "openai-blog", name: "OpenAI Blog", url: "https://openai.com/news/rss.xml", category: "ai" },
  { id: "deepmind-blog", name: "Google DeepMind Blog", url: "https://deepmind.google/blog/rss.xml", category: "ai" },
  { id: "schneier", name: "Schneier on Security", url: "https://www.schneier.com/feed/atom/", category: "security" },
  { id: "cisa", name: "CISA Alerts", url: "https://www.cisa.gov/news-events/cybersecurity-advisories/rss.xml", category: "security" },
  { id: "rferl", name: "RFE/RL", url: "https://www.rferl.org/api/", category: "geopolitics" },
  { id: "foreign-affairs", name: "Foreign Affairs", url: "https://www.foreignaffairs.com/rss.xml", category: "geopolitics" },
  { id: "nature", name: "Nature", url: "https://www.nature.com/nature.rss", category: "science" },
  { id: "scientific-american", name: "Scientific American", url: "https://www.scientificamerican.com/feed/", category: "science" },
  { id: "verge", name: "The Verge", url: "https://www.theverge.com/rss/index.xml", category: "platforms" },
  { id: "ars-tech", name: "Ars Technica", url: "https://feeds.arstechnica.com/arstechnica/index", category: "platforms" },
  { id: "ft-world", name: "Financial Times World", url: "https://www.ft.com/world?format=rss", category: "economy" },
  { id: "imf-news", name: "IMF News", url: "https://www.imf.org/en/News/RSS", category: "economy" },
];
