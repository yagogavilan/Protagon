import { BatteryFull, Signal, Wifi, WifiOff } from 'lucide-react';
import { useClock, useDemo } from '@/state/store';
import { cn } from '@/lib/cn';

/** Status bar do iPhone com a hora do relógio do evento */
export function StatusBar({ onDark = true }: { onDark?: boolean }) {
  const clock = useClock();
  const online = useDemo((s) => s.online);
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-40 flex h-[54px] items-center justify-between px-8 pt-1 text-[15px] font-semibold',
        onDark ? 'text-text-primary' : 'text-bg',
      )}
    >
      <span className="tabular w-[72px] text-center" aria-label={`Hora do evento ${clock.time}`}>
        {clock.time}
      </span>
      <span className="flex w-[72px] items-center justify-center gap-1.5" aria-hidden>
        <Signal size={16} strokeWidth={2.5} />
        {online ? <Wifi size={16} strokeWidth={2.5} /> : <WifiOff size={16} strokeWidth={2.5} />}
        <BatteryFull size={20} strokeWidth={2} />
      </span>
    </div>
  );
}
