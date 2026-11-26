import type { DayNumber, Material } from './types';

// Estado "liberado" ou "agendado" é derivado do relógio do evento (ver lib/clock.ts).
export const materials: Material[] = [
  { id: 'm-d1-1', day: 1, sessionId: 'd1-s02', title: 'Slides: A mentalidade do protagonista', type: 'pdf', releaseAt: { day: 1, time: '10:30' }, meta: 'PDF · 4,2 MB' },
  { id: 'm-d1-2', day: 1, sessionId: 'd1-s05', title: 'Áudio: Autorresponsabilidade em 10 minutos', type: 'audio', releaseAt: { day: 1, time: '14:00' }, meta: 'Áudio · 10 min' },
  { id: 'm-d1-3', day: 1, sessionId: 'd1-s08', title: 'Workbook: Roda da vida', type: 'workbook', releaseAt: { day: 1, time: '14:30' }, meta: 'Workbook · 8 páginas' },
  { id: 'm-d1-4', day: 1, sessionId: 'd1-s11', title: 'Guia: gatilhos emocionais', type: 'pdf', releaseAt: { day: 1, time: '17:00' }, meta: 'PDF · 2,1 MB' },
  { id: 'm-d1-5', day: 1, sessionId: 'd1-s13', title: 'Vídeo: resumo do Dia 1', type: 'video', releaseAt: { day: 1, time: '19:10' }, meta: 'Vídeo · 12 min' },

  { id: 'm-d2-1', day: 2, sessionId: 'd2-s02', title: 'Slides: Liderança que forma líderes', type: 'pdf', releaseAt: { day: 2, time: '10:30' }, meta: 'PDF · 3,8 MB' },
  { id: 'm-d2-2', day: 2, sessionId: 'd2-s05', title: 'Modelo: ritual de feedback semanal', type: 'workbook', releaseAt: { day: 2, time: '14:00' }, meta: 'Workbook · 6 páginas' },
  { id: 'm-d2-3', day: 2, sessionId: 'd2-s08', title: 'Workbook: mapa do seu time', type: 'workbook', releaseAt: { day: 2, time: '14:30' }, meta: 'Workbook · 5 páginas' },
  { id: 'm-d2-4', day: 2, sessionId: 'd2-s11', title: 'Áudio: o processo comercial do líder', type: 'audio', releaseAt: { day: 2, time: '17:00' }, meta: 'Áudio · 18 min' },
  { id: 'm-d2-5', day: 2, sessionId: 'd2-s13', title: 'Vídeo: resumo do Dia 2', type: 'video', releaseAt: { day: 2, time: '19:10' }, meta: 'Vídeo · 11 min' },

  { id: 'm-d3-1', day: 3, sessionId: 'd3-s02', title: 'Slides: Modelos de negócio que escalam', type: 'pdf', releaseAt: { day: 3, time: '10:30' }, meta: 'PDF · 5,0 MB' },
  { id: 'm-d3-2', day: 3, sessionId: 'd3-s05', title: 'Planilha guiada: fluxo de caixa', type: 'workbook', releaseAt: { day: 3, time: '14:00' }, meta: 'Workbook · 4 páginas' },
  { id: 'm-d3-3', day: 3, sessionId: 'd3-s08', title: 'Workbook: plano de ação de 90 dias', type: 'workbook', releaseAt: { day: 3, time: '14:30' }, meta: 'Workbook · 10 páginas' },
  { id: 'm-d3-4', day: 3, sessionId: 'd3-s11', title: 'Comparativo: caminhos de expansão', type: 'pdf', releaseAt: { day: 3, time: '17:00' }, meta: 'PDF · 1,6 MB' },
  { id: 'm-d3-5', day: 3, sessionId: 'd3-s13', title: 'Vídeo: mensagem final', type: 'video', releaseAt: { day: 3, time: '19:10' }, meta: 'Vídeo · 9 min' },
];

export function materialsOfDay(day: DayNumber): Material[] {
  return materials.filter((m) => m.day === day);
}
