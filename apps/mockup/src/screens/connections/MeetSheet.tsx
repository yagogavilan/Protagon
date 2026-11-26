import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Map as MapIcon } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { connectionPoints } from '@/data/edition';
import type { PointId } from '@/data/types';
import { useClock, useDemo } from '@/state/store';
import { defaultPoint, findParticipant, firstName, meetingLabel, upcomingSlots } from '@/lib/connections';
import { formatHour } from '@/lib/clock';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';

/** C08 · Marcar encontro: próximo intervalo ou almoço + Ponto de Conexão ("Ponto C, 15h40"). */
export function MeetSheet() {
  const target = useDemo((s) => s.meetFor);
  const setMeetFor = useDemo((s) => s.setMeetFor);
  const setMeeting = useDemo((s) => s.setMeeting);
  const openMap = useDemo((s) => s.openMap);
  const showToast = useDemo((s) => s.showToast);
  const moment = useDemo((s) => s.moment);
  const clock = useClock();
  const slots = useMemo(() => upcomingSlots(clock), [clock.dayIndex, clock.minutes]); // eslint-disable-line react-hooks/exhaustive-deps
  const [slotIdx, setSlotIdx] = useState(0);
  const [point, setPoint] = useState<PointId>('A');
  const [showAll, setShowAll] = useState(false);
  const person = target ? findParticipant(target.id) : undefined;
  const open = Boolean(target);

  useEffect(() => {
    if (!open) return;
    const first = slots[0];
    setSlotIdx(0);
    setShowAll(false);
    setPoint(first ? defaultPoint(first.kind) : 'A');
  }, [open, slots]);

  const close = () => setMeetFor(null);
  const visible = showAll ? slots : slots.slice(0, 3);
  const chosen = slots[slotIdx];

  const propose = () => {
    if (!target || !chosen) return;
    setMeeting(target.id, { by: 'me', status: 'proposed', slot: chosen.slot, point });
    haptic('light', 'encontro proposto');
    showToast({ text: `Encontro proposto: ${meetingLabel({ point, slot: chosen.slot }, clock)}`, tone: 'success' });
    close();
  };

  return (
    <BottomSheet
      open={open}
      onClose={close}
      size="tall"
      title={person ? `Vamos nos ver, ${firstName(person.name)}?` : 'Marcar encontro'}
      subtitle={target?.mode === 'counter' ? 'Sugira outro horário ou ponto' : 'Escolha o horário e o ponto'}
      closeLabel="Fechar encontro"
      footer={
        chosen ? (
          <>
            <Button block icon={<CalendarClock size={20} aria-hidden />} onClick={propose}>
              Propor {meetingLabel({ point, slot: chosen.slot }, clock)}
            </Button>
            <p className="text-center text-caption text-text-secondary">{person ? `${firstName(person.name)} confirma ou sugere outro horário.` : ''}</p>
          </>
        ) : null
      }
    >
      {slots.length === 0 ? (
        <EmptyState
          icon={<CalendarClock size={48} strokeWidth={1.5} />}
          title={moment === 'after' ? 'O evento terminou' : 'Sem intervalos pela frente'}
          text="Para se encontrar depois do evento, use os contatos da conexão."
        />
      ) : (
        <>
          <p className="text-body-strong text-text-primary">Quando</p>
          <div role="radiogroup" aria-label="Horário do encontro" className="mt-1 flex flex-col gap-1">
            {visible.map((o, i) => {
              const checked = i === slotIdx;
              const sameDay = clock.dayIndex === o.slot.day;
              return (
                <button
                  key={o.slot.sessionId}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => {
                    setSlotIdx(i);
                    setPoint(defaultPoint(o.kind));
                  }}
                  className={cn('flex min-h-touch items-center gap-3 rounded-md px-2 py-2 text-left active:bg-surface-3', checked && 'bg-surface-1')}
                >
                  <span aria-hidden className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-pill border-2', checked ? 'border-gold-500' : 'border-border-strong')}>
                    {checked ? <span className="h-2.5 w-2.5 rounded-pill bg-gold-500" /> : null}
                  </span>
                  <span className="text-body text-text-primary">
                    {i === 0 ? 'Próximo: ' : ''}
                    {o.title} <span className="tabular text-text-secondary">· {sameDay ? '' : `Dia ${o.slot.day}, `}{formatHour(o.slot.time)}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {!showAll && slots.length > 3 ? (
            <button type="button" onClick={() => setShowAll(true)} className="min-h-touch rounded-md px-2 text-body-strong text-gold-200 active:bg-surface-3">
              Escolher outro horário
            </button>
          ) : null}

          <p className="mt-4 text-body-strong text-text-primary">Onde</p>
          <div role="radiogroup" aria-label="Ponto de Conexão" className="mt-1 flex flex-col gap-1">
            {connectionPoints.map((p) => {
              const checked = point === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  onClick={() => setPoint(p.id)}
                  className={cn('flex min-h-touch items-center gap-3 rounded-md px-2 py-2 text-left active:bg-surface-3', checked && 'bg-surface-1')}
                >
                  <span aria-hidden className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-pill border-2', checked ? 'border-gold-500' : 'border-border-strong')}>
                    {checked ? <span className="h-2.5 w-2.5 rounded-pill bg-gold-500" /> : null}
                  </span>
                  <span className="text-body text-text-primary">
                    {p.name} <span className="text-text-secondary">· {p.where}</span>
                  </span>
                </button>
              );
            })}
          </div>
          <Button size="compact" variant="ghost" className="-ml-2 mt-1" icon={<MapIcon size={18} aria-hidden />} onClick={() => {
              close();
              openMap(point);
            }}>
            Ver {`Ponto ${point}`} no mapa
          </Button>
        </>
      )}
    </BottomSheet>
  );
}
