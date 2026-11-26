import { create } from 'zustand';
import { notificationTemplates } from '@/data/notifications';
import { receivedRequests } from '@/data/requests';
import { demoUser } from '@/data/participants';
import type {
  ChatMessage,
  Connection,
  ContactChannel,
  ContactShares,
  DayNumber,
  Meeting,
  Moment,
  NotificationCategory,
  NotificationTemplate,
  NpsKey,
  Objective,
  Tier,
  TopicId,
} from '@/data/types';
import { computeClock, pauseStage, type EventClock, type PausePhase } from '@/lib/clock';

export type TabId = 'agora' | 'trilha' | 'conexoes' | 'materiais' | 'eu';
export type AuthStep = 'login' | 'code' | 'onboarding' | 'app';
export type OverlayName =
  | 'credential'
  | 'notifications'
  | 'checkout'
  | 'map'
  | 'qrscan'
  | 'break'
  | 'eat'
  | 'session'
  | 'material'
  | 'person'
  | 'chat'
  | 'activate'
  | 'profile'
  | 'prefs'
  | 'privacy'
  | 'nps'
  | 'support'
  // Grupos (GR), Ofertas (OF) e Gaia One (GA): páginas empilhadas, sem aba nova
  | 'groups'
  | 'groupCreate'
  | 'groupCode'
  | 'myGroup'
  | 'offer'
  | 'offerPay'
  | 'offerList'
  | 'gaia';
export type Overlay = OverlayName | null;
/** Foco do mapa: setor do aluno, estande, praça de alimentação ou um Ponto de Conexão */
export type MapFocus = 'sector' | 'booth' | 'food' | 'checkin' | 'A' | 'B' | 'C';
export type ConnPanel = 'sugestoes' | 'explorar' | 'pedidos' | 'rede';
export type NotifPermission = 'unknown' | 'granted' | 'denied';

/** Telas que ocupam o aparelho inteiro (sem tab bar). As demais mantêm a tab bar: agenda, mapa e credencial a 2 toques. */
export const IMMERSIVE: OverlayName[] = ['credential', 'break'];

export interface OverlayEntry {
  name: OverlayName;
  id?: string;
}

export interface Toast {
  id: number;
  text: string;
  tone: 'success' | 'info' | 'warning';
  action?: { label: string; run: () => void };
}

export interface HapticEvent {
  label: string;
  at: number;
}

/** Estado de cada sugestão já tratada hoje */
export type SuggestionOutcome = 'sent' | 'queued' | 'notNow';

export interface AppNotification {
  id: string;
  templateId: string;
  category: NotificationCategory;
  title: string;
  body: string;
  /** HH:MM do relógio do evento quando chegou */
  time: string;
  read: boolean;
  /** Referência do destino (ex.: id da oferta) */
  ref?: string;
}

/** Perfil de Conexões do aluno (C01 e "Complete seu perfil"). Desafio e conhecimento começam vazios: são opcionais. */
export interface ConnProfile {
  objectives: Objective[];
  interests: string[];
  niche: string;
  goal: string;
  challenge: TopicId | null;
  expertise: TopicId[];
  instagram: string;
  /** Pré-preenchidos com os dados da compra; editáveis (SEC-002) */
  whatsapp: string;
  linkedin: string;
}

export function initialProfile(complete = false): ConnProfile {
  return {
    objectives: [...demoUser.objectives],
    interests: [...demoUser.interests],
    niche: demoUser.niche,
    goal: demoUser.goal,
    challenge: complete ? demoUser.challenge : null,
    expertise: complete ? [...demoUser.expertise] : [],
    instagram: demoUser.instagram,
    whatsapp: demoUser.whatsapp,
    linkedin: demoUser.linkedin,
  };
}

export interface Privacy {
  company: boolean;
  role: boolean;
  city: boolean;
  objectives: boolean;
  interests: boolean;
  /** Nicho e objetivo no Protagon (DEC-002) e foto (SEC-003) */
  niche: boolean;
  goal: boolean;
  photo: boolean;
  /** Chave própria do maior desafio (SEC-003) */
  challenge: boolean;
}

const TIER_RANK: Record<Tier, number> = { executivo: 0, vip: 1, diamond: 2 };

