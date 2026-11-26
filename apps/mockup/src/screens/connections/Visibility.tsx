import { Switch } from '@/components/ui/Switch';
import { useDemo, type Privacy } from '@/state/store';
import type { ContactChannel } from '@/data/types';

/** Campos de visibilidade do perfil (C01 passo 3 e U03). Nome e ingresso ficam sempre visíveis e não entram aqui. */
export const VISIBILITY_FIELDS: { key: keyof Privacy; label: string; hint?: string }[] = [
  { key: 'company', label: 'Empresa' },
  { key: 'role', label: 'Cargo' },
  { key: 'city', label: 'Cidade' },
  { key: 'niche', label: 'Nicho' },
  { key: 'goal', label: 'Objetivo no Protagon' },
  { key: 'objectives', label: 'Objetivos' },
  { key: 'interests', label: 'Interesses' },
  { key: 'photo', label: 'Foto', hint: 'Só aparece se você adicionar uma' },
  {
    key: 'challenge',
    label: 'Maior desafio',
    hint: 'Só aparece se você preencher. Desligado, ele continua melhorando as suas sugestões, mas ninguém o vê.',
  },
];

export function VisibilitySwitches() {
  const privacy = useDemo((s) => s.privacy);
  const setPrivacy = useDemo((s) => s.setPrivacy);
  return (
    <>
      {VISIBILITY_FIELDS.map((f) => (
        <Switch key={f.key} label={f.label} hint={f.hint} checked={privacy[f.key]} onChange={(v) => setPrivacy(f.key, v)} />
      ))}
    </>
  );
}

const CHANNELS: { id: ContactChannel; label: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'instagram', label: 'Instagram' },
];

/**
 * Depois do aceite, você compartilha (SEC-002): uma chave por canal, desligadas por padrão. O telefone da compra só
 * pré-preenche o WhatsApp e pode ser editado em "Complete seu perfil".
 */
export function ContactChannelSwitches() {
  const share = useDemo((s) => s.contactShare);
  const setShare = useDemo((s) => s.setContactShare);
  const profile = useDemo((s) => s.profile);
  const value: Record<ContactChannel, string> = {
    whatsapp: profile.whatsapp ? `${profile.whatsapp} · da sua compra` : 'Não informado',
    linkedin: profile.linkedin || 'Não informado',
    instagram: profile.instagram || 'Não informado',
  };
  return (
    <>
      {CHANNELS.map((c) => (
        <Switch key={c.id} label={c.label} hint={value[c.id]} checked={share[c.id]} onChange={(v) => setShare(c.id, v)} />
      ))}
    </>
  );
}

/** Link da política de privacidade (simulado no mockup: avisa que abriria a página) */
export function PrivacyPolicyLink({ className }: { className?: string }) {
  const showToast = useDemo((s) => s.showToast);
  return (
    <button
      type="button"
      onClick={() => showToast({ text: 'Abriria a política de privacidade (simulado)', tone: 'info' })}
      className={`flex min-h-touch items-center rounded-md px-2 text-body-strong text-gold-200 underline underline-offset-4 active:bg-surface-3 ${className ?? ''}`}
    >
      Política de privacidade
    </button>
  );
}
