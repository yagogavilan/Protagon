# Tela: C00 Conexões com cadeado (Executivo)   (história PT-### a definir pelo PO)

Componentes: `docs/design/design-system.md` (LockedPreview, BottomSheet, Button) · Regras: brief §3, CLAUDE.md regra 4 · Decisão: D3 (duas saídas).

**Objetivo do usuário nesta tela:** entender, sem se sentir pressionado, o que são as Conexões, que elas existem de verdade nesta edição e o que fazer se quiser participar. Poder ignorar e seguir o evento sem nenhum incômodo.

**Objetivo do negócio:** tornar visível o valor do VIP no momento em que o aluno demonstra interesse (tocou na aba), sem paywall na abertura.

**Contexto do exemplo:** Porto Alegre, Dia 1, almoço 12h40. Aluna Executivo: Juliana Alves, Alves Estética. 214 perfis de Conexões ativos nesta edição (VIP + Diamond) — número real no app, fictício no mockup.

## Layout (de cima para baixo)

```
┌────────────────────────────────────────┐
│ Conexões              [Sino] [QR]      │ TopBar
├────────────────────────────────────────┤
│ Conexões                       [cad.]  │ h1 + cadeado gold.200 (decorativo)
│                                        │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ LockedPreview: 3 PersonCards
│ ░░ [██████]  ░░░░░░░░░░░░  ░░░░░░░░░ ░ │ reais, desfocados, empilhados
│ ░░ ░░░░░░░░░░░░░░░  (●)  ░░░░░░░░░░░ ░ │ com leve deslocamento
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │ (aria-hidden)
│ ┌────────────────────────────────────┐ │
│ │ [cadeado]                          │ │ painel SÓLIDO surface.2
│ │ 214 participantes                  │ │ h1 tabular
│ │ desta edição já estão se conectando│ │ body
│ │                                    │ │
│ │ Conexões fazem parte do ingresso   │ │ body text.secondary
│ │ VIP.                               │ │
│ │ ─────────────────────────────────  │ │
│ │ [i] Sugestões de pessoas com       │ │ 3 benefícios
│ │     interesses em comum            │ │
│ │ [i] Contatos liberados só quando   │ │
│ │     os dois aceitam                │ │
│ │ [i] Encontros marcados nos         │ │
│ │     intervalos                     │ │
│ │ ┌────────────────────────────────┐ │ │
│ │ │       Quero me conectar        │ │ │ primário (terço inferior)
│ │ └────────────────────────────────┘ │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
[ Agora | Trilha | Conexões(cad.) | Materiais | Eu ]
```

| # | Bloco | Componente | Conteúdo | Notas |
|---|---|---|---|---|
| 1 | Topo | TopBar | Sino · QR | Igual às outras abas: o Executivo continua com credencial e avisos a 1 toque. |
| 2 | Cabeçalho | `h1` + ícone | "Conexões" + cadeado 24 `gold.200` | Sem sub-navegação (não há o que navegar). |
| 3 | Prévia | LockedPreview `tab` (área ~ 240 de altura) | 3 PersonCards reais da edição, em miniatura, `blur 16` + véu 0,72 | Nada legível: nem nome, nem empresa, nem rosto. No mockup, imagens já borradas na origem (fictícias). No app real, o servidor envia só miniatura desfocada, sem texto (design-system.md F2). Não é tocável. |
| 4 | Painel | Card `emphasis` sólido `surface.2`, borda `border.gold`, raio lg, padding 20 | Cadeado · **"214 participantes"** (`h1`, tabular) · "desta edição já estão se conectando" · "Conexões fazem parte do ingresso VIP." · 3 benefícios · botão | Sobreposto à parte de baixo da prévia (margem negativa 48), para a prévia "continuar" atrás. Nenhum texto fica sobre a área borrada. |
| 5 | Benefícios | Lista com ícone de linha 24 `gold.500` + `body` | ver microcopy | Exatamente 3. Sem preço, sem "exclusivo", sem urgência. |
| 6 | Ação | Button primário, largura total, altura 52 | **"Quero me conectar"** | É o "Conectar" desta tela (rótulo do brief §3). Único ponto que abre o convite. |
| 7 | Navegação | TabBar | Conexões ativa, ícone com cadeado | — |

**Sobre o contador (crítico):** o brief sugere "38 pessoas com interesses parecidos com os seus", mas o Executivo não tem perfil de Conexões, então não há interesses dele para comparar e o número não seria real. Usamos o total real de perfis ativos da edição. Se o segmento do aluno vier da compra, acrescentamos uma segunda linha real: "41 deles são de saúde e beleza". Registrado em design-system.md F1.

## Convite de upgrade (BottomSheet `auto`, só ao tocar "Quero me conectar")

