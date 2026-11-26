import type { Moment } from '@/data/types';
import { currentSession, formatHour, nextSession, type EventClock } from './clock';

export interface LiveActivity {
  label: string;
  /** Texto curto para a Dynamic Island compacta */
  compact: string;
  detail: string;
  tone: 'live' | 'warning' | 'gold';
}

/** Live Activity / Dynamic Island conforme o momento (G04) */
export function liveActivityFor(moment: Moment, clock: EventClock): LiveActivity | null {
  const now = currentSession(clock);
  const next = nextSession(clock);
  switch (moment) {
    case 'live':
      return now
        ? { label: 'Ao vivo', compact: `até ${formatHour(now.end)}`, detail: `${now.title} · até ${formatHour(now.end)}`, tone: 'live' }
        : null;
    case 'break':
      return { label: 'Intervalo', compact: `volta ${formatHour(now?.end ?? '10:45')}`, detail: `Intervalo · volte ao salão às ${formatHour(now?.end ?? '10:45')}`, tone: 'warning' };
    case 'lunch':
      return { label: 'Almoço', compact: 'retorno 13h30', detail: 'Almoço · retorno 13h30', tone: 'warning' };
    case 'before':
      return next ? { label: 'Protagon', compact: 'em 2 dias', detail: `Começa em 2 dias, às ${formatHour(next.start)}`, tone: 'gold' } : null;
    default:
      return null;
  }
}
