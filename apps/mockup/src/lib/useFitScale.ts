import { useEffect, useState } from 'react';

const FRAME_W = 414;
const FRAME_H = 868;

/** Escala a moldura para caber na janela sem rolagem lateral (nunca aumenta além de 1). */
export function useFitScale(reservedWidth: number, padding = 32): number {
  const compute = () => {
    if (typeof window === 'undefined') return 1;
    const narrow = window.innerWidth < 1024;
    const availW = window.innerWidth - (narrow ? 0 : reservedWidth) - padding;
    const availH = narrow ? Infinity : window.innerHeight - padding;
    return Math.min(1, availW / FRAME_W, availH / FRAME_H);
  };
  const [scale, setScale] = useState(compute);
  useEffect(() => {
    const onResize = () => setScale(compute());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [reservedWidth, padding]);
  return scale;
}
