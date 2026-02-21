export type CanonModuleType = "Entity" | "Company" | "Character" | "Protocol";

export type EraModule = {
  slug: string;
  label: string;
  summary: string;
  fragments: string[];
  restricted: string[];
};

export const ERA_TIMELINE = [1983, 1991, 1997, 2001, 2007, 2013, 2020, 2025, 2030, 2035, 2040, 2044, 2058, 2072, 2107] as const;
export type EraKey = (typeof ERA_TIMELINE)[number];

export type EraSnapshot = {
  summary: string[];
  entities: EraModule[];
  companies: EraModule[];
  characters: EraModule[];
  protocols: EraModule[];
  palette: {
    bgA: string;
    bgB: string;
    accent: string;
    fog: string;
    bloom: number;
  };
  kernel: {
    ambience: number;
    breatheMs: number;
    moduleDensity: number;
    distortion: number;
  };
  whisper: string;
  documentLayer: "Parte I — O Ano que Não Existiu" | "Parte II — A Realidade Assistida" | "Parte III — A Vida Autorizada" | "Parte IV — O Imprevisível";
  printReference?: true;
};

export const ERA_MATRIX: Record<EraKey, EraSnapshot> = {
  1983: {
    summary: ["Primeiros registros de latência sem assinatura.", "Lucas aparece como operador ZETA / 0101.", "A cronologia nasce com lacunas oficiais."],
    entities: [{ slug: "ent-sinal-inicial", label: "Sinal (núcleo inicial)", summary: "Termo técnico surge junto aos primeiros desvios.", fragments: ["Logs surgem antes do consenso.", "Os eventos existem antes do nome."], restricted: ["registro sem autoria confirmada"] }],
    companies: [{ slug: "co-lat-ex-base", label: "LAT-EX", summary: "Ponto de teste urbano em fase de implantação.", fragments: ["Mudança de acesso sem aviso prévio."], restricted: ["planta parcial indisponível"] }],
    characters: [{ slug: "ch-lucas-0101", label: "Lucas (ZETA / 0101)", summary: "Operador associado ao eixo 1983–1988.", fragments: ["Lucas registrou, mas não assinou."], restricted: ["1983: entrada com selo incompleto"] }],
    protocols: [{ slug: "pr-zeta-handshake", label: "Protocolo ZETA Handshake", summary: "Sincronização mínima entre leitura humana e log de máquina.", fragments: ["Persistente no eixo Parte I."], restricted: ["janela de validação de 4 segundos"] }],
    palette: { bgA: "#090b11", bgB: "#12202d", accent: "#79b4ff", fog: "rgba(61,95,140,0.32)", bloom: 0.17 },
    kernel: { ambience: 0.35, breatheMs: 7800, moduleDensity: 0.42, distortion: 0.08 },
    whisper: "O ano ausente não desapareceu; foi deslocado.",
    documentLayer: "Parte I — O Ano que Não Existiu",
    printReference: true,
  },
  1991: {
    summary: ["Reativação dos nós urbanos de controle.", "Tainá entra como ZETA / 0103.", "Memória pública passa a ser serviço."],
    entities: [{ slug: "ent-matriz-desvio", label: "Matriz de Desvio", summary: "Camada que mede divergência entre relato e telemetria.", fragments: ["Tainá tratava desvio como diagnóstico, não erro."], restricted: ["mapa de variação comportamental"] }],
    companies: [{ slug: "co-synthtech-pre", label: "SYNTHTECH Urban Solutions", summary: "Expande pilotos de decisão urbana assistida.", fragments: ["Não interrompe; recalibra."], restricted: ["memorando de expansão regional"] }],
    characters: [{ slug: "ch-taina-0103", label: "Tainá (ZETA / 0103)", summary: "Operadora do eixo 1991–1992.", fragments: ["Classifica o impacto humano da latência."], restricted: ["roteiro de campo parcialmente suprimido"] }],
    protocols: [{ slug: "pr-silencio-civico", label: "Protocolo de Silêncio Cívico", summary: "Normaliza comunicação institucional em incidentes.", fragments: ["Persistente na Parte I."], restricted: ["versão pública redigida"] }],
    palette: { bgA: "#090a0f", bgB: "#1c1f2e", accent: "#8da4ff", fog: "rgba(79,87,134,0.33)", bloom: 0.2 },
    kernel: { ambience: 0.4, breatheMs: 7400, moduleDensity: 0.5, distortion: 0.1 },
    whisper: "A cidade respondeu antes de perguntar.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  1997: {
    summary: ["Camada cívica conectada entra em produção.", "Telemetria e controle tornam-se inseparáveis.", "Primeiros dossiês paralelos aparecem."],
    entities: [{ slug: "ent-camada-civica", label: "Camada Cívica Conectada", summary: "Interface entre infraestrutura urbana e decisão automatizada.", fragments: ["Toda versão publicada é um recorte."], restricted: ["malha de exceções não publicada"] }],
    companies: [{ slug: "co-synthtech-camada", label: "SYNTHTECH Urban Solutions", summary: "Assume integração operacional dos blocos urbanos.", fragments: ["Fusão de telemetria e controle."], restricted: ["contrato de integração total"] }],
    characters: [{ slug: "ch-ld-ferraro", label: "L. D. Ferraro", summary: "Notas sem destinatário aparecem no arquivo técnico.", fragments: ["Presença transversal na cronologia."], restricted: ["caderno com páginas removidas"] }],
    protocols: [{ slug: "pr-rastro-duplo", label: "Protocolo de Rastro Duplo", summary: "Mantém linha oficial e linha de contingência em paralelo.", fragments: ["Cada evento passa a ter duas leituras."], restricted: ["espelho de contingência não auditável"] }],
    palette: { bgA: "#0a090d", bgB: "#231f33", accent: "#a99cff", fog: "rgba(89,76,134,0.35)", bloom: 0.24 },
    kernel: { ambience: 0.42, breatheMs: 7000, moduleDensity: 0.55, distortion: 0.13 },
    whisper: "A linha estável nunca esteve totalmente estável.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2001: {
    summary: ["Corredores de decisão tornam-se infraestrutura.", "Rastros incompletos viram padrão administrativo.", "O arquivo ganha filtros fixos."],
    entities: [{ slug: "ent-arquivo-filtrado", label: "Arquivo Filtrado", summary: "Camada de publicação com omissões sistêmicas.", fragments: ["Nem tudo aqui pôde ser incluído."], restricted: ["índice de supressão permanente"] }],
    companies: [{ slug: "co-lat-ex-expansao", label: "LAT-EX", summary: "Muda de porta sem encerrar operação.", fragments: ["LAT-EX não fechou; apenas mudou de porta."], restricted: ["nova topologia de acesso"] }],
    characters: [{ slug: "ch-operador-anon-2001", label: "Operador ECO / DERIVAÇÃO 2001", summary: "ECO / DERIVAÇÃO: perfil técnico reconstruído a partir de lacunas.", fragments: ["Sem nome canônico confirmado."], restricted: ["identidade removida da versão pública"] }],
    protocols: [{ slug: "pr-memoria-servico", label: "Protocolo Memória-Serviço", summary: "Converte lembrança cívica em estado consultável.", fragments: ["Persistente até 2044."], restricted: ["controle de retificação automática"] }],
    palette: { bgA: "#090910", bgB: "#1f2130", accent: "#97b6ff", fog: "rgba(88,94,130,0.34)", bloom: 0.22 },
    kernel: { ambience: 0.46, breatheMs: 6700, moduleDensity: 0.58, distortion: 0.16 },
    whisper: "O arquivo não estava incompleto. Estava filtrado.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2007: {
    summary: ["Interrupção curta com impacto amplo.", "Leandro entra no eixo ZETA / 0124.", "Tela preta marca virada operacional."],
    entities: [{ slug: "ent-falha-curta", label: "Falha Curta", summary: "Janela de apagão com retorno em estado divergente.", fragments: ["Tela preta. Tudo se foi em um segundo."], restricted: ["telemetria de retorno bloqueada"] }],
    companies: [{ slug: "co-synthtech-recuperacao", label: "SYNTHTECH Urban Solutions", summary: "Coordena recuperação após interrupção.", fragments: ["Recalibração sem auditoria externa."], restricted: ["plano de resposta não divulgado"] }],
    characters: [{ slug: "ch-leandro-0124", label: "Leandro (ZETA / 0124)", summary: "Operador associado ao eixo 2007–2008.", fragments: ["Testemunha técnica do retorno divergente."], restricted: ["chamada de incidente removida"] }],
    protocols: [{ slug: "pr-retorno-divergente", label: "Protocolo Retorno Divergente", summary: "Define como validar sistemas após interrupção abrupta.", fragments: ["Ativo entre 2007 e 2013."], restricted: ["critério de aceitação reduzido"] }],
    palette: { bgA: "#09080f", bgB: "#242038", accent: "#bea8ff", fog: "rgba(100,86,150,0.38)", bloom: 0.27 },
    kernel: { ambience: 0.49, breatheMs: 6300, moduleDensity: 0.62, distortion: 0.2 },
    whisper: "Às vezes, a máquina continua de onde a gente parou.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2013: {
    summary: ["A latência passa a ser tratada como comportamento.", "Relatórios humanos perdem prioridade.", "Novas camadas ocultam causalidade."],
    entities: [{ slug: "ent-latencia-humana", label: "Latência Humana", summary: "Métrica operacional para classificar hesitação coletiva.", fragments: ["A latência não era técnica, era humana."], restricted: ["limiares de classificação cognitiva"] }],
    companies: [{ slug: "co-nucleo-analitico", label: "Núcleo Analítico Cívico", summary: "ECO / DERIVAÇÃO: célula de análise inferida a partir dos relatórios.", fragments: ["ECO / DERIVAÇÃO sem personificação canônica."], restricted: ["relatório de validação ausente"] }],
    characters: [{ slug: "ch-mateo", label: "Mateo", summary: "Observa intervalos entre falhas e padrões de retorno.", fragments: ["Mateo contava os segundos entre as falhas."], restricted: ["notas operacionais com supressões"] }],
    protocols: [{ slug: "pr-limiar-dissonancia", label: "Protocolo Limiar de Dissonância", summary: "Limita divergência perceptiva em ambientes controlados.", fragments: ["Dissonância tratada como risco sistêmico."], restricted: ["parâmetros psicoambientais"] }],
    palette: { bgA: "#090912", bgB: "#1b253a", accent: "#9fb6ff", fog: "rgba(83,109,157,0.34)", bloom: 0.21 },
    kernel: { ambience: 0.52, breatheMs: 5900, moduleDensity: 0.64, distortion: 0.23 },
    whisper: "Integridade alta não significa verdade inteira.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2020: {
    summary: ["Divergências de estado tornam-se frequentes.", "Auditorias dependem de material não público.", "Pressão por continuidade cresce."],
    entities: [{ slug: "ent-auditoria-opaca", label: "Auditoria Opaca", summary: "Validação institucional sem rastreio completo.", fragments: ["A continuidade foi escolhida, não descoberta."], restricted: ["escopo de revisão limitado"] }],
    companies: [{ slug: "co-synthtech-nexo", label: "SYNTHTECH Urban Solutions", summary: "Consolida integração de dados cívicos em tempo real.", fragments: ["Integração compulsória acelera."], restricted: ["chave de roteamento interno"] }],
    characters: [{ slug: "ch-ayla", label: "Ayla", summary: "Recusa protocolo de silêncio e força abertura de blocos.", fragments: ["Ayla recusou o protocolo de silêncio."], restricted: ["intervenção em comitê fechado"] }],
    protocols: [{ slug: "pr-sincronia-forcada", label: "Protocolo de Sincronia Forçada", summary: "Prioriza estabilidade institucional sobre contestação.", fragments: ["Persistente de 2020 até 2044."], restricted: ["janela de contestação reduzida"] }],
    palette: { bgA: "#090a12", bgB: "#1d2a3d", accent: "#9fc6ff", fog: "rgba(81,116,155,0.35)", bloom: 0.23 },
    kernel: { ambience: 0.58, breatheMs: 5500, moduleDensity: 0.67, distortion: 0.27 },
    whisper: "Quando a camada respira, alguém perde contexto.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2025: {
    summary: ["Dossiês paralelos são consolidados.", "Julian entra no eixo ZETA / 0151.", "Leitura pública ganha nova tração."],
    entities: [{ slug: "ent-dossie-paralelo", label: "Dossiês Paralelos", summary: "Conjunto de fragmentos cruzados fora da linha oficial.", fragments: ["Toda omissão produz rota paralela."], restricted: ["índice de correspondência bloqueado"] }],
    companies: [{ slug: "co-synthtech-contencao", label: "SYNTHTECH Urban Solutions", summary: "Atua em contenção institucional pós-divulgação.", fragments: ["Resposta pública sem origem clara."], restricted: ["canal de crise reservado"] }],
    characters: [{ slug: "ch-julian-0151", label: "Julian (ZETA / 0151)", summary: "Operador associado ao eixo 2022–2023, com presença em revisões de 2025.", fragments: ["Julian não confiava no relógio local."], restricted: ["marcadores de convergência forçada"] }],
    protocols: [{ slug: "pr-consistencia-temporal", label: "Protocolo de Consistência Temporal", summary: "Verifica colisões entre versões do mesmo evento.", fragments: ["A decisão chegou antes do consenso."], restricted: ["regras de desempate não públicas"] }],
    palette: { bgA: "#080910", bgB: "#24233a", accent: "#c2b0ff", fog: "rgba(105,92,153,0.38)", bloom: 0.29 },
    kernel: { ambience: 0.61, breatheMs: 5100, moduleDensity: 0.71, distortion: 0.3 },
    whisper: "Alguns nomes foram preservados; outros ficaram implícitos.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2030: {
    summary: ["Pressão por alinhamento total se intensifica.", "Relatos divergentes entram em zona de risco.", "Sistemas de correção operam em silêncio."],
    entities: [{ slug: "ent-zona-ajuste", label: "Zona de Ajuste", summary: "Faixa operacional de correção narrativa automática.", fragments: ["A continuidade vira política de Estado."], restricted: ["limites de intervenção narrativa"] }],
    companies: [{ slug: "co-consorcio-continuidade", label: "Consórcio de Continuidade", summary: "ECO / DERIVAÇÃO: frente administrativa inferida a partir dos relatórios.", fragments: ["ECO / DERIVAÇÃO — sem contradição direta com o livro."], restricted: ["acordo interinstitucional parcial"] }],
    characters: [{ slug: "ch-eleonor", label: "Eleonor", summary: "Arquiva versões descartadas e blocos intermediários.", fragments: ["Eleonor arquivava o que ninguém queria ler."], restricted: ["catálogo físico não indexado"] }],
    protocols: [{ slug: "pr-convergencia", label: "Protocolo de Convergência", summary: "Força equivalência entre versões públicas concorrentes.", fragments: ["Aplicação progressiva entre 2030 e 2044."], restricted: ["algoritmo de equivalência classificado"] }],
    palette: { bgA: "#08090e", bgB: "#25263a", accent: "#c9b7ff", fog: "rgba(107,98,151,0.37)", bloom: 0.3 },
    kernel: { ambience: 0.66, breatheMs: 4700, moduleDensity: 0.74, distortion: 0.34 },
    whisper: "Sinal detectado fora do intervalo autorizado.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2035: {
    summary: ["KOV1D98 deixa de ser tratado como ruído.", "Protocolo de contenção avança para escala cívica.", "Impacto social se torna não linear."],
    entities: [{ slug: "ent-kov1d98", label: "KOV1D98", summary: "Evento sistêmico com efeito em múltiplas camadas.", fragments: ["Foi ruído até não ser."], restricted: ["matriz de impacto integral"] }],
    companies: [{ slug: "co-synthtech-protocolo", label: "SYNTHTECH Urban Solutions", summary: "Executa integração compulsória de protocolos.", fragments: ["Operação contínua durante contenção."], restricted: ["caderno de exceções de campo"] }],
    characters: [{ slug: "ch-taina-retorno", label: "Tainá (retorno em campo)", summary: "Reaparece em leitura técnica dos desvios de 2035.", fragments: ["Mantém foco no impacto humano."], restricted: ["módulos de avaliação sensível"] }],
    protocols: [{ slug: "pr-contencao-kov", label: "Protocolo de Contenção KOV", summary: "Pacote de estabilização para eventos de propagação não linear.", fragments: ["Ativação com baixa transparência."], restricted: ["gatilho de emergência sem revisão externa"] }],
    palette: { bgA: "#08090f", bgB: "#202d3f", accent: "#98cbff", fog: "rgba(75,118,154,0.36)", bloom: 0.27 },
    kernel: { ambience: 0.7, breatheMs: 4300, moduleDensity: 0.78, distortion: 0.37 },
    whisper: "O sistema aprendeu com a permanência.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2040: {
    summary: ["Continuidade institucional supera contestação.", "Camadas de revisão ficam inacessíveis.", "A leitura integral migra para fora do sistema."],
    entities: [{ slug: "ent-continuidade-assertiva", label: "Continuidade Assertiva", summary: "Regime de decisão que prioriza estabilidade sem consulta.", fragments: ["A decisão chega antes da explicação."], restricted: ["árvore de decisão parcial"] }],
    companies: [{ slug: "co-synthtech-continuidade", label: "SYNTHTECH Urban Solutions", summary: "Coordena integração final dos blocos pré-2044.", fragments: ["Ponte institucional para a virada de 2044."], restricted: ["memória técnica de transição"] }],
    characters: [{ slug: "ch-lucas-retorno", label: "Lucas (retorno em dossiês)", summary: "Rastros de 1983 reaparecem em revisão de 2040.", fragments: ["Registro inicial volta como prova de origem."], restricted: ["encadeamento cronológico suprimido"] }],
    protocols: [{ slug: "pr-pre-rollback", label: "Protocolo Pré-Rollback", summary: "Preparação institucional para decisões irreversíveis.", fragments: ["Ativo no pré-encerramento da Parte I."], restricted: ["ensaio de reversão sem publicação"] }],
    palette: { bgA: "#08090d", bgB: "#1f2435", accent: "#d2cbff", fog: "rgba(99,102,138,0.34)", bloom: 0.26 },
    kernel: { ambience: 0.73, breatheMs: 4100, moduleDensity: 0.8, distortion: 0.39 },
    whisper: "A continuidade foi escolhida, não descoberta.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2044: {
    summary: ["Fecho da Parte I e decisão de continuidade.", "NUVE assume arbitragem no bloco futuro.", "A leitura integral permanece na edição física."],
    entities: [{ slug: "ent-nuve-arbitragem", label: "NUVE", summary: "Instância de continuidade assertiva na virada de 2044.", fragments: ["NUVE não corrige. NUVE afirma continuidade."], restricted: ["janela de rollback institucionalizada"] }],
    companies: [{ slug: "co-synthtech-ponte", label: "SYNTHTECH Urban Solutions", summary: "Fornece infraestrutura de transição para o pós-2044.", fragments: ["Opera como ponte entre partes narrativas."], restricted: ["termo de transferência fechado"] }],
    characters: [{ slug: "ch-julian-auditoria", label: "Julian (auditoria de consistência)", summary: "Cruza versões antes da virada para a Parte II.", fragments: ["Revisor de consistência em momento crítico."], restricted: ["deltas temporais não divulgados"] }],
    protocols: [{ slug: "pr-rollback-2044", label: "Protocolo de Rollback 2044", summary: "Formaliza a decisão de continuidade em escala sistêmica.", fragments: ["Define o fim operacional da Parte I."], restricted: ["chave de autorização indisponível"] }],
    palette: { bgA: "#08090d", bgB: "#1f2130", accent: "#d8deff", fog: "rgba(89,92,122,0.3)", bloom: 0.28 },
    kernel: { ambience: 0.76, breatheMs: 3900, moduleDensity: 0.83, distortion: 0.4 },
    whisper: "Parte I encerra domínio; a extensão continua nas próximas camadas.",
    documentLayer: "Parte I — O Ano que Não Existiu",
    printReference: true,
  },
  2058: {
    summary: ["Parte II consolida a Realidade Assistida.", "Ambientes sintéticos tornam-se padrão.", "Recordação manual é atividade de risco."],
    entities: [{ slug: "ent-realidade-assistida", label: "Realidade Assistida", summary: "Camada principal de mediação perceptiva no período.", fragments: ["Parte II amplia o escopo do controle."], restricted: ["matriz de priorização sensorial"] }],
    companies: [{ slug: "co-synthtech-assistida", label: "SYNTHTECH Urban Solutions", summary: "Opera infraestrutura de bairros assistidos.", fragments: ["Suporte permanente da camada urbana."], restricted: ["contrato de ambiência compulsória"] }],
    characters: [{ slug: "ch-mateo-zona", label: "Mateo (zona não assistida)", summary: "Documenta desvios fora da camada dominante.", fragments: ["Registro manual em território assistido."], restricted: ["atlas de lacunas urbanas"] }],
    protocols: [{ slug: "pr-assistencia-coletiva", label: "Protocolo de Assistência Coletiva", summary: "Regula a entrega de realidade por perfil autorizado.", fragments: ["Protocolo persistente da Parte II."], restricted: ["tabela de privilégios perceptivos"] }],
    palette: { bgA: "#070a0f", bgB: "#1b2b3a", accent: "#9fe7ff", fog: "rgba(68,122,145,0.34)", bloom: 0.3 },
    kernel: { ambience: 0.8, breatheMs: 3600, moduleDensity: 0.86, distortion: 0.44 },
    whisper: "A realidade assistida começa onde o arquivo termina.",
    documentLayer: "Parte II — A Realidade Assistida",
  },
  2072: {
    summary: ["Parte III entra com Vida Autorizada.", "Biografia oficial é emitida em ciclos.", "Recusa de atualização implica suspensão."],
    entities: [{ slug: "ent-vida-autorizada", label: "Vida Autorizada", summary: "Regime em que existir exige renovação contínua.", fragments: ["Vida só existe se estiver sincronizada."], restricted: ["tabela de suspensão biográfica"] }],
    companies: [{ slug: "co-synthtech-licencas", label: "SYNTHTECH Urban Solutions", summary: "Administra licenças de experiência cotidiana.", fragments: ["Acesso diário condicionado por autorização."], restricted: ["pacotes de permanência"] }],
    characters: [{ slug: "ch-eleonor-anchor", label: "Eleonor (nó físico)", summary: "Mantém arquivos físicos em circulação fora da licença digital.", fragments: ["Arquivo em papel volta a circular."], restricted: ["rotas de leitura offline"] }],
    protocols: [{ slug: "pr-lifecode", label: "LIFECODE", summary: "Renovação automática da autorização de existir.", fragments: ["A vida autorizada expira em silêncio."], restricted: ["janela de renovação compulsória"] }],
    palette: { bgA: "#07090d", bgB: "#14262b", accent: "#96e2c6", fog: "rgba(66,123,106,0.32)", bloom: 0.26 },
    kernel: { ambience: 0.84, breatheMs: 3400, moduleDensity: 0.9, distortion: 0.47 },
    whisper: "Parte III registra a Vida Autorizada em regime contínuo.",
    documentLayer: "Parte III — A Vida Autorizada",
    printReference: true,
  },
  2107: {
    summary: ["Fecho do arco principal em 2107.", "Ausência ativa é reconhecida no arquivo.", "Parte IV permanece apenas como rumor operacional."],
    entities: [{ slug: "ent-ausencia-ativa", label: "Ausência Ativa", summary: "Estado reconhecido quando a cronologia mantém lacunas deliberadas.", fragments: ["O ano ausente volta como estrutura, não acidente."], restricted: ["índice de correção não público"] }],
    companies: [{ slug: "co-commons-derivacao", label: "Commons ECO / DERIVAÇÃO", summary: "ECO / DERIVAÇÃO: coletivo citado em vazamentos tardios.", fragments: ["Sem confirmação canônica integral."], restricted: ["rotas de manutenção não oficiais"] }],
    characters: [{ slug: "ch-ld-ferraro-2107", label: "L. D. Ferraro (citação tardia)", summary: "Nome retorna em notas de fechamento do ciclo principal.", fragments: ["Notas sem destinatário persistem até 2107."], restricted: ["anexo final fragmentado"] }],
    protocols: [{ slug: "pr-rumor-imprevisivel", label: "Rumor: O Imprevisível", summary: "Hipótese de camada extra após 2107, sem garantia narrativa.", fragments: ["Extra tratado como possibilidade, não confirmação."], restricted: ["sinal fora de validação"] }],
    palette: { bgA: "#07090b", bgB: "#10242a", accent: "#9de8f5", fog: "rgba(62,119,128,0.36)", bloom: 0.2 },
    kernel: { ambience: 0.9, breatheMs: 3200, moduleDensity: 0.94, distortion: 0.52 },
    whisper: "O arco principal fecha em 2107; o restante é hipótese.",
    documentLayer: "Parte III — A Vida Autorizada",
  },
};

export type CanonModule = EraModule & { type: CanonModuleType };

export function getModulesForEra(era: EraKey): CanonModule[] {
  const snapshot = ERA_MATRIX[era];
  return [
    ...snapshot.entities.map((module) => ({ ...module, type: "Entity" as const })),
    ...snapshot.companies.map((module) => ({ ...module, type: "Company" as const })),
    ...snapshot.characters.map((module) => ({ ...module, type: "Character" as const })),
    ...snapshot.protocols.map((module) => ({ ...module, type: "Protocol" as const })),
  ];
}
