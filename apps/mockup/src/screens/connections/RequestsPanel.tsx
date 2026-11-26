import { AnimatePresence, motion } from 'motion/react';
import { Check, MessageCircle, Undo2, Users } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { TierBadge } from '@/components/ui/TierBadge';
import { receivedRequests } from '@/data/requests';
import { useDemo } from '@/state/store';
import { findParticipant, firstName, usePendingRequests, type PendingRequest } from '@/lib/connections';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';

const EASE = [0.2, 0.8, 0.2, 1] as const;

function RequestCard({ r, onAccept, onNotNow, onOpen }: { r: PendingRequest; onAccept: () => void; onNotNow: () => void; onOpen: () => void }) {
  const diamond = r.from.tier === 'diamond';
  return (
    <article className={cn('rounded-lg border bg-surface-2 p-card shadow-card', diamond ? 'border-border-gold' : 'border-border-subtle')} aria-label={`Pedido de ${r.from.name}, ${r.from.company}`}>
      {diamond ? (
        <p className="mb-3 flex items-center gap-2 text-body text-text-secondary">
          <Chip variant="proposal" /> Destaque Diamond
        </p>
      ) : null}
      <button type="button" onClick={onOpen} aria-label={`Ver perfil de ${r.from.name}`} className="flex w-full items-center gap-3 rounded-md text-left active:bg-surface-3">
        <Avatar name={r.from.name} size="md" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate text-body-strong text-text-primary">{r.from.name}</span>
            <TierBadge tier={r.from.tier} />
          </span>
          <span className="block truncate text-caption text-text-secondary">
            {r.from.role} · {r.from.company}
          </span>
        </span>
      </button>
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

/** C05 · Pedidos recebidos: aceitar (com vibração) e "Agora não" em silêncio (D5). */
export function RequestsPanel() {
  const pending = usePendingRequests();
  const answered = useDemo((s) => s.answeredRequests);
  const moment = useDemo((s) => s.moment);
  const answer = useDemo((s) => s.answerRequest);
  const showToast = useDemo((s) => s.showToast);
  const openOverlay = useDemo((s) => s.openOverlay);
  const setMeetFor = useDemo((s) => s.setMeetFor);

  const resolved = receivedRequests
    .filter((r) => answered[r.id])
    .map((r) => ({ r, from: findParticipant(r.participantId)!, outcome: answered[r.id]! }))
    .filter((x) => Boolean(x.from));

  if (pending.length === 0 && resolved.length === 0) {
    return <EmptyState icon={<Users size={48} strokeWidth={1.5} />} title="Nenhum pedido novo" text="Quando alguém quiser se conectar com você, o pedido aparece aqui." />;
  }
  const hasDiamond = pending.some((r) => r.from.tier === 'diamond');

  return (
    <div className="flex flex-col gap-3">
      {moment === 'live' ? <p className="text-body text-text-secondary">Palestra em andamento. Responda com calma no intervalo.</p> : null}
      {hasDiamond ? <p className="text-body text-text-secondary">Pedidos de participantes Diamond aparecem primeiro.</p> : null}
      {pending.length === 0 ? <p className="text-body text-text-secondary">Você respondeu a todos os pedidos.</p> : null}

      <AnimatePresence initial={false}>
        {pending.map((r) => (
          <motion.div key={r.id} layout exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2, ease: EASE }}>
            <RequestCard
              r={r}
              onOpen={() => openOverlay('person', r.from.id)}
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

      {resolved.map(({ r, from, outcome }) =>
        outcome === 'accepted' ? (
          <motion.section
            key={r.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="rounded-lg border border-border-gold bg-surface-2 p-card"
            aria-label={`Conectados com ${from.name}`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={from.name} size="md" ring="gold" />
                <motion.span aria-hidden initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 rounded-pill ring-2 ring-gold-500" />
              </div>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-body-strong text-text-primary">
                  <Check size={18} aria-hidden className="text-live" /> Conectados com {firstName(from.name)}
                </p>
                <p className="truncate text-caption text-text-secondary">{from.company}</p>
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              <Button size="compact" variant="secondary" className="flex-1 px-3" onClick={() => setMeetFor({ id: from.id, mode: 'new' })}>
                Vamos nos ver?
              </Button>
              <Button size="compact" className="flex-1 px-3" icon={<MessageCircle size={18} aria-hidden />} onClick={() => openOverlay('chat', from.id)}>
                Conversar
              </Button>
            </div>
          </motion.section>
        ) : (
          <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex items-start gap-3 rounded-lg border border-dashed border-border-strong p-3">
            <p className="min-w-0 flex-1 text-body text-text-secondary">
              Você respondeu “Agora não” para {from.name}. Nenhum aviso é enviado: do outro lado, o pedido segue como Pendente.
            </p>
            <button type="button" onClick={() => answer(r.id, null)} className="flex min-h-touch shrink-0 items-center gap-1 rounded-md px-2 text-body-strong text-gold-200 active:bg-surface-3">
              <Undo2 size={16} aria-hidden /> Desfazer
            </button>
          </motion.div>
        ),
      )}
    </div>
  );
}
