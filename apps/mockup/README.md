# Protagon · Mockup (Fase 1, Etapa 3)

Protótipo navegável do app do aluno, numa moldura de iPhone 390×844, com painel de demonstração ao lado. Só front-end: sem backend, dados fictícios. Cobre as 35 telas do inventário da Etapa 1 (`docs/design/etapa-1.html`), todas alcançáveis pelo app e/ou pelo painel.

## Como rodar

```bash
cd apps/mockup
npm install
npm run dev           # servidor local (Vite)
npm run typecheck     # TypeScript strict
npm run build         # gera dist/ com caminhos relativos (base './'), pronto para hospedar como página estática
npm run build:single  # um único dist-single/index.html (JS, CSS e marca embutidos)
npm run smoke         # roteiro Playwright (VIP e Executivo); precisa de dist/ (npm run build) e de Chrome/Chromium
```

`npm run smoke` (cobre também o motivo por desafio e conhecimento e o Instagram só após o aceite) serve o `dist/` numa porta local, percorre o dia de um aluno VIP (login ao fim do Dia 3) e o de um Executivo, falha se houver erro de console e salva uma captura por tela em `docs/design/capturas/etapa-3/`. Variáveis: `SMOKE_URL` (usar um servidor já rodando), `CHROME_PATH`, `SMOKE_OUT`.

## Atalhos de URL

Abrem direto num estado (QA e roteiro de demo):

| Parâmetro | Valores | Efeito |
|---|---|---|
| `auth` | `login`, `code`, `onboarding`, `app` | Etapa do fluxo de entrada. `app` simula quem já fez login (traz 3 notificações de boas-vindas) |
| `tier` | `executivo`, `vip`, `diamond` | Ingresso |
| `moment` | `before`, `live`, `break`, `lunch`, `endOfDay`, `after` | Momento do evento |
| `phase` | `start`, `five`, `now` | Posição na pausa (intervalo e almoço): início, faltam 5 min, volte agora |
| `day` | `1`, `2`, `3` | Dia do evento |
| `tab` | `agora`, `trilha`, `conexoes`, `materiais`, `eu` | Aba aberta |
| `overlay` | `credential`, `notifications`, `checkout`, `map`, `qrscan`, `break`, `eat`, `activate`, `profile`, `prefs`, `privacy`, `nps`, `support` | Página aberta por cima da aba |
| `go` | qualquer código da Etapa 1 (`E01` a `U05`, mais `E04n` e `A04c`) | Leva à tela e ajusta ingresso, perfil e rede de exemplo quando a tela exige |
| `connections` | `1` | Perfil de Conexões já ativado |
| `profile` | `full` | Perfil de Conexões completo (maior desafio e "Domina" preenchidos): o card "Complete seu perfil" não aparece e os motivos já usam o cruzamento |
| `network` | `1` | Carrega a rede de exemplo (5 conectados, chat e encontros) |
| `sent` | `0` a `25` | Pedidos já enviados hoje (limite D4: 15 VIP, 25 Diamond) |
| `perm` | `unknown`, `granted`, `denied` | Permissão de notificações (E04) |
| `offline` | `1` | Sem internet |
| `locked` | `1` | Tela bloqueada |

Exemplo: `?auth=app&tier=vip&go=C07` abre o chat com uma conexão de exemplo. No login, CPF `000.000.000-00` simula "ingresso não encontrado" e o código `000000` simula "código inválido".

## Estado → como chegar

O painel tem "Ir direto para" (lista todos os códigos) e os controles de ingresso, momento, posição na pausa, dia, notificação, internet, tela bloqueada, permissão e Conexões. A coluna "No app" mostra o caminho pelo toque.

