import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, CircleAlert, ScanLine, Settings, WifiOff } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Button } from '@/components/ui/Button';
import { FORMATION_MSG, useFeatures, useFormation, useMyGroup } from '@/state/features';
import { listedGroups, groupLabel } from '@/lib/groups';
import { haptic } from '@/lib/haptics';
import { useDemo } from '@/state/store';

type Status = 'idle' | 'loading' | 'notfound' | 'full' | 'closed' | 'error';
type Stage = 'form' | 'ask' | 'system' | 'camera' | 'denied';

/** Mensagem única para código inexistente, expirado ou de outra categoria (SEC-021): não revela que o grupo existe */
export const CODE_NOT_FOUND =
  'Código não encontrado. Confira as letras com quem criou o grupo. Grupos só reúnem pessoas com o mesmo tipo de ingresso.';

/**
 * GR04 · Entrar por código ou QR. Leitor de QR próprio: NÃO é o C10 e não cai no C00 para o Executivo.
 * Envia sozinho ao completar a 4ª letra; o foco permanece no campo se falhar.
 */
export function GroupCodeScreen() {
  const tier = useDemo((s) => s.tier);
  const online = useDemo((s) => s.online);
  const replaceOverlay = useDemo((s) => s.replaceOverlay);
  const showToast = useDemo((s) => s.showToast);
  const setWifiOpen = useDemo((s) => s.setWifiOpen);
  const groups = useFeatures((s) => s.groups);
  const formation = useFormation();
  const myGroup = useMyGroup();
  const f = useFeatures.getState;

  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [stage, setStage] = useState<Stage>('form');
  const [pending, setPending] = useState(false);
  const input = useRef<HTMLInputElement | null>(null);
  const already = useRef(myGroup);

  useEffect(() => {
    if (already.current) {
      replaceOverlay('myGroup');
      showToast({ text: `Você já está no ${groupLabel(already.current)}.`, tone: 'info' });
    }
    // só na abertura
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = (r: ReturnType<ReturnType<typeof f>['joinByCode']>, via: 'code' | 'qr') => {
    if (r === 'ok') {
      haptic('light', 'entrou no grupo');
      const g = useFeatures.getState().groups.find((x) => x.memberIds.includes('me') && x.tier === tier);
      replaceOverlay('myGroup');
      showToast({ text: `Você entrou no ${g ? groupLabel(g) : 'grupo'}`, tone: 'success' });
      void via;
      return;
    }
    setStatus(r === 'full' ? 'full' : r === 'closed' ? 'closed' : r === 'error' ? 'error' : 'notfound');
    window.setTimeout(() => input.current?.focus(), 30);
  };

  const submit = (value: string, via: 'code' | 'qr') => {
    if (!online) {
      // Sem internet: o código fica no campo e não entra sozinho; o aluno confirma quando a conexão voltar
      setPending(true);
      return;
    }
    setPending(false);
    setStatus('loading');
    window.setTimeout(() => finish(f().joinByCode(value, via), via), 450);
  };

  const onChange = (raw: string) => {
    const next = raw.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4);
    setCode(next);
    setStatus('idle');
    setPending(false);
    if (next.length === 4) submit(next, 'code');
  };

  const readQr = () => {
    // O "QR" simulado leva ao primeiro grupo da lista da própria categoria
    const target = listedGroups(groups, tier)[0];
    setStage('form');
    submit(target?.code ?? '----', 'qr');
  };

  const askCamera = () => setStage('ask');

  if (stage === 'camera') {
    return (
      <OverlayPage title="Ler QR do grupo" onBack={() => setStage('form')}>
        <div className="flex flex-col items-center gap-4 pt-2">
          <div className="relative flex h-[280px] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-surface-1" aria-label="Câmera simulada">
            <span aria-hidden className="absolute left-4 top-4 h-8 w-8 rounded-tl-lg border-l-4 border-t-4 border-gold-500" />
            <span aria-hidden className="absolute right-4 top-4 h-8 w-8 rounded-tr-lg border-r-4 border-t-4 border-gold-500" />
            <span aria-hidden className="absolute bottom-4 left-4 h-8 w-8 rounded-bl-lg border-b-4 border-l-4 border-gold-500" />
            <span aria-hidden className="absolute bottom-4 right-4 h-8 w-8 rounded-br-lg border-b-4 border-r-4 border-gold-500" />
            <motion.span
              aria-hidden
              className="absolute inset-x-6 h-0.5 bg-gradient-gold shadow-glow-gold"
              initial={{ top: '14%' }}
              animate={{ top: ['14%', '82%', '14%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />
            <ScanLine size={56} aria-hidden className="text-text-tertiary" />
          </div>
          <p className="text-center text-body text-text-primary">Aponte para o QR do grupo que a outra pessoa criou.</p>
          <Button block onClick={readQr}>
            Simular leitura do QR de um grupo
          </Button>
          <Button block variant="ghost" onClick={() => setStage('form')}>
            Digitar o código
          </Button>
          <p className="text-center text-body text-text-secondary">Neste mockup não há câmera; o botão simula a leitura.</p>
        </div>
      </OverlayPage>
    );
  }

  const closed = formation !== 'open';
  return (
    <OverlayPage title="Entrar com código" quietOffline>
      <div className="flex flex-col gap-3 pt-2">
        {!online ? (
          <div role="status" className="flex flex-col gap-1 rounded-md border border-warning bg-surface-1 p-3">
            <p className="flex items-start gap-2 text-body text-text-primary">
              <WifiOff size={20} aria-hidden className="mt-0.5 shrink-0 text-warning" /> Sem internet. Para entrar no grupo você precisa de conexão.
            </p>
            <Button size="compact" variant="ghost" className="self-start" onClick={() => setWifiOpen(true)}>
              Ver Wi-Fi
            </Button>
          </div>
        ) : null}

        {closed ? (
          <p role="status" className="rounded-md border border-border-subtle bg-surface-1 p-3 text-body text-text-primary">
            {FORMATION_MSG}
          </p>
        ) : null}

        <label htmlFor="group-code" className="text-body-strong text-text-primary">
          Código do grupo
        </label>
        <input
          ref={input}
          id="group-code"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          inputMode="text"
          autoCapitalize="characters"
          autoCorrect="off"
          autoComplete="off"
          spellCheck={false}
          maxLength={4}
          disabled={closed}
          aria-describedby="group-code-hint"
          aria-invalid={status === 'notfound' || status === 'error' || undefined}
          placeholder="____"
          className="tabular h-[64px] w-full rounded-md border border-border-strong bg-surface-3 text-center text-display uppercase tracking-[0.5em] text-text-primary placeholder:text-text-tertiary focus:border-gold-200 focus:outline-none disabled:opacity-50"
        />
        <p id="group-code-hint" className="text-caption text-text-secondary">
          Digite as 4 letras do grupo.
        </p>

        {pending && online ? (
          <Button block onClick={() => submit(code, 'code')}>
            Entrar com este código
          </Button>
        ) : null}
        {pending && !online ? <p className="text-body text-text-secondary">O código fica no campo. Quando a conexão voltar, você confirma a entrada.</p> : null}

        <div role="status" aria-live="polite" className="flex flex-col gap-2">
          {status === 'loading' ? <p className="text-body text-text-secondary">Procurando o grupo…</p> : null}
          {status === 'notfound' ? (
            <p className="flex items-start gap-2 text-body text-text-primary">
              <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> {CODE_NOT_FOUND}
            </p>
          ) : null}
          {status === 'full' ? (
            <>
              <p className="flex items-start gap-2 text-body text-text-primary">
                <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> Esse grupo já tem 3 pessoas. Veja outros grupos com vaga.
              </p>
              <Button variant="secondary" onClick={() => replaceOverlay('groups')}>
                Ver grupos com vaga
              </Button>
            </>
          ) : null}
          {status === 'closed' ? <p className="text-body text-text-primary">{FORMATION_MSG}</p> : null}
          {status === 'error' ? (
            <>
              <p className="flex items-start gap-2 text-body text-text-primary">
                <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> Não conseguimos entrar no grupo. Tente de novo em instantes.
              </p>
              <Button size="compact" variant="secondary" className="self-start" onClick={() => submit(code, 'code')}>
                Tentar de novo
              </Button>
            </>
          ) : null}
        </div>

        {stage === 'denied' ? (
          <div className="flex flex-col gap-2 rounded-md border border-border-subtle bg-surface-1 p-3">
            <p className="text-body text-text-primary">A câmera está desligada para o Protagon. Digite o código ou ative a câmera nos Ajustes.</p>
            <Button size="compact" variant="secondary" className="self-start" icon={<Settings size={18} aria-hidden />} onClick={() => showToast({ text: 'Abriria os Ajustes do aparelho (simulado)', tone: 'info' })}>
              Abrir Ajustes
            </Button>
          </div>
        ) : null}

        {stage === 'ask' || stage === 'system' ? (
          <div className="flex flex-col gap-3 rounded-lg border border-border-gold bg-surface-2 p-card">
            <p className="flex items-start gap-2 text-body text-text-primary">
              <Camera size={20} aria-hidden className="mt-0.5 shrink-0 text-gold-200" /> Usamos a câmera só para ler o QR do grupo.
            </p>
            {stage === 'ask' ? (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="ghost" onClick={() => setStage('form')}>
                  Agora não
                </Button>
                <Button onClick={() => setStage('system')}>Continuar</Button>
              </div>
            ) : (
              <div role="alertdialog" aria-label="Pedido do sistema" className="mx-auto w-full max-w-[290px] overflow-hidden rounded-xl border border-border-subtle bg-surface-3 text-center">
                <div className="px-4 pb-4 pt-5">
                  <p className="text-body-strong text-text-primary">“Protagon” quer acessar a câmera</p>
                  <p className="mt-1 text-body text-text-secondary">Para ler o QR do grupo.</p>
                </div>
                <div className="grid grid-cols-2 border-t border-border-strong">
                  <button type="button" onClick={() => setStage('denied')} className="min-h-touch border-r border-border-strong text-body text-info active:bg-surface-2">
                    Não permitir
                  </button>
                  <button type="button" onClick={() => setStage('camera')} className="min-h-touch text-body-strong text-info active:bg-surface-2">
                    Permitir
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button variant="secondary" block icon={<Camera size={20} aria-hidden />} disabled={closed} onClick={askCamera}>
            Ler QR do grupo
          </Button>
        )}
      </div>
    </OverlayPage>
  );
}
