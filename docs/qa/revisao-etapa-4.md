# Revisão da Etapa 4 (QA de UX e acessibilidade) — Mockup Protagon

Data: 2026-11-26 · Revisor: `qa-engineer` (não participou da construção) · Objeto: `apps/mockup` (build de 2026-11-26) · Critérios: `docs/00-visao/brief.md` §9, `CLAUDE.md` §8, `docs/design/etapa-1.html`, `docs/design/design-system.md`, `docs/decisoes.md` (D1–D8, DEC-002).

## 1. Parecer: APROVADO COM AJUSTES

Não há achado bloqueante: o mockup compila, o smoke passa, nenhum estado do inventário ficou inalcançável (109 de 109), não há erro de console, nenhum contato de terceiro aparece antes do aceite, o cadeado respeita o limite de 1 card na Home e nenhum convite abre sozinho.

A entrega à diretoria depende de corrigir os 2 achados de severidade **alta** (regras invioláveis 5 e 6 de `CLAUDE.md` §8, correção barata) e de o fundador decidir o BUG-008 (Instagram antes do aceite). Os 7 de severidade média (BUG-003 a BUG-009) entram antes da entrega se o prazo permitir; senão, viram ressalva com dono. Peço reteste meu depois das correções (`node scripts/qa.mjs` reproduz tudo).

Contagem: bloqueante 0 · alta 2 · média 7 · baixa 7 (16 achados).

Critério de aceite §9 que **não** fecha ainda: "WCAG AA; legível com brilho baixo" (parcial). Dois pontos do §9 dependem de pessoas e ficam fora do que o QA consegue provar: "reconhecido como Protagon" e "o cadeado convida sem irritar (3 pessoas do time)". Ver §4 e §6.

## 2. O que foi executado (evidência)

| Item | Resultado |
|---|---|
| `npm run build` (tsc + vite) | OK. Aviso: chunk JS de 622 kB (> 500 kB), sem impacto no mockup. |
| `npm run smoke` | OK. 87 capturas, 0 erro de console ou de página (VIP do login ao fim do Dia 3 e Executivo). |
| `apps/mockup/scripts/qa.mjs` (novo, meu) | Playwright/Chrome, moldura em escala 1:1 (390 px confirmados). Seções a a i. Reexecutável: `cd apps/mockup && npm run build && node scripts/qa.mjs [a b c d e f g h i]`. |
| (a) estados do inventário | 109 sondas, 109 alcançadas. Na primeira rodada 13 falharam; as 13 eram expectativas erradas minhas (texto, falta de `auth=app`, botão que só habilita após confirmar); investiguei uma a uma e corrigi as sondas. |
| (b) contraste calculado no DOM | 73 estados de tela (abas, páginas empilhadas, sheets, tela bloqueada), cor do texto composta com opacidade × fundo efetivo (inclui gradientes e tints). 2 falhas, 1 causa (BUG-007). |
| (c) tamanho de fonte | 27 textos corridos < 16 px (34 ocorrências), 80 rótulos de ação < 16 px, 12 textos < 13 px (todos do mapa). |
| (d) regras | Ver §3. |
| (e) alvos de toque | 17 controles únicos com 40 px de altura; 24 entre 44 e 47 px. |
| (f) foco e teclado | Anel de foco presente em todo controle alcançado por Tab (Home, Conexões, Trilha, mapa). Sheets: sem focus trap (BUG-005). |
| (g) ≤ 2 toques | 63 de 63: credencial 1 toque, agenda 1 toque, mapa ≤ 2, de cada uma das 5 abas, Executivo e VIP, em sessão ao vivo e almoço; agenda, mapa e credencial abrem com "Sem internet". |
| (h) brilho baixo | 10 telas capturadas com `filter: brightness(0.4)`; revisei 6 (Home, Conexões, Trilha, credencial, Materiais, mapa). |
| (i) notificações na palestra | 13 modelos disparados com "Sessão ao vivo": os 7 não operacionais ficam em espera; 1 falha no estado inicial (BUG-002). |

Evidência em `docs/qa/capturas/etapa-4/`: `qa-resultado-*.json` (dados brutos por seção), `normal-*.png` e `brilho40-*.png` (pares), `foco-*.png`.

## 3. Achados (ordenados por severidade)

Escala: bloqueante = impede a entrega; alta = viola regra inviolável de `CLAUDE.md` §8 ou critério §9, corrigir antes da diretoria; média = UX/acessibilidade relevante; baixa = cosmético, texto, backlog.

