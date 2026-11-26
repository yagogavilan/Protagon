// Atividade Gaia One (Dia 2). O fundador ainda não passou o texto do produto, os links das lojas, se o teste pede
// cartão nem a duração: tudo o que depende disso vai marcado "[a confirmar]" e os links das lojas são simulados.

export const PENDING = '[a confirmar]';

export const gaia = {
  name: 'Gaia One',
  /** O que é o produto, em uma frase: pendente do fundador (pergunta 8) */
  oneLiner: `Descrição do produto em uma frase ${PENDING}`,
  trialLength: `Duração do teste ${PENDING}`,
  /** Código promocional fictício */
  promoCode: 'PROTAGON27',
  promoPending: `Código promocional de exemplo ${PENDING}`,
  /** O teste pede cartão? Resposta de exemplo, a confirmar */
  card: `O teste não pede cartão. ${PENDING}`,
  storeLinkNote: `Link da loja simulado ${PENDING}`,
  /** Onde fica a equipe de apoio no salão (a confirmar com a operação) */
  teamPlace: `Equipe do Gaia One nas laterais do salão e no estande. Mais perto de você: lateral direita, perto do seu setor. ${PENDING}`,
  /** Linha de loja por aparelho (a demonstração escolhe o aparelho no painel) */
  store: {
    ios: { name: 'App Store', open: 'Abrir na App Store', hint: 'Baixe o Gaia One na App Store.' },
    android: { name: 'Google Play', open: 'Abrir no Google Play', hint: 'Baixe o Gaia One no Google Play.' },
  },
} as const;

export interface GaiaFaq {
  id: string;
  q: string;
  a: string;
}

export const gaiaFaq: GaiaFaq[] = [
  { id: 'card', q: 'O teste pede cartão?', a: `Não. O teste não pede cartão. ${PENDING}` },
  {
    id: 'email',
    q: 'Não recebi o e-mail',
    a: 'Confira a caixa de spam e a pasta Promoções. Com muita gente conectada, pode levar alguns minutos. Use o mesmo e-mail da sua compra.',
  },
  { id: 'account', q: 'Já tenho conta no Gaia One', a: 'Entre com ela no Gaia One e use o código no passo 3. Não precisa criar outra.' },
  { id: 'slow', q: 'O download está lento', a: 'O Wi-Fi do salão enche com muita gente. Use os dados do celular se puder, ou peça ajuda à equipe.' },
];