| Código | Estado | No painel ou URL | No app |
|---|---|---|---|
| E01 | Vazio, enviando, ingresso não encontrado | `go=E01`; CPF `000.000.000-00` | Primeira tela; erro com suporte |
| E02 | Digitando, inválido, reenviar em 30 s, sucesso | `go=E02`; código `000000` | Depois do E01 |
| E03 | Onboarding (Executivo 2 telas, VIP/Diamond 3 com convite) | `go=E03` + ingresso | Depois do E02 |
| E04 | Pedido contextual | `go=E04` | 1ª abertura da Trilha |
| E04 | Negado + como ativar depois | `go=E04n`; painel "Permissão: Negada" | "Não permitir" no diálogo; aviso em G02 e U02 |
| A01 | Antes do evento (contagem, o que levar, local, estacionamento, Conexões com selo "proposta") | Momento "Antes do evento" | Aba Agora |
| A01 | Sessão ao vivo, intervalo, almoço, fim do dia (resumo + NPS), depois (resumo, materiais, conexões, NPS final, "Indique o Protagon") | Momento | Aba Agora |
| A01 | Agenda atualizada | Chave "Agenda atualizada" (Dia 1, ao vivo ou intervalo) | Banner na Home |
| A01 | Sem internet | "Sem internet" | Banner fixo |
| A02 | Intervalo, almoço, faltam 5 min, volte agora | Momento "Intervalo" ou "Almoço" + "Posição na pausa"; botão "Abrir tela cheia" | Banner da Home, Live Activity ou Trilha (linha do intervalo) |
| A03 | Praça de alimentação, restaurantes próximos | `go=A03` | Almoço: card "Onde comer" ou A02 |
| A04 | Meu setor (muda por ingresso), estande, Ponto de Conexão selecionado | `go=A04`, `go=A04c` | Home (card Mapa), A02, convite do Executivo ("Falar com o time no estande"), chips de pontos |
| A05 | Rede e senha, copiado | `go=A05` | Home (card Wi-Fi) ou A02 |
| G01 | Online, offline, adicionado à Wallet | `go=G01`; "Sem internet" | Ícone QR no topo |
| G02 | Não lidas, lidas, filtro, vazia, "limpar tudo" com desfazer, em espera até o intervalo | `go=G02`; "Disparar notificação" (em "Sessão ao vivo", as não operacionais ficam em espera) | Sino no topo |
| G03 | Push na tela bloqueada (almoço liberado, faltam 10 min, material liberado, pedido aceito) | "Tela bloqueada" + escolher a notificação | Push no topo com o app aberto |
| G04 | Compacta, expandida, volte agora | Momento ao vivo, intervalo ou almoço; tocar na ilha expande; "Posição na pausa" | Dynamic Island; cartão na tela bloqueada |
| G05 | Offline, reconectado | "Sem internet" ligar e desligar | Banner |
| T01 | Dia em andamento, futuro, encerrado, bloco alterado, progresso da jornada | Momento + Dia; abas Dia 1/2/3 | Aba Trilha; o bloco alterado é a dinâmica em trios (Dia 1) |
| T02 | Ao vivo, concluída, próxima, material liberado ou "libera às 14h", anotações | `go=T02`; momento | Toque num bloco; anotações ficam no estado |
| C00 | Prévia + contador, convite de upgrade, convite fechado | Ingresso "Executivo" | Aba Conexões, "Quero me conectar", "Agora não" |
| C01 | Dados, nicho e objetivo no Protagon, objetivos (até 3), interesses (até 8), visibilidade, consentimento desligado, concluído (DEC-002: sem passo novo) | `go=C01` | Onboarding (VIP), aba Conexões ou card da Home: "Ativar perfil" |
| C01b | "Complete seu perfil" (opcional): maior desafio, "Domina" (até 3), nicho, objetivo e Instagram | `?connections=1&overlay=profile` | Card "Complete seu perfil" em Conexões > Sugestões (fechável); Eu > "Meu perfil de Conexões"; menu "..." de Conexões |
| C02 | Fila com afinidade e motivo (cruzamento desafio x conhecimento ou, sem ele, interesses e objetivos), nicho e objetivo no Protagon, "Maior desafio" e "Domina", fim, limite diário, perfil pausado, antes do evento (proposta) | Painel "Pedidos hoje: Esgotar"; momento "Antes do evento"; pausar em C11 ou U03 | Aba Conexões |
| C03 | Antes do aceite (nicho, objetivo, maior desafio e "Domina" completos), pedido enviado (Pendente), pedido recebido, conectados (WhatsApp, LinkedIn, Instagram); Instagram antes do aceite só com a opção de Privacidade ligada (proposta) | `go=C03` (conectado); "Carregar rede de exemplo" | Toque no card, em "Ver perfil" ou numa linha de Explorar, Pedidos ou Minha rede |
| C04 | Modelos, mensagem própria, enviado, limite atingido | `go=C04`; "Esgotar" | "Conectar" |
| C05 | Com pedidos, vazio, aceito (vibração), recusado em silêncio (D5) | `go=C05` | Aba Conexões, Pedidos; "Aceitar" e "Agora não" |
| C06 | Filtros (segmento, cidade, objetivo, "Domina", ingresso), busca também por nicho e tema, resultados, sem resultados | `go=C06` | Aba Conexões, Explorar; combine "Segmento: Agronegócio" com "Ingresso: VIP" (ou busque um termo que não existe) para ver "sem resultados" |
| C07 | Primeira mensagem, conversa, encontro proposto, confirmado, outro horário | `go=C07` (conversa e encontro proposto a você); painel "Outro confirma" e "Outro horário" | "Conversar" depois do aceite; nos dados de exemplo, Larissa (primeira mensagem), Isabela (proposto), Felipe (confirmado), Renata (outro horário) |
| C08 | Próximo intervalo + Ponto, almoço, escolher outro | `go=C08` | "Vamos nos ver?" no chat, perfil ou depois do aceite |
| C09 | Lista, vazia, nota privada, exportar (só depois do evento, D7) | `go=C09`; momento "Depois do evento" | Aba Conexões, Minha rede |
| C10 | Câmera, pessoa encontrada, aguardando confirmação, conectados; Executivo cai no C00 | `go=C10` | "Ler QR" em Conexões ou na Credencial |
| C11 | Bloquear, denunciar, desfazer conexão, pausar meu perfil | `go=C11` | Menu "..." em perfil e chat |
| M01 | Liberado, agendado, baixado, concluído, offline (só baixados) | Momento (Dia 1: "Sessão ao vivo" mostra os agendados; "Fim do dia" mostra liberado, baixado e concluído); "Sem internet" | Aba Materiais |
| M02 | PDF, workbook, áudio, vídeo | `go=M02`; momento "Fim do dia" libera os demais | Toque num material liberado |
| U01 | Dados da compra, selo, CPF mascarado; "Meu perfil de Conexões" (nicho, objetivo, desafio, "Domina", Instagram) para VIP e Diamond com perfil ativo, com "Completar perfil" ou "Editar perfil" | `go=U01`; `?connections=1&tab=eu` | Aba Eu |
| U02 | Por categoria, permissão negada | `go=U02`; painel "Permissão" | Eu, Notificações |
| U03 | Campos visíveis, "Mostrar meu Instagram antes da conexão" (selo "proposta", desligado por padrão), perfil pausado, excluir dados com confirmação, dados excluídos | `go=U03` | Eu, Privacidade; Conexões, menu "..." |
| U04 | Pendente, respondida, NPS final | Momento "Fim do dia" ou "Depois do evento" | Eu, Avaliação do dia; cartões da Home |
| U05 | FAQ, falar com o CS | `go=U05` | Eu, Suporte e FAQ |

