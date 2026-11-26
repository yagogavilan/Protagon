import { edition } from '@/data/edition';
import { CODE_ALPHABET, extraPeople, FORMATION, groupPersonRefs, MY_ZONE, type GroupPerson } from '@/data/groups';
import { participants } from '@/data/participants';
import { demoUser } from '@/data/participants';
import type { Tier } from '@/data/types';
import { toMinutes, type EventClock } from '@/lib/clock';

export const TEAM_SIZE = 3;

/** Grupo no estado da demonstração (cópia mutável dos dados de exemplo) */
export interface Group {
  id: string;
  tier: Tier;
  number: number;
  code: string;
  /** 'me' = o aluno da demonstração */
  memberIds: string[];
  zone: number;
  listed: boolean;
  nickname: string;
  /** 3 por padrão; 4 (ou 2) só por decisão do time (proposta, R-GR-5) */
  targetSize: number;
  /** O time encaixou o aluno neste grupo */
  placedByTeam: boolean;
  /** Como o aluno entrou */
  via: 'list' | 'code' | 'qr' | 'auto' | 'team' | 'created' | null;
  /** Simula "alguém entrou antes de mim": o servidor já fechou o grupo, a lista ainda não sabe */
  pendingFill: boolean;
}

/** Todos os alunos que aparecem em grupos, por id. Nome e empresa vêm de participants.ts; "me" é o aluno da demonstração. */
const people: Record<string, GroupPerson> = {};
for (const [id, shares] of Object.entries(groupPersonRefs)) {
  const p = participants.find((x) => x.id === id);
  if (p) people[id] = { id, name: p.name, company: p.company, tier: p.tier, sharesWhatsapp: shares };
}
for (const x of extraPeople) people[x.id] = x;

export function personOf(id: string, tier: Tier): GroupPerson {
  if (id === 'me') return { id, name: demoUser.name, company: demoUser.company, tier, sharesWhatsapp: false };
  const p = people[id];
  if (!p) throw new Error(`Aluno de grupo ausente: ${id}`);
  return p;
}

export function firstNameOf(name: string): string {
  return name.split(' ')[0] ?? name;
}

/** "Setor VIP": só o setor, nunca a fila (SEC-018) */
export function sectorName(tier: Tier): string {
  return edition.sectorByTier[tier].split(' · ')[0] ?? edition.sectorByTier[tier];
}

export function vacancies(g: Group): number {
  return Math.max(0, g.targetSize - g.memberIds.length);
}

export function isComplete(g: Group): boolean {
  return vacancies(g) === 0;
}

export function groupLabel(g: Group): string {
  return `Grupo ${g.number}`;
}

export function vacancyText(n: number): string {
  return n === 1 ? '1 vaga' : `${n} vagas`;
}

export function myGroupOf(groups: Group[], tier: Tier): Group | undefined {
  return groups.find((g) => g.tier === tier && g.memberIds.includes('me'));
}

/** Grupos da lista: só da categoria do aluno, com vaga, fora os "só por código". Menos vagas primeiro, depois o mais próximo. */
export function listedGroups(groups: Group[], tier: Tier): Group[] {
  return groups
    .filter((g) => g.tier === tier && g.listed && vacancies(g) > 0 && !g.memberIds.includes('me'))
    .sort((a, b) => vacancies(a) - vacancies(b) || Math.abs(a.zone - MY_ZONE) - Math.abs(b.zone - MY_ZONE) || a.number - b.number);
}

/** Regra de encaixe do "Me coloque" (GR05): 1 vaga no mesmo setor e mais perto; depois 2 vagas */
export function pickAutoGroup(groups: Group[], tier: Tier): Group | undefined {
  const list = listedGroups(groups, tier);
  return list.find((g) => vacancies(g) === 1) ?? list[0];
}

/** Encaixe do time depois que a formação fecha: 1 vaga, 2 vagas e, na falta, um grupo de 4 (proposta) */
export function pickTeamGroup(groups: Group[], tier: Tier): Group | undefined {
  const open = groups.filter((g) => g.tier === tier && vacancies(g) > 0 && !g.memberIds.includes('me'));
  const by = (n: number) => open.filter((g) => vacancies(g) === n).sort((a, b) => Math.abs(a.zone - MY_ZONE) - Math.abs(b.zone - MY_ZONE))[0];
  return by(1) ?? by(2) ?? groups.filter((g) => g.tier === tier && vacancies(g) === 0 && !g.memberIds.includes('me') && g.targetSize === TEAM_SIZE)[0];
}

export function matchesCode(g: Group, tier: Tier, raw: string): boolean {
  return g.tier === tier && g.code === raw.toUpperCase();
}

export function makeCode(used: Set<string>, pool: string[]): string {
  const free = pool.find((c) => !used.has(c));
  if (free) return free;
  for (let i = 0; i < 200; i++) {
    let c = '';
    for (let k = 0; k < 4; k++) c += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
    if (!used.has(c)) return c;
  }
  return 'ZZZZ';
}

/* ---------- Janela de formação ---------- */

export type Formation = 'before' | 'open' | 'closed';

const OPENS = toMinutes(FORMATION.opensAt);
const CLOSES = toMinutes(FORMATION.closesAt);

/** Abre às 8h do Dia 1 e fecha às 10h45 (DEC-004). O painel pode encerrar antes. */
export function formationState(clock: EventClock, forcedClosed: boolean): Formation {
  if (clock.dayIndex === 0) return 'before';
  if (forcedClosed) return 'closed';
  if (clock.dayIndex === 4 || clock.dayIndex > 1) return 'closed';
  if (clock.minutes < OPENS) return 'before';
  return clock.minutes < CLOSES ? 'open' : 'closed';
}

export function minutesToClose(clock: EventClock): number {
  return CLOSES - clock.minutes;
}
