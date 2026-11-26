import { useEffect, useRef, useState, type FormEvent } from 'react';
import { CalendarCheck, CalendarClock, Clock3, Ellipsis, Hourglass, Map as MapIcon, Send } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useClock, useDemo } from '@/state/store';
import { findParticipant, firstName, meetingLabel, useRelation } from '@/lib/connections';
import { scrollToEnd } from '@/lib/scroll';
import { haptic } from '@/lib/haptics';
import { participants } from '@/data/participants';
import type { ChatMessage } from '@/data/types';
import { Users } from 'lucide-react';
import { cn } from '@/lib/cn';

const NO_MESSAGES: ChatMessage[] = [];

function MeetingCard({ id, name }: { id: string; name: string }) {
  const meeting = useDemo((s) => s.meetings[id]);
  const setMeeting = useDemo((s) => s.setMeeting);
  const setMeetFor = useDemo((s) => s.setMeetFor);
  const openMap = useDemo((s) => s.openMap);
  const showToast = useDemo((s) => s.showToast);
  const clock = useClock();
  if (!meeting) return null;
  const label = meetingLabel(meeting, clock);
  const confirmed = meeting.status === 'confirmed';

  return (
    <section
      aria-label="Encontro"
      className={cn('rounded-lg border p-card', confirmed ? 'border-live bg-tint-live' : meeting.status === 'counter' ? 'border-warning bg-tint-warning' : 'border-border-gold bg-surface-2')}
    >
      <p className="flex items-center gap-2 text-caption font-semibold text-text-primary">
        {confirmed ? <CalendarCheck size={16} aria-hidden className="text-live" /> : meeting.status === 'counter' ? <CalendarClock size={16} aria-hidden className="text-warning" /> : <Hourglass size={16} aria-hidden className="text-gold-200" />}
        {confirmed
          ? 'Encontro confirmado'
          : meeting.status === 'counter'
            ? `${name} sugeriu outro horário`
            : meeting.by === 'me'
              ? 'Você propôs um encontro'
              : `${name} propôs um encontro`}
      </p>
      <p className="tabular mt-1 text-h2 text-text-primary">{label}</p>
      <p className="text-body text-text-secondary">
        {confirmed
          ? 'Combinado. Chegue 2 minutos antes.'
          : meeting.by === 'me'
            ? `Aguardando ${name} confirmar ou sugerir outro horário.`
            : 'Confirme ou sugira outro horário.'}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {meeting.by === 'them' && !confirmed ? (
          <>
            <Button
              size="compact"
              className="flex-1 px-3"
              onClick={() => {
                setMeeting(id, { ...meeting, status: 'confirmed' });
                haptic('success', 'encontro confirmado');
                showToast({ text: `Encontro confirmado: ${label}`, tone: 'success' });
              }}
            >
              Confirmar
            </Button>
            <Button size="compact" variant="secondary" className="flex-1 px-3" onClick={() => setMeetFor({ id, mode: 'counter' })}>
              Outro horário
            </Button>
          </>
        ) : null}
        {meeting.by === 'me' && !confirmed ? (
          <Button size="compact" variant="ghost" onClick={() => setMeeting(id, null)}>
            Cancelar proposta
          </Button>
        ) : null}
        {confirmed ? (
          <>
            <Button size="compact" variant="secondary" className="px-3" icon={<MapIcon size={18} aria-hidden />} onClick={() => openMap(meeting.point)}>
              Ver no mapa
            </Button>
            <Button size="compact" variant="ghost" onClick={() => setMeeting(id, null)}>
              Cancelar encontro
            </Button>
          </>
        ) : null}
      </div>
    </section>
  );
}

