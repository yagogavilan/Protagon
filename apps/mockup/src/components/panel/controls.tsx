import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function PanelSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-caption uppercase tracking-[0.16em] text-text-tertiary">{title}</h2>
      {children}
    </section>
  );
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
  columns = 3,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  columns?: 2 | 3;
}) {
  return (
    <div role="radiogroup" aria-label={label} className={cn('grid gap-1.5', columns === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'min-h-[44px] rounded-md border px-2 text-[14px] font-semibold transition-colors duration-fast ease-protagon',
              active
                ? 'border-gold-200 bg-surface-3 text-text-primary shadow-glow-gold'
                : 'border-border-subtle bg-surface-1 text-text-secondary hover:text-text-primary',
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex min-h-[48px] w-full items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface-1 px-3 text-left"
    >
      <span className="flex flex-col">
        <span className="text-[15px] font-semibold text-text-primary">{label}</span>
        {hint ? <span className="text-caption text-text-tertiary">{hint}</span> : null}
      </span>
      <span
        aria-hidden
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-pill border transition-colors duration-base ease-protagon',
          checked ? 'border-transparent bg-gradient-cta' : 'border-border-strong bg-surface-2',
        )}
      >
        <span
          className={cn(
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-pill transition-[left] duration-base ease-protagon',
            checked ? 'left-[24px] bg-on-cta' : 'left-[3px] bg-text-secondary',
          )}
        />
      </span>
    </button>
  );
}
