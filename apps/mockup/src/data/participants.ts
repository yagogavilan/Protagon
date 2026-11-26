import type { DemoUser, Objective, Participant, Tier, TopicId } from './types';

// Pessoas, empresas e contatos fictícios. Qualquer semelhança é coincidência.

export const objectivesList: Objective[] = [
  'Busco sócio',
  'Busco clientes',
  'Contrato serviços',
  'Ofereço serviços',
  'Quero mentorar',
  'Quero ser mentorado',
  'Parcerias',
  'Investimento',
];

export const interestTags = [
  'Liderança',
  'Gestão de equipes',
  'Vendas',
  'Marketing digital',
  'Franquias',
  'Varejo',
  'Finanças',
  'Tecnologia',
  'Inovação',
  'Saúde e bem-estar',
  'Educação',
  'Imóveis',
  'Agronegócio',
  'Indústria',
  'Expansão',
  'Cultura organizacional',
  'E-commerce',
  'Atendimento',
  'Investimentos',
  'Sucessão familiar',
  'Mentalidade',
  'Alimentação',
] as const;

/**
 * Temas de "maior desafio" e "onde tenho bastante conhecimento" (DEC-002). Mesmo vocabulário nos dois lados:
 * `know` é o nome do tema como conhecimento; `challenge` é como ele aparece como maior desafio.
 */
export const topics: Record<TopicId, { know: string; challenge: string }> = {
  trafego: { know: 'Tráfego pago', challenge: 'Fazer o tráfego pago dar retorno' },
  financas: { know: 'Gestão financeira de PME', challenge: 'Organizar o caixa e o financeiro' },
  comercial: { know: 'Processo comercial B2B', challenge: 'Estruturar o processo comercial B2B' },
  retencao: { know: 'Retenção de clientes', challenge: 'Reter clientes depois do 3º mês' },
  vendedores: { know: 'Contratação de vendedores', challenge: 'Contratar e manter vendedores' },
  lideranca: { know: 'Liderança de equipes', challenge: 'Fazer o time assumir mais responsabilidade' },
  franquia: { know: 'Expansão por franquia', challenge: 'Formatar a operação para franquear' },
  precificacao: { know: 'Precificação', challenge: 'Cobrar o preço certo sem perder cliente' },
  conteudo: { know: 'Marketing de conteúdo', challenge: 'Gerar demanda com conteúdo' },
  crm: { know: 'Automação e CRM', challenge: 'Organizar o funil de vendas e o CRM' },
  sucessao: { know: 'Sucessão familiar', challenge: 'Preparar a sucessão na empresa' },
  investimento: { know: 'Captação de investimento', challenge: 'Captar investimento para crescer' },
  operacao: { know: 'Processos e operação', challenge: 'Tirar a operação das minhas costas' },
  atendimento: { know: 'Atendimento ao cliente', challenge: 'Padronizar o atendimento' },
};

export const topicIds = Object.keys(topics) as TopicId[];

/** Objetivo no Protagon (escolha única no C01) */
export const goalsList = [
  'Destravar a liderança do meu time',
  'Estruturar a expansão por franquia',
  'Organizar o comercial e vender mais',
  'Aprender a escalar sem perder qualidade',
  'Preparar a empresa para sócio ou investidor',
  'Profissionalizar a gestão financeira',
  'Resolver a sucessão na empresa',
  'Conhecer empresários de outros segmentos',
] as const;

export const demoUser: DemoUser = {
  id: 'me',
  name: 'Rafael Moraes',
  email: 'rafael.moraes@exemplo.com.br',
  // Máscara da recomendação de stack: só os 2 últimos dígitos (o resto nunca chega ao app)
  cpfMasked: '***.***.***-35',
  whatsapp: '(51) 90000-0000',
  linkedin: 'linkedin.com/in/rafaelmoraes-exemplo',
  company: 'Rede Movimento Academias',
  role: 'Sócio-fundador',
  city: 'Porto Alegre, RS',
  segment: 'Fitness e bem-estar',
  objectives: ['Parcerias', 'Investimento', 'Quero ser mentorado'],
  interests: ['Liderança', 'Gestão de equipes', 'Franquias', 'Expansão', 'Saúde e bem-estar', 'Marketing digital', 'Varejo', 'Vendas'],
  niche: 'Academias de rede',
  goal: 'Estruturar a expansão por franquia',
  challenge: 'retencao',
  expertise: ['franquia', 'lideranca'],
  instagram: '@rafaelmoraes.exemplo',
  credentialCode: 'PTG-POA27-04829',
};

