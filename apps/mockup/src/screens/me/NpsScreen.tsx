import { CalendarClock } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { NpsCard } from '@/components/ui/NpsCard';
import type { NpsKey } from '@/data/types';
import { useClock, useDemo } from '@/state/store';
import { npsAvailable } from './nps';

const KEYS: { key: NpsKey; question: string; opens: string }[] = [
  { key: '1', question: 'Como foi o Dia 1?', opens: 'Abre no fim do Dia 1' },
  { key: '2', question: 'Como foi o Dia 2?', opens: 'Abre no fim do Dia 2' },
  { key: '3', question: 'Como foi o Dia 3?', opens: 'Abre no fim do Dia 3' },
  { key: 'final', question: 'Como foi o Protagon?', opens: 'Abre depois do evento' },
];

/** U04 · Avaliação do dia e NPS final: pendente, respondida e fechada. */
export function NpsScreen() {
  const clock = useClock();
  const moment = useDemo((s) => s.moment);
  return (
    <OverlayPage title="Avaliação">
      <div className="flex flex-col gap-3">
        <p className="text-body text-text-secondary">Sua nota ajuda a melhorar o próximo dia e a próxima edição.</p>
        {KEYS.map((k) =>
          npsAvailable(k.key, clock, moment) ? (
            <NpsCard key={k.key} npsKey={k.key} question={k.question} />
          ) : (
            <div key={k.key} className="flex items-center gap-3 rounded-lg border border-dashed border-border-strong p-card">
              <CalendarClock size={20} aria-hidden className="shrink-0 text-text-secondary" />
              <div>
                <p className="text-body text-text-primary">{k.question}</p>
                <p className="text-caption text-text-secondary">{k.opens}</p>
              </div>
            </div>
          ),
        )}
      </div>
    </OverlayPage>
  );
}
