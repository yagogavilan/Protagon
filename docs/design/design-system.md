# Design system — App Protagon (Etapa 2)

Data: 2026-11-26 · Dono: product-designer · Tokens: `docs/design/tokens.json` (fonte única; nada de valor solto no código) · Escopo: Fase 1, mockup 390×844, tema escuro único.

## 1. Princípios

| # | Princípio | Regra prática |
|---|---|---|
| P1 | **Dark-first, 4 superfícies** | `bg.base` → `surface.1` (tile) → `surface.2` (card em foco, sheet) → `surface.3` (chip, campo, pressionado). Profundidade vem de borda 1px + `shadow.card`, não de cor chapada. Nunca pular dois níveis (ex.: `surface.3` direto no `bg.base`). |
| P2 | **Dourado é luz, não tinta** | Dourado aparece como borda 1px, anel, ícone ativo, brilho radial e selo pequeno. Nunca como fundo de bloco de texto e nunca com texto branco. Selo dourado sempre com `text.on-gold` (#020111). Um `glow.gold` por tela. |
| P3 | **Verde é ação e "ao vivo"** | O gradiente verde é reservado ao botão primário. `state.live` só para "acontecendo agora" e sucesso. Um botão primário por tela visível. |
| P4 | **Vidro só em tab bar e bottom sheets** | Nenhum card, banner ou TopBar com blur. Com "reduzir transparência" ligado: fundo sólido (`glass.fallback`). |
| P5 | **Legibilidade de auditório** | Sala escura, brilho baixo, olhar de 3 segundos. Informação de agora em `h1`/`display`; horários sempre com `tabular-nums`; corpo ≥ 16; `caption` (13) só para metadado que não exige ação. Ações principais no terço inferior (acima da tab bar). |
| P6 | **Cor nunca sozinha** | Todo estado tem ícone + texto: "Ao vivo", "Faltam 5 min", "Sem internet", "Afinidade alta". |
| P7 | **Silêncio durante a palestra** | Em sessão ao vivo, nada de toast, badge pulsando ou card que convida a sair da palestra. Conexões aparecem como "esperando o intervalo". |

### Contraste calculado (WCAG 2.x, luminância relativa)

| Par | bg.base | surface.1 | surface.2 | surface.3 | Uso permitido |
|---|---|---|---|---|---|
| text.primary #F5F3EE | 18,66 | 17,19 | 15,75 | 14,30 | Tudo |
| text.secondary #A8A6B8 | 8,68 | 8,00 | 7,33 | 6,65 | Tudo |
| text.tertiary #8A8899 | 5,97 | 5,50 | 5,04 | **4,58** | Só metadado; evitar em `surface.3` |
| gold.500 #CC8F4E (texto/ícone) | 7,49 | 6,90 | 6,33 | 5,74 | Texto curto, ícone, borda |
| gold.200 #F0CE99 | 13,79 | 12,70 | 11,64 | 10,56 | Cadeado, link |
| state.live #33EC74 | 13,19 | 12,15 | 11,14 | 10,11 | Texto e ícone |
| state.warning #FFB547 | 11,78 | 10,85 | 9,94 | 9,02 | Texto e ícone |
| state.danger #FF5C6C | 6,90 | 6,35 | 5,82 | 5,28 | Texto e contorno |
| state.info #5AB8FF | 9,59 | 8,84 | 8,10 | 7,35 | Texto e ícone |
| border.strong #6B6994 | 4,01 | 3,70 | 3,39 | 3,08 | Limite de controle (≥ 3:1) |
| border.subtle (12% gold) | 1,21 | 1,26 | 1,29 | 1,31 | **Só decorativo** |

| Texto #020111 sobre | Razão | Texto branco sobre | Razão |
|---|---|---|---|
| verde #33EC74 → #1FCF58 | 13,19 → 9,97 | verde | 1,57 a 2,07 (proibido) |
| gold.500 → gold.200 | 7,49 → 13,79 | gold.500 | 2,76 (proibido) |
| tier.executivo #A8A6B8 | 8,68 | danger #FF5C6C | **3,00 (falha)** |
| diamond (#F0CE99/#FFF/#5AB8FF) | ≥ 9,59 | — | — |

Consequências (problemas encontrados, valores do brief mantidos):
1. **Botão destrutivo** não pode ser vermelho com texto branco (3,00:1). Regra: destrutivo é contorno `state.danger` + texto `state.danger` sobre superfície (5,28:1+); preenchido só na confirmação final, com texto #020111 (6,90:1).
2. **`border.subtle` não delimita controle.** Campo, chip selecionável e botão secundário usam `border.strong`.
3. **`glass.nav` 0,72** passa sobre conteúdo escuro, mas sobre foto clara rolando por baixo o rótulo inativo cai para 3,45:1. Alternativa calculada: alpha **0,84** (5,24:1). Não troquei; ver Pontos para o fundador.
4. **`state.locked.overlay` 0,72** sobre foto clara borrada deixa `text.secondary` em 3,96:1. Regra: nenhum texto em cima da área borrada; o texto do cadeado fica em painel sólido `surface.2`.
5. **Trilho de progresso**: `surface.3` sobre `surface.2` dá 1,10:1 (invisível). Trilho usa `border.strong` (3,39:1), e o progresso sempre tem texto ("35 de 105 min").
6. Estados em fundo tingido (`state.tint.*`, 14%): pior caso danger 4,88:1, aprovado.

## 2. Motion e háptico

| Gatilho | Propósito | Propriedade | Duração | Reduzido | Háptico |
|---|---|---|---|---|---|
| Pressionar botão/card | Feedback | scale 0,97 + fundo `surface.3` | fast 120 | só fundo | — |
| Ponto "ao vivo" | Estado | opacity 1 ↔ 0,35 | pulse 1800, loop | estático | — |
| Barra de progresso | Estado | scaleX, atualiza a cada 60 s | base 200 | salto sem animação | — |
| Countdown | Estado | troca de número sem animação | — | igual | — |
| Faltam 5 min (intervalo/almoço) | Alertar | banner muda para `warning`, fade | base 200 | fade | aviso (notification warning), 1 vez |
| BottomSheet abrir/fechar | Continuidade | translateY + véu opacity | slow 320 | só fade | — |
| Toast | Confirmar | translateY 8 + opacity | base 200 | fade | conforme ação |
| Conectar (pedido enviado) | Confirmar | card sai: translateX -24 + opacity; próximo entra opacity | base 200 | fade | impacto leve |
| Agora não | Feedback | igual a Conectar, sem háptico | base 200 | fade | — |
| Conexão aceita | Celebrar sóbrio | anel dourado 1 pulso no avatar | slow 320 | sem pulso | sucesso |
| Check-in (credencial lida) | Confirmar | check verde, fade | base 200 | igual | sucesso |
| Agenda atualizada | Explicar | banner entra com fade; bloco alterado na Trilha com borda `warning` | base 200 | igual | — |
| Troca de aba | — | sem animação (ação frequente) | — | — | seleção leve |

Regras: easing único `cubic-bezier(.2,.8,.2,1)`; só `transform`/`opacity`; tudo interrompível; um momento orquestrado por tela (Home: o anel ao vivo). Sem confete, sem corações, sem "explosão" ao conectar. Háptico nunca é o único feedback. No mockup web, háptico é simulado com `navigator.vibrate` quando houver, e um rótulo no painel de demo.

## 3. Componentes

Convenções: todo componente tocável tem alvo ≥ 48×48, estado de foco visível (anel 2px `gold.200`, offset 2), `aria-label` quando é só ícone. Estados padrão de todo tocável: **padrão, pressionado, foco, desabilitado** (opacity 0,4, sem toque, `aria-disabled`); os extras estão na linha de cada um.

### TopBar
| Item | Spec |
|---|---|
| Anatomia | Altura 56 + safe area. Esquerda: título da tela (`h1`) ou, na Home, saudação "Bom dia, Rafael" (`h2`) + linha `caption` "Dia 1 · Porto Alegre". Direita: botão Sino (48) e botão QR (48), gap 4. Fundo transparente sobre `bg.base` com `glow.radial-top` na Home. Sem blur (P4). |
| Sino | Ícone 24 `text.primary`. Badge: círculo 18, fundo `state.danger`, texto #020111 `caption` 600, tabular ("3", "9+"). Durante sessão ao vivo, só avisos operacionais contam no badge. `aria-label="Notificações, 3 não lidas"`. |
| QR | Ícone QR 24 em botão `surface.1` raio md, borda `border.gold`. Abre G01 Credencial (1 toque). `aria-label="Abrir credencial"`. |
| Estados | normal · rolado (fundo vira `bg.base` sólido com borda inferior `border.subtle`) · offline (QR continua ativo; sino sem badge novo). |

### TabBar
| Item | Spec |
|---|---|
| Anatomia | Altura 64 + safe area 34. Fundo `glass.nav`, borda superior `border.subtle`. 5 itens iguais: **Agora, Trilha, Conexões, Materiais, Eu**. Ícone 24 + rótulo `caption`. |
| Ativo | Ícone e rótulo `gold.200`, indicador pill 32×4 `gold.500` acima do ícone. `aria-selected="true"`. |
| Inativo | Ícone e rótulo `text.secondary`. |
| Conexões / Executivo | Ícone de Conexões com cadeado 12 `gold.200` sobreposto no canto superior direito. Rótulo continua "Conexões". `aria-label="Conexões, bloqueado no seu ingresso"`. Toque abre C00 (nunca um pop-up). |
| Conexões / VIP | Badge numérico (pedidos recebidos) igual ao do sino, mas **só aparece no intervalo/almoço** (P7). |
| Reduzir transparência | `glass.fallback`. |

### Card / BentoTile
| Item | Spec |
|---|---|
| Anatomia | `surface.1`, borda 1px `border.subtle`, raio lg, `shadow.card`, padding 16. Cabeçalho opcional: ícone 16 + rótulo `caption` `text.secondary`. Corpo livre. Rodapé opcional com ação. |
| Tamanhos (bento, 2 colunas de 169, gap 12) | `full` 350×auto · `half` 169×auto · `square` 169×112 (atalho). |
| Variantes | `default` · `emphasis` (`surface.2`, borda `border.gold`) · `locked` (ver LockedPreview) · `pinned` (aviso fixado: ícone de alfinete `gold.500`). |
| Estados | padrão · pressionado (scale 0,97 + `surface.3`) · carregando (skeleton: blocos `surface.3`, opacity pulsando 0,5 ↔ 0,8) · offline (conteúdo em cache + `caption` "Atualizado às 11h02"). |
| A11y | Card inteiro é um alvo com rótulo único ("Mapa do local, abrir"); ações internas continuam alcançáveis. |

### LiveCard
| Item | Spec |
|---|---|
| Anatomia | Card `full`, `surface.2`, borda 1px `state.live` + `glow.live`. Linha 1: pílula "Ao vivo" (ponto 8 pulsando + texto `caption` 600 `state.live`) + local `caption` `text.secondary` ("Plenária"). Título da sessão `h1` (até 2 linhas). Palestrante: Avatar sm + nome `body-strong` + papel `caption`. Barra de progresso (altura 6, raio pill, trilho `border.strong`, preenchimento `state.live`). Linha `caption` tabular: "Começou às 10h45 · 35 de 105 min". Ação ghost "Ver sessão". |
| Anel ao vivo | Avatar do palestrante com anel 2px `state.live` (gap 2px). É o único "momento orquestrado" da Home. |
| Variantes | `live` (acima) · `ending` (≤ 10 min: progresso e texto mudam para `state.warning`, "Termina às 12h30") · `break` (substituído por StatusBanner + tela cheia A02). |
| Estados | carregando (skeleton) · offline (progresso calculado pelo relógio local; continua andando) · sem sessão (não renderiza; Home mostra "Próximo" no topo). |
| A11y | `role="group"` com rótulo "Ao vivo: Mentalidade de dono, Wendell Carvalho, 35 de 105 minutos". Progresso: `role="progressbar"` com `aria-valuenow`. Atualização silenciosa (sem live region por minuto). |

### StatusBanner
| Item | Spec |
|---|---|
| Anatomia | Faixa `full`, raio md, fundo `state.tint.<tipo>`, borda 1px na cor do estado a 35%, padding 12/16. Ícone 24 + texto `body-strong` + complemento `body` `text.secondary` + ação opcional (ghost) ou chevron. Altura mín. 56. |
| Variantes | `intervalo` (info): "Intervalo · volte às 10h45" + Countdown inline · `almoço` (info): "Almoço até 13h30 — volte ao salão às 13h20" · `volte-agora` (warning): "Faltam 5 min. Volte ao salão" + "Ver meu setor" · `agenda` (warning): "Agenda atualizada: dinâmica em dupla passou para 14h" + "Ver" · `offline` (info): "Sem internet. Agenda, mapa e credencial funcionam normalmente." · `reconectado` (live, some em 3 s). |
| Regras | Um banner por vez; prioridade: volte-agora > offline > intervalo/almoço > agenda. Offline fica fixo no topo do conteúdo (z banner), não cobre a TopBar. |
| A11y | `role="status"` (`aria-live="polite"`); volte-agora usa `role="alert"` uma vez. |

### Countdown
| Item | Spec |
|---|---|
| Anatomia | Número + unidade. Inline: `body-strong` "em 1h10" / "em 12 min". Destaque (tela cheia A02, card A seguir): `display` "12:48" (mm:ss) ou "1h10". `tabular-nums` obrigatório. |
| Regra de formato | > 60 min: "1h10"; 10–60 min: "38 min"; < 10 min: "mm:ss" (atualiza por segundo só em tela cheia; nos cards, por minuto). |
| Cores | padrão `text.primary`; ≤ 5 min `state.warning` + ícone; acabou: texto vira "Agora" `state.live`. |
| Fallback tnum | `[HIPÓTESE]` Se a Sora não expuser `tnum`, cada dígito vai numa caixa `min-width: 1ch` centralizada para não "dançar". |
| A11y | Rótulo por extenso ("faltam 12 minutos"); nunca live region por segundo; anuncia só em 5 min e 0. |

### Button
| Variante | Visual | Uso |
|---|---|---|
| Primário | `cta.bg`, texto `cta.on` #020111 `body-strong`, raio md, altura 52 (compacto 44 com alvo 48) | Uma ação principal por tela: "Conectar", "Enviar pedido", "Ver upgrade para VIP" |
| Secundário | Transparente, borda 1px `border.strong`, texto `text.primary` | Alternativa de mesmo peso: "Agora não", "Falar com o time no estande" |
| Ghost | Sem borda, texto `gold.200`, ícone opcional | Ação terciária em card: "Ver sessão", "Ver mapa" |
| Destrutivo | Borda e texto `state.danger`; confirmação final preenchida `state.danger` + texto #020111 | "Desfazer conexão", "Excluir meus dados" |

Estados: padrão · pressionado (scale 0,97; primário vira `cta.bg-pressed`) · foco · desabilitado (opacity 0,4; primário vira `surface.3` + texto `text.tertiary`, nunca verde apagado que parece ativo) · carregando (rótulo some, spinner 20 na cor do texto, largura mantida, `aria-busy`) · sucesso momentâneo (ícone check 1,2 s, só quando a ação não fecha a tela). Rótulo: verbo + objeto, até ~24 caracteres.

### Chip / Tag
| Variante | Visual |
|---|---|
| Info (estático) | `surface.3`, raio sm, `caption` `text.secondary`, altura 28 |
| Em comum | Borda 1px `gold.500`, texto `gold.200`, ícone check 12 (interesse que os dois têm) |
| Objetivo | `state.tint.gold`, texto `gold.200`, ícone alvo 16: "Busca parcerias" |
| Filtro (selecionável) | Altura 36 (alvo 48), borda `border.strong`; selecionado: borda `gold.500`, fundo `state.tint.gold`, check; `aria-pressed` |
| Proposta | Borda tracejada `border.strong`, texto `text.secondary` "Proposta" — marca recursos não aprovados pela diretoria (D8, Diamond) |
| Sub-navegação (segmentado) | Ver C02: pill `surface.1`, item ativo `surface.3` + texto `text.primary`, contador tabular |

### TierBadge
| Ingresso | Fundo | Texto | Ícone |
|---|---|---|---|
| Executivo | `tier.executivo` sólido | #020111 "Executivo" | — |
| VIP | `tier.vip` (gradiente dourado) | #020111 "VIP" | — |
| Diamond | `tier.diamond` | #020111 "Diamond" | losango 12 |

Raio pill, altura 22, padding 0/8, `caption` 600. Aparece no perfil, no PersonCard e na credencial. Não é tocável. Leitor: "Ingresso VIP".

### Avatar
Círculo (`radius.pill`), tamanhos 32/48/72. Foto com `object-fit: cover`; sem foto: iniciais `body-strong` em `surface.3`. Anéis: `live` (palestrante ao vivo), `gold` (conexão aceita), nenhum no padrão. Diamond **não** ganha anel no avatar (evita leitura de "status social"; o TierBadge basta). Imagem com dimensão reservada. `alt` = nome; decorativo (`alt=""`) quando o nome está ao lado.

### PersonCard (Conexões)
Ordem obrigatória: **empresa e objetivo antes da foto**.

```
┌──────────────────────────────────────────────┐
│ [Afinidade alta]                 [Proposta?]  │  selo dourado (só alta)
│ Kessler Móveis Planejados              (h2)   │
│ Indústria moveleira · Porto Alegre  (caption) │
│ [◎ Busca parcerias] [◎ Busco clientes]        │  chips Objetivo
│ ───────────────────────────────────────────── │
│ 3 interesses em comum · vocês dois buscam     │  motivo, 1 linha (body)
│ parcerias no varejo                           │
│ [✓ Varejo] [✓ Gestão de equipes] [✓ Expansão] │  chips Em comum (+ "e mais 2")
│ ───────────────────────────────────────────── │
│ (foto 48) Renata Kessler   [VIP]              │  pessoa depois
│           Sócia-diretora                      │
│ ┌───────────────┐ ┌──────────────────────────┐│
│ │  Agora não    │ │        Conectar          ││  secundário | primário
│ └───────────────┘ └──────────────────────────┘│
└──────────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Container | `surface.2`, borda `border.subtle`, raio lg, padding 20, `shadow.card`. Na variante destaque Diamond (proposta): borda `border.gold` + `glow.gold`. |
| Selo de afinidade | Dois níveis em texto: **"Afinidade alta"** (pílula `gold.gradient`, texto #020111, ícone faísca) e "Afinidade boa" (chip info). Sem percentual (percentual lembra app de namoro e cria falsa precisão). Abaixo de "boa", a pessoa não é sugerida. |
| Motivo | Uma linha, `body`, `text.primary`; truncar com reticências em 2 linhas no máximo com fonte grande. Gerado a partir de: nº de interesses em comum + objetivo complementar. |
| Botões | Lado a lado, 40% / 60%, altura 52, sempre visíveis sem rolar (terço inferior). Deslizar é secundário e opcional (ver Pontos para o fundador): se implementado, só depois do toque, com alternativa por botão (WCAG 2.5.7). |
| Toque no card | Abre C03 Perfil da pessoa. |
| Estados | padrão · pedido enviado (botões viram texto "Pedido enviado · Pendente" `text.secondary` + "Ver perfil") · conectados (anel gold no avatar + "Conectados") · carregando (skeleton) · perfil pausado/indisponível (some da fila). |
| Proibido | Coração, estrela, "curtir", "match", percentual, foto grande no topo, foto em tela cheia. |
| A11y | Grupo: "Kessler Móveis Planejados, indústria moveleira. Renata Kessler, sócia-diretora, ingresso VIP. Afinidade alta. 3 interesses em comum, vocês dois buscam parcerias no varejo." Botões com rótulo completo: "Conectar com Renata Kessler". |

### LockedPreview
| Item | Spec |
|---|---|
| Anatomia | Camada de fundo: PersonCards reais em miniatura, desfocados (`state.locked.blur` 16) + véu `state.locked.overlay`. Sobre ela, painel **sólido** `surface.2` raio lg com: cadeado 24 `gold.200`, contador `h1` tabular, texto neutro, lista de benefícios, CTA. |
| Regras | Nenhum nome, empresa ou rosto legível (imagem chega ao app já em baixa resolução, não é só CSS). Nenhum texto sobre a área borrada (§1 item 4). Sem cronômetro, sem "última chance", sem preço riscado. |
| Variantes | `tab` (tela C00 inteira) · `tile` (card único na Home do Executivo). |
| A11y | Área borrada `aria-hidden="true"`. Painel é lido normalmente. |

### BottomSheet
| Item | Spec |
|---|---|
| Anatomia | `glass.sheet` + `shadow.sheet`, raio xl no topo, alça 36×4 `border.strong`, padding 20 (+ safe area). Título `h2` + botão fechar (X, 48) à direita. Conteúdo. Ações empilhadas no fim: primário em cima, secundário embaixo, largura total. |
| Alturas | `auto` (até 60% da tela) · `tall` (90%, com rolagem interna e ações fixas no rodapé). |
| Fechar | X, toque no véu, arrastar para baixo, Esc/voltar do Android. Sempre. |
| Véu | `bg.base` a 60%, sem blur (o blur é do próprio sheet). |
| A11y | `role="dialog"`, `aria-modal`, foco vai para o título ao abrir e volta ao gatilho ao fechar. O teclado não pode cobrir o campo focado (WCAG 2.4.11). |

### Toast
Pílula `surface.3`, borda `border.subtle`, `body` `text.primary`, ícone de estado 16, até 1 linha + ação ghost opcional ("Desfazer"). Posição: 12 acima da tab bar. Duração 4 s (6 s com ação). Uma por vez. `role="status"`. Nunca durante sessão ao vivo, exceto resposta a uma ação do próprio aluno.

### EmptyState
Ícone de linha 48 `gold.500` (sem ilustração 3D), título `h2`, texto `body` `text.secondary` (por que está vazio + próximo passo), 1 botão (secundário ou primário se for o próximo passo natural). Centralizado no espaço disponível, nunca centralizado verticalmente atrás da tab bar.

## 4. Glossário de interface (Conexões)

| Use | Não use |
|---|---|
| Conectar, conexão, pedido de conexão | match, curtir, dar like, seguir |
| Afinidade, interesses em comum | compatibilidade %, química |
| Agora não | Passar, recusar, rejeitar |
| Pendente | Recusado (D5) |
| Minha rede | Matches, favoritos |
| Ponto de Conexão A/B/C | — |
| Sugestões, Explorar, Pedidos | Descobrir pessoas, radar |

## 5. Pontos para o fundador

| # | Ponto | Por que importa | Recomendação |
|---|---|---|---|
| F1 | **Contador do Executivo: "pessoas com interesses parecidos com os seus"** (brief §3) | O Executivo não tem perfil de Conexões, então não há interesses dele para comparar. O número não seria real, e o brief exige número real. | Usar o que é real: "214 participantes desta edição já estão se conectando" (perfis VIP/Diamond ativos). Se o segmento vier da compra, acrescentar "38 deles são do varejo". Aplicado na spec C00. |
| F2 | **Prévia "real" borrada** | Desfoque em CSS é reversível: a foto e o nome reais chegariam ao aparelho de quem não tem acesso (risco LGPD e de confiança). | No app real, servidor envia só miniatura já desfocada e em baixa resolução, sem nome/empresa. No mockup, usar fotos fictícias pré-borradas. Encaminhar ao `security-engineer`. |
| F3 | **"Tinder de negócios"** (brief §5) | É a referência que a regra 2 do CLAUDE.md quer evitar. Se aparecer em pitch para a diretoria, contamina a percepção. | Nunca usar na interface nem na apresentação. Proposta de frase: "networking com hora e lugar marcados". |
| F4 | **Deslizar como gesto** ("deslizar é secundário") | Deslizar é o gesto do Tinder e o principal gatilho da leitura "app de namoro"; também exige alternativa acessível. | Tirar o deslizar do mockup. Só botões. Reavaliar com o teste de 3 pessoas. |
| F5 | **Diamond com "destaque e prioridade" nas sugestões** | Se Diamond aparece antes por pagar, a fila do VIP deixa de ser por afinidade e o valor do VIP cai; o VIP percebe "anúncio". | Destaque Diamond só na caixa de Pedidos de quem recebe (pedido Diamond fica no topo, com selo) + limite maior (D4). Não mexer na ordem das sugestões. Marcado como "proposta" na C02. |
| F6 | **`glass.nav` alpha 0,72** | Falha AA (3,45:1) no rótulo inativo quando uma foto clara rola por baixo da tab bar (Conexões, Materiais). | Subir para 0,84 (5,24:1). Visualmente quase igual. Aguardo ok para trocar o token. |
| F7 | **Fonte Sora e números tabulares** | A regra "números tabulares" depende de a Sora ter `tnum`. `[HIPÓTESE]` não confirmado. | `mobile-dev` verifica no carregamento da fonte; se não houver, aplicamos o fallback de largura fixa (Countdown) sem trocar a família. |
| F8 | **Diamond com branco puro no gradiente** | Em sala escura com brilho baixo, o branco do selo Diamond é o ponto mais claro da tela e briga com o LiveCard. | Manter no selo (é pequeno), mas não usar o gradiente Diamond em áreas grandes (fundo de card, banner). Registrado como regra. |
| F9 | **Caption 13 px** vs. "corpo ≥ 16" | Fica dentro da regra (caption não é corpo), mas é o texto que mais sofre com brilho baixo. | Caption nunca carrega horário de ação nem instrução; esses vão em `body-strong`. Aplicado nas specs. |
| F10 | **Venda do upgrade dentro do app** (D3, saída "checkout") | `[HIPÓTESE]` As lojas podem exigir compra dentro do app para liberar benefício digital (Conexões) e cobrar comissão; um link externo pode ser recusado na revisão. | Manter as duas saídas no mockup; antes do app real, `tech-lead` + PO validam a regra das lojas. A saída "estande" não tem esse risco. |
