import { create } from 'zustand';
import { CODE_POOL, fillersByTier, seedGroups } from '@/data/groups';
import { OFFER_IDS, type Offer, type OfferId } from '@/data/offerTypes';
import type { DayNumber, Tier } from '@/data/types';
import { computeClock, type EventClock } from '@/lib/clock';
import {
  firstNameOf,
  formationState,
  groupLabel,
  isComplete,
  listedGroups,
  makeCode,
  myGroupOf,
  personOf,
  pickAutoGroup,
  pickTeamGroup,
  TEAM_SIZE,
  vacancies,
  type Formation,
  type Group,
} from '@/lib/groups';
import { haptic } from '@/lib/haptics';
import { useDemo, type AppNotification } from './store';
import { notificationTemplates } from '@/data/notifications';

/* =====================================================================================================
 * Estado dos três recursos novos: Grupos de 3 (GR), Ofertas do palco (OF) e atividade Gaia One (GA).
 * Fica fora de store.ts para não inchar o estado principal; lê ingresso, dia e momento de useDemo.
 * ===================================================================================================== */

export type JoinResult = 'ok' | 'full' | 'closed' | 'notfound' | 'already' | 'offline' | 'error';

export interface OfferState {
  /** HH:MM do relógio do evento quando foi liberada */
  releasedAt: string;
  viewed: boolean;
  /** "Agora não" */
  dismissed: boolean;
  /** HH:MM do pedido de contato (OF03) */
  interestAt: string | null;
  purchase: 'none' | 'confirming' | 'confirmed';
  purchaseDay: DayNumber | null;
  /** Voltou do checkout sem a confirmação da compra */
  notSeen: boolean;
  /** HH:MM em que o painel encerrou a condição antes do prazo */
  closedAt: string | null;
}

export type GaiaDevice = 'ios' | 'android';
export type GaiaStepNumber = 1 | 2 | 3;

export interface GaiaState {
  /** O time iniciou a atividade (painel) */
  started: boolean;
  /** Passos 1 a 3 marcados como "Feito" (autodeclarado: o app não verifica nada) */
  steps: Record<GaiaStepNumber, boolean>;
  /** HH:MM do "Já ativei" */
  completedAt: string | null;
  device: GaiaDevice;
}

export interface FeaturesState {
  // Grupos
  groups: Group[];
  groupsForcedClosed: boolean;
  /** Aluno liga "Compartilhar meu WhatsApp com o grupo" (desligado por padrão, SEC-020) */
  shareWhatsapp: boolean;
  /** Linha de status em Meu grupo ("Thiago saiu do grupo...") */
  groupNotice: string | null;
  /** Último aviso de entrada, para o leitor de tela na tela de código */
  lastJoinAnnounce: string | null;
  placedSeen: boolean;
  /** Pedido para a lista de grupos rodar o "Me coloque" ao abrir (atalho do painel) */
  autoRunOnOpen: boolean;
  syntheticSeq: number;
  groupSeq: number;

  // Ofertas
  offerData: Partial<Record<OfferId, Offer>>;
  offerState: Partial<Record<OfferId, OfferState>>;

  // Gaia One
  gaia: GaiaState;

  // Folhas abertas por atalho (goTo)
  sheets: { gaiaHelp: boolean; offerInterest: boolean };

  /** Simula falha de rede nas ações novas (estado "erro" das specs) */
  simulateError: boolean;

  // ações: grupos
  joinGroup: (id: string, via: 'list' | 'auto' | 'team') => JoinResult;
  joinByCode: (code: string, via: 'code' | 'qr') => JoinResult;
  createGroup: (listed?: boolean, opts?: { silent?: boolean }) => Group | null;
  setListed: (id: string, listed: boolean) => void;
  leaveGroup: () => void;
  autoPlace: () => { kind: 'joined' | 'created'; group: Group } | null;
  setNickname: (name: string) => 'ok' | 'invalid';
  setShareWhatsapp: (v: boolean) => void;
  setForcedClosed: (v: boolean) => void;
  teamPlace: () => boolean;
  someoneJoined: () => boolean;
  someoneLeft: () => boolean;
  fillOneListed: () => boolean;
  resolvePending: () => void;
  setMyGroupSize: (n: 0 | 1 | 2 | 3) => void;
  clearVacancies: () => void;
  setPlacedSeen: (v: boolean) => void;
  setAutoRunOnOpen: (v: boolean) => void;
  setGroupNotice: (v: string | null) => void;

