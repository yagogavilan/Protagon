import { ChevronRight } from 'lucide-react';
import type { Session } from '@/data/types';
import { speakers } from '@/data/edition';
import { formatHour, toMinutes, type EventClock } from '@/lib/clock';
import { Avatar } from './Avatar';
import { LiveDot } from './LiveDot';
import { cn } from '@/lib/cn';

/**
 * LiveCard (design-system §LiveCard): surface.2, borda state.live + glow.live (único na tela),
 * anel verde no palestrante, progresso com texto. Variante "ending" a 10 min do fim.
 */
export function LiveCard({ session, clock, onOpen }: { session: Session; clock: EventClock; onOpen: () => void }) {
  const total = toMinutes(session.end) - toMinutes(session.start);
  const elapsed = Math.max(0, Math.min(total, clock.minutes - toMinutes(session.start)));
  const remaining = total - elapsed;
  const ending = remaining <= 10;
  const speaker = speakers.find((s) => s.id === session.speakerIds[0]);
  const place = session.location === 'Plenária principal' ? 'Plenária' : session.location;
  const pct = Math.round((elapsed / total) * 100);

  return (
    <section
      role="group"
      aria-label={`Ao vivo na ${place}: ${session.title}${speaker ? `, com ${speaker.name}` : ''}. ${elapsed} de ${total} minutos.`}
      className="relative rounded-lg border border-live bg-surface-2 p-card shadow-glow-live"
    >
      <p className="flex items-center gap-2 text-caption">
        <span className="flex items-center gap-1.5 font-semibold text-live">
          <LiveDot /> Ao vivo
        </span>
        <span className="text-text-secondary">· {place}</span>
      </p>
      <h2 className="mt-2 line-clamp-2 text-h1 text-text-primary">{session.title}</h2>

      {speaker ? (
        <div className="mt-3 flex items-center gap-3">
          <Avatar name={speaker.name} size="sm" ring="live" />
          <span className="min-w-0">
            <span className="block truncate text-body-strong text-text-primary">{speaker.name}</span>
            <span className="block truncate text-caption text-text-secondary">{speaker.role}</span>
          </span>
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-label="Progresso da sessão"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={elapsed}
        aria-valuetext={`${elapsed} de ${total} minutos`}
        className="mt-4 h-1.5 overflow-hidden rounded-pill bg-border-strong"
      >
        <div
          className={cn('h-full origin-left rounded-pill transition-transform duration-base ease-protagon', ending ? 'bg-warning' : 'bg-live')}
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
      <p className={cn('tabular mt-2 text-caption', ending ? 'text-warning' : 'text-text-secondary')}>
        {ending ? `Termina às ${formatHour(session.end)}` : `Começou às ${formatHour(session.start)} · ${elapsed} de ${total} min`}
      </p>

      <button
        type="button"
        onClick={onOpen}
        className="-mx-2 mt-1 flex min-h-touch items-center gap-1 rounded-md px-2 text-body-strong text-gold-200 active:bg-surface-3"
      >
        Ver sessão <ChevronRight size={18} aria-hidden />
      </button>
    </section>
  );
}
