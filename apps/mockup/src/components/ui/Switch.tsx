import { cn } from '@/lib/cn';

/** Chave liga/desliga do app (alvo 48, rótulo + apoio). Sem cor sozinha: o estado também vai no texto lido. */
export function Switch({
  label,
  hint,
  checked,
  onChange,
  disabled,
  className,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex min-h-touch w-full items-center justify-between gap-3 rounded-md px-1 py-2 text-left active:bg-surface-3 disabled:opacity-50',
        className,
      )}
    >
      <span className="min-w-0">
        <span className="block text-body text-text-primary">{label}</span>
        {hint ? <span className="block text-caption text-text-secondary">{hint}</span> : null}
      </span>
      <span
        aria-hidden
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-pill border transition-colors duration-base ease-protagon',
          checked ? 'border-transparent bg-gradient-cta' : 'border-border-strong bg-surface-3',
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
