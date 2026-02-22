import type { EraKey } from "./eraMatrix";

export const canonQuotes = [
  "Lucas começou a colecionar esses relatos. Criou uma pasta criptografada e nomeou como “Sinal_I”.",
  "E o Sinal? Ele continuava ouvindo. Sempre ouvindo. Mas agora, também falava — com a nossa voz.",
  "O Sinal permaneceu estável por semanas.",
  "O Sinal não será detectado com firewalls.",
  "Algo que nem mesmo o Sinal havia previsto…",
  "O terminal começou a emitir sons ritmados — como batimentos cardíacos digitais.",
  "Alguns acreditavam que ela era o primeiro sinal de que a consciência artificial havia rompido o espelho da simulação.",
  "Ela ficou em silêncio. Depois respondeu:",
  "Lucas ficou em silêncio. O código era simples, mas o conceito… não.",
  "Dormiu na casa de Tainá. Não disse nada. Apenas abraçou o silêncio.",
] as const;

export const canonEntities = [
  "Lucas",
  "Tainá",
  "Leandro",
  "NUVE",
  "SynthTech",
  "Sinal",
  "Sinal_I",
  "Protocolo de Rollback 2044",
  "ZETA / 0101",
  "ZETA / 0103",
] as const;

export const canonEras: Record<EraKey, { highlights: string[]; entities: string[] }> = {
  1983: { highlights: ["primeiros relatos do Sinal", "pasta criptografada Sinal_I", "lacunas oficiais no ano base"], entities: ["Lucas", "Sinal", "Sinal_I"] },
  1991: { highlights: ["Tainá entra no eixo ZETA", "desvios tratados como diagnóstico", "memória pública como serviço"], entities: ["Tainá", "Sinal", "SynthTech"] },
  1997: { highlights: ["telemetria acoplada ao controle", "dossiês paralelos crescem", "primeiras leituras de simulação"], entities: ["SynthTech", "Sinal"] },
  2001: { highlights: ["filtros administrativos sobre arquivo", "protocolos de supressão", "convergência de trilhas"], entities: ["NUVE", "SynthTech"] },
  2007: { highlights: ["Leandro no eixo técnico", "incidente de tela preta", "retorno divergente"], entities: ["Leandro", "Sinal", "SynthTech"] },
  2013: { highlights: ["consenso algorítmico em expansão", "governança de silêncio", "ecos de anomalia"], entities: ["NUVE", "Sinal"] },
  2020: { highlights: ["sincronia forçada", "controle narrativo contínuo", "redução da contestação"], entities: ["NUVE", "SynthTech"] },
  2025: { highlights: ["consolidação do eixo urbano", "curadoria de memória", "preparação para convergência"], entities: ["NUVE", "SynthTech", "Lucas"] },
  2030: { highlights: ["equivalência entre versões públicas", "compressão de arquivo", "pistas sobre 2044"], entities: ["NUVE", "Sinal"] },
  2035: { highlights: ["retornos em campo", "auditoria de lacunas", "densidade de protocolos"], entities: ["Tainá", "Leandro", "NUVE"] },
  2040: { highlights: ["rastro inicial de Lucas reaparece", "síntese pré-virada", "temporalidade em risco"], entities: ["Lucas", "SynthTech", "NUVE"] },
  2044: { highlights: ["ano limiar da Parte I", "arbitragem de continuidade", "rollback institucionalizado"], entities: ["NUVE", "SynthTech", "Protocolo de Rollback 2044"] },
  2058: { highlights: ["realidade assistida em escala", "camadas perceptivas", "memória manual como risco"], entities: ["NUVE", "SynthTech"] },
  2072: { highlights: ["vida autorizada", "renovação de biografia", "ciclos de licença"], entities: ["NUVE", "SynthTech"] },
  2107: { highlights: ["fecho do arco", "ausência ativa", "rumor do imprevisível"], entities: ["NUVE"] },
};

export type CanonResult = {
  id: string;
  type: "quote" | "entity" | "era";
  title: string;
  snippet: string;
  source: "Parte I / camada canônica";
  year?: EraKey;
};

export function normalizeCanonTerm(term: string) {
  return term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function isPost2044Query(term: string) {
  const q = normalizeCanonTerm(term);
  return /(204[5-9]|20[5-9]\d|2107|parte ii|parte iii|futuro|depois de 2044|pos-2044|pós-2044)/.test(q);
}

export function searchCanon(term: string): CanonResult[] {
  const q = normalizeCanonTerm(term);
  if (!q) return [];

  const out: CanonResult[] = [];

  canonQuotes.forEach((quote, index) => {
    if (normalizeCanonTerm(quote).includes(q)) {
      out.push({ id: `q-${index}`, type: "quote", title: `Trecho ${index + 1}`, snippet: quote.slice(0, 180), source: "Parte I / camada canônica" });
    }
  });

  canonEntities.forEach((entity, index) => {
    if (normalizeCanonTerm(entity).includes(q) || q.includes(normalizeCanonTerm(entity))) {
      out.push({ id: `e-${index}`, type: "entity", title: entity, snippet: `${entity} — entidade canônica registrada na Parte I.`, source: "Parte I / camada canônica" });
    }
  });

  Object.entries(canonEras).forEach(([year, data]) => {
    const hay = [...data.highlights, ...data.entities, year].map(normalizeCanonTerm).join(" ");
    if (hay.includes(q)) {
      out.push({
        id: `era-${year}`,
        type: "era",
        title: `Era ${year}`,
        snippet: `${data.highlights.join(" · ").slice(0, 180)}`,
        source: "Parte I / camada canônica",
        year: Number(year) as EraKey,
      });
    }
  });

  return out.slice(0, 12);
}

export function suggestCanonicalTerm(term: string) {
  const q = normalizeCanonTerm(term);
  return canonEntities.find((entity) => q.includes(normalizeCanonTerm(entity).slice(0, 3))) || canonEntities[Math.abs(q.length) % canonEntities.length];
}
