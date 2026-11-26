import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import { DoorOpen, MapPin, Store } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { FilterChip } from '@/components/ui/FilterChip';
import { boothLocation, connectionPoints, edition } from '@/data/edition';
import { useDemo } from '@/state/store';
import type { Tier } from '@/data/types';
import { cn } from '@/lib/cn';

type ItemKind = 'sector' | 'service' | 'point' | 'exit';
interface MapItem {
  id: string;
  label: string;
  kind: ItemKind;
  x: number;
  y: number;
  /** Texto do cartão ao selecionar */
  text: string;
}

const SECTORS: Record<Tier, { y: number; h: number; x: number; w: number; label: string }> = {
  diamond: { x: 64, y: 70, w: 232, h: 40, label: 'Diamond' },
  vip: { x: 44, y: 116, w: 272, h: 48, label: 'VIP' },
  executivo: { x: 28, y: 170, w: 304, h: 56, label: 'Executivo' },
};

function buildItems(tier: Tier): MapItem[] {
  const mine = SECTORS[tier];
  const items: MapItem[] = [
    { id: 'sector', label: 'Meu setor', kind: 'sector', x: mine.x + mine.w - 28, y: mine.y + mine.h / 2, text: `${edition.sectorByTier[tier]}. Entre pelas portas laterais da plenária.` },
    { id: 'checkin', label: 'Credenciamento', kind: 'service', x: 84, y: 295, text: 'Credenciamento no foyer térreo. Retire pulseira e kit com a credencial do app.' },
    { id: 'booth', label: 'Estande', kind: 'service', x: 198, y: 295, text: `${boothLocation}. O time explica o upgrade e tira suas dúvidas.` },
    { id: 'wc', label: 'Banheiros', kind: 'service', x: 294, y: 295, text: 'Banheiros no foyer, ao lado do estande. Há opção acessível.' },
    { id: 'food', label: 'Almoço', kind: 'service', x: 130, y: 398, text: 'Praça de alimentação no 2º andar, pela escada B. Almoço das 12h30 às 13h30.' },
    { id: 'exit-n', label: 'Saída', kind: 'exit', x: 346, y: 122, text: 'Saída lateral da plenária, para a calçada da Av. Praia de Belas.' },
    { id: 'exit-s', label: 'Saída', kind: 'exit', x: 336, y: 406, text: 'Saída de emergência da praça de alimentação.' },
  ];
  if (tier !== 'executivo') {
    const pos: Record<string, [number, number]> = { A: [110, 337], B: [170, 337], C: [284, 404] };
    for (const p of connectionPoints) {
      const [x, y] = pos[p.id] ?? [0, 0];
      items.push({ id: `pt-${p.id}`, label: p.name, kind: 'point', x, y, text: `${p.name}: ${p.where}. Combinem o encontro pelo chat.` });
    }
  }
  return items;
}

/** Largura dos rótulos do foyer (texto de 15 unidades, legível a brilho baixo) */
const PILL_W = { checkin: 134, booth: 84, wc: 96 } as const;

const FILTER_ORDER = ['sector', 'checkin', 'booth', 'wc', 'food', 'pt-A', 'pt-B', 'pt-C', 'exit-n'];

function itemFor(focus: string, tier: Tier): string {
  if (focus === 'booth') return 'booth';
  if (focus === 'food') return 'food';
  if (focus === 'checkin') return 'checkin';
  if ((focus === 'A' || focus === 'B' || focus === 'C') && tier !== 'executivo') return `pt-${focus}`;
  return 'sector';
}

function Hit({ item, sel, onSelect, children, w = 52 }: { item: MapItem; sel: string; onSelect: (id: string) => void; children: ReactNode; w?: number }) {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(item.id);
    }
  };
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={item.label}
      aria-pressed={sel === item.id}
      onClick={() => onSelect(item.id)}
      onKeyDown={onKey}
      className="cursor-pointer outline-none"
    >
      <rect className="fill-transparent stroke-transparent" x={item.x - w / 2} y={item.y - 26} width={w} height="52" rx="12" />
      {children}
    </g>
  );
}

