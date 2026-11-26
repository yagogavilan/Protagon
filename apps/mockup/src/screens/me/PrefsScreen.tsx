import { BellOff, BellRing } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { StatusBanner } from '@/components/ui/StatusBanner';
import { Switch } from '@/components/ui/Switch';
import { useDemo } from '@/state/store';

/** U02 · Preferências de notificação por categoria e permissão do sistema (pendente, permitida, negada). */
export function PrefsScreen() {
  const tier = useDemo((s) => s.tier);
  const prefs = useDemo((s) => s.notifPrefs);
  const setPref = useDemo((s) => s.setNotifPref);
  const permission = useDemo((s) => s.notifPermission);
  const setPermissionSheet = useDemo((s) => s.setPermissionSheet);

  return (
    <OverlayPage title="Notificações">
      <div className="flex flex-col gap-4">
        {permission === 'denied' ? (
          <StatusBanner
            tone="warning"
            icon={<BellOff size={24} />}
            title="Avisos do sistema desligados"
            text="Você ainda vê tudo dentro do app."
            action={{ label: 'Como ativar', onClick: () => setPermissionSheet(true) }}
          />
        ) : permission === 'unknown' ? (
          <StatusBanner tone="info" icon={<BellRing size={24} />} title="Ative os avisos do evento" text="A permissão ainda não foi pedida." action={{ label: 'Ativar', onClick: () => setPermissionSheet(true) }} />
        ) : (
          <StatusBanner tone="live" icon={<BellRing size={24} />} title="Avisos ativados neste aparelho" />
        )}

        <div className="rounded-lg border border-border-subtle bg-surface-1 p-2">
          <Switch label="Avisos operacionais" hint="Volta do almoço, mudança de sala e segurança. Sempre ligados." checked disabled onChange={() => undefined} />
          <Switch label="Agenda e materiais" hint="Mudança de horário e material liberado" checked={prefs.agenda} onChange={(v) => setPref('agenda', v)} />
          <Switch label="Grupo" hint="Quem entrou ou saiu do seu grupo, entregue no intervalo" checked={prefs.grupo} onChange={(v) => setPref('grupo', v)} />
          {tier !== 'executivo' ? (
            <Switch label="Conexões" hint="Pedidos e respostas, entregues no intervalo" checked={prefs.conexoes} onChange={(v) => setPref('conexoes', v)} />
          ) : null}
        </div>
        <p className="text-body text-text-secondary">Durante as palestras só chegam avisos operacionais. O resto espera o intervalo.</p>
      </div>
    </OverlayPage>
  );
}
