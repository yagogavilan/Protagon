import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Fundo da prévia com cadeado (F2): cards ABSTRATOS gerados aqui, sem nenhum nome, empresa ou rosto no DOM.
 * O blur é só estético; não há dado real por baixo para "desborrar". aria-hidden.
 */
function AbstractCards({ count, compact }: { count: number; compact?: boolean }) {
  const widths = [['w-2/3', 'w-1/2', 'w-5/6'], ['w-1/2', 'w-3/4', 'w-2/3'], ['w-3/4', 'w-2/5', 'w-1/2']];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="flex flex-col gap-3 p-3 blur-locked">
        {Array.from({ length: count }, (_, i) => {
          const w = widths[i % widths.length] ?? widths[0]!;
          return (
            <div
              key={i}
              className={cn('rounded-lg border border-border-subtle bg-surface-2 p-4', compact ? 'p-3' : 'p-4')}
              style={{ transform: `translateX(${(i % 2 === 0 ? -1 : 1) * 8}px) rotate(${(i - 1) * 1.5}deg)` }}
            >
              <div className="h-5 w-24 rounded-pill bg-gradient-gold" />
              <div className={cn('mt-3 h-4 rounded-sm bg-text-secondary', w[0])} />
              <div className={cn('mt-2 h-3 rounded-sm bg-border-strong', w[1])} />
              {!compact ? (
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-pill bg-gold-200" />
                  <div className={cn('h-3 rounded-sm bg-text-secondary', w[2])} />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <div className="absolute inset-0 bg-locked" />
    </div>
  );
}

/** LockedPreview `tab` (C00): prévia (150, não 240: o CTA precisa caber sem rolar) e painel sólido sobreposto em -48. */
export function LockedPreviewTab({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="relative h-[150px] overflow-hidden rounded-lg">
        <AbstractCards count={3} />
      </div>
      <div className="relative -mt-12 mx-2">{children}</div>
    </div>
  );
}

/** LockedPreview `tile` (Home do Executivo): único card com cadeado da Home. */
export function LockedPreviewTile({
  title,
  text,
  actionLabel,
  onPress,
  pressLabel,
}: {
  title: string;
  text: string;
  actionLabel: string;
  onPress: () => void;
  pressLabel: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border-subtle bg-surface-1 shadow-card has-[>button:active]:scale-press">
      <button type="button" onClick={onPress} aria-label={pressLabel} className="absolute inset-0 z-10 rounded-lg" />
      <div className="relative h-[92px]">
        <AbstractCards count={2} compact />
      </div>
      <div className="relative bg-surface-2 p-card">
        <p className="flex items-center gap-2 text-body-strong text-text-primary">
          <Lock size={18} aria-hidden className="text-gold-200" /> {title}
        </p>
        <p className="mt-1 text-body text-text-secondary">{text}</p>
        <p className="mt-2 flex min-h-touch items-center text-body-strong text-gold-200">{actionLabel}</p>
      </div>
    </div>
  );
}
