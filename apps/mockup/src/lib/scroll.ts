/** Rola o contêiner rolável mais próximo (o <main> do app) até o elemento, sem mexer na página inteira. */
export function scrollWithin(el: HTMLElement | null, offset = 120): void {
  if (!el) return;
  const container = el.closest('main');
  if (!container) return;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== container) {
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  container.scrollTo({ top: Math.max(0, top - offset) });
}

/** Rola até o fim o ancestral rolável mais próximo (chat). */
export function scrollToEnd(el: HTMLElement | null): void {
  let node = el?.parentElement ?? null;
  while (node) {
    const o = window.getComputedStyle(node).overflowY;
    if (o === 'auto' || o === 'scroll') {
      node.scrollTop = node.scrollHeight;
      return;
    }
    node = node.parentElement;
  }
}
