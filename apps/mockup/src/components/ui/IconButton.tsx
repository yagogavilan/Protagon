import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  badge?: number;
}

/** Botão só com ícone: alvo de 44px e rótulo acessível obrigatório */
export function IconButton({ label, children, badge, className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={badge ? `${label}, ${badge} não lidas` : label}
      className={cn(
        'relative inline-flex h-11 w-11 items-center justify-center rounded-pill border border-border-subtle bg-surface-1 text-text-primary',
        'transition-transform duration-fast ease-protagon active:scale-95',
        className,
      )}
      {...rest}
    >
      {children}
      {badge ? (
        <span
          aria-hidden
          className="tabular absolute -right-0.5 -top-0.5 min-w-[20px] rounded-pill bg-danger px-1.5 text-center text-[11px] font-bold leading-5 text-bg"
        >
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}
