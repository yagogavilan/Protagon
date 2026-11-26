import { Bell, Hourglass } from 'lucide-react';
import { OverlayHeader } from '@/components/shell/OverlayHeader';
import { NotificationIcon } from '@/components/shell/NotificationIcon';
import { useDemo } from '@/state/store';
import { cn } from '@/lib/cn';

/**
 * G02 · Notificações (versão de fundação). Lista, lidas/não lidas, vazia e "em espera até o intervalo".
 * Filtros Avisos/Agenda/Conexões entram com a spec do designer.
 */
export function NotificationsScreen() {
  const notifications = useDemo((s) => s.notifications);
  const held = useDemo((s) => s.held);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const markAllRead = useDemo((s) => s.markAllRead);
  const clearNotifications = useDemo((s) => s.clearNotifications);

  const close = () => {
    markAllRead();
    closeOverlay();
  };

  return (
    <div className="flex h-full flex-col bg-bg">
      <OverlayHeader
        title="Notificações"
        onBack={close}
        action={
          notifications.length > 0 ? (
            <button type="button" onClick={clearNotifications} className="h-11 rounded-pill px-2 text-[15px] font-semibold text-gold-200">
              Limpar tudo
            </button>
          ) : null
        }
      />
      <div className="no-scrollbar flex-1 overflow-y-auto px-margin pb-10">
        {held.length > 0 ? (
          <div className="mb-3 flex items-start gap-3 rounded-md border border-border-subtle bg-surface-1 p-3" role="status">
            <Hourglass size={20} aria-hidden className="mt-0.5 shrink-0 text-gold-200" />
            <p className="text-[15px] leading-[22px] text-text-secondary">
              <span className="text-text-primary">
                {held.length === 1 ? '1 notificação em espera' : `${held.length} notificações em espera`}
              </span>{' '}
              até o intervalo, para não tirar sua atenção da palestra.
            </p>
          </div>
        ) : null}

        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-6 pt-20 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-pill border border-border-subtle bg-surface-1">
              <Bell size={24} aria-hidden className="text-gold-200" />
            </span>
            <p className="text-h2 text-text-primary">Nada por aqui</p>
            <p className="text-body text-text-secondary">Avisos do evento, mudanças na agenda e pedidos de conexão aparecem aqui.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={cn(
                  'flex items-start gap-3 rounded-lg border p-3',
                  n.read ? 'border-border-subtle bg-bg' : 'border-border-subtle bg-surface-1',
                )}
              >
                <NotificationIcon category={n.category} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-body font-semibold text-text-primary">{n.title}</p>
                    <span className="tabular shrink-0 text-caption text-text-tertiary">{n.time}</span>
                  </div>
                  <p className="text-[15px] leading-[22px] text-text-secondary">{n.body}</p>
                </div>
                {!n.read ? <span className="mt-2 h-2 w-2 shrink-0 rounded-pill bg-gold-200" aria-label="Não lida" role="img" /> : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
