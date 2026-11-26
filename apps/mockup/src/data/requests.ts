// Pedidos de conexão recebidos pelo usuário da demo (C05). Pessoas fictícias de participants.ts.
export interface ReceivedRequest {
  id: string;
  participantId: string;
  message: string;
  /** HH:MM */
  time: string;
}

export const receivedRequests: ReceivedRequest[] = [
  {
    id: 'r1',
    participantId: 'p01',
    message: 'Oi, Rafael. Vi que você busca parcerias no varejo. Tenho uma marca de moda e penso em ações com academias. Vamos conversar no intervalo?',
    time: '09:12',
  },
  {
    id: 'r2',
    participantId: 'p02',
    message: 'Oi, Rafael. Temos 5 interesses em comum, entre eles franquias e expansão. Que tal o Ponto C no almoço?',
    time: '09:40',
  },
  {
    id: 'r3',
    participantId: 'p25',
    message: 'Oi, Rafael. Produzo eventos corporativos e queria entender como vocês fazem ações nas unidades.',
    time: '10:01',
  },
  {
    id: 'r4',
    participantId: 'p16',
    message: 'Oi, Rafael. Mentoro redes que estão abrindo franquias. Se fizer sentido, podemos nos ver no intervalo das 15h40.',
    time: '10:03',
  },
];
