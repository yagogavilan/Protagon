import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BadgeCheck, Check, CircleAlert, Info, MapPin, WifiOff } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { TIER_LABEL } from '@/components/ui/TierBadge';
import type { OfferId } from '@/data/offerTypes';
import { demoUser } from '@/data/participants';
import { formatHour } from '@/lib/clock';
import { countdownText, deadlineText, formatBRL, minutesLeft, spokenCountdown } from '@/lib/offers';
import { useFakeLoad } from '@/lib/useFakeLoad';
import { useFeatures } from '@/state/features';
import { useClock, useDemo } from '@/state/store';
import { InterestSheet } from './InterestSheet';
import { closedHour, isClosed, useOffer } from './useOffers';

/** SEC-023: aviso antifraude no rodapé da tela da oferta */
export const ANTIFRAUD = 'Ofertas do palco só aparecem aqui no app e no estande oficial. Não pague por links recebidos em grupos.';

function List({ items, mark }: { items: string[]; mark: 'check' | 'plus' }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((t) => (
        <li key={t} className="flex items-start gap-2 text-body text-text-primary">
          {mark === 'check' ? <Check size={20} aria-hidden className="mt-0.5 shrink-0 text-live" /> : <span aria-hidden className="mt-0 w-5 shrink-0 text-center text-gold-200">+</span>}
          {t}
        </li>
      ))}
    </ul>
  );
}

/**
 * OF02 · Tela da oferta. Preço só da categoria do aluno, preço total e parcelado antes do botão, prazo real sem
 * alarme, sem "restam N vagas". Estados: padrão, interesse enviado, compra em confirmação e concluída, condição
 * encerrada, não disponível para o ingresso (sem cadeado, sem preço), sem internet (QR do estande) e erro.
 */
