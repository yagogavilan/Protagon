import { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert, Compass, Ellipsis, PauseCircle, ScanLine, ShieldCheck, Sparkles, UserRound, Users, WifiOff } from 'lucide-react';
import { useDemo, DAILY_REQUEST_LIMIT } from '@/state/store';
import { countersVisible, plural, usePendingRequests, useSuggestionQueue, type PendingRequest } from '@/lib/connections';
import { haptic } from '@/lib/haptics';
import type { Suggestion } from '@/lib/affinity';
import { participants } from '@/data/participants';
import { receivedRequests } from '@/data/requests';
import { PersonCard } from '@/components/ui/PersonCard';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { TierBadge } from '@/components/ui/TierBadge';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { RequestSheet } from './RequestSheet';
import { ActivateSheet } from './ActivateSheet';
import { cn } from '@/lib/cn';

type Panel = 'sugestoes' | 'explorar' | 'pedidos' | 'rede';
const EASE = [0.2, 0.8, 0.2, 1] as const;
const SEND_DELAY = 700;

function firstName(name: string) {
  return name.split(' ')[0] ?? name;
}

/* ---------- Sugestões (C02) ---------- */

function SuggestionsPanel({ onExplore }: { onExplore: () => void }) {
  const tier = useDemo((s) => s.tier);
  const day = useDemo((s) => s.day);
  const moment = useDemo((s) => s.moment);
  const online = useDemo((s) => s.online);
  const sent = useDemo((s) => s.requestsSentByDay[day]);
  const setRequestsSent = useDemo((s) => s.setRequestsSent);
  const setOutcome = useDemo((s) => s.setSuggestionOutcome);
  const showToast = useDemo((s) => s.showToast);
  const openOverlay = useDemo((s) => s.openOverlay);
  const { all, queue, handled } = useSuggestionQueue();

  const limit = DAILY_REQUEST_LIMIT[tier];
  const remaining = Math.max(0, limit - sent);
  const limitReached = remaining === 0;
  const current = queue[0];

  const [sheetOpen, setSheetOpen] = useState(false);
  const [target, setTarget] = useState<Suggestion | null>(null);
  const drafts = useRef<Record<string, { choice: number; text: string }>>({});
  const onDraft = useCallback((id: string, d: { choice: number; text: string }) => {
    drafts.current[id] = d;
  }, []);

  const send = async (s: Suggestion) => {
    await new Promise((r) => window.setTimeout(r, SEND_DELAY));
    const name = s.participant.name;
    setRequestsSent(sent + 1); // D4: o limite desconta também quando fica na fila offline
    delete drafts.current[s.participant.id];
    setSheetOpen(false);
    if (!online) {
      setOutcome(s.participant.id, 'queued');
      showToast({ text: 'Pedido salvo. Enviamos assim que a internet voltar.', tone: 'info' });
      return;
    }
    setOutcome(s.participant.id, 'sent');
    haptic('light', 'pedido enviado');
    showToast({
      text: moment === 'live' ? `Pedido enviado. ${firstName(name)} recebe no próximo intervalo.` : `Pedido enviado para ${name}`,
      tone: 'success',
    });
  };

  const notNow = (s: Suggestion) => {
    const id = s.participant.id;
    setOutcome(id, 'notNow');
    showToast({
      text: `${firstName(s.participant.name)} volta para suas sugestões amanhã`,
      tone: 'info',
      action: { label: 'Desfazer', run: () => setOutcome(id, null) },
    });
  };

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
        <motion.div
          key={current.participant.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.2, ease: EASE }}
        >
          <PersonCard
            suggestion={current}
            limitReached={limitReached}
            onConnect={() => {
              setTarget(current);
              setSheetOpen(true);
            }}
            onNotNow={() => notNow(current)}
            onConnectByQr={() => openOverlay('qrscan')}
          />
        </motion.div>
      </AnimatePresence>

      <RequestSheet
        open={sheetOpen}
        suggestion={target}
        remaining={remaining}
        limit={limit}
        draft={target ? drafts.current[target.participant.id] : undefined}
        onDraft={onDraft}
        onClose={() => setSheetOpen(false)}
        onSend={send}
      />
    </div>
  );
}