export function tierAllows(tier: Tier, min?: Tier): boolean {
  return !min || TIER_RANK[tier] >= TIER_RANK[min];
}

export type DemoStateSnapshot = DemoState;

export const DAILY_REQUEST_LIMIT: Record<Tier, number> = { executivo: 0, vip: 15, diamond: 25 };

interface DemoState {
  /** Sobe a cada "Reiniciar demo": o estado de Grupos, Ofertas e Gaia One (state/features.ts) escuta e reinicia junto */
  resetCount: number;
  // painel
  tier: Tier;
  moment: Moment;
  day: DayNumber;
  pausePhase: PausePhase;
  /** HH:MM dentro de "Sessão ao vivo" (BUG-021): o painel posiciona o relógio na hora da liberação; null = padrão do momento */
  liveTime: string | null;
  online: boolean;
  /** true logo após voltar a internet (estado "reconectado" do G05) */
  justReconnected: boolean;
  locked: boolean;
  /** Dynamic Island expandida (G04) */
  islandExpanded: boolean;

  // app
  auth: AuthStep;
  loginIdentifier: string;
  tab: TabId;
  stack: OverlayEntry[];
  overlay: Overlay;
  overlayId: string | undefined;
  notifications: AppNotification[];
  /** Não operacionais disparados durante palestra: entregues no intervalo */
  held: AppNotification[];
  push: AppNotification | null;
  fireCount: number;
  notifPermission: NotifPermission;
  /** Sheet de pedido de permissão (E04) aberta */
  permissionSheet: boolean;
  permissionAsked: boolean;
  notifPrefs: Record<NotificationCategory, boolean>;
  wifiOpen: boolean;
  walletAdded: boolean;
  agendaUpdated: boolean;
  checklist: Record<string, boolean>;
  mapFocus: MapFocus;
  toast: Toast | null;
  lastHaptic: HapticEvent | null;
  sessionNotes: Record<string, string>;
  downloaded: Record<string, boolean>;
  completed: Record<string, boolean>;
  nps: Partial<Record<NpsKey, { score: number; comment: string }>>;

  // Conexões
  connectionsActive: boolean;
  connectionsPaused: boolean;
  consent: boolean;
  privacy: Privacy;
  contactShare: ContactShares;
  profile: ConnProfile;
  /** Proposta (DEC-002): mostrar o Instagram antes da conexão. Desligado por padrão */
  instagramEarly: boolean;
  profileCardDismissed: boolean;
  justUpgraded: boolean;
  connPanel: ConnPanel;
  requestsSentByDay: Record<DayNumber, number>;
  suggestionOutcomes: Record<DayNumber, Record<string, SuggestionOutcome>>;
  answeredRequests: Record<string, 'accepted' | 'notNow'>;
  connected: Record<string, Connection>;
  blocked: Record<string, true>;
  privateNotes: Record<string, string>;
  chats: Record<string, ChatMessage[]>;
  meetings: Record<string, Meeting>;
  requestFor: string | null;
  safetyFor: string | null;
  meetFor: { id: string; mode: 'new' | 'counter' } | null;
  dataDeleted: boolean;

  // ações do painel
  setTier: (tier: Tier) => void;
  setMoment: (moment: Moment) => void;
  setDay: (day: DayNumber) => void;
  setLiveTime: (time: string | null) => void;
  setPausePhase: (phase: PausePhase) => void;
  setOnline: (online: boolean) => void;
  setLocked: (locked: boolean) => void;
  fireNotification: (templateId?: string) => void;
  resetDemo: () => void;
  setAgendaUpdated: (v: boolean) => void;
  setRequestsSent: (n: number) => void;
  setNotifPermission: (p: NotifPermission) => void;
  seedNetwork: () => void;
  simulateMeetingReply: (kind: 'confirm' | 'counter') => void;

