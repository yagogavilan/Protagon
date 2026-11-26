import { motion } from 'motion/react';
import { Clock, Lock, Radio, Sparkles } from 'lucide-react';
import { useClock, useDemo, usePauseStage } from '@/state/store';
import { formatLongDate } from '@/lib/clock';
import { liveActivityFor } from '@/lib/liveActivity';
import { NotificationIcon } from '@/components/shell/NotificationIcon';
import { cn } from '@/lib/cn';

/** Tela bloqueada do iPhone com push (G03) e Live Activity (G04). UI do sistema, não do app. */
export function LockScreen() {
  const clock = useClock();
  const moment = useDemo((s) => s.moment);
  const notifications = useDemo((s) => s.notifications);
  const auth = useDemo((s) => s.auth);
  const setLocked = useDemo((s) => s.setLocked);
  const openOverlay = useDemo((s) => s.openOverlay);
  const stage = usePauseStage();
  const activity = liveActivityFor(moment, clock, stage);
  const recent = notifications.filter((n) => !n.read).slice(0, 3);

  const unlockTo = (withNotifications: boolean) => {
    setLocked(false);
    if (withNotifications && auth === 'app') openOverlay('notifications');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-bg px-3 pb-8 pt-[60px]"
      style={{
        backgroundImage:
          'radial-gradient(120% 60% at 50% 0%, rgba(204,143,78,0.28), transparent 60%), radial-gradient(80% 50% at 80% 100%, rgba(90,184,255,0.12), transparent 70%)',
      }}
      aria-label="Tela bloqueada"
    >
      <div className="flex flex-col items-center text-text-primary">
        <Lock size={18} aria-hidden className="mb-2 text-text-secondary" />
        <p className="text-[17px] font-medium text-text-secondary">{formatLongDate(clock.date)}</p>
        <p className="tabular text-[84px] font-semibold leading-[92px] tracking-tight">{clock.time}</p>
      </div>

      <div className="mt-6 flex flex-col gap-2">
        {activity ? (
          <div className="system-glass rounded-xl border border-border-subtle p-4" role="status" aria-label={`Atividade ao vivo: ${activity.detail}`}>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-caption text-gold-200">
                <Sparkles size={14} aria-hidden /> Protagon
              </span>
              <span
                className={cn(
                  'flex items-center gap-1 text-caption',
                  activity.tone === 'live' ? 'text-live' : activity.tone === 'warning' ? 'text-warning' : 'text-gold-200',
                )}
              >
                {activity.tone === 'live' ? <Radio size={14} aria-hidden /> : <Clock size={14} aria-hidden />}
                {activity.label}
              </span>
            </div>
            <p className="mt-2 text-[17px] font-semibold leading-6 text-text-primary">{activity.detail}</p>
            <p className="text-body text-text-secondary">{activity.extra}</p>
          </div>
        ) : null}

        {recent.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() => unlockTo(true)}
            className="system-glass flex items-start gap-3 rounded-xl border border-border-subtle p-3 text-left"
          >
            <NotificationIcon category={n.category} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[15px] font-semibold text-text-primary">{n.title}</span>
                <span className="tabular shrink-0 text-caption text-text-tertiary">{n.time}</span>
              </span>
              <span className="mt-0.5 block text-body text-text-secondary">{n.body}</span>
            </span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => unlockTo(false)}
        className="mt-auto self-center rounded-pill px-4 py-3 text-label-sm text-text-secondary"
      >
        Toque para desbloquear
      </button>
    </motion.div>
  );
}
