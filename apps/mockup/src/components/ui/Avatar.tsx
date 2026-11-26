import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';

const SIZE = { sm: 'h-8 w-8 text-caption', md: 'h-12 w-12 text-body-strong', lg: 'h-[72px] w-[72px] text-h2' } as const;

/**
 * Avatar (design-system §Avatar). O mockup não tem fotos: iniciais em surface.3.
 * Anéis: live (palestrante ao vivo), gold (conexão aceita). Diamond não ganha anel.
 */
export function Avatar({
  name,
  size = 'md',
  ring = 'none',
  decorative = true,
}: {
  name: string;
  size?: keyof typeof SIZE;
  ring?: 'none' | 'live' | 'gold';
  decorative?: boolean;
}) {
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-pill',
        ring === 'live' && 'p-[2px] ring-2 ring-live ring-offset-0',
        ring === 'gold' && 'p-[2px] ring-2 ring-gold-500',
      )}
    >
      <span className={cn('flex items-center justify-center rounded-pill bg-surface-3 font-semibold text-text-primary', SIZE[size])}>
        {initials(name)}
      </span>
    </span>
  );
}
