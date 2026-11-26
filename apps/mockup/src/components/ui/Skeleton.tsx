import { cn } from '@/lib/cn';

/** Bloco de carregamento (estado "carregando" das telas novas). Decorativo: quem lê a tela ouve o texto de status. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-skeleton rounded-md bg-surface-3', className)} />;
}
