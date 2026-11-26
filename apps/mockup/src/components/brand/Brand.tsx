import { useId } from 'react';
import logoUrl from '@/assets/brand/protagon-logo.svg';
import { LION_PATH } from './lionPath';
import { cn } from '@/lib/cn';

/**
 * Wordmark oficial "Novo Protagon, construa sua vida épica" (SVG todo branco, 1227×302).
 * Não recolorir: a marca só aparece em branco ou no gradiente dourado do leão.
 */
export function Wordmark({ width = 240, className }: { width?: number; className?: string }) {
  return (
    <img
      src={logoUrl}
      width={width}
      height={Math.round((width * 302) / 1227)}
      alt="Novo Protagon, construa sua vida épica"
      draggable={false}
      className={cn('block select-none', className)}
    />
  );
}

/** Símbolo (leão) recortado do SVG oficial. `gold` aplica o gradiente dourado da marca; `white` mantém o branco. */
export function LionMark({ size = 28, tone = 'gold', className, decorative = true }: { size?: number; tone?: 'gold' | 'white'; className?: string; decorative?: boolean }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 224 302"
      width={Math.round((size * 224) / 302)}
      height={size}
      className={cn('shrink-0', className)}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : 'Protagon'}
      fill="none"
    >
      {tone === 'gold' ? (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="224" y2="302" gradientUnits="userSpaceOnUse">
            <stop stopColor="#CC8F4E" />
            <stop offset="1" stopColor="#F0CE99" />
          </linearGradient>
        </defs>
      ) : null}
      <path fillRule="evenodd" clipRule="evenodd" d={LION_PATH} fill={tone === 'gold' ? `url(#${id})` : '#fff'} />
    </svg>
  );
}
