import { AnimatePresence, motion } from 'motion/react';
import { Clock, Radio } from 'lucide-react';
import { useClock, useDemo } from '@/state/store';
import { liveActivityFor } from '@/lib/liveActivity';

/** Dynamic Island desenhada. Mostra a Live Activity compacta (G04) com o app logado: ao vivo, intervalo e almoço. */
export function DynamicIsland() {
  const clock = useClock();
  const moment = useDemo((s) => s.moment);
  const locked = useDemo((s) => s.locked);
  const auth = useDemo((s) => s.auth);
  const activity = auth === 'app' && !locked && (moment === 'break' || moment === 'lunch' || moment === 'live') ? liveActivityFor(moment, clock) : null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-[11px] z-50 flex justify-center">
    <motion.div
      initial={false}
      animate={{ width: activity ? 176 : 126 }}
      transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
      className="flex h-[37px] items-center justify-between rounded-pill bg-black px-3"
      aria-label={activity ? `Atividade ao vivo: ${activity.detail}` : undefined}
      role={activity ? 'status' : undefined}
    >
      <AnimatePresence initial={false}>
        {activity ? (
          <motion.div
            key={activity.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex w-full items-center justify-between text-[11px] font-semibold"
          >
            <span className="flex items-center gap-1">
              {activity.tone === 'live' ? (
                <Radio size={12} className="text-live" aria-hidden />
              ) : (
                <Clock size={12} className="text-warning" aria-hidden />
              )}
              <span className={activity.tone === 'live' ? 'text-live' : 'text-warning'}>{activity.label}</span>
            </span>
            <span className="tabular text-text-primary">{activity.compact}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
    </div>
  );
}
