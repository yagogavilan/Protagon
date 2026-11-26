import { useState, type ReactNode } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  Car,
  CalendarClock,
  CalendarCheck,
  Check,
  ChevronRight,
  Circle,
  Coffee,
  Copy,
  FolderOpen,
  Link2,
  MapPin,
  Map as MapIcon,
  Megaphone,
  Navigation,
  QrCode,
  Share2,
  Users,
  Utensils,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useClock, useDemo, usePauseStage } from '@/state/store';
import { Wordmark } from '@/components/brand/Brand';
import { NpsCard } from '@/components/ui/NpsCard';
import { Button } from '@/components/ui/Button';
import { packingChecklist } from '@/data/content';
import { agenda, sessionsOfDay } from '@/data/agenda';
import { agendaChange, edition, pinnedNotices } from '@/data/edition';
import { materials, materialsOfDay } from '@/data/materials';
import { activeProfilesCount, MIN_PROFILES_TO_SHOW } from '@/lib/affinity';
import { participants } from '@/data/participants';
import { currentSession, formatHour, formatLongDate, materialStatus, nextSession, toMinutes, type EventClock } from '@/lib/clock';
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
  const openOverlay = useDemo((s) => s.openOverlay);
  const stage = usePauseStage();
  const now = currentSession(clock);

  let banner: ReactNode = null;
  if (!online) {
    banner = <StatusBanner key="off" tone="info" icon={<WifiOff size={24} />} title="Sem internet." text="Agenda, mapa e credencial funcionam normalmente." />;
  } else if (justReconnected) {
    banner = <StatusBanner key="re" tone="live" icon={<Wifi size={24} />} title="Conectado de novo" />;
  } else if ((moment === 'break' || moment === 'lunch') && now) {
    const isLunch = moment === 'lunch';
    const returnAt = isLunch ? minus(now.end, BREAK_RETURN_OFFSET) : now.end;
    const left = toMinutes(returnAt) - clock.minutes;
    const Icon = isLunch ? Utensils : Coffee;
    if (stage === 'now') {
      banner = (
        <StatusBanner
          key="now"
          tone="warning"
          alert
          icon={<Icon size={24} />}
          title="Volte agora ao salão"
          text={`A próxima sessão começa em instantes. Toque para ver seu setor.`}
          pressLabel="Volte agora ao salão. Abrir tela do intervalo"
          onPress={() => openOverlay('break')}
        />
      );
    } else if (stage === 'five') {
      banner = (
        <StatusBanner
          key="five"
          tone="warning"
          icon={<Icon size={24} />}
          title="Faltam 5 min. Volte ao salão"
          text={<span>Retorno às {formatHour(returnAt)}.</span>}
          pressLabel="Faltam 5 minutos. Abrir tela do intervalo"
          onPress={() => openOverlay('break')}
        />
      );
    } else {
      banner = (
        <StatusBanner
          key={moment}
          tone="info"
          icon={<Icon size={24} />}
          title={isLunch ? `Almoço até ${formatHour(now.end)}` : `Intervalo · volte às ${formatHour(now.end)}`}
          text={
            isLunch ? (
              `Volte ao salão às ${formatHour(returnAt)}.`
            ) : (
              <span>
                Café no foyer. Retorno <Countdown minutes={left} />
              </span>
            )
          }
          pressLabel={`${isLunch ? 'Almoço' : 'Intervalo'}. Abrir tela cheia com a contagem`}
          onPress={() => openOverlay('break')}
        />
      );
    }
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
  const connectedCount = useDemo((s) => Object.keys(s.connected).length);
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
  else if (moment === 'after')
    line = connectedCount > 0 ? `${plural(connectedCount, 'conexão feita', 'conexões feitas')}. Exporte os contatos` : 'Sua rede fica disponível por 90 dias';
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
  const openOverlay = useDemo((s) => s.openOverlay);
  return (
    <BentoTile heading="Onde comer" icon={<Utensils size={16} className="text-gold-500" />} onPress={() => openOverlay('eat')} pressLabel="Onde comer: praça de alimentação no 2º andar. Ver opções" className="h-full">
      <p className="text-h2 text-text-primary">Praça de alimentação</p>
      <p className="mt-1 text-body text-text-secondary">2º andar, pela escada B</p>
      <p className="mt-auto pt-2 text-caption text-text-secondary">Restaurantes próximos também</p>
    </BentoTile>
  );
}

