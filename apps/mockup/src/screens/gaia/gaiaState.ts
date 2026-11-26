import { useFeatures, useMyGroup, type GaiaState } from '@/state/features';
import { isComplete } from '@/lib/groups';

export type GaiaStep = 1 | 2 | 3 | 4;

/** Passo atual: o primeiro sem "Feito"; o 4 ("Pronto") quando 1 a 3 estão feitos */
export function currentStep(g: GaiaState): GaiaStep {
  if (!g.steps[1]) return 1;
  if (!g.steps[2]) return 2;
  if (!g.steps[3]) return 3;
  return 4;
}

export function doneCount(g: GaiaState): number {
  return [g.steps[1], g.steps[2], g.steps[3]].filter(Boolean).length + (g.completedAt ? 1 : 0);
}

/**
 * Quantos do grupo já ativaram: só a contagem, nunca nomes (SEC-024, DEC-004). Os outros membros são simulados:
 * o primeiro colega já ativou; o aluno entra na conta quando toca em "Já ativei".
 */
export function useGroupGaiaCount(): { done: number; total: number } | null {
  const group = useMyGroup();
  const completed = useFeatures((s) => Boolean(s.gaia.completedAt));
  if (!group || !isComplete(group)) return null;
  const others = group.memberIds.filter((m) => m !== 'me');
  const doneOthers = others.length > 0 ? 1 : 0;
  return { done: doneOthers + (completed ? 1 : 0), total: group.memberIds.length };
}

export function groupGaiaText(c: { done: number; total: number }): string {
  return `${c.done} de ${c.total} do seu grupo já ativaram.`;
}
