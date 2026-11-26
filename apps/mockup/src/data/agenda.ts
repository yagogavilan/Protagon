import type { DayNumber, Session, SessionKind } from './types';

// D2: 9h abertura, 10h30 intervalo de 15 min, 12h30–13h30 almoço,
// 15h40 intervalo, 19h encerramento. Mesma grade nos 3 dias; muda o conteúdo.

type Row = [start: string, end: string, kind: SessionKind, title: string, speakers: string[], objective?: string, materials?: string[]];

const PLENARIA = 'Plenária principal';

const dayThemes: Record<DayNumber, string> = {
  1: 'Mentalidade',
  2: 'Liderança',
  3: 'Negócios',
};

const rows: Record<DayNumber, Row[]> = {
  1: [
    ['09:00', '09:30', 'abertura', 'Abertura: por que você está aqui', ['wendell', 'karina'], 'Alinhar a jornada dos 3 dias e o compromisso de cada um.'],
    ['09:30', '10:30', 'palestra', 'A mentalidade do protagonista', ['wendell'], 'Trocar a postura de vítima pela de responsável pelos próprios resultados.', ['m-d1-1']],
    ['10:30', '10:45', 'intervalo', 'Intervalo', []],
    ['10:45', '11:30', 'dinamica', 'Dinâmica: crenças que travam seu crescimento', ['equipe'], 'Identificar 3 crenças limitantes e o custo de cada uma.'],
    ['11:30', '12:30', 'palestra', 'Autorresponsabilidade nos negócios', ['karina'], 'Aplicar a autorresponsabilidade em decisões de empresa e de família.', ['m-d1-2']],
    ['12:30', '13:30', 'almoco', 'Almoço', []],
    ['13:30', '14:30', 'palestra', 'Hábitos de alta performance', ['helena'], 'Montar uma rotina que sustente energia e foco no longo prazo.'],
    ['14:30', '15:00', 'exercicio', 'Exercício: sua roda da vida', [], 'Avaliar 8 áreas da vida e escolher a prioridade dos próximos 90 dias.', ['m-d1-3']],
    ['15:00', '15:40', 'palestra', 'Disciplina e consistência', ['wendell'], 'Transformar intenção em execução diária.'],
    ['15:40', '15:55', 'intervalo', 'Intervalo', []],
    ['15:55', '17:00', 'palestra', 'Inteligência emocional para empresários', ['karina'], 'Reconhecer gatilhos e responder sob pressão sem perder o controle.', ['m-d1-4']],
    ['17:00', '17:30', 'dinamica', 'Dinâmica em trios: compromissos do dia', ['equipe'], 'Declarar um compromisso e ter duas testemunhas.'],
    ['17:30', '19:00', 'palestra', 'Seu próximo nível', ['wendell'], 'Definir a visão de 12 meses com metas claras.', ['m-d1-5']],
    ['19:00', '19:10', 'encerramento', 'Encerramento do Dia 1', ['wendell', 'karina']],
  ],
  2: [
    ['09:00', '09:30', 'abertura', 'Abertura do Dia 2', ['karina'], 'Revisar os compromissos do Dia 1.'],
    ['09:30', '10:30', 'palestra', 'Liderança que forma líderes', ['wendell'], 'Sair do centro de todas as decisões e desenvolver o time.', ['m-d2-1']],
    ['10:30', '10:45', 'intervalo', 'Intervalo', []],
    ['10:45', '11:30', 'dinamica', 'Dinâmica: o líder que eu sou hoje', ['equipe'], 'Comparar a autopercepção com a percepção do grupo.'],
    ['11:30', '12:30', 'palestra', 'Gestão de equipes na prática', ['helena'], 'Rituais simples de feedback, metas e acompanhamento.', ['m-d2-2']],
    ['12:30', '13:30', 'almoco', 'Almoço', []],
    ['13:30', '14:30', 'palestra', 'Comunicação e influência', ['karina'], 'Conduzir conversas difíceis com clareza e respeito.'],
    ['14:30', '15:00', 'exercicio', 'Exercício: mapa do seu time', [], 'Classificar o time por desempenho e potencial e definir próximos passos.', ['m-d2-3']],
    ['15:00', '15:40', 'palestra', 'Cultura que sustenta o crescimento', ['helena'], 'Traduzir valores em comportamentos observáveis.'],
    ['15:40', '15:55', 'intervalo', 'Intervalo', []],
    ['15:55', '17:00', 'palestra', 'Vendas como responsabilidade do líder', ['marcelo'], 'Estruturar um processo comercial que não dependa do dono.', ['m-d2-4']],
    ['17:00', '17:30', 'dinamica', 'Dinâmica: roleplay de feedback', ['equipe'], 'Praticar um feedback difícil em duplas.'],
    ['17:30', '19:00', 'palestra', 'O legado do líder', ['wendell'], 'Conectar resultado, propósito e família.', ['m-d2-5']],
    ['19:00', '19:10', 'encerramento', 'Encerramento do Dia 2', ['wendell', 'karina']],
  ],
  3: [
    ['09:00', '09:30', 'abertura', 'Abertura do Dia 3', ['wendell'], 'Preparar o plano de ação final.'],
    ['09:30', '10:30', 'palestra', 'Modelos de negócio que escalam', ['wendell'], 'Identificar onde a empresa trava e qual alavanca destrava.', ['m-d3-1']],
    ['10:30', '10:45', 'intervalo', 'Intervalo', []],
    ['10:45', '11:30', 'dinamica', 'Dinâmica: pitch de 60 segundos', ['equipe'], 'Apresentar o negócio com clareza para quem não conhece.'],
    ['11:30', '12:30', 'palestra', 'Finanças para crescer com segurança', ['rodrigo'], 'Ler fluxo de caixa, margem e capital de giro sem planilha complexa.', ['m-d3-2']],
    ['12:30', '13:30', 'almoco', 'Almoço', []],
    ['13:30', '14:30', 'palestra', 'Posicionamento e marca', ['camila'], 'Definir para quem a empresa existe e como ser lembrada.'],
    ['14:30', '15:00', 'exercicio', 'Exercício: plano de ação de 90 dias', [], 'Escolher 3 metas, responsáveis e datas.', ['m-d3-3']],
    ['15:00', '15:40', 'palestra', 'Negociação e parcerias estratégicas', ['paulo'], 'Montar parcerias em que os dois lados ganham.'],
    ['15:40', '15:55', 'intervalo', 'Intervalo', []],
    ['15:55', '17:00', 'palestra', 'Expansão: filiais, franquias e sócios', ['marcelo'], 'Comparar caminhos de expansão e seus riscos.', ['m-d3-4']],
    ['17:00', '17:30', 'dinamica', 'Dinâmica: conexões com propósito', ['equipe'], 'Trocar contatos com quem tem objetivos complementares aos seus.'],
    ['17:30', '19:00', 'palestra', 'Protagonista para sempre', ['wendell', 'karina'], 'Fechar a jornada com o compromisso dos próximos 12 meses.', ['m-d3-5']],
    ['19:00', '19:10', 'encerramento', 'Encerramento do Protagon', ['wendell', 'karina']],
  ],
};

function locationFor(kind: SessionKind): string {
  if (kind === 'intervalo') return 'Foyer e área do café';
  if (kind === 'almoco') return 'Praça de alimentação';
  return PLENARIA;
}

export const agenda: Session[] = ([1, 2, 3] as const).flatMap((day) =>
  rows[day].map(([start, end, kind, title, speakerIds, objective, materialIds], i) => ({
    id: `d${day}-s${String(i + 1).padStart(2, '0')}`,
    day,
    start,
    end,
    kind,
    title,
    theme: dayThemes[day],
    speakerIds,
    objective,
    location: locationFor(kind),
    materialIds: materialIds ?? [],
  })),
);

export { dayThemes };

export function sessionsOfDay(day: DayNumber): Session[] {
  return agenda.filter((s) => s.day === day);
}
