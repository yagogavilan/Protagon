import { Clock3, QrCode, Sparkles } from 'lucide-react';
import type { Suggestion } from '@/lib/affinity';
import { objectiveLabel } from '@/lib/affinity';
import { Avatar } from './Avatar';
import { Button } from './Button';
import { Chip } from './Chip';
import { TierBadge, TIER_LABEL } from './TierBadge';

export type PersonCardState = 'default' | 'sent' | 'queued';

interface PersonCardProps {
  suggestion: Suggestion;
  state?: PersonCardState;
  limitReached?: boolean;
  onConnect: () => void;
  onNotNow: () => void;
  onConnectByQr: () => void;
}

/**
 * PersonCard (design-system §PersonCard). Ordem obrigatória: afinidade, empresa, objetivo, motivo,
 * interesses em comum, pessoa, ações. Sem foto grande, sem percentual, sem coração.
 */
export function PersonCard({ suggestion, state = 'default', limitReached, onConnect, onNotNow, onConnectByQr }: PersonCardProps) {
  const { participant: p, affinity } = suggestion;
  const common = affinity.sharedInterests.slice(0, 3);
  const more = affinity.sharedInterests.length - common.length;
  const high = affinity.level === 'alta';

  return (
    <article
      aria-label={`${p.company}, ${p.segment.toLowerCase()}. ${p.name}, ${p.role.toLowerCase()}, ingresso ${TIER_LABEL[p.tier]}. Afinidade ${high ? 'alta' : 'boa'}. ${affinity.reason}.`}
      className="flex flex-col rounded-lg border border-border-subtle bg-surface-2 p-5 shadow-card"
    >
      <div className="flex items-center justify-between">
        {high ? (
          <span className="inline-flex h-7 items-center gap-1 rounded-pill bg-gradient-gold px-2.5 text-caption font-semibold text-on-gold">
            <Sparkles size={14} aria-hidden /> Afinidade alta
          </span>
        ) : (
          <Chip>Afinidade boa</Chip>
        )}
      </div>

      <h3 className="mt-3 text-h2 text-text-primary">{p.company}</h3>
      <p className="text-caption text-text-secondary">
        {p.segment} · {p.city.replace(/, [A-Z]{2}$/, '')}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {p.objectives.slice(0, 2).map((o) => (
          <Chip key={o} variant="objective">
            {objectiveLabel(o)}
          </Chip>
        ))}
      </div>

      <hr className="my-4 border-border-subtle" />

      <p className="line-clamp-2 text-body text-text-primary">{affinity.reason}</p>
      {common.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {common.map((t) => (
            <Chip key={t} variant="common">
              {t}
            </Chip>
          ))}
          {more > 0 ? <Chip>e mais {more}</Chip> : null}
        </div>
      ) : null}

      <hr className="my-4 border-border-subtle" />

      <div className="flex items-center gap-3">
        <Avatar name={p.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2">
            <span className="truncate text-body-strong text-text-primary">{p.name}</span>
            <TierBadge tier={p.tier} />
          </p>
          <p className="truncate text-caption text-text-secondary">{p.role}</p>
        </div>
      </div>

      <div className="mt-5">
        {state === 'default' ? (
          <div className="flex gap-3">
            <Button variant="secondary" className="basis-[40%] whitespace-nowrap px-3" onClick={onNotNow} aria-label={`Agora não para ${p.name}`}>
              Agora não
            </Button>
            {limitReached ? (
              <Button
                variant="secondary"
                className="basis-[60%] whitespace-nowrap px-3"
                icon={<QrCode size={18} aria-hidden />}
                onClick={onConnectByQr}
                aria-label={`Conectar com ${p.name} pelo QR`}
              >
                Conectar pelo QR
              </Button>
            ) : (
              <Button className="basis-[60%]" onClick={onConnect} aria-label={`Conectar com ${p.name}`}>
                Conectar
              </Button>
            )}
          </div>
        ) : (
          <p className="flex min-h-button items-center justify-center gap-2 text-body text-text-secondary">
            <Clock3 size={18} aria-hidden />
            {state === 'sent' ? 'Pedido enviado · Pendente' : 'Envio pendente · sai quando a internet voltar'}
          </p>
        )}
      </div>
    </article>
  );
}