  // ações: ofertas
  releaseOffer: (id: OfferId, opts?: { quiet?: boolean }) => Promise<void>;
  markOfferViewed: (id: OfferId) => void;
  dismissOffer: (id: OfferId) => void;
  sendInterest: (id: OfferId) => void;
  cancelInterest: (id: OfferId) => void;
  startPurchase: (id: OfferId, paid: boolean) => void;
  closeCondition: (id: OfferId) => void;

  // ações: Gaia One
  startGaia: () => void;
  toggleGaiaStep: (n: GaiaStepNumber) => void;
  setGaiaProgress: (p: 1 | 2 | 3 | 4 | 'done') => void;
  completeGaia: () => void;
  undoGaia: () => void;
  setGaiaDevice: (d: GaiaDevice) => void;

  setSheet: (k: 'gaiaHelp' | 'offerInterest', v: boolean) => void;
  setSimulateError: (v: boolean) => void;
  reset: () => void;
}

/* ---------- utilidades ---------- */

const demo = () => useDemo.getState();
const clockNow = (): EventClock => {
  const d = demo();
  return computeClock(d.moment, d.day, d.pausePhase);
};

let seq = 0;

function initialGroups(): Group[] {
  return seedGroups.map((g) => ({
    id: g.id,
    tier: g.tier,
    number: g.number,
    code: g.code,
    memberIds: [...g.memberIds],
    zone: g.zone,
    listed: g.listed,
    nickname: g.nickname ?? '',
    targetSize: TEAM_SIZE,
    placedByTeam: false,
    via: null,
    pendingFill: false,
  }));
}

const initialGaia = (): GaiaState => ({ started: false, steps: { 1: false, 2: false, 3: false }, completedAt: null, device: 'ios' });

const SYNTHETIC = [
  ['Renato Gomes', 'Gomes Plásticos'],
  ['Silvana Prado', 'Prado Embalagens'],
  ['Caetano Dutra', 'Dutra Serralheria'],
  ['Heloísa Marin', 'Marin Floricultura'],
  ['Ivo Teixeira', 'Teixeira Ferragens'],
  ['Joana Cardoso', 'Cardoso Eventos'],
];

function inUse(groups: Group[], id: string): boolean {
  return groups.some((g) => g.memberIds.includes(id));
}

/** Próximo aluno disponível da categoria para entrar num grupo da demonstração (nunca de outra categoria) */
function nextPerson(state: FeaturesState, tier: Tier): { id: string; syntheticSeq: number } {
  const free = fillersByTier[tier].find((id) => !inUse(state.groups, id));
  if (free) return { id: free, syntheticSeq: state.syntheticSeq };
  return { id: `s-${tier}-${state.syntheticSeq}`, syntheticSeq: state.syntheticSeq + 1 };
}

/** Pessoas sintéticas ('s-...') resolvem nome e empresa aqui, as demais em lib/groups */
export function personFor(id: string, tier: Tier) {
  if (id.startsWith('s-')) {
    const n = Number(id.split('-')[2] ?? 0);
    const [name, company] = SYNTHETIC[n % SYNTHETIC.length] ?? SYNTHETIC[0]!;
    return { id, name: name!, company: company!, tier, sharesWhatsapp: n % 2 === 0 };
  }
  return personOf(id, tier);
}

