import type { ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import { useDemo } from '@/state/store';
import { StatusBar } from './StatusBar';
import { DynamicIsland } from './DynamicIsland';
import { PushBanner } from './PushBanner';
import { LockScreen } from './LockScreen';

/** Moldura de iPhone com tela de 390×844 */
export function DeviceFrame({ children, scale = 1 }: { children: ReactNode; scale?: number }) {
  const locked = useDemo((s) => s.locked);
  return (
    <div
      style={{ width: 414 * scale, height: 868 * scale }}
      className="relative shrink-0"
    >
      <div
        className="absolute left-0 top-0 origin-top-left rounded-[64px] bg-surface-1 p-3 shadow-card"
        style={{ width: 414, height: 868, transform: `scale(${scale})` }}
      >
        {/* aro metálico */}
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[64px] border border-border-strong" />
        {/* botões laterais */}
        <span aria-hidden className="absolute -left-[3px] top-[150px] h-8 w-[3px] rounded-l bg-border-strong" />
        <span aria-hidden className="absolute -left-[3px] top-[210px] h-14 w-[3px] rounded-l bg-border-strong" />
        <span aria-hidden className="absolute -left-[3px] top-[280px] h-14 w-[3px] rounded-l bg-border-strong" />
        <span aria-hidden className="absolute -right-[3px] top-[230px] h-20 w-[3px] rounded-r bg-border-strong" />

        <div
          className="relative h-[844px] w-[390px] overflow-hidden rounded-[52px] bg-bg"
          role="region"
          aria-label="Tela do app Protagon (simulação de iPhone)"
        >
          <StatusBar />
          <DynamicIsland />
          {children}
          <AnimatePresence>{locked ? <LockScreen key="lock" /> : null}</AnimatePresence>
          <PushBanner />
          {/* indicador de home */}
          <div aria-hidden className="pointer-events-none absolute bottom-2 left-1/2 z-50 h-[5px] w-[134px] -translate-x-1/2 rounded-pill bg-text-primary" />
        </div>
      </div>
    </div>
  );
}
