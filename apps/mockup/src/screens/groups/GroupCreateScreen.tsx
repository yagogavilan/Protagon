import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Check, Copy, Share2, WifiOff } from 'lucide-react';
import { OverlayPage } from '@/components/shell/OverlayPage';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { Switch } from '@/components/ui/Switch';
import { TIER_LABEL } from '@/components/ui/TierBadge';
import { edition } from '@/data/edition';
import { groupLabel } from '@/lib/groups';
import { haptic } from '@/lib/haptics';
import { useFakeLoad } from '@/lib/useFakeLoad';
import { useFeatures, useFormation, useMyGroup } from '@/state/features';
import { useDemo } from '@/state/store';
import { GroupStatusLine } from './GroupCard';

/**
 * GR03 · Criar grupo: código de 4 letras e QR. Também é o "Mostrar código" de Meu grupo (id "show").
 * SEC-018: aviso fixo sobre o que a lista mostra e a opção "Só por código (fora da lista)".
 */
export function GroupCreateScreen() {
  const mode = useDemo((s) => s.overlayId) === 'new' ? 'new' : 'show';
  const tier = useDemo((s) => s.tier);
  const online = useDemo((s) => s.online);
  const group = useMyGroup();
  const formation = useFormation();
  const announce = useFeatures((s) => s.lastJoinAnnounce);
  const setListed = useFeatures((s) => s.setListed);
  const replaceOverlay = useDemo((s) => s.replaceOverlay);
  const closeOverlay = useDemo((s) => s.closeOverlay);
  const showToast = useDemo((s) => s.showToast);
  const loading = useFakeLoad(mode === 'new' ? 700 : 250);

  // Sem grupo (saiu por outro caminho): não há o que mostrar
  useEffect(() => {
    if (!group && useDemo.getState().overlay === 'groupCreate') closeOverlay();
  }, [group, closeOverlay]);

  // A formação fecha com a tela aberta: avisa e volta para a Home
  useEffect(() => {
    if (formation === 'closed' && group && useDemo.getState().overlay === 'groupCreate') {
      showToast({ text: 'A formação terminou. O time vai encaixar você em um grupo.', tone: 'info' });
      useDemo.getState().setTab('agora');
    }
  }, [formation, group, showToast]);

  if (!group) return null;
  const letters = group.code.split('');
  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(group.code);
    } catch {
      // sem permissão de área de transferência no navegador: segue a simulação
    }
    haptic('light', 'código do grupo copiado');
    showToast({ text: 'Código copiado', tone: 'success' });
  };

  return (
    <OverlayPage
      title={mode === 'new' ? 'Seu grupo foi criado' : 'Código do grupo'}
      quietOffline
      footer={
        <Button block onClick={() => (mode === 'new' ? replaceOverlay('myGroup') : closeOverlay())}>
          Pronto
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-3 pt-1 text-center">
        {!online ? (
          <p role="status" className="flex items-start gap-2 self-stretch rounded-md border border-warning bg-surface-1 p-3 text-left text-body text-text-primary">
            <WifiOff size={20} aria-hidden className="mt-0.5 shrink-0 text-warning" /> Sem internet. O QR e o código continuam valendo; quem lê precisa de internet.
          </p>
        ) : null}

        <p className="tabular text-body-strong text-text-primary">
          <GroupStatusLine group={group} />
        </p>
        <p role="status" aria-live="polite" className="min-h-[24px] text-body text-text-secondary">
          {announce && group.memberIds.length > 1 ? announce : ''}
        </p>

        {loading && mode === 'new' ? (
          <div role="status" className="flex flex-col items-center gap-3">
            <Skeleton className="h-[224px] w-[224px] rounded-lg" />
            <p className="text-body text-text-secondary">Criando seu grupo…</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-text-primary p-4 shadow-glow-gold">
              <QRCodeSVG
                value={`PROTAGON|${edition.id}|grupo|${group.code}|k9Qw3xZr7Lm2`}
                size={192}
                level="M"
                bgColor="#F5F3EE"
                fgColor="#020111"
                role="img"
                aria-label={`QR do ${groupLabel(group).toLowerCase()}, mesmo código ${letters.join(', ')}`}
              />
            </div>
            <p aria-label={letters.join(', ')} className="tabular select-all text-display tracking-[0.4em] text-text-primary">
              <span aria-hidden>{letters.join(' ')}</span>
            </p>
            <p className="text-body text-text-primary">Peça para quem está ao lado entrar com este código ou ler o QR.</p>
            <div className="grid w-full grid-cols-2 gap-2">
              <Button variant="secondary" size="compact" className="px-2" icon={<Copy size={18} aria-hidden />} onClick={copy}>
                Copiar código
              </Button>
              <Button
                variant="secondary"
                size="compact"
                className="px-2"
                icon={<Share2 size={18} aria-hidden />}
                onClick={() => showToast({ text: 'Abriria a folha de compartilhar do sistema (simulado)', tone: 'info' })}
              >
                Compartilhar
              </Button>
            </div>
          </>
        )}

        <div className="w-full rounded-lg border border-border-subtle bg-surface-1 p-2 text-left">
          <Switch
            label="Mostrar meu grupo na lista"
            hint={group.listed ? 'Ligado: aparece na lista de grupos com vaga.' : 'Desligado: só entra quem tiver o código.'}
            checked={group.listed}
            onChange={(v) => setListed(group.id, v)}
          />
        </div>
        {group.listed ? (
          <p className="text-left text-body text-text-secondary">
            Seu grupo aparece para alunos com ingresso {TIER_LABEL[tier]} desta edição que procuram grupo, com seu primeiro nome e setor, até completar.
          </p>
        ) : (
          <div className="flex flex-col items-start gap-1 self-stretch text-left">
            <Chip>
              <Check size={12} aria-hidden /> Só por código (fora da lista)
            </Chip>
            <p className="text-body text-text-secondary">Ninguém vê seu grupo na lista. Só entra quem receber o código ou o QR.</p>
          </div>
        )}
      </div>
    </OverlayPage>
  );
}
