import { useState, type ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  CalendarClock,
  CalendarCheck,
  Check,
  ChevronRight,
  Circle,
  Coffee,
  FolderOpen,
  Map as MapIcon,
  Megaphone,
  QrCode,
  Share2,
  Users,
  Utensils,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useClock, useDemo } from '@/state/store';
import { agenda, sessionsOfDay } from '@/data/agenda';
import { agendaChange, edition, pinnedNotices } from '@/data/edition';
import { materials } from '@/data/materials';
import { activeProfilesCount, MIN_PROFILES_TO_SHOW } from '@/lib/affinity';
import { participants } from '@/data/participants';
import { currentSession, formatHour, formatLongDate, nextSession, toMinutes, type EventClock } from '@/lib/clock';
import { countersVisible, plural, usePendingRequests, useSuggestionQueue } from '@/lib/connections';
import { haptic } from '@/lib/haptics';
import { demoUser } from '@/data/participants';
import type { Moment, Session } from '@/data/types';
import { BentoTile } from '@/components/ui/BentoTile';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { LiveCard } from '@/components/ui/LiveCard';
import { Countdown, formatCountdownInline, spokenMinutes } from '@/components/ui/Countdown';
import { LockedPreviewTile } from '@/components/ui/LockedPreview';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Chip } from '@/components/ui/Chip';

export function greetingFor(clock: EventClock): string {
  const first = demoUser.name.split(' ')[0];
  const h = Math.floor(clock.minutes / 60);
  const g = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  return `${g}, ${first}`;
}

export function contextFor(clock: EventClock): string {
  if (clock.dayIndex === 0) return `Faltam 2 dias · ${edition.city}`;
  if (clock.dayIndex === 4) return `Evento encerrado · ${edition.city}`;
  return `Dia ${clock.dayIndex} · ${edition.city}`;
}

function nextPause(clock: EventClock): Session | undefined {
  return agenda.find(
    (s) =>
      (s.kind === 'intervalo' || s.kind === 'almoco') &&
      s.day === clock.dayIndex &&
      toMinutes(s.start) > clock.minutes,
  );
}

const BREAK_RETURN_OFFSET = 10; // "Volte ao salão às 13h20" = 10 min antes do fim do almoço

function minus(hhmm: string, min: number): string {
  const t = toMinutes(hhmm) - min;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}

/* ---------- Banner (prioridade: volte-agora > offline > intervalo/almoço > agenda) ---------- */

function HomeBanner({ moment, clock }: { moment: Moment; clock: EventClock }) {
  const online = useDemo((s) => s.online);
  const justReconnected = useDemo((s) => s.justReconnected);
  const agendaUpdated = useDemo((s) => s.agendaUpdated);
  const setAgendaUpdated = useDemo((s) => s.setAgendaUpdated);
  const setTab = useDemo((s) => s.setTab);
  const now = currentSession(clock);

  let banner: ReactNode = null;
  if (!online) {
    banner = <StatusBanner key="off" tone="info" icon={<WifiOff size={24} />} title="Sem internet." text="Agenda, mapa e credencial funcionam normalmente." />;
  } else if (justReconnected) {
    banner = <StatusBanner key="re" tone="live" icon={<Wifi size={24} />} title="Conectado de novo" />;
  } else if (moment === 'break' && now) {
    const left = toMinutes(now.end) - clock.minutes;
    banner = (
      <StatusBanner
        key="break"
        tone="info"
        icon={<Coffee size={24} />}
        title={`Intervalo · volte às ${formatHour(now.end)}`}
        text={
          <span>
            Café no foyer. Retorno <Countdown minutes={left} />
          </span>
        }
      />
    );
  } else if (moment === 'lunch' && now) {
    banner = (
      <StatusBanner
        key="lunch"
        tone="info"
        icon={<Utensils size={24} />}
        title={`Almoço até ${formatHour(now.end)}`}
        text={`Volte ao salão às ${formatHour(minus(now.end, BREAK_RETURN_OFFSET))}.`}
      />
    );
  } else if ((moment === 'live' || moment === 'break') && agendaUpdated && clock.dayIndex === agendaChange.day) {
    banner = (
      <StatusBanner
        key="agenda"
        tone="warning"
        icon={<CalendarClock size={24} />}
        title="Agenda atualizada"
        text={agendaChange.text}
        pressLabel={`Agenda atualizada: ${agendaChange.text}. Ver na Trilha`}
        onPress={() => {
          setAgendaUpdated(false);
          setTab('trilha');
        }}
      />
    );
  }
  return <AnimatePresence mode="wait">{banner}</AnimatePresence>;
}

