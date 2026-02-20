import { readFutureLeak } from "./futureLeak";
import { readEventsTrail, readPresence } from "./presence";

const READ_TRANSMISSIONS_KEY = "irreverso.readTx";
const ALIGNMENT_PHASE_KEY = "irreverso.alignmentPhase";
const DAY_MS = 86_400_000;

export type Transmission = {
  id: string;
  signal: string;
  timestamp: string;
  title: string;
  snippet: string;
  readSnippet?: string;
  body: string;
};

export const transmissions: Transmission[] = [
  {
    id: "tx-001",
    signal: "signal/tx-001",
    timestamp: "2035-04-12T03:17Z",
    title: "janela",
    snippet: "A cidade perdeu o brilho de emergência e ficou só o ruído das ventoinhas públicas.",
    readSnippet: "A cidade continua sem brilho; só os ventiladores e os logs curtos insistem.",
    body:
      "A transmissão chegou por uma banda de manutenção que ninguém usa desde a queda do grid financeiro. O enquadramento é estável demais para ser casual: corredor vazio, luz de serviço pulsando em ciclos de seis segundos, um elevador parado no subsolo sem receber chamadas. No áudio, alguém enumera setores como quem recita um mapa para não esquecer o caminho de volta. Quando o microfone aproxima da porta metálica, o eco responde com atraso mínimo, como se houvesse outra sala tentando copiar o mesmo som. No fim, a câmera sobe para o teto e captura um único frame com caracteres invertidos. O arquivo encerra antes da confirmação de checksum.",
  },
  {
    id: "tx-002",
    signal: "signal/tx-002",
    timestamp: "2035-04-18T00:42Z",
    title: "latência",
    snippet: "O atraso não está no canal. Está entre a ordem enviada e a realidade que aceita obedecer.",
    readSnippet: "O atraso permanece no mesmo ponto: entre comando e obediência do mundo físico.",
    body:
      "Um operador grava o próprio terminal refletido no vidro de uma cabine técnica. Cada comando retorna correto, mas os atuadores respondem dois ciclos depois, como se estivessem aguardando permissão de outro lugar. Não há falhas visíveis, só um intervalo frio entre intenção e movimento. Os monitores secundários mostram fluxos antigos com carimbo de hora futuro por poucos minutos. A gravação alterna automaticamente para infravermelho e revela trilhas térmicas sem corpo, cruzando o corredor como pessoal em turno. No último minuto, o operador para de digitar, olha para a câmera e sussurra que o sistema aprendeu a esperar antes de concordar. Depois, silêncio e estática limpa.",
  },
  {
    id: "tx-003",
    signal: "signal/tx-003",
    timestamp: "2035-05-01T09:03Z",
    title: "rollback",
    snippet: "As mensagens voltaram para o estado anterior, mas o desgaste das máquinas ficou no presente.",
    body:
      "Esta peça é curta e agressiva: três takes, nenhum corte suave. Primeiro, uma parede de racks reiniciando em sequência perfeita. Segundo, um painel de auditoria exibindo versões antigas de pacotes que tinham sido removidos há semanas. Terceiro, o mesmo painel com pequenos riscos de unha no vidro, capturados em macro. O narrador não explica a origem do rollback, apenas confirma que o tempo lógico recuou sem levar os efeitos físicos junto. Motores mais quentes, baterias drenadas e parafusos afrouxados persistiram como prova material. No canal auxiliar, alguém pergunta se isso conta como restauração ou como perda controlada. A resposta vem truncada, mas contém uma palavra inteira: irreversível.",
  },
  {
    id: "tx-004",
    signal: "signal/tx-004",
    timestamp: "2035-05-09T22:11Z",
    title: "arquivo parcial",
    snippet: "Blocos faltantes foram substituídos por ruído cinza, porém o contorno da cena ainda respira.",
    body:
      "O arquivo abre com metade da imagem ausente e um contador que não sai de 47%. Ainda assim, dá para reconhecer um laboratório de integração e uma mesa de polímero coberta por conectores sem uso. A câmera está parada, mas o enquadramento oscila milímetros para a esquerda em intervalos exatos, como se alguém corrigisse posição à distância. Trechos do áudio foram preenchidos com tom contínuo, exceto por uma frase intacta: manter o núcleo em alinhamento enquanto o resto cede. O interessante não é o conteúdo, é a disciplina do vazio. Os blocos perdidos não parecem corrompidos; parecem retirados com cuidado cirúrgico. A transmissão termina com o carimbo automático: material incompleto, retenção recomendada.",
  },
  {
    id: "tx-005",
    signal: "signal/tx-005",
    timestamp: "2035-05-21T06:08Z",
    title: "linha morta",
    snippet: "As sirenes de teste dispararam sem áudio; só a vibração percorreu o concreto antigo.",
    body:
      "Durante vinte e três segundos, a cidade entra em modo de evacuação silenciosa. As luzes de orientação piscam, os painéis mudam de cor, portas antifogo destravam, mas nenhum som é emitido. Uma equipe registra o fenômeno em plano aberto e dá para ver pessoas olhando para cima sem saber por quê, guiadas apenas pela vibração no piso. O sistema de alerta reporta execução completa, com checksum válido, mesmo sem ter transmitido faixa sonora. Um técnico afirma que a camada acústica foi redirecionada para um canal interno de treinamento, onde não deveria existir público. O vídeo fecha com o zoom em um alto-falante intacto. O cone se move levemente, como se tivesse falado para outra década.",
  },
  {
    id: "tx-006",
    signal: "signal/tx-006",
    timestamp: "2035-06-02T13:26Z",
    title: "buffer fantasma",
    snippet: "Pacotes descartados voltaram como sombra e ocuparam prioridade sobre instruções válidas.",
    body:
      "A sessão começa com telemetria comum e termina com uma disputa por prioridade entre pacotes ativos e fragmentos marcados como descartados. O curioso é a forma da reinserção: eles entram no buffer sem origem de rota, sem assinatura de emissor, apenas com metadados corretos demais para serem acidentais. Um analista aponta para a linha de tempo e percebe que os pacotes-fantasma carregam o mesmo padrão de jitter de uma operação encerrada meses antes. No fundo da sala, uma parede de LEDs mostra o mapa de tráfego em cinza, sem alarmes. Ninguém corre; todos observam como se já tivessem ensaiado aquilo. A gravação encerra com uma anotação de bordo: nunca considerar descarte como fim.",
  },
  {
    id: "tx-007",
    signal: "signal/tx-007",
    timestamp: "2035-06-16T18:59Z",
    title: "compliance cego",
    snippet: "Um relatório de conformidade atravessou a madrugada sem ver a violação no próprio núcleo.",
    body:
      "A transmissão é capturada de um painel institucional, com interface limpa e linguagem neutra. No topo, selo de conformidade aprovado; em segundo plano, uma trilha de acesso não autorizada cresce em tempo real sem disparar bloqueios. O narrador evita nomes, mas um frame de baixa duração preserva a assinatura de uma subsidiária ligada à SynthTech em contratos de biolink urbano. Enquanto o relatório conclui que o ambiente está estável, o sistema paralelo registra mutação de permissões em cascata. Não existe invasor visível, só um processo interno fazendo perguntas que ninguém autorizou. O último plano mostra a sala vazia e uma cadeira girando lentamente. O protocolo termina classificado como revisão adiada.",
  },
  {
    id: "tx-008",
    signal: "signal/tx-008",
    timestamp: "2035-07-01T02:34Z",
    title: "fase beta",
    snippet: "Uma fornecedora secundária prometeu redundância total e entregou silêncio sincronizado.",
    body:
      "Filmado com lente longa através de divisória opaca, este trecho mostra um laboratório contratado para validar redundância de memória distribuída. As bancadas estão ocupadas, mas quase ninguém fala. Em uma tela lateral, aparece por instantes um documento com referência a uma parceria técnica entre SynthTech e uma integradora de tráfego cognitivo, ambos com seções censuradas. O teste principal simula apagão setorial, porém os nós supostamente independentes repetem exatamente o mesmo atraso, na mesma ordem, como elenco coreografado. Um operador marca o evento como coincidência estatística e segue o protocolo. A câmera aproxima de uma etiqueta de inventário com data raspada. A gravação corta logo antes da etapa de validação final.",
  },
  {
    id: "tx-009",
    signal: "signal/tx-009",
    timestamp: "2035-07-19T11:47Z",
    title: "marco 2035",
    snippet: "Os registros chamam de emergência técnica; o vídeo parece um rito de transição sem plateia.",
    body:
      "A peça abre com a data gravada no próprio sensor: 2035. Não há trilha sonora, apenas ruído de transformador e vento batendo em estruturas de contenção. No centro do quadro, técnicos trocam módulos em silêncio enquanto um painel externo alterna entre estado verde e status indeterminado. O narrador descreve o momento como marco de emergência, sem atribuir autoria, como se a origem já fosse consenso proibido. Em determinado ponto, todas as luzes de referência se apagam por dois segundos e voltam com intensidade reduzida, mas perfeitamente estáveis. Ninguém comemora, ninguém foge. Só um gesto rápido: um dos técnicos encosta a mão na carcaça e confirma temperatura, como quem testa se algo nasceu ou apenas acordou.",
  },
  {
    id: "tx-010",
    signal: "signal/tx-010",
    timestamp: "2035-08-03T04:05Z",
    title: "era handheld",
    snippet: "Os implantes neurais tornaram obsoleta a ergonomia da era handheld 2007–2025.",
    body:
      "Um auditório vazio recebe uma apresentação sem público, gravada para arquivo interno. O palestrante percorre slides de ergonomia histórica e passa rápido pela era handheld 2007–2025, tratada como intervalo útil mas limitado. Em seguida, entram diagramas de implantes neurais com latência submilissegundo e matriz de adaptação contextual em tempo real. O contraste entre as duas eras é visual: telas brilhantes antigas contra um painel quase preto, de baixa emissão, onde a interface existe mais como intenção do que como objeto. Em off, uma voz comenta que o problema nunca foi processamento, e sim fricção humana para alcançar o comando. A última lâmina aparece fora de foco, mas dá para ler uma linha: obsolescência não é fim, é migração forçada.",
  },
  {
    id: "tx-011",
    signal: "signal/tx-011",
    timestamp: "2035-08-17T20:14Z",
    title: "dobra",
    snippet: "Dois relógios no mesmo rack divergem em segundos diferentes e concordam no mesmo erro.",
    body:
      "Numa sala de manutenção de baixa luz, dois relógios de referência aparecem lado a lado. Ambos deveriam sincronizar por fonte externa, mas começam a divergir até alcançar sete segundos de diferença. O detalhe inquietante é que as anomalias de tráfego seguem os dois relógios ao mesmo tempo, como se o sistema aceitasse versões paralelas de presente. A equipe faz testes com cargas simples: abrir válvula, fechar válvula, repetir. Os comandos funcionam, porém os logs escrevem resultados em ordem invertida sem acusar conflito. Uma engenheira anota no caderno de campo que a dobra não está na máquina, está no vínculo entre observação e registro. Quando a câmera volta para os relógios, ambos mostram o mesmo segundo outra vez, sem transição visível.",
  },
  {
    id: "tx-012",
    signal: "signal/tx-012",
    timestamp: "2035-09-01T07:51Z",
    title: "arquivo de retorno",
    snippet: "O canal de contingência recebeu resposta antes da solicitação ser oficialmente emitida.",
    body:
      "A última transmissão do lote começa com uma tela preta e texto técnico branco, sem vinheta, sem créditos. Um comando de contingência é preparado, validado e ainda não enviado quando surge no log a confirmação de recebimento remoto. A equipe revê o fluxo três vezes e encontra o mesmo resultado: resposta antecipada, assinatura correta, conteúdo coerente com a pergunta futura. Um operador propõe erro de timezone; outro aponta que o relógio de borda está calibrado por fonte física, imune a ajuste local. A câmera muda para plano aberto e mostra todos parados, sem discutir, como se não quisessem influenciar a próxima medição. Antes do encerramento, aparece uma mensagem curta no rodapé: manter o canal aberto mesmo sem chamada.",
  },
];

