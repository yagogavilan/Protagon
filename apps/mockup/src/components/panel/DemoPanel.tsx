import { BellRing, CalendarCheck, CalendarClock, Maximize2, Network, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TIER_LABEL } from '@/components/ui/TierBadge';
import { PanelSection, Segmented, Toggle } from './controls';
import { useClock, useDemo, DAILY_REQUEST_LIMIT, type NotifPermission } from '@/state/store';
import { formatLongDate, MOMENT_LABEL, PAUSE_PHASE_LABEL, type PausePhase } from '@/lib/clock';
import { goTo, SCREEN_CODES } from '@/lib/nav';
import { notificationTemplates } from '@/data/notifications';
import type { DayNumber, Moment, Tier } from '@/data/types';
import { NOT_FOUND_CPF } from '@/screens/LoginScreen';
import { INVALID_CODE } from '@/screens/CodeScreen';
import { useState } from 'react';

const TIERS: Tier[] = ['executivo', 'vip', 'diamond'];
const MOMENTS: Moment[] = ['before', 'live', 'break', 'lunch', 'endOfDay', 'after'];
const PHASES: PausePhase[] = ['start', 'five', 'now'];
const PERMS: { value: NotifPermission; label: string }[] = [
  { value: 'unknown', label: 'Pendente' },
  { value: 'granted', label: 'Permitida' },
  { value: 'denied', label: 'Negada' },
];
const GROUPS = Array.from(new Set(SCREEN_CODES.map((c) => c.group)));

