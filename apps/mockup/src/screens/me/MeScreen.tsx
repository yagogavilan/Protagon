import type { ReactNode } from 'react';
import { Bell, ChevronRight, LifeBuoy, LogOut, QrCode, ShieldCheck, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { TierBadge } from '@/components/ui/TierBadge';
import { Button } from '@/components/ui/Button';
import { demoUser, topics } from '@/data/participants';
import { edition } from '@/data/edition';
import { hideEmail } from '@/lib/format';
import { useClock, useDemo } from '@/state/store';
import { npsAvailable, npsKeyFor } from './nps';

const shortDate = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short' });
function editionRange(): string {
  const [a, , c] = edition.dates;
  return `${new Date(`${a}T12:00:00`).getDate()} a ${shortDate.format(new Date(`${c}T12:00:00`)).replace('.', '')} de 2027`;
}

function MenuRow({ icon, label, hint, tag, onClick }: { icon: ReactNode; label: string; hint?: string; tag?: ReactNode; onClick: () => void }) {
  return (
    <li>
      <button type="button" onClick={onClick} className="flex min-h-[56px] w-full items-center gap-3 rounded-md px-3 py-2 text-left active:bg-surface-3">
        <span className="text-gold-500" aria-hidden>
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-body text-text-primary">{label}</span>
          {hint ? <span className="block text-body text-text-secondary">{hint}</span> : null}
        </span>
        {tag}
        <ChevronRight size={18} aria-hidden className="shrink-0 text-text-secondary" />
      </button>
    </li>
  );
}

/** U01 · Eu: perfil e ingresso (CPF sempre mascarado) e acesso às demais telas de Eu. */
export function EuScreen() {
  const tier = useDemo((s) => s.tier);
  const nps = useDemo((s) => s.nps);
  const moment = useDemo((s) => s.moment);
  const openOverlay = useDemo((s) => s.openOverlay);
  const active = useDemo((s) => s.connectionsActive);
  const profile = useDemo((s) => s.profile);
  const clock = useClock();
  const key = npsKeyFor(clock, moment);
  const open = npsAvailable(key, clock, moment);
  const npsTag = open ? (
    nps[key] ? (
      <span className="rounded-sm bg-tint-live px-2 py-0.5 text-caption font-semibold text-live">Respondida</span>
    ) : (
      <span className="rounded-sm bg-tint-warning px-2 py-0.5 text-caption font-semibold text-warning">Pendente</span>
    )
  ) : null;

  return (
    <div className="flex flex-col gap-4 px-margin pb-4">
      <section className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface-1 p-card shadow-card">
        <Avatar name={demoUser.name} size="lg" ring={tier === 'executivo' ? 'none' : 'gold'} decorative={false} />
        <div className="min-w-0">
          <p className="truncate text-h2 text-text-primary">{demoUser.name}</p>
          <p className="truncate text-body text-text-secondary">
            {demoUser.role} · {demoUser.company}
          </p>
          <p className="mt-1">
            <TierBadge tier={tier} />
          </p>
        </div>
      </section>

      <section aria-label="Ingresso" className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card">
        <h2 className="text-body-strong text-text-primary">Ingresso</h2>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
          {[
            ['Edição', edition.name],
            ['Datas', editionRange()],
            ['Setor', edition.sectorByTier[tier]],
            ['Código', demoUser.credentialCode],
            ['CPF', demoUser.cpfMasked],
            ['E-mail', hideEmail(demoUser.email)],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0">
              <dt className="text-caption text-text-secondary">{k}</dt>
              <dd className="tabular select-all break-words text-body text-text-primary">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-body text-text-secondary">Dados da compra. Para corrigir, fale com o suporte.</p>
      </section>

      {tier !== 'executivo' && active ? (
        <section aria-label="Meu perfil de Conexões" className="rounded-lg border border-border-subtle bg-surface-1 p-card">
          <h2 className="text-body-strong text-text-primary">Meu perfil de Conexões</h2>
          <dl className="mt-3 flex flex-col gap-3">
            {(
              [
                ['Nicho', profile.niche],
                ['Objetivo no Protagon', profile.goal],
                ['Maior desafio', profile.challenge ? topics[profile.challenge].challenge : null],
                ['Domina', profile.expertise.length > 0 ? profile.expertise.map((t) => topics[t].know).join(', ') : null],
                ['WhatsApp', profile.whatsapp || null],
                ['LinkedIn', profile.linkedin || null],
                ['Instagram', profile.instagram || null],
              ] as [string, string | null][]
            ).map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="text-caption text-text-secondary">{k}</dt>
                <dd className={v ? 'break-words text-body text-text-primary' : 'text-body text-text-secondary'}>{v ?? 'Não informado'}</dd>
              </div>
            ))}
          </dl>
          <Button block size="compact" variant="secondary" className="mt-4" onClick={() => openOverlay('profile')}>
            {profile.challenge && profile.expertise.length > 0 ? 'Editar perfil' : 'Completar perfil'}
          </Button>
        </section>
      ) : null}

      <ul className="flex flex-col rounded-lg border border-border-subtle bg-surface-1 py-1" aria-label="Menu Eu">
        <MenuRow icon={<QrCode size={22} />} label="Credencial" hint="QR, setor e Wallet" onClick={() => openOverlay('credential')} />
        <MenuRow icon={<Bell size={22} />} label="Notificações" hint="O que você quer receber" onClick={() => openOverlay('prefs')} />
        <MenuRow icon={<ShieldCheck size={22} />} label="Privacidade" hint={tier === 'executivo' ? 'Seus dados e exclusão' : 'Visibilidade, pausa e exclusão'} onClick={() => openOverlay('privacy')} />
        <MenuRow icon={<Star size={22} />} label="Avaliação do dia" hint="Nota de 0 a 10" tag={npsTag} onClick={() => openOverlay('nps')} />
        <MenuRow icon={<LifeBuoy size={22} />} label="Suporte e FAQ" hint="Dúvidas e atendimento" onClick={() => openOverlay('support')} />
      </ul>

      <Button
        variant="secondary"
        icon={<LogOut size={18} aria-hidden />}
        onClick={() => useDemo.setState({ auth: 'login', stack: [], overlay: null, overlayId: undefined, tab: 'agora' })}
      >
        Sair
      </Button>
    </div>
  );
}
