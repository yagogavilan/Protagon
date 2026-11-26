// Atividade Gaia One (Dia 2). O fundador ainda não passou o texto do produto, os links das lojas, se o teste pede
// cartão nem a duração (pergunta 8). Os textos abaixo são neutros e plausíveis, e a tela mostra o selo "Proposta"
// onde o conteúdo depende dele. A marcação "[a confirmar]" fica SÓ aqui, em comentários e em `gaiaPending`: nunca na interface.

/** O que ainda depende do fundador (pergunta 8): lista de referência para a revisão, não é exibida */
export const gaiaPending = [
  'descrição do produto em uma frase [a confirmar]',
  'duração do teste [a confirmar]',
  'o teste pede cartão [a confirmar]',
  'código promocional real [a confirmar]',
  'links das lojas [a confirmar]',
  'onde fica a equipe de apoio no salão (operação) [a confirmar]',
] as const;

export const gaia = {
  name: 'Gaia One',
  /** O que é o produto, em uma frase (proposta; depende do fundador) */
  oneLiner: 'O aplicativo para você colocar em prática o que aprende no Protagon.',
  trialLength: 'O teste dura 7 dias.',
  /** Código promocional fictício */
  promoCode: 'PROTAGON27',
  promoNote: 'Este código vale só para quem está no Protagon.',
  /** O teste pede cartão? Resposta de exemplo (proposta) */
  card: 'O teste não pede cartão.',
  storeLinkNote: 'O botão abre a loja do seu aparelho.',
  /** Onde fica a equipe de apoio no salão (proposta; operação confirma) */
  teamPlace: 'Equipe do Gaia One nas laterais do salão e no estande. Mais perto de você: lateral direita, perto do seu setor.',
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
  /** Resposta que depende do fundador: a tela mostra o selo "Proposta" */
  proposal?: boolean;
}

export const gaiaFaq: GaiaFaq[] = [
  { id: 'card', q: 'O teste pede cartão?', a: 'Não. O teste não pede cartão.', proposal: true },
  {
    id: 'email',
    q: 'Não recebi o e-mail',
    a: 'Confira a caixa de spam e a pasta Promoções. Com muita gente conectada, pode levar alguns minutos. Use o mesmo e-mail da sua compra.',
  },
  { id: 'account', q: 'Já tenho conta no Gaia One', a: 'Entre com ela no Gaia One e use o código no passo 3. Não precisa criar outra.' },
  { id: 'slow', q: 'O download está lento', a: 'O Wi-Fi do salão enche com muita gente. Use os dados do celular se puder, ou peça ajuda à equipe.' },
];
