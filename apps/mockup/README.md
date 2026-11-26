# Protagon · Mockup (Fase 1)

Protótipo navegável do app do aluno, numa moldura de iPhone 390×844, com painel de demonstração ao lado. Só front-end: sem backend, dados fictícios.

## Como rodar

```bash
cd apps/mockup
npm install
npm run dev        # servidor local (Vite)
npm run typecheck  # TypeScript strict
npm run build      # gera dist/ com caminhos relativos (base './'), pronto para hospedar como página estática
npm run preview    # serve o dist/ localmente
npm run build:single  # um único dist-single/index.html (JS e CSS embutidos) para publicar como página estática
```

Atalhos de URL para abrir direto num estado (QA e roteiro de demo):
`?auth=app&tier=executivo&moment=lunch&day=2&tab=conexoes&overlay=credential&offline=1&locked=1`
(`connections=1` ativa o perfil de Conexões; `sent=15` marca pedidos já usados no dia; `overlay` aceita também `checkout`, `map` e `qrscan`.)

No login: CPF `000.000.000-00` simula "ingresso não encontrado"; código `000000` simula "código inválido".

## Estrutura

```
src/
  styles/tokens.css        # espelho de docs/design/tokens.json em variáveis CSS (glass.nav 0,84, F6)
  styles/index.css         # Tailwind + utilitários (glass-nav, card, tabular) + reduced motion
  data/                    # dados de exemplo tipados (.ts)
    types.ts               # tipos de domínio
    edition.ts             # edição Porto Alegre, local, palestrantes, Pontos de Conexão A/B/C (D6)
    agenda.ts              # 3 dias seguindo D2
    materials.ts           # materiais com horário de liberação
    participants.ts        # usuário da demo + 40 participantes fictícios
    notifications.ts       # modelos de notificação (operacional ou não)
  lib/
    clock.ts               # relógio do evento derivado de momento + dia; status de sessão e material
    affinity.ts            # afinidade por interesses/objetivos, motivo em 1 linha, contador do cadeado
    liveActivity.ts        # conteúdo da Live Activity / Dynamic Island por momento
    format.ts              # máscara de CPF, ocultação de e-mail/CPF, vibração
  state/store.ts           # estado global (zustand): ingresso, momento, dia, online, bloqueio, notificações, Conexões
  components/
    device/                # moldura, status bar, Dynamic Island, push, tela bloqueada, banner offline
    panel/                 # painel de demonstração
    shell/                 # TopBar, TabBar, roteamento por estado, cabeçalho de overlay
    ui/                    # design system: Button, IconButton, TierBadge, Avatar, Chip, BentoTile, LiveCard, StatusBanner,
                           # Countdown, PersonCard, LockedPreview, BottomSheet (vidro), Toast, EmptyState, SegmentedTabs
  screens/                 # Login (E01), Código (E02), Home (A01), Credencial (G01), Notificações (G02 base),
    connections/           # C00 (Executivo), C02 + C04 (VIP/Diamond), stub de ativação (C01)
  lib/connections.ts       # fila de sugestões, pedidos recebidos; lib/haptics.ts: vibração simulada
```

Tailwind lê os tokens via `tailwind.config.ts` (`bg-surface-1`, `text-gold-200`, `bg-gradient-cta`, `rounded-lg`, `shadow-card`, `duration-base`, `ease-protagon`...). Cor ou medida solta em componente é bug.

## Regras que o código já aplica

- Botão verde e selo dourado com texto `#020111` (`text-on-cta`, `text-on-gold`).
- Vidro só na tab bar (e futuros bottom sheets).
- `prefers-reduced-motion` (CSS e `MotionConfig reducedMotion="user"`) e `prefers-reduced-transparency`.
- Durante a palestra só chegam notificações operacionais; as demais ficam em espera até o intervalo.
- CPF sempre mascarado fora do campo; consentimento de Conexões desligado por padrão.
