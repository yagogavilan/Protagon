import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
  badge?: number;
  /** 'plain' (sino) ou 'framed' (QR: surface.1 + borda dourada) */
  tone?: 'plain' | 'framed';
}

/** Botão só com ícone: alvo 48 e rótulo acessível obrigatório. Badge: círculo 18, danger, texto #020111. */
export function IconButton({ label, children, badge, tone = 'plain', className, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={badge ? `${label}, ${badge} não ${badge === 1 ? 'lida' : 'lidas'}` : label}
      className={cn(
        'relative inline-flex h-touch w-touch items-center justify-center rounded-md text-text-primary',
        'transition-[transform,background-color] duration-fast ease-protagon active:scale-press active:bg-surface-3',
        tone === 'framed' && 'border border-border-gold bg-surface-1',
        className,
      )}
      {...rest}
    >
      {children}
      {badge ? (
        <span
          aria-hidden
          className="tabular absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger px-1 text-caption font-semibold leading-none text-on-gold"
        >
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}
