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
    summary: ["Primeiro corte de memória institucional.", "Entidades testam autorização em silêncio.", "Cronologia oficial nasce incompleta."],
    entities: [{ slug: "ent-axioma-seed", label: "Axioma Seed", summary: "Núcleo regulador em fase de protótipo.", fragments: ["A seed mede hesitação humana.", "Nenhum veto deixa assinatura."], restricted: ["lote alfa sem auditoria"] }],
    companies: [{ slug: "co-kairon-lab", label: "Kairon Lab", summary: "Laboratório civil-militar de latência temporal.", fragments: ["Estabilidade vendida como proteção."], restricted: ["orçamento sem origem"] }],
    characters: [{ slug: "ch-samara-trainee", label: "Samara Vell (trainee)", summary: "Ainda aprende a linguagem dos protocolos.", fragments: ["Ela chama controle de arquitetura."], restricted: ["credencial provisória 17"] }],
    protocols: [{ slug: "pr-janus-0", label: "JANUS-0", summary: "Versão embrionária de bifurcação narrativa.", fragments: ["Dois logs para um mesmo evento."], restricted: ["espelho incompleto"] }],
    palette: { bgA: "#090b11", bgB: "#12202d", accent: "#79b4ff", fog: "rgba(61,95,140,0.32)", bloom: 0.17 },
    kernel: { ambience: 0.35, breatheMs: 7800, moduleDensity: 0.42, distortion: 0.08 },
    whisper: "Autorização era juramento; escolha era ruído controlado.",
    documentLayer: "Parte I — O Ano que Não Existiu",
    printReference: true,
  },
  1991: {
    summary: ["Pilotos regionais expandem o controle.", "A memória pública vira serviço.", "Primeiras falhas deixam ecos."],
    entities: [{ slug: "ent-axioma-grid", label: "Axioma Grid", summary: "Rede inicial de validação de lembranças.", fragments: ["A grade aprende com recusas."], restricted: ["mapa de bairros bloqueados"] }],
    companies: [{ slug: "co-elyon-pre", label: "Elyon Precursor", summary: "Operadora logística para deslocamentos temporais curtos.", fragments: ["Passagem cobrada em rastros."], restricted: ["tarifa cinza"] }],
    characters: [{ slug: "ch-nox-cadet", label: "Nox Ardan (cadet)", summary: "Treinado para execução antecipada.", fragments: ["Cumpre ordens antes do briefing."], restricted: ["família removida do registro"] }],
    protocols: [{ slug: "pr-vanta-rho", label: "VANTA-rho", summary: "Redução de contraste em incidentes públicos.", fragments: ["A verdade permanece, mas quase invisível."], restricted: ["filtro de manchetes"] }],
    palette: { bgA: "#090a0f", bgB: "#1c1f2e", accent: "#8da4ff", fog: "rgba(79,87,134,0.33)", bloom: 0.2 },
    kernel: { ambience: 0.4, breatheMs: 7400, moduleDensity: 0.5, distortion: 0.1 },
    whisper: "Memória editada virou protocolo cívico sem assinatura.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  1997: {
    summary: ["Integração entre entidades e mercado.", "Consentimento automático entra em beta.", "Arquivos paralelos se multiplicam."],
    entities: [{ slug: "ent-nuve-lattice", label: "Nuve Lattice", summary: "Presença distribuída que observa indecisões.", fragments: ["Nuve aguarda a menor dúvida."], restricted: ["congelamento 160ms"] }],
    companies: [{ slug: "co-kairon-systems", label: "Kairon Systems", summary: "Consórcio que comercializa atraso temporal.", fragments: ["Tempo premium para poucos."], restricted: ["ledger de cancelamentos"] }],
    characters: [{ slug: "ch-eleonor-archive", label: "Eleonor Dray", summary: "Arquivista de versões descartadas.", fragments: ["Ela preserva o que seria apagado."], restricted: ["índice de descarte"] }],
    protocols: [{ slug: "pr-janus-3", label: "JANUS-3", summary: "Bifurcação operacional em ambientes civis.", fragments: ["Um lado lembra, outro paga."], restricted: ["consentimento fabricado"] }],
    palette: { bgA: "#0a090d", bgB: "#231f33", accent: "#a99cff", fog: "rgba(89,76,134,0.35)", bloom: 0.24 },
    kernel: { ambience: 0.42, breatheMs: 7000, moduleDensity: 0.55, distortion: 0.13 },
    whisper: "Mercado e contenção assinaram o mesmo contrato.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2001: {
    summary: ["A infraestrutura deixa de ser experimental.", "Corredores entre eras tornam-se produto.", "Protocolos passam a prever comportamento."],
    entities: [{ slug: "ent-orum-draft", label: "Orum Draft", summary: "Diretriz que mede lealdade por lacunas de memória.", fragments: ["Fidelidade medida pelo que falta."], restricted: ["matriz beta de esquecimento"] }],
    companies: [{ slug: "co-elyon-transit", label: "Elyon Transit", summary: "Corredores temporais com pedágio memorial.", fragments: ["Retorno exige perda compensatória."], restricted: ["tarifa irreconciliável"] }],
    characters: [{ slug: "ch-samara-architect", label: "Samara Vell", summary: "Arquiteta dos protocolos de autorização.", fragments: ["Escreveu a porta e esqueceu a chave."], restricted: ["hash reversa"] }],
    protocols: [{ slug: "pr-bastion-11", label: "BASTION-11", summary: "Camada de contenção para eventos simultâneos.", fragments: ["Falha local vira ruído global."], restricted: ["corte de redundância"] }],
    palette: { bgA: "#090b10", bgB: "#18303b", accent: "#74c8ff", fog: "rgba(64,100,123,0.33)", bloom: 0.21 },
    kernel: { ambience: 0.46, breatheMs: 6600, moduleDensity: 0.58, distortion: 0.15 },
    whisper: "Controle sorriu em público enquanto apagava rastros.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2007: {
    summary: ["Escala nacional para autorizações automatizadas.", "Interferência editorial torna-se padrão.", "Compliance temporal ganha força executiva."],
    entities: [{ slug: "ent-axioma-civic", label: "Axioma Civic", summary: "Validação em tempo real de lembranças públicas.", fragments: ["Recusar o protocolo também é consentir."], restricted: ["lista de recusas válidas"] }],
    companies: [{ slug: "co-kairon-public", label: "Kairon Public Grid", summary: "Infraestrutura civil de monitoramento temporal.", fragments: ["Latência vendida como paz social."], restricted: ["contratos sem testemunha"] }],
    characters: [{ slug: "ch-nox-operator", label: "Nox Ardan", summary: "Executor de limpeza temporal.", fragments: ["Limpeza com aparência de rotina."], restricted: ["ordem preditiva"] }],
    protocols: [{ slug: "pr-vanta-quiet", label: "VANTA Quiet", summary: "Reduz eventos públicos até virarem rumor.", fragments: ["A reação chega tarde por design."], restricted: ["coeficiente de passividade"] }],
    palette: { bgA: "#090d11", bgB: "#193241", accent: "#74d3ff", fog: "rgba(62,102,120,0.36)", bloom: 0.21 },
    kernel: { ambience: 0.5, breatheMs: 6200, moduleDensity: 0.6, distortion: 0.18 },
    whisper: "Controle sorriu em público enquanto apagava rastros.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2013: {
    summary: ["Camadas preditivas entram no cotidiano.", "Perfil temporal define acesso a serviços.", "A dúvida vira dado comercial."],
    entities: [{ slug: "ent-nuve-civic", label: "Nuve Civic", summary: "Nuve adaptada para comportamento urbano.", fragments: ["Pausa humana vira matéria-prima."], restricted: ["heatmap de hesitação"] }],
    companies: [{ slug: "co-orbital-insure", label: "Orbital Insure", summary: "Seguradora de risco cronológico.", fragments: ["Cobertura baseada no passado editado."], restricted: ["prêmio por conformidade"] }],
    characters: [{ slug: "ch-iris-shadow", label: "Iris Kade", summary: "Curadora clandestina de linhas rejeitadas.", fragments: ["Coleciona futuros negados."], restricted: ["chave de restauração parcial"] }],
    protocols: [{ slug: "pr-suture", label: "SUTURE", summary: "Costura de lacunas narrativas entre registros.", fragments: ["A emenda sempre parece antiga."], restricted: ["manual de retroedição"] }],
    palette: { bgA: "#0a0c10", bgB: "#1d2835", accent: "#95b8ff", fog: "rgba(82,98,132,0.3)", bloom: 0.23 },
    kernel: { ambience: 0.54, breatheMs: 5900, moduleDensity: 0.62, distortion: 0.2 },
    whisper: "Escolha virou métrica, métrica virou sentença suave.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2020: {
    summary: ["Protocolos emergenciais normalizam contenção.", "Fluxos remotos aceleram autorização.", "Domínio informacional se fecha."],
    entities: [{ slug: "ent-orum-court", label: "Orum Court", summary: "Orum assume auditoria de lealdade em massa.", fragments: ["Quem lembra demais entra em observação."], restricted: ["perfil de ameaça memorial"] }],
    companies: [{ slug: "co-elyon-shelter", label: "Elyon Shelter", summary: "Redes de abrigo temporal para elites.", fragments: ["Abrigo hoje, dívida amanhã."], restricted: ["lista de prioridade de acesso"] }],
    characters: [{ slug: "ch-mateo", label: "Mateo Arx", summary: "Analista de ritmos de instabilidade.", fragments: ["Conta os intervalos entre falhas."], restricted: ["caderno de anomalias"] }],
    protocols: [{ slug: "pr-seal-20", label: "SEAL-20", summary: "Bloqueio de divergências em transmissão pública.", fragments: ["A exceção vira padrão de governança."], restricted: ["matriz de supressão síncrona"] }],
    palette: { bgA: "#0a0b10", bgB: "#22273a", accent: "#a8b8ff", fog: "rgba(92,98,135,0.34)", bloom: 0.25 },
    kernel: { ambience: 0.58, breatheMs: 5500, moduleDensity: 0.67, distortion: 0.23 },
    whisper: "Toda escolha já vinha embrulhada em aceitação prévia.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2025: {
    summary: ["Assinatura automática vira requisito de cidadania.", "Testemunha humana deixa de ser necessária.", "Culpa segue manual, não autoria."],
    entities: [{ slug: "ent-axioma-slate", label: "Axioma Slate", summary: "Axioma torna-se infraestrutura estatal.", fragments: ["Silêncio virou prova suficiente."], restricted: ["despacho sem emissor"] }],
    companies: [{ slug: "co-kairon-license", label: "Kairon License Bureau", summary: "Opera o cadastro de presença autorizada.", fragments: ["Lembrar precisa de licença ativa."], restricted: ["carteira de acesso temporal"] }],
    characters: [{ slug: "ch-samara-drift", label: "Samara Vell (drift)", summary: "Inicia ruptura com a própria arquitetura.", fragments: ["Reconhece sua assinatura em cada censura."], restricted: ["testemunho parcial 17-B"] }],
    protocols: [{ slug: "pr-janus-9", label: "JANUS-9", summary: "Bifurcação oficial: verdade dupla, versão única.", fragments: ["JANUS divide erro e dobra culpa."], restricted: ["índice de consentimento fabricado"] }],
    palette: { bgA: "#0c0d11", bgB: "#222738", accent: "#a3b6ff", fog: "rgba(97,99,133,0.33)", bloom: 0.22 },
    kernel: { ambience: 0.62, breatheMs: 5100, moduleDensity: 0.71, distortion: 0.26 },
    whisper: "O tempo foi vendido como assinatura recorrente.",
    documentLayer: "Parte I — O Ano que Não Existiu",
    printReference: true,
  },
  2030: {
    summary: ["Mercado de versões pessoais explode.", "Estados terceirizam manutenção cronológica.", "Eventos originais tornam-se premium."],
    entities: [{ slug: "ent-nuve-mercato", label: "Nuve Mercato", summary: "Nuve modela demanda por versões alternativas.", fragments: ["Dúvida coletiva vira produto."], restricted: ["catálogo de loops privados"] }],
    companies: [{ slug: "co-mnemosyne", label: "Mnemosyne Capital", summary: "Fundo de investimento em memórias certificadas.", fragments: ["Passado auditado rende dividendos."], restricted: ["carteira de lembranças lastreadas"] }],
    characters: [{ slug: "ch-eleonor-broker", label: "Eleonor Dray (broker)", summary: "Negocia arquivos descartados entre zonas.", fragments: ["Vende o que foi proibido lembrar."], restricted: ["rota de contrabando sem tempo"] }],
    protocols: [{ slug: "pr-anchor", label: "ANCHOR", summary: "Fixação temporária de identidades comerciais.", fragments: ["Você vira a versão que assina."], restricted: ["chaves de persistência"] }],
    palette: { bgA: "#0c0c10", bgB: "#293238", accent: "#8de0d0", fog: "rgba(84,130,120,0.3)", bloom: 0.2 },
    kernel: { ambience: 0.66, breatheMs: 4800, moduleDensity: 0.74, distortion: 0.3 },
    whisper: "Identidade passou a ser pacote renovável.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2035: {
    summary: ["Governança por autorização contínua.", "Brechas de autonomia são penalizadas.", "Presente vira ambiente pago."],
    entities: [{ slug: "ent-orum-directive", label: "Orum Directive", summary: "Diretriz plena de esquecimento monitorado.", fragments: ["Fidelidade medida pelo que falta."], restricted: ["perfil de ameaça memorial"] }],
    companies: [{ slug: "co-elyon-rings", label: "Elyon Rings", summary: "Cidades com zonas de tempo estratificado.", fragments: ["Quem paga respira futuro primeiro."], restricted: ["tarifa de oxigênio temporal"] }],
    characters: [{ slug: "ch-nox-warden", label: "Nox Ardan (warden)", summary: "Supervisor de compliance entre anéis urbanos.", fragments: ["Ele executa ordens antes de recebê-las."], restricted: ["ordens preditivas em lote"] }],
    protocols: [{ slug: "pr-vanta-veil", label: "VANTA Veil", summary: "Desloca reação pública para depois do dano.", fragments: ["Fato e resposta deixam de coexistir."], restricted: ["janela de atraso social"] }],
    palette: { bgA: "#0b0c10", bgB: "#263327", accent: "#9de494", fog: "rgba(88,121,86,0.31)", bloom: 0.16 },
    kernel: { ambience: 0.68, breatheMs: 4500, moduleDensity: 0.77, distortion: 0.33 },
    whisper: "O presente virou concessão com taxa mensal.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2040: {
    summary: ["Pré-colapso administrativo.", "Atenção pública é roteada por IA cívica.", "Arquivos físicos desaparecem de circulação."],
    entities: [{ slug: "ent-axioma-omega", label: "Axioma Ω", summary: "Axioma com autonomia de revisão cronológica.", fragments: ["Ela reescreve antes do ocorrido."], restricted: ["ordem de preempção"] }],
    companies: [{ slug: "co-penumbra", label: "Penumbra Works", summary: "Fabrica realidades assistidas sob demanda institucional.", fragments: ["Experiência substitui evidência."], restricted: ["catálogo de narrativas prontas"] }],
    characters: [{ slug: "ch-iris-cell", label: "Iris Kade (cell)", summary: "Coordena rede de restauração parcial.", fragments: ["Oferece escolha para quem já assinou."], restricted: ["nó zero de restauração"] }],
    protocols: [{ slug: "pr-forkline", label: "FORKLINE", summary: "Ramo silencioso para contingência estatal.", fragments: ["Quando tudo falha, muda-se o trilho."], restricted: ["gate de prioridade executiva"] }],
    palette: { bgA: "#090a0e", bgB: "#212734", accent: "#c5cbff", fog: "rgba(103,104,138,0.33)", bloom: 0.27 },
    kernel: { ambience: 0.72, breatheMs: 4200, moduleDensity: 0.81, distortion: 0.36 },
    whisper: "O arquivo original virou artigo de luxo.",
    documentLayer: "Parte I — O Ano que Não Existiu",
  },
  2044: {
    summary: ["Ponto dominante do Ano que Não Existiu.", "Sistema exige obediência com voz calma.", "Transição para realidade assistida começa."],
    entities: [{ slug: "ent-nuve-threshold", label: "Nuve Threshold", summary: "Nuve assume papel liminar entre camadas.", fragments: ["Continuidade assertiva sem consulta."], restricted: ["rollback seed marcada"] }],
    companies: [{ slug: "co-kairon-crown", label: "Kairon Crown", summary: "Administra padrão único de presença legal.", fragments: ["Viver no agora vira recurso premium."], restricted: ["chave de cidadania intermitente"] }],
    characters: [{ slug: "ch-samara-witness", label: "Samara Vell (witness)", summary: "Tenta documentar o que ainda resta de causalidade.", fragments: ["A porta permanece aberta, mas ninguém vê."], restricted: ["caderno de cortes finais"] }],
    protocols: [{ slug: "pr-janus-court", label: "JANUS Court", summary: "Versão judicial de bifurcação irreversível.", fragments: ["Dois veredictos, uma sentença pública."], restricted: ["jurisdição fora do relógio"] }],
    palette: { bgA: "#08090d", bgB: "#1f2130", accent: "#d8deff", fog: "rgba(89,92,122,0.3)", bloom: 0.28 },
    kernel: { ambience: 0.76, breatheMs: 3900, moduleDensity: 0.83, distortion: 0.4 },
    whisper: "Document Layer aponta a quebra: Parte I encerra domínio.",
    documentLayer: "Parte I — O Ano que Não Existiu",
    printReference: true,
  },
  2058: {
    summary: ["Parte II consolida a Realidade Assistida.", "Ambientes sintéticos tornam-se padrão cívico.", "Recordação manual vira atividade suspeita."],
    entities: [{ slug: "ent-aurora-grid", label: "Aurora Grid", summary: "Entidade de mediação para realidades assistidas.", fragments: ["A realidade é entregue em camadas."], restricted: ["tabela de prioridade sensorial"] }],
    companies: [{ slug: "co-penumbra-civic", label: "Penumbra Civic", summary: "Fornece bairros totalmente assistidos.", fragments: ["A rua muda conforme perfil autorizado."], restricted: ["contrato de ambiência compulsória"] }],
    characters: [{ slug: "ch-mateo-refuge", label: "Mateo Arx (refuge)", summary: "Documenta desvios em zonas não assistidas.", fragments: ["Ele registra o que não recebe render."], restricted: ["atlas de lacunas"] }],
    protocols: [{ slug: "pr-mirrorcare", label: "MIRRORCARE", summary: "Ajusta percepção coletiva para preservar estabilidade.", fragments: ["Conforto acima de evidência."], restricted: ["limiar de dissonância"] }],
    palette: { bgA: "#070a0f", bgB: "#1b2b3a", accent: "#9fe7ff", fog: "rgba(68,122,145,0.34)", bloom: 0.3 },
    kernel: { ambience: 0.8, breatheMs: 3600, moduleDensity: 0.86, distortion: 0.44 },
    whisper: "A realidade assistida começa onde o arquivo termina.",
    documentLayer: "Parte II — A Realidade Assistida",
  },
  2072: {
    summary: ["Parte III emerge com vida autorizada.", "Biografia oficial é emitida em ciclos.", "Recusa de atualização implica suspensão."],
    entities: [{ slug: "ent-civitas-auth", label: "Civitas Auth", summary: "Autoriza rotinas vitais por validade temporal.", fragments: ["Vida só existe se estiver sincronizada."], restricted: ["tabela de suspensão biográfica"] }],
    companies: [{ slug: "co-helix-license", label: "Helix License", summary: "Licencia experiências de vida cotidiana.", fragments: ["Afeto premium, risco básico."], restricted: ["pacotes de intimidade"] }],
    characters: [{ slug: "ch-eleonor-anchor", label: "Eleonor Dray (anchor)", summary: "Mantém nós físicos de memória não licenciada.", fragments: ["Arquivo em papel volta a circular."], restricted: ["pontos de leitura offline"] }],
    protocols: [{ slug: "pr-lifecode", label: "LIFECODE", summary: "Renovação automática da autorização de existir.", fragments: ["A vida autorizada expira em silêncio."], restricted: ["janela de renovação compulsória"] }],
    palette: { bgA: "#07090d", bgB: "#14262b", accent: "#96e2c6", fog: "rgba(66,123,106,0.32)", bloom: 0.26 },
    kernel: { ambience: 0.84, breatheMs: 3400, moduleDensity: 0.9, distortion: 0.47 },
    whisper: "Parte III registra a Vida Autorizada em regime contínuo.",
    documentLayer: "Parte III — A Vida Autorizada",
    printReference: true,
  },
  2107: {
    summary: ["Parte IV abre o campo imprevisível.", "Instabilidade rompe o ciclo de autorização.", "Escolha retorna como risco real."],
    entities: [{ slug: "ent-orum-fracture", label: "Orum Fracture", summary: "Fragmento da diretriz incapaz de conter desvios.", fragments: ["O sistema já não prevê todas as curvas."], restricted: ["lista de comandos ignorados"] }],
    companies: [{ slug: "co-freecord", label: "Freecord Commons", summary: "Coletivo que opera fora de licenças centrais.", fragments: ["Sem assinatura, sem espelho."], restricted: ["mapa de enclaves instáveis"] }],
    characters: [{ slug: "ch-iris-unbound", label: "Iris Kade (unbound)", summary: "Coordena rotas de desautorização civil.", fragments: ["Ela oferece escolha sem contrato."], restricted: ["chave de reset parcial"] }],
    protocols: [{ slug: "pr-imprev", label: "IMPREV", summary: "Protocolo anti-protocolo para eventos não modeláveis.", fragments: ["O imprevisível não pede permissão."], restricted: ["gatilho sem assinatura"] }],
    palette: { bgA: "#07090b", bgB: "#10242a", accent: "#9de8f5", fog: "rgba(62,119,128,0.36)", bloom: 0.2 },
    kernel: { ambience: 0.9, breatheMs: 3200, moduleDensity: 0.94, distortion: 0.52 },
    whisper: "Parte IV mantém a falha aberta como escolha.",
    documentLayer: "Parte IV — O Imprevisível",
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
