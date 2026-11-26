import type { ReactNode } from 'react';

/** EmptyState (design-system §EmptyState): ícone de linha 48 gold.500, h2, texto e 1 botão. */
export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 pb-6 pt-10 text-center">
      <span className="text-gold-500" aria-hidden>
        {icon}
      </span>
      <h3 className="text-h2 text-text-primary">{title}</h3>
      <p className="text-body text-text-secondary">{text}</p>
      {action ? <div className="mt-2 w-full">{action}</div> : null}
    </div>
  );
}
