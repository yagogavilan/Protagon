import type { Participant } from './types';

// Conteúdo fictício do local (A03, A01 antes do evento, U05). Nomes de lojas e restaurantes são inventados.

export interface FoodPlace {
  id: string;
  name: string;
  kind: string;
  /** "Espera ~10 min" */
  wait: string;
  price: string;
  note?: string;
}

export const foodCourt: FoodPlace[] = [
  { id: 'f1', name: 'Fogão da Praça', kind: 'Prato feito e grelhados', wait: 'Espera ~12 min', price: 'R$ 38 a R$ 52', note: 'Opção vegetariana' },
  { id: 'f2', name: 'Massa Fresca', kind: 'Massas e risotos', wait: 'Espera ~8 min', price: 'R$ 34 a R$ 46' },
  { id: 'f3', name: 'Verde Bowl', kind: 'Saladas, bowls e sucos', wait: 'Espera ~5 min', price: 'R$ 29 a R$ 41', note: 'Sem glúten e vegano' },
  { id: 'f4', name: 'Pastel & Cia', kind: 'Lanche rápido', wait: 'Espera ~3 min', price: 'R$ 12 a R$ 24' },
];

export interface NearbyPlace {
  id: string;
  name: string;
  kind: string;
  walk: string;
  price: string;
  note?: string;
}

export const nearbyRestaurants: NearbyPlace[] = [
  { id: 'n1', name: 'Churrascaria Pampa Sul', kind: 'Rodízio', walk: '6 min a pé', price: 'R$ 89', note: 'Reserve antes das 12h30' },
  { id: 'n2', name: 'Bistrô da Orla', kind: 'Executivo do dia', walk: '4 min a pé', price: 'R$ 54' },
  { id: 'n3', name: 'Casa do Pão e Café', kind: 'Sanduíches e tortas', walk: '3 min a pé', price: 'R$ 26' },
];

export const packingChecklist = [
  { id: 'doc', label: 'Documento com foto' },
  { id: 'cred', label: 'Credencial aberta no app' },
  { id: 'charger', label: 'Carregador portátil' },
  { id: 'clothes', label: 'Roupa confortável e um casaco leve' },
  { id: 'notes', label: 'Caderno ou o app para anotações' },
] as const;

export const faq: { q: string; a: string }[] = [
  { q: 'Perdi o acesso à minha credencial. O que faço?', a: 'A credencial fica salva no app e abre sem internet. Se trocou de celular, entre de novo com o mesmo e-mail ou CPF e peça um novo código.' },
  { q: 'Posso trocar o ingresso por outra pessoa?', a: 'A troca de titularidade é feita pelo suporte até 7 dias antes do evento. Depois disso, no balcão do credenciamento, com documento.' },
  { q: 'Como funcionam as Conexões?', a: 'Você ativa o perfil, recebe sugestões por afinidade e envia pedidos. Telefone e redes só aparecem quando os dois aceitam.' },
  { q: 'O que muda do Executivo para o VIP?', a: 'O VIP libera as Conexões e o setor VIP na plenária. Agenda, materiais, mapa e credencial são iguais para todos.' },
  { q: 'Os materiais ficam disponíveis depois do evento?', a: 'Sim. Todos ficam no app por 90 dias. Baixe antes para ler sem internet.' },
  { q: 'Como excluo meus dados?', a: 'Em Eu, Privacidade, use "Excluir meus dados". A exclusão acontece na hora e não pode ser desfeita.' },
];

/** Contatos só existem depois do aceite mútuo. Todos fictícios. */
export function contactFor(p: Participant): { whatsapp: string; linkedin: string; instagram: string } {
  const n = Number(p.id.slice(1));
  const slug = p.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]+/g, '');
  return {
    whatsapp: `(51) 90000-${String(1000 + n).padStart(4, '0')}`,
    linkedin: `linkedin.com/in/${slug}-exemplo`,
    instagram: p.instagram,
  };
}
