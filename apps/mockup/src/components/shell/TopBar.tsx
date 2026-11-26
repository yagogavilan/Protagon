import { Bell, QrCode } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { useDemo, useUnreadCount } from '@/state/store';

/** Barra superior presente em todas as telas do app: título, sino com badge e credencial. */
export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const unread = useUnreadCount();
  const openOverlay = useDemo((s) => s.openOverlay);
  return (
    <header className="flex items-center justify-between gap-3 px-margin pb-3 pt-[58px]">
      <div className="min-w-0">
        {subtitle ? <p className="truncate text-caption text-gold-200">{subtitle}</p> : null}
        <h1 className="truncate text-h1 text-text-primary">{title}</h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <IconButton label="Notificações" badge={unread} onClick={() => openOverlay('notifications')}>
          <Bell size={20} aria-hidden />
        </IconButton>
        <IconButton label="Credencial" onClick={() => openOverlay('credential')}>
          <QrCode size={20} aria-hidden />
        </IconButton>
      </div>
    </header>
  );
}