| ID | Tela | Sev. | Achado e evidência reproduzível | Critério violado | Correção sugerida |
|---|---|---|---|---|---|
| BUG-001 | U03, C01, C01b, E02, E04n, A05, T02, C05, C10, U01, U02, M01 e outras | Alta | 27 textos corridos (frases com 45+ caracteres) saem a 13 px (3 deles a 14 px, na tela bloqueada). Entre eles o texto de consentimento e privacidade: U03 "Telefone e redes só aparecem depois de um aceite mútuo...", "Seu @ aparece para VIP e Diamond antes do aceite...", "Desligar revoga a autorização...", "Tratamos seus dados com base na sua autorização (LGPD)..."; C01b "Junto com WhatsApp e LinkedIn, só aparece depois que os dois..."; C01 "Dados vindos da sua compra...". Reprodução: `node scripts/qa.mjs c` (lista `corpo<16`). | CLAUDE.md §8.6 "Corpo ≥ 16px"; design-system P5 (caption só para metadado que não exige ação) | Frases explicativas e de consentimento em `text-body` (16 px). Manter 13 px só em metadado curto (hora, contador, "Atualizado às..."). |
| BUG-002 | G02, A01 (bell), entrada no app com sessão ao vivo | Alta | No estado inicial (`?auth=app&moment=live`, que é também o login padrão) a Central de Notificações já traz "Conexões liberadas, 10:05, não lida" e o sino mostra 2. Ou seja, uma notificação de Conexões "chega" durante a palestra. Reprodução: abrir `?auth=app&moment=live&overlay=notifications`; `node scripts/qa.mjs i` (falha "lista de notificações em sessão ao vivo"). O disparo pelo painel respeita a regra (7 modelos não operacionais ficam em espera); só a semeadura inicial a quebra. | CLAUDE.md §8.5 (durante palestras só avisos operacionais); design-system P7 | Semear "Conexões liberadas" como em espera quando o momento é `live` (ou datá-la antes do evento) e contar no sino só as operacionais. |
| BUG-003 | C01, C01b, G02, M01, A03, A04, C02 a C09 (segmentos), U01 | Média | 80 rótulos de ação únicos abaixo de 16 px: chips de objetivos (C01) e de desafio, conhecimento e objetivo (C01b) a 15 px; filtros de G02 (Todas, Avisos, Agenda, Conexões), Dia 1/2/3 de M01, abas de A03 e segmentos de Conexões a 13 px; chips do mapa a 15 px. São o caminho principal da ativação em < 60 s. Rótulos da tab bar a 13 px seguem a especificação (caption) e não contam. | design-system P5 ("caption só para metadado que não exige ação"); CLAUDE.md §8.6 | Rótulos de chip e aba em 16 px; se não couberem, rolagem horizontal ou duas linhas. |
| BUG-004 | G02, M01, A03, Conexões (Sugestões/Explorar/Pedidos/Minha rede) | Média | 17 controles únicos com **40 px** de altura (G02 filtros, M01 Dia 1/2/3, A03 abas, segmentos de Conexões). Outros 24 ficam entre 44 e 47 px: NPS 0 a 10 (47,7 × 48), pontos e chips do mapa (44,3), "Limpar tudo", "Fechar", "Trocar e-mail ou CPF". Reprodução: `node scripts/qa.mjs e`. Ilha dinâmica e "Toque para desbloquear" ficam de fora (cromo do aparelho). | design-system §Componentes ("alvo ≥ 48×48"); Apple HIG 44 pt; WCAG 2.5.8 (24 px) passa, mas o DS é mais rígido | Altura mínima 48 px nos chips e abas (padding vertical; o visual pode continuar mais baixo). |
| BUG-005 | Todos os sheets (C04, C11, C08, A05, C00 convite, E04) e páginas empilhadas | Média | `aria-modal="true"` sem focus trap: em 6 de 6 sheets, 15 a 23 de 25 Tab saem do sheet (vão para o painel de demo; Shift+Tab vai para o conteúdo de trás). Nas páginas empilhadas (ex.: Notificações) 9 controles da aba de trás continuam no tab order (sem `inert`/`aria-hidden`). O foco inicial, o retorno e o Esc estão certos. Reprodução: `node scripts/qa.mjs f`. | WCAG 2.4.3 (ordem do foco); padrão de diálogo modal | `inert` no restante da moldura enquanto houver sheet ou página empilhada, ou focus trap no `BottomSheet`. |
| BUG-006 | A04, A04c | Média | Rótulos do SVG do mapa: "Credenciamento", "Estande", "Banheiros" a 10,5 px; "Palco", "Foyer", "Praça de alimentação" a 11 px; "Plenária principal", "Diamond", "VIP · seu setor", "Executivo" a 12 px. Com brilho a 40% (`brilho40-mapa.png`) "Foyer" e "Palco" quase somem. É a tela de orientação no evento. As chips abaixo do mapa repetem os nomes, mas o mapa em si fica ilegível. | CLAUDE.md §8.6; brief §9 "legível com brilho baixo" | Rótulos de 13 px no mínimo no SVG (ou ícone + número e legenda em 16 px abaixo). |
| BUG-007 | A01 sem internet (card de Conexões) | Média | Texto "Conexões voltam quando a internet voltar" (16 px) e título "Conexões" no card offline com `opacity: 0.6`: contraste 3,5:1 (precisa de 4,5:1). Reprodução: `?auth=app&offline=1`; `node scripts/qa.mjs b`. | WCAG 1.4.3 AA; CLAUDE.md §8.6 | Tirar a opacidade; usar `text-secondary` sem transparência e ícone de offline. |
| BUG-008 | U03, C03, C02 (card), ProfileScreen | Média | Existe a exceção "Mostrar meu Instagram antes da conexão" (selo "proposta", desligada por padrão, confirmado em `qa.mjs d`): com ela ligada, o @ de outras pessoas aparece no card e no perfil antes do aceite. A regra inviolável diz que contato pessoal (inclui redes) só aparece após aceite mútuo. DEC-002 só registra que o fundador "pode liberar", sem decisão aprovada. Os dados de exemplo fazem 2 de 3 pessoas liberarem. Com a opção desligada nada vaza (verificado em 17 estados pré-aceite). | CLAUDE.md §8.3; brief §5 item 4; LGPD (consentimento do outro lado) | Decisão do fundador antes de levar à diretoria: manter como proposta explícita (registrar DEC e pedir parecer do `security-engineer`) ou remover. Não é decisão do QA. |
| BUG-009 | README, painel "Ir direto para", C01b | Média | O atalho do README para C01b (`?connections=1&overlay=profile`) abre o **login** (falta `auth=app`). E "Complete seu perfil" (C01b) não está na lista "Ir direto para"; só se chega por card ou menu. O critério §9 diz que todos os estados são acessíveis pelo painel. Os demais estados de interação (fim da fila, pedidos vazios, "sem resultados", dados excluídos) só se alcançam por toque, descritos no README, e funcionam. | brief §9 critério 2 | Incluir C01b em `SCREEN_CODES` e corrigir a linha do README (`auth=app&connections=1&overlay=profile`). |
| BUG-010 | TabBar (todas as abas) | Baixa | `ul[role=tablist] > li > button[role=tab]`: filhos de `tablist` não são `tab` diretos e não há `tabpanel`; é uma navegação, não abas de conteúdo. Pode gerar erro de "required children" em leitores de tela. | WCAG 4.1.2; ARIA APG | `nav > ul > li > button` com `aria-current="page"`; manter os `aria-label` com cadeado e contagem (estão bons). |
| BUG-011 | C11 (SafetySheet, `SafetySheet.tsx:154`) | Baixa | "Isabela Ramos deixa de ver seu perfil e você deixa de ver **o dele**": concordância errada para pessoa de nome feminino. | CLAUDE.md §8.9 (microcopy) | "e você deixa de ver o perfil de {nome}". |
| BUG-012 | A01 (card Mapa) | Baixa | O card "Mapa" diz "Você está na Plenária" em qualquer momento: no almoço (praça de alimentação), no fim do dia e depois do evento. Reprodução: `?auth=app&moment=lunch`, `moment=endOfDay`, `moment=after`. | Coerência de estado (brief §4 "Home por momento") | Texto por momento ("Almoço: 2º andar") ou texto neutro ("Setor VIP · plenária"). |
| BUG-013 | `index.html`, `dist-single` | Baixa | Sora vem do Google Fonts em tempo de execução, inclusive no `build:single`, que se apresenta como arquivo único. Sem internet cai na fonte do sistema (métricas e números tabulares mudam, risco de quebra de linha nos cards). | README (single "pronto para hospedar"); P5 (números tabulares) | Embutir Sora (woff2 em base64 ou arquivo local) no build. |
| BUG-014 | C02 | Baixa | Dois botões verdes primários na mesma tela: "Completar" (card "Complete seu perfil") e "Conectar" (card de sugestão). Evidência: `docs/design/capturas/etapa-3/vip-10-c02-sugestoes.png`. | design-system P3 (um primário por tela) | "Completar" como botão secundário (contorno dourado). |
| BUG-015 | A01 em `live` | Baixa | Em sessão ao vivo a Home do VIP mostra "Ativar perfil" (sem perfil) ou "4 pedidos e 26 sugestões **esperando o intervalo** / Ver agora" (com perfil): o texto manda esperar e o botão manda ir agora. Reprodução: `?auth=app&moment=live&connections=1&profile=full`. A spec de etapa-1 manda o card existir; a copy é que contradiz P7. | design-system P7 | CTA "Ver no intervalo" (ou sem CTA durante a sessão). |
| BUG-016 | Painel de demonstração | Baixa | "Notificação a disparar" lista todos os modelos em qualquer momento: em "Sessão ao vivo" dá para disparar "Intervalo de 15 min" ou "Faltam 2 dias para o Protagon" e eles chegam como push. Quem demonstra pode parecer que o app avisa fora de hora. Reprodução: `node scripts/qa.mjs i`. | Clareza da demo | Filtrar a lista pelos modelos do momento atual (campo `moments` já existe). |

