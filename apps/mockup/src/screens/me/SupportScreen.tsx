import { useState } from 'react';
import { ChevronDown, Mail, MapPin, MessageSquare, Phone } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/FilterChip';
import { edition } from '@/data/edition';
import { faq } from '@/data/content';
import { useDemo } from '@/state/store';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';

const TOPICS = ['Ingresso', 'Credencial', 'Conexões', 'Outro assunto'];

/** U05 · Suporte e FAQ: perguntas frequentes e fale com o CS. */
export function SupportScreen() {
  const online = useDemo((s) => s.online);
  const openMap = useDemo((s) => s.openMap);
  const showToast = useDemo((s) => s.showToast);
  const [open, setOpen] = useState<number | null>(0);
  const [sheet, setSheet] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]!);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const send = () => {
    setSending(true);
    window.setTimeout(() => {
      setSending(false);
      setSheet(false);
      setText('');
      haptic('success', 'mensagem ao suporte');
      showToast({ text: 'Mensagem enviada. Respondemos em até 2 horas.', tone: 'success' });
    }, 900);
  };

  return (
    <OverlayPage title="Suporte e FAQ">
      <div className="flex flex-col gap-4">
        <section aria-label="Falar com o suporte" className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card">
          <h2 className="text-body-strong text-text-primary">Falar com o CS</h2>
          <p className="mt-1 text-caption text-text-secondary">{edition.support.hours}</p>
          <ul className="mt-3 flex flex-col gap-2 text-body text-text-primary">
            <li className="flex items-center gap-2">
              <Phone size={18} aria-hidden className="text-gold-200" /> <span className="tabular select-all">{edition.support.phone}</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={18} aria-hidden className="text-gold-200" /> <span className="select-all">{edition.support.email}</span>
            </li>
          </ul>
          <Button block className="mt-3" icon={<MessageSquare size={20} aria-hidden />} disabled={!online} onClick={() => setSheet(true)}>
            Enviar mensagem
          </Button>
          {!online ? <p className="mt-2 text-center text-caption text-text-secondary">Sem internet: ligue para o número acima.</p> : null}
          <Button block variant="ghost" className="mt-1" icon={<MapPin size={18} aria-hidden />} onClick={() => openMap('checkin')}>
            Balcão de atendimento no mapa
          </Button>
        </section>

        <section aria-label="Perguntas frequentes">
          <h2 className="text-body-strong text-text-primary">Perguntas frequentes</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {faq.map((f, i) => {
              const expanded = open === i;
              return (
                <li key={f.q} className="rounded-lg border border-border-subtle bg-surface-1">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? null : i)}
                    className="flex min-h-touch w-full items-center gap-3 rounded-lg px-3 py-2 text-left active:bg-surface-3"
                  >
                    <span className="flex-1 text-body text-text-primary">{f.q}</span>
                    <ChevronDown size={20} aria-hidden className={cn('shrink-0 text-text-secondary transition-transform duration-base', expanded && 'rotate-180')} />
                  </button>
                  {expanded ? <p className="px-3 pb-3 text-body text-text-secondary">{f.a}</p> : null}
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        size="tall"
        title="Falar com o CS"
        closeLabel="Fechar"
        footer={
          <Button block loading={sending} disabled={text.trim().length < 5} onClick={send}>
            Enviar mensagem
          </Button>
        }
      >
        <p className="text-body-strong text-text-primary">Assunto</p>
        <div className="mt-1 flex flex-wrap gap-x-2">
          {TOPICS.map((t) => (
            <FilterChip key={t} selected={topic === t} onClick={() => setTopic(t)}>
              {t}
            </FilterChip>
          ))}
        </div>
        <label htmlFor="support-msg" className="mt-3 block text-body-strong text-text-primary">
          Mensagem
        </label>
        <textarea
          id="support-msg"
          value={text}
          rows={5}
          maxLength={500}
          onChange={(e) => setText(e.target.value)}
          placeholder="Conte o que aconteceu."
          className="mt-1 w-full resize-none rounded-md border border-border-strong bg-surface-3 p-3 text-body text-text-primary placeholder:text-text-secondary focus:border-gold-200 focus:outline-none"
        />
      </BottomSheet>
    </OverlayPage>
  );
}
