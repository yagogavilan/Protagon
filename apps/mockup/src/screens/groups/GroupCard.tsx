import { Check, UsersRound, WifiOff } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { BentoTile } from '@/components/ui/BentoTile';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Countdown } from '@/components/ui/Countdown';
import { FORMATION } from '@/data/groups';
import { formatHour, type EventClock } from '@/lib/clock';
import { groupLabel, isComplete, listedGroups, vacancies, type Group } from '@/lib/groups';
import { minutesToClose } from '@/lib/groups';
import { FEW_TEXT, FEW_TITLE, personFor, useFeatures, useFormation, useMyGroup } from '@/state/features';
import { useClock, useDemo } from '@/state/store';
import { plural } from '@/lib/connections';

/** Texto "Falta 1 pessoa" / "Faltam 2 pessoas" */
function missingText(g: Group): string {
  const n = vacancies(g);
  return n === 1 ? 'Falta 1 pessoa' : `Faltam ${n} pessoas`;
}

export function GroupStatusLine({ group }: { group: Group }) {
  return (
    <>
      {groupLabel(group)} · {isComplete(group) ? 'completo' : `${group.memberIds.length} de ${group.targetSize}`}
    </>
  );
}

/** GR01 · conteúdo do card "Forme seu grupo", igual na Home e no bloco da Trilha. */
function FormationBody({ clock, embedded }: { clock: EventClock; embedded?: boolean }) {
  const tier = useDemo((s) => s.tier);
  const online = useDemo((s) => s.online);
  const moment = useDemo((s) => s.moment);
  const groups = useFeatures((s) => s.groups);
  const openOverlay = useDemo((s) => s.openOverlay);
  const setWifiOpen = useDemo((s) => s.setWifiOpen);
  const open = listedGroups(groups, tier).length;
  const few = useFeatures((s) => s.fewInCategory);
  const openMap = useDemo((s) => s.openMap);
  const live = moment === 'live';
  const left = minutesToClose(clock);

  // GR-19: poucos alunos na categoria. Sem botão de criar nem lista: o time decide fora do app
  if (few)
    return (
      <>
        <p className={embedded ? 'text-body-strong text-text-primary' : 'text-h2 text-text-primary'}>{FEW_TITLE}</p>
        <p className="mt-1 text-body text-text-secondary">{FEW_TEXT}</p>
        <Button size="compact" variant="ghost" className="mt-2 self-start" onClick={() => openMap('booth')}>
          Ver estande
        </Button>
      </>
    );

  return (
    <>
      {embedded ? null : <p className="text-h2 text-text-primary">Forme seu grupo de 3</p>}
      <p className={embedded ? 'text-body text-text-secondary' : 'mt-1 text-body text-text-secondary'}>
        {live ? `Formação aberta até ${formatHour(FORMATION.closesAt)}. Você pode entrar no intervalo.` : 'Pessoas com o mesmo ingresso que você, para os 3 dias.'}
      </p>
      {live ? null : (
        <p className="tabular mt-2 flex flex-wrap items-center gap-x-1 text-body-strong text-text-primary">
          Fecha às {formatHour(FORMATION.closesAt)} · <Countdown minutes={left} />
        </p>
      )}
      <p className="mt-1 text-caption text-text-secondary">{open > 0 ? `${plural(open, 'grupo com vaga agora', 'grupos com vaga agora')}` : 'Nenhum grupo com vaga agora'}</p>
      {online ? (
        <Button block variant={live ? 'secondary' : 'primary'} className="mt-3" onClick={() => openOverlay('groups')}>
          Formar meu grupo
        </Button>
      ) : (
        <div className="mt-3 flex flex-col gap-1">
          <p className="flex items-start gap-2 text-body text-text-primary">
            <WifiOff size={20} aria-hidden className="mt-0.5 shrink-0" /> Sem internet. Para entrar em um grupo você precisa de conexão.
          </p>
          <Button size="compact" variant="ghost" className="self-start" onClick={() => setWifiOpen(true)}>
            Ver Wi-Fi
          </Button>
        </div>
      )}
    </>
  );
}