/* ---------- Card de Conexões (VIP/Diamond) ou teaser com cadeado (Executivo) ---------- */

function ConnectionsTile({ moment, clock }: { moment: Moment; clock: EventClock }) {
  const tier = useDemo((s) => s.tier);
  const online = useDemo((s) => s.online);
  const active = useDemo((s) => s.connectionsActive);
  const paused = useDemo((s) => s.connectionsPaused);
  const setTab = useDemo((s) => s.setTab);
  const pending = usePendingRequests().length;
  const { queue } = useSuggestionQueue();

  if (tier === 'executivo') {
    const count = activeProfilesCount(participants);
    const text =
      count >= MIN_PROFILES_TO_SHOW
        ? `${count} participantes desta edição já estão se conectando`
        : 'Participantes VIP e Diamond desta edição já estão se conectando';
    return (
      <LockedPreviewTile
        title="Conexões"
        text={text}
        actionLabel="Conhecer"
        pressLabel={`Conexões, bloqueado no seu ingresso. ${text}. Conhecer.`}
        onPress={() => setTab('conexoes')}
      />
    );
  }

  const open = () => setTab('conexoes');
  const heading = 'Conexões';
  const icon = <Users size={16} className="text-gold-500" />;

  if (!online) {
    return (
      <BentoTile icon={icon} heading={heading} disabled>
        <p className="text-body text-text-secondary">Conexões voltam quando a internet voltar</p>
      </BentoTile>
    );
  }
  if (!active) {
    return (
      <BentoTile icon={icon} heading={heading} onPress={open} pressLabel="Conexões: ative seu perfil">
        {moment === 'before' ? <Chip variant="proposal" className="mb-2 self-start" /> : null}
        <p className="text-body text-text-primary">Ative seu perfil e veja quem tem interesses em comum com você.</p>
        <p className="mt-2 flex min-h-touch items-center gap-1 text-body-strong text-gold-200">
          Ativar perfil <ChevronRight size={18} aria-hidden />
        </p>
      </BentoTile>
    );
  }
  if (paused) {
    return (
      <BentoTile icon={icon} heading={heading} onPress={open} pressLabel="Conexões: perfil pausado">
        <p className="text-body text-text-secondary">Seu perfil está pausado.</p>
      </BentoTile>
    );
  }

  let line: string;
  if (moment === 'before') line = `${plural(queue.length, 'sugestão', 'sugestões')} já disponíveis`;
  else if (moment === 'endOfDay') line = 'Anote quem você conheceu hoje';
  else if (moment === 'after') line = 'Sua rede fica disponível por 90 dias';
  else if (pending === 0 && queue.length === 0) line = 'Novas sugestões no almoço';
  else {
    const parts = `${plural(pending, 'pedido', 'pedidos')} e ${plural(queue.length, 'sugestão', 'sugestões')}`;
    if (moment === 'live') {
      const pause = nextPause(clock);
      line = `${parts} esperando ${pause?.kind === 'almoco' ? 'o almoço' : 'o intervalo'}`;
    } else line = `${parts} para ver agora`;
  }

  return (
    <BentoTile icon={icon} heading={heading} onPress={open} pressLabel={`Conexões: ${line}. Ver agora`}>
      {moment === 'before' ? (
        <span className="mb-2 flex items-center gap-2">
          <Chip variant="proposal" />
          <span className="text-caption text-text-secondary">Conexões abertas antes do evento</span>
        </span>
      ) : null}
      <p className="flex items-center gap-2 text-body text-text-primary">
        {countersVisible(moment) && moment !== 'after' && moment !== 'endOfDay' && pending > 0 ? (
          <span aria-hidden className="tabular flex h-[18px] min-w-[18px] items-center justify-center rounded-pill bg-danger px-1 text-caption font-semibold text-on-gold">
            {pending}
          </span>
        ) : null}
        {line}
      </p>
      <p className="mt-1 flex min-h-touch items-center gap-1 text-body-strong text-gold-200">
        Ver agora <ChevronRight size={18} aria-hidden />
      </p>
    </BentoTile>
  );
}

