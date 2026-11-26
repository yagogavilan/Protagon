import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

/** Cabeçalho de telas que abrem por cima das abas: Voltar à esquerda, título ao centro, ação à direita */
export function OverlayHeader({ title, onBack, action, backLabel = 'Voltar' }: { title: string; onBack: () => void; action?: ReactNode; backLabel?: string }) {
  return (
    <header className={`grid ${action ? 'grid-cols-[104px_1fr_104px]' : 'grid-cols-[88px_1fr_88px]'} items-center gap-1 px-3 pb-2 pt-[58px]`}>
      <button
        type="button"
        onClick={onBack}
        className="flex h-12 items-center gap-0.5 justify-self-start rounded-pill pr-2 text-body text-text-secondary active:bg-surface-3"
      >
        <ChevronLeft size={22} aria-hidden /> {backLabel}
      </button>
      <h1 tabIndex={-1} className="line-clamp-2 text-center text-h2 text-text-primary outline-none">{title}</h1>
      <div className="flex justify-end whitespace-nowrap">{action}</div>
    </header>
  );
}