  // ações do app
  submitIdentifier: (identifier: string) => void;
  backToLogin: () => void;
  completeLogin: () => void;
  finishOnboarding: () => void;
  setTab: (tab: TabId) => void;
  openOverlay: (overlay: OverlayName, id?: string) => void;
  openMap: (focus: MapFocus) => void;
  closeOverlay: () => void;
  /** Troca a página do topo da pilha (ex.: da lista de grupos para "Meu grupo"), sem empilhar */
  replaceOverlay: (name: OverlayName, id?: string) => void;
  showToast: (t: Omit<Toast, 'id'>) => void;
  hideToast: () => void;
  recordHaptic: (label: string) => void;
  dismissPush: () => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: (restore?: AppNotification[]) => void;
  setNotifPref: (c: NotificationCategory, v: boolean) => void;
  setPermissionSheet: (v: boolean) => void;
  setWifiOpen: (v: boolean) => void;
  setWalletAdded: (added: boolean) => void;
  toggleChecklist: (id: string) => void;
  setSessionNote: (sessionId: string, text: string) => void;
  setDownloaded: (id: string, v: boolean) => void;
  setCompleted: (id: string, v: boolean) => void;
  setNps: (key: NpsKey, score: number, comment: string) => void;
  upgradeToVip: () => void;
  setIslandExpanded: (v: boolean) => void;

  setConnectionsActive: (active: boolean) => void;
  setConnectionsPaused: (v: boolean) => void;
  setConsent: (v: boolean) => void;
  setPrivacy: (k: keyof Privacy, v: boolean) => void;
  setContactShare: (c: ContactChannel, v: boolean) => void;
  setProfile: (p: Partial<ConnProfile>) => void;
  setInstagramEarly: (v: boolean) => void;
  setProfileCardDismissed: (v: boolean) => void;
  setConnPanel: (p: ConnPanel) => void;
  setSuggestionOutcome: (id: string, outcome: SuggestionOutcome | null) => void;
  sendConnectionRequest: () => boolean;
  answerRequest: (id: string, answer: 'accepted' | 'notNow' | null) => void;
  connectViaQr: (participantId: string) => void;
  disconnect: (id: string) => void;
  blockPerson: (id: string) => void;
  setPrivateNote: (id: string, text: string) => void;
  sendChat: (id: string, text: string) => void;
  setMeeting: (id: string, meeting: Meeting | null) => void;
  setRequestFor: (id: string | null) => void;
  setSafetyFor: (id: string | null) => void;
  setMeetFor: (v: { id: string; mode: 'new' | 'counter' } | null) => void;
  deleteMyData: () => void;
}

export const defaultPrivacy: Privacy = { company: true, role: true, city: true, objectives: true, interests: true, niche: true, goal: true, photo: true, challenge: true };

/** Canais de contato liberados após o aceite (SEC-002): todos desligados até a pessoa escolher */
export const defaultContactShare: ContactShares = { whatsapp: false, linkedin: false, instagram: false };

const initialApp = {
  auth: 'login' as AuthStep,
  loginIdentifier: '',
  tab: 'agora' as TabId,
  stack: [] as OverlayEntry[],
  overlay: null as Overlay,
  overlayId: undefined as string | undefined,
  notifications: [] as AppNotification[],
  held: [] as AppNotification[],
  push: null as AppNotification | null,
  fireCount: 0,
  notifPermission: 'unknown' as NotifPermission,
  permissionSheet: false,
  permissionAsked: false,
  notifPrefs: { avisos: true, agenda: true, conexoes: true, grupo: true } as Record<NotificationCategory, boolean>,
  wifiOpen: false,
  walletAdded: false,
  agendaUpdated: true,
  checklist: {} as Record<string, boolean>,
  mapFocus: 'sector' as MapFocus,
  toast: null as Toast | null,
  lastHaptic: null as HapticEvent | null,
  sessionNotes: {} as Record<string, string>,
  downloaded: { 'm-d1-1': true, 'm-d1-3': true } as Record<string, boolean>,
  completed: { 'm-d1-3': true } as Record<string, boolean>,
  nps: {} as Partial<Record<NpsKey, { score: number; comment: string }>>,
  islandExpanded: false,

  connectionsActive: false,
  connectionsPaused: false,
  consent: false,
  privacy: defaultPrivacy,
  contactShare: defaultContactShare,
  profile: initialProfile(),
  instagramEarly: false,
  profileCardDismissed: false,
  justUpgraded: false,
  connPanel: 'sugestoes' as ConnPanel,
  requestsSentByDay: { 1: 0, 2: 0, 3: 0 } as Record<DayNumber, number>,
  suggestionOutcomes: { 1: {}, 2: {}, 3: {} } as Record<DayNumber, Record<string, SuggestionOutcome>>,
  answeredRequests: {} as Record<string, 'accepted' | 'notNow'>,
  connected: {} as Record<string, Connection>,
  blocked: {} as Record<string, true>,
  privateNotes: {} as Record<string, string>,
  chats: {} as Record<string, ChatMessage[]>,
  meetings: {} as Record<string, Meeting>,
  requestFor: null as string | null,
  safetyFor: null as string | null,
  meetFor: null as { id: string; mode: 'new' | 'counter' } | null,
  dataDeleted: false,
};

