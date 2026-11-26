import { useState } from 'react';
import { BellOff, Bell, CheckCheck, Hourglass } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { NotificationIcon } from '@/components/shell/NotificationIcon';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { useDemo } from '@/state/store';
import { openNotificationTarget } from '@/lib/nav';
import type { NotificationCategory } from '@/data/types';
import { plural } from '@/lib/connections';
import { cn } from '@/lib/cn';

type Filter = 'todas' | NotificationCategory;

/**
 * G02 · Notificações: filtros Avisos, Agenda e Conexões (só VIP+), lidas e não lidas, vazia,
 * "limpar tudo" com desfazer e "em espera até o intervalo".
 */
export function NotificationsScreen() {
  const notifications = useDemo((s) => s.notifications);
  const held = useDemo((s) => s.held);
  const tier = useDemo((s) => s.tier);
  const permission = useDemo((s) => s.notifPermission);
  const markRead = useDemo((s) => s.markRead);
  const markAllRead = useDemo((s) => s.markAllRead);
  const clearNotifications = useDemo((s) => s.clearNotifications);
  const setPermissionSheet = useDemo((s) => s.setPermissionSheet);
  const showToast = useDemo((s) => s.showToast);
  const [filter, setFilter] = useState<Filter>('todas');

  const vip = tier !== 'executivo';
  const visibleAll = notifications.filter((n) => vip || n.category !== 'conexoes');
  const list = visibleAll.filter((n) => filter === 'todas' || n.category === filter);
  const unread = (c: Filter) => visibleAll.filter((n) => !n.read && (c === 'todas' || n.category === c)).length;
  const unreadTotal = unread('todas');
  const hasGroup = visibleAll.some((n) => n.category === 'grupo');

  const items: { id: Filter; label: string; count?: number; countLabel?: string }[] = [
    { id: 'todas', label: 'Todas', count: unreadTotal || undefined, countLabel: plural(unreadTotal, 'não lida', 'não lidas') },
    { id: 'avisos', label: 'Avisos', count: unread('avisos') || undefined, countLabel: plural(unread('avisos'), 'não lida', 'não lidas') },
    { id: 'agenda', label: 'Agenda', count: unread('agenda') || undefined, countLabel: plural(unread('agenda'), 'não lida', 'não lidas') },
    ...(vip ? [{ id: 'conexoes' as const, label: 'Conexões', count: unread('conexoes') || undefined, countLabel: plural(unread('conexoes'), 'não lida', 'não lidas') }] : []),
    ...(hasGroup ? [{ id: 'grupo' as const, label: 'Grupo', count: unread('grupo') || undefined, countLabel: plural(unread('grupo'), 'não lida', 'não lidas') }] : []),
  ];

  const clearAll = () => {
    const backup = notifications;
    clearNotifications();
    showToast({ text: 'Notificações removidas', tone: 'info', action: { label: 'Desfazer', run: () => clearNotifications(backup) } });
  };

  return (
    <OverlayPage
      title="Notificações"
      action={
        visibleAll.length > 0 ? (
          <button type="button" onClick={clearAll} className="h-12 rounded-pill px-1 text-body-strong text-gold-200 active:bg-surface-3">
            Limpar tudo
          </button>
        ) : null
      }
    >
      <div className="flex flex-col gap-3">
        {permission === 'denied' ? (
          <StatusBanner
            tone="warning"
            icon={<BellOff size={24} />}
            title="Avisos do sistema desligados"
            text="Você só vê os avisos aqui dentro."
            action={{ label: 'Como ativar', onClick: () => setPermissionSheet(true) }}
          />
        ) : null}

        <SegmentedTabs<Filter> label="Filtrar notificações" items={items} value={filter} onChange={setFilter} />

        {held.length > 0 ? (
          <div className="flex items-start gap-3 rounded-md border border-border-subtle bg-surface-1 p-3" role="status">
            <Hourglass size={20} aria-hidden className="mt-0.5 shrink-0 text-gold-200" />
            <p className="text-body text-text-secondary">
              <span className="text-text-primary">{held.length === 1 ? '1 notificação em espera' : `${held.length} notificações em espera`}</span> até o intervalo, para não tirar sua atenção
              da palestra.
            </p>
          </div>
        ) : null}

        {unreadTotal > 0 && list.length > 0 ? (
          <button
            type="button"
            onClick={markAllRead}
            className="-my-1 flex min-h-touch items-center gap-2 self-start rounded-md px-1 text-body-strong text-gold-200 active:bg-surface-3"
          >
            <CheckCheck size={18} aria-hidden /> Marcar todas como lidas
          </button>
        ) : null}

        {list.length === 0 ? (
          visibleAll.length === 0 ? (
            <EmptyState
              icon={<Bell size={48} strokeWidth={1.5} />}
              title="Nada por aqui"
              text={vip ? 'Avisos do evento, mudanças na agenda e pedidos de conexão aparecem aqui.' : 'Avisos do evento e mudanças na agenda aparecem aqui.'}
            />
          ) : (
            <EmptyState icon={<Bell size={48} strokeWidth={1.5} />} title="Nada neste filtro" text="Veja todas as notificações para encontrar o que procura." />
          )
        ) : (
          <ul className="flex flex-col gap-2">
            {list.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => {
                    markRead(n.id);
                    openNotificationTarget(n.templateId, n.ref);
                  }}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border p-3 text-left active:bg-surface-3',
                    n.read ? 'border-border-subtle bg-bg' : 'border-border-gold bg-surface-1',
                  )}
                >
                  <NotificationIcon category={n.category} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={cn('text-body', n.read ? 'text-text-secondary' : 'font-semibold text-text-primary')}>{n.title}</span>
                      <span className="tabular shrink-0 text-caption text-text-tertiary">{n.time}</span>
                    </span>
                    <span className="block text-body text-text-secondary">{n.body}</span>
                    <span className="sr-only">{n.read ? 'Lida' : 'Não lida'}</span>
                  </span>
                  {!n.read ? <span className="mt-2 h-2 w-2 shrink-0 rounded-pill bg-gold-200" aria-hidden /> : null}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </OverlayPage>
  );
}
