import { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { demoUser } from '@/data/participants';
import { objectiveLabel } from '@/lib/affinity';
import { cn } from '@/lib/cn';

/**
 * Stub do C01 (Ativar perfil). O fluxo completo é da Etapa 3; aqui: dados da compra, objetivos e interesses
 * prontos, e consentimento LGPD DESLIGADO por padrão (regra 8). Sem consentimento, não ativa.
 */
export function ActivateSheet({ open, onClose, onActivate }: { open: boolean; onClose: () => void; onActivate: () => void }) {
  const [consent, setConsent] = useState(false);
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      size="tall"
      title="Ativar perfil de Conexões"
      subtitle="Leva menos de 1 minuto"
      closeLabel="Fechar ativação"
      footer={
        <Button block disabled={!consent} onClick={onActivate}>
          Ativar perfil
        </Button>
      }
    >
      <p className="text-body-strong text-text-primary">Dados da sua compra</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 rounded-md bg-surface-1 p-3">
        {[
          ['Nome', demoUser.name],
          ['Empresa', demoUser.company],
          ['Cargo', demoUser.role],
          ['Cidade', demoUser.city],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-caption text-text-secondary">{k}</dt>
            <dd className="text-body text-text-primary">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-body-strong text-text-primary">Seus objetivos</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {demoUser.objectives.map((o) => (
          <Chip key={o} variant="objective">
            {objectiveLabel(o)}
          </Chip>
        ))}
      </div>
      <p className="mt-4 text-body-strong text-text-primary">Interesses</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {demoUser.interests.map((t) => (
          <Chip key={t}>{t}</Chip>
        ))}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={consent}
        onClick={() => setConsent((c) => !c)}
        className="mt-5 flex w-full items-start gap-3 rounded-md border border-border-strong p-3 text-left"
      >
        <span
          aria-hidden
          className={cn(
            'relative mt-0.5 h-7 w-12 shrink-0 rounded-pill border transition-colors duration-base',
            consent ? 'border-transparent bg-gradient-cta' : 'border-border-strong bg-surface-3',
          )}
        >
          <span
            className={cn(
              'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-pill transition-[left] duration-base',
              consent ? 'left-[24px] bg-on-cta' : 'left-[3px] bg-text-secondary',
            )}
          />
        </span>
        <span className="text-body text-text-primary">
          Autorizo mostrar empresa, cargo, cidade, objetivos e interesses para participantes VIP e Diamond desta edição.
          <span className="mt-1 block text-caption text-text-secondary">Telefone e redes só aparecem depois de um aceite mútuo. Você pode pausar ou excluir quando quiser.</span>
        </span>
      </button>
    </BottomSheet>
  );
}