let seq = 0;

function instantiate(t: NotificationTemplate, clock: EventClock): AppNotification {
  seq += 1;
  return {
    id: `${t.id}-${seq}`,
    templateId: t.id,
    category: t.category,
    title: t.title,
    body: t.body,
    time: clock.time,
    read: false,
  };
}

function withStack(stack: OverlayEntry[]) {
  const top = stack[stack.length - 1];
  return { stack, overlay: (top?.name ?? null) as Overlay, overlayId: top?.id };
}

/** Notificações de boas-vindas (G02 com lidas e não lidas) */
function welcomeNotifications(tier: Tier, time: string): AppNotification[] {
  const list: AppNotification[] = [
    { id: 'seed-1', templateId: 'seed-welcome', category: 'avisos', title: 'Bem-vindo ao Protagon', body: 'Sua credencial já está no app e funciona sem internet.', time, read: false },
    { id: 'seed-2', templateId: 'seed-agenda', category: 'agenda', title: 'Agenda do Dia 1 publicada', body: 'Abertura às 9h. Credenciamento a partir das 7h30.', time, read: true },
  ];
  if (tier !== 'executivo') {
    list.unshift({
      id: 'seed-3',
      templateId: 'n-pre-connections',
      category: 'conexoes',
      title: 'Conexões liberadas',
      body: 'Ative seu perfil e veja quem tem interesses em comum com você.',
      time,
      read: false,
    });
  }
  return list;
}

/** Aviso operacional (nunca fica em espera). Os de boas-vindas são operacionais, menos o de Conexões. */
function isOperationalNotification(n: AppNotification): boolean {
  const template = notificationTemplates.find((t) => t.id === n.templateId);
  return template ? template.operational : true;
}

/**
 * Regra de CLAUDE.md §8.5: em sessão ao vivo, Conexões e materiais (não operacionais) não ficam entregues nem
 * não lidos: esperam o intervalo. Separa a lista entre entregues e em espera conforme o momento.
 */
function deliverableNotifications(list: AppNotification[], moment: Moment): { notifications: AppNotification[]; held: AppNotification[] } {
  if (moment !== 'live') return { notifications: list, held: [] };
  return {
    notifications: list.filter((n) => n.read || isOperationalNotification(n)),
    held: list.filter((n) => !n.read && !isOperationalNotification(n)),
  };
}

/**
 * Estado inicial por URL, para QA e roteiro de demo abrirem direto num estado.
 * Ex.: ?auth=app&tier=vip&moment=lunch&phase=five&day=2&tab=conexoes&overlay=credential&offline=1&locked=1&go=C07
 */
function fromUrl() {
  const q = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const pick = <T extends string>(key: string, allowed: readonly T[]): T | undefined => {
    const v = q.get(key);
    return allowed.includes(v as T) ? (v as T) : undefined;
  };
  const dayParam = Number(q.get('day'));
  const sentParam = Math.max(0, Math.min(25, Number(q.get('sent')) || 0));
  const overlay = pick<OverlayName>('overlay', [
    'credential', 'notifications', 'checkout', 'map', 'qrscan', 'break', 'eat', 'activate', 'profile', 'prefs', 'privacy', 'nps', 'support',
  ]);
  return {
    tier: pick<Tier>('tier', ['executivo', 'vip', 'diamond']) ?? 'vip',
    moment: pick<Moment>('moment', ['before', 'live', 'break', 'lunch', 'endOfDay', 'after']) ?? 'live',
    day: (dayParam === 2 || dayParam === 3 ? dayParam : 1) as DayNumber,
    pausePhase: pick<PausePhase>('phase', ['start', 'five', 'now']) ?? 'start',
    online: q.get('offline') !== '1',
    locked: q.get('locked') === '1',
    auth: pick<AuthStep>('auth', ['login', 'code', 'onboarding', 'app']) ?? 'login',
    tab: pick<TabId>('tab', ['agora', 'trilha', 'conexoes', 'materiais', 'eu']) ?? 'agora',
    ...(overlay ? withStack([{ name: overlay }]) : {}),
    connectionsActive: q.get('connections') === '1',
    consent: q.get('connections') === '1',
    // ?profile=full abre com o perfil completo (desafio e conhecimento preenchidos), sem o card "Complete seu perfil"
    profile: initialProfile(q.get('profile') === 'full'),
    requestsSentByDay: { 1: sentParam, 2: sentParam, 3: sentParam } as Record<DayNumber, number>,
    notifPermission: pick<NotifPermission>('perm', ['unknown', 'granted', 'denied']) ?? 'unknown',
    permissionAsked: q.get('perm') === 'granted' || q.get('perm') === 'denied',
  };
}

