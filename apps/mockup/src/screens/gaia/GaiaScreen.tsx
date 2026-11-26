import { useEffect, useState, type ReactNode } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, ChevronDown, ChevronRight, CircleAlert, Copy, LifeBuoy, MapPin, Wifi, WifiOff } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { edition } from '@/data/edition';
import { gaia as gaiaInfo, gaiaFaq } from '@/data/gaia';
import { demoUser } from '@/data/participants';
import { formatHour } from '@/lib/clock';
import { haptic } from '@/lib/haptics';
import { copyText, COPY_FAILED } from '@/lib/clipboard';
import { cn } from '@/lib/cn';
import { useFeatures, type GaiaStepNumber } from '@/state/features';
import { useDemo } from '@/state/store';
import { currentStep, doneCount, groupGaiaText, useGroupGaiaCount, type GaiaStep } from './gaiaState';

/** Linha cujo conteúdo depende do fundador: texto neutro com o selo "Proposta" (nunca "[a confirmar]" na tela) */
function Proposal({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('flex flex-wrap items-center gap-2 text-body text-text-secondary', className)}>
      <Chip variant="proposal" />
      <span>{children}</span>
    </p>
  );
}

/** Passo do checklist: número ou check, título, "Feito" e conteúdo expansível. Todos tocáveis; nenhum bloqueado. */
function StepCard({
  n,
  title,
  done,
  active,
  open,
  onToggleOpen,
  onToggleDone,
  children,
}: {
  n: GaiaStep;
  title: string;
  done: boolean;
  active: boolean;
  open: boolean;
  onToggleOpen: () => void;
  onToggleDone?: () => void;
  children: ReactNode;
}) {
  return (
    <li className={cn('rounded-lg border', active ? 'border-border-gold bg-surface-2' : 'border-border-subtle bg-surface-1')}>
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        aria-label={`Passo ${n} de 4: ${title}. ${done ? 'Feito' : active ? 'Em andamento' : 'Pendente'}`}
        className="flex min-h-[56px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left active:bg-surface-3"
      >
        <span
          aria-hidden
          className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-pill border-2 text-body-strong', done ? 'border-live bg-tint-live text-live' : active ? 'border-gold-500 text-gold-200' : 'border-border-strong text-text-secondary')}
        >
          {done ? <Check size={18} strokeWidth={3} /> : n}
        </span>
        <span className="min-w-0 flex-1 text-body-strong text-text-primary">{title}</span>
        {done ? <span className="text-body text-live">Feito</span> : null}
        <ChevronDown size={18} aria-hidden className={cn('shrink-0 text-text-secondary transition-transform duration-fast', open && 'rotate-180')} />
      </button>
      {open ? (
        <div className="flex flex-col gap-3 px-3 pb-3">
          {children}
          {onToggleDone ? (
            <button
              type="button"
              role="checkbox"
              aria-checked={done}
              onClick={onToggleDone}
              className="flex min-h-touch items-center gap-3 self-start rounded-md pr-3 text-left active:bg-surface-3"
            >
              <span aria-hidden className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border-2', done ? 'border-gold-500 bg-gold-500 text-on-gold' : 'border-border-strong')}>
                {done ? <Check size={16} strokeWidth={3} /> : null}
              </span>
              <span className="text-body text-text-primary">Feito</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function CopyFailed() {
  return (
    <p role="alert" className="flex items-start gap-2 text-body text-text-primary">
      <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> {COPY_FAILED}
    </p>
  );
}

/** GA03 · Preciso de ajuda: onde está a equipe, perguntas frequentes e suporte. Disponível em todos os passos. */
function HelpSheet() {
  const open = useFeatures((s) => s.sheets.gaiaHelp);
  const setSheet = useFeatures((s) => s.setSheet);
  const simulateError = useFeatures((s) => s.simulateError);
  const online = useDemo((s) => s.online);
  const tier = useDemo((s) => s.tier);
  const openMap = useDemo((s) => s.openMap);
  const openOverlay = useDemo((s) => s.openOverlay);
  const [faq, setFaq] = useState<string | null>(null);
  const [request, setRequest] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const close = () => setSheet('gaiaHelp', false);

  useEffect(() => {
    if (open) {
      setFaq(null);
      setRequest('idle');
    }
  }, [open]);

  const ask = () => {
    setRequest('sending');
    window.setTimeout(() => {
      if (useFeatures.getState().simulateError || simulateError) return setRequest('failed');
      haptic('light', 'pedido de ajuda enviado');
      setRequest('sent');
    }, 600);
  };

  return (
    <BottomSheet open={open} onClose={close} size="tall" title="Preciso de ajuda" closeLabel="Fechar ajuda">
      <div className="flex flex-col gap-4">
        <section className="flex flex-col gap-2" aria-label="Onde está a equipe">
          <h3 className="text-h2 text-text-primary">Onde está a equipe</h3>
          <p className="text-body text-text-primary">{gaiaInfo.teamPlace}</p>
          <Chip variant="proposal" className="self-start" />
          <Button
            size="compact"
            variant="ghost"
            className="self-start"
            icon={<MapPin size={18} aria-hidden />}
            onClick={() => {
              close();
              openMap('booth');
            }}
          >
            Ver no mapa
          </Button>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={!online || request === 'sending' || request === 'sent'}
                loading={request === 'sending'}
                icon={request === 'sent' ? <Check size={18} aria-hidden /> : undefined}
                onClick={ask}
              >
                {request === 'sent' ? 'Pedido enviado · Alguém vai até você' : 'Pedir ajuda no meu lugar'}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Chip variant="proposal" />
              <span className="text-body text-text-secondary">Envia só o seu setor e fila.</span>
            </div>
            {request === 'sent' ? (
              <p role="status" className="text-body text-text-primary">
                Pedido enviado. Alguém vai até o {edition.sectorByTier[tier].replace(' · ', ', ').replace('Setor', 'setor')}.
              </p>
            ) : null}
            {request === 'failed' ? (
              <p role="alert" className="flex items-start gap-2 text-body text-text-primary">
                <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> Não conseguimos avisar a equipe. Levante a mão ou vá até um ponto de apoio.
              </p>
            ) : null}
            {!online ? <p className="text-body text-text-secondary">Precisa de internet. Levante a mão ou vá até a equipe.</p> : null}
          </div>
        </section>

        <section className="flex flex-col gap-1" aria-label="Perguntas frequentes">
          <h3 className="text-h2 text-text-primary">Perguntas frequentes</h3>
          <ul className="flex flex-col">
            {gaiaFaq.map((q) => {
              const isOpen = faq === q.id;
              return (
                <li key={q.id} className="border-b border-border-subtle last:border-b-0">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setFaq(isOpen ? null : q.id)}
                    className="flex min-h-touch w-full items-center gap-2 rounded-md py-2 text-left active:bg-surface-3"
                  >
                    <ChevronRight size={18} aria-hidden className={cn('shrink-0 text-text-secondary transition-transform duration-fast', isOpen && 'rotate-90')} />
                    <span className="text-body text-text-primary">{q.q}</span>
                  </button>
                  {isOpen ? (
                    <p className="pb-3 pl-7 text-body text-text-secondary">
                      {q.a}
                      {q.id === 'email' ? ` ${demoUser.email}` : ''}
                      {q.proposal ? <Chip variant="proposal" className="ml-2 align-middle" /> : null}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <Button
          variant="ghost"
          className="self-start"
          icon={<LifeBuoy size={18} aria-hidden />}
          onClick={() => {
            close();
            openOverlay('support');
          }}
        >
          Falar com o suporte
        </Button>
      </div>
    </BottomSheet>
  );
}

/**
 * GA02 · Checklist de 4 passos da atividade Gaia One. O progresso é autodeclarado: o app não verifica nada.
 * Wi-Fi fixo no topo; "Preciso de ajuda" no mesmo lugar em todos os passos. O que depende do fundador leva o selo "Proposta".
 */
export function GaiaScreen() {
  const gaia = useFeatures((s) => s.gaia);
  const simulateError = useFeatures((s) => s.simulateError);
  const toggleStep = useFeatures((s) => s.toggleGaiaStep);
  const complete = useFeatures((s) => s.completeGaia);
  const undo = useFeatures((s) => s.undoGaia);
  const setSheet = useFeatures((s) => s.setSheet);
  const online = useDemo((s) => s.online);
  const showToast = useDemo((s) => s.showToast);
  const setWifiOpen = useDemo((s) => s.setWifiOpen);
  const setTab = useDemo((s) => s.setTab);
  const count = useGroupGaiaCount();
  const device = gaia.device;
  const store = gaiaInfo.store[device];

  const current = currentStep(gaia);
  const [open, setOpen] = useState<GaiaStep | 0>(current);
  const [review, setReview] = useState(false);
  const [copied, setCopied] = useState<'email' | 'code' | null>(null);
  const [copyFailed, setCopyFailed] = useState<'email' | 'code' | null>(null);
  const [storeError, setStoreError] = useState(false);
  const [otherDevice, setOtherDevice] = useState(false);
  const [wifiCopied, setWifiCopied] = useState(false);
  useEffect(() => setOpen(current), [current]);

  const done = doneCount(gaia);
  const completed = Boolean(gaia.completedAt);

  const copy = async (what: 'email' | 'code') => {
    const ok = await copyText(what === 'email' ? demoUser.email : gaiaInfo.promoCode);
    if (!ok) {
      // BUG-020: nada de "copiado" se a cópia falhou; o texto fica selecionável (toque e segure)
      haptic('warning', 'cópia falhou');
      setCopied(null);
      setCopyFailed(what);
      return;
    }
    haptic('light', what === 'email' ? 'e-mail copiado' : 'código copiado');
    setCopyFailed(null);
    setCopied(what);
    window.setTimeout(() => setCopied((c) => (c === what ? null : c)), 2000);
  };

  const copyWifi = async () => {
    const ok = await copyText(edition.venue.wifi.password);
    if (!ok) {
      haptic('warning', 'cópia da senha do Wi-Fi falhou');
      showToast({ text: COPY_FAILED, tone: 'warning' });
      return;
    }
    haptic('light', 'senha do Wi-Fi copiada');
    showToast({ text: 'Senha do Wi-Fi copiada', tone: 'success' });
    setWifiCopied(true);
    window.setTimeout(() => setWifiCopied(false), 1500);
  };

  const openStore = () => {
    if (simulateError) return setStoreError(true);
    setStoreError(false);
    showToast({ text: `Abriria a ${store.name} (simulado)`, tone: 'info' });
  };

  const finish = () => {
    complete();
    showToast({
      text: count ? 'Pronto. Seu grupo vê só quantos já ativaram, sem nomes.' : 'Tudo certo. Marcamos seu Gaia One como ativado.',
      tone: 'success',
      action: { label: 'Desfazer', run: undo },
    });
  };

  const stepsList = (
    <ol className="flex flex-col gap-2" aria-label="Passos">
      <StepCard n={1} title="Baixar o app" done={gaia.steps[1]} active={current === 1} open={open === 1} onToggleOpen={() => setOpen(open === 1 ? 0 : 1)} onToggleDone={() => toggleStep(1 as GaiaStepNumber)}>
        <p className="text-body text-text-primary">{store.hint}</p>
        <Button block onClick={openStore}>
          {store.open}
        </Button>
        {storeError ? (
          <div role="alert" className="flex flex-col gap-1">
            <p className="flex items-start gap-2 text-body text-text-primary">
              <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> Não conseguimos abrir a loja. Procure Gaia One na {store.name}.
            </p>
            <Button size="compact" variant="secondary" className="self-start" onClick={openStore}>
              Tentar de novo
            </Button>
          </div>
        ) : null}
        <Button size="compact" variant="ghost" className="self-start" onClick={() => setOtherDevice(true)}>
          Usar outro aparelho
        </Button>
        <p className="text-body text-text-secondary">O Wi-Fi do salão enche com muita gente. Se o download demorar, use os dados do celular.</p>
        <Proposal>{gaiaInfo.storeLinkNote}</Proposal>
      </StepCard>

      <StepCard n={2} title="Criar a conta" done={gaia.steps[2]} active={current === 2} open={open === 2} onToggleOpen={() => setOpen(open === 2 ? 0 : 2)} onToggleDone={() => toggleStep(2 as GaiaStepNumber)}>
        <p className="text-body text-text-primary">Use o mesmo e-mail da sua compra:</p>
        <p className="select-all break-words text-body-strong text-text-primary">{demoUser.email}</p>
        <Button block icon={copied === 'email' ? <Check size={20} aria-hidden /> : <Copy size={20} aria-hidden />} onClick={() => copy('email')}>
          {copied === 'email' ? 'E-mail copiado' : 'Copiar meu e-mail'}
        </Button>
        {copied === 'email' ? <p className="text-body text-text-secondary">Cole no cadastro do Gaia One e volte aqui.</p> : null}
        {copyFailed === 'email' ? <CopyFailed /> : null}
        <Button size="compact" variant="ghost" className="self-start" onClick={() => setSheet('gaiaHelp', true)}>
          Já tem conta? Entre com ela.
        </Button>
      </StepCard>

      <StepCard n={3} title="Ativar o teste" done={gaia.steps[3]} active={current === 3} open={open === 3} onToggleOpen={() => setOpen(open === 3 ? 0 : 3)} onToggleDone={() => toggleStep(3 as GaiaStepNumber)}>
        <p className="text-body text-text-primary">No Gaia One, abra Ativar teste e cole o código.</p>
        <p className="tabular select-all rounded-md bg-surface-3 px-3 py-2 text-center text-h1 tracking-[0.15em] text-text-primary">{gaiaInfo.promoCode}</p>
        <Button block icon={copied === 'code' ? <Check size={20} aria-hidden /> : <Copy size={20} aria-hidden />} onClick={() => copy('code')}>
          {copied === 'code' ? 'Código copiado' : 'Copiar código'}
        </Button>
        {copyFailed === 'code' ? <CopyFailed /> : null}
        <p className="text-body text-text-secondary">{gaiaInfo.promoNote}</p>
        <Proposal>
          {gaiaInfo.card} {gaiaInfo.trialLength}
        </Proposal>
      </StepCard>

      <StepCard n={4} title="Pronto" done={completed} active={current === 4 && !completed} open={open === 4} onToggleOpen={() => setOpen(open === 4 ? 0 : 4)}>
        <p className="text-body text-text-primary">Quando o teste estiver ativo, toque em Já ativei.</p>
        <Button block onClick={finish} disabled={completed}>
          Já ativei
        </Button>
        <p className="text-body text-text-secondary">O app não confere nada: é você quem avisa que terminou.</p>
      </StepCard>
    </ol>
  );

  const footer = (
    <div className="flex flex-col gap-1">
      {completed ? (
        <Button block onClick={() => setTab('agora')}>
          Voltar para o início
        </Button>
      ) : null}
      <Button block variant="ghost" icon={<LifeBuoy size={20} aria-hidden />} onClick={() => setSheet('gaiaHelp', true)}>
        Preciso de ajuda
      </Button>
    </div>
  );

  return (
    <OverlayPage title="Gaia One" footer={footer} quietOffline>
      <div className="flex flex-col gap-4 pt-1">
        {!online ? <StatusBanner tone="warning" icon={<WifiOff size={24} />} title="Sem internet." text="Conecte-se ao Wi-Fi para baixar o Gaia One." /> : null}

        {/* Wi-Fi fixo no topo: o download depende dele */}
        <div className={cn('flex min-h-[56px] items-center gap-1 rounded-lg border bg-surface-1 px-3', online ? 'border-border-subtle' : 'border-info')}>
          <button type="button" onClick={() => setWifiOpen(true)} aria-label={`Wi-Fi ${edition.venue.wifi.network}, ver detalhes`} className="flex min-h-touch min-w-0 flex-1 items-center gap-2 rounded-md text-left active:bg-surface-3">
            <Wifi size={24} aria-hidden className="shrink-0 text-gold-500" />
            <span className="min-w-0 truncate text-body-strong text-text-primary">{edition.venue.wifi.network}</span>
          </button>
          <Button size="compact" variant="ghost" className="shrink-0 px-1" icon={wifiCopied ? <Check size={18} aria-hidden /> : undefined} onClick={copyWifi}>
            {wifiCopied ? 'Copiada' : 'Copiar senha'}
          </Button>
        </div>

        {completed && !review ? (
          <div className="flex flex-col items-center gap-3 px-2 pt-4 text-center" role="status">
            <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-tint-live text-live">
              <Check size={36} aria-hidden />
            </span>
            <h2 className="text-h1 text-text-primary">Gaia One ativado</h2>
            <p className="tabular text-body text-text-secondary">Concluído às {formatHour(gaia.completedAt!)}</p>
            {count ? <p className="text-body text-text-primary">{groupGaiaText(count)}</p> : null}
            <Button variant="ghost" onClick={() => setReview(true)}>
              Rever os passos
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <h2 className="text-h1 text-text-primary">{completed ? 'Gaia One ativado' : 'Ative seu teste do Gaia One'}</h2>
              <Proposal>{gaiaInfo.oneLiner}</Proposal>
              <p className="tabular text-body-strong text-text-primary">{done} de 4 passos feitos</p>
              <div role="progressbar" aria-label="Passos feitos" aria-valuemin={0} aria-valuemax={4} aria-valuenow={done} className="h-1.5 overflow-hidden rounded-pill bg-border-strong">
                <div className="h-full origin-left rounded-pill bg-gradient-gold transition-[width] duration-base" style={{ width: `${(done / 4) * 100}%` }} />
              </div>
              {completed ? <p className="tabular text-caption text-text-secondary">Concluído às {formatHour(gaia.completedAt!)}</p> : null}
              {count ? (
                <p className="flex flex-wrap items-center gap-2 text-body text-text-primary">
                  {groupGaiaText(count)} <Chip variant="proposal" />
                </p>
              ) : null}
            </div>
            {stepsList}
          </>
        )}
      </div>

      <HelpSheet />
      <BottomSheet open={otherDevice} onClose={() => setOtherDevice(false)} title="Leia com o outro celular" closeLabel="Fechar">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="rounded-lg bg-text-primary p-4">
            <QRCodeSVG value="https://gaia.exemplo/loja" size={176} level="M" bgColor="#F5F3EE" fgColor="#020111" role="img" aria-label="QR que abre a loja do Gaia One no aparelho que ler" />
          </div>
          <p className="text-body text-text-primary">Ou procure Gaia One na loja.</p>
          <Proposal className="justify-center">Na versão real, o QR abre a loja do Gaia One.</Proposal>
        </div>
      </BottomSheet>
    </OverlayPage>
  );
}
