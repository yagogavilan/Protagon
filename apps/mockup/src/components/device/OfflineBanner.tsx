import { AnimatePresence, motion } from 'motion/react';
import { Wifi, WifiOff } from 'lucide-react';
import { useDemo } from '@/state/store';

/** G05: banner sem internet / reconectado */
export function OfflineBanner() {
  const online = useDemo((s) => s.online);
  const justReconnected = useDemo((s) => s.justReconnected);
  const show = !online || justReconnected;

  return (
    <AnimatePresence initial={false}>
      {show ? (
        <motion.div
          key={online ? 'on' : 'off'}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
          className="overflow-hidden"
          role="status"
        >
          <div
            className={
              online
                ? 'mx-margin mb-2 flex items-center gap-2 rounded-md border border-live bg-surface-1 px-3 py-2 text-body text-live'
                : 'mx-margin mb-2 flex items-center gap-2 rounded-md border border-warning bg-surface-1 px-3 py-2 text-body text-warning'
            }
          >
            {online ? <Wifi size={16} aria-hidden /> : <WifiOff size={16} aria-hidden />}
            <span className={online ? '' : 'text-text-primary'}>
              {online ? 'Conectado de novo. Tudo atualizado.' : 'Sem internet. Agenda, mapa e credencial seguem funcionando.'}
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