const MY_SLOT_BREAK = { sessionId: 'd1-s10', day: 1 as DayNumber, time: '15:40' };
const MY_SLOT_LUNCH = { sessionId: 'd1-s06', day: 1 as DayNumber, time: '12:50' };

function networkSeed(time: string) {
  const at = time;
  const msg = (id: string, from: 'me' | 'them', text: string, t: string): ChatMessage => ({ id, from, text, at: t });
  const connected: Record<string, Connection> = {
    p17: { via: 'request', at },
    p19: { via: 'request', at },
    p20: { via: 'request', at },
    p11: { via: 'qr', at },
    p10: { via: 'request', at },
  };
  const chats: Record<string, ChatMessage[]> = {
    p17: [],
    p19: [
      msg('s1', 'them', 'Oi, Rafael. Obrigada por aceitar. Você usa franquias ou unidades próprias?', '09:30'),
      msg('s2', 'me', 'Os dois modelos. Estamos abrindo a 6ª unidade em Canoas.', '09:41'),
    ],
    p20: [msg('s3', 'me', 'Oi, Felipe. Vamos nos ver no intervalo da tarde?', '10:02'), msg('s4', 'them', 'Fechado. Combinado.', '10:05')],
    p11: [msg('s5', 'them', 'Foi bom te conhecer pelo QR. Tenho uma ideia de campanha para academias.', '09:50')],
    p10: [msg('s6', 'them', 'Rafael, mando o material do plano de expansão por aqui depois.', '09:20'), msg('s7', 'me', 'Perfeito, Marcos. Obrigado.', '09:24')],
  };
  const meetings: Record<string, Meeting> = {
    p19: { by: 'them', status: 'proposed', slot: MY_SLOT_BREAK, point: 'C' },
    p20: { by: 'me', status: 'confirmed', slot: MY_SLOT_BREAK, point: 'B' },
    p11: { by: 'them', status: 'counter', slot: MY_SLOT_LUNCH, point: 'A' },
  };
  const privateNotes: Record<string, string> = { p10: 'Dono da imobiliária. Quer ver o modelo de expansão das academias.' };
  return { connected, chats, meetings, privateNotes };
}

const urlState = fromUrl();

