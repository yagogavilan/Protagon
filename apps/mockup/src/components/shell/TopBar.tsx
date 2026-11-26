import { Bell, QrCode } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useDemo, useUnreadCount } from '@/state/store';
import { cn } from '@/lib/cn';

type TopBarProps =
  | { variant: 'home'; greeting: string; context: string }
  | { variant: 'title'; title: string }
  | { variant: 'icons' };

/** TopBar (design-system §TopBar): altura 56 + safe area, sino e QR (48) em todas as telas. Sem blur. */
export function TopBar(props: TopBarProps) {
  const unread = useUnreadCount();
  const openOverlay = useDemo((s) => s.openOverlay);
  return (
    <header className={cn('relative z-topbar flex min-h-topbar items-center justify-between gap-3 px-margin pt-[54px]')}>
      <div className="min-w-0 py-1">
        {props.variant === 'home' ? (
          <>
            <p className="truncate text-h2 text-text-primary">{props.greeting}</p>
            <p className="truncate text-caption text-text-secondary">{props.context}</p>
          </>
        ) : props.variant === 'title' ? (
          <h1 className="truncate text-h1 text-text-primary">{props.title}</h1>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <IconButton label="Notificações" badge={unread} onClick={() => openOverlay('notifications')}>
          <Bell size={24} aria-hidden />
        </IconButton>
        <IconButton label="Abrir credencial" tone="framed" onClick={() => openOverlay('credential')}>
          <QrCode size={24} aria-hidden />
        </IconButton>
      </div>
    </header>
  );
}
