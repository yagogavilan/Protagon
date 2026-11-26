import { useMemo } from 'react';
import { agenda } from '@/data/agenda';
import { participants } from '@/data/participants';
import { receivedRequests, type ReceivedRequest } from '@/data/requests';
import type { Meeting, MeetingSlot, Moment, Participant, PointId } from '@/data/types';
import { computeAffinity, rankSuggestions, type Suggestion } from '@/lib/affinity';
import { formatHour, toMinutes, type EventClock } from '@/lib/clock';
import { haptic } from '@/lib/haptics';
import { DAILY_REQUEST_LIMIT, useDemo, type DemoStateSnapshot } from '@/state/store';

export interface PendingRequest extends ReceivedRequest {
  from: Participant;
}

export function findParticipant(id: string): Participant | undefined {
  return participants.find((p) => p.id === id);
}

export function firstName(name: string): string {
  return name.split(' ')[0] ?? name;
}

/** Pedidos recebidos ainda sem resposta. F5 (proposta): pedidos de Diamond ficam no topo. */
export function usePendingRequests(): PendingRequest[] {
  const answered = useDemo((s) => s.answeredRequests);
  const blocked = useDemo((s) => s.blocked);
  return receivedRequests
    .filter((r) => !answered[r.id] && !blocked[r.participantId])
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

export type Relation = 'none' | 'pending' | 'incoming' | 'connected';

export function relationOf(s: DemoStateSnapshot, id: string): Relation {
  if (s.connected[id]) return 'connected';
  for (const day of [1, 2, 3] as const) {
    const o = s.suggestionOutcomes[day][id];
    if (o === 'sent' || o === 'queued') return 'pending';
  }
  if (receivedRequests.some((r) => r.participantId === id && !s.answeredRequests[r.id])) return 'incoming';
  return 'none';
}

export function useRelation(id: string): Relation {
  return useDemo((s) => relationOf(s, id));
}

/**
 * Instagram (DEC-002, regra de contato): só depois do aceite mútuo. Exceção proposta: se o aluno liga "Mostrar meu
 * Instagram antes da conexão" em Privacidade, vê o @ de quem também liberou. Retorna null quando não pode aparecer.
 */
export function useInstagramHandle(p: Participant): string | null {
  const relation = useRelation(p.id);
  const early = useDemo((s) => s.instagramEarly);
  if (relation === 'connected') return p.instagram;
  return early && p.instagramEarly ? p.instagram : null;
}

export function useSuggestionFor(p: Participant): Suggestion {
  const profile = useDemo((s) => s.profile);
  return useMemo(() => ({ participant: p, affinity: computeAffinity(profile, p) }), [p, profile]);
}

/** Fila de sugestões do dia: quem ainda não foi tratado hoje ("Agora não" volta amanhã, D5) */
export function useSuggestionQueue(): { all: Suggestion[]; queue: Suggestion[]; handled: number } {
  const day = useDemo((s) => s.day);
  const outcomes = useDemo((s) => s.suggestionOutcomes[day]);
  const profile = useDemo((s) => s.profile);
  const blocked = useDemo((s) => s.blocked);
  const connected = useDemo((s) => s.connected);
  const all = useMemo(() => rankSuggestions(profile, participants).filter((x) => !blocked[x.participant.id]), [profile, blocked]);
  const queue = all.filter((s) => !outcomes[s.participant.id] && !connected[s.participant.id]);
  return { all, queue, handled: all.length - queue.length };
}

/** Envia um pedido de conexão (C04). Desconta do limite do dia (D4), inclusive quando fica na fila offline. */
export async function sendRequest(p: Participant): Promise<void> {
  await new Promise((r) => window.setTimeout(r, 700));
  const s = useDemo.getState();
  const limit = DAILY_REQUEST_LIMIT[s.tier];
  const sent = s.requestsSentByDay[s.day];
  if (sent >= limit) return;
  s.setRequestsSent(sent + 1);
  s.setRequestFor(null);
  if (!s.online) {
    s.setSuggestionOutcome(p.id, 'queued');
    s.showToast({ text: 'Pedido salvo. Enviamos assim que a internet voltar.', tone: 'info' });
    return;
  }
  s.setSuggestionOutcome(p.id, 'sent');
  haptic('light', 'pedido enviado');
  s.showToast({
    text: s.moment === 'live' ? `Pedido enviado. ${firstName(p.name)} recebe no próximo intervalo.` : `Pedido enviado para ${p.name}`,
    tone: 'success',
  });
}

/* ---------- Encontros (C08) ---------- */

export const POINT_NAME: Record<PointId, string> = { A: 'Ponto A', B: 'Ponto B', C: 'Ponto C' };

/** "Ponto C, 15h40" (com "Dia 2 · " quando não é o dia atual) */
export function meetingLabel(m: Pick<Meeting, 'point' | 'slot'>, clock: EventClock): string {
  const day = clock.dayIndex >= 1 && clock.dayIndex <= 3 && m.slot.day !== clock.dayIndex ? `Dia ${m.slot.day} · ` : '';
  return `${day}${POINT_NAME[m.point]}, ${formatHour(m.slot.time)}`;
}

export interface SlotOption {
  slot: MeetingSlot;
  kind: 'intervalo' | 'almoco';
  title: string;
}

/** Próximos intervalos e almoços a partir do relógio. Depois do evento, não há o que marcar. */
export function upcomingSlots(clock: EventClock): SlotOption[] {
  if (clock.dayIndex === 4) return [];
  return agenda
    .filter((s) => (s.kind === 'intervalo' || s.kind === 'almoco') && (clock.dayIndex === 0 || s.day > clock.dayIndex || (s.day === clock.dayIndex && toMinutes(s.end) > clock.minutes)))
    .map((s) => {
      const mins = s.kind === 'almoco' ? toMinutes(s.start) + 20 : toMinutes(s.start);
      const time = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
      return {
        slot: { sessionId: s.id, day: s.day, time },
        kind: s.kind as 'intervalo' | 'almoco',
        title: s.kind === 'almoco' ? 'Almoço' : 'Intervalo',
      };
    });
}

export function defaultPoint(kind: 'intervalo' | 'almoco'): PointId {
  return kind === 'almoco' ? 'C' : 'A';
}
