export type Lang = "pt" | "en";

export function detectLang(): Lang {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}

export const I18N = {
  pt: {
    coreTitle: "IRREVERSO OS",
    subtitle: "REGISTRO AUTORIZADO • SUPERFÍCIE CORE",
    canonSearch: "busca canônica",
    menu: "MENU",
    archive: "ARCHIVE",
    summary: "SUMMARY",
    futureNews: "FUTURE NEWS",
    aiFeatures: "AI FEATURES",
    protocols: "PROTOCOLS",
    signals: "SIGNALS",
    members: "MEMBERS",
    instance: "instância",
    region: "região",
    build: "build",
    uptime: "estabilidade",
    timeline: "linha temporal",
    hint: "passe o cursor • toque • a NUVE observa",
    restricted: "acesso restrito",
    memberLock: "assinatura exigida",
  },
  en: {
    coreTitle: "IRREVERSO OS",
    subtitle: "AUTHORIZED RECORD • CORE SURFACE",
    canonSearch: "canonical search",
    menu: "MENU",
    archive: "ARCHIVE",
    summary: "SUMMARY",
    futureNews: "FUTURE NEWS",
    aiFeatures: "AI FEATURES",
    protocols: "PROTOCOLS",
    signals: "SIGNALS",
    members: "MEMBERS",
    instance: "instance",
    region: "region",
    build: "build",
    uptime: "stability",
    timeline: "timeline",
    hint: "hover • touch • NUVE is watching",
    restricted: "restricted access",
    memberLock: "membership required",
  },
} as const;
