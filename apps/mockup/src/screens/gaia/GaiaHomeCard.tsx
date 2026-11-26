import { Check, Smartphone, Wifi, WifiOff } from 'lucide-react';
import { BentoTile } from '@/components/ui/BentoTile';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { edition } from '@/data/edition';
import { formatHour } from '@/lib/clock';
import { useFeatures } from '@/state/features';
import { useDemo } from '@/state/store';
import { currentStep, groupGaiaText, useGroupGaiaCount } from './gaiaState';

/** A atividade é do Dia 2 e acontece durante o evento (nunca antes nem depois) */
export function useGaiaVisible(): boolean {
  const started = useFeatures((s) => s.gaia.started);
  const day = useDemo((s) => s.day);
  const moment = useDemo((s) => s.moment);
  return started && day === 2 && moment !== 'before' && moment !== 'after';
}

/**
 * GA01 · Card da Home. Aparece quando o time inicia a atividade (painel). Em palestra entra sem toast e sem vibração.
 * Concluída: tile pequeno com check. Igual para os 3 ingressos.
 */
export function GaiaHomeCard() {
  const visible = useGaiaVisible();
  const gaia = useFeatures((s) => s.gaia);
  const online = useDemo((s) => s.online);
  const openOverlay = useDemo((s) => s.openOverlay);
  const setWifiOpen = useDemo((s) => s.setWifiOpen);
  const count = useGroupGaiaCount();
  if (!visible) return null;

  const icon = <Smartphone size={16} className="text-gold-500" />;
  if (gaia.completedAt) {
    return (
      <BentoTile icon={icon} heading="Atividade Gaia One" onPress={() => openOverlay('gaia')} pressLabel={`Gaia One ativado às ${formatHour(gaia.completedAt)}. Rever`}>
        <p className="flex items-center gap-2 text-h2 text-text-primary">
          <Check size={22} aria-hidden className="shrink-0 text-live" /> Gaia One ativado
        </p>
        <p className="tabular text-caption text-text-secondary">às {formatHour(gaia.completedAt)}</p>
      </BentoTile>
    );
  }

  const step = currentStep(gaia);
  const begun = step > 1 || gaia.steps[1];
  return (
    <BentoTile variant="emphasis" icon={icon} heading="Atividade Gaia One">
      <p className="text-h2 text-text-primary">Ative seu teste em 4 passos</p>
      <p className="mt-1 text-body text-text-secondary">Leva cerca de 3 minutos</p>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {begun ? <p className="tabular text-body-strong text-text-primary">Passo {step} de 4</p> : null}
        <Chip>
          <Wifi size={12} aria-hidden /> {edition.venue.wifi.network}
        </Chip>
      </div>
      {!online ? (
        <p className="mt-2 flex items-start gap-2 text-body text-text-primary">
          <WifiOff size={20} aria-hidden className="mt-0.5 shrink-0" /> Para baixar o app você precisa de internet.
        </p>
      ) : null}
      <div className="mt-3 flex flex-col gap-1">
        <Button block onClick={() => openOverlay('gaia')}>
          {begun ? 'Continuar' : 'Começar'}
        </Button>
        {!online ? (
          <Button size="compact" variant="ghost" className="self-start" onClick={() => setWifiOpen(true)}>
            Ver Wi-Fi
          </Button>
        ) : null}
      </div>
      {count ? <p className="mt-1 text-caption text-text-secondary">{groupGaiaText(count)}</p> : null}
    </BentoTile>
  );
}
