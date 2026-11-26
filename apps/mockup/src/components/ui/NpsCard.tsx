import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from './Button';
import { useDemo } from '@/state/store';
import type { NpsKey } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';

/** Avaliação de 0 a 10 (U04 e card do fim do dia / depois do evento). Pendente, selecionada e respondida. */
export function NpsCard({ npsKey, question, className }: { npsKey: NpsKey; question: string; className?: string }) {
  const saved = useDemo((s) => s.nps[npsKey]);
  const setNps = useDemo((s) => s.setNps);
  const showToast = useDemo((s) => s.showToast);
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);

  const answered = Boolean(saved) && !editing;

  return (
    <section className={cn('rounded-lg border border-border-subtle bg-surface-1 p-card shadow-card', className)} aria-label={question}>
      <p className="text-body-strong text-text-primary">{question}</p>
      <p className="text-caption text-text-secondary">De 0 a 10. Leva 10 segundos.</p>
      {answered && saved ? (
        <div className="mt-3 flex items-center justify-between gap-2" role="status">
          <p className="flex items-start gap-2 text-body text-live">
            <Check size={18} aria-hidden className="mt-1 shrink-0" />
            <span>
              Obrigado. Você deu nota <span className="tabular">{saved.score}</span>.
            </span>
          </p>
          <button
            type="button"
            onClick={() => {
              setScore(saved.score);
              setComment(saved.comment);
              setEditing(true);
            }}
            className="min-h-touch rounded-md px-2 text-body-strong text-gold-200 active:bg-surface-3"
          >
            Alterar
          </button>
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Nota de 0 a 10">
            {Array.from({ length: 11 }, (_, n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={score === n}
                onClick={() => setScore(n)}
                className={cn(
                  'tabular h-touch rounded-md border text-body-strong active:bg-surface-3',
                  score === n ? 'border-gold-500 bg-tint-gold text-gold-200' : 'border-border-strong text-text-primary',
                )}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-caption text-text-secondary">
            <span>Nada provável</span>
            <span>Muito provável</span>
          </div>
          {score !== null ? (
            <div className="mt-3 flex flex-col gap-2">
              <label htmlFor={`nps-${npsKey}`} className="text-caption text-text-secondary">
                Quer contar o motivo? (opcional)
              </label>
              <textarea
                id={`nps-${npsKey}`}
                value={comment}
                maxLength={280}
                rows={2}
                onChange={(e) => setComment(e.target.value)}
                className="w-full resize-none rounded-md border border-border-strong bg-surface-3 p-3 text-body text-text-primary focus:border-gold-200 focus:outline-none"
              />
              <Button
                block
                size="compact"
                onClick={() => {
                  setNps(npsKey, score, comment.trim());
                  setEditing(false);
                  haptic('success', 'avaliação enviada');
                  showToast({ text: 'Avaliação enviada. Obrigado', tone: 'success' });
                }}
              >
                Enviar avaliação
              </Button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
