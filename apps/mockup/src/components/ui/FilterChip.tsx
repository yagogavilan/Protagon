import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Chip de filtro selecionável (design-system §Chip): altura 36, alvo 48, borda strong; selecionado = borda gold + check. */
export function FilterChip({ selected, onClick, children, className }: { selected: boolean; onClick: () => void; children: ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn('relative flex min-h-touch shrink-0 items-center', className)}
    >
      <span
        className={cn(
          'flex h-9 items-center gap-1.5 rounded-pill border px-3 text-[15px] transition-colors duration-fast',
          selected ? 'border-gold-500 bg-tint-gold text-text-primary' : 'border-border-strong text-text-secondary',
        )}
      >
        {selected ? <Check size={14} aria-hidden strokeWidth={3} className="text-gold-200" /> : null}
        {children}
      </span>
    </button>
  );
}
