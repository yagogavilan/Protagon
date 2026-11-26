import { useDemo } from '@/state/store';
import { ConnectionsLocked } from './ConnectionsLocked';
import { ConnectionsVip } from './ConnectionsVip';

/** Aba Conexões: C00 (Executivo) ou C02 (VIP/Diamond). A regra real vem do servidor; no mockup, do painel. */
export function ConnectionsScreen() {
  const tier = useDemo((s) => s.tier);
  return tier === 'executivo' ? <ConnectionsLocked /> : <ConnectionsVip />;
}
