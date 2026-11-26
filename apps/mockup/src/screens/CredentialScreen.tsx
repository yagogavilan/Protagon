import { QRCodeSVG } from 'qrcode.react';
import { Check, CloudOff, ShieldCheck, Sun, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TierBadge } from '@/components/ui/TierBadge';
import { OverlayHeader } from '@/components/shell/OverlayHeader';
import { demoUser } from '@/data/participants';
import { edition } from '@/data/edition';
import { useDemo } from '@/state/store';

const shortDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });

function editionRange(): string {
  const [a, , c] = edition.dates;
  const first = new Date(`${a}T12:00:00`);
  const last = new Date(`${c}T12:00:00`);
  return `${first.getDate()} a ${shortDate.format(last).replace('.', '')}`;
}

/** G01 · Credencial: QR grande, nome, selo, setor, Wallet, offline */
export function CredentialScreen() {
  const tier = useDemo((s) => s.tier);
  const online = useDemo((s) => s.online);
  const walletAdded = useDemo((s) => s.walletAdded);
  const setWalletAdded = useDemo((s) => s.setWalletAdded);
  const closeOverlay = useDemo((s) => s.closeOverlay);

  return (
    <div className="flex h-full flex-col bg-bg">
      <OverlayHeader title="Credencial" onBack={closeOverlay} />

      <div className="no-scrollbar flex-1 overflow-y-auto px-margin pb-10">
        <div className="card relative overflow-hidden p-5">
          <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-gradient-gold" />
          <div className="flex items-center justify-between">
            <span className="text-caption uppercase tracking-[0.18em] text-gold-200">{edition.name}</span>
            <TierBadge tier={tier} />
          </div>

          <div className="mt-5 flex justify-center">
            <div className="rounded-lg bg-text-primary p-4 shadow-glow-gold">
              <QRCodeSVG
                value={`PROTAGON|${edition.id}|${demoUser.credentialCode}|${tier}`}
                size={232}
                level="M"
                bgColor="#F5F3EE"
                fgColor="#020111"
                role="img"
                aria-label={`QR code da credencial de ${demoUser.name}`}
              />
            </div>
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-caption text-text-secondary">
            <Sun size={14} aria-hidden className="text-gold-200" /> Brilho no máximo para leitura
          </p>

          <div className="mt-5 flex flex-col items-center gap-1 text-center">
            <h2 className="text-h1 text-text-primary">{demoUser.name}</h2>
            <p className="text-body text-text-secondary">{demoUser.company}</p>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-border-subtle pt-4">
            <div>
              <dt className="text-caption text-text-tertiary">Setor</dt>
              <dd className="text-body font-semibold text-text-primary">{edition.sectorByTier[tier]}</dd>
            </div>
            <div>
              <dt className="text-caption text-text-tertiary">Datas</dt>
              <dd className="tabular text-body font-semibold text-text-primary">{editionRange()}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-caption text-text-tertiary">Código</dt>
              <dd className="tabular select-all text-body text-text-primary">{demoUser.credentialCode}</dd>
            </div>
          </dl>
        </div>

        <div
          className="mt-4 flex items-start gap-3 rounded-md border border-border-subtle bg-surface-1 p-3"
          role={online ? undefined : 'status'}
        >
          {online ? (
            <ShieldCheck size={20} aria-hidden className="mt-0.5 shrink-0 text-live" />
          ) : (
            <CloudOff size={20} aria-hidden className="mt-0.5 shrink-0 text-warning" />
          )}
          <p className="text-[15px] leading-[22px] text-text-secondary">
            {online ? (
              <>
                <span className="text-text-primary">Disponível offline.</span> A credencial abre mesmo sem internet.
              </>
            ) : (
              <>
                <span className="text-text-primary">Você está sem internet.</span> A credencial funciona normalmente; mostre o QR na entrada.
              </>
            )}
          </p>
        </div>

        <div className="mt-6">
          {walletAdded ? (
            <div className="flex min-h-[48px] items-center justify-center gap-2 rounded-pill border border-live text-body font-semibold text-live" role="status">
              <Check size={20} aria-hidden /> Adicionada à Wallet
            </div>
          ) : (
            <Button
              block
              variant="secondary"
              icon={<Wallet size={20} aria-hidden />}
              disabled={!online}
              onClick={() => setWalletAdded(true)}
            >
              Adicionar à Wallet
            </Button>
          )}
          {!online && !walletAdded ? (
            <p className="mt-2 text-center text-caption text-text-tertiary">Para adicionar à Wallet, conecte-se à internet.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
