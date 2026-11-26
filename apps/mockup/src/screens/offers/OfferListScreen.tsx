import { useState } from 'react';
import { Check, ChevronRight, CircleAlert, Megaphone } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { countdownText, deadlineText } from '@/lib/offers';
import { useFakeLoad } from '@/lib/useFakeLoad';
import { useFeatures } from '@/state/features';
import { useDemo } from '@/state/store';
import { closedHour, useOffers, type OfferPhase } from './useOffers';

const PHASE_LABEL: Record<OfferPhase, string> = { active: 'Ativa', interest: 'Interesse enviado', confirmed: 'Compra confirmada', closed: 'Encerrada' };

/**
 * OF04 · Ofertas do evento. Só existe depois da 1ª liberação e só lista o que o ingresso do aluno tem.
 * Ativas primeiro; encerradas ficam aqui sem preço. Sem cadeado.
 */
export function OfferListScreen() {
  const views = useOffers();
  const openOverlay = useDemo((s) => s.openOverlay);
  const simulateError = useFeatures((s) => s.simulateError);
  const [attempt, setAttempt] = useState(0);
  const loading = useFakeLoad(450, attempt);
  const ordered = [...views].sort((a, b) => Number(a.phase === 'closed') - Number(b.phase === 'closed'));
  const anyActive = views.some((v) => v.phase !== 'closed');

  return (
    <OverlayPage title="Ofertas do evento">
      <div className="flex flex-col gap-3 pt-1">
        {simulateError ? (
          <div role="alert" className="flex flex-col gap-2 rounded-md border border-danger bg-surface-1 p-3">
            <p className="flex items-start gap-2 text-body text-text-primary">
              <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> Não conseguimos abrir as ofertas. Tente de novo.
            </p>
            <Button size="compact" variant="secondary" className="self-start" onClick={() => setAttempt((n) => n + 1)}>
              Tentar de novo
            </Button>
          </div>
        ) : loading ? (
          <div role="status" className="flex flex-col gap-3">
            <p className="sr-only">Carregando as ofertas</p>
            <Skeleton className="h-[96px] rounded-lg" />
            <Skeleton className="h-[96px] rounded-lg" />
          </div>
        ) : ordered.length === 0 ? (
          <EmptyState icon={<Megaphone size={48} strokeWidth={1.5} />} title="Nenhuma oferta no momento" text="As ofertas do palco que forem liberadas para o seu ingresso ficam aqui." />
        ) : (
          <>
            {!anyActive ? <p className="text-body text-text-secondary">Nenhuma oferta ativa agora. As anteriores ficam aqui.</p> : null}
            <ul className="flex flex-col gap-3" aria-label="Ofertas do evento">
              {ordered.map((v) => (
                <li key={v.offer.id}>
                  <button
                    type="button"
                    onClick={() => openOverlay('offer', v.offer.id)}
                    aria-label={`${v.offer.name}, ${PHASE_LABEL[v.phase]}. Abrir`}
                    className="flex w-full flex-col gap-1 rounded-lg border border-border-subtle bg-surface-1 p-card text-left shadow-card active:bg-surface-3"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-h2 text-text-primary">{v.offer.name}</span>
                      <Chip variant={v.phase === 'active' ? 'common' : 'info'}>
                        {v.phase === 'confirmed' || v.phase === 'interest' ? <Check size={12} aria-hidden /> : null}
                        {PHASE_LABEL[v.phase]}
                      </Chip>
                    </span>
                    <span className="tabular text-body text-text-secondary">
                      {v.phase === 'closed' ? `A condição terminou às ${closedHour(v.offer, v.state)}` : `Condição válida até ${deadlineText(v.offer)}`}
                    </span>
                    <span className="flex items-center justify-between">
                      <span className="tabular text-body text-text-primary">{v.phase === 'closed' ? '' : countdownText(v.minutes)}</span>
                      <ChevronRight size={18} aria-hidden className="text-text-secondary" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </OverlayPage>
  );
}
