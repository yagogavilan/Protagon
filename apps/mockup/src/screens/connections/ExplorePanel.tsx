import { useMemo, useState } from 'react';
import { Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { FilterChip } from '@/components/ui/FilterChip';
import { TierBadge, TIER_LABEL } from '@/components/ui/TierBadge';
import { participants, objectivesList, topicIds, topics } from '@/data/participants';
import type { Objective, Participant, Tier, TopicId } from '@/data/types';
import { computeAffinity, connectionsPool, objectiveLabel } from '@/lib/affinity';
import { plural, relationOf } from '@/lib/connections';
import { useDemo } from '@/state/store';

interface Filters {
  segment: string | null;
  city: string | null;
  objective: Objective | null;
  /** "Domina": conhecimento (DEC-002) */
  expertise: TopicId | null;
  tier: Tier | null;
}
const EMPTY: Filters = { segment: null, city: null, objective: null, expertise: null, tier: null };
const PAGE = 8;

const cityOf = (p: Participant) => p.city.replace(/, [A-Z]{2}$/, '');

function Section<T extends string>({ title, options, value, onChange, label }: { title: string; options: T[]; value: T | null; onChange: (v: T | null) => void; label?: (v: T) => string }) {
  return (
    <section className="mb-3">
      <h3 className="text-body-strong text-text-primary">{title}</h3>
      <div className="mt-1 flex flex-wrap gap-x-2">
        {options.map((o) => (
          <FilterChip key={o} selected={value === o} onClick={() => onChange(value === o ? null : o)}>
            {label ? label(o) : o}
          </FilterChip>
        ))}
      </div>
    </section>
  );
}

/** C06 · Explorar: busca e filtros por segmento, cidade, objetivo, "Domina" e ingresso; resultados e sem resultados. */
export function ExplorePanel() {
  const profile = useDemo((s) => s.profile);
  const blocked = useDemo((s) => s.blocked);
  const state = useDemo();
  const openOverlay = useDemo((s) => s.openOverlay);
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [sheet, setSheet] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  const pool = useMemo(() => connectionsPool(participants).filter((p) => !blocked[p.id]), [blocked]);
  const segments = useMemo(() => Array.from(new Set(pool.map((p) => p.segment))).sort((a, b) => a.localeCompare(b, 'pt-BR')), [pool]);
  const cities = useMemo(() => Array.from(new Set(pool.map(cityOf))).sort((a, b) => a.localeCompare(b, 'pt-BR')), [pool]);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    const apply = (f: Filters) =>
      pool.filter(
        (p) =>
          (!f.segment || p.segment === f.segment) &&
          (!f.city || cityOf(p) === f.city) &&
          (!f.objective || p.objectives.includes(f.objective)) &&
          (!f.expertise || p.expertise.includes(f.expertise)) &&
          (!f.tier || p.tier === f.tier) &&
          (!q || [p.name, p.company, p.segment, p.niche, p.city, ...p.interests, ...p.expertise.map((t) => topics[t].know)].some((t) => t.toLowerCase().includes(q))),
      );
    return apply(filters)
      .map((p) => ({ p, a: computeAffinity(profile, p) }))
      .sort((x, y) => y.a.score - x.a.score);
  }, [pool, filters, q, profile]);

  const draftCount = pool.filter(
    (p) => (!draft.segment || p.segment === draft.segment) && (!draft.city || cityOf(p) === draft.city) && (!draft.objective || p.objectives.includes(draft.objective)) && (!draft.expertise || p.expertise.includes(draft.expertise)) && (!draft.tier || p.tier === draft.tier),
  ).length;

  const activeChips: { key: keyof Filters; label: string }[] = [];
  if (filters.segment) activeChips.push({ key: 'segment', label: filters.segment });
  if (filters.city) activeChips.push({ key: 'city', label: filters.city });
  if (filters.objective) activeChips.push({ key: 'objective', label: objectiveLabel(filters.objective) });
  if (filters.expertise) activeChips.push({ key: 'expertise', label: `Domina: ${topics[filters.expertise].know}` });
  if (filters.tier) activeChips.push({ key: 'tier', label: TIER_LABEL[filters.tier] });
  const clear = () => {
    setFilters(EMPTY);
    setQuery('');
    setLimit(PAGE);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search size={18} aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <label htmlFor="explore-q" className="sr-only">
            Buscar por nome, empresa, nicho ou interesse
          </label>
          <input
            id="explore-q"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(PAGE);
            }}
            placeholder="Nome, empresa, nicho ou tema"
            className="h-12 w-full rounded-md border border-border-strong bg-surface-1 pl-10 pr-3 text-body text-text-primary placeholder:text-text-secondary focus:border-gold-200 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setDraft(filters);
            setSheet(true);
          }}
          aria-label={`Filtros${activeChips.length ? `, ${activeChips.length} ativos` : ''}`}
          className="flex h-12 min-w-[48px] shrink-0 items-center justify-center gap-1.5 rounded-md border border-border-strong px-3 text-body-strong text-text-primary active:bg-surface-3"
        >
          <SlidersHorizontal size={18} aria-hidden /> {activeChips.length > 0 ? <span className="tabular text-gold-200">{activeChips.length}</span> : null}
        </button>
      </div>

      {activeChips.length > 0 ? (
        <div className="flex flex-wrap gap-2" aria-label="Filtros ativos">
          {activeChips.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => setFilters((f) => ({ ...f, [c.key]: null }))}
              aria-label={`Remover filtro ${c.label}`}
              className="flex h-9 items-center gap-1.5 rounded-pill border border-gold-500 bg-tint-gold px-3 text-[15px] text-text-primary"
            >
              {c.label} <X size={14} aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      <p className="tabular text-caption text-text-secondary" aria-live="polite">
        {plural(results.length, 'pessoa', 'pessoas')} {activeChips.length || q ? 'com esses filtros' : 'nesta edição'}
      </p>

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchX size={48} strokeWidth={1.5} />}
          title="Ninguém com esses filtros"
          text="Tente tirar um filtro ou buscar por outro segmento ou cidade."
          action={
            <Button block variant="secondary" onClick={clear}>
              Limpar filtros
            </Button>
          }
        />
      ) : (
        <>
          <ul className="flex flex-col gap-2">
            {results.slice(0, limit).map(({ p, a }) => {
              const rel = relationOf(state, p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => openOverlay('person', p.id)}
                    aria-label={`${p.company}, ${p.segment}. ${p.name}, ${p.role}, ingresso ${TIER_LABEL[p.tier]}. Ver perfil.`}
                    className="flex w-full flex-col gap-2 rounded-lg border border-border-subtle bg-surface-1 p-card text-left shadow-card active:scale-press"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="min-w-0">
                        <span className="block truncate text-body-strong text-text-primary">{p.company}</span>
                        <span className="block truncate text-caption text-text-secondary">
                          {p.segment} · {cityOf(p)}
                        </span>
                      </span>
                      {rel === 'connected' ? <Chip variant="common">Conectados</Chip> : rel === 'pending' ? <Chip>Pendente</Chip> : a.level === 'alta' ? <Chip variant="objective">Afinidade alta</Chip> : null}
                    </span>
                    <span className="flex items-center gap-2 text-body text-text-primary">
                      <span className="truncate">{p.name}</span>
                      <TierBadge tier={p.tier} />
                    </span>
                    {filters.expertise ? (
                      <span className="truncate text-caption text-gold-200">Domina {topics[filters.expertise].know.replace(/^./, (c) => c.toLowerCase())}</span>
                    ) : null}
                    <span className="flex flex-wrap gap-2">
                      {p.objectives.slice(0, 2).map((o) => (
                        <Chip key={o} variant="objective">
                          {objectiveLabel(o)}
                        </Chip>
                      ))}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {results.length > limit ? (
            <Button block variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
              Ver mais ({results.length - limit})
            </Button>
          ) : null}
        </>
      )}

      <BottomSheet
        open={sheet}
        onClose={() => setSheet(false)}
        size="tall"
        title="Filtros"
        closeLabel="Fechar filtros"
        footer={
          <>
            <Button
              block
              onClick={() => {
                setFilters(draft);
                setLimit(PAGE);
                setSheet(false);
              }}
            >
              Ver {plural(draftCount, 'pessoa', 'pessoas')}
            </Button>
            <Button block variant="ghost" onClick={() => setDraft(EMPTY)}>
              Limpar filtros
            </Button>
          </>
        }
      >
        <Section title="Segmento" options={segments} value={draft.segment} onChange={(v) => setDraft((d) => ({ ...d, segment: v }))} />
        <Section title="Cidade" options={cities} value={draft.city} onChange={(v) => setDraft((d) => ({ ...d, city: v }))} />
        <Section title="Objetivo" options={objectivesList} value={draft.objective} onChange={(v) => setDraft((d) => ({ ...d, objective: v }))} />
        <Section<TopicId> title="Domina" options={topicIds} value={draft.expertise} onChange={(v) => setDraft((d) => ({ ...d, expertise: v }))} label={(t) => topics[t].know} />
        <Section<Tier> title="Ingresso" options={['vip', 'diamond']} value={draft.tier} onChange={(v) => setDraft((d) => ({ ...d, tier: v }))} label={(t) => TIER_LABEL[t]} />
      </BottomSheet>
    </div>
  );
}