function notify(templateId: string, title: string, body: string, ref?: string, forceRead = false): void {
  const d = demo();
  const template = notificationTemplates.find((t) => t.id === templateId);
  const operational = template ? template.operational : true;
  if (template && !operational && !d.notifPrefs[template.category]) return;
  seq += 1;
  const n: AppNotification = { id: `${templateId}-f${seq}`, templateId, category: template?.category ?? 'avisos', title, body, time: clockNow().time, read: forceRead, ref };
  // Regra 5: em palestra só avisos operacionais; o resto espera o intervalo
  if (d.moment === 'live' && !operational) useDemo.setState((s) => ({ held: [n, ...s.held] }));
  else useDemo.setState((s) => ({ notifications: [n, ...s.notifications] }));
}

/** Espera nenhum sheet aberto para mostrar o aviso (a oferta não cobre sheet nem teclado) */
function whenNoDialog(fn: () => void, tries = 40): void {
  const open = typeof document !== 'undefined' && document.querySelector('[role=dialog]');
  if (!open || tries <= 0) return fn();
  window.setTimeout(() => whenNoDialog(fn, tries - 1), 400);
}

const FORMATION_MSG = 'A formação terminou. O time vai encaixar você em um grupo.';
export { FORMATION_MSG };

export const useFeatures = create<FeaturesState>()((set, get) => {
  const tier = (): Tier => demo().tier;
  const formation = (): Formation => formationState(clockNow(), get().groupsForcedClosed);
  const myGroup = (): Group | undefined => myGroupOf(get().groups, tier());

  const patchGroup = (id: string, fn: (g: Group) => Group) => set((s) => ({ groups: s.groups.map((g) => (g.id === id ? fn(g) : g)) }));

  /** Avisos de quem entrou no grupo do aluno (toast só com a formação aberta e fora de palestra; sem vibração em palestra) */
  const announceJoined = (g: Group, personId: string, wasComplete: boolean) => {
    const d = demo();
    const person = personFor(personId, g.tier);
    const first = firstNameOf(person.name);
    const names = g.memberIds.map((m) => (m === 'me' ? firstNameOf(personFor('me', g.tier).name) : firstNameOf(personFor(m, g.tier).name)));
    const quiet = d.moment === 'live';
    notify('n-group-joined', `${first} entrou no seu grupo`, `${groupLabel(g)} · ${g.memberIds.length} de ${g.targetSize}`);
    set({ lastJoinAnnounce: `${first} entrou no seu grupo.` });
    if (!quiet && formation() === 'open') {
      d.showToast({ text: `${first} entrou no seu grupo`, tone: 'info' });
      haptic('light', 'alguém entrou no grupo');
    }
    if (!wasComplete && isComplete(g)) {
      notify('n-group-complete', 'Seu grupo está completo', names.join(', '));
      if (!quiet) haptic('success', 'grupo completo');
    }
  };

  return {
    groups: initialGroups(),
    groupsForcedClosed: false,
    shareWhatsapp: false,
    groupNotice: null,
    lastJoinAnnounce: null,
    placedSeen: false,
    autoRunOnOpen: false,
    syntheticSeq: 0,
    groupSeq: 0,
    offerData: {},
    offerState: {},
    gaia: initialGaia(),
    sheets: { gaiaHelp: false, offerInterest: false },
    simulateError: false,

    /* ---------------- Grupos ---------------- */

    joinGroup: (id, via) => {
      const t = tier();
      if (!demo().online) return 'offline';
      if (get().simulateError) return 'error';
      if (myGroup()) return 'already';
      if (via !== 'team' && formation() !== 'open') return 'closed';
      const g = get().groups.find((x) => x.id === id && x.tier === t);
      if (!g) return 'notfound';
      if (g.pendingFill || vacancies(g) === 0) {
        if (g.pendingFill) get().resolvePending();
        return 'full';
      }
      patchGroup(id, (x) => ({ ...x, memberIds: [...x.memberIds, 'me'], via }));
      return 'ok';
    },

    joinByCode: (code, via) => {
      const t = tier();
      if (!demo().online) return 'offline';
      if (get().simulateError) return 'error';
      if (myGroup()) return 'already';
      if (formation() !== 'open') return 'closed';
      // Código inexistente, expirado ou de outra categoria: mesma resposta (SEC-021)
      const g = get().groups.find((x) => x.tier === t && x.code === code.toUpperCase());
      if (!g) return 'notfound';
      if (g.pendingFill || vacancies(g) === 0) {
        if (g.pendingFill) get().resolvePending();
        return 'full';
      }
      patchGroup(g.id, (x) => ({ ...x, memberIds: [...x.memberIds, 'me'], via }));
      return 'ok';
    },

    createGroup: (listed = true, opts) => {
      const t = tier();
      if (myGroup()) return null;
      const s = get();
      const used = new Set(s.groups.map((g) => g.code));
      const number = Math.max(...s.groups.map((g) => g.number), 0) + 1;
      const g: Group = {
        id: `g-new-${s.groupSeq + 1}`,
        tier: t,
        number,
        code: makeCode(used, CODE_POOL),
        memberIds: ['me'],
        zone: 3,
        listed,
        nickname: '',
        targetSize: TEAM_SIZE,
        placedByTeam: false,
        via: 'created',
        pendingFill: false,
      };
      set({ groups: [...s.groups, g], groupSeq: s.groupSeq + 1 });
      if (!opts?.silent) haptic('light', 'grupo criado');
      return g;
    },

    setListed: (id, listed) => patchGroup(id, (g) => ({ ...g, listed })),

    leaveGroup: () => {
      const g = myGroup();
      if (!g) return;
      const rest = g.memberIds.filter((m) => m !== 'me');
      set((s) => ({
        groups: rest.length === 0 ? s.groups.filter((x) => x.id !== g.id) : s.groups.map((x) => (x.id === g.id ? { ...x, memberIds: rest, placedByTeam: false, via: null, targetSize: TEAM_SIZE } : x)),
        shareWhatsapp: false,
        groupNotice: null,
      }));
    },

    autoPlace: () => {
      const t = tier();
      if (myGroup()) return null;
      const target = pickAutoGroup(get().groups.filter((g) => !g.pendingFill), t);
      if (target) {
        const r = get().joinGroup(target.id, 'auto');
        return r === 'ok' ? { kind: 'joined', group: get().groups.find((g) => g.id === target.id)! } : null;
      }
      const created = get().createGroup(true);
      if (!created) return null;
      patchGroup(created.id, (g) => ({ ...g, via: 'auto' }));
      return { kind: 'created', group: { ...created, via: 'auto' } };
    },

    setNickname: (name) => {
      const clean = name.trim();
      // Moderação simples do apelido (2 a 24 caracteres; uma lista curta de palavras barradas)
      if (clean.length > 0 && (clean.length < 2 || clean.length > 24 || /idiota|lixo|burro/i.test(clean))) return 'invalid';
      const g = myGroup();
      if (g) patchGroup(g.id, (x) => ({ ...x, nickname: clean }));
      return 'ok';
    },

    setShareWhatsapp: (shareWhatsapp) => set({ shareWhatsapp }),

    setForcedClosed: (groupsForcedClosed) => set({ groupsForcedClosed }),

    teamPlace: () => {
      const t = tier();
      if (formation() !== 'closed' || myGroup()) return false;
      const open = pickTeamGroup(get().groups, t);
      let number: number;
      if (open) {
        number = open.number;
        // Sem vaga em nenhum grupo: o time cria um grupo de 4 (sobra, proposta R-GR-5)
        patchGroup(open.id, (g) => ({
          ...g,
          memberIds: [...g.memberIds, 'me'],
          via: 'team',
          placedByTeam: true,
          targetSize: g.memberIds.length >= g.targetSize ? g.memberIds.length + 1 : g.targetSize,
        }));
      } else {
        const created = get().createGroup(true, { silent: true });
        if (!created) return false;
        number = created.number;
        patchGroup(created.id, (g) => ({ ...g, via: 'team', placedByTeam: true }));
      }
      set({ placedSeen: false });
      notify('n-group-placed', `O time colocou você no Grupo ${number}`, 'Veja quem está com você em Meu grupo.');
      return true;
    },

    someoneJoined: () => {
      const g = myGroup();
      if (!g || vacancies(g) === 0) return false;
      const s = get();
      const next = nextPerson(s, g.tier);
      const wasComplete = isComplete(g);
      set({ syntheticSeq: next.syntheticSeq });
      patchGroup(g.id, (x) => ({ ...x, memberIds: [...x.memberIds, next.id] }));
      announceJoined({ ...g, memberIds: [...g.memberIds, next.id] }, next.id, wasComplete);
      set({ groupNotice: null });
      return true;
    },

    someoneLeft: () => {
      const g = myGroup();
      if (!g) return false;
      const other = [...g.memberIds].reverse().find((m) => m !== 'me');
      if (!other) return false;
      const first = firstNameOf(personFor(other, g.tier).name);
      patchGroup(g.id, (x) => ({ ...x, memberIds: x.memberIds.filter((m) => m !== other) }));
      set({ groupNotice: `${first} saiu do grupo. A vaga voltou para a lista.` });
      return true;
    },

    /** "Alguém entra antes de mim": o primeiro grupo da lista fecha no servidor; a lista só descobre ao tocar em "Entrar" */
    fillOneListed: () => {
      const first = listedGroups(get().groups, tier()).find((g) => !g.pendingFill);
      if (!first) return false;
      patchGroup(first.id, (g) => ({ ...g, pendingFill: true }));
      return true;
    },

    resolvePending: () => {
      set((s) => {
        let syn = s.syntheticSeq;
        let groups = s.groups;
        for (const g of s.groups.filter((x) => x.pendingFill)) {
          let members = g.memberIds;
          while (members.length < g.targetSize) {
            const free = fillersByTier[g.tier].find((id) => !groups.some((x) => x.memberIds.includes(id)) && !members.includes(id));
            if (free) members = [...members, free];
            else {
              members = [...members, `s-${g.tier}-${syn}`];
              syn += 1;
            }
          }
          groups = groups.map((x) => (x.id === g.id ? { ...x, memberIds: members, pendingFill: false } : x));
        }
        return { groups, syntheticSeq: syn };
      });
    },

    setMyGroupSize: (n) => {
      const t = tier();
      get().leaveGroup();
      if (n === 0) return;
      if (n === 1) {
        get().createGroup(true, { silent: true });
        return;
      }
      const others = n - 1;
      const target = get().groups.find((g) => g.tier === t && !g.pendingFill && g.memberIds.length === others && g.targetSize === TEAM_SIZE);
      if (target) {
        patchGroup(target.id, (g) => ({ ...g, memberIds: [...g.memberIds, 'me'], via: 'list' }));
        return;
      }
      const created = get().createGroup(true, { silent: true });
      if (!created) return;
      for (let i = 0; i < others; i += 1) {
        const next = nextPerson(get(), t);
        set({ syntheticSeq: next.syntheticSeq });
        patchGroup(created.id, (g) => ({ ...g, memberIds: [...g.memberIds, next.id], via: 'list' }));
      }
    },

    /** Painel: tira da lista os grupos com vaga da categoria (estado "Nenhum grupo com vaga agora" e "Ainda não há vaga") */
    clearVacancies: () => {
      const t = tier();
      set((s) => ({ groups: s.groups.map((g) => (g.tier === t && !g.memberIds.includes('me') && vacancies(g) > 0 ? { ...g, listed: false } : g)) }));
    },

    setPlacedSeen: (placedSeen) => set({ placedSeen }),
    setAutoRunOnOpen: (autoRunOnOpen) => set({ autoRunOnOpen }),
    setGroupNotice: (groupNotice) => set({ groupNotice }),

    /* ---------------- Ofertas ---------------- */

    releaseOffer: async (id, opts) => {
      if (get().offerState[id]) return;
      // Os dados da oferta só chegam ao aparelho aqui (import dinâmico): nada existe antes do botão do painel
      const { offers } = await import('@/data/offers');
      if (get().offerState[id]) return;
      const offer = offers[id];
      const clock = clockNow();
      set((s) => ({
        offerData: { ...s.offerData, [id]: offer },
        offerState: {
          ...s.offerState,
          [id]: { releasedAt: clock.time, viewed: false, dismissed: false, interestAt: null, purchase: 'none', purchaseDay: null, notSeen: false, closedAt: null },
        },
      }));
      // Quem não tem a oferta no ingresso nunca vê card, toast nem item (e nunca cadeado)
      if (!offer.prices[tier()]) return;
      notify('n-offer', `Oferta especial do palco: ${offer.name}`, 'A condição do evento está disponível no app.', id, true);
      if (opts?.quiet) return;
      // Um toast por oferta: 6 s, sem som, sem vibração, sem push (exceção única, DEC-004)
      whenNoDialog(() =>
        demo().showToast({
          text: 'Oferta do palco disponível',
          tone: 'info',
          action: { label: 'Ver', run: () => demo().openOverlay('offer', id) },
        }),
      );
    },

    markOfferViewed: (id) =>
      set((s) => {
        const st = s.offerState[id];
        return st && !st.viewed ? { offerState: { ...s.offerState, [id]: { ...st, viewed: true } } } : s;
      }),

    dismissOffer: (id) =>
      set((s) => {
        const st = s.offerState[id];
        return st ? { offerState: { ...s.offerState, [id]: { ...st, dismissed: true, viewed: true } } } : s;
      }),

    sendInterest: (id) => {
      const time = clockNow().time;
      set((s) => {
        const st = s.offerState[id];
        return st ? { offerState: { ...s.offerState, [id]: { ...st, interestAt: time } } } : s;
      });
      haptic('light', 'pedido de contato enviado');
    },

    cancelInterest: (id) =>
      set((s) => {
        const st = s.offerState[id];
        return st ? { offerState: { ...s.offerState, [id]: { ...st, interestAt: null } } } : s;
      }),

    startPurchase: (id, paid) => {
      if (!paid) {
        set((s) => {
          const st = s.offerState[id];
          return st ? { offerState: { ...s.offerState, [id]: { ...st, notSeen: true } } } : s;
        });
        return;
      }
      const day = clockNow().dayIndex;
      set((s) => {
        const st = s.offerState[id];
        return st ? { offerState: { ...s.offerState, [id]: { ...st, purchase: 'confirming', notSeen: false, purchaseDay: day >= 1 && day <= 3 ? (day as DayNumber) : 3 } } } : s;
      });
      // A compra só vira "confirmada" depois da confirmação do servidor (no app real, o webhook): aqui, 2,5 s depois
      window.setTimeout(() => {
        set((s) => {
          const st = s.offerState[id];
          return st && st.purchase === 'confirming' ? { offerState: { ...s.offerState, [id]: { ...st, purchase: 'confirmed' } } } : s;
        });
        haptic('success', 'compra confirmada');
      }, 2500);
    },

    closeCondition: (id) => {
      const time = clockNow().time;
      set((s) => {
        const st = s.offerState[id];
        return st && !st.closedAt ? { offerState: { ...s.offerState, [id]: { ...st, closedAt: time } } } : s;
      });
    },

    /* ---------------- Gaia One ---------------- */

    startGaia: () => {
      set((s) => ({ gaia: { ...s.gaia, started: true } }));
      const d = demo();
      // A atividade é do Dia 2: leva a demonstração para lá (sem notificação nem toast, mesmo em palestra)
      if (d.day !== 2) d.setDay(2);
      if (d.moment === 'before' || d.moment === 'after') d.setMoment('break');
    },

    toggleGaiaStep: (n) => set((s) => ({ gaia: { ...s.gaia, steps: { ...s.gaia.steps, [n]: !s.gaia.steps[n] } } })),

    setGaiaProgress: (p) =>
      set((s) => {
        if (p === 'done') return { gaia: { ...s.gaia, started: true, steps: { 1: true, 2: true, 3: true }, completedAt: s.gaia.completedAt ?? clockNow().time } };
        return {
          gaia: {
            ...s.gaia,
            started: true,
            completedAt: null,
            steps: { 1: p > 1, 2: p > 2, 3: p > 3 },
          },
        };
      }),

    completeGaia: () => {
      set((s) => ({ gaia: { ...s.gaia, steps: { 1: true, 2: true, 3: true }, completedAt: clockNow().time } }));
      haptic('success', 'Gaia One ativado');
    },

    undoGaia: () => set((s) => ({ gaia: { ...s.gaia, completedAt: null, steps: { 1: true, 2: true, 3: true } } })),

    setGaiaDevice: (device) => set((s) => ({ gaia: { ...s.gaia, device } })),

    setSheet: (k, v) => set((s) => ({ sheets: { ...s.sheets, [k]: v } })),
    setSimulateError: (simulateError) => set({ simulateError }),

    reset: () =>
      set({
        groups: initialGroups(),
        groupsForcedClosed: false,
        shareWhatsapp: false,
        groupNotice: null,
        lastJoinAnnounce: null,
        placedSeen: false,
        autoRunOnOpen: false,
        syntheticSeq: 0,
        groupSeq: 0,
        offerData: {},
        offerState: {},
        gaia: initialGaia(),
        sheets: { gaiaHelp: false, offerInterest: false },
        simulateError: false,
      }),
  };
});

