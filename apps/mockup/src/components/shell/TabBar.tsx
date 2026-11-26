import { CircleUserRound, FolderOpen, Lock, Route, Sparkles, Users, type LucideIcon } from 'lucide-react';
import { useDemo, type TabId } from '@/state/store';
import { countersVisible, usePendingRequests } from '@/lib/connections';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';

export const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: 'agora', label: 'Agora', Icon: Sparkles },
  { id: 'trilha', label: 'Trilha', Icon: Route },
  { id: 'conexoes', label: 'Conexões', Icon: Users },
  { id: 'materiais', label: 'Materiais', Icon: FolderOpen },
  { id: 'eu', label: 'Eu', Icon: CircleUserRound },
];

/**
 * TabBar (design-system §TabBar): 64 + safe area 34, glass.nav (alpha 0,84, F6), ativo gold.200 com
 * indicador 32×4 gold.500. Executivo: cadeado sobre o ícone de Conexões. VIP: badge de pedidos só fora da palestra.
 */
export function TabBar() {
  const tab = useDemo((s) => s.tab);
  const tier = useDemo((s) => s.tier);
  const moment = useDemo((s) => s.moment);
  const active = useDemo((s) => s.connectionsActive);
  const setTab = useDemo((s) => s.setTab);
  const pending = usePendingRequests().length;
  const showBadge = tier !== 'executivo' && active && countersVisible(moment) && moment !== 'after' && pending > 0;

  return (
    <nav aria-label="Navegação principal" className="glass-nav absolute inset-x-0 bottom-0 z-tabbar border-t border-border-subtle pb-[34px]">
      <ul className="flex h-tabbar items-stretch" role="tablist">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = id === tab;
          const locked = id === 'conexoes' && tier === 'executivo';
          const badge = id === 'conexoes' && showBadge ? pending : 0;
          const a11y = locked ? `${label}, bloqueado no seu ingresso` : badge ? `${label}, ${badge} pedidos` : label;
          return (
            <li key={id} className="flex flex-1">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={a11y}
                onClick={() => {
                  if (id !== tab) haptic('selection', `aba ${label}`);
                  setTab(id);
                }}
                className={cn(
                  'relative flex w-full flex-col items-center justify-center gap-1 text-caption',
                  isActive ? 'text-gold-200' : 'text-text-secondary',
                )}
              >
                {isActive ? <span aria-hidden className="absolute top-0 h-1 w-8 rounded-pill bg-gold-500" /> : null}
                <span className="relative" aria-hidden>
                  <Icon size={24} strokeWidth={isActive ? 2.25 : 1.75} />
                  {locked ? (
                    <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-pill bg-bg">
                      <Lock size={12} className="text-gold-200" strokeWidth={2.5} />
                    </span>
                  ) : null}
                  {badge ? (
                    <span className="tabular absolute -right-3 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger px-1 text-caption font-semibold leading-none text-on-gold">
                      {badge}
                    </span>
                  ) : null}
                </span>
                <span aria-hidden>{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
