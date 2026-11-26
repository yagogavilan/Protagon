import { Check, CircleAlert } from 'lucide-react';
import { OverlayHeader } from '@/components/shell/OverlayHeader';
import { Button } from '@/components/ui/Button';
import { TierBadge } from '@/components/ui/TierBadge';
import { useDemo } from '@/state/store';
import { edition } from '@/data/edition';
import { haptic } from '@/lib/haptics';

/** Checkout simulado (D3, saída 1). Faixa obrigatória: "Simulação: nenhum pagamento é feito". */
export function CheckoutScreen() {
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const upgradeToVip = useDemo((s) => s.upgradeToVip);
  const online = useDemo((s) => s.online);
  return (
    <div className="flex h-full flex-col bg-bg">
      <OverlayHeader title="Upgrade" onBack={closeOverlay} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-margin pb-10">
        <p className="flex items-center gap-2 rounded-md border border-tint-border-warning bg-tint-warning px-3 py-2 text-body-strong text-warning" role="note">
          <CircleAlert size={20} aria-hidden /> Simulação: nenhum pagamento é feito
        </p>
        <section className="rounded-lg border border-border-gold bg-surface-2 p-5 shadow-card">
          <div className="flex items-center gap-2">
            <TierBadge tier="executivo" />
            <span className="text-body text-text-secondary">para</span>
            <TierBadge tier="vip" />
          </div>
          <h2 className="mt-3 text-h2 text-text-primary">Ingresso VIP · {edition.name}</h2>
          <ul className="mt-3 flex flex-col gap-2 text-body text-text-primary">
            {['Conexões com sugestões por afinidade', 'Até 15 pedidos por dia', 'Encontros nos Pontos de Conexão', 'Setor VIP na plenária'].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check size={20} aria-hidden className="mt-0.5 shrink-0 text-live" />
                {t}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-caption text-text-secondary">Valor e forma de pagamento: decisão da diretoria.</p>
        </section>
        <div className="mt-auto">
          <Button
            block
            disabled={!online}
            onClick={() => {
              haptic('success', 'upgrade simulado');
              upgradeToVip();
            }}
          >
            Simular upgrade para VIP
          </Button>
          {!online ? <p className="mt-2 text-center text-caption text-text-secondary">Precisa de internet</p> : null}
        </div>
      </div>
    </div>
  );
}
