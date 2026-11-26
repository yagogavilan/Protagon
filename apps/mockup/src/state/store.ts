import { create } from 'zustand';
import { notificationTemplates } from '@/data/notifications';
import type { DayNumber, Moment, NotificationCategory, NotificationTemplate, Tier } from '@/data/types';
import { computeClock, type EventClock } from '@/lib/clock';

export type TabId = 'agora' | 'trilha' | 'conexoes' | 'materiais' | 'eu';
export type AuthStep = 'login' | 'code' | 'app';
export type Overlay = 'credential' | 'notifications' | 'checkout' | 'map' | 'qrscan' | null;
export type MapFocus = 'sector' | 'booth';

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
}

const TIER_RANK: Record<Tier, number> = { executivo: 0, vip: 1, diamond: 2 };

export function tierAllows(tier: Tier, min?: Tier): boolean {
  return !min || TIER_RANK[tier] >= TIER_RANK[min];
}

interface DemoState {
  // painel
  tier: Tier;
  moment: Moment;
  day: DayNumber;
  online: boolean;
  /** true logo após voltar a internet (estado "reconectado" do G05) */
  justReconnected: boolean;
  locked: boolean;

  // app
  auth: AuthStep;
  /** e-mail ou CPF digitado no login (para exibir mascarado no E02) */
  loginIdentifier: string;
  tab: TabId;
  overlay: Overlay;
  notifications: AppNotification[];
  /** Não operacionais disparados durante palestra: entregues no intervalo */
  held: AppNotification[];
  /** Push visível no topo da moldura (ou na tela bloqueada) */
  push: AppNotification | null;
  fireCount: number;
  connectionsActive: boolean;
  /** Pedidos de conexão enviados, por dia (limite D4: 15 VIP, 25 Diamond) */
  requestsSentByDay: Record<DayNumber, number>;
  walletAdded: boolean;
  /** Banner "Agenda atualizada" ainda não visto */
  agendaUpdated: boolean;
  connectionsPaused: boolean;
  /** Veio do checkout simulado: C01 mostra "Seu ingresso agora é VIP" */
  justUpgraded: boolean;
  /** Sugestões tratadas, por dia (D5: "Agora não" volta no dia seguinte) */
  suggestionOutcomes: Record<DayNumber, Record<string, SuggestionOutcome>>;
  /** Pedidos recebidos já respondidos */
  answeredRequests: Record<string, 'accepted' | 'notNow'>;
  mapFocus: MapFocus;
  toast: Toast | null;
  lastHaptic: HapticEvent | null;

  // ações do painel
  setTier: (tier: Tier) => void;
  setMoment: (moment: Moment) => void;
  setDay: (day: DayNumber) => void;
  setOnline: (online: boolean) => void;
  setLocked: (locked: boolean) => void;
  fireNotification: () => void;
  resetDemo: () => void;
  setAgendaUpdated: (v: boolean) => void;
  setRequestsSent: (n: number) => void;

  // ações do app
  submitIdentifier: (identifier: string) => void;
  backToLogin: () => void;
  completeLogin: () => void;
  setTab: (tab: TabId) => void;
  openOverlay: (overlay: Exclude<Overlay, null>) => void;
  openMap: (focus: MapFocus) => void;
  showToast: (t: Omit<Toast, 'id'>) => void;
  hideToast: () => void;
  setConnectionsPaused: (v: boolean) => void;
  setSuggestionOutcome: (id: string, outcome: SuggestionOutcome | null) => void;
  answerRequest: (id: string, answer: 'accepted' | 'notNow') => void;
  upgradeToVip: () => void;
  recordHaptic: (label: string) => void;
  closeOverlay: () => void;
  dismissPush: () => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  setConnectionsActive: (active: boolean) => void;
  sendConnectionRequest: () => boolean;
  setWalletAdded: (added: boolean) => void;
}

export const DAILY_REQUEST_LIMIT: Record<Tier, number> = { executivo: 0, vip: 15, diamond: 25 };