/* ---------- Atalhos ---------- */

function Shortcuts({ nextSlot }: { nextSlot: ReactNode | null }) {
  const tier = useDemo((s) => s.tier);
  const openOverlay = useDemo((s) => s.openOverlay);
  const openMap = useDemo((s) => s.openMap);
  return (
    <div className="grid grid-cols-2 gap-gap">
      {nextSlot ? <div className="row-span-2">{nextSlot}</div> : null}
      <BentoTile onPress={() => openOverlay('credential')} pressLabel={`Credencial, ${edition.sectorByTier[tier]}. Abrir`} className="min-h-[112px]">
        <QrCode size={24} aria-hidden className="text-gold-500" />
        <p className="mt-auto text-body-strong text-text-primary">Credencial</p>
        <p className="text-caption text-text-secondary">{edition.sectorByTier[tier]}</p>
      </BentoTile>
      <BentoTile onPress={() => openMap('sector')} pressLabel="Mapa do local, abrir" className="min-h-[112px]">
        <MapIcon size={24} aria-hidden className="text-gold-500" />
        <p className="mt-auto text-body-strong text-text-primary">Mapa</p>
        <p className="text-caption text-text-secondary">Você está na Plenária</p>
      </BentoTile>
    </div>
  );
}

function NextTile({ clock }: { clock: EventClock }) {
  const setTab = useDemo((s) => s.setTab);
  const next = nextSession(clock);
  if (!next || next.day !== clock.dayIndex) return null;
  const minutes = toMinutes(next.start) - clock.minutes;
  const title = next.kind === 'almoco' ? 'Almoço' : next.kind === 'intervalo' ? 'Intervalo' : next.title;
  const back =
    next.kind === 'almoco'
      ? `Volte ao salão às ${formatHour(minus(next.end, BREAK_RETURN_OFFSET))}`
      : next.kind === 'intervalo'
        ? `Volte ao salão às ${formatHour(next.end)}`
        : next.location === 'Plenária principal'
          ? 'Plenária'
          : next.location;
  return (
    <BentoTile
      heading="A seguir"
      onPress={() => setTab('trilha')}
      pressLabel={`A seguir: ${title} às ${formatHour(next.start)}, ${spokenMinutes(minutes).replace('faltam', 'daqui a')}.`}
      className="h-full"
    >
      <p className="line-clamp-3 text-h2 text-text-primary">{title}</p>
      <p className="tabular mt-2 text-body-strong text-text-primary">
        {formatHour(next.start)} · <span className={minutes <= 5 ? 'text-warning' : undefined}>{formatCountdownInline(minutes)}</span>
      </p>
      <p className="mt-auto pt-2 text-caption text-text-secondary">{back}</p>
    </BentoTile>
  );
}

function WhereToEatTile() {
  const openMap = useDemo((s) => s.openMap);
  return (
    <BentoTile heading="Onde comer" icon={<Utensils size={16} className="text-gold-500" />} onPress={() => openMap('sector')} pressLabel="Onde comer: praça de alimentação no 2º andar. Ver no mapa" className="h-full">
      <p className="text-h2 text-text-primary">Praça de alimentação</p>
      <p className="mt-1 text-body text-text-secondary">2º andar, pela escada B</p>
      <p className="mt-auto pt-2 text-caption text-text-secondary">Restaurantes próximos no mapa</p>
    </BentoTile>
  );
}