Observação sem ID (hipótese, avaliar no teste com pessoas): a prévia borrada do C00 ocupa 150 px e fica quase toda coberta pelo painel ("-48"); na captura `exec-06-c00-cadeado.png` vira uma mancha. O convite funciona pelo texto, não pela prévia. `[HIPÓTESE]` de que a prévia ajuda a converter; o brief pede "prévia real borrada" (o dev optou por cartões abstratos, o que é melhor para privacidade).

Fora de escopo da varredura (cromo do aparelho simulado, não UI do app): Dynamic Island (11 px, 37 px de altura), tela bloqueada e push (`system-glass` com blur de 24 px; o dev os trata como UI do sistema, o que aceito). Inputs usam só a troca de cor da borda como foco (de `border.strong` para `gold.200`); passa em contraste, anotado como baixo risco.

## 4. Critérios de aceite do brief §9

| Critério | Resultado | Base |
|---|---|---|
| Navegar o dia de um aluno, do login ao fim do Dia 3, sem explicação | **Atendido (automático); teste humano pendente** | Smoke VIP e Executivo: 87 telas, 0 erro. 109 estados alcançados; agenda, mapa e credencial a ≤ 2 toques em 63 verificações. Ressalva: o tempo só avança pelo painel (inerente à demo). "Sem explicação" precisa de alguém que nunca viu o app. |
| Todos os estados existem e são acessíveis pelo painel | **Atendido com ressalva** | 109 de 109. Ressalva: BUG-009 (C01b). Vários estados de interação só se alcançam por toque (README descreve). |
| Reconhecido como Protagon à primeira vista e parece produto de tecnologia | **Não verificável pelo QA** | Julgamento do fundador. Evidência objetiva: wordmark e leão do SVG oficial, tokens do brief, dark-first, Sora. Ver as 10 capturas `normal-*.png` e `docs/design/capturas/etapa-3/`. |
| WCAG AA; legível com brilho baixo | **Parcialmente atendido** | Contraste: 72 de 73 estados passam (BUG-007). Falham: tamanho (BUG-001, 003, 006), alvo de toque (BUG-004), foco em sheets (BUG-005). Brilho a 40% (revisei visualmente Home, Conexões, Trilha, credencial, Materiais e mapa): legíveis, exceto o mapa (BUG-006); intervalo e Eu foram capturados mas não revisados por mim. Simulação por filtro não substitui aparelho. |
| Conexões não lembra app de namoro; o cadeado convida sem irritar | **Atendido nos checks; teste com 3 pessoas não realizado** | 0 ocorrências de "match", "curtir", coração, emoji ou léxico de namoro em 73 estados; avatares por iniciais, sem foto. Cadeado: 1 card na Home em todos os 6 momentos, 0 fora de Home e Conexões, nenhum diálogo aberto na abertura, convite fechável por "Agora não" e X. A percepção de "sem irritar" exige as 3 pessoas. |

Regras invioláveis `CLAUDE.md` §8:

| Regra | Resultado |
|---|---|
| 1 Segredos | OK. Sem `.env`/chaves versionados; senha do Wi-Fi é dado fictício. |
| 2 Linguagem das Conexões | OK (0 ocorrências). |
| 3 Contato só após aceite | OK com a opção desligada (0 vazamentos em 17 estados pré-aceite); exceção em BUG-008. |
| 4 Cadeado | OK. Teste: Home Executivo × 6 momentos = 1 cadeado; Trilha, Materiais, Eu = 0. |
| 5 Só avisos operacionais na palestra | **Falha no estado inicial** (BUG-002); disparo pelo painel OK; tab bar sem badge de pedidos na palestra OK. |
| 6 Contraste AA, verde e dourado com texto `#020111`, corpo ≥ 16 px, tabulares | Contraste OK exceto BUG-007; corpo falha (BUG-001). O contraste do texto sobre verde e dourado passou na varredura. |
| 7 Vidro só em tab bar e sheets | OK nos 10 estados varridos: `backdrop-filter` só na tab bar e no sheet; fora isso só o `filter: blur` da prévia do C00 (exigido pelo brief) e o vidro do push/tela bloqueada (cromo do aparelho). "Reduzir transparência" não foi verificável: o Playwright não emula essa mídia; ver §5. |
| 8 Dados fictícios, CPF mascarado, consentimento desligado | OK. CPF `***.482.917-**`; switch de autorização nasce desligado (C01 passo 3 e U03). |
| 9 Microcopy em português, sem emoji | OK, exceto BUG-011 (concordância). |

## 5. Heurísticas de Nielsen (fluxos críticos)

