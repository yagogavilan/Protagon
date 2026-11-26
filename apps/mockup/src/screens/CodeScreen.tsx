import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Check, ChevronLeft, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useDemo } from '@/state/store';
import { hideCpf, hideEmail, looksLikeCpf } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';

/** Código que simula "código inválido" no mockup */
export const INVALID_CODE = '000000';
const RESEND_SECONDS = 30;

type Status = 'typing' | 'checking' | 'invalid' | 'success';

/** E02 · Código de 6 dígitos */
export function CodeScreen() {
  const identifier = useDemo((s) => s.loginIdentifier);
  const backToLogin = useDemo((s) => s.backToLogin);
  const completeLogin = useDemo((s) => s.completeLogin);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('typing');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const destination = !identifier
    ? 'o e-mail cadastrado'
    : looksLikeCpf(identifier) ? `o e-mail cadastrado no CPF ${hideCpf(identifier)}` : hideEmail(identifier);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = window.setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [seconds]);

  const verify = (value: string) => {
    setStatus('checking');
    window.setTimeout(() => {
      if (value === INVALID_CODE) {
        setStatus('invalid');
        haptic('error', 'código inválido');
        return;
      }
      setStatus('success');
      haptic('success', 'login');
      window.setTimeout(completeLogin, 900);
    }, 700);
  };

  const onChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (status === 'invalid') setStatus('typing');
    if (digits.length === 6) verify(digits);
  };

  const resend = () => {
    setSeconds(RESEND_SECONDS);
    setResent(true);
    setCode('');
    setStatus('typing');
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-full flex-col px-margin pb-10 pt-[64px]">
      <button
        type="button"
        onClick={backToLogin}
        className="-ml-2 flex h-11 items-center gap-1 self-start rounded-pill px-2 text-body text-text-secondary"
      >
        <ChevronLeft size={20} aria-hidden /> Trocar e-mail ou CPF
      </button>

      <div className="mt-6 flex flex-col gap-3">
        <h1 className="text-h1 text-text-primary">Digite o código</h1>
        <p className="text-body text-text-secondary">
          Enviamos 6 dígitos para <span className="text-text-primary">{destination}</span>.
        </p>
      </div>

      <label htmlFor="otp" className="sr-only">
        Código de 6 dígitos
      </label>
      <div className="relative mt-8" onClick={() => inputRef.current?.focus()}>
        <input
          ref={inputRef}
          id="otp"
          value={code}
          onChange={(e) => onChange(e.target.value)}
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          disabled={status === 'checking' || status === 'success'}
          aria-invalid={status === 'invalid'}
          aria-describedby={status === 'invalid' ? 'otp-error' : undefined}
          className="absolute inset-0 h-full w-full opacity-0"
        />
        <motion.div
          className="flex justify-between gap-2"
          animate={status === 'invalid' ? { x: [0, -8, 8, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.32 }}
          aria-hidden
        >
          {Array.from({ length: 6 }, (_, i) => {
            const char = code[i];
            const isActive = i === code.length && status === 'typing';
            return (
              <span
                key={i}
                className={cn(
                  'tabular flex h-14 flex-1 items-center justify-center rounded-md border bg-surface-1 text-h1 text-text-primary',
                  'transition-colors duration-fast',
                  status === 'invalid' && 'border-danger',
                  status === 'success' && 'border-live',
                  status !== 'invalid' && status !== 'success' && (isActive ? 'border-gold-200 shadow-glow-gold' : 'border-border-strong'),
                )}
              >
                {char ?? ''}
              </span>
            );
          })}
        </motion.div>
      </div>

      <div className="mt-4 min-h-[48px]" aria-live="polite">
        {status === 'invalid' ? (
          <p id="otp-error" role="alert" className="flex items-start gap-2 text-body text-text-primary">
            <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" />
            Código inválido. Confira os 6 dígitos ou peça um novo.
          </p>
        ) : null}
        {status === 'checking' ? <p className="text-body text-text-secondary">Conferindo...</p> : null}
        {status === 'success' ? (
          <p className="flex items-center gap-2 text-body text-live">
            <Check size={20} aria-hidden /> Tudo certo. Entrando...
          </p>
        ) : null}
        {status === 'typing' && resent ? <p className="text-body text-text-secondary">Enviamos um novo código.</p> : null}
      </div>

      <div className="mt-auto flex flex-col items-center gap-2">
        <Button variant="ghost" disabled={seconds > 0} onClick={resend} className="tabular disabled:text-text-secondary disabled:opacity-100">
          {seconds > 0 ? `Reenviar código em 0:${String(seconds).padStart(2, '0')}` : 'Reenviar código'}
        </Button>
        <p className="text-center text-caption text-text-tertiary">Não chegou? Veja a caixa de spam ou promoções.</p>
      </div>
    </div>
  );
}
