import type { Moment, NpsKey } from '@/data/types';
import type { EventClock } from '@/lib/clock';

/** Avaliação que vale agora: a do dia durante o evento e a final depois dele */
export function npsKeyFor(clock: EventClock, moment: Moment): NpsKey {
  if (moment === 'after' || clock.dayIndex === 4) return 'final';
  if (clock.dayIndex >= 1 && clock.dayIndex <= 3) return String(clock.dayIndex) as NpsKey;
  return '1';
}

/** A avaliação do Dia N abre no fim do Dia N; a final, depois do evento */
export function npsAvailable(key: NpsKey, clock: EventClock, moment: Moment): boolean {
  if (moment === 'after' || clock.dayIndex === 4) return true;
  if (key === 'final' || clock.dayIndex === 0) return false;
  const n = Number(key);
  return clock.dayIndex > n || (clock.dayIndex === n && moment === 'endOfDay');
}
