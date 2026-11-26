import { useState } from 'react';
import { AtSign, Briefcase, Check, Copy, Ellipsis, MessageCircle, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { TierBadge } from '@/components/ui/TierBadge';
import { contactFor } from '@/data/content';
import { objectiveLabel } from '@/lib/affinity';
import { receivedRequests } from '@/data/requests';
import { useDemo, DAILY_REQUEST_LIMIT } from '@/state/store';
import { findParticipant, firstName, useRelation, useSuggestionFor } from '@/lib/connections';
import { haptic } from '@/lib/haptics';
import { participants } from '@/data/participants';

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const showToast = useDemo((s) => s.showToast);
  const [copied, setCopied] = useState(false);
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-3 text-gold-200" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-caption text-text-secondary">{label}</span>
        <span className="block select-all truncate text-body text-text-primary">{value}</span>
      </span>
      <button
        type="button"
        aria-label={`Copiar ${label}`}
        onClick={() => {
          void navigator.clipboard?.writeText(value).catch(() => undefined);
          setCopied(true);
          haptic('light', `${label} copiado`);
          showToast({ text: `${label} copiado`, tone: 'success' });
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className="flex h-touch w-touch shrink-0 items-center justify-center rounded-md text-text-secondary active:bg-surface-3"
      >
        {copied ? <Check size={20} aria-hidden className="text-live" /> : <Copy size={20} aria-hidden />}
      </button>
    </li>
  );
}

/** C03 · Perfil da pessoa: antes do aceite, pedido enviado (Pendente), pedido recebido e conectados (contatos visíveis). */
export function ProfileScreen() {
  const id = useDemo((s) => s.overlayId) ?? '';
  const person = findParticipant(id) ?? participants[0]!;
  const suggestion = useSuggestionFor(person);
  const relation = useRelation(person.id);
  const tier = useDemo((s) => s.tier);
  const day = useDemo((s) => s.day);
  const sent = useDemo((s) => s.requestsSentByDay[day]);
  const note = useDemo((s) => s.privateNotes[person.id] ?? '');
  const setNote = useDemo((s) => s.setPrivateNote);
  const setRequestFor = useDemo((s) => s.setRequestFor);
  const setSafetyFor = useDemo((s) => s.setSafetyFor);
  const setMeetFor = useDemo((s) => s.setMeetFor);
  const openOverlay = useDemo((s) => s.openOverlay);
  const answerRequest = useDemo((s) => s.answerRequest);
  const showToast = useDemo((s) => s.showToast);
  const online = useDemo((s) => s.online);

  const { affinity } = suggestion;
  const high = affinity.level === 'alta';
  const limit = DAILY_REQUEST_LIMIT[tier];
  const limitReached = sent >= limit;
  const incoming = receivedRequests.find((r) => r.participantId === person.id && relation === 'incoming');
  const contacts = contactFor(person);
  const common = person.interests.filter((t) => affinity.sharedInterests.includes(t));
  const others = person.interests.filter((t) => !common.includes(t));

  let footer: React.ReactNode = null;
  if (relation === 'none') {
    footer = limitReached ? (
      <>
        <Button block disabled>
          Limite de hoje atingido
        </Button>
        <p className="text-center text-caption text-text-secondary">Você usou os {limit} pedidos de hoje. Pelo QR da credencial, os pedidos continuam liberados.</p>
      </>
    ) : (
      <Button block onClick={() => setRequestFor(person.id)} aria-label={`Conectar com ${person.name}`}>
        Conectar
      </Button>
    );
  } else if (relation === 'pending') {
    footer = (
      <p className="flex min-h-button items-center justify-center gap-2 rounded-md border border-border-strong text-body text-text-secondary" role="status">
        Pedido enviado · Pendente
      </p>
    );
  } else if (relation === 'incoming' && incoming) {
    footer = (
      <div className="flex gap-3">
        <Button variant="secondary" className="basis-[40%] whitespace-nowrap px-3" onClick={() => answerRequest(incoming.id, 'notNow')}>
          Agora não
        </Button>
        <Button
          className="basis-[60%]"
          onClick={() => {
            answerRequest(incoming.id, 'accepted');
            haptic('success', 'conexão aceita');
            showToast({ text: `Agora você e ${firstName(person.name)} estão conectados`, tone: 'success' });
          }}
        >
          Aceitar
        </Button>
      </div>
    );
  } else if (relation === 'connected') {
    footer = (
      <div className="flex gap-3">
        <Button variant="secondary" className="flex-1 px-3" onClick={() => setMeetFor({ id: person.id, mode: 'new' })}>
          Vamos nos ver?
        </Button>
        <Button className="flex-1 px-3" icon={<MessageCircle size={20} aria-hidden />} onClick={() => openOverlay('chat', person.id)}>
          Conversar
        </Button>
      </div>
    );
  }

  return (
    <OverlayPage
      title="Perfil"
      action={
        <button type="button" onClick={() => setSafetyFor(person.id)} aria-label="Mais opções de segurança" className="flex h-touch w-touch items-center justify-center rounded-md text-text-primary active:bg-surface-3">
          <Ellipsis size={24} aria-hidden />
        </button>
      }
      footer={footer}
    >
      <div className="flex flex-col gap-4">
        <header>
          {high ? (
            <span className="inline-flex h-7 items-center gap-1 rounded-pill bg-gradient-gold px-2.5 text-caption font-semibold text-on-gold">
              <Sparkles size={14} aria-hidden /> Afinidade alta
            </span>
          ) : affinity.level === 'boa' ? (
            <Chip>Afinidade boa</Chip>
          ) : null}
          <h2 className="mt-2 text-h1 text-text-primary">{person.company}</h2>
          <p className="text-body text-text-secondary">
            {person.segment} · {person.city}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {person.objectives.map((o) => (
              <Chip key={o} variant="objective">
                {objectiveLabel(o)}
              </Chip>
            ))}
          </div>
        </header>

        <div className="flex items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 p-card">
          <Avatar name={person.name} size="lg" ring={relation === 'connected' ? 'gold' : 'none'} decorative={false} />
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2">
              <span className="text-body-strong text-text-primary">{person.name}</span>
              <TierBadge tier={person.tier} />
            </p>
            <p className="text-body text-text-secondary">{person.role}</p>
            {relation === 'connected' ? <p className="text-caption text-gold-200">Conectados</p> : null}
          </div>
        </div>

        {incoming ? (
          <section className="rounded-lg border border-border-gold bg-surface-2 p-card" aria-label="Mensagem do pedido">
            <p className="text-caption text-text-secondary">{firstName(person.name)} quer se conectar com você</p>
            <p className="mt-1 text-body text-text-primary">{incoming.message}</p>
          </section>
        ) : null}

        {affinity.reason ? (
          <section aria-label="Por que sugerimos" className="rounded-lg border border-border-subtle bg-surface-1 p-card">
            <p className="text-caption text-text-secondary">Por que vale conversar</p>
            <p className="mt-1 text-body text-text-primary">{affinity.reason}</p>
          </section>
        ) : null}

        <section aria-label="Interesses">
          <h3 className="text-body-strong text-text-primary">Interesses</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {common.map((t) => (
              <Chip key={t} variant="common">
                {t}
              </Chip>
            ))}
            {others.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
          </div>
        </section>

        {relation === 'connected' ? (
          <>
            <section aria-label="Contatos" className="rounded-lg border border-border-gold bg-surface-2 p-card">
              <h3 className="text-body-strong text-text-primary">Contatos</h3>
              <ul className="mt-3 flex flex-col gap-3">
                <ContactRow icon={<Phone size={20} />} label="WhatsApp" value={contacts.whatsapp} />
                <ContactRow icon={<Briefcase size={20} />} label="LinkedIn" value={contacts.linkedin} />
                <ContactRow icon={<AtSign size={20} />} label="Instagram" value={contacts.instagram} />
              </ul>
            </section>
            <section aria-label="Nota privada" className="flex flex-col gap-2">
              <label htmlFor="private-note" className="text-body-strong text-text-primary">
                Nota privada
              </label>
              <textarea
                id="private-note"
                value={note}
                rows={3}
                maxLength={500}
                placeholder={`Só você vê. Ex.: o que combinar com ${firstName(person.name)}.`}
                onChange={(e) => setNote(person.id, e.target.value)}
                className="w-full resize-none rounded-md border border-border-strong bg-surface-3 p-3 text-body text-text-primary placeholder:text-text-secondary focus:border-gold-200 focus:outline-none"
              />
            </section>
          </>
        ) : (
          <section className="flex items-start gap-3 rounded-lg border border-border-subtle bg-surface-1 p-card" aria-label="Contatos">
            <ShieldCheck size={24} aria-hidden className="mt-0.5 shrink-0 text-gold-500" />
            <p className="text-body text-text-secondary">
              <span className="text-text-primary">Telefone e redes aparecem depois do aceite.</span> Quando os dois aceitam, você vê WhatsApp, LinkedIn e Instagram de {firstName(person.name)}.
            </p>
          </section>
        )}
        {!online && relation === 'none' ? <p className="text-caption text-text-secondary">Sem internet: o pedido fica salvo e sai quando a conexão voltar.</p> : null}
      </div>
    </OverlayPage>
  );
}
