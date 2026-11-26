import type { DemoUser, Objective, Participant } from '@/data/types';

export type AffinityLevel = 'alta' | 'media' | 'baixa' | 'nenhuma';

export interface Affinity {
  score: number;
  level: AffinityLevel;
  sharedInterests: string[];
  /** Motivo em 1 linha: "3 interesses em comum · vocês dois buscam parcerias no varejo" */
  reason: string;
}

/** Objetivos que se completam (o que um busca, o outro oferece) */
const COMPLEMENTS: Partial<Record<Objective, Objective[]>> = {
  'Busco clientes': ['Contrato serviços'],
  'Contrato serviços': ['Ofereço serviços', 'Busco clientes'],
  'Ofereço serviços': ['Contrato serviços'],
  'Quero mentorar': ['Quero ser mentorado'],
  'Quero ser mentorado': ['Quero mentorar'],
  'Busco sócio': ['Busco sócio', 'Investimento'],
  Investimento: ['Investimento', 'Busco sócio'],
  Parcerias: ['Parcerias'],
};

const SHARED_PHRASE: Record<Objective, string> = {
  'Busco sócio': 'vocês dois buscam sócio',
  'Busco clientes': 'vocês dois buscam clientes',
  'Contrato serviços': 'vocês dois contratam serviços',
  'Ofereço serviços': 'vocês dois oferecem serviços',
  'Quero mentorar': 'vocês dois querem mentorar',
  'Quero ser mentorado': 'vocês dois buscam mentoria',
  Parcerias: 'vocês dois buscam parcerias',
  Investimento: 'vocês dois falam de investimento',
};

function complementPhrase(mine: Objective, theirs: Objective): string {
  if (mine === theirs) return SHARED_PHRASE[mine];
  if (mine === 'Quero ser mentorado' && theirs === 'Quero mentorar') return 'quer mentorar quem está no seu momento';
  if (mine === 'Quero mentorar' && theirs === 'Quero ser mentorado') return 'busca a mentoria que você oferece';
  if (mine === 'Contrato serviços') return 'oferece serviços que você procura';
  if (theirs === 'Contrato serviços') return 'contrata o que você oferece';
  if (mine === 'Busco sócio' || theirs === 'Busco sócio') return 'sócio e investimento em pauta';
  return 'objetivos que se completam';
}

const SEGMENT_CONTEXT: Record<string, string> = {
  Varejo: 'no varejo',
  'Saúde e bem-estar': 'em saúde e bem-estar',
  'Fitness e bem-estar': 'em fitness',
  Franquias: 'em franquias',
  Tecnologia: 'em tecnologia',
  Imóveis: 'no mercado imobiliário',
};

export function computeAffinity(me: Pick<DemoUser, 'interests' | 'objectives'>, other: Participant): Affinity {
  const sharedInterests = other.interests.filter((t) => me.interests.includes(t));

  let objectivePhrase: string | undefined;
  let objectiveMatches = 0;
  for (const mine of me.objectives) {
    for (const theirs of other.objectives) {
      if (COMPLEMENTS[mine]?.includes(theirs)) {
        objectiveMatches += 1;
        objectivePhrase ??= complementPhrase(mine, theirs);
      }
    }
  }

  const score = sharedInterests.length * 2 + objectiveMatches * 3;
  const level: AffinityLevel = score >= 9 ? 'alta' : score >= 5 ? 'media' : score > 0 ? 'baixa' : 'nenhuma';

  const parts: string[] = [];
  if (sharedInterests.length > 0) {
    parts.push(
      sharedInterests.length === 1
        ? `1 interesse em comum`
        : `${sharedInterests.length} interesses em comum`,
    );
  }
  if (objectivePhrase) {
    const context = SEGMENT_CONTEXT[other.segment] ?? (sharedInterests[0] ? SEGMENT_CONTEXT[sharedInterests[0]] : undefined);
    parts.push(context ? `${objectivePhrase} ${context}` : objectivePhrase);
  }

  return { score, level, sharedInterests, reason: parts.join(' · ') };
}

/** Quem pode aparecer nas Conexões: VIP/Diamond com perfil visível */
export function connectionsPool(participants: Participant[]): Participant[] {
  return participants.filter((p) => p.visible && p.tier !== 'executivo');
}

/** Sugestões ordenadas por afinidade (só quem tem algo em comum) */
export function rankSuggestions(me: Pick<DemoUser, 'interests' | 'objectives'>, participants: Participant[]) {
  return connectionsPool(participants)
    .map((p) => ({ participant: p, affinity: computeAffinity(me, p) }))
    .filter((x) => x.affinity.level !== 'nenhuma')
    .sort((a, b) => b.affinity.score - a.affinity.score);
}

/** Contador real do cadeado do Executivo: "N pessoas com interesses parecidos com os seus estão aqui" */
export function countSimilarPeople(me: Pick<DemoUser, 'interests' | 'objectives'>, participants: Participant[]): number {
  return rankSuggestions(me, participants).length;
}