function WifiTile() {
  const showToast = useDemo((s) => s.showToast);
  const setWifiOpen = useDemo((s) => s.setWifiOpen);
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
    <BentoTile onPress={() => setWifiOpen(true)} pressLabel={`Wi-Fi ${edition.venue.wifi.network}, ver detalhes`} className="py-2">
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

function remainingToStart(clock: EventClock): { days: number; hours: number; minutes: number } {
  const start = new Date(`${edition.dates[0]}T09:00:00`).getTime();
  const nowMs = new Date(`${clock.date}T${clock.time}:00`).getTime();
  const diff = Math.max(0, Math.round((start - nowMs) / 60000));
  return { days: Math.floor(diff / 1440), hours: Math.floor((diff % 1440) / 60), minutes: diff % 60 };
}

function BeforeCard({ clock }: { clock: EventClock }) {
  const walletAdded = useDemo((s) => s.walletAdded);
  const checklist = useDemo((s) => s.checklist);
  const toggle = useDemo((s) => s.toggleChecklist);
  const r = remainingToStart(clock);
  const items = packingChecklist.map((it) => ({ ...it, done: it.id === 'cred' ? walletAdded || Boolean(checklist[it.id]) : Boolean(checklist[it.id]) }));
  const done = items.filter((i) => i.done).length;
  return (
    <>
      <section className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card" aria-label="Contagem para o evento">
        <Wordmark width={170} />
        <p className="mt-4 text-caption text-text-secondary">{formatLongDate(edition.dates[0])} · 9h</p>
        <p className="sr-only">
          Faltam {r.days} dias, {r.hours} horas e {r.minutes} minutos
        </p>
        <div className="mt-2 grid grid-cols-3 gap-2" aria-hidden>
          {[
            { v: r.days, l: r.days === 1 ? 'dia' : 'dias' },
            { v: r.hours, l: 'horas' },
            { v: r.minutes, l: 'min' },
          ].map((x) => (
            <div key={x.l} className="rounded-md bg-surface-1 py-2 text-center">
              <p className="tabular text-display text-text-primary">{String(x.v).padStart(2, '0')}</p>
              <p className="text-caption text-text-secondary">{x.l}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-body text-text-secondary">Credenciamento a partir das 7h30, no foyer térreo.</p>
      </section>

      <section className="rounded-lg border border-border-subtle bg-surface-1 p-card shadow-card" aria-label="O que levar">
        <p className="flex items-center justify-between text-body-strong text-text-primary">
          O que levar
          <span className="tabular text-caption text-text-secondary">
            {done} de {items.length}
          </span>
        </p>
        <ul className="mt-2 flex flex-col">
          {items.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={it.done}
                onClick={() => toggle(it.id)}
                className="flex min-h-touch w-full items-center gap-3 rounded-md text-left text-body text-text-primary active:bg-surface-3"
              >
                {it.done ? <Check size={20} aria-hidden className="text-live" /> : <Circle size={20} aria-hidden className="text-border-strong" />}
                <span className={it.done ? 'text-text-secondary line-through' : undefined}>{it.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <LocalTile />
    </>
  );
}

function LocalTile() {
  const openMap = useDemo((s) => s.openMap);
  const showToast = useDemo((s) => s.showToast);
  return (
    <>
      <BentoTile heading="Local" icon={<MapPin size={16} className="text-gold-500" />}>
        <p className="text-h2 text-text-primary">{edition.venue.name}</p>
        <p className="mt-1 text-body text-text-secondary">{edition.venue.address}</p>
        <div className="mt-3 flex gap-2">
          <Button
            size="compact"
            variant="secondary"
            className="flex-1 px-2"
            icon={<Navigation size={18} aria-hidden />}
            onClick={() => showToast({ text: 'Abriria o app de mapas (simulado)', tone: 'info' })}
          >
            Como chegar
          </Button>
          <Button size="compact" variant="secondary" className="flex-1 px-2" icon={<MapIcon size={18} aria-hidden />} onClick={() => openMap('sector')}>
            Ver no mapa
          </Button>
        </div>
      </BentoTile>
      <BentoTile heading="Estacionamento" icon={<Car size={16} className="text-gold-500" />}>
        <p className="text-body text-text-primary">{edition.venue.parking}</p>
      </BentoTile>
    </>
  );
}

function EndOfDayCard({ clock }: { clock: EventClock }) {
  const day = clock.dayIndex as 1 | 2 | 3;
  const blocks = sessionsOfDay(day).filter((s) => s.kind !== 'intervalo' && s.kind !== 'almoco');
  const dayMaterials = materialsOfDay(day);
  const released = dayMaterials.filter((m) => materialStatus(clock, m) === 'released').length;
  const connectedCount = useDemo((s) => Object.keys(s.connected).length);
  const tier = useDemo((s) => s.tier);
  const setTab = useDemo((s) => s.setTab);
  const tomorrow = day < 3 ? sessionsOfDay((day + 1) as 2 | 3)[0] : undefined;
  return (
    <>
      <section className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card">
        <p className="flex items-center gap-2 text-caption font-semibold text-live">
          <CalendarCheck size={16} aria-hidden /> Dia {day} concluído
        </p>
        <p className="tabular mt-1 text-h1 text-text-primary">
          {blocks.length} de {blocks.length} blocos
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border-subtle pt-3">
          <div>
            <dt className="text-caption text-text-secondary">Materiais do dia</dt>
            <dd className="tabular text-body-strong text-text-primary">{released} liberados</dd>
          </div>
          {tier !== 'executivo' ? (
            <div>
              <dt className="text-caption text-text-secondary">Conexões</dt>
              <dd className="tabular text-body-strong text-text-primary">{plural(connectedCount, 'pessoa', 'pessoas')}</dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-3 text-body text-text-secondary">
          {tomorrow ? `Amanhã às ${formatHour(tomorrow.start)}: ${tomorrow.title}. Credenciamento a partir das 7h30.` : 'Obrigado por viver o Protagon com a gente.'}
        </p>
        <button
          type="button"
          onClick={() => setTab('materiais')}
          className="-mx-2 mt-1 flex min-h-touch items-center gap-1 rounded-md px-2 text-body-strong text-gold-200 active:bg-surface-3"
        >
          Ver materiais do dia <ChevronRight size={18} aria-hidden />
        </button>
      </section>
      <NpsCard npsKey={String(day) as '1' | '2' | '3'} question={`Como foi o Dia ${day}?`} />
    </>
  );
}

function ShareSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const showToast = useDemo((s) => s.showToast);
  const link = 'protagon.exemplo/indique/rafael-m';
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Indique o Protagon"
      closeLabel="Fechar"
      footer={
        <>
          <Button
            block
            icon={<Copy size={20} aria-hidden />}
            onClick={() => {
              void navigator.clipboard?.writeText(link).catch(() => undefined);
              showToast({ text: 'Link copiado', tone: 'success' });
              onClose();
            }}
          >
            Copiar link
          </Button>
          <Button
            block
            variant="secondary"
            onClick={() => {
              showToast({ text: 'Abriria o WhatsApp (simulado)', tone: 'info' });
              onClose();
            }}
          >
            Enviar pelo WhatsApp
          </Button>
        </>
      }
    >
      <p className="text-body text-text-secondary">Quem você indicar ganha prioridade na lista de espera da próxima edição.</p>
      <p className="mt-3 flex items-center gap-2 rounded-md bg-surface-1 p-3 text-body text-text-primary">
        <Link2 size={20} aria-hidden className="shrink-0 text-gold-500" />
        <span className="select-all break-all">{link}</span>
      </p>
      <p className="mt-2 text-caption text-text-secondary">Benefício de indicação: proposta, ainda não definido pela diretoria.</p>
    </BottomSheet>
  );
}

function AfterCards() {
  const setTab = useDemo((s) => s.setTab);
  const [share, setShare] = useState(false);
  const blocks = agenda.filter((s) => s.kind !== 'intervalo' && s.kind !== 'almoco').length;
  return (
    <>
      <section className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card">
        <Wordmark width={150} />
        <p className="mt-4 text-caption text-text-secondary">Resumo da sua jornada</p>
        <p className="mt-1 text-h1 text-text-primary">3 dias de Protagon</p>
        <p className="mt-1 text-body text-text-secondary">Mentalidade, liderança e negócios. O plano de 90 dias começa agora.</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 border-t border-border-subtle pt-3">
          <div>
            <dt className="text-caption text-text-secondary">Blocos</dt>
            <dd className="tabular text-body-strong text-text-primary">{blocks} concluídos</dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Materiais</dt>
            <dd className="tabular text-body-strong text-text-primary">{materials.length} liberados</dd>
          </div>
        </dl>
      </section>
      <BentoTile icon={<FolderOpen size={16} className="text-gold-500" />} heading="Materiais" onPress={() => setTab('materiais')} pressLabel="Materiais: todos liberados. Ver">
        <p className="tabular text-body text-text-primary">Todos os {materials.length} materiais liberados</p>
        <p className="mt-1 text-caption text-text-secondary">Ficam no app por 90 dias. Baixe para ler sem internet.</p>
      </BentoTile>
      <NpsCard npsKey="final" question="Como foi o Protagon?" />
      <section className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card" aria-label="Indique o Protagon">
        <p className="flex items-center gap-2 text-caption text-text-secondary">
          <Share2 size={16} aria-hidden className="text-gold-500" /> Indique o Protagon
        </p>
        <p className="mt-1 text-h2 text-text-primary">Conhece alguém que precisa viver esses 3 dias?</p>
        <Button block variant="secondary" className="mt-3" onClick={() => setShare(true)}>
          Compartilhar com um amigo
        </Button>
      </section>
      <ShareSheet open={share} onClose={() => setShare(false)} />
    </>
  );
}

/* ---------- Tela ---------- */

/** A01 · Home nos 6 momentos: antes, ao vivo, intervalo, almoço, fim do dia e depois do evento. */
export function HomeScreen() {
  const clock = useClock();
  const moment = useDemo((s) => s.moment);
  const openOverlay = useDemo((s) => s.openOverlay);
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
          <LiveCard session={now} clock={clock} onOpen={() => openOverlay('session', now.id)} />
        ) : (
          <BentoTile heading="A seguir">
            <p className="text-h2 text-text-primary">Começa em instantes</p>
          </BentoTile>
        )
      ) : null}
      {moment === 'before' ? <BeforeCard clock={clock} /> : null}
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