export function OfferScreen() {
  const id = useDemo((s) => s.overlayId) as OfferId | undefined;
  const tier = useDemo((s) => s.tier);
  const online = useDemo((s) => s.online);
  const openOverlay = useDemo((s) => s.openOverlay);
  const openMap = useDemo((s) => s.openMap);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const setTab = useDemo((s) => s.setTab);
  const clock = useClock();
  const { offer, state } = useOffer(id);
  const simulateError = useFeatures((s) => s.simulateError);
  const setSheet = useFeatures((s) => s.setSheet);
  const markViewed = useFeatures((s) => s.markOfferViewed);
  const dismiss = useFeatures((s) => s.dismissOffer);
  const cancelInterest = useFeatures((s) => s.cancelInterest);
  const [attempt, setAttempt] = useState(0);
  const loading = useFakeLoad(450, attempt);

  const price = offer?.prices[tier];
  const released = Boolean(offer && state);

  // Oferta que não foi liberada responde como se não existisse: volta à Home, sem mensagem
  useEffect(() => {
    if (!released) setTab('agora');
  }, [released, setTab]);

  useEffect(() => {
    if (released && price && id) markViewed(id);
  }, [released, price, id, markViewed]);

  if (!released || !offer || !state || !id) return null;

  const openInterest = () => setSheet('offerInterest', true);

  /* ----- não disponível para o ingresso: nenhum dado da oferta é exibido ----- */
  if (!price) {
    return (
      <OverlayPage
        title="Oferta do palco"
        footer={
          <div className="flex flex-col gap-2">
            <Button block onClick={openInterest}>
              Falar com um consultor
            </Button>
            <Button block variant="ghost" onClick={closeOverlay}>
              Voltar
            </Button>
          </div>
        }
      >
        <div className="flex flex-col items-center gap-3 px-2 pt-10 text-center">
          <Info size={48} aria-hidden strokeWidth={1.5} className="text-gold-500" />
          <h2 className="text-h2 text-text-primary">Esta oferta não está disponível para o seu ingresso.</h2>
          <p className="text-body text-text-secondary">Se quiser entender suas opções, fale com um consultor.</p>
        </div>
        <InterestSheet />
      </OverlayPage>
    );
  }

  const closed = isClosed(offer, state, clock);
  const confirmed = state.purchase === 'confirmed';
  const confirming = state.purchase === 'confirming';
  const sent = Boolean(state.interestAt);

  /* ----- erro e carregando ----- */
  if (simulateError) {
    return (
      <OverlayPage title="Oferta do palco">
        <div role="alert" className="mt-4 flex flex-col gap-3 rounded-md border border-danger bg-surface-1 p-4">
          <p className="flex items-start gap-2 text-body text-text-primary">
            <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> Não conseguimos abrir a oferta. Tente de novo.
          </p>
          <Button size="compact" variant="secondary" className="self-start" onClick={() => setAttempt((n) => n + 1)}>
            Tentar de novo
          </Button>
        </div>
      </OverlayPage>
    );
  }
  if (loading) {
    return (
      <OverlayPage title="Oferta do palco">
        <div role="status" className="flex flex-col gap-3 pt-2">
          <p className="sr-only">Carregando a oferta</p>
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </div>
      </OverlayPage>
    );
  }

  /* ----- compra concluída (simulada) ----- */
  if (confirmed) {
    return (
      <OverlayPage
        title="Oferta do palco"
        footer={
          <Button block onClick={() => setTab('agora')}>
            Voltar para o início
          </Button>
        }
      >
        <div className="flex flex-col items-center gap-3 px-2 pt-10 text-center" role="status">
          <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-tint-live text-live">
            <Check size={36} aria-hidden />
          </span>
          <h2 className="text-h1 text-text-primary">Compra confirmada</h2>
          <p className="text-body text-text-secondary">
            Enviamos os próximos passos para <span className="break-all">{demoUser.email}</span>.
          </p>
          <p className="text-body text-text-primary">{offer.name}</p>
          <Button variant="secondary" onClick={openInterest}>
            Falar com um consultor
          </Button>
        </div>
        <InterestSheet offer={offer} state={state} />
      </OverlayPage>
    );
  }

  /* ----- corpo padrão e condição encerrada ----- */
  const footer = !online ? (
    <div className="flex flex-col gap-2">
      <Button block disabled>
        {offer.ctaLabel}
      </Button>
      <Button block variant="secondary" disabled>
        Falar com um consultor
      </Button>
      <p className="text-center text-body text-text-secondary">Precisa de internet.</p>
    </div>
  ) : closed ? (
    <Button block onClick={openInterest}>
      Falar com um consultor
    </Button>
  ) : confirming ? (
    <Button block variant="secondary" onClick={openInterest}>
      Falar com um consultor
    </Button>
  ) : (
    <div className="flex flex-col gap-2">
      <Button block onClick={() => openOverlay('offerPay', id)}>
        {offer.ctaLabel}
      </Button>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" className="h-auto px-3 py-2 leading-5" onClick={openInterest}>
          Falar com um consultor
        </Button>
        <Button
          variant="ghost"
          className="h-auto py-2"
          onClick={() => {
            dismiss(id);
            closeOverlay();
          }}
        >
          Agora não
        </Button>
      </div>
      <p className="text-center text-caption text-text-secondary">Você vai sair do app para pagar na Hotmart.</p>
    </div>
  );

  return (
    <OverlayPage title="Oferta do palco" footer={footer} quietOffline>
      <div className="flex flex-col gap-4 pt-1">
        {!online ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border-gold bg-surface-2 p-card">
            <StatusBanner tone="info" icon={<WifiOff size={24} />} title="Sem internet." text="Para contratar agora, mostre este QR no estande." />
            <div className="flex justify-center">
              <div className="rounded-lg bg-text-primary p-4">
                <QRCodeSVG
                  value={`PROTAGON|estande|${offer.id}|${demoUser.credentialCode}|${tier}`}
                  size={176}
                  level="M"
                  bgColor="#F5F3EE"
                  fgColor="#020111"
                  role="img"
                  aria-label="QR para contratar no estande comercial"
                />
              </div>
            </div>
            <p className="flex items-start gap-2 text-body text-text-primary">
              <MapPin size={20} aria-hidden className="mt-0.5 shrink-0 text-gold-500" /> Estande Comercial · Foyer, ao lado do credenciamento
            </p>
            <Button size="compact" variant="ghost" className="self-start" onClick={() => openMap('booth')}>
              Ver estande no mapa
            </Button>
          </div>
        ) : null}

        {sent ? (
          <div role="status" className="flex flex-col gap-1 rounded-md border border-tint-border-info bg-tint-info p-3">
            <p className="flex items-start gap-2 text-body-strong text-text-primary">
              <Check size={20} aria-hidden className="mt-0.5 shrink-0 text-info" /> Interesse enviado. O time comercial vai falar com você.
            </p>
            <p className="tabular text-caption text-text-secondary">Pedido enviado às {formatHour(state.interestAt!)}</p>
            <Button size="compact" variant="ghost" className="self-start" onClick={() => cancelInterest(id)}>
              Cancelar pedido
            </Button>
          </div>
        ) : null}

        {confirming ? <StatusBanner tone="info" icon={<Info size={24} />} title="Estamos confirmando sua compra." text="Pode levar alguns minutos." /> : null}
        {state.notSeen && !confirming && !closed ? (
          <StatusBanner tone="info" icon={<Info size={24} />} title="Ainda não vimos sua compra." text="Se você já pagou, fale com um consultor." />
        ) : null}

        <div className="flex flex-col gap-2">
          <Chip>{offer.audience}</Chip>
          <h2 className="text-h1 text-text-primary">{offer.name}</h2>
          <p className="text-body text-text-secondary">{offer.tagline}</p>
        </div>

        {closed ? (
          <section aria-label="Condição encerrada" className="flex flex-col gap-2 rounded-lg border border-border-subtle bg-surface-1 p-card">
            <Chip variant="common">Condição encerrada</Chip>
            <p className="text-body-strong text-text-primary">A condição do evento terminou às {closedHour(offer, state)}.</p>
            <p className="text-body text-text-secondary">Para saber as condições atuais, fale com um consultor.</p>
          </section>
        ) : (
          <>
            <section aria-label="Para quem é" className="flex flex-col gap-1">
              <h3 className="text-h2 text-text-primary">Para quem é</h3>
              <p className="text-body text-text-primary">{offer.forWhom}</p>
            </section>
            <section aria-label="O que inclui" className="flex flex-col gap-2">
              <h3 className="text-h2 text-text-primary">O que inclui</h3>
              <List items={offer.includes} mark="check" />
            </section>

            <section aria-label={`Condição do evento, ${TIER_LABEL[tier]}`} className="flex flex-col gap-1 rounded-lg border border-border-gold bg-surface-2 p-card">
              <p className="text-caption text-text-secondary">Condição do evento ({TIER_LABEL[tier]})</p>
              <p
                className="tabular text-display text-text-primary"
                aria-label={`Condição do evento, ${price.installments} parcelas de ${formatBRL(price.installment).replace('R$ ', '')} reais`}
              >
                <span aria-hidden>
                  {price.installments}x de {formatBRL(price.installment)}
                </span>
              </p>
              <p className="tabular text-body text-text-primary">Total parcelado: {formatBRL(price.total)}</p>
              <p className="tabular text-body text-text-primary">À vista no PIX: {formatBRL(price.cash)}</p>
            </section>

            <section aria-label="Bônus da condição do evento" className="flex flex-col gap-2">
              <h3 className="text-h2 text-text-primary">Bônus da condição do evento</h3>
              <List items={offer.bonus} mark="plus" />
            </section>

            <section aria-label="Prazo da condição" className="flex flex-col gap-1">
              <p className="tabular text-body-strong text-text-primary">Condição válida até {deadlineText(offer)}</p>
              <p className="tabular text-body text-text-primary" aria-label={spokenCountdown(minutesLeft(offer, clock))}>
                <span aria-hidden>{countdownText(minutesLeft(offer, clock))}</span>
              </p>
            </section>
          </>
        )}

        <p className="flex items-start gap-2 border-t border-border-subtle pt-3 text-body text-text-secondary">
          <BadgeCheck size={20} aria-hidden className="mt-0.5 shrink-0 text-gold-500" /> {ANTIFRAUD}
        </p>
      </div>
      <InterestSheet offer={offer} state={state} />
    </OverlayPage>
  );
}
