import type { ReactNode } from 'react';
import { OverlayHeader } from './OverlayHeader';
import { OfflineBanner } from '@/components/device/OfflineBanner';
import { useDemo } from '@/state/store';

/** Página empilhada sobre as abas: cabeçalho com Voltar, banner de internet e corpo rolável. */
export function OverlayPage({
  title,
  onBack,
  action,
  children,
  footer,
  noPad,
}: {
  title: string;
  onBack?: () => void;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  noPad?: boolean;
}) {
  const closeOverlay = useDemo((s) => s.closeOverlay);
  return (
    <div className="flex h-full flex-col bg-bg">
      <OverlayHeader title={title} onBack={onBack ?? closeOverlay} action={action} />
      <OfflineBanner />
      <div className={noPad ? 'no-scrollbar flex-1 overflow-y-auto' : 'no-scrollbar flex-1 overflow-y-auto px-margin pb-6'}>{children}</div>
      {footer ? <div className="px-margin pb-4 pt-2">{footer}</div> : null}
    </div>
  );
}
