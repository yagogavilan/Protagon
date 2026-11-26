import { useEffect, useRef, useState } from 'react';
import { CalendarClock, Check, ChevronRight, Coffee, FileText, Utensils } from 'lucide-react';
import { useClock, useDemo } from '@/state/store';
import { agenda, dayThemes, sessionsOfDay } from '@/data/agenda';
import { agendaChange, speakers } from '@/data/edition';
import type { DayNumber, Session, SessionKind } from '@/data/types';
import { formatHour, sessionStatus, toMinutes, type EventClock, type SessionStatus } from '@/lib/clock';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { LiveDot } from '@/components/ui/LiveDot';
import { Button } from '@/components/ui/Button';
import { formatCountdownInline } from '@/components/ui/Countdown';
import { scrollWithin } from '@/lib/scroll';
import { cn } from '@/lib/cn';
import { GroupTrilhaBody } from '@/screens/groups/GroupCard';
import { trioNames } from '@/screens/groups/MyGroupScreen';
import { useMyGroup } from '@/state/features';

export const KIND_LABEL: Record<SessionKind, string> = {
  abertura: 'Abertura',
  palestra: 'Palestra',
  dinamica: 'Dinâmica',
  exercicio: 'Exercício',
  intervalo: 'Intervalo',
  almoco: 'Almoço',
  encerramento: 'Encerramento',
};

const DAYS: DayNumber[] = [1, 2, 3];
const content = (s: Session) => s.kind !== 'intervalo' && s.kind !== 'almoco';

function dayState(clock: EventClock, day: DayNumber): 'done' | 'now' | 'future' {
  if (clock.dayIndex === 4) return 'done';
  if (clock.dayIndex === 0) return 'future';
  return day < clock.dayIndex ? 'done' : day === clock.dayIndex ? 'now' : 'future';
}

function speakerLine(s: Session): string {
  return s.speakerIds
    .map((id) => speakers.find((x) => x.id === id)?.name)
    .filter(Boolean)
    .join(' e ');
}

function StatusTag({ status, minutes, beforeEvent }: { status: SessionStatus; minutes: number; beforeEvent?: boolean }) {
  if (status === 'now')
    return (
      <span className="inline-flex items-center gap-1.5 text-caption font-semibold text-live">
        <LiveDot /> Ao vivo
      </span>
    );
  if (status === 'next')
    return (
      <span className="tabular inline-flex items-center rounded-sm bg-surface-3 px-2 py-0.5 text-caption text-text-primary">
        {beforeEvent ? 'Abre o evento' : `A seguir · ${formatCountdownInline(minutes)}`}
      </span>
    );
  if (status === 'done')
    return (
      <span className="inline-flex items-center gap-1 text-caption text-text-secondary">
        <Check size={14} aria-hidden className="text-live" /> Concluída
      </span>
    );
  return null;
}

function PauseRow({ s, status }: { s: Session; status: SessionStatus }) {
  const openOverlay = useDemo((s2) => s2.openOverlay);
  const openMap = useDemo((s2) => s2.openMap);
  const Icon = s.kind === 'almoco' ? Utensils : Coffee;
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-md border border-dashed px-3 py-2',
        status === 'now' ? 'border-info bg-tint-info' : 'border-border-strong',
        status === 'done' && 'opacity-70',
      )}
    >
      <Icon size={20} aria-hidden className="shrink-0 text-gold-500" />
      <p className="min-w-0 flex-1 text-body text-text-primary">
        {KIND_LABEL[s.kind]} <span className="tabular text-text-secondary">· {formatHour(s.start)} às {formatHour(s.end)}</span>
      </p>
      {status === 'now' ? (
        <Button size="compact" variant="ghost" className="shrink-0" onClick={() => openOverlay('break')}>
          Abrir
        </Button>
      ) : s.kind === 'almoco' && status !== 'done' ? (
        <Button size="compact" variant="ghost" className="shrink-0" onClick={() => openOverlay('eat')}>
          Onde comer
        </Button>
      ) : status !== 'done' ? (
        <Button size="compact" variant="ghost" className="shrink-0" onClick={() => openMap('sector')}>
          Mapa
        </Button>
      ) : null}
    </div>
  );
}