function ClosedBody() {
  const openMap = useDemo((s) => s.openMap);
  return (
    <>
      <p className="text-h2 text-text-primary">A formação terminou</p>
      <p className="mt-1 text-body text-text-secondary">O time vai encaixar você em um grupo. Se quiser saber agora, passe no estande.</p>
      <Button size="compact" variant="ghost" className="mt-2 self-start" onClick={() => openMap('booth')}>
        Ver estande
      </Button>
    </>
  );
}

/** Tile "Meu grupo" (grupo 1/3, 2/3, completo ou encaixado pelo time) */
export function MyGroupTile({ group }: { group: Group }) {
  const openOverlay = useDemo((s) => s.openOverlay);
  const tier = useDemo((s) => s.tier);
  const complete = isComplete(group);
  const label = `Meu grupo: ${groupLabel(group)}, ${complete ? 'completo' : `${group.memberIds.length} de ${group.targetSize}. ${missingText(group)}`}. Abrir`;
  return (
    <BentoTile icon={<UsersRound size={16} className="text-gold-500" />} heading="Meu grupo" onPress={() => openOverlay('myGroup')} pressLabel={label}>
      <p className="tabular text-h2 text-text-primary">
        <GroupStatusLine group={group} />
      </p>
      <div className="mt-2 flex items-center justify-between gap-2">
        {complete ? (
          <span className="flex -space-x-2" aria-hidden>
            {group.memberIds.slice(0, 4).map((m) => (
              <span key={m} className="rounded-pill ring-2 ring-surface-1">
                <Avatar name={personFor(m, tier).name} size="sm" />
              </span>
            ))}
          </span>
        ) : (
          <p className="text-caption text-text-secondary">{missingText(group)}</p>
        )}
        {group.placedByTeam ? <Chip>Encaixado pelo time</Chip> : null}
      </div>
    </BentoTile>
  );
}

/**
 * GR01 na Home: "Forme seu grupo" durante a formação, "Meu grupo" depois. Sem cadeado e igual nos 3 ingressos
 * (grupos não dependem de Conexões). Antes de abrir e depois do evento, a Home não mostra nada.
 */
export function GroupHomeCard() {
  const formation = useFormation();
  const group = useMyGroup();
  const moment = useDemo((s) => s.moment);
  const clock = useClock();
  if (moment === 'before' || moment === 'after') return null;
  if (group) return <MyGroupTile group={group} />;
  if (formation === 'open')
    return (
      <BentoTile variant="emphasis" icon={<UsersRound size={16} className="text-gold-500" />} heading="Grupos">
        <FormationBody clock={clock} />
      </BentoTile>
    );
  // Depois do Dia 1 o time já encaixou quem ficou sem grupo: sem aviso fixo nos outros dias
  if (formation === 'closed' && clock.dayIndex === 1)
    return (
      <BentoTile icon={<UsersRound size={16} className="text-gold-500" />} heading="Grupos">
        <ClosedBody />
      </BentoTile>
    );
  return null;
}

/** Conteúdo do bloco "Formação dos grupos" na Trilha (T01): mesmo conteúdo do card, sem cabeçalho */
export function GroupTrilhaBody() {
  const formation = useFormation();
  const group = useMyGroup();
  const clock = useClock();
  const openOverlay = useDemo((s) => s.openOverlay);
  if (group)
    return (
      <div className="mt-1 flex flex-col gap-2">
        <p className="tabular flex items-center gap-2 text-body-strong text-text-primary">
          {isComplete(group) ? <Check size={18} aria-hidden className="text-live" /> : null}
          <GroupStatusLine group={group} />
        </p>
        <Button size="compact" variant="secondary" className="self-start" onClick={() => openOverlay('myGroup')}>
          Ver meu grupo
        </Button>
      </div>
    );
  if (formation === 'before') return <p className="mt-1 text-body text-text-secondary">Abre às {formatHour(FORMATION.opensAt)}.</p>;
  if (formation === 'closed')
    return <p className="mt-1 text-body text-text-secondary">A formação terminou. O time vai encaixar você em um grupo. Se quiser saber agora, passe no estande.</p>;
  return (
    <div className="mt-1 flex flex-col">
      <FormationBody clock={clock} embedded />
    </div>
  );
}

