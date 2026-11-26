import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

export type BannerTone = 'info' | 'warning' | 'live';

const toneClass: Record<BannerTone, { box: string; icon: string }> = {
  info: { box: 'bg-tint-info border-tint-border-info', icon: 'text-info' },
  warning: { box: 'bg-tint-warning border-tint-border-warning', icon: 'text-warning' },
  live: { box: 'bg-tint-live border-tint-border-live', icon: 'text-live' },
};

interface StatusBannerProps {
  tone: BannerTone;
  icon: ReactNode;
  title: string;
  text?: ReactNode;
  /** Ação ghost à direita */
  action?: { label: string; onClick: () => void };
  /** Banner inteiro tocável, com chevron */
  onPress?: () => void;
  pressLabel?: string;
  alert?: boolean;
}

/** StatusBanner (design-system §StatusBanner): fundo tint 14%, borda 35%, ícone 24, mín. 56. Sem blur. */
export function StatusBanner({ tone, icon, title, text, action, onPress, pressLabel, alert }: StatusBannerProps) {
  const t = toneClass[tone];
  const content = (
    <>
      <span className={cn('mt-0.5 shrink-0', t.icon)} aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-body-strong text-text-primary">{title}</span>
        {text ? <span className="block text-body text-text-secondary">{text}</span> : null}
      </span>
    </>
  );
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
      role={alert ? 'alert' : 'status'}
      className={cn('min-h-[56px] rounded-md border', t.box)}
    >
      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          aria-label={pressLabel}
          className="flex w-full items-start gap-3 rounded-md px-4 py-3 transition-transform duration-fast active:scale-press"
        >
          {content}
          <ChevronRight size={20} aria-hidden className="mt-0.5 shrink-0 text-text-secondary" />
        </button>
      ) : (
        <div className="flex items-start gap-3 px-4 py-3">
          {content}
          {action ? (
            <button
              type="button"
              onClick={action.onClick}
              className="-my-1 min-h-touch shrink-0 self-center rounded-md px-2 text-body-strong text-gold-200 active:bg-surface-3"
            >
              {action.label}
            </button>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
