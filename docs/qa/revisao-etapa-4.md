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
- `qa.mjs` não está em `package.json` (arquivo do dev). Sugiro `"qa": "node scripts/qa.mjs"`; hoje as seções b, c, d, e, f e i falham de propósito enquanto os achados acima não forem corrigidos.