type Row = [name: string, company: string, role: string, city: string, segment: string, tier: Tier, objectives: Objective[], interests: string[], visible?: boolean];

const rows: Row[] = [
  ['Juliana Prates', 'Prates Moda', 'Diretora comercial', 'Porto Alegre, RS', 'Varejo', 'vip', ['Parcerias', 'Busco clientes'], ['Varejo', 'Marketing digital', 'E-commerce', 'Vendas']],
  ['Bruno Lacerda', 'Lacerda Suplementos', 'CEO', 'Canoas, RS', 'Saúde e bem-estar', 'diamond', ['Parcerias', 'Busco clientes'], ['Saúde e bem-estar', 'Varejo', 'Franquias', 'Vendas', 'Expansão']],
  ['Carolina Mendes', 'Mendes & Rocha Advocacia', 'Sócia', 'Porto Alegre, RS', 'Serviços jurídicos', 'vip', ['Ofereço serviços', 'Busco clientes'], ['Sucessão familiar', 'Liderança', 'Gestão de equipes']],
  ['Diego Fontana', 'Fontana Construtora', 'Diretor', 'Caxias do Sul, RS', 'Construção civil', 'diamond', ['Investimento', 'Busco sócio'], ['Imóveis', 'Investimentos', 'Expansão', 'Liderança']],
  ['Patrícia Kuhn', 'Kuhn Contabilidade', 'Fundadora', 'Novo Hamburgo, RS', 'Contabilidade', 'vip', ['Ofereço serviços', 'Quero mentorar'], ['Finanças', 'Gestão de equipes', 'Sucessão familiar']],
  ['Leonardo Bastos', 'Bastos Tech', 'CTO', 'Porto Alegre, RS', 'Tecnologia', 'vip', ['Ofereço serviços', 'Parcerias'], ['Tecnologia', 'Inovação', 'E-commerce', 'Marketing digital']],
  ['Fernanda Lopes', 'Clínica Viva Bem', 'Diretora clínica', 'Pelotas, RS', 'Saúde', 'diamond', ['Parcerias', 'Investimento'], ['Saúde e bem-estar', 'Expansão', 'Liderança', 'Atendimento']],
  ['Gustavo Rech', 'Rech Alimentos', 'Gerente geral', 'Bento Gonçalves, RS', 'Indústria', 'executivo', ['Busco clientes'], ['Indústria', 'Alimentação', 'Vendas']],
  ['Aline Schmitt', 'Schmitt Educação', 'Mantenedora', 'Santa Cruz do Sul, RS', 'Educação', 'vip', ['Quero ser mentorado', 'Parcerias'], ['Educação', 'Liderança', 'Cultura organizacional', 'Gestão de equipes']],
  ['Marcos Vieira', 'Vieira Imóveis', 'Corretor e sócio', 'Porto Alegre, RS', 'Imóveis', 'vip', ['Busco clientes', 'Parcerias'], ['Imóveis', 'Vendas', 'Investimentos', 'Marketing digital']],
  ['Renata Coelho', 'Coelho Marketing', 'Sócia-diretora', 'Florianópolis, SC', 'Marketing e comunicação', 'diamond', ['Ofereço serviços', 'Busco clientes'], ['Marketing digital', 'Varejo', 'Franquias', 'Inovação']],
  ['Thiago Brandão', 'Brandão Logística', 'CEO', 'Gravataí, RS', 'Logística', 'vip', ['Parcerias', 'Investimento'], ['Expansão', 'Gestão de equipes', 'Tecnologia', 'Indústria']],
  ['Vanessa Dias', 'Doce Dias Confeitaria', 'Proprietária', 'Porto Alegre, RS', 'Alimentação', 'executivo', ['Quero ser mentorado'], ['Alimentação', 'Varejo', 'Mentalidade']],
  ['Eduardo Mello', 'Mello Agro', 'Diretor', 'Passo Fundo, RS', 'Agronegócio', 'diamond', ['Investimento', 'Quero mentorar'], ['Agronegócio', 'Investimentos', 'Sucessão familiar', 'Liderança']],
  ['Camila Torres', 'Torres RH', 'Consultora', 'Porto Alegre, RS', 'Consultoria', 'vip', ['Ofereço serviços', 'Busco clientes'], ['Gestão de equipes', 'Cultura organizacional', 'Liderança']],
  ['Ricardo Pacheco', 'Pacheco Franquias', 'Fundador', 'Curitiba, PR', 'Franquias', 'diamond', ['Quero mentorar', 'Parcerias'], ['Franquias', 'Expansão', 'Varejo', 'Vendas', 'Liderança']],
  ['Larissa Antunes', 'Studio Antunes Pilates', 'Proprietária', 'Porto Alegre, RS', 'Fitness e bem-estar', 'vip', ['Parcerias', 'Quero ser mentorado'], ['Saúde e bem-estar', 'Marketing digital', 'Atendimento']],
  ['Henrique Paz', 'Paz Seguros', 'Corretor', 'Canoas, RS', 'Serviços financeiros', 'executivo', ['Busco clientes'], ['Finanças', 'Vendas']],
  ['Isabela Ramos', 'Ramos Ótica', 'Sócia', 'São Leopoldo, RS', 'Varejo', 'vip', ['Parcerias', 'Busco clientes'], ['Varejo', 'Atendimento', 'Expansão', 'Franquias']],
  ['Felipe Correa', 'Correa Investimentos', 'Assessor', 'Porto Alegre, RS', 'Serviços financeiros', 'diamond', ['Investimento', 'Ofereço serviços'], ['Investimentos', 'Finanças', 'Expansão']],
  ['Mariana Goulart', 'Goulart Arquitetura', 'Arquiteta e sócia', 'Porto Alegre, RS', 'Arquitetura', 'vip', ['Busco clientes', 'Parcerias'], ['Imóveis', 'Inovação', 'Marketing digital']],
  ['André Zanella', 'Zanella Móveis', 'Diretor industrial', 'Bento Gonçalves, RS', 'Indústria', 'vip', ['Busco clientes', 'Contrato serviços'], ['Indústria', 'Varejo', 'E-commerce', 'Vendas']],
  ['Beatriz Nunes', 'Nunes Nutrição', 'Nutricionista e fundadora', 'Porto Alegre, RS', 'Saúde', 'vip', ['Parcerias', 'Busco clientes'], ['Saúde e bem-estar', 'Alimentação', 'Marketing digital']],
  ['Rodrigo Kessler', 'Kessler Energia Solar', 'CEO', 'Lajeado, RS', 'Energia', 'executivo', ['Busco clientes', 'Investimento'], ['Inovação', 'Vendas', 'Expansão']],
  ['Tatiane Moura', 'Moura Eventos', 'Produtora', 'Porto Alegre, RS', 'Eventos', 'vip', ['Ofereço serviços', 'Parcerias'], ['Marketing digital', 'Atendimento', 'Vendas']],
  ['Lucas Werner', 'Werner Sistemas', 'Fundador', 'Joinville, SC', 'Tecnologia', 'diamond', ['Busco sócio', 'Investimento'], ['Tecnologia', 'Inovação', 'Expansão', 'Finanças']],
  ['Simone Battisti', 'Battisti Vinhos', 'Diretora comercial', 'Garibaldi, RS', 'Alimentação', 'vip', ['Busco clientes', 'Parcerias'], ['Alimentação', 'Varejo', 'Vendas', 'E-commerce']],
  ['Gabriel Duarte', 'Academia Força Total', 'Proprietário', 'Viamão, RS', 'Fitness e bem-estar', 'executivo', ['Quero ser mentorado'], ['Saúde e bem-estar', 'Gestão de equipes']],
  ['Natália Fraga', 'Fraga Odontologia', 'Sócia', 'Porto Alegre, RS', 'Saúde', 'vip', ['Quero ser mentorado', 'Contrato serviços'], ['Saúde e bem-estar', 'Gestão de equipes', 'Marketing digital']],
  ['Otávio Lemos', 'Lemos Distribuidora', 'CEO', 'Esteio, RS', 'Distribuição', 'diamond', ['Parcerias', 'Busco clientes'], ['Varejo', 'Expansão', 'Gestão de equipes', 'Vendas']],
  ['Priscila Amaral', 'Amaral Cosméticos', 'Fundadora', 'Porto Alegre, RS', 'Beleza', 'vip', ['Parcerias', 'Investimento'], ['E-commerce', 'Varejo', 'Franquias', 'Marketing digital']],
  ['Sérgio Pinheiro', 'Pinheiro Transportes', 'Diretor', 'Santa Maria, RS', 'Logística', 'executivo', ['Contrato serviços'], ['Gestão de equipes', 'Finanças']],
  ['Daniela Weber', 'Weber Consultoria Financeira', 'Consultora', 'Porto Alegre, RS', 'Consultoria', 'vip', ['Ofereço serviços', 'Quero mentorar'], ['Finanças', 'Investimentos', 'Sucessão familiar']],
  ['Vinícius Hoffmann', 'Hoffmann Café', 'Sócio', 'Porto Alegre, RS', 'Alimentação', 'vip', ['Busco sócio', 'Parcerias'], ['Alimentação', 'Franquias', 'Expansão', 'Varejo']],
  ['Luana Castro', 'Castro Moda Fitness', 'CEO', 'Novo Hamburgo, RS', 'Moda', 'diamond', ['Parcerias', 'Busco clientes'], ['Saúde e bem-estar', 'E-commerce', 'Varejo', 'Marketing digital']],
  ['Fábio Monteiro', 'Monteiro Engenharia', 'Diretor técnico', 'Porto Alegre, RS', 'Construção civil', 'vip', ['Contrato serviços', 'Busco clientes'], ['Imóveis', 'Gestão de equipes', 'Liderança'], false],
  ['Cristiane Silveira', 'Silveira Educação Corporativa', 'Fundadora', 'Porto Alegre, RS', 'Educação', 'diamond', ['Quero mentorar', 'Ofereço serviços'], ['Liderança', 'Cultura organizacional', 'Educação', 'Mentalidade']],
  ['Jonas Becker', 'Becker Agropecuária', 'Sócio', 'Cruz Alta, RS', 'Agronegócio', 'executivo', ['Investimento'], ['Agronegócio', 'Sucessão familiar']],
  ['Elisa Marques', 'Marques Farma', 'Diretora', 'Porto Alegre, RS', 'Saúde', 'vip', ['Parcerias', 'Contrato serviços'], ['Saúde e bem-estar', 'Varejo', 'Expansão'], false],
  ['Paulo Rocha', 'Rocha Tecnologia Fitness', 'Fundador', 'Porto Alegre, RS', 'Tecnologia', 'vip', ['Busco clientes', 'Busco sócio'], ['Tecnologia', 'Saúde e bem-estar', 'Inovação', 'Franquias'], false],
];

