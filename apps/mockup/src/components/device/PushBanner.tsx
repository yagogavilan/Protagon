import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useDemo } from '@/state/store';
import { NotificationIcon } from '@/components/shell/NotificationIcon';
import { vibrate } from '@/lib/format';

/** Push simulado no topo da moldura (app em uso). Some sozinho em 5 s; tocar abre Notificações. */
export function PushBanner() {
  const push = useDemo((s) => s.push);
  const locked = useDemo((s) => s.locked);
  const auth = useDemo((s) => s.auth);
  const dismissPush = useDemo((s) => s.dismissPush);
  const openOverlay = useDemo((s) => s.openOverlay);

  const visible = push && !locked;

  useEffect(() => {
    if (!visible) return;
    vibrate(30);
    const t = window.setTimeout(dismissPush, 5000);
    return () => window.clearTimeout(t);
  }, [visible, push?.id, dismissPush]);

  return (
    <div className="pointer-events-none absolute inset-x-2 top-[54px] z-50" aria-live="polite">
      <AnimatePresence>
        {visible ? (
          <motion.button
            key={push.id}
            type="button"
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={() => {
              dismissPush();
              if (auth === 'app') openOverlay('notifications');
            }}
            className="glass-nav pointer-events-auto flex w-full items-start gap-3 rounded-xl border border-border-subtle p-3 text-left shadow-card"
          >
            <NotificationIcon category={push.category} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-[15px] font-semibold text-text-primary">{push.title}</span>
                <span className="tabular shrink-0 text-caption text-text-tertiary">agora</span>
              </span>
              <span className="mt-0.5 block text-[14px] leading-5 text-text-secondary">{push.body}</span>
            </span>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
