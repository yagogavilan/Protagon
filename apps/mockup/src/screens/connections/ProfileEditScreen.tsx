import { useState } from 'react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/FilterChip';
import { goalsList, topicIds, topics } from '@/data/participants';
import type { TopicId } from '@/data/types';
import { haptic } from '@/lib/haptics';
import { useDemo } from '@/state/store';

const MAX_EXPERTISE = 3;
const INPUT =
  'h-12 w-full rounded-md border border-border-strong bg-surface-1 px-3 text-body text-text-primary placeholder:text-text-secondary focus:border-gold-200 focus:outline-none';

/** Instagram aceita letras, números, ponto e sublinhado; o @ é colocado na saída */
function normalizeHandle(v: string): string {
  const clean = v.replace(/[^A-Za-z0-9._]/g, '').slice(0, 30);
  return clean ? `@${clean}` : '';
}

/**
 * "Complete seu perfil" (DEC-002): maior desafio e onde tenho bastante conhecimento (opcionais), mais nicho, objetivo no
 * Protagon e Instagram. Aberto pelo card de Conexões e por Eu. Sem passo novo no C01: a ativação continua em menos de 60 s.
 */
export function ProfileEditScreen() {
  const profile = useDemo((s) => s.profile);
  const instagramEarly = useDemo((s) => s.instagramEarly);
  const setProfile = useDemo((s) => s.setProfile);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const showToast = useDemo((s) => s.showToast);

  const complete = Boolean(profile.challenge) && profile.expertise.length > 0;
  const [challenge, setChallenge] = useState<TopicId | null>(profile.challenge);
  const [expertise, setExpertise] = useState<TopicId[]>(profile.expertise);
  const [niche, setNiche] = useState(profile.niche);
  const [goal, setGoal] = useState(profile.goal);
  const [instagram, setInstagram] = useState(profile.instagram);

  const toggleExpertise = (t: TopicId) =>
    setExpertise((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : cur.length >= MAX_EXPERTISE ? cur : [...cur, t]));
  const canSave = niche.trim().length > 0 && goal.length > 0;

  return (
    <OverlayPage
      title={complete ? 'Meu perfil de Conexões' : 'Complete seu perfil'}
      footer={
        <Button
          block
          disabled={!canSave}
          onClick={() => {
            setProfile({ challenge, expertise, niche: niche.trim(), goal, instagram });
            haptic('success', 'perfil salvo');
            showToast({ text: 'Perfil salvo. As sugestões já usam essas respostas.', tone: 'success' });
            closeOverlay();
          }}
        >
          Salvar perfil
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="text-body text-text-secondary">
          Opcional e leva cerca de 30 segundos. Com isso, as sugestões mostram quem pode ajudar no seu maior desafio. Visível para VIP e Diamond desta edição.
        </p>

        <section aria-labelledby="pe-challenge">
          <h2 id="pe-challenge" className="text-body-strong text-text-primary">
            Qual é o seu maior desafio hoje?
          </h2>
          <div className="mt-1 flex flex-wrap gap-x-2">
            {topicIds.map((t) => (
              <FilterChip key={t} selected={challenge === t} onClick={() => setChallenge(challenge === t ? null : t)}>
                {topics[t].challenge}
              </FilterChip>
            ))}
          </div>
        </section>

        <section aria-labelledby="pe-expertise">
          <h2 id="pe-expertise" className="text-body-strong text-text-primary">
            Onde você tem bastante conhecimento? <span className="tabular text-caption text-text-secondary">(até {MAX_EXPERTISE})</span>
          </h2>
          <div className="mt-1 flex flex-wrap gap-x-2">
            {topicIds.map((t) => (
              <FilterChip
                key={t}
                selected={expertise.includes(t)}
                onClick={() => toggleExpertise(t)}
                className={!expertise.includes(t) && expertise.length >= MAX_EXPERTISE ? 'opacity-50' : undefined}
              >
                {topics[t].know}
              </FilterChip>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2" aria-label="Nicho e objetivo no Protagon">
          <label htmlFor="pe-niche" className="text-body-strong text-text-primary">
            Seu nicho
          </label>
          <input id="pe-niche" value={niche} maxLength={60} onChange={(e) => setNiche(e.target.value)} placeholder="Ex.: academias de bairro" className={INPUT} />
          <h2 className="mt-2 text-body-strong text-text-primary">Seu objetivo no Protagon</h2>
          <div className="flex flex-wrap gap-x-2">
            {goalsList.map((g) => (
              <FilterChip key={g} selected={goal === g} onClick={() => setGoal(g)}>
                {g}
              </FilterChip>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-2" aria-label="Contatos">
          <label htmlFor="pe-instagram" className="text-body-strong text-text-primary">
            Seu Instagram
          </label>
          <input
            id="pe-instagram"
            value={instagram}
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            onChange={(e) => setInstagram(normalizeHandle(e.target.value))}
            placeholder="@seuusuario"
            className={INPUT}
          />
          <p className="text-caption text-text-secondary">
            {instagramEarly
              ? 'Seu @ aparece para VIP e Diamond antes da conexão, porque você liberou em Privacidade.'
              : 'Junto com WhatsApp e LinkedIn, só aparece depois que os dois aceitam a conexão. Para mudar isso, veja Privacidade em Eu.'}          </p>
        </section>
      </div>
    </OverlayPage>
  );
}
