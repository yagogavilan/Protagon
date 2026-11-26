import type { ReactNode } from 'react';

/** Tela provisória: a versão final vem da spec do product-designer (docs/design/telas/). */
export function PlaceholderScreen({ codes, children }: { codes: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 px-margin">
      <div className="rounded-lg border border-dashed border-border-strong p-4">
        <p className="text-caption uppercase tracking-[0.16em] text-gold-200">Em desenho</p>
        <p className="mt-1 text-body text-text-secondary">
          Telas {codes}. A versão final entra a partir da spec do design.
        </p>
      </div>
      {children}
    </div>
  );
}

export function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="card flex flex-col gap-1 p-4">
      <span className="text-caption text-text-tertiary">{label}</span>
      <span className="text-body text-text-primary">{value}</span>
    </div>
  );
}
