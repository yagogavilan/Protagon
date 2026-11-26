import type { Tier } from './types';

// Grupos de exemplo (DEC-003, DEC-004). Pessoas, empresas e contatos fictícios.
// Os alunos vêm de participants.ts (por id); só entram "extras" onde faltava gente na categoria (o Executivo tem 7).
// Cada grupo é da categoria dos seus membros: o app nunca mistura (R-GR-1).

export interface GroupPerson {
  id: string;
  name: string;
  company: string;
  tier: Tier;
  /** Compartilha o WhatsApp com o grupo (chave desligada por padrão; aqui, quem ligou) */
  sharesWhatsapp: boolean;
  /** true = aluno criado só para os grupos (não existe em Conexões) */
  extra?: boolean;
}

export interface SeedGroup {
  id: string;
  tier: Tier;
  /** Número oficial, sequencial por edição (R-GR-6) */
  number: number;
  /** 4 consoantes sem ambiguidade (sem I, O, L, Q, Y e nenhuma vogal): SEC-021 */
  code: string;
  memberIds: string[];
  /** Posição no setor, de 1 (esquerda) a 5 (direita). Só ordena e encaixa; nunca aparece na tela (SEC-018) */
  zone: number;
  /** Aparece na lista de grupos com vaga. false = "Só por código" */
  listed: boolean;
  nickname?: string;
}

/** Alfabeto dos códigos: consoantes sem L, Q e Y (SEC-021) */
export const CODE_ALPHABET = 'BCDFGHJKMNPRSTVWXZ';

/** Alunos de grupo que não estão em Conexões */
const extras: GroupPerson[] = [
  { id: 'x-e1', name: 'Mônica Telles', company: 'Telles Papelaria', tier: 'executivo', sharesWhatsapp: true, extra: true },
  { id: 'x-e2', name: 'Cláudio Brum', company: 'Brum Autopeças', tier: 'executivo', sharesWhatsapp: false, extra: true },
  { id: 'x-e3', name: 'Eliane Prado', company: 'Prado Calçados', tier: 'executivo', sharesWhatsapp: true, extra: true },
  { id: 'x-e4', name: 'Nelson Aguiar', company: 'Aguiar Hortifruti', tier: 'executivo', sharesWhatsapp: false, extra: true },
];

/** [id do participante em participants.ts, empresa, compartilha WhatsApp]. Nome e empresa vêm de lá. */
export const groupPersonRefs: Record<string, boolean> = {
  // Executivo
  p08: true, p13: false, p18: true, p24: false, p28: true, p32: false, p38: true,
  // VIP
  p01: true, p03: false, p05: true, p06: false, p09: true, p10: false, p12: true, p15: false, p17: true, p19: false,
  p21: true, p22: false, p23: true, p25: false, p27: true, p29: false, p31: true, p33: true, p34: false, p36: false, p39: true, p40: true,
  // Diamond
  p02: true, p04: false, p07: true, p11: false, p14: true, p16: false, p20: true, p26: false, p30: false,
};

export const extraPeople = extras;

export const seedGroups: SeedGroup[] = [
  // Executivo: 1 completo, 3 com vaga (dois com 1 vaga, um com 2) e 1 só por código
  { id: 'g-e1', tier: 'executivo', number: 2, code: 'BDFN', memberIds: ['p08', 'p13', 'p18'], zone: 2, listed: true },
  { id: 'g-e2', tier: 'executivo', number: 5, code: 'MKRB', memberIds: ['p24', 'p28'], zone: 3, listed: true },
  { id: 'g-e3', tier: 'executivo', number: 9, code: 'PTNS', memberIds: ['p32'], zone: 5, listed: true },
  { id: 'g-e4', tier: 'executivo', number: 14, code: 'GJWH', memberIds: ['x-e1', 'x-e2'], zone: 1, listed: true },

  // VIP: 3 completos, 5 com vaga e 1 só por código
  { id: 'g-v1', tier: 'vip', number: 1, code: 'CRBT', memberIds: ['p01', 'p03', 'p05'], zone: 2, listed: true },
  { id: 'g-v2', tier: 'vip', number: 3, code: 'DKSN', memberIds: ['p06', 'p09', 'p10'], zone: 4, listed: true },
  { id: 'g-v3', tier: 'vip', number: 4, code: 'KTVR', memberIds: ['p12', 'p15'], zone: 3, listed: true },
  { id: 'g-v4', tier: 'vip', number: 6, code: 'NZPM', memberIds: ['p17', 'p19'], zone: 1, listed: true },
  { id: 'g-v5', tier: 'vip', number: 7, code: 'FHSX', memberIds: ['p21', 'p22'], zone: 5, listed: true },
  { id: 'g-v6', tier: 'vip', number: 8, code: 'WBGC', memberIds: ['p23'], zone: 2, listed: true },
  { id: 'g-v7', tier: 'vip', number: 10, code: 'XDJR', memberIds: ['p25'], zone: 4, listed: true },
  { id: 'g-v8', tier: 'vip', number: 11, code: 'TMKZ', memberIds: ['p27', 'p29', 'p31'], zone: 3, listed: true },
  { id: 'g-v9', tier: 'vip', number: 12, code: 'ZHGV', memberIds: ['p36', 'p39'], zone: 2, listed: false },

  // Diamond: 1 completo e 2 com vaga (poucos alunos, como a spec avisa), sem misturar com VIP
  { id: 'g-d1', tier: 'diamond', number: 13, code: 'BNJS', memberIds: ['p02', 'p04', 'p07'], zone: 3, listed: true },
  { id: 'g-d2', tier: 'diamond', number: 15, code: 'RCWD', memberIds: ['p11', 'p14'], zone: 2, listed: true },
  { id: 'g-d3', tier: 'diamond', number: 16, code: 'GXTF', memberIds: ['p16'], zone: 4, listed: true },
];

/** Quem ainda não tem grupo na categoria: serve de "quem entra" na demonstração (nunca de outra categoria) */
export const fillersByTier: Record<Tier, string[]> = {
  executivo: ['p38', 'x-e3', 'x-e4'],
  vip: ['p33', 'p34', 'p40'],
  diamond: ['p20', 'p26', 'p30'],
};

/** Código de exemplo de um grupo com vaga, por categoria (README e painel) */
export const SAMPLE_CODE: Record<Tier, string> = { executivo: 'MKRB', vip: 'KTVR', diamond: 'RCWD' };

/** Códigos de reserva para grupos criados na demonstração */
export const CODE_POOL = ['HDKC', 'VPNB', 'SJXM', 'ZRTG', 'CFWK', 'MBHD', 'PGZS', 'NTVX'];

export const MY_ZONE = 3;

/** Ponto de encontro do grupo (proposta): não reaproveita os Pontos de Conexão A, B e C, que são só de VIP e Diamond */
export const GROUP_MEETING_POINT = 'Foyer, perto do credenciamento';

/** Ponto de apoio e prazo da formação */
export const FORMATION = { opensAt: '08:00', closesAt: '10:45' } as const;
