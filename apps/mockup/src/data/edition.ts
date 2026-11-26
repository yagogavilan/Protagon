import type { ConnectionPoint, Edition, Speaker } from './types';

// Local, endereço, telefones e e-mails são fictícios.
export const edition: Edition = {
  id: 'poa-2027',
  city: 'Porto Alegre',
  name: 'Protagon Porto Alegre',
  dates: ['2027-03-12', '2027-03-13', '2027-03-14'],
  venue: {
    name: 'Centro de Eventos Orla Sul',
    address: 'Av. Praia de Belas, 2400 · Praia de Belas · Porto Alegre, RS',
    parking: 'Estacionamento coberto no subsolo, entrada pela Rua Washington Luiz. Diária de R$ 35, pagamento no local.',
    wifi: { network: 'Protagon_POA', password: 'protagonista2027' },
    accessNotes: 'Credenciamento abre às 7h30 no foyer térreo. Leve um documento com foto.',
  },
  support: {
    phone: '(51) 3000-0000',
    email: 'suporte@protagon.exemplo',
    hours: 'Das 7h às 20h nos dias do evento',
  },
  sectorByTier: {
    executivo: 'Plenária · Setor C',
    vip: 'Plenária · Setor B',
    diamond: 'Plenária · Setor A, filas 1 a 5',
  },
};

export const speakers: Speaker[] = [
  { id: 'wendell', name: 'Wendell Carvalho', role: 'Fundador do Grupo Virtus', fictitious: false },
  { id: 'karina', name: 'Karina Peloi Carvalho', role: 'Cofundadora do Grupo Virtus', fictitious: false },
  { id: 'helena', name: 'Helena Duarte', role: 'Especialista em liderança de equipes', fictitious: true },
  { id: 'marcelo', name: 'Marcelo Tavares', role: 'Consultor de vendas e gestão comercial', fictitious: true },
  { id: 'rodrigo', name: 'Rodrigo Albuquerque', role: 'Finanças para empresários', fictitious: true },
  { id: 'camila', name: 'Camila Freitas', role: 'Marketing e posicionamento', fictitious: true },
  { id: 'paulo', name: 'Paulo Siqueira', role: 'Negociação e parcerias', fictitious: true },
  { id: 'equipe', name: 'Time Protagon', role: 'Facilitadores do evento', fictitious: false },
];

/** D6: Pontos de Conexão */
export const connectionPoints: ConnectionPoint[] = [
  { id: 'A', name: 'Ponto A', where: 'Foyer do credenciamento' },
  { id: 'B', name: 'Ponto B', where: 'Ao lado do estande Protagon' },
  { id: 'C', name: 'Ponto C', where: 'Saída da praça de alimentação' },
];
