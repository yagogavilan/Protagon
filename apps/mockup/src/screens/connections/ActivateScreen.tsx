import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Sparkles } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { FilterChip } from '@/components/ui/FilterChip';
import { Switch } from '@/components/ui/Switch';
import { demoUser, goalsList, interestTags, objectivesList } from '@/data/participants';
import type { Objective } from '@/data/types';
import { useDemo, type Privacy } from '@/state/store';
import { haptic } from '@/lib/haptics';

const MAX_OBJECTIVES = 3;
const MAX_INTERESTS = 8;

const FIELD_LABEL: Record<keyof Privacy, string> = {
  company: 'Empresa',
  role: 'Cargo',
  city: 'Cidade',
  objectives: 'Objetivos',
  interests: 'Interesses',
};

/** C01 · Ativar perfil em 3 passos (menos de 60 s): dados e objetivos, interesses, visibilidade e consentimento. */
export function ActivateScreen() {
  const tier = useDemo((s) => s.tier);
  const profile = useDemo((s) => s.profile);
  const privacy = useDemo((s) => s.privacy);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const setProfile = useDemo((s) => s.setProfile);
  const setPrivacy = useDemo((s) => s.setPrivacy);
  const setConsent = useDemo((s) => s.setConsent);
  const setActive = useDemo((s) => s.setConnectionsActive);
  const setTab = useDemo((s) => s.setTab);
  const showToast = useDemo((s) => s.showToast);

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [objectives, setObjectives] = useState<Objective[]>(profile.objectives);
  const [interests, setInterests] = useState<string[]>(profile.interests);
  const [niche, setNiche] = useState(profile.niche);
  const [goal, setGoal] = useState(profile.goal);
  const [consent, setLocalConsent] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [saving, setSaving] = useState(false);
  const started = useRef(Date.now());
  const [seconds, setSeconds] = useState(0);

  // Executivo não tem Conexões: cai no C00
  useEffect(() => {
    if (tier === 'executivo') setTab('conexoes');
  }, [tier, setTab]);

  const toggleObjective = (o: Objective) =>
    setObjectives((cur) => (cur.includes(o) ? cur.filter((x) => x !== o) : cur.length >= MAX_OBJECTIVES ? cur : [...cur, o]));
  const toggleInterest = (t: string) =>
    setInterests((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : cur.length >= MAX_INTERESTS ? cur : [...cur, t]));

  const activate = () => {
    setSaving(true);
    window.setTimeout(() => {
      setProfile({ objectives, interests, niche: niche.trim(), goal });
      setConsent(true);
      setActive(true);
      setSeconds(Math.max(1, Math.round((Date.now() - started.current) / 1000)));
      setSaving(false);
      setStep(3);
      haptic('success', 'perfil ativado');
    }, 700);
  };

  if (step === 3) {
    return (
      <OverlayPage title="Perfil ativado" onBack={closeOverlay} footer={<Button block onClick={() => { closeOverlay(); setTab('conexoes'); }}>Ver sugestões</Button>}>
        <div className="flex flex-col items-center gap-3 pt-10 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-pill border-2 border-live bg-tint-live shadow-glow-live">
            <Check size={40} aria-hidden className="text-live" />
          </span>
          <h2 className="text-h1 text-text-primary">Seu perfil está no ar</h2>
          <p className="text-body text-text-secondary">
            Pronto em <span className="tabular text-text-primary">{seconds} s</span>. Você já recebe sugestões de pessoas com interesses em comum.
          </p>
          <ul className="mt-2 w-full rounded-lg border border-border-subtle bg-surface-1 p-card text-left text-body text-text-primary">
            <li>{niche.trim()} · {objectives.length} objetivos · {interests.length} interesses</li>
            <li className="text-text-secondary">Visível para VIP e Diamond desta edição. Telefone e redes só depois do aceite.</li>
            <li className="text-text-secondary">Opcional: complete seu perfil na aba Conexões para sugestões ainda melhores.</li>
          </ul>
        </div>
      </OverlayPage>
    );
  }

  const canContinue = step === 0 ? objectives.length > 0 && niche.trim().length > 0 && goal.length > 0 : step === 1 ? interests.length > 0 : consent;

  return (
    <OverlayPage
      title="Ativar perfil"
      onBack={() => (step === 0 ? closeOverlay() : setStep((step - 1) as 0 | 1))}
      footer={
        <>
          {step < 2 ? (
            <Button block disabled={!canContinue} onClick={() => setStep((step + 1) as 1 | 2)}>
              Continuar
            </Button>
          ) : (
            <Button block disabled={!canContinue} loading={saving} onClick={activate} icon={<Sparkles size={20} aria-hidden />}>
              Ativar perfil
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <p className="tabular text-caption text-text-secondary">Passo {step + 1} de 3 · leva menos de 1 minuto</p>
          <div role="progressbar" aria-label="Progresso da ativação" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1} className="mt-2 flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span key={i} className={i <= step ? 'h-1.5 flex-1 rounded-pill bg-gradient-gold' : 'h-1.5 flex-1 rounded-pill bg-border-strong'} />
            ))}
          </div>
        </div>

        {step === 0 ? (
          <>
            <h2 className="text-h1 text-text-primary">Seus dados e objetivos</h2>
            <div className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface-1 p-card">
              <Avatar name={demoUser.name} size="lg" ring={photo ? 'gold' : 'none'} />
              <div className="min-w-0 flex-1">
                <p className="text-body-strong text-text-primary">{demoUser.name}</p>
                <p className="text-caption text-text-secondary">
                  {demoUser.role} · {demoUser.company}
                </p>
                <p className="text-caption text-text-secondary">
                  {demoUser.city} · {demoUser.segment}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPhoto(true);
                    showToast({ text: 'Foto adicionada (simulado)', tone: 'info' });
                  }}
                  className="-ml-2 mt-1 flex min-h-touch items-center gap-1.5 rounded-md px-2 text-body-strong text-gold-200 active:bg-surface-3"
                >
                  <Camera size={18} aria-hidden /> {photo ? 'Trocar foto' : 'Adicionar foto'}
                </button>
              </div>
            </div>
            <p className="-mt-2 text-caption text-text-secondary">Dados vindos da sua compra. Para corrigir, fale com o suporte.</p>

            <div className="flex flex-col gap-2">
              <label htmlFor="c01-niche" className="text-body-strong text-text-primary">
                Qual é o seu nicho?
              </label>
              <input
                id="c01-niche"
                value={niche}
                maxLength={60}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="Ex.: academias de bairro"
                className="h-12 w-full rounded-md border border-border-strong bg-surface-1 px-3 text-body text-text-primary placeholder:text-text-secondary focus:border-gold-200 focus:outline-none"
              />
            </div>

            <div>
              <p className="text-body-strong text-text-primary">O que você busca? <span className="tabular text-caption text-text-secondary">(até {MAX_OBJECTIVES})</span></p>
              <div className="mt-1 flex flex-wrap gap-x-2">
                {objectivesList.map((o) => (
                  <FilterChip key={o} selected={objectives.includes(o)} onClick={() => toggleObjective(o)}>
                    {o}
                  </FilterChip>
                ))}
              </div>
            </div>

            <div>
              <p className="text-body-strong text-text-primary">Qual é o seu objetivo no Protagon?</p>
              <div className="mt-1 flex flex-wrap gap-x-2">
                {goalsList.map((g) => (
                  <FilterChip key={g} selected={goal === g} onClick={() => setGoal(g)}>
                    {g}
                  </FilterChip>
                ))}
              </div>
            </div>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <h2 className="text-h1 text-text-primary">Seus interesses</h2>
            <p className="tabular text-body text-text-secondary" aria-live="polite">
              {interests.length} de {MAX_INTERESTS} escolhidos. Eles geram o motivo de cada sugestão.
            </p>
            <div className="flex flex-wrap gap-x-2">
              {interestTags.map((t) => (
                <FilterChip key={t} selected={interests.includes(t)} onClick={() => toggleInterest(t)} className={!interests.includes(t) && interests.length >= MAX_INTERESTS ? 'opacity-50' : undefined}>
                  {t}
                </FilterChip>
              ))}
            </div>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <h2 className="text-h1 text-text-primary">O que fica visível</h2>
            <div className="rounded-lg border border-border-subtle bg-surface-1 p-2">
              {(Object.keys(FIELD_LABEL) as (keyof Privacy)[]).map((k) => (
                <Switch key={k} label={FIELD_LABEL[k]} checked={privacy[k]} onChange={(v) => setPrivacy(k, v)} />
              ))}
            </div>
            <p className="text-caption text-text-secondary">Nome e ingresso ficam sempre visíveis. Telefone e redes só aparecem depois de um aceite mútuo.</p>
            <div className="rounded-lg border border-border-strong p-2">
              <Switch
                label="Autorizo mostrar meu perfil para participantes VIP e Diamond desta edição"
                hint="Você pode pausar ou excluir quando quiser, em Eu."
                checked={consent}
                onChange={setLocalConsent}
              />
            </div>
            {!consent ? <p className="text-caption text-text-secondary">Sem a autorização, o perfil não é ativado.</p> : null}
          </>
        ) : null}
      </div>
    </OverlayPage>
  );
}