| Heurística | Home ao vivo | Conexões | Cadeado |
|---|---|---|---|
| 1 Visibilidade do estado | Bom: "Ao vivo", progresso "35 de 60 min", próximo e contagem; banner offline. | Bom: "Sugestão 1 de 26 · Restam 15 pedidos hoje", "Pendente". | Bom: lock na aba e "bloqueado no seu ingresso" no rótulo. |
| 3 Controle e liberdade | Banner de agenda tem seta, sem fechar (aceitável). | "Agora não" tem Desfazer (toast de 6 s); "Limpar tudo" tem Desfazer; bloquear e excluir pedem confirmação (excluir só habilita após "Entendo"). | Convite fecha por "Agora não" e X; Esc também. |
| 4 Consistência | Contradição de copy em BUG-015. | Dois verdes em C02 (BUG-014). | Consistente. |
| 5 Prevenção de erro | n/a | Limite diário bem tratado: o CTA vira "Conectar ... pelo QR" e a mensagem explica "Amanhã você tem 15 de novo". | n/a |
| 6 Reconhecer em vez de lembrar | Atalhos credencial, mapa, Wi-Fi na própria Home. | Motivo em uma linha e chips de interesses em comum. | Três benefícios listados antes do CTA. |
| 8 Minimalismo | Home densa abaixo da dobra (Wi-Fi, avisos, Conexões), mas o bloco "agora" fica acima. | Cards longos (afinidade, nicho, objetivo, interesses, desafio, domina) obrigam a rolar para ver "Conectar" em telas pequenas. `[HIPÓTESE]`: testar em 360 pt de largura. | Lock repetido 3 vezes na mesma tela (título, tab bar, painel); aceitável. |
| 9 Mensagens de erro | Login: CPF `000.000.000-00` e código `000000` dão mensagens com saída (suporte, reenviar). | Limite e fila vazia explicam o porquê. | n/a |

## 6. O que o fundador precisa testar no celular (roteiro curto)

QA não tem aparelho; o que depende de hardware ou de percepção fica aqui. Abrir o link do mockup no iPhone (Safari) e num Android de entrada.
1. Brilho no mínimo, em ambiente escuro (ou quarto): abrir Home ao vivo, Conexões, Mapa e Credencial. Esperado: ler horário, título da sessão, botões e rótulos do mapa sem apertar os olhos. Anotar o que não lê (suspeito: mapa, textos de 13 px).
2. Zoom de texto do sistema no maior tamanho (iOS: Ajustes > Acessibilidade > Tamanho do texto): Home e Conexões sem texto cortado nem botão coberto pela tab bar.
3. Tocar com o polegar nos filtros de Notificações, nos dias de Materiais e nos segmentos de Conexões: acertar de primeira? (40 px, BUG-004).
4. Ligar "Reduzir transparência" (Ajustes > Acessibilidade > Tela) e abrir um sheet: fundo sólido, sem blur. Não consegui verificar no navegador de teste.
5. Teste com 3 pessoas do time (critério §9): mostrar só o Executivo; perguntar "o que esta tela quer de você?" e "dá vontade de tocar ou irrita?"; registrar quantos tocam em "Quero me conectar" e quantos acham o cadeado intrusivo.
6. Uma pessoa que nunca viu o app percorre login até o fim do Dia 3 sem ajuda (critério §9, "sem explicação"), com o painel no lado.

## 7. Limites desta revisão

- Contraste calculado para texto; não medi contraste de ícones e bordas (3:1) de forma automática.
- Um estado por tela na varredura de texto; combinações raras (ex.: Diamond com notificação em espera) foram só sondadas, não varridas.
- Fonte Sora carregada pela rede no teste; o fallback não foi avaliado.
- "Brilho baixo" simulado por filtro `brightness(0.4)` e olhar humano; a conta de razão sob esse filtro (no JSON `h`) é uma aproximação linear em sRGB e não vale como prova.
- `qa.mjs` não estava em `package.json`; `npm run qa` foi adicionado na rodada de correções (§8) e as seções passam.

## 8. Correções (Etapa 4, rodada única, 2026-11-26)

Autor: `mobile-dev` (construiu o mockup; o reteste independente continua com o `qa-engineer`). Decisões do CEO aplicadas: corpo e texto corrido (inclusive consentimento) em 16 px; rótulo de ação (chip, filtro, aba, tab bar) em 14 ou 15 px com peso 500 a 600; alvo mínimo de 44 px (48 px onde o design system pede); BUG-008 mantém a opção do Instagram e ganha o aviso do SEC-004.

Resultado: `npm run typecheck`, `npm run build`, `npm run build:single`, `npm run smoke` (89 capturas, 0 erro de console) e `npm run qa` (todas as seções: 232 verificações, 0 falhas, 0 erro de console) passam. Evidência pós-correção: `capturas/etapa-4/qa-resultado-abcdefghi.json` e as capturas `normal-*`, `brilho40-*` e `foco-*` regeneradas; o resultado de antes ficou em `capturas/etapa-4/antes-das-correcoes/`. Capturas do smoke regeneradas em `docs/design/capturas/etapa-3/`. `qa` entrou no `package.json`. Prévia atualizada em `preview/index.html`.

### 8.1 Achados BUG

