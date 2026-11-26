import type { ReactNode } from 'react';
import { Check, Target } from 'lucide-react';
import { cn } from '@/lib/cn';

type ChipVariant = 'info' | 'common' | 'objective' | 'proposal';

/** Chip estático (design-system §Chip). Filtro e sub-navegação têm componentes próprios. */
export function Chip({ variant = 'info', children, className }: { variant?: ChipVariant; children?: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex h-7 shrink-0 items-center gap-1 rounded-sm px-2 text-caption',
        variant === 'info' && 'bg-surface-3 text-text-secondary',
        variant === 'common' && 'border border-gold-500 text-gold-200',
        variant === 'objective' && 'bg-tint-gold text-gold-200',
        variant === 'proposal' && 'border border-dashed border-border-strong text-text-secondary',
        className,
      )}
    >
      {variant === 'common' ? <Check size={12} aria-hidden strokeWidth={2.5} /> : null}
      {variant === 'objective' ? <Target size={16} aria-hidden /> : null}
      {variant === 'proposal' ? 'Proposta' : children}
    </span>
  );
}
