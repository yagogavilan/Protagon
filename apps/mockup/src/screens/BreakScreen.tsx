import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Coffee, Map as MapIcon, Utensils, Wifi, X } from 'lucide-react';
import { useClock, useDemo, usePauseStage } from '@/state/store';
import { Button } from '@/components/ui/Button';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { OfflineBanner } from '@/components/device/OfflineBanner';
import { currentSession, formatHour, minutesUntilReturn, toMinutes } from '@/lib/clock';
import { findParticipant, meetingLabel } from '@/lib/connections';
import { edition } from '@/data/edition';
import { cn } from '@/lib/cn';

function mmss(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  if (s >= 3600) return `${Math.floor(s / 3600)}h${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** A02 · Intervalo / almoço em tela cheia: contagem, "faltam 5 min", "volte agora", onde comer, mapa e encontro. */
export function BreakScreen() {
  const moment = useDemo((s) => s.moment);
  const tier = useDemo((s) => s.tier);
  const meetings = useDemo((s) => s.meetings);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const openOverlay = useDemo((s) => s.openOverlay);
  const openMap = useDemo((s) => s.openMap);
  const setWifiOpen = useDemo((s) => s.setWifiOpen);
  const clock = useClock();
  const stage = usePauseStage();
  const session = currentSession(clock);
  const isLunch = moment === 'lunch';
  const isPause = (moment === 'break' || moment === 'lunch') && session;

  const leftMin = minutesUntilReturn(moment, clock.minutes) ?? 0;
  const totalSeconds = Math.max(0, leftMin) * 60;
  const [seconds, setSeconds] = useState(totalSeconds);
  useEffect(() => setSeconds(totalSeconds), [totalSeconds]);
  useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const returnAt = useMemo(() => {
    if (!session) return '';
    if (!isLunch) return session.end;
    const t = toMinutes(session.end) - 10;
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  }, [session, isLunch]);

  const myMeeting = useMemo(() => {
    const confirmed = Object.entries(meetings)
      .filter(([, m]) => m.status === 'confirmed')
      .sort(([, a], [, b]) => (a.slot.day - b.slot.day) || a.slot.time.localeCompare(b.slot.time));
    return confirmed[0];
  }, [meetings]);

  if (!isPause || !session) {
    return (
      <div className="flex h-full flex-col bg-bg px-margin pt-[58px]">
        <button type="button" onClick={closeOverlay} className="flex h-touch w-touch items-center justify-center self-end rounded-md text-text-secondary" aria-label="Fechar">
          <X size={24} aria-hidden />
        </button>
        <EmptyState
          icon={<Coffee size={48} strokeWidth={1.5} />}
          title="Nenhum intervalo agora"
          text="Esta tela abre no intervalo e no almoço, com a contagem para voltar ao salão."
          action={<Button block variant="secondary" onClick={closeOverlay}>Voltar</Button>}
        />
      </div>
    );
  }

  const total = Math.max(1, toMinutes(returnAt) - toMinutes(session.start)) * 60;
  const progress = Math.min(1, Math.max(0, 1 - seconds / total));
  const tone = stage === 'start' ? 'info' : 'warning';
  const R = 104;
  const C = 2 * Math.PI * R;
  const Icon = isLunch ? Utensils : Coffee;
  const who = myMeeting ? findParticipant(myMeeting[0]) : undefined;

  return (
    <div
      className="flex h-full flex-col bg-bg px-margin pb-8 pt-[58px]"
      style={{ backgroundImage: 'radial-gradient(90% 40% at 50% 0%, rgba(204,143,78,0.2), transparent 70%)' }}
    >
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-body-strong text-text-primary">
          <Icon size={20} aria-hidden className="text-gold-500" /> {isLunch ? 'Almoço' : 'Intervalo'}
        </p>
        <button type="button" onClick={closeOverlay} aria-label="Fechar tela do intervalo" className="flex h-touch w-touch items-center justify-center rounded-md text-text-secondary active:bg-surface-3">
          <X size={24} aria-hidden />
        </button>
      </div>
      <OfflineBanner />

      <div className="no-scrollbar mt-1 flex flex-1 flex-col gap-4 overflow-y-auto">
        <div className="flex flex-col items-center">
          <div className="relative flex h-[240px] w-[240px] items-center justify-center" role="timer" aria-label={stage === 'now' ? 'Volte agora ao salão' : `Faltam ${Math.ceil(seconds / 60)} minutos para voltar ao salão`}>
            <svg width="240" height="240" viewBox="0 0 240 240" aria-hidden className="absolute inset-0 -rotate-90">
              <circle cx="120" cy="120" r={R} fill="none" strokeWidth="8" className="stroke-border-strong" />
              <circle
                cx="120"
                cy="120"
                r={R}
                fill="none"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
                className={cn('transition-[stroke-dashoffset] duration-slow ease-protagon', tone === 'warning' ? 'stroke-warning' : 'stroke-info')}
              />
            </svg>
            <div className="text-center">
              <p className="text-caption text-text-secondary">{stage === 'now' ? 'Hora de voltar' : 'Volte ao salão em'}</p>
              <p className={cn('tabular text-[56px] font-bold leading-[64px]', stage === 'start' ? 'text-text-primary' : 'text-warning')}>
                {stage === 'now' ? 'Agora' : mmss(seconds)}
              </p>
              <p className="tabular text-body-strong text-text-primary">às {formatHour(returnAt)}</p>
            </div>
          </div>
        </div>

        {stage === 'five' ? (
          <StatusBanner tone="warning" alert icon={<CalendarCheck size={24} />} title="Faltam 5 min. Volte ao salão" text="Sua próxima sessão começa logo em seguida." />
        ) : stage === 'now' ? (
          <StatusBanner tone="warning" alert icon={<CalendarCheck size={24} />} title="Volte agora ao salão" text={`Sentar com calma leva uns 3 minutos. ${edition.sectorByTier[tier]}.`} />
        ) : (
          <p className="text-center text-body text-text-secondary">
            {isLunch ? `Almoço até ${formatHour(session.end)}. Volte ao salão às ${formatHour(returnAt)}.` : 'Café no foyer. Aproveite para respirar e anotar.'}
          </p>
        )}

        {myMeeting && who ? (
          <section className="rounded-lg border border-border-gold bg-surface-2 p-card" aria-label="Seu próximo encontro">
            <p className="text-caption text-text-secondary">Seu próximo encontro</p>
            <p className="mt-1 text-h2 text-text-primary">{meetingLabel(myMeeting[1], clock)}</p>
            <p className="text-body text-text-secondary">com {who.name}, {who.company}</p>
            <Button size="compact" variant="ghost" className="-ml-2 mt-1" onClick={() => openMap(myMeeting[1].point)}>
              Ver o ponto no mapa
            </Button>
          </section>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          {isLunch ? (
            <button type="button" onClick={() => openOverlay('eat')} className="flex min-h-[96px] flex-col items-start gap-2 rounded-lg border border-border-subtle bg-surface-1 p-card text-left active:bg-surface-3">
              <Utensils size={24} aria-hidden className="text-gold-500" />
              <span className="text-body-strong text-text-primary">Onde comer</span>
            </button>
          ) : (
            <button type="button" onClick={() => setWifiOpen(true)} className="flex min-h-[96px] flex-col items-start gap-2 rounded-lg border border-border-subtle bg-surface-1 p-card text-left active:bg-surface-3">
              <Wifi size={24} aria-hidden className="text-gold-500" />
              <span className="text-body-strong text-text-primary">Wi-Fi</span>
            </button>
          )}
          <button type="button" onClick={() => openMap('sector')} className="flex min-h-[96px] flex-col items-start gap-2 rounded-lg border border-border-subtle bg-surface-1 p-card text-left active:bg-surface-3">
            <MapIcon size={24} aria-hidden className="text-gold-500" />
            <span className="text-body-strong text-text-primary">Mapa</span>
          </button>
        </div>
      </div>

      {stage !== 'start' ? (
        <Button block className="mt-3" onClick={() => openMap('sector')} icon={<MapIcon size={20} aria-hidden />}>
          Ver meu setor
        </Button>
      ) : (
        <Button block variant="secondary" className="mt-3" onClick={closeOverlay}>
          Voltar ao app
        </Button>
      )}
    </div>
  );
}