| ID | Status | O que mudou |
|---|---|---|
| BUG-001 | Corrigido | Todo texto corrido e de consentimento em `text-body` (16 px): U03, C01 e C01b, E02, E04n, A05, T02, C05, C10, U01, U02, M01, tela bloqueada e push (de 14 para 16 px), banner offline, hints das chaves, linhas de nicho, objetivo, desafio e "Domina" do card de sugestão. Ficam em 13 px só metadados curtos (hora, contador, "Atualizado às..."). A sonda c (corpo, 45+ caracteres) passa com 0 ocorrências. |
| BUG-002 | Corrigido | A notificação de boas-vindas de Conexões nasce "em espera" quando o momento é `live` (login padrão e `auth=app`); ao voltar para a palestra, o que era não lido de Conexões ou material volta para a espera. Sino e lista só mostram o operacional; a lista traz "1 notificação em espera até o intervalo". |
| BUG-003 | Corrigido | Chips, filtros, abas, segmentos e tab bar usam `text-label` (15 px, peso 500) ou `text-label-sm` (14 px, peso 600). Dois tokens novos no `tailwind.config.ts`, a levar ao designer para `tokens.json`. |
| BUG-004 | Corrigido | Segmentos de Conexões, filtros de G02, dias de M01 e abas de A03: 48 px de altura (eram 40). Chip de filtro ativo do Explorar e botão Voltar, "Limpar tudo", pontos e rótulos do mapa também em 48 px. Restam entre 44 e 47 px: NPS 0 a 10 (47,7 × 48, largura) e "Toque para desbloquear" (44, cromo do iOS simulado). A ilha dinâmica é hardware do aparelho e fica de fora (ver 8.3). |
| BUG-005 | Corrigido | `BottomSheet`: focus trap (Tab e Shift+Tab giram dentro) e `inert` em todo o resto da moldura enquanto houver sheet. Páginas empilhadas: aba de trás (`TopBar`, banner, conteúdo) `inert`, foco vai ao título da página ao abrir e volta ao gatilho ao fechar. Seção f: 7 de 7 sheets sem escape. |
| BUG-006 | Corrigido | Rótulos do mapa em 15 unidades do SVG (cerca de 14 px na tela), cor `text-primary`, peso 600; serviços do foyer em rótulos maiores, e os nomes continuam repetidos nos chips de 15 px abaixo do mapa. Verificado a brilho 40% em `brilho40-mapa.png`. Pontos e rótulos com área de toque de 48 px. |
| BUG-007 | Corrigido | Card de Conexões offline sem `opacity`: texto em `text-secondary` com ícone de internet. Seção b sem nenhuma falha de contraste. |
| BUG-008 | Corrigido (decisão do CEO: manter) | Opção "Mostrar meu Instagram antes da conexão" mantida, com selo "proposta" e desligada por padrão. Ligar abre um sheet de confirmação com o aviso do SEC-004 ("bloquear e denunciar daqui não valem"); a chave só liga ao confirmar. A opção também respeita os canais que cada pessoa liberou. A decisão formal (DEC e parecer do `security-engineer`) continua pendente com o fundador. |
| BUG-009 | Corrigido | `C01b` entrou no "Ir direto para" e em `?go=C01b`; atalho do README corrigido para `auth=app&connections=1&overlay=profile`. |
| BUG-010 | Corrigido | Tab bar é `nav > ul > li > button` com `aria-current="page"`; `aria-label` com cadeado e contagem mantidos. |
| BUG-011 | Corrigido | "deixa de ver seu perfil e você deixa de ver o perfil de {nome}". |
| BUG-012 | Corrigido | Card Mapa por momento: "Plenária principal" (palestra), "Café no foyer" (intervalo), "Almoço no 2º andar" (almoço) e "Ver o local do evento" nos demais. |
| BUG-013 | Corrigido | Sora (latin, variável 400 a 700, 25 kB) embutida em `src/assets/fonts/` via `@font-face`; links do Google Fonts removidos. O `dist-single/index.html` carrega a fonte em base64. Ver 8.3 sobre a origem do arquivo. |
| BUG-014 | Corrigido | "Completar" virou botão de contorno dourado (variante nova `gold`); só "Conectar" fica verde. |
| BUG-015 | Corrigido | Em sessão ao vivo o card diz "Ver no intervalo" (e "Ativar no intervalo" quando o perfil não existe), no texto e no rótulo de acessibilidade. |
| BUG-016 | Corrigido | O painel só lista os modelos de notificação do momento atual (campo `moments`). |

### 8.2 Achados SEC (grupo "ajustes agora" de `docs/seguranca/lgpd-conexoes.md`)

| ID | Status | O que mudou |
|---|---|---|
| SEC-001 | Feito | C01 passo 3 traz a linha "Também aparecem: nicho e objetivo no Protagon; foto, desafio e conhecimentos, se você preencher.", a chave do §5 (desligada por padrão, ativar só com ela ligada), as 4 linhas (uso, contatos e exportação, 90 dias, pausar ou excluir) e o link "Política de privacidade" (simulado por aviso). A linha "Não usamos para venda de outros produtos" leva o selo "Proposta": depende de DD-04. |
| SEC-002 | Feito | "Depois do aceite, você compartilha" no C01 passo 3 e em U03: chave por canal (WhatsApp, LinkedIn, Instagram), todas desligadas, com o valor ao lado; o WhatsApp vem da compra e é editável em "Complete seu perfil", junto com LinkedIn e Instagram. O C03 e o chat mostram só os canais que cada pessoa liberou (nos dados de exemplo, Larissa não libera LinkedIn e Felipe não libera Instagram). |
| SEC-003 | Feito | Nicho, objetivo no Protagon, foto e maior desafio entram em "O que fica visível" (C01 passo 3 e U03). Maior desafio tem chave própria, também em "Complete seu perfil"; nos dados de exemplo, 3 pessoas mantêm o desafio oculto: o card e o C03 não o mostram e ele não gera motivo de sugestão. Explorar continua sem filtro por desafio. |
| SEC-004 | Feito | Aviso na dica e no sheet de confirmação ao ligar o Instagram antes da conexão; padrão desligado. |
| SEC-005 | Feito | Motivos: "Assédio ou comportamento inadequado", "Mensagem ofensiva", "Perfil falso ou de outra pessoa", "Oferta indevida ou spam", "Outro motivo". "Bloquear {nome} também" vem marcado: ao enviar, bloqueia e fecha o perfil ou chat. Depois de enviar: "Durante o evento, a equipe analisa no mesmo dia. Se for urgente, procure a equipe no estande." e botão "Falar com a equipe no estande" (abre o mapa no estande). O "mesmo dia" é SLA proposto, a definir com Eventos (DD-09). |
| SEC-006 | Mantido | Prévia do C00 continua com cartões abstratos, sem foto. A decisão sobre foto real segue com a diretoria. |
| SEC-007 | Feito | Aviso de uso responsável abaixo do botão de exportar, com a contagem do que entra no arquivo ("5 WhatsApp, 3 LinkedIn, 4 Instagram": só o que cada pessoa liberou) e a nota de que conexões desfeitas, bloqueadas ou excluídas não entram. |
| SEC-008 | Feito | (1) pausar: "Você some das sugestões e da busca e não recebe pedidos novos. Suas conexões continuam." (U03, C11 e estado pausado); (2) desfazer: "deixam de aparecer no app para os dois. O que já foi salvo fora do app não é apagado."; (3) exclusão: "Apagamos do app na hora... Cópias de segurança são apagadas em até 30 dias" (U03, tela de dados excluídos e FAQ); (4) texto da base de autorização e link da política em U03; (5) CPF mostrado só com os 2 últimos dígitos (`***.***.***-35`), como na recomendação de stack. |

[HIPÓTESE] O prazo de 30 dias para cópias de segurança e o "mesmo dia" da denúncia são valores propostos para o mockup; o definitivo vem do jurídico, de Eventos e do `backend-dev`. SEC-009 a SEC-017 são requisitos do app real e não entram no mockup.

