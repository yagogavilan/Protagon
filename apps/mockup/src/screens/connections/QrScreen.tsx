import { useEffect, useMemo, useState } from 'react';
import { Check, LoaderCircle, MessageCircle, ScanLine, X } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { TierBadge } from '@/components/ui/TierBadge';
import { objectiveLabel } from '@/lib/affinity';
import { participants } from '@/data/participants';
import { useDemo } from '@/state/store';
import { firstName, useSuggestionFor } from '@/lib/connections';
import { haptic } from '@/lib/haptics';

type Stage = 'camera' | 'found' | 'waiting' | 'done';

/**
 * C10 · Ler QR: câmera simulada, pessoa encontrada, aguardando a confirmação do outro e conectados.
 * Executivo não tem Conexões e cai no C00. Pedidos por QR não contam no limite diário (D4).
 */
export function QrScreen() {
  const tier = useDemo((s) => s.tier);
  const connected = useDemo((s) => s.connected);
  const blocked = useDemo((s) => s.blocked);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const setTab = useDemo((s) => s.setTab);
  const connectViaQr = useDemo((s) => s.connectViaQr);
  const openOverlay = useDemo((s) => s.openOverlay);
  const setMeetFor = useDemo((s) => s.setMeetFor);
  const [stage, setStage] = useState<Stage>('camera');

  const person = useMemo(
    () => participants.find((p) => p.visible && p.tier !== 'executivo' && !connected[p.id] && !blocked[p.id] && p.id >= 'p26') ?? participants.find((p) => p.visible && p.tier !== 'executivo' && !connected[p.id])!,
    // o alvo não muda enquanto o fluxo está aberto
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const suggestion = useSuggestionFor(person);

  useEffect(() => {
    if (tier === 'executivo') setTab('conexoes');
  }, [tier, setTab]);

  useEffect(() => {
    if (stage !== 'waiting') return;
    const t = window.setTimeout(() => {
      connectViaQr(person.id);
      haptic('success', 'conexão por QR');
      setStage('done');
    }, 4500);
    return () => window.clearTimeout(t);
  }, [stage, connectViaQr, person.id]);

  const close = (
    <button type="button" onClick={closeOverlay} aria-label="Fechar leitor de QR" className="flex h-touch w-touch items-center justify-center rounded-pill bg-bg text-text-primary active:bg-surface-3">
      <X size={24} aria-hidden />
    </button>
  );

  if (stage === 'camera') {
    return (
      <div className="flex h-full flex-col bg-bg px-margin pb-10 pt-[58px]">
        <div className="flex items-center justify-between">
          <h1 className="text-h2 text-text-primary">Ler QR</h1>
          {close}
        </div>
        <div className="mt-6 flex flex-1 flex-col items-center gap-5">
          <div className="relative flex h-[300px] w-full max-w-[300px] items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-surface-1" aria-label="Câmera simulada">
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
          <p className="text-center text-body text-text-primary">Aponte para o QR da credencial da outra pessoa.</p>
          <p className="text-center text-body text-text-secondary">Os dois confirmam a conexão. Pedidos pelo QR não contam no limite do dia.</p>
          <div className="mt-auto flex w-full flex-col gap-2">
            <Button block onClick={() => setStage('found')}>
              Simular leitura de um QR
            </Button>
            <p className="text-center text-body text-text-secondary">Neste mockup não há câmera; o botão simula a leitura.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-bg px-margin pb-10 pt-[58px]">
      <div className="flex items-center justify-between">
        <h1 className="text-h2 text-text-primary">{stage === 'done' ? 'Conectados' : 'Pessoa encontrada'}</h1>
        {close}
      </div>

      <div className="mt-6 flex flex-1 flex-col items-center gap-4 text-center">
        <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-border-gold bg-surface-2 p-5 shadow-card">
          <div className="relative">
            <Avatar name={person.name} size="lg" ring={stage === 'done' ? 'gold' : 'none'} />
            {stage === 'done' ? (
              <motion.span aria-hidden initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 rounded-pill ring-2 ring-gold-500" />
            ) : null}
          </div>
          <p className="text-h2 text-text-primary">{person.company}</p>
          <p className="flex items-center gap-2 text-body text-text-secondary">
            {person.name} <TierBadge tier={person.tier} />
          </p>
          <p className="text-caption text-text-secondary">{person.role} · {person.city}</p>
          <p className="text-body text-text-primary">{suggestion.affinity.reason || person.objectives.map(objectiveLabel).join(' · ')}</p>
        </div>

        {stage === 'found' ? (
          <div className="mt-auto flex w-full flex-col gap-2">
            <Button block onClick={() => setStage('waiting')}>
              Enviar pedido de conexão
            </Button>
            <Button block variant="ghost" onClick={() => setStage('camera')}>
              Ler outro QR
            </Button>
          </div>
        ) : null}

        {stage === 'waiting' ? (
          <div className="mt-auto flex w-full flex-col items-center gap-3" role="status">
            <LoaderCircle size={32} aria-hidden className="animate-spin text-gold-200" />
            <p className="text-body-strong text-text-primary">Aguardando {firstName(person.name)} confirmar</p>
            <p className="text-body text-text-secondary">A outra pessoa confirma na tela dela. Leva poucos segundos.</p>
            <Button block variant="ghost" onClick={() => setStage('camera')}>
              Cancelar
            </Button>
          </div>
        ) : null}

        {stage === 'done' ? (
          <div className="mt-auto flex w-full flex-col gap-3">
            <p className="flex items-center justify-center gap-2 text-body-strong text-live" role="status">
              <Check size={20} aria-hidden /> Você e {firstName(person.name)} estão conectados
            </p>
            <p className="text-body text-text-secondary">Os contatos de {firstName(person.name)} já aparecem no perfil.</p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 px-3" onClick={() => { closeOverlay(); setMeetFor({ id: person.id, mode: 'new' }); }}>
                Vamos nos ver?
              </Button>
              <Button className="flex-1 px-3" icon={<MessageCircle size={20} aria-hidden />} onClick={() => { closeOverlay(); openOverlay('chat', person.id); }}>
                Conversar
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
