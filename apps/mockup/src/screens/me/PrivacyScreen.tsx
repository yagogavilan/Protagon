import { useState } from 'react';
import { Check, ShieldCheck, Trash2 } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useDemo, type Privacy } from '@/state/store';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';

const LABEL: Record<keyof Privacy, string> = {
  company: 'Empresa',
  role: 'Cargo',
  city: 'Cidade',
  objectives: 'Objetivos',
  interests: 'Interesses',
};

/** U03 · Privacidade: campos visíveis, pausar perfil e excluir dados (confirmação na própria tela). */
export function PrivacyScreen() {
  const tier = useDemo((s) => s.tier);
  const active = useDemo((s) => s.connectionsActive);
  const paused = useDemo((s) => s.connectionsPaused);
  const privacy = useDemo((s) => s.privacy);
  const deleted = useDemo((s) => s.dataDeleted);
  const setPaused = useDemo((s) => s.setConnectionsPaused);
  const setPrivacy = useDemo((s) => s.setPrivacy);
  const setActive = useDemo((s) => s.setConnectionsActive);
  const openOverlay = useDemo((s) => s.openOverlay);
  const deleteMyData = useDemo((s) => s.deleteMyData);
  const resetDemo = useDemo((s) => s.resetDemo);
  const showToast = useDemo((s) => s.showToast);
  const [confirming, setConfirming] = useState(false);
  const [understood, setUnderstood] = useState(false);

  if (deleted) {
    return (
      <OverlayPage title="Privacidade" onBack={resetDemo} footer={<Button block onClick={resetDemo}>Voltar ao início</Button>}>
        <div className="flex flex-col items-center gap-3 pt-12 text-center" role="status">
          <span className="flex h-20 w-20 items-center justify-center rounded-pill border-2 border-live bg-tint-live">
            <Check size={40} aria-hidden className="text-live" />
          </span>
          <h2 className="text-h1 text-text-primary">Dados excluídos</h2>
          <p className="text-body text-text-secondary">Apagamos seu perfil, conexões, mensagens e anotações. Sua credencial segue valendo no credenciamento.</p>
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
                <p className="px-1 pb-1 text-caption text-text-secondary">Para participantes VIP e Diamond desta edição.</p>
                <Switch label="Nome e ingresso" hint="Sempre visíveis" checked disabled onChange={() => undefined} />
                {(Object.keys(LABEL) as (keyof Privacy)[]).map((k) => (
                  <Switch key={k} label={LABEL[k]} checked={privacy[k]} onChange={(v) => setPrivacy(k, v)} />
                ))}
                <p className="px-1 pb-2 pt-1 text-caption text-text-secondary">Telefone e redes só aparecem depois de um aceite mútuo.</p>
              </section>
              <section className="rounded-lg border border-border-subtle bg-surface-1 p-2" aria-label="Pausar perfil">
                <Switch
                  label="Pausar meu perfil"
                  hint={paused ? 'Ninguém vê você e você não recebe pedidos' : 'Você some das sugestões até reativar'}
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
          <p className="mt-1 text-body text-text-secondary">Apaga perfil, conexões, mensagens, notas e avaliações. A exclusão é imediata e não pode ser desfeita.</p>
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
        <p className="text-caption text-text-secondary">Tratamos seus dados com base na sua autorização (LGPD). Chat e Minha rede ficam por 90 dias depois do evento.</p>
      </div>
    </OverlayPage>
  );
}
