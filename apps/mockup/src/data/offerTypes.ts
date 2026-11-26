import type { DayNumber, Tier } from './types';

/**
 * Tipos das ofertas do palco. O CONTEÚDO (nome, preço, bônus, prazo) fica só em offers.ts, que o app carrega por
 * import() dinâmico na hora da liberação: antes disso nenhum dado da oferta está no aparelho (DEC-003, SEC-023).
 * Os ids são opacos de propósito (nada de nome de produto no código que roda desde a abertura).
 */
export type OfferId = 'of-1' | 'of-2';
export const OFFER_IDS: OfferId[] = ['of-1', 'of-2'];

/** Dia da liberação de cada oferta (o painel usa só isto, sem nome) */
export const OFFER_RELEASE_DAY: Record<OfferId, DayNumber> = { 'of-1': 2, 'of-2': 3 };
/** Hora da liberação no palco, nos dois dias (R-OF-11) */
export const OFFER_RELEASE_TIME = '18:15';
export const OFFER_RELEASE_LABEL: Record<OfferId, string> = { 'of-1': 'Dia 2 · 18h15', 'of-2': 'Dia 3 · 18h15' };

/** Valores em centavos */
export interface OfferPrice {
  installments: number;
  installment: number;
  total: number;
  cash: number;
}

export interface Offer {
  id: OfferId;
  name: string;
  /** Com artigo, para frases como "sobre o Olimpo" (SEC-022) */
  about: string;
  tagline: string;
  forWhom: string;
  includes: string[];
  bonus: string[];
  /** Rótulo do botão principal, definido pelo time (máx. ~24 caracteres) */
  ctaLabel: string;
  /** Quem pode ver, e o preço de cada categoria. Categoria ausente = oferta indisponível para o ingresso. */
  prices: Partial<Record<Tier, OfferPrice>>;
  /** Texto do chip "Para ..." */
  audience: string;
  /** Prazo real da condição */
  deadline: { date: string; time: string };
}