export const useDemo = create<DemoState>()((set, get) => ({
  ...initialApp,
  resetCount: 0,
  liveTime: null,
  justReconnected: false,
  ...urlState,
  // Entrada direta por URL (auth=app) simula um aluno que já fez login: traz as notificações de boas-vindas
  ...(urlState.auth === 'app'
    ? deliverableNotifications(welcomeNotifications(urlState.tier, computeClock(urlState.moment, urlState.day, urlState.pausePhase).time), urlState.moment)
    : { notifications: [] as AppNotification[], held: [] as AppNotification[] }),

  setTier: (tier) => set({ tier }),

  setMoment: (moment) => {
    const { held, notifications } = get();
    // Chegou o intervalo/almoço/fim do dia: o que estava em espera é entregue.
    if (moment !== 'live' && held.length > 0) {
      set({ moment, pausePhase: 'start', liveTime: null, held: [], notifications: [...held, ...notifications] });
      return;
    }
    // Voltou a palestra: o que é de Conexões ou material e ainda não foi lido volta para a espera.
    if (moment === 'live') {
      const split = deliverableNotifications(notifications, moment);
      set({ moment, pausePhase: 'start', liveTime: null, notifications: split.notifications, held: [...split.held, ...held] });
      return;
    }
    set({ moment, pausePhase: 'start', liveTime: null });
  },

  setDay: (day) => set({ day }),
  setPausePhase: (pausePhase) => set({ pausePhase }),
  setLiveTime: (liveTime) => set({ liveTime }),

  setOnline: (online) => {
    set({ online, justReconnected: online && !get().online });
    if (online) {
      window.setTimeout(() => set({ justReconnected: false }), 2500);
    }
  },

  setLocked: (locked) => set({ locked, islandExpanded: false }),
  setIslandExpanded: (islandExpanded) => set({ islandExpanded }),

  fireNotification: (templateId) => {
    const { tier, moment, day, pausePhase, liveTime, fireCount, notifPrefs } = get();
    const clock = computeClock(moment, day, pausePhase, liveTime);
    const candidates = notificationTemplates.filter((t) => t.moments.includes(moment) && tierAllows(tier, t.minTier));
    const template = templateId
      ? notificationTemplates.find((t) => t.id === templateId)
      : candidates[fireCount % Math.max(1, candidates.length)];
    if (!template) return;
    const n = instantiate(template, clock);
    // Preferência desligada em U02: a notificação não chega (operacionais não podem ser desligados)
    if (!template.operational && !notifPrefs[template.category]) {
      set((s) => ({ fireCount: s.fireCount + 1 }));
      return;
    }
    // Regra: durante palestra só avisos operacionais; o resto espera o intervalo.
    if (moment === 'live' && !template.operational) {
      set((s) => ({ held: [n, ...s.held], fireCount: s.fireCount + 1 }));
      return;
    }
    set((s) => ({ notifications: [n, ...s.notifications], push: s.notifPermission === 'denied' ? null : n, fireCount: s.fireCount + 1 }));
  },

  resetDemo: () =>
    set((cur) => ({
      resetCount: cur.resetCount + 1,
      ...initialApp,
      stack: [],
      overlay: null,
      overlayId: undefined,
      requestsSentByDay: { 1: 0, 2: 0, 3: 0 },
      suggestionOutcomes: { 1: {}, 2: {}, 3: {} },
      answeredRequests: {},
      connected: {},
      blocked: {},
      privateNotes: {},
      chats: {},
      meetings: {},
      sessionNotes: {},
      checklist: {},
      nps: {},
      downloaded: { 'm-d1-1': true, 'm-d1-3': true },
      completed: { 'm-d1-3': true },
      privacy: defaultPrivacy,
      contactShare: defaultContactShare,
      profile: initialProfile(),
      instagramEarly: false,
      profileCardDismissed: false,
      notifPrefs: { avisos: true, agenda: true, conexoes: true, grupo: true },
      pausePhase: 'start',
      liveTime: null,
      online: true,
      locked: false,
    })),
  setAgendaUpdated: (agendaUpdated) => set({ agendaUpdated }),
  setRequestsSent: (n) => set((s) => ({ requestsSentByDay: { ...s.requestsSentByDay, [s.day]: n } })),
  setNotifPermission: (notifPermission) => set({ notifPermission, permissionAsked: notifPermission !== 'unknown' }),

  seedNetwork: () => {
    const { moment, day, pausePhase, liveTime } = get();
    const seed = networkSeed(computeClock(moment, day, pausePhase, liveTime).time);
    set((s) => ({
      connectionsActive: true,
      consent: true,
      connected: { ...s.connected, ...seed.connected },
      chats: { ...seed.chats, ...s.chats },
      meetings: { ...seed.meetings, ...s.meetings },
      privateNotes: { ...seed.privateNotes, ...s.privateNotes },
    }));
  },

  simulateMeetingReply: (kind) => {
    const { meetings } = get();
    const entry = Object.entries(meetings).find(([, m]) => m.by === 'me' && m.status === 'proposed');
    if (!entry) {
      get().showToast({ text: 'Nenhum encontro proposto por você aguardando resposta', tone: 'info' });
      return;
    }
    const [id, m] = entry;
    const next: Meeting =
      kind === 'confirm'
        ? { ...m, status: 'confirmed' }
        : { by: 'them', status: 'counter', slot: m.slot.time === '15:40' ? MY_SLOT_LUNCH : MY_SLOT_BREAK, point: m.point === 'C' ? 'A' : 'C' };
    set((s) => ({ meetings: { ...s.meetings, [id]: next } }));
  },

  submitIdentifier: (identifier) => set({ loginIdentifier: identifier, auth: 'code' }),
  backToLogin: () => set({ auth: 'login' }),
  completeLogin: () => {
    const { tier, moment, day, pausePhase, liveTime, notifications, held } = get();
    const clock = computeClock(moment, day, pausePhase, liveTime);
    const seeded = notifications.length > 0 || held.length > 0 ? { notifications, held } : deliverableNotifications(welcomeNotifications(tier, clock.time), moment);
    set({
      auth: 'onboarding',
      tab: 'agora',
      ...withStack([]),
      ...seeded,
    });
  },
  finishOnboarding: () => set({ auth: 'app', tab: 'agora', ...withStack([]) }),
  setTab: (tab) => {
    const s = get();
    const openPermission = tab === 'trilha' && !s.permissionAsked && s.notifPermission === 'unknown' && s.auth === 'app';
    set({
      tab,
      ...withStack([]),
      justUpgraded: tab === 'conexoes' ? s.justUpgraded : false,
      permissionSheet: openPermission ? true : s.permissionSheet,
      permissionAsked: openPermission ? true : s.permissionAsked,
    });
  },
  openOverlay: (name, id) => {
    const { stack } = get();
    const top = stack[stack.length - 1];
    if (top && top.name === name && top.id === id) return;
    set(withStack([...stack, { name, id }]));
  },
  openMap: (mapFocus) => {
    const { stack } = get();
    const top = stack[stack.length - 1];
    set({ mapFocus, ...(top?.name === 'map' ? {} : withStack([...stack, { name: 'map' }])) });
  },
  closeOverlay: () => set((s) => withStack(s.stack.slice(0, -1))),
  replaceOverlay: (name, id) => set((s) => withStack([...s.stack.slice(0, -1), { name, id }])),

  showToast: (t) => set({ toast: { ...t, id: Date.now() } }),
  hideToast: () => set({ toast: null }),
  recordHaptic: (label) => set({ lastHaptic: { label, at: Date.now() } }),
  dismissPush: () => set({ push: null }),
  markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  clearNotifications: (restore) => set({ notifications: restore ?? [] }),
  setNotifPref: (c, v) => set((s) => ({ notifPrefs: { ...s.notifPrefs, [c]: v } })),
  setPermissionSheet: (permissionSheet) => set({ permissionSheet }),
  setWifiOpen: (wifiOpen) => set({ wifiOpen }),
  setWalletAdded: (walletAdded) => set({ walletAdded }),
  toggleChecklist: (id) => set((s) => ({ checklist: { ...s.checklist, [id]: !s.checklist[id] } })),
  setSessionNote: (sessionId, text) => set((s) => ({ sessionNotes: { ...s.sessionNotes, [sessionId]: text } })),
  setDownloaded: (id, v) => set((s) => ({ downloaded: { ...s.downloaded, [id]: v } })),
  setCompleted: (id, v) => set((s) => ({ completed: { ...s.completed, [id]: v } })),
  setNps: (key, score, comment) => set((s) => ({ nps: { ...s.nps, [key]: { score, comment } } })),
  upgradeToVip: () =>
    set({ tier: 'vip', connectionsActive: false, consent: false, justUpgraded: true, tab: 'conexoes', ...withStack([]) }),

  setConnectionsActive: (connectionsActive) => set({ connectionsActive, ...(connectionsActive ? {} : { consent: false }) }),
  setConnectionsPaused: (connectionsPaused) => set({ connectionsPaused }),
  setConsent: (consent) => set({ consent }),
  setPrivacy: (k, v) => set((s) => ({ privacy: { ...s.privacy, [k]: v } })),
  setContactShare: (c, v) => set((s) => ({ contactShare: { ...s.contactShare, [c]: v } })),
  setProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
  setInstagramEarly: (instagramEarly) => set({ instagramEarly }),
  setProfileCardDismissed: (profileCardDismissed) => set({ profileCardDismissed }),
  setConnPanel: (connPanel) => set({ connPanel }),
  setSuggestionOutcome: (id, outcome) =>
    set((s) => {
      const today = { ...s.suggestionOutcomes[s.day] };
      if (outcome) today[id] = outcome;
      else delete today[id];
      return { suggestionOutcomes: { ...s.suggestionOutcomes, [s.day]: today } };
    }),
  sendConnectionRequest: () => {
    const { tier, day, requestsSentByDay } = get();
    const sent = requestsSentByDay[day];
    if (sent >= DAILY_REQUEST_LIMIT[tier]) return false;
    set({ requestsSentByDay: { ...requestsSentByDay, [day]: sent + 1 } });
    return true;
  },

  answerRequest: (id, answer) => {
    const req = receivedRequests.find((r) => r.id === id);
    const { moment, day, pausePhase, liveTime } = get();
    const time = computeClock(moment, day, pausePhase, liveTime).time;
    set((s) => {
      const answered = { ...s.answeredRequests };
      if (answer) answered[id] = answer;
      else delete answered[id];
      const connected = { ...s.connected };
      const chats = { ...s.chats };
      if (req) {
        if (answer === 'accepted') {
          connected[req.participantId] = { via: 'request', at: time };
          chats[req.participantId] ??= [];
        } else {
          delete connected[req.participantId];
          delete chats[req.participantId];
        }
      }
      return { answeredRequests: answered, connected, chats };
    });
  },

  connectViaQr: (participantId) => {
    const { moment, day, pausePhase, liveTime } = get();
    const time = computeClock(moment, day, pausePhase, liveTime).time;
    set((s) => ({
      connected: { ...s.connected, [participantId]: { via: 'qr', at: time } },
      chats: { ...s.chats, [participantId]: s.chats[participantId] ?? [] },
    }));
  },

  disconnect: (id) =>
    set((s) => {
      const connected = { ...s.connected };
      const chats = { ...s.chats };
      const meetings = { ...s.meetings };
      const notes = { ...s.privateNotes };
      delete connected[id];
      delete chats[id];
      delete meetings[id];
      delete notes[id];
      return { connected, chats, meetings, privateNotes: notes };
    }),

  blockPerson: (id) => {
    get().disconnect(id);
    set((s) => ({ blocked: { ...s.blocked, [id]: true } }));
  },

  setPrivateNote: (id, text) => set((s) => ({ privateNotes: { ...s.privateNotes, [id]: text } })),

  sendChat: (id, text) => {
    const { moment, day, pausePhase, liveTime } = get();
    const time = computeClock(moment, day, pausePhase, liveTime).time;
    seq += 1;
    const m: ChatMessage = { id: `c${seq}`, from: 'me', text, at: time, queued: moment === 'live' };
    set((s) => ({ chats: { ...s.chats, [id]: [...(s.chats[id] ?? []), m] } }));
  },

  setMeeting: (id, meeting) =>
    set((s) => {
      const meetings = { ...s.meetings };
      if (meeting) meetings[id] = meeting;
      else delete meetings[id];
      return { meetings };
    }),

  setRequestFor: (requestFor) => set({ requestFor }),
  setSafetyFor: (safetyFor) => set({ safetyFor }),
  setMeetFor: (meetFor) => set({ meetFor }),

  deleteMyData: () =>
    set({
      dataDeleted: true,
      connectionsActive: false,
      consent: false,
      connected: {},
      chats: {},
      meetings: {},
      privateNotes: {},
      sessionNotes: {},
      nps: {},
      notifications: [],
      held: [],
    }),
}));

/** Relógio do evento derivado (momento + dia + posição na pausa) */
export function useClock(): EventClock {
  const moment = useDemo((s) => s.moment);
  const day = useDemo((s) => s.day);
  const phase = useDemo((s) => s.pausePhase);
  const liveTime = useDemo((s) => s.liveTime);
  return computeClock(moment, day, phase, liveTime);
}

export function useUnreadCount(): number {
  return useDemo((s) => s.notifications.filter((n) => !n.read).length);
}

/** Fase da pausa efetiva: segue o relógio (e o painel) */
export function usePauseStage(): PausePhase {
  const moment = useDemo((s) => s.moment);
  const clock = useClock();
  return pauseStage(moment, clock.minutes);
}
