import { useState } from 'react';
import { Check, ShieldCheck, Trash2 } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Switch } from '@/components/ui/Switch';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ContactChannelSwitches, PrivacyPolicyLink, VisibilitySwitches } from '@/screens/connections/Visibility';
import { useDemo } from '@/state/store';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';

/** U03 · Privacidade: campos visíveis, pausar perfil e excluir dados (confirmação na própria tela). */
export function PrivacyScreen() {
  const tier = useDemo((s) => s.tier);
  const active = useDemo((s) => s.connectionsActive);
  const paused = useDemo((s) => s.connectionsPaused);
  const deleted = useDemo((s) => s.dataDeleted);
  const setPaused = useDemo((s) => s.setConnectionsPaused);
  const instagramEarly = useDemo((s) => s.instagramEarly);
  const setInstagramEarly = useDemo((s) => s.setInstagramEarly);
  const setActive = useDemo((s) => s.setConnectionsActive);
  const openOverlay = useDemo((s) => s.openOverlay);
  const deleteMyData = useDemo((s) => s.deleteMyData);
  const resetDemo = useDemo((s) => s.resetDemo);
  const showToast = useDemo((s) => s.showToast);
  const [confirming, setConfirming] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const [igWarn, setIgWarn] = useState(false);

  if (deleted) {
    return (
      <OverlayPage title="Privacidade" onBack={resetDemo} footer={<Button block onClick={resetDemo}>Voltar ao início</Button>}>
        <div className="flex flex-col items-center gap-3 pt-12 text-center" role="status">
          <span className="flex h-20 w-20 items-center justify-center rounded-pill border-2 border-live bg-tint-live">
            <Check size={40} aria-hidden className="text-live" />
          </span>
          <h2 className="text-h1 text-text-primary">Dados excluídos</h2>
          <p className="text-body text-text-secondary">Apagamos do app seu perfil, conexões, mensagens e anotações. Cópias de segurança são apagadas em até 30 dias. O que outras pessoas já salvaram fora do app não é apagado. Sua credencial segue valendo no credenciamento.</p>
        </div>
      </OverlayPage>
    );
  }

  const vip = tier !== 'executivo';
  return (
    <OverlayPage title="Privacidade">
      <div className="flex flex-col gap-4">
        {vip ? (
          active ? (
            <>
              <section className="rounded-lg border border-border-subtle bg-surface-1 p-2" aria-label="Campos visíveis">
                <p className="px-1 pt-2 text-body-strong text-text-primary">O que os outros veem</p>
                <p className="px-1 pb-1 text-body text-text-secondary">Para participantes VIP e Diamond desta edição.</p>
                <Switch label="Nome e ingresso" hint="Sempre visíveis" checked disabled onChange={() => undefined} />
                <VisibilitySwitches />
                <p className="px-1 pb-2 pt-1 text-body text-text-secondary">Telefone e redes só aparecem depois de um aceite mútuo. A única exceção é o Instagram, e só se você ligar a opção abaixo.</p>
              </section>
              <section className="rounded-lg border border-border-subtle bg-surface-1 p-2" aria-label="Depois do aceite, você compartilha">
                <p className="px-1 pt-2 text-body-strong text-text-primary">Depois do aceite, você compartilha</p>
                <p className="px-1 pb-1 text-body text-text-secondary">Só quem aceitar a conexão vê o que estiver ligado. Essa pessoa pode salvar e exportar seus contatos.</p>
                <ContactChannelSwitches />
              </section>
              <section className="rounded-lg border border-border-subtle bg-surface-1 p-2" aria-label="Instagram antes da conexão">
                <p className="flex items-center gap-2 px-1 pt-2 text-body-strong text-text-primary">
                  Instagram <Chip variant="proposal" />
                </p>
                <Switch
                  label="Mostrar meu Instagram antes da conexão"
                  hint="Seu @ aparece para VIP e Diamond desta edição antes do aceite, e você vê o @ de quem também liberou. Desligado por padrão."
                  checked={instagramEarly}
                  onChange={(v) => {
                    // Ligar pede confirmação com o aviso de que o Instagram fica fora do app (SEC-004)
                    if (v) {
                      setIgWarn(true);
                      return;
                    }
                    setInstagramEarly(false);
                    showToast({ text: 'Seu Instagram volta a aparecer só depois do aceite', tone: 'info' });
                  }}
                />
              </section>
              <section className="rounded-lg border border-border-subtle bg-surface-1 p-2" aria-label="Pausar perfil">
                <Switch
                  label="Pausar meu perfil"
                  hint="Você some das sugestões e da busca e não recebe pedidos novos. Suas conexões continuam."
                  checked={paused}
                  onChange={(v) => {
                    setPaused(v);
                    showToast({ text: v ? 'Perfil pausado' : 'Perfil reativado', tone: 'info' });
                  }}
                />
                <Switch
                  label="Meu perfil de Conexões"
                  hint="Desligar revoga a autorização e desativa o perfil"
                  checked={active}
                  onChange={(v) => {
                    setActive(v);
                    showToast({ text: v ? 'Perfil ativado' : 'Perfil desativado. Ative de novo em Conexões.', tone: 'info' });
                  }}
                />
              </section>
            </>
          ) : (
            <section className="rounded-lg border border-border-subtle bg-surface-1 p-card">
              <p className="flex items-center gap-2 text-body-strong text-text-primary">
                <ShieldCheck size={20} aria-hidden className="text-gold-500" /> Perfil de Conexões desligado
              </p>
              <p className="mt-1 text-body text-text-secondary">Nenhum dado seu aparece para outros participantes.</p>
              <Button block size="compact" variant="secondary" className="mt-3" onClick={() => openOverlay('activate')}>
                Ativar perfil
              </Button>
            </section>
          )
        ) : (
          <section className="rounded-lg border border-border-subtle bg-surface-1 p-card">
            <p className="flex items-center gap-2 text-body-strong text-text-primary">
              <ShieldCheck size={20} aria-hidden className="text-gold-500" /> Seus dados estão protegidos
            </p>
            <p className="mt-1 text-body text-text-secondary">Seu ingresso não tem perfil de Conexões. Nenhum dado seu é mostrado a outros participantes.</p>
          </section>
        )}

        <section className="rounded-lg border border-border-subtle bg-surface-1 p-card" aria-label="Excluir meus dados">
          <h2 className="text-body-strong text-text-primary">Excluir meus dados</h2>
          <p className="mt-1 text-body text-text-secondary">Apaga do app seu perfil, conexões, mensagens, notas e avaliações, na hora e sem volta. Cópias de segurança são apagadas em até 30 dias. O que outras pessoas já salvaram fora do app não é apagado.</p>
          {!confirming ? (
            <Button block variant="destructive" size="compact" className="mt-3" icon={<Trash2 size={18} aria-hidden />} onClick={() => setConfirming(true)}>
              Excluir meus dados
            </Button>
          ) : (
            <div className="mt-3 flex flex-col gap-3 rounded-md border border-danger bg-tint-danger p-3" role="group" aria-label="Confirmar exclusão">
              <p className="text-body-strong text-text-primary">Tem certeza?</p>
              <button
                type="button"
                role="checkbox"
                aria-checked={understood}
                onClick={() => setUnderstood((v) => !v)}
                className="flex min-h-touch items-start gap-3 rounded-md text-left active:bg-surface-3"
              >
                <span aria-hidden className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-sm border-2', understood ? 'border-danger bg-danger text-on-gold' : 'border-border-strong')}>
                  {understood ? <Check size={16} strokeWidth={3} /> : null}
                </span>
                <span className="text-body text-text-primary">Entendo que não dá para desfazer.</span>
              </button>
              <button
                type="button"
                disabled={!understood}
                onClick={() => {
                  haptic('warning', 'dados excluídos');
                  deleteMyData();
                }}
                className="min-h-button rounded-md bg-danger px-4 text-body-strong text-on-gold disabled:bg-surface-3 disabled:text-text-tertiary"
              >
                Excluir tudo agora
              </button>
              <Button
                variant="ghost"
                onClick={() => {
                  setConfirming(false);
                  setUnderstood(false);
                }}
              >
                Cancelar
              </Button>
            </div>
          )}
        </section>
        <div className="flex flex-col items-start gap-1">
          <p className="text-body text-text-secondary">
            Seu perfil de Conexões só existe com a sua autorização. Os dados do ingresso servem para o seu acesso ao evento. Chat e Minha rede ficam 90 dias após o evento.
          </p>
          <PrivacyPolicyLink className="-ml-2" />
        </div>
      </div>

      <BottomSheet
        open={igWarn}
        onClose={() => setIgWarn(false)}
        title="Mostrar seu Instagram antes da conexão?"
        closeLabel="Fechar aviso"
        footer={
          <>
            <Button
              block
              onClick={() => {
                setInstagramEarly(true);
                setIgWarn(false);
                showToast({ text: 'Seu Instagram fica visível antes da conexão', tone: 'info' });
              }}
            >
              Mostrar meu Instagram
            </Button>
            <Button block variant="ghost" onClick={() => setIgWarn(false)}>
              Cancelar
            </Button>
          </>
        }
      >
        <p className="text-body text-text-primary">Seu @ aparece para VIP e Diamond desta edição antes do aceite, e você vê o @ de quem também liberou.</p>
        <p className="mt-3 text-body text-text-secondary">No Instagram, bloquear e denunciar daqui não valem: a pessoa pode mandar direct sem aceite. Você pode desligar quando quiser.</p>
      </BottomSheet>
    </OverlayPage>
  );
}