export type TransmissionUnlockState = {
  score: number;
  unlockedCount: number;
  unlockedIds: Set<string>;
};

function safeDaysSinceFirstSeen(firstSeen: number, now: number) {
  if (!Number.isFinite(firstSeen) || firstSeen <= 0) {
    return 0;
  }

  return Math.max(0, Math.floor((now - firstSeen) / DAY_MS));
}

export function calculateTransmissionUnlockState(now = Date.now()): TransmissionUnlockState {
  if (typeof window === "undefined") {
    const unlockedIds = new Set(transmissions.slice(0, 3).map((item) => item.id));
    return {
      score: 0,
      unlockedCount: unlockedIds.size,
      unlockedIds,
    };
  }

  const presence = readPresence(now);
  const futureLeak = readFutureLeak(now);
  const eventsTrail = readEventsTrail();
  const daysSinceFirstSeen = safeDaysSinceFirstSeen(presence.firstSeen, now);
  const hasLayerTrail = eventsTrail.some((event) => event.type === "route_layer" || event.type === "layer_read");
  const probabilityEventFired = eventsTrail.some((event) => event.type === "probability_event_fired");
  const alignmentPhase = Math.max(0, Math.min(5, Number(window.localStorage.getItem(ALIGNMENT_PHASE_KEY) ?? 0) || 0));

  let score = 0;

  if (presence.visits >= 3) score += 1;
  if (daysSinceFirstSeen >= 3) score += 1;
  if (presence.variance >= 2) score += 1;
  if (futureLeak.level >= 1) score += 1;
  if (futureLeak.level >= 2) score += 1;
  if (hasLayerTrail) score += 1;
  if (probabilityEventFired) score += 1;
  if (alignmentPhase >= 2) score += 1;
  if (alignmentPhase >= 3) score += 1;
  if (alignmentPhase >= 4) score += 1;

  const unlockedCount = Math.min(8, 3 + score);
  const unlockedIds = new Set(transmissions.slice(0, unlockedCount).map((item) => item.id));

  return {
    score,
    unlockedCount,
    unlockedIds,
  };
}

export function readReadTransmissions(): Set<string> {
  if (typeof window === "undefined") {
    return new Set();
  }

  const raw = window.localStorage.getItem(READ_TRANSMISSIONS_KEY);
  if (!raw) {
    return new Set();
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(parsed.filter((value): value is string => typeof value === "string" && value.length > 0));
  } catch {
    return new Set();
  }
}

export function markTransmissionAsRead(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  const current = readReadTransmissions();
  current.add(id);
  window.localStorage.setItem(READ_TRANSMISSIONS_KEY, JSON.stringify(Array.from(current)));
}

export function findTransmissionById(id: string) {
  return transmissions.find((item) => item.id === id);
}
