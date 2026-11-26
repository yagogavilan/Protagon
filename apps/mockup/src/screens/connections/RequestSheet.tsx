import { useEffect, useId, useState } from 'react';
import { CircleAlert, LockOpen } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { requestTemplates, type Suggestion } from '@/lib/affinity';
import { cn } from '@/lib/cn';

export const MESSAGE_MAX = 280;
const WARN_AT = MESSAGE_MAX - 20;

interface RequestSheetProps {
  open: boolean;
  suggestion: Suggestion | null;
  remaining: number;
  limit: number;
  /** Rascunho por pessoa, guardado até sair da aba (C02: fecha sem confirmação) */
  draft?: { choice: number; text: string };
  onDraft: (id: string, draft: { choice: number; text: string }) => void;
  onClose: () => void;
  onSend: (s: Suggestion, message: string) => Promise<void>;
}

/** C04 · Pedido de conexão (BottomSheet tall): 3 modelos + "Escrever a minha", campo 280, contador do limite (D4). */
export function RequestSheet({ open, suggestion, remaining, limit, draft, onDraft, onClose, onSend }: RequestSheetProps) {
  const templates = suggestion ? requestTemplates(suggestion) : [];
  const [choice, setChoice] = useState(0);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const groupId = useId();
  const fieldId = useId();

  useEffect(() => {
    if (!suggestion) return;
    setChoice(draft?.choice ?? 0);
    setText(draft?.text ?? requestTemplates(suggestion)[0] ?? '');
    setError(false);
    setSending(false);
  }, [suggestion?.participant.id, open]);

  if (!suggestion) return null;
  const p = suggestion.participant;
  const first = p.name.split(' ')[0];

  const pick = (i: number) => {
    setChoice(i);
    const next = i < templates.length ? templates[i] ?? '' : '';
    setText(next);
    onDraft(p.id, { choice: i, text: next });
    if (i === templates.length) window.setTimeout(() => document.getElementById(fieldId)?.focus(), 0);
  };

  const send = async () => {
    setSending(true);
    setError(false);
    try {
      await onSend(suggestion, text.trim());
    } catch {
      setError(true);
      setSending(false);
    }
  };

  const options = [...templates, 'Escrever a minha'];
  const low = remaining <= 3;

  return (
    <BottomSheet
      open={open}
      size="tall"
      onClose={onClose}
      title={`Pedido para ${p.name}`}
      subtitle={p.company}
      closeLabel="Fechar pedido"
      footer={
        <>
          {error ? (
            <p role="alert" className="flex items-start gap-2 text-body text-danger">
              <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0" />
              Não conseguimos enviar o pedido. Confira a internet e tente de novo.
            </p>
          ) : null}
          <Button block loading={sending} disabled={text.trim().length === 0} onClick={send}>
            {error ? 'Tentar de novo' : 'Enviar pedido'}
          </Button>
          <p className={cn('tabular text-center text-caption', low ? 'text-warning' : 'text-text-secondary')}>
            Restam {remaining} de {limit} pedidos hoje
          </p>
        </>
      }
    >
      <p id={groupId} className="text-body-strong text-text-primary">
        Escolha uma mensagem
      </p>
      <div role="radiogroup" aria-labelledby={groupId} className="mt-2 flex flex-col gap-1">
        {options.map((opt, i) => {
          const checked = i === choice;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={checked}
              onClick={() => pick(i)}
              className={cn(
                'flex min-h-touch items-start gap-3 rounded-md px-2 py-2 text-left active:bg-surface-3',
                checked && 'bg-surface-1',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-pill border-2',
                  checked ? 'border-gold-500' : 'border-border-strong',
                )}
              >
                {checked ? <span className="h-2.5 w-2.5 rounded-pill bg-gold-500" /> : null}
              </span>
              <span className={cn('line-clamp-2 text-body', checked ? 'text-text-primary' : 'text-text-secondary')}>{opt}</span>
            </button>
          );
        })}
      </div>

      <label htmlFor={fieldId} className="sr-only">
        Mensagem para {first}
      </label>
      <textarea
        id={fieldId}
        value={text}
        maxLength={MESSAGE_MAX}
        rows={4}
        inputMode="text"
        autoCorrect="on"
        onChange={(e) => {
          const v = e.target.value.slice(0, MESSAGE_MAX);
          setText(v);
          onDraft(p.id, { choice, text: v });
        }}
        className="mt-3 w-full resize-none rounded-md border border-border-strong bg-surface-3 p-3 text-body text-text-primary placeholder:text-text-secondary focus:border-gold-200 focus:outline-none"
        placeholder={`Escreva para ${first}`}
      />
      <p
        className={cn('tabular mt-1 text-right text-caption', text.length >= WARN_AT ? 'text-warning' : 'text-text-secondary')}
        aria-live={text.length >= WARN_AT ? 'polite' : 'off'}
      >
        {text.length} / {MESSAGE_MAX}
      </p>
      <p className="mt-2 flex items-center gap-2 text-body text-text-secondary">
        <LockOpen size={16} aria-hidden className="text-gold-200" />
        Seus contatos só aparecem se {first} aceitar.
      </p>
    </BottomSheet>
  );
}
