import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { useDemo } from '@/state/store';
import { cn } from '@/lib/cn';

/** Toast (design-system §Toast): pílula surface.3, 12 acima da tab bar, 4 s (6 s com ação), um por vez. */
export function ToastHost({ bottom }: { bottom: number }) {
  const toast = useDemo((s) => s.toast);
  const hideToast = useDemo((s) => s.hideToast);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(hideToast, toast.action ? 6000 : 4000);
    return () => window.clearTimeout(t);
  }, [toast, hideToast]);

  const Icon = toast?.tone === 'warning' ? CircleAlert : toast?.tone === 'info' ? Info : CircleCheck;

  return (
    <div className="pointer-events-none absolute inset-x-margin z-toast flex justify-center" style={{ bottom }} role="status" aria-live="polite">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
            className="pointer-events-auto flex max-w-full items-center gap-2 rounded-pill border border-border-subtle bg-surface-3 py-1 pl-4 pr-2 shadow-card"
          >
            <Icon
              size={16}
              aria-hidden
              className={cn('shrink-0', toast.tone === 'warning' ? 'text-warning' : toast.tone === 'info' ? 'text-info' : 'text-live')}
            />
            <span className="min-w-0 py-2 text-body text-text-primary">{toast.text}</span>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action?.run();
                  hideToast();
                }}
                className="min-h-touch shrink-0 rounded-pill px-3 text-body-strong text-gold-200 active:bg-surface-2"
              >
                {toast.action.label}
              </button>
            ) : (
              <span className="w-2" />
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
