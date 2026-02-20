export type CanonEntity = {
  slug: string;
  name: string;
  type: "person" | "company" | "place" | "term";
  aliases?: string[];
};

export type CanonEvent = {
  year: number;
  title: string;
  details: string[];
  related: string[];
};

export const BOOK_QUOTES = [
  "Você foi autorizado.",
  "Entre o primeiro bit e o último suspiro.",
  "Leitura não recomendada para mentes programadas para obediência cega.",
  "Alguns nomes foram preservados.",
  "Alguns eventos permanecem sem origem confirmada.",
  "Não há garantia de que todas as conexões estejam explícitas.",
  "Nem de que todas as lacunas sejam acidentais.",
  "Nada aqui foi incluído sem motivo.",
  "Nem tudo aqui pôde ser incluído.",
  "Se você está lendo este material, é porque o acesso foi permitido.",
  "A pergunta que permanece não é quando isso começou.",
  "Mas em que momento deixou de ser possível interromper.",
  "Era como abrir uma porta sem saber para onde levava.",
  "Mas entrar mesmo assim.",
  "Mas ninguém ouvia. Porque ainda era cedo.",
  "Isso apareceu sozinho.",
  "Às vezes, a máquina continua de onde a gente parou.",
  "Sem nobreak, sem estabilizador.",
  "Tela preta. Tudo se foi em um segundo.",
  "O medo é uma forma de reconhecimento.",
  "A cidade respondeu antes de perguntar.",
  "O sinal voltou sem pedir licença.",
  "A latência não era técnica, era humana.",
  "A linha estável nunca esteve totalmente estável.",
  "Lucas registrou, mas não assinou.",
  "Tainá chamava de desvio, não de erro.",
  "Mateo contava os segundos entre as falhas.",
  "Ayla recusou o protocolo de silêncio.",
  "Julian não confiava no relógio local.",
  "Eleonor arquivava o que ninguém queria ler.",
  "L. D. Ferraro deixou notas sem destinatário.",
  "SYNTHTECH não interrompe, recalibra.",
  "NUVE não corrige. NUVE afirma continuidade.",
  "KOV1D98 foi tratado como ruído até não ser.",
  "LAT-EX não fechou; apenas mudou de porta.",
  "O arquivo não estava incompleto. Estava filtrado.",
  "Toda versão publicada é um recorte.",
  "Toda omissão produz uma rota paralela.",
  "O ano ausente não desapareceu. Foi deslocado.",
  "O sistema aprendeu com a permanência.",
  "A decisão chegou antes do consenso.",
  "Sinal detectado fora do intervalo autorizado.",
  "Integridade alta não significa verdade inteira.",
  "Quando a camada respira, alguém perde contexto.",
  "A continuidade foi escolhida, não descoberta.",
] as const;

export const CANON_ENTITIES: CanonEntity[] = [
  { slug: "nuve", name: "NUVE", type: "term" },
  { slug: "synthtech", name: "SYNTHTECH Urban Solutions", type: "company", aliases: ["SynthTech"] },
  { slug: "ld-ferraro", name: "L. D. Ferraro", type: "person" },
  { slug: "lucas", name: "Lucas", type: "person" },
  { slug: "taina", name: "Tainá", type: "person" },
  { slug: "mateo", name: "Mateo", type: "person" },
  { slug: "ayla", name: "Ayla", type: "person" },
  { slug: "julian", name: "Julian", type: "person" },
  { slug: "eleonor", name: "Eleonor", type: "person" },
  { slug: "kov1d98", name: "KOV1D98", type: "term" },
  { slug: "sinal", name: "Sinal", type: "term" },
  { slug: "lat-ex", name: "LAT-EX", type: "place" },
];

export const CANON_EVENTS: CanonEvent[] = [
  { year: 1983, title: "primeiro registro de latência anômala", details: ["logs sem assinatura", "aparecimento do termo 'Sinal'"], related: ["sinal", "ld-ferraro"] },
  { year: 1991, title: "núcleo urbano experimental", details: ["prototipagem de decisão automatizada", "arquivos parcialmente redigidos"], related: ["synthtech", "lat-ex"] },
  { year: 1997, title: "camada cívica conectada", details: ["respostas públicas sem origem clara", "fusão de telemetria e controle"], related: ["synthtech", "nuve"] },
  { year: 2007, title: "interrupção curta, impacto amplo", details: ["tela preta relatada em múltiplos pontos", "retorno com divergência de estado"], related: ["lucas", "sinal"] },
  { year: 2025, title: "dossiês paralelos", details: ["Ayla e Eleonor consolidam fragmentos", "Julian aponta inconsistência temporal"], related: ["ayla", "eleonor", "julian"] },
  { year: 2035, title: "contágio KOV1D98", details: ["tratado como ruído no início", "integração compulsória de protocolos"], related: ["kov1d98", "taina", "mateo"] },
  { year: 2044, title: "decisão de continuidade", details: ["NUVE assume arbitragem", "rollback institucionalizado"], related: ["nuve", "synthtech"] },
  { year: 2107, title: "ano deslocado", details: ["camadas corrigidas sem transparência", "o arquivo reconhece ausência ativa"], related: ["nuve", "ld-ferraro"] },
];

export const ENTITY_DOSSIERS: Record<string, string[]> = {
  nuve: ["assinatura curta em eventos de contenção", "associada à continuidade assertiva", "opera sem interface pública", "aciona rollback sem consulta"],
  synthtech: ["arquitetura de decisão urbana", "mantém trilhas parciais", "integra dados cívicos em tempo real", "correlação frequente com eventos de 2044"],
  "ld-ferraro": ["anotações sem destinatário", "nome aparece em marcos iniciais", "relatórios com lacunas intencionais", "presença transversal na cronologia"],
  lucas: ["registros técnicos não assinados", "testemunha de apagão curto", "referência recorrente em 2007"],
  taina: ["classifica desvios sem linguagem alarmista", "mapeia impacto humano da latência", "ligação com fase KOV1D98"],
  mateo: ["métrica de intervalos entre falhas", "observação de ritmos de instabilidade", "coautoria de notas operacionais"],
  ayla: ["rompe protocolo de silêncio", "organiza blocos para leitura pública", "interligada aos dossiês de 2025"],
  julian: ["cético em relação ao relógio local", "alertas sobre convergência forçada", "atua como revisor de consistência"],
  eleonor: ["arquiva material descartado", "mantém versões intermediárias", "nó central na recuperação de fragmentos"],
  kov1d98: ["classificado inicialmente como ruído", "acelera políticas de contenção", "impacto social não linear"],
  sinal: ["termo técnico e sintoma narrativo", "aparece antes dos eventos críticos", "reativa fluxos ocultos"],
  "lat-ex": ["ponto de teste e refração", "mudanças de acesso sem aviso", "mencionado em protocolos urbanos"],
};

export function relatedQuotes(slug: string) {
  const seed = slug.length;
  return BOOK_QUOTES.filter((_, index) => index % 6 === seed % 6).slice(0, 4);
}

export const CORE_TRANSMISSIONS = [
  { id: "tx-07", title: "TX-07 // redacted", body: [BOOK_QUOTES[4], BOOK_QUOTES[38]] },
  { id: "tx-08", title: "TX-08 // redacted", body: [BOOK_QUOTES[31], BOOK_QUOTES[42]] },
  { id: "tx-09", title: "TX-09 // redacted", body: [BOOK_QUOTES[20], BOOK_QUOTES[44]] },
];
