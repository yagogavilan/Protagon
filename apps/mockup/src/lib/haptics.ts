import { useDemo } from '@/state/store';

export type HapticKind = 'selection' | 'light' | 'success' | 'warning' | 'error';

const PATTERN: Record<HapticKind, number | number[]> = {
  selection: 8,
  light: 15,
  success: [20, 40, 30],
  warning: [40, 60, 40],
  error: [40, 60, 40, 60, 40],
};

const KIND_LABEL: Record<HapticKind, string> = {
  selection: 'seleção',
  light: 'leve',
  success: 'sucesso',
  warning: 'aviso',
  error: 'erro',
};

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
}

/**
 * Háptico simulado: navigator.vibrate quando existir (Android/Chrome) e sempre um registro
 * no painel de demonstração (no iPhone e no desktop não há vibração no navegador).
 * Com "reduzir movimento" ligado, não vibra; o registro no painel continua.
 */
export function haptic(kind: HapticKind, reason: string): void {
  useDemo.getState().recordHaptic(`${KIND_LABEL[kind]} · ${reason}`);
  if (prefersReducedMotion()) return;
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(PATTERN[kind]);
  } catch {
    // sem suporte: ignora
  }
}
