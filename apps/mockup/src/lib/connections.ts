import { demoUser, participants } from '@/data/participants';
import { rankSuggestions, type Suggestion } from '@/lib/affinity';
import { receivedRequests, type ReceivedRequest } from '@/data/requests';
import type { Moment, Participant } from '@/data/types';
import { useDemo } from '@/state/store';

export interface PendingRequest extends ReceivedRequest {
  from: Participant;
}

/** Pedidos recebidos ainda sem resposta. F5 (proposta): pedidos de Diamond ficam no topo. */
export function usePendingRequests(): PendingRequest[] {
  const answered = useDemo((s) => s.answeredRequests);
  return receivedRequests
    .filter((r) => !answered[r.id])
    .map((r) => ({ ...r, from: participants.find((p) => p.id === r.participantId)! }))
    .filter((r) => Boolean(r.from))
    .sort((a, b) => Number(b.from.tier === 'diamond') - Number(a.from.tier === 'diamond'));
}

/** P7: contadores e badges de Conexões só fora da palestra */
export function countersVisible(moment: Moment): boolean {
  return moment !== 'live';
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}


const ALL_SUGGESTIONS: Suggestion[] = rankSuggestions(demoUser, participants);

/** Fila de sugestões do dia: quem ainda não foi tratado hoje ("Agora não" volta amanhã, D5) */
export function useSuggestionQueue(): { all: Suggestion[]; queue: Suggestion[]; handled: number } {
  const day = useDemo((s) => s.day);
  const outcomes = useDemo((s) => s.suggestionOutcomes[day]);
  const queue = ALL_SUGGESTIONS.filter((s) => !outcomes[s.participant.id]);
  return { all: ALL_SUGGESTIONS, queue, handled: ALL_SUGGESTIONS.length - queue.length };
}
