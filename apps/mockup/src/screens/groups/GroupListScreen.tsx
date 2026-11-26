import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CircleAlert, QrCode, ChevronRight, UsersRound, WifiOff } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Countdown } from '@/components/ui/Countdown';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { TIER_LABEL } from '@/components/ui/TierBadge';
import { FORMATION } from '@/data/groups';
import { formatHour } from '@/lib/clock';
import { firstNameOf, groupLabel, listedGroups, minutesToClose, sectorName, vacancies, vacancyText, type Group } from '@/lib/groups';
import { haptic } from '@/lib/haptics';
import { useFakeLoad } from '@/lib/useFakeLoad';
import { FORMATION_MSG, personFor, useFeatures, useFormation, useMyGroup } from '@/state/features';
import { useClock, useDemo } from '@/state/store';

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

function namesOf(g: Group): string {
  return g.memberIds.map((m) => firstNameOf(personFor(m, g.tier).name)).join(', ');
}

function spokenNames(g: Group): string {
  const n = g.memberIds.map((m) => firstNameOf(personFor(m, g.tier).name));
  return n.length > 1 ? `${n.slice(0, -1).join(', ')} e ${n[n.length - 1]}` : (n[0] ?? '');
}

/**
 * GR02 · Grupos com vaga, GR05 · "Me coloque em um grupo" e a barra fixa de ações.
 * SEC-018: a lista mostra só primeiro nome, setor e vagas (sem empresa, sem foto, sem fila). Só a categoria do aluno.
 */
