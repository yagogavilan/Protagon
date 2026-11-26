import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert, LifeBuoy, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { edition } from '@/data/edition';
import { useDemo } from '@/state/store';
import { looksLikeCpf, maskCpfInput } from '@/lib/format';
import { cn } from '@/lib/cn';

/** CPF que simula "ingresso não encontrado" no mockup */
export const NOT_FOUND_CPF = '000.000.000-00';

type Status = 'idle' | 'sending' | 'notFound';

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

/** E01 · Login: e-mail ou CPF, sem senha */
export function LoginScreen() {
  const submitIdentifier = useDemo((s) => s.submitIdentifier);
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [showSupport, setShowSupport] = useState(false);

  const isCpf = looksLikeCpf(value);
  const cpfComplete = isCpf && value.replace(/\D/g, '').length === 11;
  const valid = isCpf ? cpfComplete : isValidEmail(value.trim());

  const onChange = (raw: string) => {
    setStatus('idle');
    setValue(looksLikeCpf(raw) ? maskCpfInput(raw) : raw);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid || status === 'sending') return;
    setStatus('sending');
    window.setTimeout(() => {
      if (value === NOT_FOUND_CPF || value.trim().toLowerCase().startsWith('naoencontrado@')) {
        setStatus('notFound');
        return;
      }
      setStatus('idle');
      submitIdentifier(value.trim());
    }, 1100);
  };

  return (
    <div
      className="flex h-full flex-col px-margin pb-10 pt-[96px]"
      style={{ backgroundImage: 'radial-gradient(90% 45% at 50% 0%, rgba(204,143,78,0.22), transparent 70%)' }}
    >
      <div className="flex flex-col items-start gap-3">
        <span className="text-caption uppercase tracking-[0.2em] text-gold-200">{edition.name}</span>
        <h1 className="text-display text-text-primary">Que bom ter você aqui</h1>
        <p className="text-body text-text-secondary">
          Entre com o e-mail ou o CPF usado na compra do ingresso. Vamos enviar um código de 6 dígitos.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-auto flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="identifier" className="text-caption text-text-secondary">
            E-mail ou CPF
          </label>
          <input
            id="identifier"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            inputMode={isCpf ? 'numeric' : 'email'}
            autoComplete="username"
            placeholder="seu@email.com ou 000.000.000-00"
            aria-invalid={status === 'notFound'}
            aria-describedby={status === 'notFound' ? 'login-error' : undefined}
            className={cn(
              'tabular h-14 rounded-md border bg-surface-1 px-4 text-body text-text-primary placeholder:text-text-tertiary',
              'outline-none transition-colors duration-fast focus:border-gold-200',
              status === 'notFound' ? 'border-danger' : 'border-border-strong',
            )}
          />
        </div>

        <AnimatePresence initial={false}>
          {status === 'notFound' ? (
            <motion.div
              key="nf"
              id="login-error"
              role="alert"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="card flex flex-col gap-3 p-4"
            >
              <p className="flex items-start gap-2 text-body text-text-primary">
                <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" />
                Não encontramos ingresso para {isCpf ? 'este CPF' : 'este e-mail'}.
              </p>
              <p className="text-[15px] leading-[22px] text-text-secondary">
                Confira se é o mesmo dado usado na compra. Se o ingresso estiver no nome de outra pessoa, fale com o suporte.
              </p>
              {showSupport ? (
                <div className="flex flex-col gap-2 rounded-md bg-surface-2 p-3 text-[15px] text-text-primary">
                  <span className="flex items-center gap-2">
                    <Phone size={16} aria-hidden className="text-gold-200" />
                    <span className="tabular select-all">{edition.support.phone}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Mail size={16} aria-hidden className="text-gold-200" />
                    <span className="select-all">{edition.support.email}</span>
                  </span>
                  <span className="text-caption text-text-tertiary">{edition.support.hours}</span>
                </div>
              ) : (
                <Button variant="secondary" icon={<LifeBuoy size={18} aria-hidden />} onClick={() => setShowSupport(true)}>
                  Falar com o suporte
                </Button>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <Button type="submit" block disabled={!valid || status === 'sending'} aria-busy={status === 'sending'}>
          {status === 'sending' ? 'Enviando código...' : 'Receber código'}
        </Button>
        <p className="text-center text-caption text-text-tertiary">Sem senha. O código vale por 10 minutos.</p>
      </form>
    </div>
  );
}
