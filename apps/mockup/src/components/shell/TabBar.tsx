import { CircleUserRound, FolderOpen, Lock, Route, Sparkles, Users, type LucideIcon } from 'lucide-react';
import { useDemo, type TabId } from '@/state/store';
import { cn } from '@/lib/cn';

export const TABS: { id: TabId; label: string; Icon: LucideIcon }[] = [
  { id: 'agora', label: 'Agora', Icon: Sparkles },
  { id: 'trilha', label: 'Trilha', Icon: Route },
  { id: 'conexoes', label: 'Conexões', Icon: Users },
  { id: 'materiais', label: 'Materiais', Icon: FolderOpen },
  { id: 'eu', label: 'Eu', Icon: CircleUserRound },
];

/** Tab bar com vidro (um dos dois únicos lugares com blur). Cadeado em Conexões para o Executivo. */
export function TabBar() {
  const tab = useDemo((s) => s.tab);
  const tier = useDemo((s) => s.tier);
  const setTab = useDemo((s) => s.setTab);

  return (
    <nav
      aria-label="Navegação principal"
      className="glass-nav absolute inset-x-0 bottom-0 z-20 border-t border-border-subtle pb-[26px] pt-2"
    >
      <ul className="flex justify-around px-2" role="tablist">
        {TABS.map(({ id, label, Icon }) => {
          const active = id === tab;
          const locked = id === 'conexoes' && tier === 'executivo';
          return (
            <li key={id} className="flex-1">
              <button
                type="button"
                role="tab"
                aria-selected={active}
                aria-label={locked ? `${label}, disponível para VIP e Diamond` : label}
                onClick={() => setTab(id)}
                className={cn(
                  'flex min-h-[48px] w-full flex-col items-center justify-center gap-1 rounded-md text-[12px] font-medium leading-4',
                  'transition-colors duration-fast ease-protagon',
                  active ? 'text-text-primary' : 'text-text-secondary',
                )}
              >
                <span className="relative">
                  <Icon size={24} aria-hidden className={active ? 'text-gold-200' : undefined} strokeWidth={active ? 2.25 : 1.75} />
                  {locked ? (
                    <span className="absolute -bottom-1 -right-2 flex h-4 w-4 items-center justify-center rounded-pill border border-border-subtle bg-surface-2">
                      <Lock size={10} aria-hidden className="text-gold-200" />
                    </span>
                  ) : null}
                </span>
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