type Extra = [niche: string, goal: (typeof goalsList)[number], challenge: TopicId, expertise: TopicId[], instagram: string];

/** Perfil estendido (DEC-002), por nome. Desafios e conhecimentos cruzam entre as pessoas de propósito, para gerar sugestões fortes. */
const extras: Record<string, Extra> = {
  'Juliana Prates': ['E-commerce de moda', 'Organizar o comercial e vender mais', 'retencao', ['trafego', 'conteudo'], '@julianaprates.exemplo'],
  'Bruno Lacerda': ['Suplementos esportivos', 'Estruturar a expansão por franquia', 'vendedores', ['franquia', 'precificacao'], '@brunolacerda.exemplo'],
  'Carolina Mendes': ['Advocacia para empresas familiares', 'Resolver a sucessão na empresa', 'comercial', ['sucessao'], '@carolmendes.adv.exemplo'],
  'Diego Fontana': ['Incorporação residencial', 'Preparar a empresa para sócio ou investidor', 'financas', ['investimento', 'operacao'], '@diegofontana.exemplo'],
  'Patrícia Kuhn': ['Contabilidade para PME', 'Conhecer empresários de outros segmentos', 'trafego', ['financas', 'sucessao'], '@patriciakuhn.exemplo'],
  'Leonardo Bastos': ['Software para varejo', 'Aprender a escalar sem perder qualidade', 'vendedores', ['crm', 'operacao'], '@leobastos.tech.exemplo'],
  'Fernanda Lopes': ['Clínicas de estética', 'Estruturar a expansão por franquia', 'retencao', ['atendimento', 'lideranca'], '@fernandalopes.exemplo'],
  'Gustavo Rech': ['Indústria de alimentos', 'Organizar o comercial e vender mais', 'comercial', ['operacao'], '@gustavorech.exemplo'],
  'Aline Schmitt': ['Escolas de educação básica', 'Destravar a liderança do meu time', 'lideranca', ['retencao', 'atendimento'], '@alineschmitt.exemplo'],
  'Marcos Vieira': ['Imobiliária de bairro', 'Organizar o comercial e vender mais', 'trafego', ['comercial', 'vendedores'], '@marcosvieira.imoveis.exemplo'],
  'Renata Coelho': ['Agência de marketing para varejo', 'Conhecer empresários de outros segmentos', 'financas', ['trafego', 'conteudo', 'crm'], '@renatacoelho.exemplo'],
  'Thiago Brandão': ['Logística de última milha', 'Preparar a empresa para sócio ou investidor', 'comercial', ['operacao', 'lideranca'], '@thiagobrandao.exemplo'],
  'Vanessa Dias': ['Confeitaria artesanal', 'Profissionalizar a gestão financeira', 'precificacao', ['conteudo'], '@vanessadias.doce.exemplo'],
  'Eduardo Mello': ['Grãos e pecuária', 'Resolver a sucessão na empresa', 'sucessao', ['investimento', 'financas'], '@eduardomello.exemplo'],
  'Camila Torres': ['Consultoria de RH para PME', 'Conhecer empresários de outros segmentos', 'comercial', ['lideranca', 'vendedores'], '@camilatorres.rh.exemplo'],
  'Ricardo Pacheco': ['Franquias de alimentação', 'Destravar a liderança do meu time', 'lideranca', ['franquia', 'precificacao'], '@ricardopacheco.exemplo'],
  'Larissa Antunes': ['Estúdios de pilates', 'Aprender a escalar sem perder qualidade', 'trafego', ['retencao', 'atendimento'], '@larissa.pilates.exemplo'],
  'Henrique Paz': ['Corretagem de seguros', 'Organizar o comercial e vender mais', 'crm', ['comercial'], '@henriquepaz.exemplo'],
  'Isabela Ramos': ['Óticas de bairro', 'Estruturar a expansão por franquia', 'franquia', ['atendimento', 'vendedores'], '@isabelaramos.otica.exemplo'],
  'Felipe Correa': ['Assessoria de investimentos', 'Conhecer empresários de outros segmentos', 'conteudo', ['investimento', 'financas'], '@felipecorrea.exemplo'],
  'Mariana Goulart': ['Arquitetura residencial', 'Profissionalizar a gestão financeira', 'precificacao', ['conteudo', 'atendimento'], '@marianagoulart.arq.exemplo'],
  'André Zanella': ['Móveis planejados', 'Organizar o comercial e vender mais', 'trafego', ['operacao', 'precificacao'], '@andrezanella.exemplo'],
  'Beatriz Nunes': ['Nutrição esportiva', 'Aprender a escalar sem perder qualidade', 'retencao', ['conteudo', 'atendimento'], '@beatriznunes.nutri.exemplo'],
  'Rodrigo Kessler': ['Energia solar residencial', 'Organizar o comercial e vender mais', 'vendedores', ['comercial'], '@rodrigokessler.exemplo'],
  'Tatiane Moura': ['Eventos corporativos', 'Profissionalizar a gestão financeira', 'financas', ['operacao', 'atendimento'], '@tatianemoura.eventos.exemplo'],
  'Lucas Werner': ['Software de gestão para PME', 'Preparar a empresa para sócio ou investidor', 'comercial', ['crm', 'investimento'], '@lucaswerner.exemplo'],
  'Simone Battisti': ['Vinícolas e enoturismo', 'Organizar o comercial e vender mais', 'trafego', ['comercial', 'precificacao'], '@simonebattisti.vinhos.exemplo'],
  'Gabriel Duarte': ['Academias de bairro', 'Destravar a liderança do meu time', 'retencao', ['operacao'], '@gabrielduarte.exemplo'],
  'Natália Fraga': ['Clínicas odontológicas', 'Destravar a liderança do meu time', 'trafego', ['atendimento', 'retencao'], '@nataliafraga.odonto.exemplo'],
  'Otávio Lemos': ['Distribuição de bebidas', 'Destravar a liderança do meu time', 'lideranca', ['operacao', 'vendedores'], '@otaviolemos.exemplo'],
  'Priscila Amaral': ['Cosméticos naturais', 'Estruturar a expansão por franquia', 'financas', ['conteudo', 'trafego'], '@priscilaamaral.exemplo'],
  'Sérgio Pinheiro': ['Transporte rodoviário de carga', 'Profissionalizar a gestão financeira', 'financas', ['operacao'], '@sergiopinheiro.exemplo'],
  'Daniela Weber': ['Consultoria financeira para PME', 'Conhecer empresários de outros segmentos', 'conteudo', ['financas', 'precificacao', 'investimento'], '@danielaweber.exemplo'],
  'Vinícius Hoffmann': ['Cafeterias', 'Estruturar a expansão por franquia', 'franquia', ['retencao', 'conteudo'], '@viniciushoffmann.cafe.exemplo'],
  'Luana Castro': ['Moda fitness', 'Aprender a escalar sem perder qualidade', 'crm', ['trafego', 'conteudo'], '@luanacastro.exemplo'],
  'Fábio Monteiro': ['Engenharia de obras comerciais', 'Profissionalizar a gestão financeira', 'financas', ['operacao'], '@fabiomonteiro.exemplo'],
  'Cristiane Silveira': ['Treinamento corporativo', 'Organizar o comercial e vender mais', 'trafego', ['lideranca'], '@cristianesilveira.exemplo'],
  'Jonas Becker': ['Agropecuária familiar', 'Resolver a sucessão na empresa', 'sucessao', ['operacao'], '@jonasbecker.exemplo'],
  'Elisa Marques': ['Farmácias de manipulação', 'Estruturar a expansão por franquia', 'vendedores', ['atendimento'], '@elisamarques.exemplo'],
  'Paulo Rocha': ['Software para academias', 'Organizar o comercial e vender mais', 'comercial', ['retencao', 'crm'], '@paulorocha.exemplo'],
};