/** A04 · Mapa do local em SVG: setor do aluno destacado, serviços, Pontos de Conexão (VIP+) e saídas. */
export function MapScreen() {
  const tier = useDemo((s) => s.tier);
  const focus = useDemo((s) => s.mapFocus);
  const items = useMemo(() => buildItems(tier), [tier]);
  const [selectedId, setSelectedId] = useState(() => itemFor(focus, tier));
  const selected = items.find((i) => i.id === selectedId) ?? items[0]!;
  const select = (id: string) => setSelectedId(id);
  const chips = FILTER_ORDER.map((id) => items.find((i) => i.id === id)).filter((i): i is MapItem => Boolean(i));

  const selectedRing = (item: MapItem) =>
    selectedId === item.id ? <circle cx={item.x} cy={item.y} r="20" fill="none" strokeWidth="2" className="stroke-gold-200" /> : null;

  return (
    <OverlayPage title="Mapa do local">
      <div className="flex flex-col gap-3">
        <div className="rounded-lg border border-border-subtle bg-surface-1 p-2">
          <svg viewBox="0 0 360 446" role="group" aria-label={`Mapa do ${edition.venue.name}. Seu setor: ${edition.sectorByTier[tier]}.`} className="block w-full">
            {/* plenária */}
            <rect x="16" y="16" width="328" height="224" rx="20" className="fill-surface-2 stroke-border-strong" strokeWidth="1.5" />
            <text x="180" y="38" textAnchor="middle" className="fill-text-primary" fontSize="15" fontWeight="600">
              Plenária principal
            </text>
            <rect x="110" y="46" width="140" height="22" rx="6" className="fill-surface-3" />
            <text x="180" y="62" textAnchor="middle" className="fill-text-primary" fontSize="15" fontWeight="600">
              Palco
            </text>
            {(['diamond', 'vip', 'executivo'] as const).map((t) => {
              const sec = SECTORS[t];
              const mine = t === tier;
              return (
                <g key={t} aria-hidden>
                  <rect
                    x={sec.x}
                    y={sec.y}
                    width={sec.w}
                    height={sec.h}
                    rx="12"
                    className={cn(mine ? 'fill-tint-gold stroke-gold-200' : 'fill-surface-1 stroke-border-strong')}
                    strokeWidth={mine ? 2.5 : 1}
                    strokeDasharray={mine ? undefined : '4 4'}
                  />
                  <text x={sec.x + 14} y={sec.y + sec.h / 2 + 4} className={mine ? 'fill-gold-200' : 'fill-text-primary'} fontSize="15" fontWeight="600">
                    {sec.label}
                    {mine ? ' · seu setor' : ''}
                  </text>
                </g>
              );
            })}
            {/* seleção do setor */}
            <Hit item={items[0]!} sel={selectedId} onSelect={select}>
              <circle cx={items[0]!.x} cy={items[0]!.y} r="9" className="fill-gold-200" />
              <circle cx={items[0]!.x} cy={items[0]!.y} r="3" className="fill-bg" />
              {selectedRing(items[0]!)}
            </Hit>

            {/* foyer */}
            <rect x="16" y="250" width="328" height="108" rx="16" className="fill-surface-1 stroke-border-strong" strokeWidth="1" />
            <text x="28" y="270" className="fill-text-primary" fontSize="15" fontWeight="600">
              Foyer
            </text>
            {(['checkin', 'booth', 'wc'] as const).map((id) => {
              const it = items.find((i) => i.id === id)!;
              return (
                <Hit key={id} item={it} sel={selectedId} onSelect={select} w={PILL_W[id]}>
                  <rect x={it.x - PILL_W[id] / 2} y={it.y - 16} width={PILL_W[id]} height="32" rx="8" className={cn(selectedId === id ? 'fill-tint-gold stroke-gold-200' : 'fill-surface-3 stroke-border-strong')} strokeWidth="1.5" />
                  <text x={it.x} y={it.y + 5} textAnchor="middle" className="fill-text-primary" fontSize="15" fontWeight="600">
                    {it.label}
                  </text>
                </Hit>
              );
            })}

            {/* praça de alimentação */}
            <rect x="16" y="370" width="250" height="68" rx="16" className="fill-surface-1 stroke-border-strong" strokeWidth="1" />
            <Hit item={items.find((i) => i.id === 'food')!} sel={selectedId} onSelect={select} w={200}>
              <rect x="30" y="382" width="200" height="32" rx="8" className={cn(selectedId === 'food' ? 'fill-tint-gold stroke-gold-200' : 'fill-surface-3 stroke-border-strong')} strokeWidth="1.5" />
              <text x="130" y="403" textAnchor="middle" className="fill-text-primary" fontSize="15" fontWeight="600">
                Praça de alimentação
              </text>
            </Hit>

            {/* saídas */}
            {items
              .filter((i) => i.kind === 'exit')
              .map((it) => (
                <Hit key={it.id} item={it} sel={selectedId} onSelect={select}>
                  <rect x={it.x - 12} y={it.y - 12} width="24" height="24" rx="6" className="fill-tint-live stroke-live" strokeWidth="1.5" />
                  <path d={`M${it.x - 5} ${it.y}h10m-4 -4l4 4l-4 4`} fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="stroke-live" />
                  {selectedRing(it)}
                </Hit>
              ))}

            {/* Pontos de Conexão */}
            {items
              .filter((i) => i.kind === 'point')
              .map((it) => (
                <Hit key={it.id} item={it} sel={selectedId} onSelect={select}>
                  <circle cx={it.x} cy={it.y} r="13" className={cn(selectedId === it.id ? 'fill-gold-200' : 'fill-gold-500')} />
                  <text x={it.x} y={it.y + 5} textAnchor="middle" className="fill-bg" fontSize="15" fontWeight="700">
                    {it.id.slice(-1)}
                  </text>
                  {selectedRing(it)}
                </Hit>
              ))}
          </svg>
        </div>

        <div className="no-scrollbar -mx-margin flex gap-1 overflow-x-auto px-margin" role="group" aria-label="Pontos do mapa">
          {chips.map((c) => (
            <FilterChip key={c.id} selected={selectedId === c.id} onClick={() => select(c.id)}>
              {c.label}
            </FilterChip>
          ))}
        </div>

        <section className="rounded-lg border border-border-gold bg-surface-2 p-card shadow-card" aria-live="polite">
          {selected.kind === 'point' || selected.kind === 'sector' ? <MapPin size={24} aria-hidden className="text-gold-500" /> : selected.kind === 'exit' ? <DoorOpen size={24} aria-hidden className="text-live" /> : <Store size={24} aria-hidden className="text-gold-500" />}
          <p className="mt-2 text-h2 text-text-primary">{selected.label}</p>
          <p className="mt-1 text-body text-text-secondary">{selected.text}</p>
        </section>

        {tier === 'executivo' ? (
          <p className="text-body text-text-secondary">Pontos de Conexão aparecem para VIP e Diamond.</p>
        ) : null}
      </div>
    </OverlayPage>
  );
}
