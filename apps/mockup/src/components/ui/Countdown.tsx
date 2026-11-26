import { Clock } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Regra de formato (design-system §Countdown): > 60 min "1h10"; 10–60 "38 min"; < 10 "mm:ss" */
export function formatCountdown(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, '0')}`;
  }
  if (minutes >= 10) return `${minutes} min`;
  return `${String(minutes).padStart(2, '0')}:00`;
}

/** "em 1h10" / "em 38 min" / "em 7 min" (inline, atualiza por minuto) */
export function formatCountdownInline(minutes: number): string {
  if (minutes <= 0) return 'agora';
  if (minutes < 10) return `em ${minutes} min`;
  return `em ${formatCountdown(minutes)}`;
}

export function spokenMinutes(minutes: number): string {
  if (minutes <= 0) return 'agora';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(h === 1 ? '1 hora' : `${h} horas`);
  if (m > 0) parts.push(m === 1 ? '1 minuto' : `${m} minutos`);
  return `faltam ${parts.join(' e ')}`;
}

/** Countdown: tabular, warning a partir de 5 min, "Agora" (live) ao zerar. */
export function Countdown({ minutes, variant = 'inline', className }: { minutes: number; variant?: 'inline' | 'display'; className?: string }) {
  const done = minutes <= 0;
  const soon = !done && minutes <= 5;
  const text = done ? 'Agora' : variant === 'display' ? formatCountdown(minutes) : formatCountdownInline(minutes);
  return (
    <span
      aria-label={spokenMinutes(minutes)}
      className={cn(
        'tabular inline-flex items-center gap-1',
        variant === 'display' ? 'text-display' : 'text-body-strong',
        done ? 'text-live' : soon ? 'text-warning' : 'text-text-primary',
        className,
      )}
    >
      {soon ? <Clock size={variant === 'display' ? 24 : 16} aria-hidden /> : null}
      <span aria-hidden>{text}</span>
    </span>
  );
}
