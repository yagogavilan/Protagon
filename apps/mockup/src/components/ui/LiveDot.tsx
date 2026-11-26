/** Ponto "ao vivo" 8px: pulsa (opacity 1 <-> 0,35, 1800 ms); estático com reduzir movimento. */
export function LiveDot() {
  return <span aria-hidden className="inline-block h-2 w-2 rounded-pill bg-live animate-live-pulse motion-reduce:animate-none" />;
}