### 8.3 Sondas corrigidas em `scripts/qa.mjs` (critério mantido, sonda errada)

- **c, rótulos de ação**: o critério passou a ser o decidido pelo CEO (14 px ou mais, peso 500 a 600 abaixo de 16 px; acima de 16 px o peso é livre). Contadores numéricos de abas ("4") contam como metadado. O critério de corpo (45+ caracteres a 16 px) e o piso de 13 px não mudaram.
- **i, notificações**: a classificação "entregue ou em espera" lia o texto "N em espera" do painel; com a semeadura inicial já em espera, tudo parecia retido e a verificação passaria sem provar nada. Agora compara a contagem antes e depois do disparo. Com o BUG-016 o painel só oferece os modelos do momento, então em sessão ao vivo a sonda dispara 4 (2 operacionais entregues, 2 não operacionais retidos), não mais 13; a regra no `store` continua a mesma para qualquer modelo. A busca da aba "Conexões" passou para o botão do `nav`, por causa do BUG-010.
- **f**: "U03 excluir" nunca foi um sheet (a confirmação é inline, sem `role=dialog`); a sonda de sheet passou a usar o aviso do Instagram em U03. No "Login", o mínimo de controles com anel caiu de 4 para 1: o botão nasce desabilitado e o campo é o único controle até alguém digitar.
- **e**: ilha dinâmica excluída (`data-device-chrome`), por ser hardware do iPhone simulado; "Toque para desbloquear" tem 44 px e passa.
- **d**: `backdrop-filter` de `.system-glass` (push e tela bloqueada) fica de fora da regra 7, por ser cromo do iOS simulado (já aceito em §4).
- **a**: regex do CPF atualizada para a nova máscara; 12 sondas novas cobrem BUG-008 e SEC-001 a SEC-008 (121 estados sondados, 0 não confirmados).

### 8.4 O que não foi feito ou não foi validado

- Android e iOS reais: nada foi aberto em aparelho. Tudo foi verificado em Chrome, com filtro de brilho a 40% por simulação. Os itens do roteiro do §6 (brilho mínimo no escuro, texto do sistema no maior tamanho, "Reduzir transparência", teste com 3 pessoas e com quem nunca viu o app) continuam com o fundador. Não testei leitor de tela (VoiceOver e TalkBack).
- `npm install @fontsource-variable/sora` foi negado pelo ambiente; o arquivo da Sora foi baixado direto do Google Fonts (`fonts.gstatic.com`, SIL Open Font License 1.1). Conferir a licença com o designer antes de publicar.
- `text-label` e `text-label-sm` não existem em `docs/design/tokens.json`; o designer precisa incorporá-los. O mockup já os usa.
- Os textos de consentimento e de política são do jurídico (§5 do parecer de segurança); o link "Política de privacidade" é simulado.

## 9. Revisão: Grupos, Ofertas e Gaia One

Data: 2026-11-26 · Revisor: `qa-engineer` (não construiu) · Objeto: `apps/mockup` no commit `be106f5` (GR01 a GR06, OF01 a OF04, GA01 a GA03) · Critérios: `docs/produto/grupos-ofertas-gaia.md`, specs `gr-grupos.md`, `of-ofertas.md`, `ga-gaia-one.md`, DEC-003, DEC-004, `docs/seguranca/lgpd-conexoes.md` §7 (SEC-018 a SEC-024), `docs/produto/prompt-grupos-ofertas-gaia.md` §7 e `CLAUDE.md` §8.

### 9.1 Parecer: APROVADO COM RESSALVAS (para o mockup da Fase 1)

Nenhum achado crítico ou alto. Os cinco critérios do prompt §7 passam em ambiente de teste (Chrome), com prova própria e não só a do smoke do dev. As ressalvas são 3 itens de severidade média, que dependem de decisão de produto ou de resposta do fundador, e 6 baixos. O parecer vale para o mockup; não vale como aprovação de segurança do app real (SEC-025 e SEC-026 seguem como requisito que bloqueia o lançamento de Ofertas e Grupos).

Contagem: crítica 0 · alta 0 · média 3 · baixa 6 (9 achados, BUG-017 a BUG-025).

### 9.2 O que rodei

| Comando | Resultado |
|---|---|
| `npm run build` | passa (typecheck estrito e Vite; aviso de chunk > 500 kB, sem impacto no mockup) |
| `npm run smoke` | passa, 160 capturas, 0 erro de console (regenera PNGs em `docs/design/capturas/etapa-3/`; restaurei os já versionados para não sujar o diff) |
| `npm run qa`, seções a a i (rodada completa antes da seção j) | 319 verificações, 0 falhas, 0 erro de console; 52 estados novos de GR, OF e GA alcançados, 0 não confirmados; contraste, corpo de 16 px, alvos de 44 px e foco passam nas telas novas |
| `node scripts/qa.mjs j` (nova) | 67 verificações, 0 falhas, 0 erro de console |
| Exploratório (Playwright avulso, fora do repositório) | duplo toque em "Entrar", sair e reentrar, grupo cheio, código com formação encerrada, troca de ingresso no painel depois da liberação, Executivo em "Pedir troca ou denunciar", Gaia One com grupo |

### 9.3 As checagens do dev provam o que dizem?

Parcialmente. Passam, mas deixam buracos que a seção j fecha:

| Checagem do dev (`smoke.mjs`) | Fraqueza | O que a seção j faz |
|---|---|---|
| Oferta invisível antes da liberação | Só VIP no Dia 2; lê `innerText` (não vê atributos, `aria-label` nem nós ocultos); Diamond, Executivo e Dia 3 ficam sem prova; sem busca por "oferta" e "mentoria" | 3 ingressos x Dia 2 e 3, 10 a 15 superfícies cada (Home, Trilha, detalhe do pitch, Materiais, Conexões e busca de Explorar com 4 termos, Eu, Notificações, todos os modelos do painel), HTML inteiro mais `localStorage`; nenhum download de `offers-*.js`; nome só no chunk `offers-*.js` do build |
| Nenhum grupo de outra categoria | Lista de nomes escrita à mão no teste (some a cobertura se alguém entra na base); testa 1 código de outra categoria | Nomes lidos de `src/data/participants.ts` e `groups.ts`; 3 ingressos x 3 caminhos (entrar, criar, encaixar) varrendo lista, código e Meu grupo; TODOS os códigos das outras categorias (7 a 13 por ingresso) dão a mesma resposta do código inexistente e não entram |
| Contato do grupo só após opt-in | Regex só do formato `(NN) 9NNNN-NNNN`; só VIP | Sem número, `wa.me`, `tel:` nem `+55` no HTML com a chave desligada, com a chave ligada em 2/3 e com o grupo completo; botão só para quem compartilhou; desligar tira na hora; 3 ingressos |
| Liberação silenciosa | Olha só o registro do painel ("Última:") | Espia `navigator.vibrate`, áudio, `Notification` e o banner de push, além do registro e do badge do sino; controle positivo confirmado (em intervalo o mesmo teste vê vibração) |

