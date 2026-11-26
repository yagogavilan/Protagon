import { FileText, FileSpreadsheet, Headphones, PlayCircle, type LucideIcon } from 'lucide-react';
import type { Material, MaterialType } from '@/data/types';
import { formatHour, materialStatus, type EventClock } from '@/lib/clock';

export type MaterialView = 'scheduled' | 'released' | 'downloaded' | 'completed';

export const MATERIAL_ICON: Record<MaterialType, LucideIcon> = {
  pdf: FileText,
  workbook: FileSpreadsheet,
  audio: Headphones,
  video: PlayCircle,
};

export const MATERIAL_LABEL: Record<MaterialType, string> = {
  pdf: 'PDF',
  workbook: 'Workbook',
  audio: 'Áudio',
  video: 'Vídeo',
};

/** Prioridade: agendado (ainda não liberado) > concluído > baixado > liberado */
export function materialView(clock: EventClock, m: Material, downloaded: Record<string, boolean>, completed: Record<string, boolean>): MaterialView {
  if (materialStatus(clock, m) === 'scheduled') return 'scheduled';
  if (completed[m.id]) return 'completed';
  if (downloaded[m.id]) return 'downloaded';
  return 'released';
}

/** "Libera às 14h" no mesmo dia; "Libera no Dia 2, às 10h30" nos outros */
export function releaseLabel(m: Material, clock: EventClock): string {
  const sameDay = clock.dayIndex === m.releaseAt.day;
  return sameDay ? `Libera às ${formatHour(m.releaseAt.time)}` : `Libera no Dia ${m.releaseAt.day}, às ${formatHour(m.releaseAt.time)}`;
}

export const VIEW_LABEL: Record<MaterialView, string> = {
  scheduled: 'Agendado',
  released: 'Liberado',
  downloaded: 'Baixado',
  completed: 'Concluído',
};