const initialApp = {
  auth: 'login' as AuthStep,
  loginIdentifier: '',
  tab: 'agora' as TabId,
  overlay: null as Overlay,
  notifications: [] as AppNotification[],
  held: [] as AppNotification[],
  push: null as AppNotification | null,
  fireCount: 0,
  connectionsActive: false,
  requestsSentByDay: { 1: 0, 2: 0, 3: 0 } as Record<DayNumber, number>,
  walletAdded: false,
  agendaUpdated: true,
  connectionsPaused: false,
  justUpgraded: false,
  suggestionOutcomes: { 1: {}, 2: {}, 3: {} } as Record<DayNumber, Record<string, SuggestionOutcome>>,
  answeredRequests: {} as Record<string, 'accepted' | 'notNow'>,
  mapFocus: 'sector' as MapFocus,
  toast: null as Toast | null,
  lastHaptic: null as HapticEvent | null,
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

/**
 * Estado inicial por URL, para QA e roteiro de demo abrirem direto num estado.
 * Ex.: ?auth=app&tier=executivo&moment=lunch&day=2&tab=conexoes&overlay=credential&offline=1&locked=1
 */
function fromUrl() {
  const q = typeof window === 'undefined' ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const pick = <T extends string>(key: string, allowed: readonly T[]): T | undefined => {
    const v = q.get(key);
    return allowed.includes(v as T) ? (v as T) : undefined;
  };
  const dayParam = Number(q.get('day'));
  const sentParam = Math.max(0, Math.min(25, Number(q.get('sent')) || 0));
  return {
    tier: pick<Tier>('tier', ['executivo', 'vip', 'diamond']) ?? 'vip',
    moment: pick<Moment>('moment', ['before', 'live', 'break', 'lunch', 'endOfDay', 'after']) ?? 'live',
    day: (dayParam === 2 || dayParam === 3 ? dayParam : 1) as DayNumber,
    online: q.get('offline') !== '1',
    locked: q.get('locked') === '1',
    auth: pick<AuthStep>('auth', ['login', 'code', 'app']) ?? 'login',
    tab: pick<TabId>('tab', ['agora', 'trilha', 'conexoes', 'materiais', 'eu']) ?? 'agora',
    overlay: pick<Exclude<Overlay, null>>('overlay', ['credential', 'notifications', 'checkout', 'map', 'qrscan']) ?? null,
    connectionsActive: q.get('connections') === '1',
    requestsSentByDay: { 1: sentParam, 2: sentParam, 3: sentParam } as Record<DayNumber, number>,
  };
}

export const useDemo = create<DemoState>()((set, get) => ({
  ...initialApp,
  justReconnected: false,
  ...fromUrl(),

  setTier: (tier) => set({ tier }),

  setMoment: (moment) => {
    const { held, notifications } = get();
    // Chegou o intervalo/almoço/fim do dia: o que estava em espera é entregue.
    if (moment !== 'live' && held.length > 0) {
      set({ moment, held: [], notifications: [...held, ...notifications] });
      return;
    }
    set({ moment });
  },

  setDay: (day) => set({ day }),

  setOnline: (online) => {
    set({ online, justReconnected: online && !get().online });
    if (online) {
      window.setTimeout(() => set({ justReconnected: false }), 2500);
    }
  },

  setLocked: (locked) => set({ locked }),

  fireNotification: () => {
    const { tier, moment, day, fireCount } = get();
    const clock = computeClock(moment, day);
    const candidates = notificationTemplates.filter(
      (t) => t.moments.includes(moment) && tierAllows(tier, t.minTier),
    );
    const template = candidates[fireCount % Math.max(1, candidates.length)];
    if (!template) return;
    const n = instantiate(template, clock);
    // Regra: durante palestra só avisos operacionais; o resto espera o intervalo.
    if (moment === 'live' && !template.operational) {
      set((s) => ({ held: [n, ...s.held], fireCount: s.fireCount + 1 }));
      return;
    }
    set((s) => ({ notifications: [n, ...s.notifications], push: n, fireCount: s.fireCount + 1 }));
  },

  resetDemo: () =>
    set({
      ...initialApp,
      requestsSentByDay: { 1: 0, 2: 0, 3: 0 },
      suggestionOutcomes: { 1: {}, 2: {}, 3: {} },
      answeredRequests: {},
      locked: false,
    }),
  setAgendaUpdated: (agendaUpdated) => set({ agendaUpdated }),
  setRequestsSent: (n) => set((s) => ({ requestsSentByDay: { ...s.requestsSentByDay, [s.day]: n } })),

  submitIdentifier: (identifier) => set({ loginIdentifier: identifier, auth: 'code' }),
  backToLogin: () => set({ auth: 'login' }),
  completeLogin: () => set({ auth: 'app', tab: 'agora', overlay: null }),
  setTab: (tab) => set({ tab, overlay: null, justUpgraded: tab === 'conexoes' ? get().justUpgraded : false }),
  openOverlay: (overlay) => set({ overlay }),
  openMap: (mapFocus) => set({ overlay: 'map', mapFocus }),
  showToast: (t) => set({ toast: { ...t, id: Date.now() } }),
  hideToast: () => set({ toast: null }),
  setConnectionsPaused: (connectionsPaused) => set({ connectionsPaused }),
  setSuggestionOutcome: (id, outcome) =>
    set((s) => {
      const today = { ...s.suggestionOutcomes[s.day] };
      if (outcome) today[id] = outcome;
      else delete today[id];
      return { suggestionOutcomes: { ...s.suggestionOutcomes, [s.day]: today } };
    }),
  answerRequest: (id, answer) => set((s) => ({ answeredRequests: { ...s.answeredRequests, [id]: answer } })),
  upgradeToVip: () =>
    set({ tier: 'vip', connectionsActive: false, justUpgraded: true, tab: 'conexoes', overlay: null }),
  recordHaptic: (label) => set({ lastHaptic: { label, at: Date.now() } }),
  closeOverlay: () => set({ overlay: null }),
  dismissPush: () => set({ push: null }),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  clearNotifications: () => set({ notifications: [] }),
  setConnectionsActive: (connectionsActive) => set({ connectionsActive }),
  sendConnectionRequest: () => {
    const { tier, day, requestsSentByDay } = get();
    const sent = requestsSentByDay[day];
    if (sent >= DAILY_REQUEST_LIMIT[tier]) return false;
    set({ requestsSentByDay: { ...requestsSentByDay, [day]: sent + 1 } });
    return true;
  },
  setWalletAdded: (walletAdded) => set({ walletAdded }),
}));

/** Relógio do evento derivado (momento + dia) */
export function useClock(): EventClock {
  const moment = useDemo((s) => s.moment);
  const day = useDemo((s) => s.day);
  return computeClock(moment, day);
}

export function useUnreadCount(): number {
  return useDemo((s) => s.notifications.filter((n) => !n.read).length);
}
