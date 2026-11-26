# Tela: A01 Home — momento "sessão ao vivo", Dia 1   (história PT-### a definir pelo PO)

Componentes: `docs/design/design-system.md` · Tokens: `docs/design/tokens.json` · Agenda: D2 · Estados: `docs/design/etapa-1.html` (A01).

**Objetivo do usuário nesta tela:** em 3 segundos, de relance e com brilho baixo, saber o que está acontecendo, quanto falta e qual é o próximo compromisso; achar credencial, mapa e Wi-Fi sem procurar. Não ser puxado para fora da palestra.

**Contexto do exemplo:** Porto Alegre, Dia 1, **11h20**. Aluno VIP: Rafael Moura (Moura Café Torrefação). Grade do Dia 1 (títulos de exemplo, a confirmar com o time do evento):

| Horário | Bloco |
|---|---|
| 9h00 | Abertura — Wendell Carvalho |
| 9h30–10h30 | Palestra "O protagonista da própria história" — Wendell Carvalho |
| 10h30–10h45 | Intervalo |
| **10h45–12h30** | **Palestra "Mentalidade de dono" — Wendell Carvalho (ao vivo)** |
| 12h30–13h30 | Almoço |
| 13h30–15h40 | "Liderança que multiplica" — Karina Peloi Carvalho (dinâmica em dupla às 14h) |
| 15h40–15h55 | Intervalo |
| 15h55–19h00 | "Plano de 90 dias" e encerramento |

## Layout (de cima para baixo, 390×844, margem 20, gap 12)

```
┌────────────────────────────────────────┐
│ Bom dia, Rafael          [Sino 3] [QR] │ TopBar + brilho radial dourado
│ Dia 1 · Porto Alegre                   │
├────────────────────────────────────────┤
│ [!] Agenda atualizada                › │ StatusBanner (agenda)
│   Dinâmica em dupla passou para 14h    │
├────────────────────────────────────────┤
│ ● Ao vivo · Plenária                   │ LiveCard (full)
│ Mentalidade de dono                    │
│ (◯) Wendell Carvalho                   │
│ ▓▓▓▓▓▓▓░░░░░░░░░░░░░                  │
│ Começou às 10h45 · 35 de 105 min       │
│ Ver sessão                             │
├───────────────────┬────────────────────┤
│ A seguir          │ [QR]               │ half + square
│ Almoço            │ Credencial         │
│ 12h30 · em 1h10   │ Setor VIP · fila 8 │
│                   ├────────────────────┤
│                   │ [mapa] Mapa        │ square
├───────────────────┴────────────────────┤
│ [wifi] Wi-Fi  Protagon-Alunos   Copiar │ full baixo (56)
├────────────────────────────────────────┤
│ [alfinete] Avisos fixados              │ full
│ Almoço no 2º andar, pela escada B      │
│ Achados e perdidos no credenciamento   │
├────────────────────────────────────────┤
│ Conexões                               │ full (VIP)
│ 4 pedidos e 6 sugestões esperando      │
│ o almoço                               │
│ Ver agora                            › │
└────────────────────────────────────────┘
[ Agora | Trilha | Conexões | Materiais | Eu ]  TabBar (vidro)
```
(Ícones no desenho são marcadores; o app usa ícones de linha, sem emoji.)

| # | Bloco | Componente | Conteúdo de exemplo | Notas |
|---|---|---|---|---|
| 1 | Topo | TopBar (Home) | "Bom dia, Rafael" (`h2`) · "Dia 1 · Porto Alegre" (`caption`) · Sino com badge "3" · botão QR | Saudação muda: "Boa tarde" a partir de 12h. Badge conta só avisos operacionais durante a palestra. |
| 2 | Status | StatusBanner `agenda` | **Agenda atualizada** · "Dinâmica em dupla passou para 14h" · chevron | Some depois de tocado ou às 14h. Se não há mudança, o bloco não existe (a Home sobe). |
| 3 | Agora | LiveCard `live` | "Ao vivo · Plenária" · **Mentalidade de dono** · Avatar com anel verde + "Wendell Carvalho" · progresso 33% · "Começou às 10h45 · 35 de 105 min" · ghost "Ver sessão" | Único elemento com `glow.live`. Às 12h20 entra a variante `ending`: "Termina às 12h30". |
| 4 | Próximo | Card `half` | Rótulo "A seguir" · **Almoço** (`h2`) · "12h30 · em 1h10" (Countdown inline, `body-strong`) · `caption` "Volte ao salão às 13h20" | Toque abre a Trilha rolada até o bloco. |
| 5 | Atalho | Card `square` Credencial | Ícone QR `gold.500` · "Credencial" · `caption` "Setor VIP · fila 8" | 1 toque para G01; funciona offline. |
| 6 | Atalho | Card `square` Mapa | Ícone mapa · "Mapa" · `caption` "Você está na Plenária" | Abre A04 com o setor destacado. |
| 7 | Atalho | Card `full` baixo, Wi-Fi | Ícone Wi-Fi · "Wi-Fi" · `caption` "Protagon-Alunos" · ghost "Copiar senha" | Copiar direto, sem abrir sheet (1 toque). Toque no resto do card abre A05 (sheet com rede e senha). |
| 8 | Avisos | Card `pinned` | "Avisos fixados" · "Almoço no 2º andar, pela escada B" · "Achados e perdidos no credenciamento" | Máximo 2 linhas visíveis; "Ver todos (3)" se houver mais. Toque abre o aviso em sheet. |
| 9 | Conexões | Card `default` (VIP/Diamond) | "Conexões" · "4 pedidos e 6 sugestões esperando o almoço" · ghost "Ver agora" | Sem badge vermelho, sem pulso (P7). O aluno pode entrar se quiser, mas nada empurra. Na variante Executivo, ver abaixo. |
| 10 | Navegação | TabBar | Agora ativo | Badge de Conexões oculto durante a palestra. |

