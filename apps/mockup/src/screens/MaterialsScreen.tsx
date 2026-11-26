import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownToLine, Check, ChevronRight, Clock3, CloudOff, FolderOpen, LoaderCircle } from 'lucide-react';
import { useClock, useDemo } from '@/state/store';
import { agenda } from '@/data/agenda';
import { materialsOfDay } from '@/data/materials';
import type { DayNumber, Material } from '@/data/types';
import { formatHour } from '@/lib/clock';
import { MATERIAL_ICON, MATERIAL_LABEL, materialView, releaseLabel, VIEW_LABEL, type MaterialView } from '@/lib/materials';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { FilterChip } from '@/components/ui/FilterChip';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { haptic } from '@/lib/haptics';
import { plural } from '@/lib/connections';
import { cn } from '@/lib/cn';

const DAYS: DayNumber[] = [1, 2, 3];

function ViewTag({ view }: { view: MaterialView }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-caption font-semibold',
        view === 'scheduled' && 'border border-dashed border-border-strong text-text-secondary',
        view === 'released' && 'bg-tint-info text-info',
        view === 'downloaded' && 'bg-tint-gold text-gold-200',
        view === 'completed' && 'bg-tint-live text-live',
      )}
    >
      {view === 'completed' ? <Check size={12} aria-hidden strokeWidth={3} /> : null}
      {view === 'downloaded' ? <ArrowDownToLine size={12} aria-hidden /> : null}
      {view === 'scheduled' ? <Clock3 size={12} aria-hidden /> : null}
      {VIEW_LABEL[view]}
    </span>
  );
}

