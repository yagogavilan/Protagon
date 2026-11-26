import type { Offer, OfferId } from './offerTypes';

// Ofertas do palco (DEC-003). Valores, bônus e prazos FICTÍCIOS. Este módulo só é carregado na liberação
// (import() dinâmico em state/features.ts): nunca importe-o de forma estática.
//
// Matriz por ingresso (DEC-005): Olimpo só VIP e Diamond; Imersão Liderança 360 para os três. A matriz real depende
// da diretoria (a confirmar). Para mudar, basta incluir ou tirar a categoria em `prices`.
export const offers: Record<OfferId, Offer> = {
  'of-1': {
    id: 'of-1',
    name: 'Olimpo',
    about: 'o Olimpo',
    tagline: 'Programa de mentoria em grupo para donos que querem crescer com método.',
    forWhom: 'Donos e sócios de empresa com 2 anos ou mais de operação e equipe própria.',
    includes: [
      '12 encontros mensais ao vivo',
      'Plano de ação por trimestre',
      'Comunidade fechada de alunos',
      'Acompanhamento individual do seu plano',
      'Biblioteca de modelos e planilhas',
    ],
    bonus: ['Diagnóstico individual de 60 minutos', 'Kit de materiais do Protagon'],
    ctaLabel: 'Assinar o Olimpo',
    prices: {
      vip: { installments: 12, installment: 149000, total: 1788000, cash: 1599000 },
      diamond: { installments: 12, installment: 129000, total: 1548000, cash: 1379000 },
    },
    audience: 'Para VIP e Diamond',
    deadline: { date: '2027-03-14', time: '19:10' },
  },
  'of-2': {
    id: 'of-2',
    name: 'Imersão Liderança 360',
    about: 'a Imersão Liderança 360',
    tagline: 'Imersão presencial de 2 dias para desenvolver o time de liderança da empresa.',
    forWhom: 'Donos e gestores que lideram equipes de 5 pessoas ou mais.',
    includes: [
      '2 dias de imersão presencial',
      'Avaliação 360 do seu time de liderança',
      'Plano de desenvolvimento por líder',
      'Material de apoio e gravação das sessões',
    ],
    bonus: ['Devolutiva com a equipe de facilitação'],
    ctaLabel: 'Reservar minha vaga',
    prices: {
      executivo: { installments: 6, installment: 99000, total: 594000, cash: 534000 },
      vip: { installments: 6, installment: 89000, total: 534000, cash: 479000 },
      diamond: { installments: 6, installment: 69000, total: 414000, cash: 369000 },
    },
    audience: 'Para Executivo, VIP e Diamond',
    deadline: { date: '2027-03-21', time: '19:10' },
  },
};