```
┌────────────────────────────────────────┐
│              ────                      │
│ Libere as Conexões                 [X] │ h2
│                                        │
│ Com o ingresso VIP você recebe         │ body
│ sugestões de pessoas com interesses    │
│ em comum, envia até 15 pedidos por dia │
│ e marca encontros nos intervalos.      │
│                                        │
│ ┌────────────────────────────────────┐ │
│ │       Ver upgrade para VIP         │ │ primário -> checkout simulado
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │   Falar com o time no estande      │ │ secundário -> mapa (estande)
│ └────────────────────────────────────┘ │
│              Agora não                 │ ghost -> fecha
└────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Saída 1 (D3) | "Ver upgrade para VIP" → página de checkout **simulada** no mockup, com faixa "Simulação: nenhum pagamento é feito". Exige internet. |
| Saída 2 (D3) | "Falar com o time no estande" → A04 Mapa com o estande destacado e `caption` "Estande Protagon · ao lado do Ponto B" (D6). Funciona offline. |
| Fechar | X, "Agora não", toque no véu, arrastar para baixo, voltar do Android. Quatro jeitos, sempre. |
| Preço | Não exibido no convite `[HIPÓTESE]`: valor e forma de upgrade são decisão da diretoria (brief §8). Se aprovado, entra como linha `body-strong` acima dos botões. |
| Frequência | O convite nunca abre sozinho: nem na abertura do app, nem ao entrar na aba, nem por push. Depois de fechado, só reabre se a pessoa tocar de novo. |

## Interações
| Ação | Resultado |
|---|---|
| Abrir a aba Conexões | Mostra C00 direto, sem pop-up. |
| Tocar na prévia borrada | Nada (não é alvo; evita "armadilha" de convite). |
| Quero me conectar | Abre o convite. Háptico: nenhum. |
| Ver upgrade para VIP | Fecha o sheet e abre o checkout simulado (tela cheia com voltar). Voltar do checkout retorna à C00. |
| Falar com o time no estande | Fecha o sheet e abre o Mapa no estande. |
| Agora não / X / véu | Fecha. Volta à C00 exatamente como estava. Sem Toast. |
| Ler QR de outra pessoa (vindo de outro lugar, C10) | Cai nesta tela (etapa-1: "Executivo cai em C00"). |

## Estados
| Estado | Comportamento e microcopy |
|---|---|
| Prévia + contador (padrão) | Como acima. |
| Convite aberto | Sheet sobre a C00; véu `bg.base` 60%. |
| Convite fechado | C00 inalterada. |
| Carregando | Prévia em skeleton (`surface.3`, sem blur); painel já com texto e botão; contador como skeleton de 1 linha. |
| Contador indisponível ou baixo (< 20 perfis, por exemplo antes da abertura) | Esconde o número: "Participantes VIP e Diamond desta edição já estão se conectando." Nunca mostrar número inventado ou arredondado para cima. |
| Sem internet | Prévia e contador do cache, com `caption` "Atualizado às 12h31". No convite, "Ver upgrade para VIP" desabilitado com `caption` "Precisa de internet"; "Falar com o time no estande" segue ativo. |
| Erro ao carregar a prévia | Mostra só o painel (sem prévia). Nada de tela de erro: a mensagem continua útil. |
| Upgrade concluído (simulado pelo painel de demo) | Aba perde o cadeado e abre C01 Ativar perfil com "Seu ingresso agora é VIP. Ative seu perfil em menos de 1 minuto." |

## Microcopy final
| Local | Texto |
|---|---|
| Título | "Conexões" |
| Contador | "214 participantes" / "desta edição já estão se conectando" |
| Contador por segmento (se houver dado real) | "41 deles são de saúde e beleza" |
| Linha neutra | "Conexões fazem parte do ingresso VIP." |
| Benefício 1 | "Sugestões de pessoas com interesses em comum" |
| Benefício 2 | "Contatos liberados só quando os dois aceitam" |
| Benefício 3 | "Encontros marcados nos intervalos" |
| Botão | "Quero me conectar" |
| Sheet título | "Libere as Conexões" |
| Sheet corpo | "Com o ingresso VIP você recebe sugestões de pessoas com interesses em comum, envia até 15 pedidos por dia e marca encontros nos intervalos." |
| Saídas | "Ver upgrade para VIP" · "Falar com o time no estande" · "Agora não" |
| Offline | "Precisa de internet" |
| Checkout simulado | "Simulação: nenhum pagamento é feito" |

Proibido nesta tela: "exclusivo", "não perca", "últimas vagas", "você está perdendo", contagem regressiva de oferta, preço riscado, qualquer menção a namoro.

## Acessibilidade
- Prévia borrada: `aria-hidden="true"`; o leitor começa no título, lê o painel inteiro e o botão.
- Rótulo do painel: "Bloqueado no seu ingresso. 214 participantes desta edição já estão se conectando. Conexões fazem parte do ingresso VIP." Lista de benefícios como lista.
- Ícone da aba: "Conexões, bloqueado no seu ingresso".
- Sheet: `role="dialog"`, foco no título, X com rótulo "Fechar convite", voltar fecha. Foco volta para "Quero me conectar".
- Contraste: todo texto em `surface.2` sólido (`text.secondary` 7,33:1); nenhum texto sobre o véu (lá seria 3,96:1 sobre foto clara).
- Alvos: botões 52 de altura, largura total; X 48.

## Movimento
| Gatilho | Propósito | Propriedade | Duração | Reduzido | Háptico |
|---|---|---|---|---|---|
| Entrada da tela | — | nenhuma (troca de aba não anima) | — | — | — |
| Sheet do convite | Continuidade | translateY + véu | slow | opacity | — |
Sem brilho pulsando no cadeado, sem shimmer na prévia: o cadeado convida pela informação, não pelo movimento.

## Diferenças Android x iOS
iOS: checkout por link externo pode ter restrição de loja para venda de benefício digital dentro do app `[HIPÓTESE: validar com o tech-lead/PO antes do app real]`; a saída "estande" cobre esse risco. No mockup não se aplica.

## Eventos de analytics (validar com o PO)
`locked_area_viewed {source: tab|home_teaser|qr}` · `upgrade_invite_opened` · `upgrade_checkout_tapped` · `upgrade_booth_tapped` · `upgrade_invite_dismissed {method: x|not_now|scrim|swipe|back}`. Métrica do brief: conversão de upgrade pelo cadeado = checkout iniciado / `locked_area_viewed` únicos.
