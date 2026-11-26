import { OFFER_IDS, type Offer, type OfferId, type OfferPrice } from '@/data/offerTypes';
import type { EventClock } from '@/lib/clock';
import { deadlineHour, minutesLeft } from '@/lib/offers';
import { useFeatures, type OfferState } from '@/state/features';
import { useClock, useDemo } from '@/state/store';

export type OfferPhase = 'active' | 'interest' | 'confirmed' | 'closed';

export interface OfferView {
  offer: Offer;
  state: OfferState;
  price: OfferPrice;
  phase: OfferPhase;
  minutes: number;
}

/** A condição terminou: pelo prazo real (relógio do evento) ou porque o painel encerrou */
export function isClosed(offer: Offer, state: OfferState, clock: EventClock): boolean {
  return Boolean(state.closedAt) || minutesLeft(offer, clock) <= 0;
}

/** Hora em que a condição terminou ("19h10"): a do prazo, ou a do momento em que o time encerrou */
export function closedHour(offer: Offer, state: OfferState): string {
  if (!state.closedAt) return deadlineHour(offer);
  const [h = '0', m = '00'] = state.closedAt.split(':');
  return m === '00' ? `${Number(h)}h` : `${Number(h)}h${m}`;
}

export function phaseOf(offer: Offer, state: OfferState, clock: EventClock): OfferPhase {
  if (state.purchase === 'confirmed') return 'confirmed';
  if (isClosed(offer, state, clock)) return 'closed';
  return state.interestAt ? 'interest' : 'active';
}

/**
 * Ofertas liberadas E disponíveis para o ingresso do aluno. Antes da liberação a lista é vazia: nada existe no aparelho.
 * Oferta que o ingresso não tem nunca entra aqui (sem card, sem item, sem cadeado).
 */
export function useOffers(): OfferView[] {
  const data = useFeatures((s) => s.offerData);
  const states = useFeatures((s) => s.offerState);
  const tier = useDemo((s) => s.tier);
  const clock = useClock();
  const out: OfferView[] = [];
  for (const id of OFFER_IDS) {
    const offer = data[id];
    const state = states[id];
    const price = offer?.prices[tier];
    if (!offer || !state || !price) continue;
    out.push({ offer, state, price, phase: phaseOf(offer, state, clock), minutes: minutesLeft(offer, clock) });
  }
  return out;
}

export function useOffer(id: OfferId | undefined): { offer?: Offer; state?: OfferState } {
  const offer = useFeatures((s) => (id ? s.offerData[id] : undefined));
  const state = useFeatures((s) => (id ? s.offerState[id] : undefined));
  return { offer, state };
}
