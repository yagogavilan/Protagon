import { useEffect, useState } from 'react';
import { Check, ChevronRight, Flag, MessageCircle, Pencil, Plus, Repeat2, WifiOff } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { agenda } from '@/data/agenda';
import { demoUser } from '@/data/participants';
import { GROUP_MEETING_POINT } from '@/data/groups';
import { formatHour, sessionStatus } from '@/lib/clock';
import { firstNameOf, groupLabel, isComplete, sectorName, vacancies, type Group } from '@/lib/groups';
import { haptic } from '@/lib/haptics';
import { useFakeLoad } from '@/lib/useFakeLoad';
import { personFor, useFeatures, useFormation, useMyGroup } from '@/state/features';
import { useClock, useDemo } from '@/state/store';
import { cn } from '@/lib/cn';
import { GroupStatusLine } from './GroupCard';

const REASONS = ['Assédio ou comportamento inadequado', 'Mensagem ofensiva', 'Perfil falso ou de outra pessoa', 'Oferta indevida ou spam', 'Outro motivo'];

type Help = 'menu' | 'swap' | 'report' | 'reported' | 'swapped';

/** Nomes dos membros para a Trilha: "Com Luciana e Thiago" (nunca outra categoria: só o grupo do aluno) */
export function trioNames(group: Group): string {
  const names = group.memberIds.filter((m) => m !== 'me').map((m) => firstNameOf(personFor(m, group.tier).name));
  const open = vacancies(group);
  const all = [...names, ...Array.from({ length: open }, () => 'vaga aberta')];
  if (all.length === 0) return '';
  return `Com ${all.length > 1 ? `${all.slice(0, -1).join(', ')} e ${all[all.length - 1]}` : all[0]}`;
}

/**
 * GR06 · Meu grupo. Membros com nome, empresa e setor (sem fila, sem cargo, sem telefone). O WhatsApp só aparece
 * para quem também compartilha, quando o grupo completa ou a formação fecha (SEC-020). Rodapé SEC-019: pedir troca ou denunciar.
 */
