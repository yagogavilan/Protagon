import { computeClock, toMinutes, type EventClock } from '@/lib/clock';
import type { Offer, OfferPrice } from '@/data/offerTypes';
import type { Tier } from '@/data/types';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Centavos para "R$ 1.490,00" */
export function formatBRL(cents: number): string {
  return brl.format(cents / 100).replace(/ /g, ' ');
}

export function priceFor(offer: Offer, tier: Tier): OfferPrice | undefined {
  return offer.prices[tier];
}

/** "14/03" a partir de AAAA-MM-DD */
function shortDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

function hourText(hhmm: string): string {
  const [h = '0', m = '00'] = hhmm.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

/** "19h10 de 14/03" */
export function deadlineText(offer: Offer): string {
  return `${hourText(offer.deadline.time)} de ${shortDate(offer.deadline.date)}`;
}

export function deadlineHour(offer: Offer): string {
  return hourText(offer.deadline.time);
}

function stamp(date: string, time: string): number {
  return new Date(`${date}T${time}:00`).getTime();
}

/** Minutos que faltam para o fim da condição no relógio do evento (negativo = passou) */
export function minutesLeft(offer: Offer, clock: EventClock): number {
  return Math.round((stamp(offer.deadline.date, offer.deadline.time) - stamp(clock.date, clock.time)) / 60000);
}

/**
 * Contagem sem alarme (OF02): "Faltam 3h10" acima de 60 min, "Faltam 38 min" até 10 min, "Faltam 07:00" nos 10 últimos.
 * Sem cor de alerta, sem vibração, sem aviso ao se aproximar.
 */
export function countdownText(minutes: number): string {
  if (minutes <= 0) return 'Prazo encerrado';
  if (minutes >= 2 * 1440) return `Faltam ${Math.floor(minutes / 1440)} dias`;
  if (minutes >= 1440) {
    const h = Math.floor((minutes - 1440) / 60);
    return h === 0 ? 'Falta 1 dia' : `Falta 1 dia e ${h}h`;
  }
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `Faltam ${h}h${m === 0 ? '' : String(m).padStart(2, '0')}`;
  }
  if (minutes >= 10) return `Faltam ${minutes} min`;
  return `Faltam ${String(minutes).padStart(2, '0')}:00`;
}

export function spokenCountdown(minutes: number): string {
  if (minutes <= 0) return 'prazo encerrado';
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  const parts: string[] = [];
  if (d > 0) parts.push(d === 1 ? '1 dia' : `${d} dias`);
  if (h > 0) parts.push(h === 1 ? '1 hora' : `${h} horas`);
  if (m > 0 && d === 0) parts.push(m === 1 ? '1 minuto' : `${m} minutos`);
  return `faltam ${parts.join(' e ')}`;
}

/** Relógio do evento para uma liberação: usado pelo painel para alinhar o dia da demonstração */
export function clockAt(day: 1 | 2 | 3): EventClock {
  return computeClock('live', day);
}

export { toMinutes };