/** Bloco "Formação dos grupos" (D1 09h15): mostra o card de GR01 dentro do bloco, sem abrir o detalhe da sessão */
function GroupFormationRow({ s, status }: { s: Session; status: SessionStatus }) {
  return (
    <section
      aria-label={`${KIND_LABEL[s.kind]}: ${s.title}, ${formatHour(s.start)} às ${formatHour(s.end)}`}
      className={cn(
        'flex w-full flex-col gap-1 rounded-lg border p-card text-left shadow-card',
        status === 'now' ? 'border-live bg-surface-2 shadow-glow-live' : 'border-border-subtle bg-surface-1',
        status === 'done' && 'opacity-75',
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-caption text-text-secondary">{KIND_LABEL[s.kind]}</span>
        <StatusTag status={status} minutes={0} />
      </span>
      <h3 className="text-body-strong text-text-primary">{s.title}</h3>
      <p className="tabular text-body text-text-secondary">
        {formatHour(s.start)} às {formatHour(s.end)}
      </p>
      <GroupTrilhaBody />
    </section>
  );
}

function SessionRow({ s, status, clock }: { s: Session; status: SessionStatus; clock: EventClock }) {
  const openOverlay = useDemo((x) => x.openOverlay);
  const myGroup = useMyGroup();
  const changed = s.id === agendaChange.sessionId;
  const minutes = toMinutes(s.start) - clock.minutes;
  const names = speakerLine(s);
  return (
    <button
      type="button"
      onClick={() => (s.id === 'd2-gaia' ? openOverlay('gaia') : openOverlay('session', s.id))}
      aria-label={`${KIND_LABEL[s.kind]}: ${s.title}, ${formatHour(changed ? agendaChange.newStart : s.start)} às ${formatHour(s.end)}${changed ? ', horário alterado' : ''}`}
      className={cn(
        'flex w-full flex-col gap-1 rounded-lg border p-card text-left shadow-card transition-transform duration-fast active:scale-press',
        status === 'now' ? 'border-live bg-surface-2 shadow-glow-live' : changed ? 'border-warning bg-surface-1' : 'border-border-subtle bg-surface-1',
        status === 'done' && 'opacity-75',
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-caption text-text-secondary">{KIND_LABEL[s.kind]}</span>
        <StatusTag status={status} minutes={minutes} beforeEvent={clock.dayIndex === 0} />
      </span>
      <span className="text-body-strong text-text-primary">{s.title}</span>
      <span className="tabular flex flex-wrap items-center gap-x-2 text-body text-text-secondary">
        {changed ? (
          <>
            <span className="text-warning">{formatHour(agendaChange.newStart)} às {formatHour(s.end)}</span>
            <span className="text-caption line-through">{formatHour(agendaChange.oldStart)}</span>
          </>
        ) : (
          <span>
            {formatHour(s.start)} às {formatHour(s.end)}
          </span>
        )}
        {names ? <span>· {names}</span> : null}
      </span>
      {s.trio && myGroup ? <span className="text-body text-text-secondary">{trioNames(myGroup)}</span> : null}
      {changed ? (
        <span className="mt-1 inline-flex items-center gap-1.5 self-start rounded-sm bg-tint-warning px-2 py-0.5 text-caption font-semibold text-warning">
          <CalendarClock size={14} aria-hidden /> Alterado
        </span>
      ) : null}
      <span className="mt-1 flex items-center justify-between text-caption text-text-secondary">
        <span className="flex items-center gap-1">
          {s.materialIds.length > 0 ? (
            <>
              <FileText size={14} aria-hidden className="text-gold-500" /> Com material
            </>
          ) : null}
        </span>
        <ChevronRight size={18} aria-hidden />
      </span>
    </button>
  );
}

/** T01 · Trilha: Dia 1/2/3, linha do tempo, progresso da jornada, bloco alterado. */
export function TrilhaScreen() {
  const clock = useClock();
  const online = useDemo((s) => s.online);
  const dayNow: DayNumber = clock.dayIndex >= 1 && clock.dayIndex <= 3 ? (clock.dayIndex as DayNumber) : 1;
  const [viewDay, setViewDay] = useState<DayNumber>(dayNow);
  const nowRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => setViewDay(dayNow), [dayNow]);

  const sessions = sessionsOfDay(viewDay);
  const state = dayState(clock, viewDay);
  const statusOf = (s: Session) => sessionStatus(clock, s);

  const all = agenda.filter(content);
  const doneAll = all.filter((s) => statusOf(s) === 'done').length;
  const dayDone = sessions.filter(content).filter((s) => statusOf(s) === 'done').length;
  const dayTotal = sessions.filter(content).length;
  const pct = Math.round((doneAll / all.length) * 100);

  const focusId = sessions.find((s) => statusOf(s) === 'now')?.id ?? sessions.find((s) => statusOf(s) === 'next')?.id;
  useEffect(() => {
    if (state === 'now') window.setTimeout(() => scrollWithin(nowRef.current, 150), 60);
  }, [viewDay, state]);

  return (
    <div className="flex flex-col gap-3 px-margin">
      <section aria-label="Progresso da jornada" className="rounded-lg border border-border-subtle bg-surface-1 p-card">
        <p className="flex items-baseline justify-between">
          <span className="text-body-strong text-text-primary">Sua jornada</span>
          <span className="tabular text-caption text-text-secondary">
            {doneAll} de {all.length} blocos
          </span>
        </p>
        <div role="progressbar" aria-label="Progresso da jornada" aria-valuemin={0} aria-valuemax={all.length} aria-valuenow={doneAll} className="mt-2 h-1.5 overflow-hidden rounded-pill bg-border-strong">
          <div className="h-full origin-left rounded-pill bg-gradient-gold" style={{ width: `${pct}%` }} />
        </div>
        <p className="tabular mt-1 text-caption text-text-secondary">{pct}% dos 3 dias</p>
      </section>

      <SegmentedTabs<'1' | '2' | '3'>
        label="Dias do evento"
        value={String(viewDay) as '1'}
        onChange={(v) => setViewDay(Number(v) as DayNumber)}
        items={DAYS.map((d) => ({ id: String(d) as '1', label: `Dia ${d}` }))}
      />

      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-h2 text-text-primary">{dayThemes[viewDay]}</h2>
        <p className="tabular text-caption text-text-secondary">
          {state === 'done' ? `Encerrado · ${dayTotal} de ${dayTotal} blocos` : state === 'now' ? `Hoje · ${dayDone} de ${dayTotal} blocos` : clock.dayIndex === 0 ? 'Em breve' : `Começa no Dia ${viewDay}`}
        </p>
      </div>
      {!online ? <p className="text-body text-text-secondary">Agenda salva no aparelho. Funciona sem internet.</p> : null}

      <ol className="relative flex flex-col gap-3 pb-4" aria-label={`Programação do Dia ${viewDay}`}>
        <span aria-hidden className="absolute bottom-4 left-[7px] top-3 w-px bg-border-strong" />
        {sessions.map((s) => {
          const status = statusOf(s);
          const isFocus = s.id === focusId;
          return (
            <li key={s.id} ref={isFocus ? nowRef : undefined} className="relative pl-7">
              <span
                aria-hidden
                className={cn(
                  'absolute left-0 top-5 h-[15px] w-[15px] rounded-pill border-2',
                  status === 'now' ? 'border-live bg-live shadow-glow-live' : status === 'done' ? 'border-border-strong bg-border-strong' : status === 'next' ? 'border-gold-500 bg-bg' : 'border-border-strong bg-bg',
                )}
              />
              {s.id === 'd1-grupos' ? <GroupFormationRow s={s} status={status} /> : content(s) ? <SessionRow s={s} status={status} clock={clock} /> : <PauseRow s={s} status={status} />}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