export function MyGroupScreen() {
  const tier = useDemo((s) => s.tier);
  const online = useDemo((s) => s.online);
  const showToast = useDemo((s) => s.showToast);
  const openOverlay = useDemo((s) => s.openOverlay);
  const openMap = useDemo((s) => s.openMap);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const setWifiOpen = useDemo((s) => s.setWifiOpen);
  const clock = useClock();
  const group = useMyGroup();
  const formation = useFormation();
  const share = useFeatures((s) => s.shareWhatsapp);
  const notice = useFeatures((s) => s.groupNotice);
  const placedSeen = useFeatures((s) => s.placedSeen);
  const f = useFeatures.getState;
  const loading = useFakeLoad(400);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [queued, setQueued] = useState(false);
  const [member, setMember] = useState<string | null>(null);
  const [confirmShare, setConfirmShare] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [help, setHelp] = useState<Help | null>(null);
  const [reason, setReason] = useState(REASONS[0]!);

  // Encaixado pelo time: aviso na primeira abertura
  useEffect(() => {
    if (group?.placedByTeam && !placedSeen) {
      showToast({ text: `O time colocou você no ${groupLabel(group)}.`, tone: 'info' });
      f().setPlacedSeen(true);
    }
    // só quando o grupo muda
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group?.id, group?.placedByTeam]);

  // Sem grupo (saiu): volta
  useEffect(() => {
    // só fecha se ainda for a página do topo (durante a saída animada, outra tela pode já ter assumido a pilha)
    if (!group && !loading && useDemo.getState().overlay === 'myGroup') closeOverlay();
  }, [group, loading, closeOverlay]);

  if (!group) return null;
  const complete = isComplete(group);
  const open = vacancies(group);
  const canSeeNumbers = share && (complete || formation === 'closed');
  const canLeave = formation === 'open';
  const names = group.memberIds.filter((m) => m !== 'me');
  const trio = agenda
    .filter((s) => s.trio && sessionStatus(clock, s) !== 'done')
    .slice(0, 3);
  const person = member ? personFor(member, tier) : null;
  const personShares = Boolean(person && person.id !== 'me' && person.sharesWhatsapp);

  const saveName = () => {
    if (f().simulateError) return setNameError('Não conseguimos salvar o nome. Tente de novo.');
    const r = f().setNickname(draft);
    if (r === 'invalid') return setNameError(draft.trim().length < 2 && draft.trim().length > 0 ? 'Use de 2 a 24 caracteres.' : 'Esse nome não pode ser usado. Escolha outro.');
    setNameError(null);
    setEditing(false);
    setQueued(!online);
  };

  const turnShare = (v: boolean) => {
    if (v) setConfirmShare(true);
    else {
      f().setShareWhatsapp(false);
      showToast({ text: 'Seu WhatsApp deixou de aparecer para o grupo', tone: 'info' });
    }
  };

  const leave = () => {
    setConfirmLeave(false);
    f().leaveGroup();
    showToast({ text: `Você saiu do ${groupLabel(group)}. A vaga voltou para a lista.`, tone: 'info' });
  };

  const closeHelp = () => {
    setHelp(null);
    setReason(REASONS[0]!);
  };

  return (
    <OverlayPage title="Meu grupo" quietOffline>
      <div className="flex flex-col gap-4 pt-1">
        {!online ? (
          <div role="status" className="flex flex-col gap-1 rounded-md border border-warning bg-surface-1 p-3">
            <p className="flex items-start gap-2 text-body text-text-primary">
              <WifiOff size={20} aria-hidden className="mt-0.5 shrink-0 text-warning" /> Sem internet. Você vê a última versão salva do grupo.
            </p>
            <Button size="compact" variant="ghost" className="self-start" onClick={() => setWifiOpen(true)}>
              Ver Wi-Fi
            </Button>
          </div>
        ) : null}

        <header className="flex flex-col gap-1">
          <h2 className="tabular text-h1 text-text-primary">{groupLabel(group)}</h2>
          {editing ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="group-nick" className="text-body text-text-secondary">
                Nome do grupo (opcional)
              </label>
              <input
                id="group-nick"
                value={draft}
                maxLength={24}
                onChange={(e) => setDraft(e.target.value)}
                className="h-12 w-full rounded-md border border-border-strong bg-surface-3 px-3 text-body text-text-primary focus:border-gold-200 focus:outline-none"
              />
              {nameError ? (
                <p role="alert" className="text-body text-danger">
                  {nameError}
                </p>
              ) : null}
              <div className="flex gap-2">
                <Button size="compact" onClick={saveName}>
                  Salvar nome
                </Button>
                <Button
                  size="compact"
                  variant="ghost"
                  onClick={() => {
                    setEditing(false);
                    setNameError(null);
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 flex-1 text-body text-text-secondary">{group.nickname || 'Sem apelido'}</p>
              <Button
                size="compact"
                variant="ghost"
                className="shrink-0 whitespace-nowrap"
                icon={<Pencil size={16} aria-hidden />}
                onClick={() => {
                  setDraft(group.nickname);
                  setNameError(null);
                  setEditing(true);
                }}
              >
                Editar nome
              </Button>
            </div>
          )}
          {queued ? <p className="text-body text-text-secondary">Salvamos assim que a internet voltar.</p> : null}
          <p className="tabular text-body-strong text-text-primary">
            {complete ? <GroupStatusLine group={group} /> : `${group.memberIds.length} de ${group.targetSize} · ${open === 1 ? 'falta 1 pessoa' : `faltam ${open} pessoas`}`}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {complete ? (
              <Chip variant="common">Grupo completo</Chip>
            ) : null}
            {group.placedByTeam ? <Chip>Encaixado pelo time</Chip> : null}
            {group.via === 'auto' ? <Chip>Escolhido pelo app</Chip> : null}
            {group.targetSize !== 3 ? (
              <>
                <Chip variant="proposal" />
                <span className="text-body text-text-secondary">Grupo de {group.targetSize} definido pelo time</span>
              </>
            ) : null}
          </div>
          {notice ? (
            <p role="status" className="rounded-md bg-surface-1 p-3 text-body text-text-primary">
              {notice}
            </p>
          ) : null}
        </header>

        {loading ? (
          <div role="status" className="flex flex-col gap-3">
            <p className="sr-only">Carregando seu grupo</p>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[72px] rounded-lg" />
            ))}
          </div>
        ) : (
          <ul aria-label="Membros do grupo" className="flex flex-col gap-2">
            {group.memberIds.map((m) => {
              const p = personFor(m, tier);
              const mine = m === 'me';
              const callable = canSeeNumbers && !mine && p.sharesWhatsapp;
              return (
                <li key={m} className="rounded-lg border border-border-subtle bg-surface-1 p-3">
                  <button
                    type="button"
                    onClick={() => setMember(m)}
                    aria-label={`${p.name}${mine ? ' (você)' : ''}, ${p.company}, ${sectorName(tier)}. Ver detalhes`}
                    className="flex min-h-touch w-full items-center gap-3 rounded-md text-left active:bg-surface-3"
                  >
                    <Avatar name={p.name} size="md" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-strong text-text-primary">
                        {p.name}
                        {mine ? ' (você)' : ''}
                      </span>
                      <span className="block truncate text-body text-text-secondary">{p.company}</span>
                      <span className="block text-label-sm text-text-secondary">{sectorName(tier)}</span>
                    </span>
                    <ChevronRight size={18} aria-hidden className="shrink-0 text-text-secondary" />
                  </button>
                  {callable ? (
                    <Button
                      size="compact"
                      variant="secondary"
                      className="mt-2"
                      icon={<MessageCircle size={18} aria-hidden />}
                      onClick={() => showToast({ text: 'Abriria o WhatsApp (simulado)', tone: 'info' })}
                    >
                      Chamar no WhatsApp
                    </Button>
                  ) : null}
                </li>
              );
            })}
            {Array.from({ length: open }, (_, i) => (
              <li key={`open-${i}`} className="flex items-center gap-3 rounded-lg border border-dashed border-border-strong p-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-pill border border-dashed border-border-strong text-text-secondary" aria-hidden>
                  <Plus size={20} />
                </span>
                <span className="min-w-0 flex-1 whitespace-nowrap text-body text-text-primary">Vaga aberta</span>
                {i === 0 && formation === 'open' ? (
                  <Button size="compact" variant="secondary" onClick={() => openOverlay('groupCreate', 'show')}>
                    Mostrar código
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}

        <section aria-label="WhatsApp no grupo" className="rounded-lg border border-border-subtle bg-surface-1 p-2">
          <Switch
            label="Compartilhar meu WhatsApp com o grupo."
            hint="Aparece quando o grupo completar, só para quem também compartilhar. Quem salvar seu número fica com ele, mesmo se você desligar depois."
            checked={share}
            onChange={turnShare}
          />
          {share && !canSeeNumbers ? <p className="px-1 pb-2 text-body text-text-secondary">Os números aparecem quando o grupo completar ou a formação fechar.</p> : null}
          {share && canSeeNumbers && names.every((m) => !personFor(m, tier).sharesWhatsapp) ? (
            <p className="px-1 pb-2 text-body text-text-secondary">Ninguém mais do grupo compartilhou o WhatsApp.</p>
          ) : null}
        </section>

        <section aria-label="Próximas dinâmicas em trio" className="flex flex-col gap-2">
          <h2 className="text-h2 text-text-primary">Próximas dinâmicas em trio</h2>
          {trio.length === 0 ? (
            <p className="text-body text-text-secondary">Nenhuma dinâmica em trio marcada ainda.</p>
          ) : (
            trio.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => openOverlay('session', s.id)}
                className="flex min-h-touch w-full items-center gap-3 rounded-lg border border-border-subtle bg-surface-1 p-3 text-left active:bg-surface-3"
              >
                <span className="min-w-0 flex-1">
                  <span className="tabular block text-caption text-text-secondary">
                    Dia {s.day} · {formatHour(s.start)}
                  </span>
                  <span className="block text-body-strong text-text-primary">{s.title}</span>
                  <span className="block text-body text-text-secondary">{trioNames(group)}</span>
                </span>
                <ChevronRight size={18} aria-hidden className="shrink-0 text-text-secondary" />
              </button>
            ))
          )}
        </section>

        <section aria-label="Ponto de encontro" className="flex flex-col gap-1">
          <h2 className="text-h2 text-text-primary">Ponto de encontro nos intervalos</h2>
          <p className="flex flex-wrap items-center gap-2 text-body text-text-primary">
            {GROUP_MEETING_POINT} <Chip variant="proposal" />
          </p>
        </section>

        <section className="flex flex-col gap-1 border-t border-border-subtle pt-3">
          <p className="text-body text-text-secondary">Algum problema com o grupo? Pedir troca ou denunciar. A equipe resolve com discrição.</p>
          <Button variant="secondary" icon={<Flag size={18} aria-hidden />} className="self-start" onClick={() => setHelp('menu')}>
            Pedir troca ou denunciar
          </Button>
        </section>

        {canLeave ? (
          <div className="flex flex-col gap-1">
            <Button variant="destructive" disabled={!online} onClick={() => setConfirmLeave(true)}>
              Sair do grupo
            </Button>
            {!online ? <p className="text-body text-text-secondary">Precisa de internet.</p> : null}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-body text-text-secondary">A formação terminou. Para trocar de grupo, fale com o time no estande.</p>
            <Button variant="secondary" className="self-start" onClick={() => openMap('booth')}>
              Ver estande
            </Button>
          </div>
        )}
      </div>

      {/* Detalhe do membro */}
      <BottomSheet open={Boolean(person)} onClose={() => setMember(null)} title={person?.name ?? ''} closeLabel="Fechar" footer={personShares && canSeeNumbers ? <Button block icon={<MessageCircle size={20} aria-hidden />} onClick={() => { setMember(null); showToast({ text: 'Abriria o WhatsApp (simulado)', tone: 'info' }); }}>Chamar no WhatsApp</Button> : undefined}>
        {person ? (
          <dl className="grid gap-3">
            <div className="rounded-md bg-surface-1 p-3">
              <dt className="text-caption text-text-secondary">Empresa</dt>
              <dd className="text-body-strong text-text-primary">{person.company}</dd>
            </div>
            <div className="rounded-md bg-surface-1 p-3">
              <dt className="text-caption text-text-secondary">Setor</dt>
              <dd className="text-body-strong text-text-primary">{sectorName(tier)}</dd>
            </div>
            {person.id !== 'me' ? (
              <div className="rounded-md bg-surface-1 p-3">
                <dt className="text-caption text-text-secondary">WhatsApp</dt>
                <dd className="text-body text-text-primary">
                  {personShares && canSeeNumbers
                    ? 'Compartilhado com o grupo. Toque em Chamar no WhatsApp.'
                    : personShares
                      ? share
                        ? 'Aparece quando o grupo completar ou a formação fechar.'
                        : 'Aparece só se você também compartilhar o seu.'
                      : 'Não compartilhou com o grupo.'}
                </dd>
              </div>
            ) : null}
          </dl>
        ) : null}
      </BottomSheet>

      {/* WhatsApp: confirmação antes de ligar (SEC-020) */}
      <BottomSheet
        open={confirmShare}
        onClose={() => setConfirmShare(false)}
        title="Compartilhar seu WhatsApp?"
        closeLabel="Fechar"
        footer={
          <>
            <Button
              block
              onClick={() => {
                f().setShareWhatsapp(true);
                setConfirmShare(false);
                haptic('selection', 'WhatsApp compartilhado com o grupo');
              }}
            >
              Compartilhar
            </Button>
            <Button block variant="ghost" onClick={() => setConfirmShare(false)}>
              Agora não
            </Button>
          </>
        }
      >
        <p className="text-body text-text-primary">
          <span className="tabular font-semibold">{demoUser.whatsapp}</span> ficará visível para os membros deste grupo que também compartilharem, quando o grupo completar ou a formação fechar. Você pode desligar quando quiser.
        </p>
        <p className="mt-2 text-body text-text-secondary">Quem salvar seu número fica com ele, mesmo se você desligar depois.</p>
      </BottomSheet>

      {/* Sair do grupo */}
      <BottomSheet
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        title={`Sair do ${groupLabel(group)}?`}
        closeLabel="Fechar"
        footer={
          <>
            <Button block variant="destructive" onClick={leave}>
              Sair do grupo
            </Button>
            <Button block variant="ghost" onClick={() => setConfirmLeave(false)}>
              Ficar no grupo
            </Button>
          </>
        }
      >
        <p className="text-body text-text-primary">Sua vaga volta para a lista. Seu WhatsApp deixa de aparecer para o grupo.</p>
      </BottomSheet>

      {/* SEC-019: pedir troca ou denunciar, para os 3 ingressos */}
      <BottomSheet
        open={help !== null}
        onClose={closeHelp}
        title={help === 'swap' ? 'Pedir troca de grupo' : help === 'report' ? 'Denunciar' : help === 'reported' ? 'Denúncia enviada' : help === 'swapped' ? 'Pedido enviado' : 'Algum problema com o grupo?'}
        closeLabel="Fechar"
        footer={
          help === 'swap' ? (
            <>
              <Button
                block
                onClick={() => {
                  haptic('light', 'pedido de troca enviado');
                  setHelp('swapped');
                }}
              >
                Pedir troca
              </Button>
              <Button block variant="ghost" onClick={() => setHelp('menu')}>
                Voltar
              </Button>
            </>
          ) : help === 'report' ? (
            <>
              <Button block onClick={() => setHelp('reported')}>
                Enviar denúncia
              </Button>
              <Button block variant="ghost" onClick={() => setHelp('menu')}>
                Voltar
              </Button>
            </>
          ) : help === 'reported' || help === 'swapped' ? (
            <Button block onClick={closeHelp}>
              Fechar
            </Button>
          ) : null
        }
      >
        {help === 'menu' ? (
          <ul className="flex flex-col">
            <li>
              <button type="button" onClick={() => setHelp('swap')} className="flex min-h-touch w-full items-center gap-3 rounded-md px-2 py-2 text-left active:bg-surface-3">
                <Repeat2 size={24} aria-hidden className="text-gold-500" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body text-text-primary">Pedir troca de grupo</span>
                  <span className="block text-body text-text-secondary">Vai para a equipe, com discrição, a qualquer momento</span>
                </span>
                <ChevronRight size={18} aria-hidden className="text-text-secondary" />
              </button>
            </li>
            <li>
              <button type="button" onClick={() => setHelp('report')} className="flex min-h-touch w-full items-center gap-3 rounded-md px-2 py-2 text-left active:bg-surface-3">
                <Flag size={24} aria-hidden className="text-gold-500" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body text-text-primary">Denunciar</span>
                  <span className="block text-body text-text-secondary">Conta para a equipe do Protagon, inclusive assédio</span>
                </span>
                <ChevronRight size={18} aria-hidden className="text-text-secondary" />
              </button>
            </li>
          </ul>
        ) : help === 'swap' ? (
          <p className="text-body text-text-primary">A equipe recebe seu pedido e resolve com discrição. Ninguém do grupo é avisado.</p>
        ) : help === 'report' ? (
          <div role="radiogroup" aria-label="Motivo da denúncia" className="flex flex-col gap-1">
            {REASONS.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={reason === r}
                onClick={() => setReason(r)}
                className={cn('flex min-h-touch items-center gap-3 rounded-md px-2 text-left active:bg-surface-3', reason === r && 'bg-surface-1')}
              >
                <span aria-hidden className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-pill border-2', reason === r ? 'border-gold-500' : 'border-border-strong')}>
                  {reason === r ? <span className="h-2.5 w-2.5 rounded-pill bg-gold-500" /> : null}
                </span>
                <span className="text-body text-text-primary">{r}</span>
              </button>
            ))}
            <p className="px-2 text-body text-text-secondary">É urgente? Depois de enviar, você pode falar com a equipe no estande.</p>
          </div>
        ) : help === 'reported' ? (
          <div className="flex flex-col gap-3" role="status">
            <p className="text-body text-text-primary">Durante o evento, a equipe analisa no mesmo dia. Se for urgente, procure a equipe no estande.</p>
            <Button
              block
              variant="secondary"
              onClick={() => {
                closeHelp();
                openMap('booth');
              }}
            >
              Falar com a equipe no estande
            </Button>
          </div>
        ) : help === 'swapped' ? (
          <p role="status" className="flex items-start gap-2 text-body text-text-primary">
            <Check size={20} aria-hidden className="mt-0.5 shrink-0 text-live" /> Pedido enviado. A equipe resolve com discrição.
          </p>
        ) : null}
      </BottomSheet>
    </OverlayPage>
  );
}