Ordem do bento justificada: o que muda a cada minuto (status, agora, próximo) em cima; atalhos de uso rápido no meio, ao alcance do polegar; o que pode esperar (avisos, Conexões) por último.

### Variações por ingresso
| Ingresso | Diferença |
|---|---|
| VIP | Como acima. Credencial: "Setor VIP · fila 8". |
| Diamond | Igual ao VIP. Credencial: "Setor Diamond · fila 2" e TierBadge Diamond. Card Conexões igual (sem destaque extra na Home). |
| Executivo | Credencial "Setor Executivo · fila 21". Bloco 9 vira **o único teaser com cadeado** (LockedPreview `tile`): miniaturas borradas de 3 cards + painel sólido com cadeado `gold.200`, "Conexões", "214 participantes desta edição já estão se conectando", ghost "Conhecer". Toque abre a aba C00 (não abre convite). Nenhum outro bloco da Home tem cadeado. |

### Outros momentos (notas curtas; specs completas na Etapa 3)
| Momento | O que muda |
|---|---|
| Antes do evento | No lugar do LiveCard: Countdown "Faltam 3 dias" + checklist (credencial na Wallet, perfil de Conexões, como chegar, estacionamento). Conexões abertas com selo "Proposta" (D8). |
| Intervalo (10h30) | StatusBanner `intervalo` "Intervalo · volte às 10h45" + Countdown no topo; LiveCard dá lugar a "A seguir: Mentalidade de dono, 10h45". Card Conexões sobe para logo abaixo do banner, com badge. Atalho direto para a tela cheia A02. |
| Almoço (12h30) | Banner "Almoço até 13h30 — volte ao salão às 13h20"; card "Onde comer" (A03) entra no lugar de "A seguir"; Conexões sobe com encontro marcado ("Ponto C, 13h00 com Diego Fagundes"). Às 13h20, banner `volte-agora` + háptico. |
| Fim do dia (19h) | LiveCard vira resumo "Dia 1 concluído · 5 de 5 sessões"; card NPS do dia (U04); "Amanhã às 9h"; Conexões com "Anote quem você conheceu hoje". |
| Depois do evento | Resumo da jornada, materiais, Minha rede (90 dias, D7), NPS final, "Indique o Protagon". |

## Interações
| Ação | Resultado |
|---|---|
| Tocar Sino | Abre G02 Notificações (filtro Avisos selecionado durante a palestra). |
| Tocar QR (topo ou card) | Abre G01 Credencial em tela cheia, brilho máximo. |
| Tocar StatusBanner agenda | Abre a Trilha (T01) rolada até o bloco das 13h30, com o item alterado destacado em `warning`. O banner some da Home. |
| Tocar LiveCard / "Ver sessão" | Abre T02 Detalhe da sessão (estado ao vivo, com "Minhas anotações"). |
| Tocar "A seguir" | Abre a Trilha no bloco Almoço. |
| "Copiar senha" (Wi-Fi) | Copia; Toast "Senha do Wi-Fi copiada"; háptico leve. |
| Tocar Conexões (VIP) | Abre C02 Sugestões. |
| Tocar teaser (Executivo) | Abre C00 (a aba). Convite de upgrade só ao tocar "Conectar" dentro dela. |
| Puxar para atualizar | Atualiza agenda e avisos; spinner nativo; sem internet, Toast "Sem internet. Mostrando a agenda salva às 11h02." |

