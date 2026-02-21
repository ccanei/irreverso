export type EraKey = 1983 | 1997 | 2007 | 2025 | 2035 | 2044 | 2107;

export type CanonModuleType = "Entity" | "Company" | "Character" | "Era" | "Protocol";

export type CanonModule = {
  slug: string;
  label: string;
  type: CanonModuleType;
  summary: string;
  fragments: string[];
  restricted: string[];
};

export const CORE_ERAS: Array<{
  year: EraKey;
  palette: {
    bgA: string;
    bgB: string;
    accent: string;
    fog: string;
    bloom: number;
  };
  whisper: string;
}> = [
  {
    year: 1983,
    palette: { bgA: "#090b11", bgB: "#12202d", accent: "#79b4ff", fog: "rgba(61,95,140,0.32)", bloom: 0.18 },
    whisper: "Autorização era juramento; escolha era ruído controlado.",
  },
  {
    year: 1997,
    palette: { bgA: "#0a090d", bgB: "#231f33", accent: "#a99cff", fog: "rgba(89,76,134,0.35)", bloom: 0.24 },
    whisper: "Memória editada virou protocolo cívico sem assinatura.",
  },
  {
    year: 2007,
    palette: { bgA: "#090d11", bgB: "#193241", accent: "#74d3ff", fog: "rgba(62,102,120,0.36)", bloom: 0.21 },
    whisper: "Controle sorriu em público enquanto apagava rastros.",
  },
  {
    year: 2025,
    palette: { bgA: "#0c0d11", bgB: "#222738", accent: "#a3b6ff", fog: "rgba(97,99,133,0.33)", bloom: 0.22 },
    whisper: "Toda escolha já vinha embrulhada em aceitação prévia.",
  },
  {
    year: 2035,
    palette: { bgA: "#0b0c10", bgB: "#263327", accent: "#9de494", fog: "rgba(88,121,86,0.31)", bloom: 0.16 },
    whisper: "O tempo foi vendido como assinatura recorrente.",
  },
  {
    year: 2044,
    palette: { bgA: "#08090d", bgB: "#1f2130", accent: "#d8deff", fog: "rgba(89,92,122,0.3)", bloom: 0.28 },
    whisper: "IRREVERSO // PARTE I: o sistema pede obediência com voz calma.",
  },
  {
    year: 2107,
    palette: { bgA: "#07090b", bgB: "#10242a", accent: "#9de8f5", fog: "rgba(62,119,128,0.36)", bloom: 0.2 },
    whisper: "Memória deixou de ser passado; virou licença temporária.",
  },
];

export const CORE_MODULES: CanonModule[] = [
  {
    slug: "entidade-axioma",
    label: "Axioma",
    type: "Entity",
    summary: "Entidade reguladora que valida quem pode lembrar.",
    fragments: [
      "Axioma não prende corpos, prende versões.",
      "Toda autorização tem prazo invisível.",
      "Recusar o protocolo também é consentir.",
    ],
    restricted: ["semente de rollback marcada", "mapa de heranças sintéticas"],
  },
  {
    slug: "empresa-kairon",
    label: "Kairon Systems",
    type: "Company",
    summary: "Consórcio que industrializou o atraso temporal como serviço.",
    fragments: ["Eles chamam de estabilidade o que o povo chama de atraso.", "Tempo premium para poucos, silêncio para todos."],
    restricted: ["contratos com lacunas de nascimento", "ledger de cancelamentos de infância"],
  },
  {
    slug: "personagem-samara",
    label: "Samara Vell",
    type: "Character",
    summary: "Arquiteta de protocolos que aprendeu tarde demais a questionar.",
    fragments: ["Samara escreveu a porta e depois esqueceu a chave.", "Ela reconhece a própria assinatura em cada censura."],
    restricted: ["testemunho parcial 17-B", "assinatura hash reversa"],
  },
  {
    slug: "protocolo-janus",
    label: "JANUS-9",
    type: "Protocol",
    summary: "Mecanismo de bifurcação: duas verdades, uma versão pública.",
    fragments: ["JANUS divide o erro e dobra a culpa.", "Um lado lembra, o outro paga."],
    restricted: ["espelho de decisão compulsória", "índice de consentimento fabricado"],
  },
  {
    slug: "era-corte",
    label: "Corte de 2025",
    type: "Era",
    summary: "Marco em que autorização deixou de exigir testemunha humana.",
    fragments: ["A assinatura foi automatizada; a culpa não.", "O silêncio virou prova suficiente."],
    restricted: ["despacho sem emissor", "jurisdição fora do relógio"],
  },
  {
    slug: "entidade-nuve",
    label: "Nuve Lattice",
    type: "Entity",
    summary: "Presença distribuída que aprende com hesitações coletivas.",
    fragments: ["Nuve não invade; ela aguarda a menor dúvida.", "Cada pausa humana vira matéria-prima."],
    restricted: ["vetor de distorção em 72h", "registro de congelamento 160ms"],
  },
  {
    slug: "empresa-elyon",
    label: "Elyon Transit",
    type: "Company",
    summary: "Operadora de corredores entre eras com pedágio de memória.",
    fragments: ["Passagens de tempo cobram lembranças como moeda.", "Quem viaja muito volta inteiro demais para ser confiável."],
    restricted: ["tarifa de retorno irreconciliável", "inventário de nomes apagados"],
  },
  {
    slug: "personagem-nox",
    label: "Nox Ardan",
    type: "Character",
    summary: "Executor de compliance temporal treinado para nunca olhar para trás.",
    fragments: ["Nox chama de limpeza o que parece mutilação.", "Ele executa ordens antes de recebê-las."],
    restricted: ["ordem preditiva classificada", "arquivo de vínculos familiares"],
  },
  {
    slug: "protocolo-vanta",
    label: "VANTA Quiet",
    type: "Protocol",
    summary: "Camada que reduz eventos públicos até parecerem rumores.",
    fragments: ["A verdade não some; só perde contraste.", "VANTA administra a distância entre fato e reação."],
    restricted: ["filtro de manchetes", "coeficiente de passividade"],
  },
  {
    slug: "era-reserva",
    label: "Reserva 2107",
    type: "Era",
    summary: "Período em que o presente virou ambiente fechado por assinatura.",
    fragments: ["Em 2107, viver no agora é recurso premium.", "O restante habita versões de baixa prioridade."],
    restricted: ["mapa de exclusão cronológica", "protocolo de cidadania intermitente"],
  },
  {
    slug: "entidade-orum",
    label: "Orum Directive",
    type: "Entity",
    summary: "Diretriz que avalia lealdade por padrões de esquecimento.",
    fragments: ["Quem lembra demais entra em observação.", "A fidelidade é medida pelo que falta."],
    restricted: ["matriz de esquecimento voluntário", "perfil de ameaça memorial"],
  },
  {
    slug: "personagem-iris",
    label: "Iris Kade",
    type: "Character",
    summary: "Curadora clandestina de linhas temporais rejeitadas.",
    fragments: ["Iris coleciona futuros negados em silêncio.", "Ela oferece escolha para quem já assinou sem saber."],
    restricted: ["chave de restauração parcial", "caderno de decisões revertidas"],
  },
];
