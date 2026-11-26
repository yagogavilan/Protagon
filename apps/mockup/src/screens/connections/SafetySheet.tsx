import { useEffect, useState } from 'react';
import { Ban, ChevronRight, Flag, PauseCircle, UserMinus } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { useDemo } from '@/state/store';
import { findParticipant, firstName } from '@/lib/connections';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';

type View = 'menu' | 'block' | 'report' | 'disconnect';
const REASONS = ['Mensagem ofensiva', 'Perfil falso', 'Oferta indevida ou spam', 'Outro motivo'];

/** C11 · Segurança em todo perfil: bloquear, denunciar, desfazer conexão e pausar meu perfil. */
export function SafetySheet() {
  const id = useDemo((s) => s.safetyFor);
  const setSafetyFor = useDemo((s) => s.setSafetyFor);
  const connected = useDemo((s) => (id ? Boolean(s.connected[id]) : false));
  const paused = useDemo((s) => s.connectionsPaused);
  const setPaused = useDemo((s) => s.setConnectionsPaused);
  const blockPerson = useDemo((s) => s.blockPerson);
  const disconnect = useDemo((s) => s.disconnect);
  const showToast = useDemo((s) => s.showToast);
  const stack = useDemo((s) => s.stack);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const [view, setView] = useState<View>('menu');
  const [reason, setReason] = useState(REASONS[0]!);
  const person = id ? findParticipant(id) : undefined;
  const open = Boolean(id);

  useEffect(() => {
    if (open) {
      setView('menu');
      setReason(REASONS[0]!);
    }
  }, [open, id]);

  const close = () => setSafetyFor(null);
  const name = person ? firstName(person.name) : '';
  // sai da tela da pessoa (perfil ou chat) quando ela some da rede
  const leavePerson = () => {
    const top = stack[stack.length - 1];
    if (top && (top.name === 'person' || top.name === 'chat') && top.id === id) closeOverlay();
    if (stack.length >= 2) {
      const below = stack[stack.length - 2];
      if (below && (below.name === 'person' || below.name === 'chat') && below.id === id) closeOverlay();
    }
  };

  const Row = ({ icon, label, hint, onClick, danger }: { icon: React.ReactNode; label: string; hint?: string; onClick: () => void; danger?: boolean }) => (
    <button type="button" onClick={onClick} className="flex min-h-touch w-full items-center gap-3 rounded-md px-2 py-2 text-left active:bg-surface-3">
      <span className={danger ? 'text-danger' : 'text-gold-500'} aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block text-body', danger ? 'text-danger' : 'text-text-primary')}>{label}</span>
        {hint ? <span className="block text-caption text-text-secondary">{hint}</span> : null}
      </span>
      <ChevronRight size={18} aria-hidden className="text-text-secondary" />
    </button>
  );

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={view === 'menu' ? (person ? `Segurança · ${person.name}` : 'Segurança') : view === 'block' ? `Bloquear ${name}?` : view === 'report' ? `Denunciar ${name}` : `Desfazer conexão com ${name}?`}
      closeLabel="Fechar segurança"
      footer={
        view === 'block' ? (
          <>
            <Button
              block
              variant="destructive"
              onClick={() => {
                if (!id) return;
                blockPerson(id);
                close();
                leavePerson();
                haptic('warning', 'pessoa bloqueada');
                showToast({ text: `${name} foi bloqueado. Nenhum aviso é enviado.`, tone: 'info' });
              }}
            >
              Bloquear {name}
            </Button>
            <Button block variant="ghost" onClick={() => setView('menu')}>
              Cancelar
            </Button>
          </>
        ) : view === 'report' ? (
          <>
            <Button
              block
              onClick={() => {
                close();
                showToast({ text: 'Denúncia enviada. Nossa equipe analisa em até 24 h.', tone: 'success' });
              }}
            >
              Enviar denúncia
            </Button>
            <Button block variant="ghost" onClick={() => setView('menu')}>
              Cancelar
            </Button>
          </>
        ) : view === 'disconnect' ? (
          <>
            <Button
              block
              variant="destructive"
              onClick={() => {
                if (!id) return;
                disconnect(id);
                close();
                leavePerson();
                showToast({ text: `Conexão com ${name} desfeita`, tone: 'info' });
              }}
            >
              Desfazer conexão
            </Button>
            <Button block variant="ghost" onClick={() => setView('menu')}>
              Cancelar
            </Button>
          </>
        ) : null
      }
    >
      {view === 'menu' ? (
        <ul className="flex flex-col">
          <li>
            <Row icon={<Ban size={24} />} label={`Bloquear ${name}`} hint="Some das sugestões e não vê mais você" danger onClick={() => setView('block')} />
          </li>
          <li>
            <Row icon={<Flag size={24} />} label="Denunciar" hint="Conta para a equipe do Protagon" onClick={() => setView('report')} />
          </li>
          {connected ? (
            <li>
              <Row icon={<UserMinus size={24} />} label="Desfazer conexão" hint="Contatos e chat deixam de aparecer" danger onClick={() => setView('disconnect')} />
            </li>
          ) : null}
          <li>
            <Row
              icon={<PauseCircle size={24} />}
              label={paused ? 'Reativar meu perfil' : 'Pausar meu perfil'}
              hint={paused ? 'Voltar a aparecer nas sugestões' : 'Ninguém vê você e você não recebe pedidos'}
              onClick={() => {
                setPaused(!paused);
                showToast({ text: paused ? 'Perfil reativado' : 'Perfil pausado', tone: 'info' });
                close();
              }}
            />
          </li>
        </ul>
      ) : view === 'block' ? (
        <p className="text-body text-text-secondary">
          {person?.name} deixa de ver seu perfil e você deixa de ver o dele. Nenhum aviso é enviado e a conexão, se existir, é desfeita.
        </p>
      ) : view === 'report' ? (
        <div role="radiogroup" aria-label="Motivo da denúncia" className="flex flex-col gap-1">
          {REASONS.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={reason === r}
              onClick={() => setReason(r)}
              className={cn('flex min-h-touch items-center gap-3 rounded-md px-2 text-left active:bg-surface-3', reason === r && 'bg-surface-1')}
            >
              <span aria-hidden className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-pill border-2', reason === r ? 'border-gold-500' : 'border-border-strong')}>
                {reason === r ? <span className="h-2.5 w-2.5 rounded-pill bg-gold-500" /> : null}
              </span>
              <span className="text-body text-text-primary">{r}</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-body text-text-secondary">
          Você e {person?.name} deixam de ser conectados. O chat e os contatos somem para os dois. {name} não recebe aviso.
        </p>
      )}
    </BottomSheet>
  );
}
