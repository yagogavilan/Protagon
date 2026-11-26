import { useEffect, useState } from 'react';
import { Check, Copy, Wifi } from 'lucide-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { edition } from '@/data/edition';
import { useDemo } from '@/state/store';
import { haptic } from '@/lib/haptics';

/** A05 · Wi-Fi: rede e senha, com estado "copiado". Abre pela Home e pela tela do intervalo. */
export function WifiSheet() {
  const open = useDemo((s) => s.wifiOpen);
  const setOpen = useDemo((s) => s.setWifiOpen);
  const showToast = useDemo((s) => s.showToast);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) setCopied(false);
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard?.writeText(edition.venue.wifi.password);
    } catch {
      // sem permissão de área de transferência no navegador: segue a simulação
    }
    setCopied(true);
    haptic('light', 'senha do Wi-Fi copiada');
    showToast({ text: 'Senha do Wi-Fi copiada', tone: 'success' });
  };

  return (
    <BottomSheet
      open={open}
      onClose={() => setOpen(false)}
      title="Wi-Fi do evento"
      closeLabel="Fechar Wi-Fi"
      footer={
        <Button block variant={copied ? 'secondary' : 'primary'} icon={copied ? <Check size={20} aria-hidden /> : <Copy size={20} aria-hidden />} onClick={copy}>
          {copied ? 'Senha copiada' : 'Copiar senha'}
        </Button>
      }
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-pill bg-tint-gold">
          <Wifi size={24} aria-hidden className="text-gold-200" />
        </span>
        <p className="text-body text-text-secondary">Conecte-se à rede dos alunos nas áreas do evento.</p>
      </div>
      <dl className="mt-4 grid gap-3">
        <div className="rounded-md bg-surface-1 p-3">
          <dt className="text-caption text-text-secondary">Rede</dt>
          <dd className="select-all text-body-strong text-text-primary">{edition.venue.wifi.network}</dd>
        </div>
        <div className="rounded-md bg-surface-1 p-3">
          <dt className="text-caption text-text-secondary">Senha</dt>
          <dd className="select-all text-body-strong text-text-primary">{edition.venue.wifi.password}</dd>
        </div>
      </dl>
      <p className="mt-3 text-caption text-text-secondary">Se a rede ficar lenta, agenda, mapa e credencial continuam funcionando sem internet.</p>
    </BottomSheet>
  );
}