/* ---------- Seletores ---------- */

export function useFormation(): Formation {
  const moment = useDemo((s) => s.moment);
  const day = useDemo((s) => s.day);
  const phase = useDemo((s) => s.pausePhase);
  const forced = useFeatures((s) => s.groupsForcedClosed);
  return formationState(computeClock(moment, day, phase), forced);
}

export function useMyGroup(): Group | undefined {
  const tier = useDemo((s) => s.tier);
  const groups = useFeatures((s) => s.groups);
  return myGroupOf(groups, tier);
}

/** Atalho: abre a demonstração num estado vindo da URL (?groups=, ?formation=, ?offer=, ?gaia=, ?device=, ?err=1) */
function initFromUrl(): void {
  if (typeof window === 'undefined') return;
  const q = new URLSearchParams(window.location.search);
  const f = useFeatures.getState();
  const groups = q.get('groups');
  if (groups === 'none') f.setMyGroupSize(0);
  if (groups === 'one') f.setMyGroupSize(1);
  if (groups === 'two') f.setMyGroupSize(2);
  if (groups === 'full') f.setMyGroupSize(3);
  if (q.get('formation') === 'closed') f.setForcedClosed(true);
  if (q.get('err') === '1') f.setSimulateError(true);
  const device = q.get('device');
  if (device === 'ios' || device === 'android') f.setGaiaDevice(device);
  const gaia = q.get('gaia');
  if (gaia === 'start') f.startGaia();
  if (gaia === '1' || gaia === '2' || gaia === '3' || gaia === '4') f.setGaiaProgress(Number(gaia) as 1 | 2 | 3 | 4);
  if (gaia === 'done') f.setGaiaProgress('done');
  const offer = q.get('offer');
  if (offer) {
    const ids = offer.split(',').map((n) => OFFER_IDS[Number(n) - 1]).filter((x): x is OfferId => Boolean(x));
    for (const id of ids) void f.releaseOffer(id, { quiet: true });
  }
}
initFromUrl();

// "Reiniciar demo" (painel ou fim da exclusão de dados) reinicia também Grupos, Ofertas e Gaia One
useDemo.subscribe((s, prev) => {
  if (s.resetCount !== prev.resetCount) useFeatures.getState().reset();
});

