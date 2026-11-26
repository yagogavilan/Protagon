import { CalendarClock, Megaphone, Users } from 'lucide-react';
import type { NotificationCategory } from '@/data/types';

const map = {
  avisos: { Icon: Megaphone, label: 'Aviso' },
  agenda: { Icon: CalendarClock, label: 'Agenda' },
  conexoes: { Icon: Users, label: 'Conexões' },
} as const;

export const CATEGORY_LABEL: Record<NotificationCategory, string> = {
  avisos: 'Avisos',
  agenda: 'Agenda',
  conexoes: 'Conexões',
};

export function NotificationIcon({ category }: { category: NotificationCategory }) {
  const { Icon, label } = map[category];
  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border-subtle bg-surface-2 text-gold-200"
      aria-label={label}
      role="img"
    >
      <Icon size={18} aria-hidden />
    </span>
  );
}