function WifiTile() {
  const showToast = useDemo((s) => s.showToast);
  const openMap = useDemo((s) => s.openMap);
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(edition.venue.wifi.password);
    } catch {
      // sem permissão de área de transferência no navegador: segue a simulação
    }
    setCopied(true);
    haptic('light', 'senha do Wi-Fi copiada');
    showToast({ text: 'Senha do Wi-Fi copiada', tone: 'success' });
    window.setTimeout(() => setCopied(false), 1200);
  };
  return (
    <BentoTile onPress={() => openMap('sector')} pressLabel={`Wi-Fi ${edition.venue.wifi.network}, ver detalhes`} className="py-2">
      <div className="flex min-h-[40px] items-center gap-3">
        <Wifi size={24} aria-hidden className="text-gold-500" />
        <div className="min-w-0 flex-1">
          <p className="text-body-strong text-text-primary">Wi-Fi</p>
          <p className="truncate text-caption text-text-secondary">{edition.venue.wifi.network}</p>
        </div>
        <button
          type="button"
          onClick={copy}
          className="pointer-events-auto flex min-h-touch items-center gap-1 rounded-md px-2 text-body-strong text-gold-200 active:bg-surface-3"
        >
          {copied ? <Check size={18} aria-hidden /> : null}
          {copied ? 'Copiada' : 'Copiar senha'}
        </button>
      </div>
    </BentoTile>
  );
}

function PinnedTile() {
  const [open, setOpen] = useState(false);
  const visible = pinnedNotices.slice(0, 2);
  return (
    <>
      <BentoTile variant="pinned" heading="Avisos fixados" onPress={() => setOpen(true)} pressLabel={`Avisos fixados: ${visible.join('. ')}. Ver todos`}>
        <ul className="flex flex-col gap-1">
          {visible.map((n) => (
            <li key={n} className="text-body text-text-primary">
              {n}
            </li>
          ))}
        </ul>
        {pinnedNotices.length > 2 ? (
          <p className="mt-1 flex min-h-touch items-center text-body-strong text-gold-200">Ver todos ({pinnedNotices.length})</p>
        ) : null}
      </BentoTile>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="Avisos fixados" closeLabel="Fechar avisos">
        <ul className="flex flex-col gap-3">
          {pinnedNotices.map((n) => (
            <li key={n} className="flex items-start gap-3 rounded-md bg-surface-1 p-3 text-body text-text-primary">
              <Megaphone size={20} aria-hidden className="mt-0.5 shrink-0 text-gold-500" />
              {n}
            </li>
          ))}
        </ul>
      </BottomSheet>
    </>
  );
}

/* ---------- Cards principais por momento ---------- */

