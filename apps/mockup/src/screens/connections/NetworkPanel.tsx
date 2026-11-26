import { useState } from 'react';
import { Download, MessageCircle, NotebookPen, ShieldCheck } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDemo } from '@/state/store';
import { findParticipant, plural } from '@/lib/connections';
import { haptic } from '@/lib/haptics';

/** C09 · Minha rede: lista, vazia, nota privada e exportar contatos (só depois do evento, D7). */
export function NetworkPanel() {
  const connected = useDemo((s) => s.connected);
  const notes = useDemo((s) => s.privateNotes);
  const setNote = useDemo((s) => s.setPrivateNote);
  const moment = useDemo((s) => s.moment);
  const openOverlay = useDemo((s) => s.openOverlay);
  const showToast = useDemo((s) => s.showToast);
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const people = Object.keys(connected)
    .map((id) => findParticipant(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const canExport = moment === 'after';
  // Só os canais que cada pessoa liberou entram no arquivo (SEC-007)
  const exported = {
    whatsapp: people.filter((p) => p.shares.whatsapp).length,
    linkedin: people.filter((p) => p.shares.linkedin).length,
    instagram: people.filter((p) => p.shares.instagram).length,
  };

  if (people.length === 0) {
    return <EmptyState icon={<ShieldCheck size={48} strokeWidth={1.5} />} title="Sua rede começa no primeiro aceite" text="Contatos aparecem aqui quando os dois aceitam a conexão." />;
  }

  const target = noteFor ? findParticipant(noteFor) : undefined;

  return (
    <div className="flex flex-col gap-3">
      <p className="tabular text-caption text-text-secondary">{plural(people.length, 'conexão', 'conexões')} · ficam no app por 90 dias</p>
      <ul className="flex flex-col gap-2">
        {people.map((p) => (
          <li key={p.id} className="rounded-lg border border-border-subtle bg-surface-1 p-3">
            <button type="button" onClick={() => openOverlay('person', p.id)} aria-label={`Abrir perfil de ${p.name}`} className="flex w-full items-center gap-3 rounded-md text-left active:bg-surface-3">
              <Avatar name={p.name} ring="gold" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-strong text-text-primary">{p.name}</span>
                <span className="block truncate text-caption text-text-secondary">
                  {p.role} · {p.company}
                </span>
                {p.shares.instagram ? (
                  <span className="block truncate text-caption text-gold-200" aria-label={`Instagram ${p.instagram}`}>
                    {p.instagram}
                  </span>
                ) : null}
              </span>
              {connected[p.id]?.via === 'qr' ? <Chip>QR</Chip> : null}
            </button>
            {notes[p.id] ? <p className="mt-2 rounded-md bg-surface-2 p-2 text-body text-text-secondary">“{notes[p.id]}”</p> : null}
            <div className="mt-2 flex gap-2">
              <Button
                size="compact"
                variant="secondary"
                className="flex-1 px-2"
                icon={<NotebookPen size={16} aria-hidden />}
                aria-label={`Nota privada sobre ${p.name}`}
                onClick={() => {
                  setNoteFor(p.id);
                  setDraft(notes[p.id] ?? '');
                }}
              >
                {notes[p.id] ? 'Editar nota' : 'Nota'}
              </Button>
              <Button size="compact" variant="secondary" className="flex-1 px-2" icon={<MessageCircle size={16} aria-hidden />} onClick={() => openOverlay('chat', p.id)}>
                Conversar
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <section className="rounded-lg border border-border-subtle bg-surface-1 p-card" aria-label="Exportar contatos">
        <p className="text-body-strong text-text-primary">Exportar contatos</p>
        <p className="mt-1 text-body text-text-secondary">
          {canExport ? 'Gere um arquivo com nome, empresa, os canais que cada pessoa liberou e suas notas.' : 'Disponível no dia seguinte ao fim do evento, para você fazer o acompanhamento com calma.'}
        </p>
        <p className="tabular mt-2 text-body text-text-secondary">
          Neste arquivo: {exported.whatsapp} WhatsApp, {exported.linkedin} LinkedIn, {exported.instagram} Instagram.
        </p>
        <Button
          block
          size="compact"
          className="mt-3"
          variant={canExport ? 'primary' : 'secondary'}
          disabled={!canExport}
          icon={<Download size={18} aria-hidden />}
          onClick={() => {
            haptic('success', 'contatos exportados');
            showToast({ text: `Arquivo rede-protagon.csv gerado com ${plural(people.length, 'contato', 'contatos')} (simulado)`, tone: 'success' });
          }}
        >
          Exportar contatos
        </Button>
        <p className="mt-3 text-body text-text-secondary">
          O arquivo traz só os contatos que cada pessoa liberou e as suas notas. Use para falar com essas pessoas; não adicione a listas de transmissão ou de vendas. Conexões desfeitas, bloqueadas ou excluídas não entram.
        </p>
      </section>

      <BottomSheet
        open={Boolean(noteFor)}
        onClose={() => setNoteFor(null)}
        title={target ? `Nota sobre ${target.name}` : 'Nota privada'}
        closeLabel="Fechar nota"
        footer={
          <Button
            block
            onClick={() => {
              if (noteFor) setNote(noteFor, draft.trim());
              setNoteFor(null);
              showToast({ text: 'Nota salva', tone: 'success' });
            }}
          >
            Salvar nota
          </Button>
        }
      >
        <label htmlFor="net-note" className="sr-only">
          Nota privada
        </label>
        <textarea
          id="net-note"
          value={draft}
          rows={5}
          maxLength={500}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Combinados, ideias, próximos passos."
          className="w-full resize-none rounded-md border border-border-strong bg-surface-3 p-3 text-body text-text-primary placeholder:text-text-secondary focus:border-gold-200 focus:outline-none"
        />
        <p className="mt-2 text-body text-text-secondary">Só você vê esta nota.</p>
      </BottomSheet>
    </div>
  );
}
