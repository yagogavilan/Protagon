import { InfoRow, PlaceholderScreen } from './PlaceholderScreen';
import { TierBadge } from '@/components/ui/TierBadge';
import { useClock, useDemo } from '@/state/store';
import { formatHour, materialStatus } from '@/lib/clock';
import { demoUser } from '@/data/participants';
import { sessionsOfDay } from '@/data/agenda';
import { materials } from '@/data/materials';

export function TrilhaScreen() {
  const day = useDemo((s) => s.day);
  const sessions = sessionsOfDay(day);
  return (
    <PlaceholderScreen codes="T01 e T02">
      <InfoRow label={`Dia ${day} · ${sessions[0]?.theme ?? ''}`} value={`${sessions.length} blocos, de ${formatHour(sessions[0]?.start ?? '09:00')} a ${formatHour(sessions.at(-1)?.start ?? '19:00')}`} />
    </PlaceholderScreen>
  );
}

export function MateriaisScreen() {
  const clock = useClock();
  const released = materials.filter((m) => materialStatus(clock, m) === 'released').length;
  return (
    <PlaceholderScreen codes="M01 e M02">
      <InfoRow label="Materiais liberados" value={<span className="tabular">{`${released} de ${materials.length}`}</span>} />
    </PlaceholderScreen>
  );
}

export function EuScreen() {
  const tier = useDemo((s) => s.tier);
  return (
    <PlaceholderScreen codes="U01 a U05">
      <InfoRow
        label="Perfil"
        value={
          <span className="flex flex-col gap-2">
            <span>{demoUser.name} · {demoUser.role}, {demoUser.company}</span>
            <span className="tabular text-text-secondary">CPF {demoUser.cpfMasked}</span>
            <TierBadge tier={tier} className="self-start" />
          </span>
        }
      />
    </PlaceholderScreen>
  );
}
