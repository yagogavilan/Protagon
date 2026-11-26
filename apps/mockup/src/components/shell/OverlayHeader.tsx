import { ChevronLeft } from 'lucide-react';
import type { ReactNode } from 'react';

/** Cabeçalho de telas que abrem por cima das abas (credencial, notificações) */
export function OverlayHeader({ title, onBack, action }: { title: string; onBack: () => void; action?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-2 px-3 pb-2 pt-[58px]">
      <button
        type="button"
        onClick={onBack}
        className="flex h-11 items-center gap-1 rounded-pill px-2 text-body text-text-secondary"
      >
        <ChevronLeft size={22} aria-hidden /> Voltar
      </button>
      <h1 className="text-h2 text-text-primary">{title}</h1>
      <div className="flex min-w-[88px] justify-end">{action}</div>
    </header>
  );
}
