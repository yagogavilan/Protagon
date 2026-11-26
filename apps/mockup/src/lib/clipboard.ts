/** Mensagem única quando a cópia falha (BUG-020): o texto já é selecionável com toque e segure */
export const COPY_FAILED = 'Não conseguimos copiar. Toque e segure o texto para copiar.';

/** Cópia antiga (execCommand), para página sem `navigator.clipboard` (http, WebView) */
function legacyCopy(text: string): boolean {
  if (typeof document === 'undefined' || typeof document.execCommand !== 'function') return false;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.setAttribute('aria-hidden', 'true');
  area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(area);
  const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  try {
    area.select();
    area.setSelectionRange(0, text.length);
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    area.remove();
    previous?.focus({ preventScroll: true });
  }
}

/** Copia o texto e diz a verdade: true só se a cópia aconteceu. Quem chama mostra "copiado" ou COPY_FAILED. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // sem permissão ou sem contexto seguro: tenta o caminho antigo
  }
  return legacyCopy(text);
}
