import { useState } from 'react';
import { Clock3, Footprints, Map as MapIcon, Utensils } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { foodCourt, nearbyRestaurants } from '@/data/content';
import { useDemo } from '@/state/store';

type Tab = 'praca' | 'proximos';

/** A03 · Onde comer: praça de alimentação (2º andar) e restaurantes próximos. */
export function EatScreen() {
  const openMap = useDemo((s) => s.openMap);
  const online = useDemo((s) => s.online);
  const [tab, setTab] = useState<Tab>('praca');
  return (
    <OverlayPage title="Onde comer">
      <div className="flex flex-col gap-3">
        <p className="text-body text-text-secondary">Almoço das 12h30 às 13h30. Volte ao salão às 13h20.</p>
        <SegmentedTabs<Tab>
          label="Onde comer"
          value={tab}
          onChange={setTab}
          items={[
            { id: 'praca', label: 'Praça de alimentação' },
            { id: 'proximos', label: 'Restaurantes próximos' },
          ]}
        />

        {tab === 'praca' ? (
          <>
            <p className="flex items-start gap-2 text-body text-text-primary">
              <Utensils size={20} aria-hidden className="mt-0.5 shrink-0 text-gold-500" /> 2º andar, pela escada B. Pagamento por cartão ou Pix.
            </p>
            <ul className="flex flex-col gap-2">
              {foodCourt.map((f) => (
                <li key={f.id} className="rounded-lg border border-border-subtle bg-surface-1 p-card">
                  <p className="text-body-strong text-text-primary">{f.name}</p>
                  <p className="text-body text-text-secondary">{f.kind}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-2">
                    <Chip>
                      <Clock3 size={12} aria-hidden /> {f.wait}
                    </Chip>
                    <Chip>{f.price}</Chip>
                    {f.note ? <Chip variant="common">{f.note}</Chip> : null}
                  </p>
                </li>
              ))}
            </ul>
            <Button block variant="secondary" icon={<MapIcon size={20} aria-hidden />} onClick={() => openMap('food')}>
              Ver a praça no mapa
            </Button>
          </>
        ) : (
          <>
            {!online ? <p className="text-caption text-text-secondary">Sem internet: tempos a pé podem ter mudado.</p> : null}
            <ul className="flex flex-col gap-2">
              {nearbyRestaurants.map((r) => (
                <li key={r.id} className="rounded-lg border border-border-subtle bg-surface-1 p-card">
                  <p className="text-body-strong text-text-primary">{r.name}</p>
                  <p className="text-body text-text-secondary">{r.kind}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-2">
                    <Chip>
                      <Footprints size={12} aria-hidden /> {r.walk}
                    </Chip>
                    <Chip>{r.price}</Chip>
                    {r.note ? <Chip variant="objective">{r.note}</Chip> : null}
                  </p>
                </li>
              ))}
            </ul>
            <p className="text-caption text-text-secondary">Saindo do local, considere 10 min para ir e 10 para voltar antes de 13h20.</p>
          </>
        )}
      </div>
    </OverlayPage>
  );
}
