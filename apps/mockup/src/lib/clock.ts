import { edition } from '@/data/edition';
import { agenda } from '@/data/agenda';
import type { DayNumber, Material, Moment, Session } from '@/data/types';

/** Relógio do evento: derivado do momento e do dia escolhidos no painel. */
export interface EventClock {
  /** AAAA-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  /** 0 = antes do evento, 1..3 = dias, 4 = depois do evento */
  dayIndex: 0 | DayNumber | 4;
  minutes: number;
}

const MOMENT_TIME: Record<Moment, string> = {
  before: '09:00',
  live: '10:05',
  break: '10:38',
  lunch: '12:52',
  endOfDay: '19:10',
  after: '10:00',
};

/** Posição dentro do intervalo/almoço (A02): início, faltam 5 min e volte agora */
export type PausePhase = 'start' | 'five' | 'now';

const PAUSE_TIME: Partial<Record<Moment, Record<PausePhase, string>>> = {
  break: { start: '10:38', five: '10:40', now: '10:44' },
  lunch: { start: '12:52', five: '13:15', now: '13:20' },
};

export const PAUSE_PHASE_LABEL: Record<PausePhase, string> = {
  start: 'Início',
  five: 'Faltam 5 min',
  now: 'Volte agora',
};

/** Minutos que faltam para voltar ao salão. Almoço: volte 10 min antes do fim (13h20). */
export function minutesUntilReturn(moment: Moment, minutes: number): number | null {
  if (moment === 'break') return toMinutes('10:45') - minutes;
  if (moment === 'lunch') return toMinutes('13:20') - minutes;
  return null;
}

export function pauseStage(moment: Moment, minutes: number): PausePhase {
  const left = minutesUntilReturn(moment, minutes);
  if (left === null) return 'start';
  if (left <= (moment === 'break' ? 1 : 0)) return 'now';
  if (left <= 5) return 'five';
  return 'start';
}

export const MOMENT_LABEL: Record<Moment, string> = {
  before: 'Antes do evento',
  live: 'Sessão ao vivo',
  break: 'Intervalo',
  lunch: 'Almoço',
  endOfDay: 'Fim do dia',
  after: 'Depois do evento',
};

export function toMinutes(hhmm: string): number {
  const [h = '0', m = '0'] = hhmm.split(':');
  return Number(h) * 60 + Number(m);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function computeClock(moment: Moment, day: DayNumber, phase: PausePhase = 'start'): EventClock {
  const time = PAUSE_TIME[moment]?.[phase] ?? MOMENT_TIME[moment];
  const [d1, , d3] = edition.dates;
  if (moment === 'before') return { date: addDays(d1, -2), time, dayIndex: 0, minutes: toMinutes(time) };
  if (moment === 'after') return { date: addDays(d3, 1), time, dayIndex: 4, minutes: toMinutes(time) };
  return { date: edition.dates[day - 1] ?? d1, time, dayIndex: day, minutes: toMinutes(time) };
}

/** true se o ponto (dia, hora) já foi alcançado pelo relógio do evento */
function isReached(clock: EventClock, day: DayNumber, time: string): boolean {
  if (clock.dayIndex === 0) return false;
  if (clock.dayIndex === 4) return true;
  if (day !== clock.dayIndex) return day < clock.dayIndex;
  return toMinutes(time) <= clock.minutes;
}

export type SessionStatus = 'done' | 'now' | 'next' | 'upcoming';

export function sessionStatus(clock: EventClock, s: Session): SessionStatus {
  if (isReached(clock, s.day, s.end)) return 'done';
  if (isReached(clock, s.day, s.start)) return 'now';
  const next = nextSession(clock);
  return next?.id === s.id ? 'next' : 'upcoming';
}

export function currentSession(clock: EventClock): Session | undefined {
  if (clock.dayIndex === 0 || clock.dayIndex === 4) return undefined;
  return agenda.find(
    (s) => s.day === clock.dayIndex && toMinutes(s.start) <= clock.minutes && clock.minutes < toMinutes(s.end),
  );
}

export function nextSession(clock: EventClock): Session | undefined {
  if (clock.dayIndex === 4) return undefined;
  if (clock.dayIndex === 0) return agenda[0];
  return agenda.find(
    (s) =>
      (s.day === clock.dayIndex && toMinutes(s.start) > clock.minutes) || s.day > (clock.dayIndex as number),
  );
}

/** Progresso 0..1 da sessão em andamento */
export function sessionProgress(clock: EventClock, s: Session): number {
  const start = toMinutes(s.start);
  const end = toMinutes(s.end);
  return Math.min(1, Math.max(0, (clock.minutes - start) / (end - start)));
}

export type MaterialStatus = 'released' | 'scheduled';

export function materialStatus(clock: EventClock, m: Material): MaterialStatus {
  return isReached(clock, m.releaseAt.day, m.releaseAt.time) ? 'released' : 'scheduled';
}

/** "10:05" -> "10h05"; "14:00" -> "14h" */
export function formatHour(hhmm: string): string {
  const [h = '0', m = '00'] = hhmm.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

const dateFmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

export function formatLongDate(isoDate: string): string {
  const text = dateFmt.format(new Date(`${isoDate}T12:00:00`));
  return text.charAt(0).toUpperCase() + text.slice(1);
}
