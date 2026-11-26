import { useState } from 'react';
import { CalendarClock, Handshake, Lock, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { useDemo } from '@/state/store';
import { participants } from '@/data/participants';
import { activeProfilesCount, MIN_PROFILES_TO_SHOW } from '@/lib/affinity';
import { LockedPreviewTab } from '@/components/ui/LockedPreview';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';

const BENEFITS = [
  { Icon: Sparkles, text: 'Sugestões de pessoas com interesses em comum' },
  { Icon: ShieldCheck, text: 'Contatos liberados só quando os dois aceitam' },
  { Icon: CalendarClock, text: 'Encontros marcados nos intervalos' },
];

/** C00 · Conexões com cadeado (Executivo). Convite só ao tocar "Quero me conectar" (D3: duas saídas). */
export function ConnectionsLocked() {
  const online = useDemo((s) => s.online);
  const openOverlay = useDemo((s) => s.openOverlay);
  const openMap = useDemo((s) => s.openMap);
  const [inviteOpen, setInviteOpen] = useState(false);

  // F1 (aprovado): total real de perfis ativos e visíveis da edição
  const count = activeProfilesCount(participants);
  const showCount = count >= MIN_PROFILES_TO_SHOW;
  const panelLabel = showCount
    ? `Bloqueado no seu ingresso. ${count} participantes desta edição já estão se conectando. Conexões fazem parte do ingresso VIP.`
    : 'Bloqueado no seu ingresso. Participantes VIP e Diamond desta edição já estão se conectando. Conexões fazem parte do ingresso VIP.';

  return (
    <div className="flex flex-col gap-3 px-margin pb-4">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 text-text-primary">Conexões</h1>
        <Lock size={24} aria-hidden className="text-gold-200" />
      </div>

      <LockedPreviewTab>
        <section aria-label={panelLabel} className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card">
          <Lock size={24} aria-hidden className="text-gold-200" />
          {showCount ? (
            <>
              <p className="tabular mt-3 text-h1 text-text-primary">{count} participantes</p>
              <p className="text-body text-text-primary">desta edição já estão se conectando</p>
            </>
          ) : (
            <p className="mt-3 text-body text-text-primary">Participantes VIP e Diamond desta edição já estão se conectando.</p>
          )}
          <p className="mt-2 text-body text-text-secondary">Conexões fazem parte do ingresso VIP.</p>
          {!online ? <p className="mt-1 text-caption text-text-secondary">Atualizado às 12h31</p> : null}

          <ul className="mt-3 flex flex-col gap-2 border-t border-border-subtle pt-3">
            {BENEFITS.map(({ Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-body text-text-primary">
                <Icon size={24} aria-hidden className="shrink-0 text-gold-500" />
                {text}
              </li>
            ))}
          </ul>

          <Button block className="mt-4" onClick={() => setInviteOpen(true)}>
            Quero me conectar
          </Button>
        </section>
      </LockedPreviewTab>

      <BottomSheet open={inviteOpen} onClose={() => setInviteOpen(false)} title="Libere as Conexões" closeLabel="Fechar convite"
        footer={
          <>
            <Button
              block
              disabled={!online}
              icon={<Handshake size={20} aria-hidden />}
              onClick={() => {
                setInviteOpen(false);
                openOverlay('checkout');
              }}
            >
              Ver upgrade para VIP
            </Button>
            {!online ? <p className="-mt-1 text-center text-caption text-text-secondary">Precisa de internet</p> : null}
            <Button
              block
              variant="secondary"
              icon={<Store size={20} aria-hidden />}
              onClick={() => {
                setInviteOpen(false);
                openMap('booth');
              }}
            >
              Falar com o time no estande
            </Button>
            <Button block variant="ghost" onClick={() => setInviteOpen(false)}>
              Agora não
            </Button>
          </>
        }
      >
        <p className="text-body text-text-secondary">
          Com o ingresso VIP você recebe sugestões de pessoas com interesses em comum, envia até 15 pedidos por dia e marca encontros nos intervalos.
        </p>
      </BottomSheet>
    </div>
  );
}
