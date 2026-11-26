import type { Moment } from '@/data/types';
import { currentSession, formatHour, nextSession, toMinutes, type EventClock, type PausePhase } from './clock';

export interface LiveActivity {
  label: string;
  /** Texto curto para a Dynamic Island compacta */
  compact: string;
  detail: string;
  /** Linha extra da versão expandida */
  extra: string;
  tone: 'live' | 'warning' | 'gold';
}

/** Live Activity / Dynamic Island conforme o momento e a posição na pausa (G04: compacta, expandida, volte agora) */
export function liveActivityFor(moment: Moment, clock: EventClock, stage: PausePhase = 'start'): LiveActivity | null {
  const now = currentSession(clock);
  const next = nextSession(clock);
  switch (moment) {
    case 'live':
      return now
        ? {
            label: 'Ao vivo',
            compact: `até ${formatHour(now.end)}`,
            detail: `${now.title} · até ${formatHour(now.end)}`,
            extra: `${toMinutes(now.end) - clock.minutes} min para terminar`,
            tone: 'live',
          }
        : null;
    case 'break': {
      const back = formatHour(now?.end ?? '10:45');
      if (stage === 'now') return { label: 'Volte agora', compact: 'agora', detail: 'Volte agora ao salão', extra: `A sessão começa às ${back}`, tone: 'warning' };
      if (stage === 'five') return { label: 'Faltam 5 min', compact: back, detail: `Faltam 5 min · volte ao salão às ${back}`, extra: 'Café no foyer', tone: 'warning' };
      return { label: 'Intervalo', compact: `volta ${back}`, detail: `Intervalo · volte ao salão às ${back}`, extra: 'Café no foyer', tone: 'warning' };
    }
    case 'lunch':
      if (stage === 'now') return { label: 'Volte agora', compact: 'agora', detail: 'Volte agora ao salão', extra: 'A sessão começa às 13h30', tone: 'warning' };
      if (stage === 'five') return { label: 'Faltam 5 min', compact: '13h20', detail: 'Faltam 5 min · volte ao salão às 13h20', extra: 'Almoço até 13h30', tone: 'warning' };
      return { label: 'Almoço', compact: 'retorno 13h30', detail: 'Almoço · retorno 13h30', extra: 'Volte ao salão às 13h20', tone: 'warning' };
    case 'before':
      return next ? { label: 'Protagon', compact: 'em 2 dias', detail: `Começa em 2 dias, às ${formatHour(next.start)}`, extra: 'Credenciamento a partir das 7h30', tone: 'gold' } : null;
    default:
      return null;
  }
}
