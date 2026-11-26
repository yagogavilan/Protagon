import { agenda } from '@/data/agenda';
import { computeClock, currentSession, materialStatus, nextSession } from '@/lib/clock';
import { materials } from '@/data/materials';
import { useDemo, type ConnPanel, type TabId } from '@/state/store';
import { useFeatures } from '@/state/features';
import { OFFER_IDS, OFFER_RELEASE_DAY, type OfferId } from '@/data/offerTypes';
import { myGroupOf } from '@/lib/groups';

export interface ScreenCode {
  code: string;
  label: string;
  group: 'Entrada' | 'Agora' | 'Camada global' | 'Trilha' | 'Conexões' | 'Materiais' | 'Eu' | 'Grupos' | 'Ofertas' | 'Gaia One';
}

/** Códigos da Etapa 1 (docs/design/etapa-1.html §3). "Ir direto para" no painel e `?go=` na URL. */
export const SCREEN_CODES: ScreenCode[] = [
  { code: 'E01', label: 'Login', group: 'Entrada' },
  { code: 'E02', label: 'Código', group: 'Entrada' },
  { code: 'E03', label: 'Onboarding', group: 'Entrada' },
  { code: 'E04', label: 'Permissão de notificações', group: 'Entrada' },
  { code: 'E04n', label: 'Permissão negada', group: 'Entrada' },
  { code: 'A01', label: 'Home', group: 'Agora' },
  { code: 'A02', label: 'Intervalo / almoço (tela cheia)', group: 'Agora' },
  { code: 'A03', label: 'Onde comer', group: 'Agora' },
  { code: 'A04', label: 'Mapa do local', group: 'Agora' },
  { code: 'A04c', label: 'Mapa com Ponto de Conexão', group: 'Agora' },
  { code: 'A05', label: 'Wi-Fi', group: 'Agora' },
  { code: 'G01', label: 'Credencial', group: 'Camada global' },
  { code: 'G02', label: 'Notificações', group: 'Camada global' },
  { code: 'G03', label: 'Push na tela bloqueada', group: 'Camada global' },
  { code: 'G04', label: 'Live Activity / Dynamic Island', group: 'Camada global' },
  { code: 'G05', label: 'Banner sem internet', group: 'Camada global' },
  { code: 'T01', label: 'Linha do tempo', group: 'Trilha' },
  { code: 'T02', label: 'Detalhe da sessão', group: 'Trilha' },
  { code: 'C00', label: 'Cadeado (Executivo)', group: 'Conexões' },
  { code: 'C01', label: 'Ativar perfil', group: 'Conexões' },
  { code: 'C01b', label: 'Complete seu perfil', group: 'Conexões' },
  { code: 'C02', label: 'Sugestões', group: 'Conexões' },
  { code: 'C03', label: 'Perfil da pessoa', group: 'Conexões' },
  { code: 'C04', label: 'Pedido de conexão', group: 'Conexões' },
  { code: 'C05', label: 'Pedidos recebidos', group: 'Conexões' },
  { code: 'C06', label: 'Explorar', group: 'Conexões' },
  { code: 'C07', label: 'Chat', group: 'Conexões' },
  { code: 'C08', label: 'Marcar encontro', group: 'Conexões' },
  { code: 'C09', label: 'Minha rede', group: 'Conexões' },
  { code: 'C10', label: 'Ler QR', group: 'Conexões' },
  { code: 'C11', label: 'Segurança', group: 'Conexões' },
  { code: 'M01', label: 'Lista de materiais', group: 'Materiais' },
  { code: 'M02', label: 'Leitor / player', group: 'Materiais' },
  { code: 'U01', label: 'Perfil e ingresso', group: 'Eu' },
  { code: 'U02', label: 'Preferências de notificação', group: 'Eu' },
  { code: 'U03', label: 'Privacidade', group: 'Eu' },
  { code: 'U04', label: 'Avaliação do dia', group: 'Eu' },
  { code: 'U05', label: 'Suporte e FAQ', group: 'Eu' },
  { code: 'GR01', label: 'Card "Forme seu grupo"', group: 'Grupos' },
  { code: 'GR02', label: 'Grupos com vaga', group: 'Grupos' },
  { code: 'GR02v', label: 'Lista vazia (nenhum grupo com vaga)', group: 'Grupos' },
  { code: 'GR03', label: 'Criar grupo (código e QR)', group: 'Grupos' },
  { code: 'GR04', label: 'Entrar por código ou QR', group: 'Grupos' },
  { code: 'GR05', label: 'Me coloque em um grupo', group: 'Grupos' },
  { code: 'GR05n', label: 'Me coloque, sem vaga', group: 'Grupos' },
  { code: 'GR06', label: 'Meu grupo', group: 'Grupos' },
  { code: 'OF01', label: 'Card na Home + toast', group: 'Ofertas' },
  { code: 'OF02', label: 'Tela da oferta', group: 'Ofertas' },
  { code: 'OF02x', label: 'Oferta não disponível (Executivo)', group: 'Ofertas' },
  { code: 'OF02e', label: 'Condição encerrada', group: 'Ofertas' },
  { code: 'OF03', label: 'Falar com um consultor', group: 'Ofertas' },
  { code: 'OF04', label: 'Ofertas do evento', group: 'Ofertas' },
  { code: 'GA01', label: 'Card na Home', group: 'Gaia One' },
  { code: 'GA02', label: 'Checklist de 4 passos', group: 'Gaia One' },
  { code: 'GA03', label: 'Preciso de ajuda', group: 'Gaia One' },
];

