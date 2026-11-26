import { useEffect, useState } from 'react';
import { CircleAlert, MapPin, WifiOff } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { TIER_LABEL } from '@/components/ui/TierBadge';
import type { Offer } from '@/data/offerTypes';
import { demoUser } from '@/data/participants';
import { useFeatures, type OfferState } from '@/state/features';
import { useClock, useDemo } from '@/state/store';
import { formatHour } from '@/lib/clock';

const validPhone = (v: string) => v.replace(/\D/g, '').length >= 10;

/**
 * OF03 · Falar com um consultor (1 toque). SEC-022: a folha lista exatamente o que será enviado (nome, e-mail, telefone
 * editável e ingresso), diz para quem e para quê, e nunca leva CPF nem nada das Conexões. O botão é o ato de consentir.
 * Sem `offer`: variante "não disponível para o ingresso" (sem nome de produto).
 */
export function InterestSheet({ offer, state }: { offer?: Offer; state?: OfferState }) {
  const open = useFeatures((s) => s.sheets.offerInterest);
  const setSheet = useFeatures((s) => s.setSheet);
  const simulateError = useFeatures((s) => s.simulateError);
  const send = useFeatures((s) => s.sendInterest);
  const tier = useDemo((s) => s.tier);
  const online = useDemo((s) => s.online);
  const showToast = useDemo((s) => s.showToast);
  const openMap = useDemo((s) => s.openMap);
  const clock = useClock();

  const [phone, setPhone] = useState(demoUser.whatsapp);
  const [editing, setEditing] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [again, setAgain] = useState(false);

  useEffect(() => {
    if (open) {
      setPhone(demoUser.whatsapp);
      setEditing(false);
      setSending(false);
      setError(false);
      setAgain(false);
    }
  }, [open]);

  const close = () => setSheet('offerInterest', false);
  const sent = Boolean(state?.interestAt);
  const phoneOk = validPhone(phone);
  const about = offer ? `sobre ${offer.about}` : 'sobre as opções do seu ingresso';

  const submit = () => {
    if (sending || !phoneOk || !online) return;
    setSending(true);
    setError(false);
    window.setTimeout(() => {
      setSending(false);
      if (useFeatures.getState().simulateError || simulateError) {
        setError(true);
        return;
      }
      if (offer) send(offer.id);
      close();
      showToast({ text: 'Pedido enviado. O time comercial vai falar com você.', tone: 'success' });
    }, 600);
  };

  // Já pediu: pergunta antes de enviar de novo
  if (open && sent && !again) {
    return (
      <BottomSheet
        open
        onClose={close}
        title="Falar com um consultor"
        closeLabel="Fechar"
        footer={
          <>
            <Button block onClick={() => setAgain(true)}>
              Enviar de novo
            </Button>
            <Button block variant="ghost" onClick={close}>
              Fechar
            </Button>
          </>
        }
      >
        <p className="text-body text-text-primary">Você já pediu contato às {formatHour(state!.interestAt!)}. Quer enviar de novo?</p>
      </BottomSheet>
    );
  }
  void clock;

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title="Falar com um consultor"
      closeLabel="Fechar"
      footer={
        <>
          <Button block loading={sending} disabled={!phoneOk || !online} onClick={submit}>
            Quero falar com um consultor
          </Button>
          {!online ? (
            <p className="flex items-start gap-2 text-body text-text-secondary">
              <WifiOff size={20} aria-hidden className="mt-0.5 shrink-0" /> Sem internet. Mostre o QR no estande ou tente de novo quando a conexão voltar.
            </p>
          ) : null}
        </>
      }
    >
      <div className="flex flex-col gap-3">
        {offer ? <p className="text-body-strong text-text-primary">Sobre: {offer.name}</p> : <p className="text-body text-text-primary">O time comercial vai falar sobre as opções para o seu ingresso.</p>}
        <p className="text-body text-text-primary">
          Vamos enviar ao time comercial do Grupo Virtus: {demoUser.name}, {demoUser.email}, <span className="tabular">{validPhone(phone) ? phone : 'telefone a preencher'}</span> e ingresso {TIER_LABEL[tier]}. Só para falar com você {about}. Seu perfil e suas conexões não são enviados.
        </p>

        {editing || !phoneOk ? (
          <div className="flex flex-col gap-1">
            <label htmlFor="offer-phone" className="text-body-strong text-text-primary">
              Telefone (WhatsApp)
            </label>
            <input
              id="offer-phone"
              value={phone}
              inputMode="tel"
              autoComplete="tel"
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 w-full rounded-md border border-border-strong bg-surface-3 px-3 text-body text-text-primary focus:border-gold-200 focus:outline-none"
            />
            {!phoneOk ? <p className="text-body text-text-secondary">Digite o WhatsApp com DDD.</p> : null}
          </div>
        ) : (
          <Button size="compact" variant="ghost" className="self-start" onClick={() => setEditing(true)}>
            Corrigir telefone
          </Button>
        )}

        <div className="flex items-start gap-2 rounded-md bg-surface-1 p-3">
          <MapPin size={20} aria-hidden className="mt-0.5 shrink-0 text-gold-500" />
          <div className="min-w-0 flex-1">
            <p className="text-body text-text-primary">Estande Comercial · Foyer, ao lado do credenciamento</p>
            <Button
              size="compact"
              variant="ghost"
              className="-ml-2"
              onClick={() => {
                close();
                openMap('booth');
              }}
            >
              Ver no mapa
            </Button>
          </div>
        </div>

        {error ? (
          <p role="alert" className="flex items-start gap-2 text-body text-text-primary">
            <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> Não conseguimos enviar seu pedido. Confira a internet e tente de novo.
          </p>
        ) : null}
      </div>
    </BottomSheet>
  );
}