function BeforeCard() {
  const walletAdded = useDemo((s) => s.walletAdded);
  const active = useDemo((s) => s.connectionsActive);
  const tier = useDemo((s) => s.tier);
  const items: { label: string; done: boolean }[] = [
    { label: 'Credencial na Wallet', done: walletAdded },
    ...(tier !== 'executivo' ? [{ label: 'Perfil de Conexões', done: active }] : []),
    { label: 'Como chegar', done: false },
    { label: 'Estacionamento no subsolo', done: false },
  ];
  return (
    <section className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card" aria-label="Contagem para o evento">
      <p className="text-caption text-text-secondary">{formatLongDate(edition.dates[0])} · 9h</p>
      <p className="tabular mt-1 text-display text-text-primary">Faltam 2 dias</p>
      <p className="mt-1 text-body text-text-secondary">
        {edition.venue.name}. Credenciamento a partir das 7h30.
      </p>
      <ul className="mt-4 flex flex-col gap-2" aria-label="Checklist">
        {items.map((it) => (
          <li key={it.label} className="flex items-center gap-3 text-body text-text-primary">
            {it.done ? <Check size={20} aria-hidden className="text-live" /> : <Circle size={20} aria-hidden className="text-border-strong" />}
            <span className={it.done ? 'text-text-secondary' : undefined}>{it.label}</span>
            <span className="sr-only">{it.done ? ', feito' : ', pendente'}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function EndOfDayCard({ clock }: { clock: EventClock }) {
  const day = clock.dayIndex as 1 | 2 | 3;
  const blocks = sessionsOfDay(day).filter((s) => s.kind !== 'intervalo' && s.kind !== 'almoco');
  const [score, setScore] = useState<number | null>(null);
  return (
    <>
      <section className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card">
        <p className="flex items-center gap-2 text-caption font-semibold text-live">
          <CalendarCheck size={16} aria-hidden /> Dia {day} concluído
        </p>
        <p className="tabular mt-1 text-h1 text-text-primary">
          {blocks.length} de {blocks.length} blocos
        </p>
        <p className="mt-1 text-body text-text-secondary">
          {day < 3 ? 'Amanhã às 9h. Credenciamento a partir das 7h30.' : 'Obrigado por viver o Protagon com a gente.'}
        </p>
      </section>
      <section className="rounded-lg border border-border-subtle bg-surface-1 p-card shadow-card" aria-label={`Avaliação do Dia ${day}`}>
        <p className="text-body-strong text-text-primary">Como foi o Dia {day}?</p>
        <p className="text-caption text-text-secondary">De 0 a 10. Leva 10 segundos.</p>
        {score === null ? (
          <div className="mt-3 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label="Nota de 0 a 10">
            {Array.from({ length: 11 }, (_, n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={false}
                onClick={() => setScore(n)}
                className="tabular h-touch rounded-md border border-border-strong text-body-strong text-text-primary active:bg-surface-3"
              >
                {n}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 flex items-center gap-2 text-body text-live" role="status">
            <Check size={18} aria-hidden /> Obrigado. Você deu nota {score}.
          </p>
        )}
      </section>
    </>
  );
}

function AfterCards() {
  const setTab = useDemo((s) => s.setTab);
  return (
    <>
      <section className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card">
        <p className="text-caption text-text-secondary">Sua jornada</p>
        <p className="mt-1 text-h1 text-text-primary">3 dias de Protagon</p>
        <p className="mt-1 text-body text-text-secondary">Mentalidade, liderança e negócios. O plano de 90 dias começa agora.</p>
      </section>
      <BentoTile icon={<FolderOpen size={16} className="text-gold-500" />} heading="Materiais" onPress={() => setTab('materiais')} pressLabel="Materiais: todos liberados. Ver">
        <p className="tabular text-body text-text-primary">Todos os {materials.length} materiais liberados</p>
      </BentoTile>
      <BentoTile icon={<Share2 size={16} className="text-gold-500" />} heading="Indique o Protagon">
        <p className="text-body text-text-primary">Conhece alguém que precisa viver esses 3 dias?</p>
      </BentoTile>
    </>
  );
}

/* ---------- Tela ---------- */

/** A01 · Home. Ao vivo com spec completa; demais momentos com banner e card principal (Etapa 3 detalha). */
export function HomeScreen() {
  const clock = useClock();
  const moment = useDemo((s) => s.moment);
  const setTab = useDemo((s) => s.setTab);
  const now = currentSession(clock);
  const during = moment === 'live' || moment === 'break' || moment === 'lunch';
  // Intervalo e almoço: Conexões sobe para logo abaixo do banner
  const connectionsUp = moment === 'break' || moment === 'lunch';
  const next = nextSession(clock);
  const hasNextToday = Boolean(next && next.day === clock.dayIndex);

  return (
    <div className="flex flex-col gap-gap px-margin pt-2">
      <h1 className="sr-only">Agora</h1>
      <HomeBanner moment={moment} clock={clock} />

      {connectionsUp ? <ConnectionsTile moment={moment} clock={clock} /> : null}

      {moment === 'live' ? (
        now ? (
          <LiveCard session={now} clock={clock} onOpen={() => setTab('trilha')} />
        ) : (
          <BentoTile heading="A seguir">
            <p className="text-h2 text-text-primary">Começa em instantes</p>
          </BentoTile>
        )
      ) : null}
      {moment === 'before' ? <BeforeCard /> : null}
      {moment === 'endOfDay' ? <EndOfDayCard clock={clock} /> : null}
      {moment === 'after' ? <AfterCards /> : null}

      <Shortcuts nextSlot={moment === 'lunch' ? <WhereToEatTile /> : hasNextToday ? <NextTile clock={clock} /> : null} />

      {during ? <WifiTile /> : null}
      {moment !== 'after' ? <PinnedTile /> : null}

      {!connectionsUp ? <ConnectionsTile moment={moment} clock={clock} /> : null}
      <div className="h-2" />
    </div>
  );
}
