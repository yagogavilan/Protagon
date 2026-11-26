import type { ReactElement } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { TopBar } from './TopBar';
import { TabBar, TABS } from './TabBar';
import { OfflineBanner } from '@/components/device/OfflineBanner';
import { ToastHost } from '@/components/ui/Toast';
import { useClock, useDemo, type TabId } from '@/state/store';
import { EuScreen, MateriaisScreen, TrilhaScreen } from '@/screens/TabScreens';
import { HomeScreen, contextFor, greetingFor } from '@/screens/HomeScreen';
import { ConnectionsScreen } from '@/screens/connections';
import { CredentialScreen } from '@/screens/CredentialScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { CheckoutScreen, MapScreen, QrScanScreen } from '@/screens/OverlayScreens';
import { cn } from '@/lib/cn';

const SCREENS: Record<TabId, () => ReactElement> = {
  agora: HomeScreen,
  trilha: TrilhaScreen,
  conexoes: ConnectionsScreen,
  materiais: MateriaisScreen,
  eu: EuScreen,
};

const OVERLAYS = {
  credential: CredentialScreen,
  notifications: NotificationsScreen,
  checkout: CheckoutScreen,
  map: MapScreen,
  qrscan: QrScanScreen,
} as const;

const EASE = [0.2, 0.8, 0.2, 1] as const;
/** tab bar 64 + safe area 34 + 12 */
const TOAST_BOTTOM = 64 + 34 + 12;

/** Shell: TopBar + aba (troca sem animação) + TabBar; overlays por cima; Toast acima da tab bar. */
export function AppShell() {
  const tab = useDemo((s) => s.tab);
  const overlay = useDemo((s) => s.overlay);
  const clock = useClock();
  const Screen = SCREENS[tab];
  const title = TABS.find((t) => t.id === tab)?.label ?? '';
  const Overlay = overlay ? OVERLAYS[overlay] : null;

  return (
    <div className={cn('absolute inset-0 flex flex-col', tab === 'agora' && 'bg-radial-top bg-no-repeat')}>
      {tab === 'agora' ? (
        <TopBar variant="home" greeting={greetingFor(clock)} context={contextFor(clock)} />
      ) : tab === 'conexoes' ? (
        <TopBar variant="icons" />
      ) : (
        <TopBar variant="title" title={title} />
      )}
      {/* Agora e Conexões tratam o offline no próprio conteúdo (prioridade de banner da spec) */}
      {tab !== 'agora' && tab !== 'conexoes' ? <OfflineBanner /> : null}
      <main className="no-scrollbar relative flex-1 overflow-y-auto pb-[110px]">
        <Screen key={tab} />
      </main>
      <TabBar />
      <ToastHost bottom={TOAST_BOTTOM} />

      <AnimatePresence>
        {Overlay ? (
          <motion.div
            key={overlay}
            className="absolute inset-0 z-overlay"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <Overlay />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
