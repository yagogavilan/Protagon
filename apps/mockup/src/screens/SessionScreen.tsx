import { CalendarClock, Check, ChevronRight, Clock3, FileText, MapPin, NotebookPen, Target } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Avatar } from '@/components/ui/Avatar';
import { LiveDot } from '@/components/ui/LiveDot';
import { Button } from '@/components/ui/Button';
import { formatCountdownInline } from '@/components/ui/Countdown';
import { agenda } from '@/data/agenda';
import { agendaChange, speakers } from '@/data/edition';
import { materials } from '@/data/materials';
import { formatHour, sessionProgress, sessionStatus, toMinutes } from '@/lib/clock';
import { groupLabel } from '@/lib/groups';
import { MATERIAL_ICON, MATERIAL_LABEL, materialView, releaseLabel } from '@/lib/materials';
import { useClock, useDemo } from '@/state/store';
import { KIND_LABEL } from './TrilhaScreen';
import { cn } from '@/lib/cn';
import { useFormation, useMyGroup } from '@/state/features';
import { trioNames } from '@/screens/groups/MyGroupScreen';

/** T02 · Detalhe da sessão: palestrante, objetivo, material (liberado ou "libera às 14h") e anotações pessoais. */
export function SessionScreen() {
  const id = useDemo((s) => s.overlayId);
  const clock = useClock();
  const downloaded = useDemo((s) => s.downloaded);
  const completed = useDemo((s) => s.completed);
  const notes = useDemo((s) => s.sessionNotes);
  const setNote = useDemo((s) => s.setSessionNote);
  const openOverlay = useDemo((s) => s.openOverlay);
  const openMap = useDemo((s) => s.openMap);
  const session = agenda.find((s) => s.id === id);
  const myGroup = useMyGroup();
  const formation = useFormation();

  if (!session) {
    return (
      <OverlayPage title="Sessão">
        <p className="pt-8 text-center text-body text-text-secondary">Sessão não encontrada.</p>
      </OverlayPage>
    );
  }

  const status = sessionStatus(clock, session);
  const changed = session.id === agendaChange.sessionId;
  const start = changed ? agendaChange.newStart : session.start;
  const people = session.speakerIds.map((sid) => speakers.find((x) => x.id === sid)).filter((x): x is NonNullable<typeof x> => Boolean(x));
  const mats = session.materialIds.map((mid) => materials.find((m) => m.id === mid)).filter((m): m is NonNullable<typeof m> => Boolean(m));
  const total = toMinutes(session.end) - toMinutes(session.start);
  const elapsed = Math.round(sessionProgress(clock, session) * total);
  const note = notes[session.id] ?? '';

  return (
    <OverlayPage title="Sessão">
      <div className="flex flex-col gap-4">
        <header>
          <p className="flex flex-wrap items-center gap-2 text-caption">
            <span className="text-text-secondary">{KIND_LABEL[session.kind]} · Dia {session.day}</span>
            {status === 'now' ? (
              <span className="flex items-center gap-1.5 font-semibold text-live">
                <LiveDot /> Ao vivo
              </span>
            ) : status === 'done' ? (
              <span className="flex items-center gap-1 text-text-secondary">
                <Check size={14} aria-hidden className="text-live" /> Concluída
              </span>
            ) : status === 'next' ? (
              <span className="tabular rounded-sm bg-surface-3 px-2 py-0.5 text-text-primary">{clock.dayIndex === 0 ? 'Abre o evento' : `A seguir · ${formatCountdownInline(toMinutes(session.start) - clock.minutes)}`}</span>
            ) : null}
            {changed ? (
              <span className="flex items-center gap-1 rounded-sm bg-tint-warning px-2 py-0.5 font-semibold text-warning">
                <CalendarClock size={14} aria-hidden /> Alterado
              </span>
            ) : null}
          </p>
          <h2 className="mt-1 text-h1 text-text-primary">{session.title}</h2>
          <p className="tabular mt-1 flex items-center gap-2 text-body text-text-secondary">
            <Clock3 size={18} aria-hidden /> {formatHour(start)} às {formatHour(session.end)}
            {changed ? <span className="text-caption line-through">{formatHour(agendaChange.oldStart)}</span> : null}
          </p>
          <button type="button" onClick={() => openMap('sector')} className="-ml-1 mt-1 flex min-h-touch items-center gap-2 rounded-md px-1 text-body text-text-secondary active:bg-surface-3">
            <MapPin size={18} aria-hidden /> {session.location}
            <ChevronRight size={16} aria-hidden />
          </button>
        </header>

        {status === 'now' ? (
          <div>
            <div role="progressbar" aria-label="Progresso da sessão" aria-valuemin={0} aria-valuemax={total} aria-valuenow={elapsed} className="h-1.5 overflow-hidden rounded-pill bg-border-strong">
              <div className="h-full rounded-pill bg-live" style={{ width: `${Math.round((elapsed / total) * 100)}%` }} />
            </div>
            <p className="tabular mt-2 text-caption text-text-secondary">
              {elapsed} de {total} min · termina às {formatHour(session.end)}
            </p>
          </div>
        ) : null}

        {people.length > 0 ? (
          <section aria-label="Palestrantes" className="flex flex-col gap-3">
            {people.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <Avatar name={p.name} size="md" ring={status === 'now' ? 'live' : 'none'} />
                <div className="min-w-0">
                  <p className="truncate text-body-strong text-text-primary">{p.name}</p>
                  <p className="text-caption text-text-secondary">{p.role}</p>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {session.objective ? (
          <section className="rounded-lg border border-border-subtle bg-surface-1 p-card" aria-label="Objetivo da sessão">
            <p className="flex items-center gap-2 text-caption text-text-secondary">
              <Target size={16} aria-hidden className="text-gold-500" /> Objetivo
            </p>
            <p className="mt-1 text-body text-text-primary">{session.objective}</p>
          </section>
        ) : null}

        {session.trio ? (
          <section aria-label="Seu grupo" className="rounded-lg border border-border-subtle bg-surface-1 p-card">
            <p className="flex items-center gap-2 text-caption text-text-secondary">Seu grupo</p>
            {myGroup ? (
              <p className="mt-1 text-body text-text-primary">
                {groupLabel(myGroup)}. {trioNames(myGroup)}.
              </p>
            ) : (
              <>
                <p className="mt-1 text-body text-text-primary">Você ainda não tem grupo para esta dinâmica.</p>
                {formation === 'open' ? (
                  <Button size="compact" variant="secondary" className="mt-2" onClick={() => openOverlay('groups')}>
                    Formar meu grupo
                  </Button>
                ) : null}
              </>
            )}
          </section>
        ) : null}

        <section aria-label="Material vinculado" className="flex flex-col gap-2">
          <h3 className="text-body-strong text-text-primary">Material vinculado</h3>
          {mats.length === 0 ? (
            <p className="text-body text-text-secondary">Esta sessão não tem material.</p>
          ) : (
            mats.map((m) => {
              const view = materialView(clock, m, downloaded, completed);
              const Icon = MATERIAL_ICON[m.type];
              const scheduled = view === 'scheduled';
              return (
                <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 p-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-3">
                    <Icon size={20} aria-hidden className="text-gold-200" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-body-strong text-text-primary">{m.title}</p>
                    <p className="tabular text-caption text-text-secondary">
                      {MATERIAL_LABEL[m.type]} · {scheduled ? releaseLabel(m, clock) : m.meta}
                    </p>
                  </div>
                  {scheduled ? (
                    <span className="flex shrink-0 items-center gap-1 text-caption text-text-secondary">
                      <Clock3 size={14} aria-hidden /> Agendado
                    </span>
                  ) : (
                    <Button size="compact" variant="secondary" className="shrink-0 px-3" onClick={() => openOverlay('material', m.id)} icon={<FileText size={16} aria-hidden />}>
                      Abrir
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </section>

        <section className="flex flex-col gap-2">
          <label htmlFor="session-note" className="flex items-center gap-2 text-body-strong text-text-primary">
            <NotebookPen size={18} aria-hidden className="text-gold-500" /> Minhas anotações
          </label>
          <textarea
            id="session-note"
            value={note}
            rows={5}
            maxLength={2000}
            placeholder="Anote o que quer levar para a sua empresa."
            onChange={(e) => setNote(session.id, e.target.value)}
            className="w-full resize-none rounded-md border border-border-strong bg-surface-3 p-3 text-body text-text-primary placeholder:text-text-secondary focus:border-gold-200 focus:outline-none"
          />
          <p className={cn('flex items-center gap-1 text-body', note ? 'text-live' : 'text-text-secondary')} role="status">
            {note ? (
              <>
                <Check size={14} aria-hidden /> Salvo neste aparelho
              </>
            ) : (
              'Só você vê as anotações. Ficam salvas no aparelho, mesmo sem internet.'
            )}
          </p>
        </section>
      </div>
    </OverlayPage>
  );
}