Limitação que continua: o teste olha o DOM de um build de demonstração. O critério "nem nos dados do app" só é provável no app real (SEC-025); no `dist-single` a oferta vai embutida no HTML (limitação já registrada em SEC-023).

### 9.4 Achados

| ID | Tela | Sev. | Achado e evidência | Critério violado | Correção sugerida |
|---|---|---|---|---|---|
| BUG-017 | OF01, OF02, `offers.ts` | Média | A matriz por ingresso do build inverte a do PO: Olimpo só VIP e Diamond (`offers.ts` `prices` sem `executivo`) e Liderança 360 para os três. O PO escreveu o contrário (`grupos-ofertas-gaia.md` R-OF-11 e §5: Olimpo para todos, Liderança só VIP e Diamond) e o Gherkin OF-07 ("Liderança liberada só para VIP e Diamond, sou Executivo, não vejo card") não se reproduz literalmente. O designer (`of-ofertas.md`, "Diferenças por ingresso") tinha o Olimpo sem Executivo. Dois documentos divergem e não há DEC. Efeito na demo: o Executivo só vê oferta no Dia 3. A cobertura de comportamento continua (restrita, para todos, preço por categoria, "não disponível" sem cadeado: `OF02x`, `OF02-exec-lideranca`, 0 cadeados em 42 telas x ingressos). | R-OF-7, OF-07, §5 do PO sem decisão que os revogue; DEC-003 | PO e CEO decidem a matriz (vender o Olimpo ao Executivo é decisão comercial do fundador, pergunta 4), registram `DEC-###` e alinham §5, R-OF-11, OF-07 e o README. Se mantiver o build, reescrever OF-07 com o Olimpo. |
| BUG-018 | GR01, GR02 | Média | Estado "categoria com menos de 3 alunos" (R-GR-8, Gherkin GR-19, DEC-003 item 4) não existe: nenhum texto "A equipe vai te informar seu grupo" em `src/` (busca por "equipe vai te informar" sem resultado) e o painel não tem como ativá-lo. Com a lista vazia o app diz "Crie um ou peça para o app te encaixar", promessa que não se cumpre se a categoria não tem 3 pessoas. O mockup tem 11 Diamond, então a demo não sofre, mas a diretoria pode perguntar. | R-GR-8; GR-19; DEC-003 (4) | Construir o estado com chave no painel ("Poucos alunos na categoria") ou o PO marcar GR-19 como requisito do app real e o README dizer isso. |
| BUG-019 | GA02, GA03 | Média | O aluno não consegue "concluir seguindo só o app" de verdade hoje: a tela mostra texto bruto de pendência, por exemplo "Descrição do produto em uma frase [a confirmar]" logo abaixo do título, "[a confirmar]" também em duração do teste, resposta de cartão, código promocional, equipe de apoio e link da loja (`gaia.ts`, `PENDING`). O fluxo funciona e fecha em 5 toques nos 3 ingressos, mas sem o que é o produto, sem loja real e sem regra de cartão o passo a passo não é validável. É dependência do fundador (pergunta 8), não defeito de código. | Prompt §7 (4); R-GA-3 | Yago responde a pergunta 8 (produto, links das lojas, cartão, duração, código); até lá, ressalva com dono Yago. Antes da diretoria, trocar o texto bruto por selo "proposta" discreto no padrão do restante do mockup. |
| BUG-020 | GA02, A05 (Wi-Fi) | Baixa | "Copiar meu e-mail", "Copiar código" e "Copiar senha" mostram "copiado" mesmo se a cópia falha: `copyText` engole o erro (`GaiaScreen.tsx` linhas 24 a 30; `WifiSheet.tsx` linhas 20 a 28). Em página `http` ou sem permissão, `navigator.clipboard` não existe ou rejeita e o aluno cola vazio no cadastro do Gaia One, no passo que mais pesa no tempo de 3 minutos. O estado "Copiar falhou" da spec não foi construído (reportado pelo dev). | `ga-gaia-one.md` estados ("Copiar falhou"); regra de honestidade do progresso | Mostrar "Não conseguimos copiar. Toque e segure o texto para copiar." quando a promessa rejeitar ou a API não existir; o e-mail já é `select-all`. Teste manual no celular do fundador (§9.7, item 3). |
| BUG-021 | OF01, painel "Liberar oferta" | Baixa | O painel e o PO dizem "Dia 2 · 18h15, durante O legado do líder", mas o relógio da demonstração está em 10h05 (Plenária da manhã, "Começou às 9h30"). A Home com a oferta mostra "Liderança que forma líderes" ao vivo e a contagem "Falta 1 dia e 9h" calculada a partir de 10h05 (`brilho40-of-home.png`). Quem vê a demo lê um pitch às 10h da manhã. | R-OF-11; coerência da demo | Liberar a oferta posicionando o relógio em 18h15 (momento "Ao vivo" tardio) ou trocar o rótulo do painel. |
| BUG-022 | GR06 "Pedir troca ou denunciar" | Baixa | "Denunciar" oferece 4 motivos (Assédio, Mensagem ofensiva, Perfil falso, Outro). Falta "Oferta indevida ou spam" do SEC-005, que o SEC-019 pede como "mesmos motivos". A caminho urgente (estande) existe. Testado com Executivo, que chega à folha sem C11. | SEC-019 | Incluir o motivo ou registrar que, em grupo, "spam" não se aplica. |
| BUG-023 | OF02 | Baixa | O aviso de saída "Você vai sair do app para pagar na Hotmart." fica depois de "Agora não", em `text-caption` (13 px, `OfferScreen.tsx` linha 203): quem toca "Assinar" não o leu. O aviso antifraude acima ("Não pague por links recebidos em grupos") está bem posto. | SEC-023 (3); CLAUDE.md §8.6 (texto relevante não deve ficar abaixo do corpo) | Subir o aviso para antes do botão "Assinar" em 16 px. |
| BUG-024 | OF01, OF02 | Baixa | Dois estados da spec sem construção (reportados pelo dev): banner "O time atualizou o prazo: agora vale até 19h." (OF02) e skeleton do card da oferta na Home (`OfferHomeCard.tsx` não usa `Skeleton`). Não há critério Gherkin para eles; a tela OF02 tem skeleton. | `of-ofertas.md` (estados OF01 e OF02) | Aceitar como diferença documentada ou construir; sem impacto no critério §7. |
| BUG-025 | GA02 passo 2 | Baixa | O e-mail quebra no meio da palavra ("raf" / "ael.moraes@...") por causa de `break-all` (`GaiaScreen.tsx` linha 304); visível em `brilho40-ga-checklist.png`. É o dado que o aluno precisa copiar ou digitar. | Legibilidade; §8.6 | `break-words` ou o e-mail em linha própria. |