## Estrutura

```
src/
  assets/brand/            # protagon-logo.svg (wordmark oficial), protagon-simbolo.webp (versão antiga do símbolo, não usada: o leão vem do SVG)
  styles/tokens.css        # espelho de docs/design/tokens.json em variáveis CSS (glass.nav 0,84, F6)
  styles/index.css         # Tailwind + utilitários (glass-nav, card, tabular) + reduced motion
  data/                    # dados de exemplo tipados: edição, agenda (3 dias, D2), materiais, participantes, pedidos,
                           # notificações, conteúdo do local (onde comer, FAQ, o que levar, contatos fictícios)
  lib/                     # clock (relógio do evento e fase da pausa), affinity, connections (relação, fila, encontros),
                           # materials, nav (goTo: "Ir direto para"), liveActivity, haptics, format, scroll
  state/store.ts           # estado global (zustand): ingresso, momento, pilha de páginas, Conexões, chat, notas...
  components/
    brand/                 # Wordmark (SVG oficial, branco) e LionMark (leão recortado do SVG, gradiente dourado)
    device/                # moldura, status bar, Dynamic Island (compacta e expandida), push, tela bloqueada
    panel/                 # painel de demonstração
    shell/                 # TopBar, TabBar, AppShell (páginas empilhadas), OverlayPage
    ui/                    # design system: Button, Switch, FilterChip, NpsCard, BottomSheet (vidro), PersonCard...
  screens/                 # Login, Código, Onboarding, Home, Break (A02), Eat, Map, Wifi, Trilha, Session, Materials,
                           # MaterialViewer, Credential, Notifications, PermissionSheet
    connections/           # C00, C01 a C11
    me/                    # U01 a U05
scripts/smoke.mjs          # roteiro Playwright (VIP e Executivo) + capturas
```