## Estados
| Estado | Comportamento |
|---|---|
| Carregando (1ª abertura do dia) | Skeleton dos blocos 3–6 na mesma geometria; TopBar e TabBar já reais. Com cache, nunca mostra skeleton: mostra o cache e atualiza por baixo. |
| Vazio | Não se aplica no momento ao vivo. Sem sessão no horário (ex.: atraso), o topo mostra "A seguir" com "Começa em instantes" em vez do LiveCard. |
| Erro (falha ao atualizar) | Mantém o conteúdo salvo; `caption` no LiveCard "Atualizado às 11h02"; nada de tela de erro. |
| Sem internet | StatusBanner `offline` substitui o banner de agenda (prioridade). Progresso e Countdown seguem pelo relógio local. Credencial, mapa, Wi-Fi e avisos fixados vêm do cache. Card Conexões: "Conexões voltam quando a internet voltar" (desabilitado, sem cadeado). Ao reconectar: banner `reconectado` por 3 s. |
| Agenda atualizada | Bloco 2 (descrito acima). |
| Notificação nova durante a palestra | Só aviso operacional: badge do sino sobe, sem Toast. Demais avisos esperam o intervalo. |
| Permissão de notificação negada | Sem diferença na Home (o pedido é na Trilha, D1). |

## Microcopy final
| Local | Texto |
|---|---|
| Saudação | "Bom dia, Rafael" / "Boa tarde, Rafael" / "Boa noite, Rafael" |
| Linha de contexto | "Dia 1 · Porto Alegre" |
| Pílula ao vivo | "Ao vivo" |
| Progresso | "Começou às 10h45 · 35 de 105 min" |
| Final da sessão | "Termina às 12h30" |
| A seguir | "A seguir" · "Almoço" · "12h30 · em 1h10" · "Volte ao salão às 13h20" |
| Credencial | "Credencial" · "Setor VIP · fila 8" |
| Mapa | "Mapa" · "Você está na Plenária" |
| Wi-Fi | "Wi-Fi" · "Protagon-Alunos" · "Copiar senha" · Toast "Senha do Wi-Fi copiada" |
| Banner agenda | "Agenda atualizada" · "Dinâmica em dupla passou para 14h" |
| Banner offline | "Sem internet. Agenda, mapa e credencial funcionam normalmente." |
| Reconectado | "Conectado de novo" |
| Avisos | "Avisos fixados" · "Ver todos (3)" |
| Conexões VIP | "Conexões" · "4 pedidos e 6 sugestões esperando o almoço" · "Ver agora" |
| Conexões offline | "Conexões voltam quando a internet voltar" |
| Teaser Executivo | "Conexões" · "214 participantes desta edição já estão se conectando" · "Conhecer" |
| Atualizado | "Atualizado às 11h02" |

Plural: "1 pedido", "4 pedidos"; "1 sugestão", "6 sugestões". Sem pedidos e sem sugestões: "Novas sugestões no almoço".

## Acessibilidade
- Ordem de leitura: TopBar (saudação, Notificações, Credencial) → banner → Ao vivo → A seguir → Credencial → Mapa → Wi-Fi → Avisos → Conexões → TabBar. Igual à ordem visual.
- Título da tela para leitor: "Agora" (`role="heading"`, oculto visualmente; a saudação é lida em seguida).
- Rótulos: LiveCard "Ao vivo na Plenária: Mentalidade de dono, com Wendell Carvalho. 35 de 105 minutos."; A seguir "A seguir: almoço às 12h30, daqui a 1 hora e 10 minutos."; teaser "Conexões, bloqueado no seu ingresso. 214 participantes já estão se conectando. Conhecer."
- Contraste: todos os pares desta tela estão na tabela do design system (pior caso usado: `text.secondary` em `surface.2`, 7,33:1). Nenhum texto `tertiary` em `surface.3`.
- Alvos: atalhos 169×112; "Copiar senha" com alvo 48; Sino e QR 48.
- Fonte 200%: bento vira coluna única (todos `full`), títulos quebram em até 3 linhas; nada tem altura fixa exceto os atalhos `square`, que passam a `auto`.
- Movimento: só o ponto ao vivo pulsa; com redução de movimento fica estático.

## Movimento
| Gatilho | Propósito | Propriedade | Duração | Reduzido | Háptico |
|---|---|---|---|---|---|
| Ponto "Ao vivo" | Estado | opacity | pulse 1800 | estático | — |
| Progresso (a cada 60 s) | Estado | scaleX | base | sem animação | — |
| Banner entra/sai | Explicar | opacity + translateY 8 | base | opacity | — |
| Toque em card | Feedback | scale 0,97 | fast | fundo | — |
| Volte agora (13h20, outro momento) | Alertar | banner warning | base | opacity | warning, 1 vez |

## Diferenças Android x iOS
- Live Activity / Dynamic Island só iOS; no Android, notificação contínua equivalente (fora desta tela).
- "Voltar" do Android na Home: comportamento do sistema (sai do app); não interceptar.

## Eventos de analytics (validar com o PO)
`home_viewed {moment, tier}` · `home_card_tapped {card: live|next|credential|map|wifi|pinned|connections|teaser}` · `wifi_password_copied` · `agenda_banner_tapped` · `locked_teaser_tapped {source: home}` (entra na métrica de conversão do cadeado).