### 9.5 Desvios reportados pelo mobile-dev

| Desvio | Avaliação |
|---|---|
| Matriz de ofertas por ingresso | Vira BUG-017. O comportamento está correto e demonstrado; o problema é decisão e documento. |
| Prazos (Olimpo até 14/03 19h10; Liderança até 21/03 19h10) | Aceito. Bate com R-OF-11 (fim do Dia 3; 7 dias) e é prazo real, sem escassez; a contagem não muda de cor, não vibra e não avisa (`Countdown` sem tom `warning`). Verificado: 12 x 1.490 = 17.880 e os outros 4 totais fecham. O exemplo "18h30" do designer era ilustrativo. |
| Categoria com menos de 3 alunos | Vira BUG-018. |
| "Copiar falhou" | Vira BUG-020. |
| "Prazo atualizado pelo time" e skeleton do card | Vira BUG-024. |

### 9.6 Critérios do prompt §7

| Critério | Resultado | Evidência |
|---|---|---|
| Forma ou entra num grupo de 3 em menos de 1 minuto, sem ajuda | Atendido | 3 ingressos x 3 caminhos (entrar, criar, "Me coloque"): 2 toques em todos; 1,7 a 2,2 s de script e 9,7 s em "criar" (geração simulada). Tempo humano não medido: roteiro do §9.7, item 1. Sem diálogo de confirmação no caminho. |
| Ninguém vê ou entra em grupo de outra categoria | Atendido no mockup | Seção j: 0 nomes de outra categoria em lista, código e Meu grupo nos 3 ingressos; 32 códigos de outras categorias respondem igual ao inexistente (SEC-021). A prova real é no servidor (SEC-026). |
| Oferta invisível antes de "Liberar oferta"; depois, 1 toque na Home | Atendido | 6 combinações ingresso x dia, HTML inteiro; card no topo (251 px) e "Ver oferta" abre a tela em 1 toque nos 3 ingressos. Silêncio na palestra: 0 vibração, áudio, push, notificação do sistema e badge; toast de 6 s some e só aparece uma vez. Tom: nenhuma ocorrência de "restam", "última chance", "só hoje", "corra", "imperdível" nem contador de vagas; preço total e à vista juntos; "Agora não" sem culpa, tile discreto; aviso antifraude presente. |
| Gaia One concluído só pelo app | Atendido com ressalva (BUG-019) | 5 toques até "Gaia One ativado" nos 3 ingressos; "Já ativei" só aparece no passo 4; sem pedido para sair do app; sem aviso nem vibração ao iniciar em palestra (GA-09); grupo mostra só "N de 3 já ativaram" (SEC-024). |
| Três ingressos e alcançável pelo painel | Atendido | Todos os códigos GR, OF e GA estão em "Ir direto para"; 52 sondas de estado nas telas novas, 0 não confirmadas; 0 cadeado em GR, OF e GA; Home do Executivo com grupos e oferta tem 1 cadeado (Conexões); sem "match", "curtir", coração nem emoji. |

SEC-018 a SEC-024: todos verificados no mockup. SEC-018 (lista sem empresa, fila nem foto; aviso e "Só por código"), SEC-019 (folha de troca e denúncia nos 3 ingressos, com a nota do BUG-022), SEC-020 (chave desligada, só depois de completar, só quem compartilhou, "quem salvar fica com o número"), SEC-021 (mensagem única; códigos sem vogal), SEC-022 (campos listados, sem CPF nem Conexões, "Cancelar pedido"), SEC-023 ("Ofertas do evento" só depois da 1ª liberação; aviso de saída com a nota do BUG-023), SEC-024 (só a contagem).

### 9.7 Roteiro curto para o fundador (aparelho real; eu não testo hardware)

1. Grupos, com cronômetro: no celular, Home > "Formar meu grupo" > "Entrar", com dois colegas que nunca viram o app. Esperado: menos de 1 minuto cada um, sem perguntar nada. Ler o QR de um grupo com a câmera real.
2. Silêncio na palestra: com som e vibração ligados, abrir a Home e liberar a oferta pelo painel em outro aparelho. Esperado: celular não vibra nem toca; o toast "Oferta do palco disponível" some em cerca de 6 s.
3. Copiar: no Gaia One, "Copiar meu e-mail" e colar nas Notas; repetir com "Copiar código" e a senha do Wi-Fi. Anotar se algum cola vazio (BUG-020), no Wi-Fi do salão e no 4G.
4. Brilho no mínimo, no escuro: lista de grupos ("Setor VIP", "Fecha às 10h45"), tela da oferta (preço e prazo) e checklist do Gaia One. Anotar o que não lê.
5. Texto do sistema no maior tamanho: tela da oferta (preço e botões sem corte) e lista de grupos.
6. Leitura por quem não conhece o app (3 pessoas): ler a tela da oferta e dizer se sentiram pressão. Hipótese minha: não, mas isso é percepção, não DOM.

### 9.8 Alterações em `apps/mockup/scripts/qa.mjs`

Nova seção `j` (rodar com `node scripts/qa.mjs j`; já entra em `npm run qa`): oferta invisível em HTML inteiro, silêncio de liberação, tom, 1 toque, grupos por categoria e por código, contato, Gaia One em 3 ingressos e na palestra, vocabulário, emoji e cadeado. A seção `h` ganhou 8 pares de capturas de brilho 40% das telas novas (`docs/qa/capturas/etapa-4/*-gr-*`, `*-of-*`, `*-ga-*`); a razão de contraste a 40% continua só indicativa. Resultado em `docs/qa/capturas/etapa-4/qa-resultado-j.json` e `qa-resultado-abcdefghi.json`. Não revisei leitor de tela (VoiceOver, TalkBack) nem aparelho real.
