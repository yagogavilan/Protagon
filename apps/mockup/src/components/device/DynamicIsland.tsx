import { AnimatePresence, motion } from 'motion/react';
import { Clock, Radio } from 'lucide-react';
import { useClock, useDemo, usePauseStage } from '@/state/store';
import { liveActivityFor } from '@/lib/liveActivity';
import { cn } from '@/lib/cn';

/**
 * Dynamic Island desenhada. Mostra a Live Activity (G04) com o app logado: compacta por padrão,
 * expandida ao tocar, e "Volte agora" nos minutos finais do intervalo e do almoço.
 */
export function DynamicIsland() {
  const clock = useClock();
  const stage = usePauseStage();
  const moment = useDemo((s) => s.moment);
  const locked = useDemo((s) => s.locked);
  const auth = useDemo((s) => s.auth);
  const expanded = useDemo((s) => s.islandExpanded);
  const setExpanded = useDemo((s) => s.setIslandExpanded);
  const activity = auth === 'app' && !locked && (moment === 'break' || moment === 'lunch' || moment === 'live') ? liveActivityFor(moment, clock, stage) : null;
  const open = Boolean(activity) && expanded;
  const Icon = activity?.tone === 'live' ? Radio : Clock;
  const color = activity?.tone === 'live' ? 'text-live' : 'text-warning';

  return (
    <div data-device-chrome="dynamic-island" className="pointer-events-none absolute inset-x-0 top-[11px] z-50 flex justify-center">
      <motion.button
        type="button"
        initial={false}
        animate={{ width: open ? 358 : activity ? 176 : 126, height: open ? 88 : 37, borderRadius: open ? 32 : 999 }}
        transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
        onClick={() => activity && setExpanded(!expanded)}
        disabled={!activity}
        aria-expanded={activity ? open : undefined}
        aria-label={activity ? `Atividade ao vivo: ${activity.detail}. ${open ? 'Recolher' : 'Expandir'}` : undefined}
        className={cn('flex items-center overflow-hidden bg-black px-3 text-left', activity ? 'pointer-events-auto' : 'pointer-events-none')}
      >
        <AnimatePresence initial={false} mode="wait">
          {activity && !open ? (
            <motion.div key="compact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full items-center justify-between text-[11px] font-semibold">
              <span className="flex items-center gap-1">
                <Icon size={12} className={color} aria-hidden />
                <span className={color}>{activity.label}</span>
              </span>
              <span className="tabular text-text-primary">{activity.compact}</span>
            </motion.div>
          ) : null}
          {activity && open ? (
            <motion.div key="expanded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full flex-col gap-0.5 px-2 pt-6">
              <span className="flex items-center justify-between text-[12px] font-semibold">
                <span className={cn('flex items-center gap-1.5', color)}>
                  <Icon size={14} aria-hidden /> {activity.label}
                </span>
                <span className="tabular text-text-secondary">{activity.compact}</span>
              </span>
              <span className="truncate text-[15px] font-semibold text-text-primary">{activity.detail}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
