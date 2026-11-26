import { Lock } from 'lucide-react';
import { InfoRow, PlaceholderScreen } from './PlaceholderScreen';
import { TierBadge } from '@/components/ui/TierBadge';
import { useClock, useDemo, DAILY_REQUEST_LIMIT } from '@/state/store';
import { currentSession, formatHour, materialStatus, MOMENT_LABEL, nextSession } from '@/lib/clock';
import { countSimilarPeople, rankSuggestions } from '@/lib/affinity';
import { demoUser, participants } from '@/data/participants';
import { sessionsOfDay } from '@/data/agenda';
import { materials } from '@/data/materials';
import { edition } from '@/data/edition';

export function AgoraScreen() {
  const clock = useClock();
  const moment = useDemo((s) => s.moment);
  const now = currentSession(clock);
  const next = nextSession(clock);
  return (
    <PlaceholderScreen codes="A01 a A05">
      <InfoRow label="Momento" value={MOMENT_LABEL[moment]} />
      <InfoRow label="Acontecendo agora" value={now ? `${now.title} · até ${formatHour(now.end)}` : 'Nada no palco agora'} />
      <InfoRow label="A seguir" value={next ? `${formatHour(next.start)} · ${next.title}` : 'Evento encerrado'} />
      <InfoRow label="Local" value={`${edition.venue.name} · Wi-Fi ${edition.venue.wifi.network}`} />
    </PlaceholderScreen>
  );
}

export function TrilhaScreen() {
  const day = useDemo((s) => s.day);
  const sessions = sessionsOfDay(day);
  return (
    <PlaceholderScreen codes="T01 e T02">
      <InfoRow label={`Dia ${day} · ${sessions[0]?.theme ?? ''}`} value={`${sessions.length} blocos, de ${formatHour(sessions[0]?.start ?? '09:00')} a ${formatHour(sessions.at(-1)?.start ?? '19:00')}`} />
    </PlaceholderScreen>
  );
}

export function ConexoesScreen() {
  const tier = useDemo((s) => s.tier);
  const day = useDemo((s) => s.day);
  const active = useDemo((s) => s.connectionsActive);
  const sent = useDemo((s) => s.requestsSentByDay[day]);
  if (tier === 'executivo') {
    const count = countSimilarPeople(demoUser, participants);
    return (
      <PlaceholderScreen codes="C00">
        <InfoRow
          label="Cadeado (contador real)"
          value={
            <span>
              <Lock size={16} aria-hidden className="mr-1.5 inline align-[-2px] text-gold-200" />
              <span className="tabular">{count}</span> pessoas com interesses parecidos com os seus estão aqui
            </span>
          }
        />
      </PlaceholderScreen>
    );
  }
  const top = rankSuggestions(demoUser, participants).slice(0, 3);
  return (
    <PlaceholderScreen codes="C01 a C11">
      <InfoRow label="Perfil de Conexões" value={active ? 'Ativado' : 'Não ativado'} />
      <InfoRow label="Pedidos hoje" value={<span className="tabular">{`${sent} de ${DAILY_REQUEST_LIMIT[tier]}`}</span>} />
      {top.map(({ participant, affinity }) => (
        <InfoRow key={participant.id} label={`${participant.company} · ${participant.objectives[0] ?? ''}`} value={affinity.reason} />
      ))}
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
