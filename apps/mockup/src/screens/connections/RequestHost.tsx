import { RequestSheet } from './RequestSheet';
import { useDemo, DAILY_REQUEST_LIMIT } from '@/state/store';
import { findParticipant, sendRequest, useSuggestionFor } from '@/lib/connections';
import { participants } from '@/data/participants';

const drafts: Record<string, { choice: number; text: string }> = {};
const onDraft = (id: string, d: { choice: number; text: string }) => {
  drafts[id] = d;
};

/** C04 · Pedido de conexão. Vive no shell para abrir a partir de Sugestões, Explorar e Perfil. */
export function RequestHost() {
  const id = useDemo((s) => s.requestFor);
  const setRequestFor = useDemo((s) => s.setRequestFor);
  const tier = useDemo((s) => s.tier);
  const day = useDemo((s) => s.day);
  const sent = useDemo((s) => s.requestsSentByDay[day]);
  const person = (id ? findParticipant(id) : undefined) ?? participants[0]!;
  const suggestion = useSuggestionFor(person);
  const limit = DAILY_REQUEST_LIMIT[tier];

  return (
    <RequestSheet
      open={Boolean(id)}
      suggestion={id ? suggestion : null}
      remaining={Math.max(0, limit - sent)}
      limit={limit}
      draft={id ? drafts[id] : undefined}
      onDraft={onDraft}
      onClose={() => setRequestFor(null)}
      onSend={async (s) => {
        await sendRequest(s.participant);
        delete drafts[s.participant.id];
      }}
    />
  );
}