/** M01 · Materiais por dia e sessão: liberado, agendado, baixado, concluído; offline mostra só os baixados. */
export function MateriaisScreen() {
  const clock = useClock();
  const online = useDemo((s) => s.online);
  const downloaded = useDemo((s) => s.downloaded);
  const completed = useDemo((s) => s.completed);
  const setDownloaded = useDemo((s) => s.setDownloaded);
  const openOverlay = useDemo((s) => s.openOverlay);
  const showToast = useDemo((s) => s.showToast);
  const dayNow: DayNumber = clock.dayIndex >= 1 && clock.dayIndex <= 3 ? (clock.dayIndex as DayNumber) : clock.dayIndex === 4 ? 1 : 1;
  const [day, setDay] = useState<DayNumber>(dayNow);
  const [onlyDownloaded, setOnlyDownloaded] = useState(false);
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const timers = useRef<number[]>([]);
  useEffect(() => setDay(dayNow), [dayNow]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const items = materialsOfDay(day);
  const viewOf = (m: Material) => materialView(clock, m, downloaded, completed);
  const offlineOnly = !online || onlyDownloaded;
  const visible = items.filter((m) => (offlineOnly ? downloaded[m.id] === true && viewOf(m) !== 'scheduled' : true));
  const hidden = items.length - visible.length;

  const groups = useMemo(() => {
    const ids = Array.from(new Set(visible.map((m) => m.sessionId)));
    return ids.map((sid) => ({ session: agenda.find((s) => s.id === sid)!, mats: visible.filter((m) => m.sessionId === sid) }));
  }, [visible]);

  const counts = {
    released: items.filter((m) => viewOf(m) !== 'scheduled').length,
    downloaded: items.filter((m) => downloaded[m.id] && viewOf(m) !== 'scheduled').length,
    completed: items.filter((m) => completed[m.id] && viewOf(m) !== 'scheduled').length,
  };

  const download = (m: Material) => {
    setBusy((b) => ({ ...b, [m.id]: true }));
    timers.current.push(
      window.setTimeout(() => {
        setDownloaded(m.id, true);
        setBusy((b) => ({ ...b, [m.id]: false }));
        haptic('light', 'material baixado');
        showToast({ text: `Baixado: ${m.title}`, tone: 'success' });
      }, 1100),
    );
  };

  return (
    <div className="flex flex-col gap-3 px-margin">
      {!online ? (
        <StatusBanner tone="info" icon={<CloudOff size={24} />} title="Sem internet." text={hidden > 0 ? `Mostrando só os baixados. ${hidden} precisam de internet.` : 'Mostrando só os materiais baixados.'} />
      ) : null}

      <SegmentedTabs<'1' | '2' | '3'>
        label="Dia dos materiais"
        value={String(day) as '1'}
        onChange={(v) => setDay(Number(v) as DayNumber)}
        items={DAYS.map((d) => ({ id: String(d) as '1', label: `Dia ${d}` }))}
      />
      <div className="flex items-center justify-between gap-2">
        <p className="tabular text-caption text-text-secondary">
          {plural(counts.released, 'liberado', 'liberados')} · {plural(counts.downloaded, 'baixado', 'baixados')} · {plural(counts.completed, 'concluído', 'concluídos')}
        </p>
        {online ? (
          <FilterChip selected={onlyDownloaded} onClick={() => setOnlyDownloaded((v) => !v)}>
            Baixados
          </FilterChip>
        ) : null}
      </div>

      {groups.length === 0 ? (
        <EmptyState
          icon={<FolderOpen size={48} strokeWidth={1.5} />}
          title={offlineOnly ? 'Nada baixado neste dia' : 'Sem materiais neste dia'}
          text={offlineOnly ? 'Baixe os materiais com internet para ler aqui, mesmo sem conexão.' : 'Os materiais do dia aparecem aqui quando as sessões terminam.'}
        />
      ) : (
        groups.map(({ session, mats }) => (
          <section key={session.id} aria-label={session.title} className="flex flex-col gap-2">
            <h2 className="tabular text-caption text-text-secondary">
              {formatHour(session.start)} · {session.title}
            </h2>
            {mats.map((m) => {
              const view = viewOf(m);
              const Icon = MATERIAL_ICON[m.type];
              const scheduled = view === 'scheduled';
              const loading = busy[m.id];
              return (
                <div key={m.id} className={cn('flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 p-3', scheduled && 'opacity-80')}>
                  <button
                    type="button"
                    disabled={scheduled}
                    onClick={() => openOverlay('material', m.id)}
                    aria-label={`${m.title}. ${MATERIAL_LABEL[m.type]}. ${scheduled ? releaseLabel(m, clock) : VIEW_LABEL[view]}${scheduled ? '' : '. Abrir'}`}
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left disabled:cursor-not-allowed"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-surface-3">
                      <Icon size={22} aria-hidden className={scheduled ? 'text-text-secondary' : 'text-gold-200'} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-body-strong text-text-primary">{m.title}</span>
                      <span className="tabular mt-0.5 flex flex-wrap items-center gap-2 text-caption text-text-secondary">
                        {MATERIAL_LABEL[m.type]} · {m.meta.split(' · ')[1] ?? m.meta}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <ViewTag view={view} />
                        {scheduled ? <span className="tabular text-caption text-text-secondary">{releaseLabel(m, clock)}</span> : null}
                      </span>
                    </span>
                  </button>
                  {view === 'released' && online ? (
                    <button
                      type="button"
                      onClick={() => download(m)}
                      disabled={loading}
                      aria-label={loading ? `Baixando ${m.title}` : `Baixar ${m.title}`}
                      className="flex h-touch w-touch shrink-0 items-center justify-center rounded-md border border-border-strong text-gold-200 active:bg-surface-3"
                    >
                      {loading ? <LoaderCircle size={20} aria-hidden className="animate-spin" /> : <ArrowDownToLine size={20} aria-hidden />}
                    </button>
                  ) : !scheduled ? (
                    <ChevronRight size={18} aria-hidden className="shrink-0 text-text-secondary" />
                  ) : null}
                </div>
              );
            })}
          </section>
        ))
      )}
      <div className="h-2" />
    </div>
  );
}