/** Painel de demonstração: fica fora da moldura e controla o estado do mockup */
export function DemoPanel() {
  const s = useDemo();
  const clock = useClock();
  const [template, setTemplate] = useState('');
  const dayDisabled = s.moment === 'before' || s.moment === 'after';
  const pause = s.moment === 'break' || s.moment === 'lunch';
  const inApp = s.auth === 'app';
  const templates = notificationTemplates.filter((t) => !t.minTier || s.tier !== 'executivo');

  return (
    <aside
      aria-label="Painel de demonstração"
      className="no-scrollbar flex w-full max-w-[420px] flex-col gap-5 rounded-xl border border-border-subtle bg-surface-1 p-5 shadow-card lg:max-h-[calc(100vh-32px)] lg:w-[340px] lg:overflow-y-auto"
    >
      <header className="flex flex-col gap-1">
        <p className="text-caption uppercase tracking-[0.2em] text-gold-200">Painel de demonstração</p>
        <p className="text-[15px] leading-[22px] text-text-secondary">
          Relógio do evento: <span className="tabular font-semibold text-text-primary">{clock.time}</span> · {formatLongDate(clock.date)}
        </p>
      </header>

      <PanelSection title="Ir direto para">
        <label htmlFor="go-to" className="sr-only">
          Ir direto para uma tela
        </label>
        <select
          id="go-to"
          value=""
          onChange={(e) => {
            if (e.target.value) goTo(e.target.value);
          }}
          className="min-h-[48px] w-full rounded-md border border-border-strong bg-surface-1 px-3 text-[15px] text-text-primary"
        >
          <option value="">Escolha um código (E01 a U05)</option>
          {GROUPS.map((g) => (
            <optgroup key={g} label={g}>
              {SCREEN_CODES.filter((c) => c.group === g).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} · {c.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <p className="text-caption text-text-tertiary">Ajusta ingresso, perfil e momento quando a tela exige.</p>
      </PanelSection>

      <PanelSection title="Ingresso">
        <Segmented label="Ingresso" value={s.tier} onChange={s.setTier} options={TIERS.map((t) => ({ value: t, label: TIER_LABEL[t] }))} />
      </PanelSection>

      <PanelSection title="Momento">
        <Segmented label="Momento do evento" value={s.moment} onChange={s.setMoment} columns={2} options={MOMENTS.map((m) => ({ value: m, label: MOMENT_LABEL[m] }))} />
        {pause ? (
          <>
            <p className="text-caption text-text-tertiary">Posição na pausa (A02)</p>
            <Segmented label="Posição na pausa" value={s.pausePhase} onChange={s.setPausePhase} options={PHASES.map((p) => ({ value: p, label: PAUSE_PHASE_LABEL[p] }))} />
            <Button variant="secondary" size="compact" icon={<Maximize2 size={16} aria-hidden />} onClick={() => goTo('A02')} disabled={!inApp}>
              Abrir tela cheia
            </Button>
          </>
        ) : null}
      </PanelSection>

      <PanelSection title="Dia">
        <Segmented<DayNumber> label="Dia do evento" value={s.day} onChange={s.setDay} options={([1, 2, 3] as const).map((d) => ({ value: d, label: `Dia ${d}` }))} />
        {dayDisabled ? <p className="text-caption text-text-tertiary">O dia vale para os momentos durante o evento.</p> : null}
      </PanelSection>

      <PanelSection title="Simular">
        <label htmlFor="tpl" className="sr-only">
          Notificação a disparar
        </label>
        <select
          id="tpl"
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="min-h-[48px] w-full rounded-md border border-border-strong bg-surface-1 px-3 text-[15px] text-text-primary"
        >
          <option value="">Próxima do momento</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </select>
        <Button variant="secondary" block icon={<BellRing size={18} aria-hidden />} onClick={() => s.fireNotification(template || undefined)} disabled={!inApp}>
          Disparar notificação
        </Button>
        {!inApp ? <p className="text-caption text-text-tertiary">Entre no app para receber notificações.</p> : null}
        {s.held.length > 0 ? (
          <p className="text-caption text-text-secondary">{s.held.length} em espera até o intervalo (durante a palestra só chegam avisos operacionais).</p>
        ) : null}
        <Toggle label="Sem internet" hint="Banner offline; credencial segue" checked={!s.online} onChange={(v) => s.setOnline(!v)} />
        <Toggle label="Tela bloqueada" hint="Push e Live Activity" checked={s.locked} onChange={s.setLocked} />
        <p className="text-caption text-text-tertiary">Permissão de notificações (E04)</p>
        <Segmented label="Permissão de notificações" value={s.notifPermission} onChange={s.setNotifPermission} options={PERMS} />
      </PanelSection>

      <PanelSection title="Conexões">
        {s.tier === 'executivo' ? (
          <p className="text-caption text-text-tertiary">Executivo vê a aba com cadeado (C00). Troque o ingresso para VIP ou Diamond.</p>
        ) : (
          <>
            <Toggle label="Perfil ativado" hint="Desligado mostra o convite para ativar" checked={s.connectionsActive} onChange={s.setConnectionsActive} />
            <div className="flex items-center justify-between gap-2 rounded-md border border-border-subtle bg-surface-1 px-3 py-2">
              <span className="tabular text-[15px] text-text-primary">
                Pedidos hoje: {s.requestsSentByDay[s.day]} de {DAILY_REQUEST_LIMIT[s.tier]}
              </span>
              <span className="flex gap-1">
                <button type="button" onClick={() => s.setRequestsSent(DAILY_REQUEST_LIMIT[s.tier])} className="min-h-[40px] rounded-md px-2 text-[14px] font-semibold text-gold-200">
                  Esgotar
                </button>
                <button type="button" onClick={() => s.setRequestsSent(0)} className="min-h-[40px] rounded-md px-2 text-[14px] font-semibold text-gold-200">
                  Zerar
                </button>
              </span>
            </div>
            <Button variant="secondary" size="compact" icon={<Network size={16} aria-hidden />} onClick={s.seedNetwork}>
              Carregar rede de exemplo
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" size="compact" className="px-2" icon={<CalendarCheck size={16} aria-hidden />} onClick={() => s.simulateMeetingReply('confirm')}>
                Outro confirma
              </Button>
              <Button variant="secondary" size="compact" className="px-2" icon={<CalendarClock size={16} aria-hidden />} onClick={() => s.simulateMeetingReply('counter')}>
                Outro horário
              </Button>
            </div>
            <p className="text-caption text-text-tertiary">Os dois botões respondem ao último encontro que você propôs no chat.</p>
          </>
        )}
      </PanelSection>

      <PanelSection title="Home">
        <Toggle label="Agenda atualizada" hint="Banner na sessão ao vivo e no intervalo (Dia 1)" checked={s.agendaUpdated} onChange={s.setAgendaUpdated} />
      </PanelSection>

      <PanelSection title="Vibração simulada">
        <p className="text-[14px] leading-5 text-text-secondary" aria-live="polite">
          {s.lastHaptic ? `Última: ${s.lastHaptic.label}` : 'Nenhuma ainda. No iPhone e no desktop o navegador não vibra; o registro aparece aqui.'}
        </p>
      </PanelSection>

      <PanelSection title="Atalhos do login">
        <ul className="flex flex-col gap-1 text-[14px] leading-5 text-text-secondary">
          <li>
            CPF <span className="tabular text-text-primary">{NOT_FOUND_CPF}</span>: ingresso não encontrado
          </li>
          <li>
            Código <span className="tabular text-text-primary">{INVALID_CODE}</span>: código inválido; qualquer outro entra
          </li>
        </ul>
      </PanelSection>

      <Button variant="ghost" icon={<RotateCcw size={18} aria-hidden />} onClick={s.resetDemo} className="self-start px-0">
        Reiniciar demo
      </Button>
    </aside>
  );
}
