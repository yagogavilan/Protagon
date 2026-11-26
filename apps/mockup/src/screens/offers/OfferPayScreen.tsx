import { CircleAlert, Globe, Lock } from 'lucide-react';
import { OverlayHeader } from '@/components/shell/OverlayHeader';
import { Button } from '@/components/ui/Button';
import { TIER_LABEL } from '@/components/ui/TierBadge';
import type { OfferId } from '@/data/offerTypes';
import { formatBRL } from '@/lib/offers';
import { useFeatures } from '@/state/features';
import { useDemo } from '@/state/store';

/**
 * Pagamento externo simulado (Hotmart, no navegador do sistema). Nenhum pagamento é feito. SEC-028: ao voltar, o app
 * NÃO afirma a compra; só mostra "Estamos confirmando" até a confirmação do servidor (no app real, o webhook).
 */
export function OfferPayScreen() {
  const id = useDemo((s) => s.overlayId) as OfferId | undefined;
  const tier = useDemo((s) => s.tier);
  const online = useDemo((s) => s.online);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const offer = useFeatures((s) => (id ? s.offerData[id] : undefined));
  const startPurchase = useFeatures((s) => s.startPurchase);
  const price = offer?.prices[tier];
  if (!id || !offer || !price) return null;

  return (
    <div className="flex h-full flex-col bg-bg">
      <OverlayHeader title="Pagamento" onBack={closeOverlay} backLabel="Voltar" />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-margin pb-6">
        <p className="flex items-center gap-2 rounded-md border border-tint-border-warning bg-tint-warning px-3 py-2 text-body-strong text-warning" role="note">
          <CircleAlert size={20} aria-hidden /> Simulação: nenhum pagamento é feito
        </p>
        <p className="flex items-center gap-2 rounded-md border border-border-subtle bg-surface-1 px-3 py-2 text-body text-text-secondary">
          <Lock size={16} aria-hidden className="shrink-0 text-live" />
          <Globe size={16} aria-hidden className="shrink-0" />
          <span className="min-w-0 truncate">pagamento.hotmart.exemplo/protagon</span>
        </p>
        <section className="rounded-lg border border-border-gold bg-surface-2 p-5 shadow-card">
          <h2 className="text-h2 text-text-primary">{offer.name}</h2>
          <p className="mt-1 text-caption text-text-secondary">Condição do evento ({TIER_LABEL[tier]})</p>
          <p className="tabular mt-2 text-display text-text-primary">
            {price.installments}x de {formatBRL(price.installment)}
          </p>
          <p className="tabular text-body text-text-primary">Total parcelado: {formatBRL(price.total)}</p>
          <p className="tabular text-body text-text-primary">À vista no PIX: {formatBRL(price.cash)}</p>
        </section>
        <p className="text-body text-text-secondary">No app real, a compra só aparece como confirmada depois que a Hotmart avisa o Protagon. O app nunca marca a compra sozinho.</p>
        <div className="mt-auto flex flex-col gap-2">
          <Button
            block
            disabled={!online}
            onClick={() => {
              startPurchase(id, true);
              closeOverlay();
            }}
          >
            Simular pagamento concluído
          </Button>
          <Button
            block
            variant="secondary"
            onClick={() => {
              startPurchase(id, false);
              closeOverlay();
            }}
          >
            Voltar ao app
          </Button>
          {!online ? <p className="text-center text-body text-text-secondary">Precisa de internet</p> : null}
        </div>
      </div>
    </div>
  );
}
