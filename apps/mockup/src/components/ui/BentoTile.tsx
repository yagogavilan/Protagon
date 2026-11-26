import type { ReactNode } from 'react';
import { Pin } from 'lucide-react';
import { cn } from '@/lib/cn';

type TileVariant = 'default' | 'emphasis' | 'pinned';

interface BentoTileProps {
  variant?: TileVariant;
  /** Cabeçalho opcional: ícone 16 + rótulo caption */
  icon?: ReactNode;
  heading?: string;
  /** Torna o card inteiro tocável, com um rótulo único (ações internas seguem alcançáveis) */
  onPress?: () => void;
  pressLabel?: string;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Card / BentoTile (design-system §Card). O alvo do card inteiro é um <button> por baixo do conteúdo;
 * ações internas usam a classe "pointer-events-auto" para continuar tocáveis.
 */
export function BentoTile({ variant = 'default', icon, heading, onPress, pressLabel, disabled, className, children }: BentoTileProps) {
  const pressable = Boolean(onPress) && !disabled;
  return (
    <div
      className={cn(
        'relative rounded-lg border p-card shadow-card transition-[transform,background-color] duration-fast ease-protagon',
        variant === 'emphasis' ? 'border-border-gold bg-surface-2' : 'border-border-subtle bg-surface-1',
        pressable && 'has-[>button:active]:scale-press has-[>button:active]:bg-surface-3',
        className,
      )}
    >
      {pressable ? (
        <button type="button" aria-label={pressLabel} onClick={onPress} className="absolute inset-0 rounded-lg" />
      ) : null}
      <div className={cn('relative flex h-full flex-col', pressable && 'pointer-events-none')}>
        {heading ? (
          <p className="mb-2 flex items-center gap-1.5 text-caption text-text-secondary">
            {variant === 'pinned' ? <Pin size={16} aria-hidden className="text-gold-500" /> : icon}
            {heading}
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
