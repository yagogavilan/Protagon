import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'gold' | 'ghost' | 'destructive';
type Size = 'lg' | 'compact';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  icon?: ReactNode;
  loading?: boolean;
}

// design-system §Button. Primário: gradiente verde com texto #020111; desabilitado vira surface.3 + tertiary
// (nunca verde apagado que parece ativo).
const variants: Record<Variant, string> = {
  primary:
    'bg-gradient-cta text-on-cta active:bg-gradient-cta-pressed disabled:bg-none disabled:bg-surface-3 disabled:text-text-tertiary',
  secondary: 'border border-border-strong bg-transparent text-text-primary active:bg-surface-3 disabled:opacity-40',
  // Ação opcional ao lado de um primário (um verde por tela): contorno dourado
  gold: 'border border-border-gold bg-transparent text-gold-200 active:bg-surface-3 disabled:opacity-40',
  ghost: 'bg-transparent px-2 text-gold-200 active:bg-surface-3 disabled:opacity-40',
  destructive: 'border border-danger bg-transparent text-danger active:bg-tint-danger disabled:opacity-40',
};

const sizes: Record<Size, string> = {
  lg: 'min-h-button px-5',
  // 44 de altura visual; alvo de 48 garantido por min-h-touch
  compact: 'min-h-touch px-4',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'lg', block, icon, loading, className, children, type = 'button', disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex select-none items-center justify-center gap-2 rounded-md text-body-strong',
        'transition-[transform,background-color,opacity] duration-fast ease-protagon active:scale-press',
        'disabled:cursor-not-allowed disabled:active:scale-100',
        variants[variant],
        sizes[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <span className="invisible flex items-center gap-2" aria-hidden>
            {icon}
            {children}
          </span>
          <LoaderCircle size={20} aria-hidden className="absolute animate-spin" />
          <span className="sr-only">Enviando</span>
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
});