/** C07 · Chat só entre conectados: primeira mensagem, conversa e encontro (proposto, confirmado, outro horário). */
export function ChatScreen() {
  const id = useDemo((s) => s.overlayId) ?? '';
  const person = findParticipant(id) ?? participants[0]!;
  const relation = useRelation(person.id);
  const messages = useDemo((s) => s.chats[person.id] ?? NO_MESSAGES);
  const moment = useDemo((s) => s.moment);
  const sendChat = useDemo((s) => s.sendChat);
  const setMeetFor = useDemo((s) => s.setMeetFor);
  const setSafetyFor = useDemo((s) => s.setSafetyFor);
  const openOverlay = useDemo((s) => s.openOverlay);
  const meeting = useDemo((s) => s.meetings[person.id]);
  const [text, setText] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const name = firstName(person.name);

  useEffect(() => {
    scrollToEnd(endRef.current);
  }, [messages.length, meeting?.status]);

  if (relation !== 'connected') {
    return (
      <OverlayPage title="Chat">
        <EmptyState
          icon={<Users size={48} strokeWidth={1.5} />}
          title="O chat abre depois do aceite"
          text={`Você e ${name} conversam por aqui quando os dois aceitam a conexão.`}
          action={
            <Button block variant="secondary" onClick={() => openOverlay('person', person.id)}>
              Ver perfil
            </Button>
          }
        />
      </OverlayPage>
    );
  }

  const submit = (e?: FormEvent) => {
    e?.preventDefault();
    const v = text.trim();
    if (!v) return;
    sendChat(person.id, v);
    setText('');
    haptic('light', 'mensagem enviada');
  };

  const breakers = [`Oi, ${name}! Gostei do seu perfil.`, `Oi, ${name}. Vamos nos ver no próximo intervalo?`, `Oi, ${name}. Como posso ajudar a ${person.company}?`];

  return (
    <OverlayPage
      title={name}
      action={
        <button type="button" onClick={() => setSafetyFor(person.id)} aria-label="Mais opções de segurança" className="flex h-touch w-touch items-center justify-center rounded-md text-text-primary active:bg-surface-3">
          <Ellipsis size={24} aria-hidden />
        </button>
      }
      footer={
        <form onSubmit={submit} className="flex items-end gap-2">
          <label htmlFor="chat-input" className="sr-only">
            Mensagem para {name}
          </label>
          <input
            id="chat-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Escreva para ${name}`}
            maxLength={500}
            className="h-12 min-w-0 flex-1 rounded-pill border border-border-strong bg-surface-3 px-4 text-body text-text-primary placeholder:text-text-secondary focus:border-gold-200 focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Enviar mensagem"
            disabled={!text.trim()}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill bg-gradient-cta text-on-cta disabled:bg-none disabled:bg-surface-3 disabled:text-text-tertiary"
          >
            <Send size={20} aria-hidden />
          </button>
        </form>
      }
    >
      <div className="flex flex-col gap-3 pt-1">
        <div className="rounded-lg border border-border-subtle bg-surface-1 p-3">
          <p className="text-body-strong text-text-primary">{person.company}</p>
          <p className="text-caption text-text-secondary">
            {person.name} · {person.role}
          </p>
          <p className="text-caption text-gold-200" aria-label={`Instagram ${person.instagram}`}>
            {person.instagram}
          </p>
        </div>

        {moment === 'live' ? (
          <p className="flex items-start gap-2 text-caption text-text-secondary" role="status">
            <Clock3 size={14} aria-hidden className="mt-0.5 shrink-0" /> Palestra em andamento. As mensagens que você enviar chegam no intervalo.
          </p>
        ) : null}

        {messages.length === 0 ? (
          <section aria-label="Primeira mensagem" className="flex flex-col gap-2">
            <p className="text-body text-text-secondary">Vocês estão conectados. Comece com uma mensagem pronta ou escreva a sua:</p>
            {breakers.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => {
                  setText(b);
                  document.getElementById('chat-input')?.focus();
                }}
                className="min-h-touch rounded-lg border border-border-strong px-3 py-2 text-left text-body text-text-primary active:bg-surface-3"
              >
                {b}
              </button>
            ))}
          </section>
        ) : (
          <ul className="flex flex-col gap-2" aria-label="Mensagens">
            {messages.map((m) => (
              <li key={m.id} className={cn('flex flex-col', m.from === 'me' ? 'items-end' : 'items-start')}>
                <p
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-body',
                    m.from === 'me' ? 'rounded-br-sm bg-surface-3 text-text-primary' : 'rounded-bl-sm border border-border-subtle bg-surface-1 text-text-primary',
                  )}
                >
                  {m.text}
                </p>
                <span className="tabular mt-0.5 text-caption text-text-tertiary">
                  {m.at}
                  {m.queued ? ' · entrega no intervalo' : ''}
                </span>
              </li>
            ))}
          </ul>
        )}

        <MeetingCard id={person.id} name={name} />
        {!meeting ? (
          <Button variant="secondary" size="compact" className="self-start px-4" icon={<CalendarClock size={18} aria-hidden />} onClick={() => setMeetFor({ id: person.id, mode: 'new' })}>
            Vamos nos ver?
          </Button>
        ) : null}
        <div ref={endRef} />
      </div>
    </OverlayPage>
  );
}
