import { Gem } from 'lucide-react';
import type { Tier } from '@/data/types';
import { cn } from '@/lib/cn';

export const TIER_LABEL: Record<Tier, string> = {
  executivo: 'Executivo',
  vip: 'VIP',
  diamond: 'Diamond',
};

const bg: Record<Tier, string> = {
  executivo: 'bg-tier-executivo',
  vip: 'bg-tier-vip',
  diamond: 'bg-tier-diamond',
};

/** Selo do ingresso. Texto sempre #020111 sobre o fundo do tier. */
export function TierBadge({ tier, size = 'md', className }: { tier: Tier; size?: 'sm' | 'md'; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-pill font-semibold text-on-gold',
        size === 'sm' ? 'px-2 py-0.5 text-caption' : 'px-3 py-1 text-caption',
        bg[tier],
        className,
      )}
    >
      {tier === 'diamond' ? <Gem aria-hidden size={12} strokeWidth={2.5} /> : null}
      {TIER_LABEL[tier]}
    </span>
  );
}
