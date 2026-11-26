import { AnimatePresence, motion } from 'motion/react';
import { TopBar } from './TopBar';
import { TabBar, TABS } from './TabBar';
import { OfflineBanner } from '@/components/device/OfflineBanner';
import { useDemo, type TabId } from '@/state/store';
import { AgoraScreen, ConexoesScreen, EuScreen, MateriaisScreen, TrilhaScreen } from '@/screens/TabScreens';
import { CredentialScreen } from '@/screens/CredentialScreen';
import { NotificationsScreen } from '@/screens/NotificationsScreen';
import { edition } from '@/data/edition';

const SCREENS: Record<TabId, () => JSX.Element> = {
  agora: AgoraScreen,
  trilha: TrilhaScreen,
  conexoes: ConexoesScreen,
  materiais: MateriaisScreen,
  eu: EuScreen,
};

const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Shell do app: TopBar + conteúdo da aba + TabBar; credencial e notificações abrem por cima. */
export function AppShell() {
  const tab = useDemo((s) => s.tab);
  const overlay = useDemo((s) => s.overlay);
  const Screen = SCREENS[tab];
  const title = TABS.find((t) => t.id === tab)?.label ?? '';

  return (
    <div className="absolute inset-0 flex flex-col">
      <TopBar title={title} subtitle={edition.name} />
      <OfflineBanner />
      <main className="no-scrollbar flex-1 overflow-y-auto pb-[110px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12, ease: EASE }}
          >
            <Screen />
          </motion.div>
        </AnimatePresence>
      </main>
      <TabBar />

      <AnimatePresence>
        {overlay ? (
          <motion.div
            key={overlay}
            className="absolute inset-0 z-30"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            {overlay === 'credential' ? <CredentialScreen /> : <NotificationsScreen />}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
