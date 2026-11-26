import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, Check, ChevronLeft, ChevronRight, Clock3, Pause, Play, RotateCcw, RotateCw, Subtitles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { materials } from '@/data/materials';
import type { Material } from '@/data/types';
import { MATERIAL_ICON, MATERIAL_LABEL, materialView, releaseLabel } from '@/lib/materials';
import { useClock, useDemo } from '@/state/store';
import { haptic } from '@/lib/haptics';
import { cn } from '@/lib/cn';

function minutesOf(meta: string): number {
  const m = /(\d+)\s*min/.exec(meta);
  return m ? Number(m[1]) : 10;
}

function pagesOf(m: Material): number {
  const p = /(\d+)\s*páginas/.exec(m.meta);
  if (p) return Number(p[1]);
  const mb = /([\d,]+)\s*MB/.exec(m.meta);
  return mb ? Math.max(6, Math.round(Number((mb[1] ?? '4').replace(',', '.')) * 3)) : 8;
}

const BULLETS = [
  'Ponto de partida: onde você está hoje',
  'O que muda quando você assume o resultado',
  'Três decisões para tomar esta semana',
  'Como medir se funcionou em 30 dias',
  'Erros comuns e como evitá-los',
];

function fmt(sec: number): string {
  const s = Math.max(0, Math.round(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function PdfReader({ m }: { m: Material }) {
  const total = pagesOf(m);
  const [page, setPage] = useState(1);
  return (
    <div className="flex flex-col gap-3">
      <article className="min-h-[340px] rounded-lg border border-border-subtle bg-surface-2 p-5 shadow-card" aria-label={`Página ${page} de ${total}`}>
        <p className="text-caption text-gold-200">Página {page}</p>
        <h2 className="mt-2 text-h1 text-text-primary">{page === 1 ? m.title.replace(/^[^:]+:\s*/, '') : BULLETS[(page - 2) % BULLETS.length]}</h2>
        <ul className="mt-4 flex flex-col gap-3 text-body text-text-secondary">
          {BULLETS.slice(0, 3).map((b, i) => (
            <li key={b} className="flex items-start gap-3">
              <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-pill bg-gold-500" />
              {page === 1 ? ['Wendell Carvalho e Karina Peloi Carvalho', 'Protagon · Dia ' + m.day, 'Material do aluno'][i] : b}
            </li>
          ))}
        </ul>
      </article>
      <div className="flex items-center justify-between">
        <Button variant="secondary" size="compact" icon={<ChevronLeft size={18} aria-hidden />} disabled={page === 1} onClick={() => setPage((p) => p - 1)} aria-label="Página anterior">
          Anterior
        </Button>
        <p className="tabular text-body text-text-secondary">
          {page} de {total}
        </p>
        <Button variant="secondary" size="compact" disabled={page === total} onClick={() => setPage((p) => p + 1)} aria-label="Próxima página">
          Próxima <ChevronRight size={18} aria-hidden />
        </Button>
      </div>
    </div>
  );
}

const AREAS = ['Saúde', 'Família', 'Carreira', 'Finanças', 'Relacionamentos', 'Lazer', 'Espiritualidade', 'Crescimento'];

function WorkbookReader({ m }: { m: Material }) {
  const wheel = m.title.includes('Roda da vida');
  const [scores, setScores] = useState<Record<string, number>>({});
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const prompts = ['Qual é o resultado que você quer em 90 dias?', 'O que você vai parar de fazer?', 'Quem pode te ajudar e como pedir?'];
  return (
    <div className="flex flex-col gap-4">
      <p className="text-body text-text-secondary">Preencha com calma. As respostas ficam salvas neste aparelho.</p>
      {wheel
        ? AREAS.map((a) => (
            <div key={a} className="rounded-lg border border-border-subtle bg-surface-1 p-3">
              <label htmlFor={`wb-${a}`} className="flex items-baseline justify-between text-body text-text-primary">
                {a}
                <span className="tabular text-body-strong text-gold-200">{scores[a] ?? 5}</span>
              </label>
              <input
                id={`wb-${a}`}
                type="range"
                min={0}
                max={10}
                value={scores[a] ?? 5}
                onChange={(e) => setScores((s) => ({ ...s, [a]: Number(e.target.value) }))}
                className="mt-2 h-8 w-full accent-gold-500"
              />
            </div>
          ))
        : prompts.map((p, i) => (
            <div key={p} className="flex flex-col gap-2">
              <label htmlFor={`wb-${i}`} className="text-body-strong text-text-primary">
                {i + 1}. {p}
              </label>
              <textarea
                id={`wb-${i}`}
                rows={3}
                value={answers[p] ?? ''}
                onChange={(e) => setAnswers((a) => ({ ...a, [p]: e.target.value }))}
                className="w-full resize-none rounded-md border border-border-strong bg-surface-3 p-3 text-body text-text-primary focus:border-gold-200 focus:outline-none"
              />
            </div>
          ))}
    </div>
  );
}

function MediaPlayer({ m, video }: { m: Material; video: boolean }) {
  const duration = minutesOf(m.meta) * 60;
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [captions, setCaptions] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const t = window.setInterval(() => setPos((p) => Math.min(duration, p + 0.5 * speed)), 500);
    return () => window.clearInterval(t);
  }, [playing, speed, duration]);
  useEffect(() => {
    if (pos >= duration) setPlaying(false);
  }, [pos, duration]);

  const speeds = [1, 1.25, 1.5, 2];
  return (
    <div className="flex flex-col gap-4">
      {video ? (
        <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border border-border-subtle bg-surface-2" style={{ backgroundImage: 'radial-gradient(80% 80% at 50% 0%, rgba(204,143,78,0.25), transparent 70%)' }}>
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? 'Pausar vídeo' : 'Reproduzir vídeo'}
            className="flex h-16 w-16 items-center justify-center rounded-pill border border-border-gold bg-bg text-gold-200 active:scale-press"
          >
            {playing ? <Pause size={28} aria-hidden /> : <Play size={28} aria-hidden className="translate-x-0.5" />}
          </button>
          {captions ? (
            <p className="absolute inset-x-3 bottom-3 rounded-md bg-bg px-3 py-1.5 text-center text-body text-text-primary">Quem assume o resultado, assume o rumo.</p>
          ) : null}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface-2 py-8 shadow-card">
          <span className="flex h-20 w-20 items-center justify-center rounded-pill bg-tint-gold">{(() => { const I = MATERIAL_ICON.audio; return <I size={36} aria-hidden className="text-gold-200" />; })()}</span>
          <p className="px-4 text-center text-body-strong text-text-primary">{m.title.replace(/^[^:]+:\s*/, '')}</p>
          <p className="text-caption text-text-secondary">Wendell Carvalho</p>
        </div>
      )}

      <div>
        <input
          type="range"
          min={0}
          max={duration}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          aria-label="Posição"
          aria-valuetext={`${fmt(pos)} de ${fmt(duration)}`}
          className="h-8 w-full accent-gold-500"
        />
        <p className="tabular flex justify-between text-caption text-text-secondary">
          <span>{fmt(pos)}</span>
          <span>-{fmt(duration - pos)}</span>
        </p>
      </div>

      <div className="flex items-center justify-center gap-5">
        <button type="button" onClick={() => setPos((p) => Math.max(0, p - 15))} aria-label="Voltar 15 segundos" className="flex h-touch w-touch items-center justify-center rounded-pill text-text-primary active:bg-surface-3">
          <RotateCcw size={26} aria-hidden />
        </button>
        {!video ? (
          <button type="button" onClick={() => setPlaying((p) => !p)} aria-label={playing ? 'Pausar' : 'Reproduzir'} className="flex h-16 w-16 items-center justify-center rounded-pill bg-gradient-cta text-on-cta active:scale-press">
            {playing ? <Pause size={28} aria-hidden /> : <Play size={28} aria-hidden className="translate-x-0.5" />}
          </button>
        ) : null}
        <button type="button" onClick={() => setPos((p) => Math.min(duration, p + 15))} aria-label="Avançar 15 segundos" className="flex h-touch w-touch items-center justify-center rounded-pill text-text-primary active:bg-surface-3">
          <RotateCw size={26} aria-hidden />
        </button>
      </div>

      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setSpeed((s) => speeds[(speeds.indexOf(s) + 1) % speeds.length] ?? 1)}
          aria-label={`Velocidade ${String(speed).replace('.', ',')}x. Alterar`}
          className="tabular min-h-touch rounded-pill border border-border-strong px-4 text-body-strong text-text-primary active:bg-surface-3"
        >
          {String(speed).replace('.', ',')}x
        </button>
        {video ? (
          <button
            type="button"
            aria-pressed={captions}
            onClick={() => setCaptions((c) => !c)}
            className={cn('flex min-h-touch items-center gap-1.5 rounded-pill border px-4 text-body-strong active:bg-surface-3', captions ? 'border-gold-500 text-gold-200' : 'border-border-strong text-text-primary')}
          >
            <Subtitles size={18} aria-hidden /> Legendas
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** M02 · Leitor e player simulados: PDF, workbook, áudio e vídeo. Marca como concluído e baixa para ler offline. */
export function MaterialViewer() {
  const id = useDemo((s) => s.overlayId);
  const clock = useClock();
  const online = useDemo((s) => s.online);
  const downloaded = useDemo((s) => s.downloaded);
  const completed = useDemo((s) => s.completed);
  const setDownloaded = useDemo((s) => s.setDownloaded);
  const setCompleted = useDemo((s) => s.setCompleted);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const showToast = useDemo((s) => s.showToast);
  const m = useMemo(() => materials.find((x) => x.id === id), [id]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!downloading || !m) return;
    const t = window.setTimeout(() => {
      setDownloaded(m.id, true);
      setDownloading(false);
      haptic('light', 'material baixado');
      showToast({ text: 'Material baixado. Disponível sem internet.', tone: 'success' });
    }, 1100);
    return () => window.clearTimeout(t);
  }, [downloading, m, setDownloaded, showToast]);

  const header = (
    <header className="flex items-center justify-between gap-2 px-3 pb-2 pt-[58px]">
      <button type="button" onClick={closeOverlay} className="flex h-11 items-center gap-1 rounded-pill pr-2 text-body text-text-secondary active:bg-surface-3">
        <X size={22} aria-hidden /> Fechar
      </button>
      {m ? <p className="text-caption text-text-secondary">{MATERIAL_LABEL[m.type]}</p> : null}
      <span className="w-[72px]" />
    </header>
  );

  if (!m) return <div className="flex h-full flex-col bg-bg">{header}<EmptyState icon={<Clock3 size={48} strokeWidth={1.5} />} title="Material não encontrado" text="Volte à lista de materiais." /></div>;

  const view = materialView(clock, m, downloaded, completed);
  if (view === 'scheduled') {
    return (
      <div className="flex h-full flex-col bg-bg">
        {header}
        <EmptyState
          icon={<Clock3 size={48} strokeWidth={1.5} />}
          title={m.title}
          text={`${releaseLabel(m, clock)}. Avisamos quando estiver liberado.`}
          action={<Button block variant="secondary" onClick={closeOverlay}>Voltar</Button>}
        />
      </div>
    );
  }
  const isDownloaded = Boolean(downloaded[m.id]);
  const isDone = Boolean(completed[m.id]);

  return (
    <div className="flex h-full flex-col bg-bg">
      {header}
      <div className="no-scrollbar flex-1 overflow-y-auto px-margin pb-4">
        <h1 className="text-h2 text-text-primary">{m.title}</h1>
        <p className="mb-4 mt-1 text-caption text-text-secondary">{m.meta}</p>
        {m.type === 'pdf' ? <PdfReader m={m} /> : m.type === 'workbook' ? <WorkbookReader m={m} /> : <MediaPlayer m={m} video={m.type === 'video'} />}
      </div>
      <div className="flex gap-3 px-margin pb-8 pt-3">
        {isDownloaded ? (
          <p className="flex min-h-button flex-1 items-center justify-center gap-2 rounded-md border border-border-strong text-body text-text-secondary">
            <ArrowDownToLine size={18} aria-hidden className="text-gold-200" /> Baixado
          </p>
        ) : (
          <Button variant="secondary" className="flex-1 px-3" loading={downloading} disabled={!online} icon={<ArrowDownToLine size={18} aria-hidden />} onClick={() => setDownloading(true)}>
            {online ? 'Baixar' : 'Sem internet'}
          </Button>
        )}
        <Button
          className="flex-1 px-3"
          variant={isDone ? 'secondary' : 'primary'}
          icon={<Check size={18} aria-hidden />}
          onClick={() => {
            setCompleted(m.id, !isDone);
            if (!isDone) {
              haptic('success', 'material concluído');
              showToast({ text: 'Material marcado como concluído', tone: 'success' });
            }
          }}
        >
          {isDone ? 'Concluído' : 'Concluir'}
        </Button>
      </div>
    </div>
  );
}