/**
 * Libera uma oferta como o time faz no palco (botão do painel): leva a demonstração ao dia da liberação e libera.
 * Os dados da oferta só chegam ao aparelho aqui (import dinâmico).
 */
export async function releaseFromPanel(id: OfferId, toast = true): Promise<void> {
  const d = useDemo.getState();
  const day = OFFER_RELEASE_DAY[id];
  if (d.day < day || d.moment === 'before' || d.moment === 'after') {
    d.setDay(day);
    if (d.moment === 'before' || d.moment === 'after') d.setMoment('live');
  }
  await useFeatures.getState().releaseOffer(id, { quiet: !toast });
}

/**
 * Leva o mockup direto a uma tela do inventário, ajustando o que ela exige (ingresso, perfil ativo, rede de exemplo,
 * momento). Não altera o ingresso quando a tela vale para os dois.
 */
export function goTo(code: string): void {
  const st = useDemo;
  const get = st.getState;
  const F = useFeatures.getState;
  // folhas abertas por atalho não atravessam de uma tela para outra
  F().setSheet('gaiaHelp', false);
  F().setSheet('offerInterest', false);
  const base = { auth: 'app' as const, stack: [], overlay: null, overlayId: undefined, locked: false, permissionSheet: false, wifiOpen: false };
  const tab = (t: TabId, extra: object = {}) => st.setState({ ...base, tab: t, ...extra });
  const overlay = (name: Parameters<ReturnType<typeof get>['openOverlay']>[0], id?: string, t: TabId = get().tab) => {
    st.setState({ ...base, tab: t, stack: [{ name, id }], overlay: name, overlayId: id });
  };
  const vip = () => {
    if (get().tier === 'executivo') st.setState({ tier: 'vip' });
  };
  const active = () => {
    vip();
    st.setState({ connectionsActive: true, consent: true, connectionsPaused: false });
  };
  const withNetwork = () => {
    active();
    if (Object.keys(get().connected).length === 0) get().seedNetwork();
  };
  const conn = (panel: ConnPanel) => {
    active();
    tab('conexoes', { connPanel: panel });
  };
  const ensurePause = () => {
    const m = get().moment;
    if (m !== 'break' && m !== 'lunch') get().setMoment('break');
  };
  const clock = () => computeClock(get().moment, get().day, get().pausePhase);

  // Grupos: formação aberta (Dia 1, até 10h45) e o aluno sem grupo, salvo quando a tela pede o contrário
  const openFormation = () => {
    F().setForcedClosed(false);
    if (get().day !== 1) get().setDay(1);
    if (get().moment !== 'live' && get().moment !== 'break') get().setMoment('break');
  };
  const noGroup = () => {
    openFormation();
    F().setMyGroupSize(0);
  };
  const withOffer = async (id: OfferId, toast = false) => {
    await releaseFromPanel(id, toast);
    const offer = F().offerData[id];
    // atalhos de tela da oferta precisam de um ingresso que a tenha; "OF02x" escolhe o contrário de propósito
    if (offer && !offer.prices[get().tier] && code !== 'OF02x') st.setState({ tier: 'vip' });
  };
  const gaiaAt = (p: 2) => {
    F().startGaia();
    F().setGaiaProgress(p);
  };

  switch (code) {
    case 'E01': return void st.setState({ ...base, auth: 'login' });
    case 'E02': return void st.setState({ ...base, auth: 'code' });
    case 'E03': return void st.setState({ ...base, auth: 'onboarding' });
    case 'E04': return tab('trilha', { permissionSheet: true, permissionAsked: true, notifPermission: 'unknown' });
    case 'E04n': return tab('trilha', { permissionSheet: true, permissionAsked: true, notifPermission: 'denied' });
    case 'A01': return tab('agora');
    case 'A02': ensurePause(); return overlay('break');
    case 'A03':
      get().setMoment('lunch');
      return overlay('eat');
    case 'A04': return overlay('map');
    case 'A04c':
      vip();
      st.setState({ mapFocus: 'C' });
      return overlay('map');
    case 'A05': return tab('agora', { wifiOpen: true });
    case 'G01': return overlay('credential');
    case 'G02': return overlay('notifications');
    case 'G03':
      st.setState({ ...base, locked: true, tab: 'agora' });
      if (get().notifications.every((n) => n.read)) get().fireNotification();
      return;
    case 'G04':
      if (get().moment === 'before' || get().moment === 'after' || get().moment === 'endOfDay') get().setMoment('lunch');
      return void st.setState({ ...base, locked: true, tab: 'agora' });
    case 'G05': return tab('agora', { online: false });
    case 'T01': return tab('trilha');
    case 'T02': {
      const c = clock();
      const s = currentSession(c) ?? nextSession(c) ?? agenda[1]!;
      return overlay('session', s.kind === 'intervalo' || s.kind === 'almoco' ? 'd1-s02' : s.id, 'trilha');
    }
    case 'C00':
      st.setState({ tier: 'executivo' });
      return tab('conexoes');
    case 'C01':
      vip();
      st.setState({ connectionsActive: false, consent: false });
      return overlay('activate', undefined, 'conexoes');
    case 'C01b':
      active();
      return overlay('profile', undefined, 'conexoes');
    case 'C02': return conn('sugestoes');
    case 'C03':
      withNetwork();
      return overlay('person', 'p19', 'conexoes');
    case 'C04': {
      conn('sugestoes');
      return void st.setState({ requestFor: 'p15' });
    }
    case 'C05': return conn('pedidos');
    case 'C06': return conn('explorar');
    case 'C07':
      withNetwork();
      return overlay('chat', 'p19', 'conexoes');
    case 'C08':
      withNetwork();
      overlay('chat', 'p17', 'conexoes');
      return void st.setState({ meetFor: { id: 'p17', mode: 'new' } });
    case 'C09':
      withNetwork();
      return tab('conexoes', { connPanel: 'rede' });
    case 'C10': vip(); active(); return overlay('qrscan');
    case 'C11':
      withNetwork();
      overlay('person', 'p19', 'conexoes');
      return void st.setState({ safetyFor: 'p19' });
    case 'M01': return tab('materiais');
    case 'M02': {
      const target = materials.find((m) => m.id === 'm-d1-1')!;
      if (materialStatus(clock(), target) === 'scheduled') get().setMoment('break');
      return overlay('material', 'm-d1-1', 'materiais');
    }
    case 'U01': return tab('eu');
    case 'U02': return overlay('prefs', undefined, 'eu');
    case 'U03':
      if (get().tier !== 'executivo') active();
      return overlay('privacy', undefined, 'eu');
    case 'U04': return overlay('nps', undefined, 'eu');
    case 'U05': return overlay('support', undefined, 'eu');
    case 'GR01':
      noGroup();
      return tab('agora');
    case 'GR02':
      noGroup();
      return overlay('groups', undefined, 'agora');
    case 'GR02v':
      noGroup();
      F().clearVacancies();
      return overlay('groups', undefined, 'agora');
    case 'GR03':
      openFormation();
      F().setMyGroupSize(1);
      return overlay('groupCreate', 'new', 'agora');
    case 'GR04':
      noGroup();
      return overlay('groupCode', undefined, 'agora');
    case 'GR05':
    case 'GR05n':
      noGroup();
      if (code === 'GR05n') F().clearVacancies();
      F().setAutoRunOnOpen(true);
      return overlay('groups', undefined, 'agora');
    case 'GR06':
      openFormation();
      F().setMyGroupSize(2);
      return overlay('myGroup', undefined, 'agora');
    case 'OF01':
      return void withOffer('of-1', true).then(() => tab('agora'));
    case 'OF02':
      return void withOffer('of-1').then(() => overlay('offer', 'of-1', 'agora'));
    case 'OF02x':
      st.setState({ tier: 'executivo' });
      return void withOffer('of-1').then(() => overlay('offer', 'of-1', 'agora'));
    case 'OF02e':
      return void withOffer('of-1').then(() => {
        F().closeCondition('of-1');
        overlay('offer', 'of-1', 'agora');
      });
    case 'OF03':
      return void withOffer('of-1').then(() => {
        overlay('offer', 'of-1', 'agora');
        F().setSheet('offerInterest', true);
      });
    case 'OF04':
      return void Promise.all(OFFER_IDS.map((id) => withOffer(id))).then(() => overlay('offerList', undefined, 'eu'));
    case 'GA01':
      gaiaAt(2);
      return tab('agora');
    case 'GA02':
      gaiaAt(2);
      return overlay('gaia', undefined, 'agora');
    case 'GA03':
      gaiaAt(2);
      overlay('gaia', undefined, 'agora');
      return void F().setSheet('gaiaHelp', true);
    default:
  }
}

