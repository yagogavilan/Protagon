import { useEffect, useRef, type ComponentType, type ReactElement } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TopBar } from './TopBar';
import { TabBar, TABS } from './TabBar';
import { OfflineBanner } from '@/components/device/OfflineBanner';
import { ToastHost } from '@/components/ui/Toast';
import { IMMERSIVE, useClock, useDemo, usePauseStage, type OverlayName, type TabId } from '@/state/store';
import { HomeScreen, contextFor, greetingFor } from '@/screens/HomeScreen';
import { TrilhaScreen } from '@/screens/TrilhaScreen';
import { MateriaisScreen } from '@/screens/MaterialsScreen';
import { EuScreen } from '@/screens/me/MeScreen';
import { PrefsScreen } from '@/screens/me/PrefsScreen';
import { PrivacyScreen } from '@/screens/me/PrivacyScreen';
import { NpsScreen } from '@/screens/me/NpsScreen';
import { SupportScreen } from '@/screens/me/SupportScreen';
import { ConnectionsScreen } from '@/screens/connections';
import { ActivateScreen } from '@/screens/connections/ActivateScreen';
import { ProfileEditScreen } from '@/screens/connections/ProfileEditScreen';
import { ProfileScreen } from '@/screens/connections/ProfileScreen';
import { ChatScreen } from '@/screens/connections/ChatScreen';
import { QrScreen } from '@/screens/connections/QrScreen';
import { RequestHost } from '@/screens/connections/RequestHost';
import { SafetySheet } from '@/screens/connections/SafetySheet';
import { MeetSheet } from '@/screens/connections/MeetSheet';
import { CredentialScreen } from '@/screens/CredentialScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { CheckoutScreen } from '@/screens/OverlayScreens';
import { MapScreen } from '@/screens/MapScreen';
import { BreakScreen } from '@/screens/BreakScreen';
import { EatScreen } from '@/screens/EatScreen';
import { SessionScreen } from '@/screens/SessionScreen';
import { MaterialViewer } from '@/screens/MaterialViewer';
import { WifiSheet } from '@/screens/WifiSheet';
import { GroupListScreen } from '@/screens/groups/GroupListScreen';
import { GroupCreateScreen } from '@/screens/groups/GroupCreateScreen';
import { GroupCodeScreen } from '@/screens/groups/GroupCodeScreen';
import { MyGroupScreen } from '@/screens/groups/MyGroupScreen';
import { OfferScreen } from '@/screens/offers/OfferScreen';
import { OfferPayScreen } from '@/screens/offers/OfferPayScreen';
import { OfferListScreen } from '@/screens/offers/OfferListScreen';
import { GaiaScreen } from '@/screens/gaia/GaiaScreen';
import { PermissionSheet } from '@/screens/PermissionSheet';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';
import { inertProps } from '@/lib/inert';

const SCREENS: Record<TabId, () => ReactElement> = {
  agora: HomeScreen,
  trilha: TrilhaScreen,
  conexoes: ConnectionsScreen,
  materiais: MateriaisScreen,
  eu: EuScreen,
};

const OVERLAYS: Record<OverlayName, ComponentType> = {
  credential: CredentialScreen,
  notifications: NotificationsScreen,
  checkout: CheckoutScreen,
  map: MapScreen,
  qrscan: QrScreen,
  break: BreakScreen,
  eat: EatScreen,
  session: SessionScreen,
  material: MaterialViewer,
  person: ProfileScreen,
  chat: ChatScreen,
  activate: ActivateScreen,
  profile: ProfileEditScreen,
  prefs: PrefsScreen,
  privacy: PrivacyScreen,
  nps: NpsScreen,
  support: SupportScreen,
  groups: GroupListScreen,
  groupCreate: GroupCreateScreen,
  groupCode: GroupCodeScreen,
  myGroup: MyGroupScreen,
  offer: OfferScreen,
  offerPay: OfferPayScreen,
  offerList: OfferListScreen,
  gaia: GaiaScreen,
};

const EASE = [0.2, 0.8, 0.2, 1] as const;
/** tab bar 64 + safe area 34 */
const TABBAR_SPACE = 64 + 34;
const TOAST_BOTTOM = TABBAR_SPACE + 12;

/** Shell: TopBar + aba (troca sem animação) + TabBar; páginas empilhadas por cima (a tab bar fica, salvo telas imersivas). */
export function AppShell() {
  const tab = useDemo((s) => s.tab);
  const overlay = useDemo((s) => s.overlay);
  const overlayId = useDemo((s) => s.overlayId);
  const moment = useDemo((s) => s.moment);
  const clock = useClock();
  const stage = usePauseStage();
  const Screen = SCREENS[tab];
  const title = TABS.find((t) => t.id === tab)?.label ?? '';
  const Overlay = overlay ? OVERLAYS[overlay] : null;
  const immersive = overlay ? IMMERSIVE.includes(overlay) : false;

  // Vibração nos "faltam 5 min" e "volte agora" (uma vez por mudança de fase)
  useEffect(() => {
    if (moment !== 'break' && moment !== 'lunch') return;
    if (stage === 'five') haptic('warning', 'faltam 5 min');
    if (stage === 'now') haptic('error', 'volte agora');
  }, [stage, moment]);

  // Página empilhada: o foco vai para ela e volta ao gatilho ao fechar (WCAG 2.4.3)
  const pageRef = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const overlayKey = overlay ? `${overlay}:${overlayId ?? ''}` : '';
  useEffect(() => {
    if (!overlayKey) {
      if (trigger.current && document.contains(trigger.current)) trigger.current.focus();
      trigger.current = null;
      return;
    }
    if (!trigger.current && document.activeElement instanceof HTMLElement && document.activeElement !== document.body) trigger.current = document.activeElement;
    const t = window.setTimeout(() => {
      const page = pageRef.current;
      (page?.querySelector<HTMLElement>('h1') ?? page)?.focus();
    }, 60);
    return () => window.clearTimeout(t);
  }, [overlayKey]);

  return (
    <div className={cn('absolute inset-0 flex flex-col', tab === 'agora' && 'bg-radial-top bg-no-repeat')}>
      {/* O que fica atrás da página empilhada sai da ordem de foco e do leitor de tela (inert) */}
      <div className="contents" {...inertProps(Boolean(Overlay))}>
        {tab === 'agora' ? (
          <TopBar variant="home" greeting={greetingFor(clock)} context={contextFor(clock)} />
        ) : tab === 'conexoes' ? (
          <TopBar variant="icons" />
        ) : (
          <TopBar variant="title" title={title} />
        )}
        {/* Agora e Conexões tratam o offline no próprio conteúdo (prioridade de banner da spec) */}
        {tab !== 'agora' && tab !== 'conexoes' && tab !== 'materiais' ? <OfflineBanner /> : null}
        <main className="no-scrollbar relative flex-1 overflow-y-auto pb-[110px]">
          <Screen key={tab} />
        </main>
      </div>
      <div className="contents" {...inertProps(Boolean(Overlay) && immersive)}>
        <TabBar />
      </div>
      <ToastHost bottom={TOAST_BOTTOM} />

      <AnimatePresence mode="popLayout" initial={false}>
        {Overlay ? (
          <motion.div
            key={`${overlay}:${overlayId ?? ''}`}
            ref={pageRef}
            tabIndex={-1}
            className="absolute inset-x-0 top-0 z-overlay bg-bg outline-none"
            style={{ bottom: immersive ? 0 : TABBAR_SPACE }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <Overlay />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <RequestHost />
      <SafetySheet />
      <MeetSheet />
      <WifiSheet />
      <PermissionSheet />
    </div>
  );
}
