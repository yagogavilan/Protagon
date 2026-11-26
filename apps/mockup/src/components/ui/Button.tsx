import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  block?: boolean;
  icon?: ReactNode;
}

// primary: gradiente verde com texto #020111 (regra inviolável 6)
const variants: Record<Variant, string> = {
  primary: 'bg-gradient-cta text-on-cta font-semibold shadow-glow-live disabled:shadow-none',
  secondary: 'bg-surface-2 text-text-primary border border-border-subtle font-semibold',
  ghost: 'bg-transparent text-gold-200 font-semibold',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', block, icon, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-pill px-5 text-body',
        'transition-[transform,opacity] duration-fast ease-protagon active:scale-[0.98]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
});
