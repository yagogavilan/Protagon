import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CalendarClock, CloudOff, Map as MapIcon, QrCode, ShieldCheck, Sparkles, Users, Utensils } from 'lucide-react';
import { Wordmark } from '@/components/brand/Brand';
import { Button } from '@/components/ui/Button';
import { LiveDot } from '@/components/ui/LiveDot';
import { useDemo } from '@/state/store';
import { cn } from '@/lib/cn';

const EASE = [0.2, 0.8, 0.2, 1] as const;

function SlideNow() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <div className="rounded-lg border border-live bg-surface-2 p-card shadow-glow-live">
        <p className="flex items-center gap-1.5 text-caption font-semibold text-live">
          <LiveDot /> Ao vivo
        </p>
        <p className="mt-2 text-h2 text-text-primary">A mentalidade do protagonista</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-pill bg-border-strong">
          <div className="h-full w-1/3 rounded-pill bg-live" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border-subtle bg-surface-1 p-card">
          <CalendarClock size={20} className="text-gold-500" />
          <p className="mt-2 text-body-strong text-text-primary">A seguir</p>
          <p className="tabular text-caption text-text-secondary">Intervalo · em 25 min</p>
        </div>
        <div className="rounded-lg border border-border-subtle bg-surface-1 p-card">
          <Utensils size={20} className="text-gold-500" />
          <p className="mt-2 text-body-strong text-text-primary">Almoço</p>
          <p className="tabular text-caption text-text-secondary">12h30 · 2º andar</p>
        </div>
      </div>
    </div>
  );
}

function SlideOffline() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <div className="flex items-center gap-3 rounded-lg border border-tint-border-info bg-tint-info p-card">
        <CloudOff size={24} className="text-info" />
        <p className="text-body text-text-primary">Sem internet. Agenda, mapa e credencial funcionam normalmente.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { Icon: QrCode, label: 'Credencial' },
          { Icon: CalendarClock, label: 'Agenda' },
          { Icon: MapIcon, label: 'Mapa' },
        ].map(({ Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface-1 py-4">
            <Icon size={24} className="text-gold-200" />
            <span className="text-caption text-text-secondary">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideConnections() {
  return (
    <div className="flex flex-col gap-3" aria-hidden>
      <div className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card">
        <span className="inline-flex h-7 items-center gap-1 rounded-pill bg-gradient-gold px-2.5 text-caption font-semibold text-on-gold">
          <Sparkles size={14} /> Afinidade alta
        </span>
        <p className="mt-3 text-h2 text-text-primary">Prates Moda</p>
        <p className="text-body text-text-secondary">3 interesses em comum · vocês dois buscam parcerias no varejo</p>
      </div>
      <p className="flex items-center gap-2 px-1 text-body text-text-secondary">
        <ShieldCheck size={20} className="shrink-0 text-gold-200" /> Contatos só aparecem quando os dois aceitam.
      </p>
    </div>
  );
}

/** E03 · Onboarding: até 3 telas, puláveis. Executivo vê 2; VIP e Diamond veem a 3ª, com o convite para Conexões. */
export function OnboardingScreen() {
  const tier = useDemo((s) => s.tier);
  const finish = useDemo((s) => s.finishOnboarding);
  const [step, setStep] = useState(0);

  const slides = [
    { title: 'Saiba o que está acontecendo agora', text: 'A tela Agora mostra a sessão ao vivo, o que vem depois e a hora de voltar ao salão.', art: <SlideNow /> },
    { title: 'Credencial e agenda sem internet', text: 'Tudo fica salvo no aparelho desde o login. Se o Wi-Fi do local cair, você segue sem perder nada.', art: <SlideOffline /> },
    ...(tier !== 'executivo'
      ? [{ title: 'Conecte-se com quem combina com você', text: 'Ative seu perfil em menos de 1 minuto e receba sugestões por afinidade. Você escolhe o que fica visível.', art: <SlideConnections /> }]
      : []),
  ];
  const last = step === slides.length - 1;
  const slide = slides[step]!;
  const showInvite = last && tier !== 'executivo';

  const activateNow = () => {
    useDemo.setState({ auth: 'app', tab: 'conexoes', stack: [{ name: 'activate' }], overlay: 'activate', overlayId: undefined });
  };

  return (
    <div
      className="flex h-full flex-col px-margin pb-10 pt-[64px]"
      style={{ backgroundImage: 'radial-gradient(90% 40% at 50% 0%, rgba(204,143,78,0.2), transparent 70%)' }}
    >
      <div className="flex items-center justify-between">
        <Wordmark width={150} />
        {!last || tier === 'executivo' ? (
          <button type="button" onClick={finish} className="min-h-touch rounded-md px-2 text-body-strong text-text-secondary active:bg-surface-3">
            Pular
          </button>
        ) : (
          <span className="min-h-touch" />
        )}
      </div>

      <div className="mt-8 flex flex-1 flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex flex-col gap-6"
          >
            {slide.art}
            <div>
              <h1 className="text-h1 text-text-primary">{slide.title}</h1>
              <p className="mt-2 text-body text-text-secondary">{slide.text}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-center gap-2" role="img" aria-label={`Tela ${step + 1} de ${slides.length}`}>
          {slides.map((_, i) => (
            <span key={i} aria-hidden className={cn('h-1.5 rounded-pill transition-all duration-base', i === step ? 'w-6 bg-gold-500' : 'w-1.5 bg-border-strong')} />
          ))}
        </div>
        {showInvite ? (
          <>
            <Button block onClick={activateNow} icon={<Users size={20} aria-hidden />}>
              Ativar meu perfil
            </Button>
            <Button block variant="secondary" onClick={finish}>
              Agora não
            </Button>
          </>
        ) : (
          <Button block onClick={() => (last ? finish() : setStep(step + 1))}>
            {last ? 'Começar' : 'Continuar'}
          </Button>
        )}
      </div>
    </div>
  );
}
