import type { Objective, Participant, TopicId } from '@/data/types';
import { demoUser, topics } from '@/data/participants';

/** O que a afinidade precisa saber de quem olha (o aluno da demo) */
export interface AffinityProfile {
  interests: string[];
  objectives: Objective[];
  /** Maior desafio atual (opcional, "Complete seu perfil") */
  challenge?: TopicId | null;
  /** Onde tem bastante conhecimento (opcional) */
  expertise?: TopicId[];
}

/** Cruzamento desafio x conhecimento (DEC-002): peso alto, acima de interesses em comum e de objetivos */
const CROSS_WEIGHT = 6;

const lcFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);
const firstOf = (name: string) => name.split(' ')[0] ?? name;

/** Dois níveis visíveis (design-system §PersonCard): 'alta' e 'boa'. Abaixo de 'boa' a pessoa não é sugerida. */
export type AffinityLevel = 'alta' | 'boa' | 'baixa' | 'nenhuma';

export interface Affinity {
  score: number;
  level: AffinityLevel;
  sharedInterests: string[];
  /** Tema que a pessoa domina e é o maior desafio do aluno */
  theyHelpMe: TopicId | null;
  /** Tema que o aluno domina e é o maior desafio da pessoa */
  iHelpThem: TopicId | null;
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

/** Motivo do cruzamento em uma linha; vazio se não há cruzamento */
function crossReason(theyHelpMe: TopicId | null, iHelpThem: TopicId | null, other: Participant): string {
  if (theyHelpMe && iHelpThem) return `Vocês podem se ajudar: ${lcFirst(topics[theyHelpMe].know)} ↔ ${lcFirst(topics[iHelpThem].know)}`;
  if (theyHelpMe) return `Domina ${lcFirst(topics[theyHelpMe].know)}, seu maior desafio hoje`;
  if (iHelpThem) return `Você domina ${lcFirst(topics[iHelpThem].know)}, maior desafio de ${firstOf(other.name)} hoje`;
  return '';
}

export function computeAffinity(me: AffinityProfile, other: Participant): Affinity {
  const theyHelpMe = me.challenge && other.expertise.includes(me.challenge) ? me.challenge : null;
  const iHelpThem = me.expertise?.includes(other.challenge) ? other.challenge : null;
  const crossCount = Number(Boolean(theyHelpMe)) + Number(Boolean(iHelpThem));
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

  const score = sharedInterests.length * 2 + objectiveMatches * 3 + crossCount * CROSS_WEIGHT;
  const level: AffinityLevel = score >= 9 ? 'alta' : score >= 5 ? 'boa' : score > 0 ? 'baixa' : 'nenhuma';

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

  // O cruzamento vem primeiro; sem ele, o motivo antigo (interesses + objetivos) segue valendo
  const reason = crossReason(theyHelpMe, iHelpThem, other) || parts.join(' · ');
  return { score, level, sharedInterests, theyHelpMe, iHelpThem, reason };
}

/** Quem pode aparecer nas Conexões: VIP/Diamond com perfil visível */
export function connectionsPool(participants: Participant[]): Participant[] {
  return participants.filter((p) => p.visible && p.tier !== 'executivo');
}

export interface Suggestion {
  participant: Participant;
  affinity: Affinity;
}

/** Sugestões ordenadas só por afinidade (F5: ingresso não altera a ordem). Só "alta" e "boa". */
export function rankSuggestions(me: AffinityProfile, participants: Participant[]): Suggestion[] {
  return connectionsPool(participants)
    .map((p) => ({ participant: p, affinity: computeAffinity(me, p) }))
    .filter((x) => x.affinity.level === 'alta' || x.affinity.level === 'boa')
    .sort((a, b) => b.affinity.score - a.affinity.score);
}

/**
 * Contador do cadeado do Executivo (F1, aprovado): total real de perfis de Conexões ativos e visíveis
 * da edição. Não usa afinidade, porque o Executivo não tem perfil para comparar.
 */
export function activeProfilesCount(participants: Participant[]): number {
  return connectionsPool(participants).length;
}

/** Abaixo disso o número é escondido (C00: "Contador indisponível ou baixo") */
export const MIN_PROFILES_TO_SHOW = 20;

const OBJECTIVE_VERB: Record<Objective, string> = {
  'Busco sócio': 'busca sócio',
  'Busco clientes': 'busca clientes',
  'Contrato serviços': 'contrata serviços',
  'Ofereço serviços': 'oferece serviços',
  'Quero mentorar': 'quer mentorar',
  'Quero ser mentorado': 'busca mentoria',
  Parcerias: 'busca parcerias',
  Investimento: 'fala de investimento',
};

export function objectiveLabel(o: Objective): string {
  const v = OBJECTIVE_VERB[o];
  return v.charAt(0).toUpperCase() + v.slice(1);
}

/** Modelos de mensagem do pedido (C04): objetivo, interesses, empresa */
export function requestTemplates(s: Suggestion): string[] {
  const { participant: p, affinity } = s;
  const first = p.name.split(' ')[0] ?? p.name;
  // objetivo da pessoa que combina com os do usuário da demo; senão, o primeiro
  const objective = p.objectives.find((o) => demoUser.objectives.some((m) => COMPLEMENTS[m]?.includes(o))) ?? p.objectives[0];
  const interests = affinity.sharedInterests.slice(0, 2).map((t) => t.toLowerCase());
  const t1 = objective
    ? `Oi, ${first}. Vi que você ${OBJECTIVE_VERB[objective]}. Tenho uma rede de academias em Porto Alegre e acho que podemos somar. Vamos conversar no próximo intervalo?`
    : `Oi, ${first}. Tenho uma rede de academias em Porto Alegre. Vamos conversar no próximo intervalo?`;
  const t2 = affinity.theyHelpMe
    ? `Oi, ${first}. Vi que você domina ${lcFirst(topics[affinity.theyHelpMe].know)}, meu maior desafio agora. Posso te contar mais no intervalo das 15h40?`
    : affinity.sharedInterests.length > 0
      ? `Oi, ${first}. Temos ${affinity.sharedInterests.length === 1 ? '1 interesse' : `${affinity.sharedInterests.length} interesses`} em comum, entre eles ${interests.join(' e ')}. Que tal trocarmos uma ideia no intervalo das 15h40?`
      : `Oi, ${first}. Que tal trocarmos uma ideia no intervalo das 15h40?`;
  const t3 = `Oi, ${first}. Quero conhecer melhor a ${p.company}. Podemos nos encontrar em um Ponto de Conexão?`;
  return [t1, t2, t3];
}