/** Para onde leva cada notificação ao ser tocada */
export function openNotificationTarget(templateId: string, ref?: string): void {
  const s = useDemo.getState();
  switch (templateId) {
    case 'n-offer':
      return void useDemo.setState({ stack: [{ name: 'offer', id: ref }], overlay: 'offer', overlayId: ref, tab: 'agora' });
    case 'n-group-joined':
    case 'n-group-complete':
    case 'n-group-placed': {
      const mine = myGroupOf(useFeatures.getState().groups, s.tier);
      if (!mine) return s.setTab('agora');
      return void useDemo.setState({ stack: [{ name: 'myGroup' }], overlay: 'myGroup', overlayId: undefined, tab: 'agora' });
    }
    case 'n-request-received':
      return void useDemo.setState({ stack: [], overlay: null, overlayId: undefined, tab: 'conexoes', connPanel: 'pedidos' });
    case 'n-request-accepted':
    case 'n-after-export':
      return void useDemo.setState({ stack: [], overlay: null, overlayId: undefined, tab: 'conexoes', connPanel: 'rede' });
    case 'n-pre-connections':
      return s.setTab('conexoes');
    case 'n-agenda-updated':
    case 'seed-agenda':
      return s.setTab('trilha');
    case 'n-material-released':
    case 'n-after-materials':
      return s.setTab('materiais');
    case 'n-nps':
      return void useDemo.setState({ stack: [{ name: 'nps' }], overlay: 'nps', overlayId: undefined, tab: 'eu' });
    default:
      return s.setTab('agora');
  }
}