const ALL_CHANNELS = { whatsapp: true, linkedin: true, instagram: true };

/** Quem libera só alguns canais (SEC-002): o C03 e a exportação mostram só o que cada pessoa liberou */
const CHANNELS_BY_NAME: Record<string, Participant['shares']> = {
  'Larissa Antunes': { whatsapp: true, linkedin: false, instagram: true },
  'Felipe Correa': { whatsapp: true, linkedin: true, instagram: false },
  'Marcos Vieira': { whatsapp: true, linkedin: false, instagram: true },
  'Fernanda Lopes': { whatsapp: true, linkedin: false, instagram: false },
  'Bruno Lacerda': { whatsapp: true, linkedin: true, instagram: false },
};

/** Quem mantém o maior desafio oculto (SEC-003) */
const CHALLENGE_HIDDEN = new Set(['Fernanda Lopes', 'Thiago Brandão', 'Patrícia Kuhn']);

export const participants: Participant[] = rows.map(
  ([name, company, role, city, segment, tier, objectives, interests, visible], i) => {
    const extra = extras[name];
    if (!extra) throw new Error(`Perfil estendido ausente para ${name}`);
    const [niche, goal, challenge, expertise, instagram] = extra;
    return {
      id: `p${String(i + 1).padStart(2, '0')}`,
      name,
      company,
      role,
      city,
      segment,
      tier,
      objectives,
      interests,
      niche,
      goal,
      challenge,
      expertise,
      instagram,
      // Proposta: 2 em cada 3 liberam o @ antes da conexão (só vale se o aluno também liberar o dele)
      instagramEarly: i % 3 !== 2,
      shares: CHANNELS_BY_NAME[name] ?? ALL_CHANNELS,
      challengeVisible: !CHALLENGE_HIDDEN.has(name),
      visible: visible ?? true,
    };
  },
);
