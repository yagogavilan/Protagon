import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert, Compass, Ellipsis, PauseCircle, ScanLine, ShieldCheck, Sparkles, UserRound, WifiOff, X } from 'lucide-react';
import { useDemo, DAILY_REQUEST_LIMIT, type ConnPanel } from '@/state/store';
import { countersVisible, firstName, plural, usePendingRequests, useSuggestionQueue } from '@/lib/connections';
import { PersonCard } from '@/components/ui/PersonCard';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { RequestsPanel } from './RequestsPanel';
import { NetworkPanel } from './NetworkPanel';
import { ExplorePanel } from './ExplorePanel';

const EASE = [0.2, 0.8, 0.2, 1] as const;

/* ---------- Sugestões (C02) ---------- */

function SuggestionsPanel({ onExplore }: { onExplore: () => void }) {
  const tier = useDemo((s) => s.tier);
  const day = useDemo((s) => s.day);
  const sent = useDemo((s) => s.requestsSentByDay[day]);
  const setOutcome = useDemo((s) => s.setSuggestionOutcome);
  const showToast = useDemo((s) => s.showToast);
  const openOverlay = useDemo((s) => s.openOverlay);
  const setRequestFor = useDemo((s) => s.setRequestFor);
  const { all, queue, handled } = useSuggestionQueue();

  const limit = DAILY_REQUEST_LIMIT[tier];
  const remaining = Math.max(0, limit - sent);
  const limitReached = remaining === 0;
  const current = queue[0];

  if (!current) {
    return (
      <EmptyState
        icon={<Compass size={48} strokeWidth={1.5} />}
        title="Você viu todas as sugestões de hoje"
        text="Quem você deixou para depois volta amanhã. Enquanto isso, procure por segmento ou cidade."
        action={
          <Button block variant="secondary" onClick={onExplore}>
            Ir para Explorar
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {limitReached ? (
        <StatusBanner
          tone="warning"
          icon={<CircleAlert size={24} />}
          title={`Você usou os ${limit} pedidos de hoje.`}
          text={`Amanhã você tem ${limit} de novo. Pelo QR da credencial, os pedidos continuam liberados.`}
        />
      ) : (
        <p className="tabular text-caption text-text-secondary">
          Sugestão {handled + 1} de {all.length} · Restam {remaining} pedidos hoje
        </p>
      )}

      <p className="sr-only" aria-live="polite">
        {handled > 0 ? `Próxima sugestão: ${current.participant.company}.` : ''}
      </p>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={current.participant.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2, ease: EASE }}>
          <PersonCard
            suggestion={current}
            limitReached={limitReached}
            onConnect={() => setRequestFor(current.participant.id)}
            onNotNow={() => {
              const id = current.participant.id;
              setOutcome(id, 'notNow');
              showToast({
                text: `${firstName(current.participant.name)} volta para suas sugestões amanhã`,
                tone: 'info',
                action: { label: 'Desfazer', run: () => setOutcome(id, null) },
              });
            }}
            onConnectByQr={() => openOverlay('qrscan')}
            onOpenProfile={() => openOverlay('person', current.participant.id)}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Card opcional "Complete seu perfil" (DEC-002): desafio e conhecimento. Fechável; some quando o perfil está completo. */
function CompleteProfileCard() {
  const profile = useDemo((s) => s.profile);
  const dismissed = useDemo((s) => s.profileCardDismissed);
  const dismiss = useDemo((s) => s.setProfileCardDismissed);
  const openOverlay = useDemo((s) => s.openOverlay);
  if (dismissed || (profile.challenge && profile.expertise.length > 0)) return null;
  return (
    <section aria-label="Complete seu perfil" className="rounded-lg border border-border-subtle bg-surface-1 py-2 pl-card pr-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-body-strong text-text-primary">Complete seu perfil</h2>
        <button
          type="button"
          onClick={() => dismiss(true)}
          aria-label="Dispensar, completar depois"
          className="flex h-touch w-touch shrink-0 items-center justify-center rounded-md text-text-secondary active:bg-surface-3"
        >
          <X size={20} aria-hidden />
        </button>
      </div>
      <div className="-mt-2 flex items-center justify-between gap-3 pb-1">
        <p className="min-w-0 flex-1 text-body text-text-secondary">Opcional, 30 segundos. Mostra quem pode ajudar no seu desafio.</p>
        <Button size="compact" variant="gold" className="shrink-0 px-4" onClick={() => openOverlay('profile')}>
          Completar
        </Button>
      </div>
    </section>
  );
}

/* ---------- Tela ---------- */

/** C02 · Conexões VIP/Diamond: sub-navegação, sugestão um card por vez, pedido com limite (D4). */
export function ConnectionsVip() {
  const moment = useDemo((s) => s.moment);
  const online = useDemo((s) => s.online);
  const active = useDemo((s) => s.connectionsActive);
  const paused = useDemo((s) => s.connectionsPaused);
  const justUpgraded = useDemo((s) => s.justUpgraded);
  const panel = useDemo((s) => s.connPanel);
  const setPanel = useDemo((s) => s.setConnPanel);
  const setPaused = useDemo((s) => s.setConnectionsPaused);
  const openOverlay = useDemo((s) => s.openOverlay);
  const showToast = useDemo((s) => s.showToast);
  const pending = usePendingRequests().length;
  const [moreOpen, setMoreOpen] = useState(false);

  const items = useMemo(
    () => [
      { id: 'sugestoes' as const, label: 'Sugestões' },
      { id: 'explorar' as const, label: 'Explorar' },
      {
        id: 'pedidos' as const,
        label: 'Pedidos',
        count: countersVisible(moment) && pending > 0 ? pending : undefined,
        countLabel: plural(pending, 'novo', 'novos'),
      },
      { id: 'rede' as const, label: 'Minha rede' },
    ],
    [moment, pending],
  );

  const header = (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <h1 className="text-h1 text-text-primary">Conexões</h1>
        {moment === 'before' ? <Chip variant="proposal" /> : null}
      </div>
      {active ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => openOverlay('qrscan')}
            className="flex min-h-touch items-center gap-1.5 rounded-md border border-border-strong px-3 text-label-sm text-text-primary active:bg-surface-3"
          >
            <ScanLine size={18} aria-hidden className="text-gold-200" /> Ler QR
          </button>
          <button type="button" aria-label="Mais opções de Conexões" onClick={() => setMoreOpen(true)} className="flex h-touch w-touch items-center justify-center rounded-md text-text-primary active:bg-surface-3">
            <Ellipsis size={24} aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );

  if (!active) {
    return (
      <div className="flex flex-col gap-4 px-margin pb-4">
        {header}
        <section className="rounded-lg border border-border-gold bg-surface-2 p-5 shadow-card">
          <Sparkles size={24} aria-hidden className="text-gold-500" />
          <h2 className="mt-3 text-h2 text-text-primary">{justUpgraded ? 'Seu ingresso agora é VIP.' : 'Ative seu perfil de Conexões'}</h2>
          <p className="mt-1 text-body text-text-secondary">
            {justUpgraded
              ? 'Ative seu perfil em menos de 1 minuto.'
              : 'Em menos de 1 minuto você recebe sugestões de pessoas com interesses em comum e objetivos que combinam com os seus.'}
          </p>
          {moment === 'before' ? <p className="mt-2 flex items-center gap-2 text-body text-text-secondary"><Chip variant="proposal" /> Conexões abertas antes do evento</p> : null}
          <Button block className="mt-5" onClick={() => openOverlay('activate')}>
            Ativar perfil
          </Button>
          <p className="mt-2 text-center text-body text-text-secondary">Você escolhe o que fica visível.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-margin pb-4">
      {header}
      {moment === 'before' ? <p className="-mt-2 text-body text-text-secondary">Conexões abertas antes do evento</p> : null}
      <div className="sticky top-0 z-banner -mx-margin bg-bg px-margin py-1">
        <SegmentedTabs<ConnPanel> label="Seções de Conexões" items={items} value={panel} onChange={setPanel} />
      </div>

      {!online ? (
        <StatusBanner tone="info" icon={<WifiOff size={24} />} title="Sem internet." text="Você pode ver as sugestões salvas; os pedidos saem quando a conexão voltar." />
      ) : null}

      {paused ? (
        <EmptyState
          icon={<PauseCircle size={48} strokeWidth={1.5} />}
          title="Seu perfil está pausado"
          text="Você some das sugestões e da busca e não recebe pedidos novos. Suas conexões continuam."
          action={
            <Button block onClick={() => setPaused(false)}>
              Reativar meu perfil
            </Button>
          }
        />
      ) : panel === 'sugestoes' ? (
        <>
          <SuggestionsPanel onExplore={() => setPanel('explorar')} />
          <CompleteProfileCard />
        </>
      ) : panel === 'pedidos' ? (
        <RequestsPanel />
      ) : panel === 'rede' ? (
        <NetworkPanel />
      ) : (
        <ExplorePanel />
      )}

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Conexões" closeLabel="Fechar opções">
        <ul className="flex flex-col">
          {[
            { label: 'Meu perfil de Conexões', Icon: UserRound, run: () => openOverlay('profile') },
            {
              label: paused ? 'Reativar meu perfil' : 'Pausar meu perfil',
              Icon: PauseCircle,
              run: () => {
                setPaused(!paused);
                showToast({ text: paused ? 'Perfil reativado' : 'Perfil pausado', tone: 'info' });
              },
            },
            { label: 'Privacidade', Icon: ShieldCheck, run: () => openOverlay('privacy') },
          ].map(({ label, Icon, run }) => (
            <li key={label}>
              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  run();
                }}
                className="flex min-h-touch w-full items-center gap-3 rounded-md px-2 py-2 text-left text-body text-text-primary active:bg-surface-3"
              >
                <Icon size={24} aria-hidden className="text-gold-500" />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </BottomSheet>
    </div>
  );
}