Tailwind lê os tokens via `tailwind.config.ts`. Cor ou medida solta em componente é bug.

## Regras que o código já aplica

- Botão verde e selo dourado com texto `#020111` (`text-on-cta`, `text-on-gold`). Destrutivo: contorno vermelho; preenchido só na confirmação, com texto `#020111`.
- Vidro só na tab bar e nos bottom sheets. `prefers-reduced-motion` e `prefers-reduced-transparency` respeitados.
- Marca: wordmark branco do SVG oficial no login, onboarding e antes do evento; leão (recorte do mesmo SVG, gradiente dourado) na TopBar da Home e na credencial.
- Durante a palestra só chegam notificações operacionais; as demais ficam em espera até o intervalo. Mensagens e pedidos enviados na palestra são entregues no intervalo.
- Contato pessoal (WhatsApp, LinkedIn, Instagram) só aparece depois do aceite mútuo (C03 conectados, Minha rede, chat); não existe chat aberto. Única exceção, proposta e desligada por padrão: Eu > Privacidade > "Mostrar meu Instagram antes da conexão" mostra o @ de quem também liberou, no card e no perfil. Consentimento de Conexões desligado por padrão; CPF sempre mascarado.
- Cadeado do Executivo só na aba Conexões e em um card da Home; convite só ao tocar em "Conectar", sempre fechável.
- Agenda, mapa e credencial a no máximo 2 toques: as páginas empilhadas deixam a tab bar visível (só a credencial e a tela do intervalo ocupam a tela inteira, e ambas têm saída direta).
- Linguagem das Conexões: conectar, afinidade, interesses em comum, Pendente. Sem "match", "curtir" ou corações.

## Limites desta versão

- Câmera do C10, download, Wallet, abrir app de mapas e WhatsApp são simulados (toast ou botão "Simular").
- A Live Activity e a Dynamic Island são desenhos na moldura; no app real exigem ActivityKit.
- O ranking de afinidade usa os objetivos e interesses do C01 e, se preenchidos, o maior desafio e o "Domina" (`src/lib/affinity.ts`). O cruzamento (desafio de um com o conhecimento do outro) pesa 6 por direção, acima de interesse (2) e objetivo (3); o motivo em uma linha prioriza o cruzamento ("Domina tráfego pago, seu maior desafio hoje"; se mútuo, "Vocês podem se ajudar: ... ↔ ...") e cai no motivo antigo sem ele. Os dados de exemplo são fixos (`src/data/participants.ts`, vocabulário `topics`).
- Notas, anotações e conversas vivem só no estado da página; recarregar reinicia a demo.
