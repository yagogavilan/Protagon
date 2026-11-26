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
  /** Perfil visível nas Conexões (pausado = false) */
  visible: boolean;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  /** Sempre mascarado; o CPF completo nunca entra no mockup */
  cpfMasked: string;
  company: string;
  role: string;
  city: string;
  segment: string;
  objectives: Objective[];
  interests: string[];
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
