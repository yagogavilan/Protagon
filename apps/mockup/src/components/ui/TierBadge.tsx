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

/** Selo do ingresso (design-system §TierBadge): pill 22, caption 600, texto #020111. Não é tocável. */
export function TierBadge({ tier, className }: { tier: Tier; className?: string }) {
  return (
    <span
      role="img"
      aria-label={`Ingresso ${TIER_LABEL[tier]}`}
      className={cn(
        'inline-flex h-[22px] shrink-0 items-center gap-1 rounded-pill px-2 text-caption font-semibold text-on-gold',
        bg[tier],
        className,
      )}
    >
      {tier === 'diamond' ? <Gem aria-hidden size={12} strokeWidth={2.5} /> : null}
      <span aria-hidden>{TIER_LABEL[tier]}</span>
    </span>
  );
}
