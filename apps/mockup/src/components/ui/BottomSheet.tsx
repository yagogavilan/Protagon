import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, useReducedMotion, type PanInfo } from 'motion/react';
import { X } from 'lucide-react';
import { useDemo } from '@/state/store';
import { cn } from '@/lib/cn';
import { lockBackground } from '@/lib/inert';

export const SHEET_ROOT_ID = 'sheet-root';

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  closeLabel?: string;
  size?: 'auto' | 'tall';
  children: ReactNode;
  /** Ações empilhadas no rodapé (fixas no `tall`) */
  footer?: ReactNode;
}

const EASE = [0.2, 0.8, 0.2, 1] as const;

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * BottomSheet (design-system §BottomSheet): glass.sheet + shadow.sheet, raio xl no topo, alça, título h2 e X 48.
 * Fecha por X, véu, arrastar para baixo e Esc. Foco vai ao título e volta ao gatilho.
 */
export function BottomSheet({ open, onClose, title, subtitle, closeLabel = 'Fechar', size = 'auto', children, footer }: BottomSheetProps) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const titleRef = useRef<HTMLHeadingElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const dragControls = useDragControls();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    useDemo.getState().hideToast(); // o aviso não pode cobrir os botões da sheet
    const t = window.setTimeout(() => titleRef.current?.focus(), 30);
    const owner = Symbol('sheet');
    lockBackground(SHEET_ROOT_ID, owner, true);
    // Focus trap: Tab e Shift+Tab giram dentro do sheet (o resto da moldura também está inert)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
      if (e.key !== 'Tab') return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const nodes = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((n) => n.offsetParent !== null || n === document.activeElement);
      if (nodes.length === 0) {
        e.preventDefault();
        titleRef.current?.focus();
        return;
      }
      const first = nodes[0]!;
      const last = nodes[nodes.length - 1]!;
      const active = document.activeElement;
      const outside = !active || !dialog.contains(active);
      if (e.shiftKey && (outside || active === first || active === titleRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (outside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      lockBackground(SHEET_ROOT_ID, owner, false);
      returnFocus.current?.focus?.();
    };
  }, [open]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) onClose();
  };

  // O destino do portal fica na moldura, depois do app no DOM: só existe após a primeira montagem
  const [root, setRoot] = useState<HTMLElement | null>(() => (typeof document !== 'undefined' ? document.getElementById(SHEET_ROOT_ID) : null));
  useEffect(() => {
    setRoot(document.getElementById(SHEET_ROOT_ID));
  }, []);
  if (!root) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="pointer-events-auto absolute inset-0 z-sheet" key="sheet">
          <motion.div
            className="absolute inset-0 bg-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32, ease: EASE }}
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={cn(
              'glass-sheet absolute inset-x-0 bottom-0 flex flex-col rounded-t-xl border-t border-border-subtle shadow-sheet',
              size === 'tall' ? 'h-[90%]' : 'max-h-[60%]',
            )}
            initial={reduce ? { opacity: 0 } : { y: '100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '100%' }}
            transition={{ duration: 0.32, ease: EASE }}
            drag={reduce ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            dragListener={false}
            dragControls={dragControls}
            onDragEnd={onDragEnd}
          >
            {/* arrastar pela alça ou pelo cabeçalho; o conteúdo rola normalmente */}
            <div
              className="flex cursor-grab touch-none justify-center pb-1 pt-2"
              aria-hidden
              onPointerDown={(e) => !reduce && dragControls.start(e)}
            >
              <span className="h-1 w-9 rounded-pill bg-border-strong" />
            </div>
            <div
              className="flex touch-none items-start justify-between gap-2 px-5 pt-1"
              onPointerDown={(e) => {
                if (!reduce && !(e.target as HTMLElement).closest('button')) dragControls.start(e);
              }}
            >
              <div className="min-w-0 pt-2">
                <h2 id={titleId} ref={titleRef} tabIndex={-1} className="text-h2 text-text-primary outline-none">
                  {title}
                </h2>
                {subtitle ? <p className="text-body text-text-secondary">{subtitle}</p> : null}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={closeLabel}
                className="-mr-2 flex h-touch w-touch shrink-0 items-center justify-center rounded-md text-text-secondary active:bg-surface-3"
              >
                <X size={24} aria-hidden />
              </button>
            </div>
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-3">
              {children}
            </div>
            {footer ? <div className="flex flex-col gap-2 px-5 pb-[34px] pt-2">{footer}</div> : <div className="h-[34px]" />}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    root,
  );
}