/* ---------- Pedidos recebidos (C05, base) ---------- */

function RequestCard({ r, onAccept, onNotNow }: { r: PendingRequest; onAccept: () => void; onNotNow: () => void }) {
  const diamond = r.from.tier === 'diamond';
  return (
    <article
      className={cn(
        'rounded-lg border bg-surface-2 p-card shadow-card',
        diamond ? 'border-border-gold' : 'border-border-subtle',
      )}
      aria-label={`Pedido de ${r.from.name}, ${r.from.company}`}
    >
      {diamond ? (
        <p className="mb-3 flex items-center gap-2 text-caption text-text-secondary">
          <Chip variant="proposal" /> Destaque Diamond
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <Avatar name={r.from.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2">
            <span className="truncate text-body-strong text-text-primary">{r.from.name}</span>
            <TierBadge tier={r.from.tier} />
          </p>
          <p className="truncate text-caption text-text-secondary">
            {r.from.role} · {r.from.company}
          </p>
        </div>
      </div>
      <p className="mt-3 rounded-md bg-surface-1 p-3 text-body text-text-primary">{r.message}</p>
      <div className="mt-3 flex gap-3">
        <Button variant="secondary" className="basis-[40%] whitespace-nowrap px-3" onClick={onNotNow} aria-label={`Agora não para ${r.from.name}`}>
          Agora não
        </Button>
        <Button className="basis-[60%]" onClick={onAccept} aria-label={`Aceitar pedido de ${r.from.name}`}>
          Aceitar
        </Button>
      </div>
    </article>
  );
}

function RequestsPanel() {
  const pending = usePendingRequests();
  const answer = useDemo((s) => s.answerRequest);
  const showToast = useDemo((s) => s.showToast);
  if (pending.length === 0) {
    return (
      <EmptyState
        icon={<Users size={48} strokeWidth={1.5} />}
        title="Nenhum pedido novo"
        text="Quando alguém quiser se conectar com você, o pedido aparece aqui."
      />
    );
  }
  const hasDiamond = pending.some((r) => r.from.tier === 'diamond');
  return (
    <div className="flex flex-col gap-3">
      {hasDiamond ? <p className="text-caption text-text-secondary">Pedidos de participantes Diamond aparecem primeiro.</p> : null}
      <AnimatePresence initial={false}>
        {pending.map((r) => (
          <motion.div key={r.id} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2, ease: EASE }}>
            <RequestCard
              r={r}
              onAccept={() => {
                answer(r.id, 'accepted');
                haptic('success', 'conexão aceita');
                showToast({ text: `Agora você e ${firstName(r.from.name)} estão conectados`, tone: 'success' });
              }}
              onNotNow={() => answer(r.id, 'notNow')}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Minha rede (C09, base) ---------- */

function NetworkPanel() {
  const answered = useDemo((s) => s.answeredRequests);
  const people = receivedRequests
    .filter((r) => answered[r.id] === 'accepted')
    .map((r) => participants.find((p) => p.id === r.participantId)!)
    .filter(Boolean);
  if (people.length === 0) {
    return (
      <EmptyState
        icon={<ShieldCheck size={48} strokeWidth={1.5} />}
        title="Sua rede começa no primeiro aceite"
        text="Contatos aparecem aqui quando os dois aceitam a conexão."
      />
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {people.map((p) => (
        <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 p-3">
          <Avatar name={p.name} ring="gold" />
          <div className="min-w-0">
            <p className="truncate text-body-strong text-text-primary">{p.name}</p>
            <p className="truncate text-caption text-text-secondary">
              {p.role} · {p.company}
            </p>
          </div>
        </li>
      ))}
    </ul>
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
  const setActive = useDemo((s) => s.setConnectionsActive);
  const setPaused = useDemo((s) => s.setConnectionsPaused);
  const openOverlay = useDemo((s) => s.openOverlay);
  const setTab = useDemo((s) => s.setTab);
  const showToast = useDemo((s) => s.showToast);
  const pending = usePendingRequests().length;
  const [panel, setPanel] = useState<Panel>('sugestoes');
  const [moreOpen, setMoreOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);

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
            className="flex min-h-touch items-center gap-1.5 rounded-md border border-border-strong px-3 text-caption font-semibold text-text-primary active:bg-surface-3"
          >
            <ScanLine size={18} aria-hidden className="text-gold-200" /> Ler QR
          </button>
          <button
            type="button"
            aria-label="Mais opções de Conexões"
            onClick={() => setMoreOpen(true)}
            className="flex h-touch w-touch items-center justify-center rounded-md text-text-primary active:bg-surface-3"
          >
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
          <h2 className="mt-3 text-h2 text-text-primary">
            {justUpgraded ? 'Seu ingresso agora é VIP.' : 'Ative seu perfil de Conexões'}
          </h2>
          <p className="mt-1 text-body text-text-secondary">
            {justUpgraded
              ? 'Ative seu perfil em menos de 1 minuto.'
              : 'Em menos de 1 minuto você recebe sugestões de pessoas com interesses em comum e objetivos que combinam com os seus.'}
          </p>
          <Button block className="mt-5" onClick={() => setActivateOpen(true)}>
            Ativar perfil
          </Button>
          <p className="mt-2 text-center text-caption text-text-secondary">Você escolhe o que fica visível.</p>
        </section>
        <ActivateSheet
          open={activateOpen}
          onClose={() => setActivateOpen(false)}
          onActivate={() => {
            setActivateOpen(false);
            setActive(true);
            haptic('success', 'perfil ativado');
            showToast({ text: 'Perfil de Conexões ativado', tone: 'success' });
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-margin pb-4">
      {header}
      {moment === 'before' ? <p className="-mt-2 text-caption text-text-secondary">Conexões abertas antes do evento</p> : null}
      <div className="sticky top-0 z-banner -mx-margin bg-bg px-margin py-1">
        <SegmentedTabs label="Seções de Conexões" items={items} value={panel} onChange={setPanel} />
      </div>

      {!online ? (
        <StatusBanner
          tone="info"
          icon={<WifiOff size={24} />}
          title="Sem internet."
          text="Você pode ver as sugestões salvas; os pedidos saem quando a conexão voltar."
        />
      ) : null}

      {paused ? (
        <EmptyState
          icon={<PauseCircle size={48} strokeWidth={1.5} />}
          title="Seu perfil está pausado"
          text="Ninguém vê você nas sugestões e você não recebe pedidos."
          action={
            <Button block onClick={() => setPaused(false)}>
              Reativar meu perfil
            </Button>
          }
        />
      ) : panel === 'sugestoes' ? (
        <SuggestionsPanel onExplore={() => setPanel('explorar')} />
      ) : panel === 'pedidos' ? (
        <RequestsPanel />
      ) : panel === 'rede' ? (
        <NetworkPanel />
      ) : (
        <EmptyState
          icon={<Compass size={48} strokeWidth={1.5} />}
          title="Filtre por segmento para começar"
          text="Busca por segmento, cidade, objetivo e ingresso. Em desenho para a Etapa 3."
        />
      )}

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Conexões" closeLabel="Fechar opções">
        <ul className="flex flex-col">
          {[
            { label: 'Meu perfil de Conexões', Icon: UserRound, run: () => setTab('eu') },
            {
              label: paused ? 'Reativar meu perfil' : 'Pausar meu perfil',
              Icon: PauseCircle,
              run: () => {
                setPaused(!paused);
                showToast({ text: paused ? 'Perfil reativado' : 'Perfil pausado', tone: 'info' });
              },
            },
            { label: 'Privacidade', Icon: ShieldCheck, run: () => setTab('eu') },
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
