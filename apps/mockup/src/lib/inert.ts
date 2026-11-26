import type { HTMLAttributes } from 'react';

/** Props para esconder do foco e do leitor de tela o que fica atrás de uma página empilhada (React 18 não tipa `inert`). */
export function inertProps(on: boolean): HTMLAttributes<HTMLElement> {
  return on ? ({ inert: '' } as HTMLAttributes<HTMLElement>) : {};
}

const owners = new Set<symbol>();

/**
 * Enquanto houver um BottomSheet aberto, tudo na moldura do aparelho (menos o destino dos sheets) fica `inert`:
 * o foco não sai do sheet e o leitor de tela não lê o que está atrás (WCAG 2.4.3).
 */
export function lockBackground(rootId: string, owner: symbol, on: boolean): void {
  if (on) owners.add(owner);
  else owners.delete(owner);
  const root = document.getElementById(rootId);
  const frame = root?.parentElement;
  if (!root || !frame) return;
  for (const child of Array.from(frame.children)) {
    if (child === root) continue;
    child.toggleAttribute('inert', owners.size > 0);
  }
}
