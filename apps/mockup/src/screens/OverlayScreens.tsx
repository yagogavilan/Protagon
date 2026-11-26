import { Check, CircleAlert, MapPin, ScanLine, Store } from 'lucide-react';
import { OverlayHeader } from '@/components/shell/OverlayHeader';
import { Button } from '@/components/ui/Button';
import { TierBadge } from '@/components/ui/TierBadge';
import { useDemo } from '@/state/store';
import { boothLocation, connectionPoints, edition } from '@/data/edition';
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

/** Mapa (A04) provisório: o mapa completo é da Etapa 3. Mostra o foco pedido (setor ou estande). */
export function MapScreen() {
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const focus = useDemo((s) => s.mapFocus);
  const tier = useDemo((s) => s.tier);
  return (
    <div className="flex h-full flex-col bg-bg">
      <OverlayHeader title="Mapa" onBack={closeOverlay} />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-margin pb-10">
        <div className="rounded-lg border border-dashed border-border-strong p-4">
          <p className="text-caption uppercase tracking-[0.16em] text-gold-200">Em desenho</p>
          <p className="mt-1 text-body text-text-secondary">A04 Mapa completo na Etapa 3.</p>
        </div>
        <section className="rounded-lg border border-border-gold bg-surface-2 p-5 shadow-card">
          {focus === 'booth' ? (
            <>
              <Store size={24} aria-hidden className="text-gold-500" />
              <p className="mt-2 text-h2 text-text-primary">Estande Protagon</p>
              <p className="text-body text-text-secondary">{boothLocation}. O time explica o upgrade e tira suas dúvidas.</p>
            </>
          ) : (
            <>
              <MapPin size={24} aria-hidden className="text-gold-500" />
              <p className="mt-2 text-h2 text-text-primary">{edition.sectorByTier[tier]}</p>
              <p className="text-body text-text-secondary">Você está na Plenária. {edition.venue.name}.</p>
            </>
          )}
        </section>
        {tier !== 'executivo' ? (
          <ul className="flex flex-col gap-2">
            {connectionPoints.map((p) => (
              <li key={p.id} className="flex items-center gap-3 rounded-md border border-border-subtle bg-surface-1 p-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-tint-gold text-body-strong text-gold-200">{p.id}</span>
                <span className="text-body text-text-primary">{p.where}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

/** C10 Ler QR provisório: câmera simulada. Executivo cai em C00. */
export function QrScanScreen() {
  const closeOverlay = useDemo((s) => s.closeOverlay);
  return (
    <div className="flex h-full flex-col bg-bg">
      <OverlayHeader title="Ler QR" onBack={closeOverlay} />
      <div className="flex flex-1 flex-col items-center gap-4 px-margin pb-10 pt-6 text-center">
        <div className="flex h-64 w-64 items-center justify-center rounded-xl border-2 border-gold-500">
          <ScanLine size={64} aria-hidden className="text-gold-200" />
        </div>
        <p className="text-body text-text-primary">Aponte para o QR da credencial da outra pessoa.</p>
        <p className="text-caption text-text-secondary">Os dois confirmam a conexão. Pedidos pelo QR não contam no limite do dia.</p>
        <p className="text-caption text-text-secondary">C10 completo na Etapa 3.</p>
      </div>
    </div>
  );
}