export function GroupListScreen() {
  const tier = useDemo((s) => s.tier);
  const online = useDemo((s) => s.online);
  const showToast = useDemo((s) => s.showToast);
  const replaceOverlay = useDemo((s) => s.replaceOverlay);
  const openOverlay = useDemo((s) => s.openOverlay);
  const setWifiOpen = useDemo((s) => s.setWifiOpen);
  const groups = useFeatures((s) => s.groups);
  const simulateError = useFeatures((s) => s.simulateError);
  const f = useFeatures.getState;
  const formation = useFormation();
  const myGroup = useMyGroup();
  const clock = useClock();

  const [attempt, setAttempt] = useState(0);
  const loading = useFakeLoad(500, attempt);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noVacancy, setNoVacancy] = useState<Group | null>(null);
  const firstRow = useRef<HTMLButtonElement | null>(null);

  const list = listedGroups(groups, tier);
  const already = useRef(myGroup);

  // Entrou por atalho já estando em grupo: vai direto para "Meu grupo" (GR02 não é alcançável)
  useEffect(() => {
    if (already.current) {
      replaceOverlay('myGroup');
      showToast({ text: `Você já está no ${groupLabel(already.current)}.`, tone: 'info' });
    } else {
      // a lista se atualiza ao abrir: o que o servidor já fechou sai agora
      f().resolvePending();
    }
    // só na abertura
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const undoJoin = () => {
    f().leaveGroup();
    if (useDemo.getState().overlay === 'myGroup') useDemo.getState().replaceOverlay('groups');
  };

  const arrived = (g: Group, text: string) => {
    haptic('light', 'entrou no grupo');
    replaceOverlay('myGroup');
    showToast({ text, tone: 'success', action: { label: 'Desfazer', run: undoJoin } });
    void g;
  };

  const onJoin = async (g: Group) => {
    if (busy) return;
    setBusy(g.id);
    setNotice(null);
    await wait(450);
    const r = f().joinGroup(g.id, 'list');
    setBusy(null);
    if (r === 'ok') arrived(g, `Você entrou no ${groupLabel(g)}`);
    else if (r === 'full') {
      showToast({ text: `O ${groupLabel(g)} acabou de completar. Veja outros grupos ou peça para o app te encaixar.`, tone: 'warning' });
      window.setTimeout(() => firstRow.current?.focus(), 80);
    } else if (r === 'closed') setNotice(FORMATION_MSG);
    else if (r === 'error') setNotice('Não conseguimos entrar no grupo. Tente de novo em instantes.');
  };

  const onCreate = async () => {
    if (busy) return;
    setBusy('create');
    setNotice(null);
    await wait(350);
    setBusy(null);
    if (f().simulateError) return setNotice('Não conseguimos criar o grupo. Tente de novo.');
    if (formation !== 'open') return setNotice(FORMATION_MSG);
    const g = f().createGroup(true);
    if (g) replaceOverlay('groupCreate', 'new');
  };

  const onAuto = async () => {
    if (busy) return;
    setBusy('auto');
    setNotice(null);
    await wait(800);
    setBusy(null);
    if (f().simulateError) return setNotice('Não conseguimos encaixar você agora. Tente de novo ou crie um grupo.');
    if (formation !== 'open') return setNotice(FORMATION_MSG);
    const r = f().autoPlace();
    if (!r) return setNotice('Não conseguimos encaixar você agora. Tente de novo ou crie um grupo.');
    if (r.kind === 'joined') arrived(r.group, `Encaixamos você no ${groupLabel(r.group)}. ${sectorName(r.group.tier)}.`);
    else {
      haptic('light', 'grupo criado');
      setNoVacancy(r.group);
    }
  };

  // Atalho do painel/URL: rodar o "Me coloque" ao abrir
  useEffect(() => {
    if (!already.current && useFeatures.getState().autoRunOnOpen) {
      useFeatures.getState().setAutoRunOnOpen(false);
      void onAuto();
    }
    // só na abertura
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closed = formation !== 'open';
  const disabled = !online || closed || Boolean(busy);
  const left = minutesToClose(clock);

  const footer = (
    <div className="grid grid-cols-2 gap-2 rounded-lg border border-border-subtle bg-surface-1 p-2">
      <Button variant="secondary" className="h-auto px-2 py-2 leading-5" disabled={disabled} aria-busy={busy === 'create' || undefined} onClick={onCreate}>
        {busy === 'create' ? 'Criando…' : 'Criar grupo'}
      </Button>
      <Button className="h-auto px-2 py-2 leading-5" disabled={disabled} aria-busy={busy === 'auto' || undefined} onClick={onAuto}>
        {busy === 'auto' ? 'Procurando um grupo…' : 'Me coloque em um grupo'}
      </Button>
    </div>
  );

  return (
    <OverlayPage title="Grupos com vaga" footer={closed ? null : footer} quietOffline>
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <Chip>Só ingresso {TIER_LABEL[tier]}</Chip>
          {!closed ? (
            <p className="tabular text-body-strong text-text-primary">
              Fecha às {formatHour(FORMATION.closesAt)} · <Countdown minutes={left} />
            </p>
          ) : null}
        </div>
        <p className="text-body text-text-secondary">Aparecem o primeiro nome e o setor de quem já está no grupo. Empresa e foto, só depois de entrar.</p>

        {closed ? (
          <EmptyState
            icon={<UsersRound size={48} strokeWidth={1.5} />}
            title="A formação terminou"
            text={FORMATION_MSG}
            action={
              <Button variant="secondary" onClick={() => useDemo.getState().openMap('booth')}>
                Ver estande
              </Button>
            }
          />
        ) : (
          <>
            <Button variant="ghost" className="justify-between self-stretch px-2" disabled={!online} onClick={() => openOverlay('groupCode')}>
              <span className="flex items-center gap-2">
                <QrCode size={20} aria-hidden /> Entrar com código ou QR
              </span>
              <ChevronRight size={18} aria-hidden />
            </Button>

            {!online ? (
              <div role="status" className="flex flex-col gap-1 rounded-md border border-warning bg-surface-1 p-3">
                <p className="flex items-start gap-2 text-body text-text-primary">
                  <WifiOff size={20} aria-hidden className="mt-0.5 shrink-0 text-warning" /> Sem internet. A lista de grupos precisa de conexão.
                </p>
                <Button size="compact" variant="ghost" className="self-start" onClick={() => setWifiOpen(true)}>
                  Ver Wi-Fi
                </Button>
              </div>
            ) : loading ? (
              <div role="status" aria-live="polite" className="flex flex-col gap-3">
                <p className="text-body text-text-secondary">Buscando grupos com vaga…</p>
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-[112px] rounded-lg" />
                ))}
              </div>
            ) : simulateError ? (
              <div role="alert" className="flex flex-col gap-2 rounded-md border border-danger bg-surface-1 p-3">
                <p className="flex items-start gap-2 text-body text-text-primary">
                  <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> Não conseguimos carregar os grupos. Tente de novo.
                </p>
                <Button size="compact" variant="secondary" className="self-start" onClick={() => setAttempt((n) => n + 1)}>
                  Tentar de novo
                </Button>
              </div>
            ) : list.length === 0 ? (
              <EmptyState icon={<UsersRound size={48} strokeWidth={1.5} />} title="Nenhum grupo com vaga agora" text="Crie um ou peça para o app te encaixar." />
            ) : (
              <ul className="flex flex-col gap-3" aria-label="Grupos com vaga">
                <AnimatePresence initial={false}>
                  {list.map((g, i) => (
                    <motion.li key={g.id} layout exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                      <article
                        aria-label={`${groupLabel(g)}, ${vacancyText(vacancies(g))}. ${spokenNames(g)}. ${sectorName(g.tier)}.`}
                        className="flex items-start justify-between gap-3 rounded-lg border border-border-subtle bg-surface-1 p-card shadow-card"
                      >
                        <div className="min-w-0">
                          <p className="tabular text-body-strong text-text-primary">
                            {groupLabel(g)} · {vacancyText(vacancies(g))}
                          </p>
                          <p className="mt-1 text-body text-text-primary">{namesOf(g)}</p>
                          <p className="mt-1 text-caption text-text-secondary">{sectorName(g.tier)}</p>
                        </div>
                        <Button
                          ref={i === 0 ? firstRow : undefined}
                          size="compact"
                          variant="secondary"
                          className="shrink-0"
                          aria-label={`Entrar no ${groupLabel(g)}`}
                          loading={busy === g.id}
                          disabled={Boolean(busy) && busy !== g.id}
                          onClick={() => onJoin(g)}
                        >
                          Entrar
                        </Button>
                      </article>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </>
        )}

        {notice ? (
          <p role="alert" className="flex items-start gap-2 rounded-md border border-danger bg-surface-1 p-3 text-body text-text-primary">
            <CircleAlert size={20} aria-hidden className="mt-0.5 shrink-0 text-danger" /> {notice}
          </p>
        ) : null}
      </div>

      <BottomSheet
        open={Boolean(noVacancy)}
        onClose={() => {
          if (noVacancy) replaceOverlay('myGroup');
          setNoVacancy(null);
        }}
        title="Grupo criado"
        closeLabel="Fechar"
        footer={
          <>
            <Button
              block
              onClick={() => {
                setNoVacancy(null);
                replaceOverlay('myGroup');
              }}
            >
              Ver meu grupo
            </Button>
            <Button
              block
              variant="ghost"
              onClick={() => {
                setNoVacancy(null);
                replaceOverlay('groupCreate', 'show');
              }}
            >
              Mostrar código
            </Button>
          </>
        }
      >
        <p className="text-body text-text-primary">
          Ainda não há vaga. Criamos o {noVacancy ? groupLabel(noVacancy) : 'grupo'} para você. Quem pedir para ser encaixado entra nele.
        </p>
      </BottomSheet>
    </OverlayPage>
  );
}
