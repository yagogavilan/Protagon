export type Tier = 'executivo' | 'vip' | 'diamond';
export type Moment = 'before' | 'live' | 'break' | 'lunch' | 'endOfDay' | 'after';
export type DayNumber = 1 | 2 | 3;

export type Objective =
  | 'Busco sócio'
  | 'Busco clientes'
  | 'Contrato serviços'
  | 'Ofereço serviços'
  | 'Quero mentorar'
  | 'Quero ser mentorado'
  | 'Parcerias'
  | 'Investimento';

export interface Edition {
  id: string;
  city: string;
  name: string;
  /** Datas dos 3 dias, AAAA-MM-DD */
  dates: [string, string, string];
  venue: {
    name: string;
    address: string;
    parking: string;
    wifi: { network: string; password: string };
    accessNotes: string;
  };
  support: { phone: string; email: string; hours: string };
  sectorByTier: Record<Tier, string>;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  /** true = convidado inventado para o mockup */
  fictitious: boolean;
}

export type SessionKind =
  | 'abertura'
  | 'palestra'
  | 'dinamica'
  | 'exercicio'
  | 'intervalo'
  | 'almoco'
  | 'encerramento';

export interface Session {
  id: string;
  day: DayNumber;
  /** HH:MM */
  start: string;
  end: string;
  kind: SessionKind;
  title: string;
  theme?: string;
  speakerIds: string[];
  objective?: string;
  location: string;
  materialIds: string[];
}

export type MaterialType = 'pdf' | 'workbook' | 'audio' | 'video';

export interface Material {
  id: string;
  day: DayNumber;
  sessionId: string;
  title: string;
  type: MaterialType;
  /** Liberação: dia + HH:MM. Antes disso, o estado é "agendado". */
  releaseAt: { day: DayNumber; time: string };
  /** Tamanho (PDF/workbook) ou duração (áudio/vídeo), já formatado */
  meta: string;
}

/**
 * Tema em que alguém pode precisar de ajuda (maior desafio) ou ter bastante conhecimento ("Domina").
 * O mesmo vocabulário vale para os dois lados: é ele que permite cruzar o desafio de um com o conhecimento do outro (DEC-002).
 */
export type TopicId =
  | 'trafego'
  | 'financas'
  | 'comercial'
  | 'retencao'
  | 'vendedores'
  | 'lideranca'
  | 'franquia'
  | 'precificacao'
  | 'conteudo'
  | 'crm'
  | 'sucessao'
  | 'investimento'
  | 'operacao'
  | 'atendimento';

/** Canais de contato que a pessoa liberou para quem aceitar a conexão (SEC-002). Cada um tem sua própria chave. */
export interface ContactShares {
  whatsapp: boolean;
  linkedin: boolean;
  instagram: boolean;
}

export type ContactChannel = keyof ContactShares;

export interface Participant {
  id: string;
  name: string;
  company: string;
  role: string;
  city: string;
  segment: string;
  tier: Tier;
  objectives: Objective[];
  interests: string[];
  /** Nicho específico, mais fino que o segmento ("Academias de bairro") */
  niche: string;
  /** Objetivo no Protagon: o que quer levar do evento */
  goal: string;
  /** Maior desafio atual */
  challenge: TopicId;
  /** "Onde tenho bastante conhecimento" (1 a 3 temas) */
  expertise: TopicId[];
  /** Instagram fictício. Só aparece após o aceite mútuo (ou antes, se a pessoa liberou e o aluno também) */
  instagram: string;
  /** Proposta (DEC-002): a pessoa liberou o @ antes da conexão */
  instagramEarly: boolean;
  /** Canais liberados após o aceite (SEC-002) */
  shares: ContactShares;
  /** Chave própria do maior desafio (SEC-003): desligada, o desafio não aparece nem gera motivo para os outros */
  challengeVisible: boolean;
  /** Perfil visível nas Conexões (pausado = false) */
  visible: boolean;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  /** Sempre mascarado; o CPF completo nunca entra no mockup */
  cpfMasked: string;
  /** Telefone da compra: só pré-preenche o WhatsApp, editável (SEC-002) */
  whatsapp: string;
  linkedin: string;
  company: string;
  role: string;
  city: string;
  segment: string;
  objectives: Objective[];
  interests: string[];
  niche: string;
  goal: string;
  challenge: TopicId;
  expertise: TopicId[];
  instagram: string;
  credentialCode: string;
}

export type NotificationCategory = 'avisos' | 'agenda' | 'conexoes';

export interface NotificationTemplate {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** Aviso operacional pode chegar durante palestra; o resto espera o intervalo */
  operational: boolean;
  /** Momentos em que faz sentido disparar */
  moments: Moment[];
  /** Ingresso mínimo (Conexões só VIP+) */
  minTier?: Tier;
}

export interface ConnectionPoint {
  id: 'A' | 'B' | 'C';
  name: string;
  where: string;
}

/* ---------- Conexões: relação, chat e encontro ---------- */

export type PointId = 'A' | 'B' | 'C';

export interface MeetingSlot {
  sessionId: string;
  day: DayNumber;
  /** HH:MM */
  time: string;
}

export interface Meeting {
  /** Quem propôs o horário atual */
  by: 'me' | 'them';
  status: 'proposed' | 'confirmed' | 'counter';
  slot: MeetingSlot;
  point: PointId;
}

export interface ChatMessage {
  id: string;
  from: 'me' | 'them';
  text: string;
  /** HH:MM do relógio do evento */
  at: string;
  /** Enviada durante a palestra: entrega no intervalo */
  queued?: boolean;
}

export interface Connection {
  via: 'request' | 'qr';
  /** HH:MM */
  at: string;
}

export type NpsKey = '1' | '2' | '3' | 'final';
