import { useEffect, useState } from 'react';
import { BellOff, BellRing, Settings } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { useDemo } from '@/state/store';
import { haptic } from '@/lib/haptics';

/** Diálogo do sistema simulado (iOS). Não é UI do app: aparece só depois da explicação. */
function SystemDialog({ onAllow, onDeny }: { onAllow: () => void; onDeny: () => void }) {
  return (
    <div role="alertdialog" aria-label="Pedido do sistema" className="mx-auto w-full max-w-[290px] overflow-hidden rounded-xl border border-border-subtle bg-surface-3 text-center">
      <div className="px-4 pb-4 pt-5">
        <p className="text-body-strong text-text-primary">“Protagon” quer enviar notificações</p>
        <p className="mt-1 text-[14px] leading-5 text-text-secondary">Alertas, sons e selos podem ser configurados em Ajustes.</p>
      </div>
      <div className="grid grid-cols-2 border-t border-border-strong">
        <button type="button" onClick={onDeny} className="min-h-touch border-r border-border-strong text-body text-info active:bg-surface-2">
          Não permitir
        </button>
        <button type="button" onClick={onAllow} className="min-h-touch text-body-strong text-info active:bg-surface-2">
          Permitir
        </button>
      </div>
    </div>
  );
}

/**
 * E04 · Permissão de notificações (D1): aparece na 1ª abertura da Trilha, depois de explicar o valor.
 * Estados: pedido contextual e negado + como ativar depois.
 */
export function PermissionSheet() {
  const open = useDemo((s) => s.permissionSheet);
  const permission = useDemo((s) => s.notifPermission);
  const tier = useDemo((s) => s.tier);
  const set = useDemo((s) => s.setPermissionSheet);
  const setPermission = useDemo((s) => s.setNotifPermission);
  const showToast = useDemo((s) => s.showToast);
  const [stage, setStage] = useState<'ask' | 'system'>('ask');

  useEffect(() => {
    if (open) setStage('ask');
  }, [open]);

  const close = () => set(false);

  if (permission === 'denied') {
    return (
      <BottomSheet
        open={open}
        onClose={close}
        title="Avisos desligados"
        closeLabel="Fechar"
        footer={
          <Button block onClick={close}>
            Entendi
          </Button>
        }
      >
        <p className="flex items-start gap-3 text-body text-text-primary">
          <BellOff size={24} aria-hidden className="shrink-0 text-gold-500" />
          Tudo bem. Você continua vendo avisos e a agenda dentro do app, em Notificações.
        </p>
        <p className="mt-4 text-body-strong text-text-primary">Para ativar depois</p>
        <ol className="mt-2 flex flex-col gap-2 text-body text-text-secondary">
          {['Abra Ajustes do iPhone.', 'Toque em Protagon e depois em Notificações.', 'Ligue “Permitir notificações”.'].map((t, i) => (
            <li key={t} className="flex items-start gap-3">
              <span className="tabular flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-surface-3 text-caption text-text-primary">{i + 1}</span>
              {t}
            </li>
          ))}
        </ol>
        <p className="mt-4 flex items-center gap-2 text-caption text-text-secondary">
          <Settings size={16} aria-hidden /> Você também encontra este passo em Eu, Notificações.
        </p>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={stage === 'ask' ? 'Receber os avisos do evento?' : 'Permissão do sistema'}
      closeLabel="Fechar"
      footer={
        stage === 'ask' ? (
          <>
            <Button block icon={<BellRing size={20} aria-hidden />} onClick={() => setStage('system')}>
              Ativar avisos
            </Button>
            <Button block variant="ghost" onClick={close}>
              Agora não
            </Button>
          </>
        ) : null
      }
    >
      {stage === 'ask' ? (
        <>
          <p className="text-body text-text-secondary">Avisamos só o que importa, sem atrapalhar a palestra:</p>
          <ul className="mt-3 flex flex-col gap-2 text-body text-text-primary">
            {[
              'A hora de voltar ao salão depois do intervalo e do almoço',
              'Mudanças de agenda e de sala',
              'Material liberado',
              ...(tier !== 'executivo' ? ['Pedidos de conexão, entregues no intervalo'] : []),
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-gold-500" />
                {t}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="py-4">
          <SystemDialog
            onAllow={() => {
              setPermission('granted');
              haptic('success', 'notificações permitidas');
              close();
              showToast({ text: 'Avisos ativados', tone: 'success' });
            }}
            onDeny={() => {
              setPermission('denied');
            }}
          />
          <p className="mt-3 text-center text-caption text-text-secondary">Simulação do diálogo do iPhone.</p>
        </div>
      )}
    </BottomSheet>
  );
}
