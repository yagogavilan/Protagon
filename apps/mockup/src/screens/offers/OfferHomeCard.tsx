import { BadgeCheck, Check, Megaphone } from 'lucide-react';
import { BentoTile } from '@/components/ui/BentoTile';
import { Button } from '@/components/ui/Button';
import { countdownText, deadlineText, spokenCountdown } from '@/lib/offers';
import { useClock, useDemo } from '@/state/store';
import { useOffers, type OfferView } from './useOffers';

/** OF01 · Itens da Home. Só aparece depois da liberação e só para quem tem a oferta no ingresso. Nunca cadeado. */
export function useHomeOffers(): OfferView[] {
  const clock = useClock();
  return useOffers().filter((v) => v.phase === 'active' || v.phase === 'interest' || (v.phase === 'confirmed' && v.state.purchaseDay === clock.dayIndex));
}

export function OfferHomeCard() {
  const views = useHomeOffers();
  const openOverlay = useDemo((s) => s.openOverlay);
  if (views.length === 0) return null;

  // Duas ofertas: um card só, que leva à lista
  if (views.length > 1) {
    const fresh = views.some((v) => !v.state.viewed);
    return (
      <BentoTile
        variant={fresh ? 'emphasis' : 'default'}
        icon={<Megaphone size={16} className="text-gold-500" />}
        heading="Ofertas do evento"
        onPress={() => openOverlay('offerList')}
        pressLabel="2 ofertas do palco. Ver ofertas"
      >
        <p className="text-h2 text-text-primary">2 ofertas do palco</p>
        <p className="mt-2 flex min-h-touch items-center text-body-strong text-gold-200">Ver ofertas</p>
      </BentoTile>
    );
  }

  const v = views[0]!;
  const open = () => openOverlay('offer', v.offer.id);
  // Liberada e ainda não vista: card de destaque
  if (v.phase === 'active' && !v.state.viewed) {
    return (
      <BentoTile variant="emphasis" icon={<BadgeCheck size={16} className="text-gold-500" />} heading="Oferta especial do palco">
        <p className="text-h2 text-text-primary">{v.offer.name}</p>
        <p className="tabular mt-1 text-body-strong text-text-primary">
          Condição válida até {deadlineText(v.offer)}
        </p>
        <p className="tabular text-body text-text-secondary" aria-label={spokenCountdown(v.minutes)}>
          <span aria-hidden>{countdownText(v.minutes)}</span>
        </p>
        <Button block className="mt-3" onClick={open}>
          Ver oferta
        </Button>
      </BentoTile>
    );
  }

  // Vista, "Agora não", interesse enviado ou compra confirmada: tile discreto, sem destaque
  const line =
    v.phase === 'confirmed' ? `${v.offer.name} · compra confirmada` : v.phase === 'interest' ? `${v.offer.name} · interesse enviado` : `${v.offer.name} · até ${deadlineText(v.offer)}`;
  return (
    <BentoTile icon={<Megaphone size={16} className="text-gold-500" />} heading="Ofertas do evento" onPress={open} pressLabel={`Ofertas do evento: ${line}. Abrir`}>
      <p className="flex items-center gap-2 text-body-strong text-text-primary">
        {v.phase === 'confirmed' || v.phase === 'interest' ? <Check size={18} aria-hidden className="shrink-0 text-live" /> : null}
        {line}
      </p>
    </BentoTile>
  );
}
