import { cn } from '@/lib/cn';

export interface SegmentItem<T extends string> {
  id: T;
  label: string;
  count?: number;
  countLabel?: string;
}

/** Sub-navegação segmentada (C02): pill surface.1, ativo surface.3 + text.primary, contador tabular. */
export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  label,
}: {
  items: SegmentItem<T>[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="no-scrollbar flex gap-0.5 overflow-x-auto rounded-pill border border-border-subtle bg-surface-1 p-1">
      {items.map((it) => {
        const active = it.id === value;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={it.count ? `${it.label}, ${it.countLabel ?? it.count}` : it.label}
            onClick={() => onChange(it.id)}
            className={cn(
              'flex h-10 shrink-0 grow items-center justify-center gap-1.5 whitespace-nowrap rounded-pill px-1.5 text-caption font-semibold',
              'transition-colors duration-fast ease-protagon',
              active ? 'bg-surface-3 text-text-primary' : 'text-text-secondary',
            )}
          >
            <span aria-hidden>{it.label}</span>
            {it.count ? (
              <span aria-hidden className="tabular rounded-pill bg-tint-gold px-1.5 text-gold-200">
                {it.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
