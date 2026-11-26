# Telas: OF01–OF04 Ofertas ao vivo   (história PT-### a definir pelo PO)

Fonte de regras: `docs/produto/prompt-grupos-ofertas-gaia.md` §2 · Componentes: `docs/design/design-system.md` (Card `emphasis`, Countdown, Button, Chip, Toast, BottomSheet, StatusBanner, EmptyState) · Códigos: `docs/design/etapa-1.html`.

**Objetivo do usuário:** no momento em que o palco apresenta o produto, entender em 10 segundos o que é, para quem é, quanto custa e até quando vale; e agir (assinar, falar com um consultor ou ignorar) sem sair da plenária de forma escandalosa. Sem pressão: o aluno decide com as informações reais e pode dizer "agora não" sem culpa.

**Contexto do exemplo:** Porto Alegre, Dia 2, **15h20**, palestra da tarde. Rafael Moura, VIP. Oferta "Olimpo" (programa de mentoria), condição válida até 18h30. Todos os valores abaixo são **fictícios**.

**Princípios de tom:** frases curtas, números exatos, nenhum adjetivo de urgência ("imperdível", "última chance", "corra"). Prazo só se for prazo real do time. Nenhum contador de vagas inventado.

## Regra mestra: nada existe antes da liberação
| Lugar | Antes de "Liberar oferta" |
|---|---|
| Home, Trilha, Materiais, Notificações, busca, Eu, deep link | Nenhum rastro: sem card, sem item, sem contagem, sem "em breve", sem estado vazio. A Trilha mostra o bloco do pitch só com o título normal da sessão. |
| OF04 "Ofertas do evento" | Não existe entrada de menu até a 1ª liberação para o ingresso do aluno. Se alguém abrir o endereço direto, volta à Home sem mensagem. |
| Dados no aparelho | O conteúdo da oferta (preço, bônus, prazo) **só chega ao aparelho na liberação**, nunca escondido por CSS. No mockup: o dado entra na store só depois do botão do painel. Mesmo princípio do F2 do design system. |
| Aluno cujo ingresso não tem a oferta | Nunca vê card nem Toast (ver "não disponível" abaixo). |

---

## OF01 Card na Home + toast discreto

### Toast (momento da liberação)
```
┌────────────────────────────────────────┐
│ [selo] Oferta do palco disponível [Ver]│ Toast, 12 acima da tab bar
└────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Texto | **"Oferta do palco disponível"** + ação ghost **"Ver"**. |
| Regras | Um por oferta. 6 s. Sem som, **sem háptico**, sem badge pulsando, sem push (só se o fundador aprovar, pergunta 6). Não cobre sheet nem teclado aberto: espera fechar. Toque na área fora da ação o dispensa. Aparece em qualquer aba. |
| Exceção registrada | Contraria o design-system (Toast "nunca durante sessão ao vivo", P7). A exceção foi aprovada no prompt e vale **só para este Toast**; precisa virar `DEC-###` (CEO). Nenhuma outra tela ganha esta exceção. |
| Notificações (G02) | Entra como item lido ("Oferta especial do palco: Olimpo"), sem somar no badge durante a palestra. |
| Sem internet | O aparelho não recebe a liberação. Ver Pontos para o fundador. |

### Card na Home
Posição: **topo**, abaixo da TopBar e de um eventual StatusBanner, **acima do LiveCard**. Altura compacta (~120) para o LiveCard continuar visível sem rolar.
```
┌────────────────────────────────────────┐
│ [selo] Oferta especial do palco        │ caption + ícone 16
│ Olimpo                                 │ h2
│ Condição válida até 18h30 · faltam 3h10│ body-strong, tabular
│ ┌────────────────────────────────────┐ │
│ │             Ver oferta             │ │ primário
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```
Variante `emphasis` (`surface.2`, `border.gold`, `glow.gold` — o único da Home; o anel ao vivo segue sendo o movimento orquestrado). Um primário na Home: este.

| Estado | Comportamento e microcopy |
|---|---|
| Antes da liberação | Nada (ver regra mestra). |
| Liberada, não vista | Card acima + Toast. |
| Vista (o aluno abriu OF02) | Card reduz para tile `default` sem brilho: "Ofertas do evento" · "Olimpo · até 18h30" → OF02. |
| "Agora não" | Igual a vista. Fica até expirar. |
| Interesse enviado | Tile: "Olimpo · interesse enviado" com ícone de check. |
| Compra concluída | Tile: "Olimpo · compra confirmada". Some no dia seguinte. |
| Duas ofertas ativas | Um só card: "2 ofertas do palco" · "Ver ofertas" → OF04. |
| Encerrada | Card some da Home; a oferta segue em OF04 (Eu → "Ofertas do evento"). |
| Não disponível para o ingresso | Nada na Home, sem Toast, sem cadeado. |
| Sem internet | Se já liberada e em cache: card normal; "Ver oferta" abre OF02 em modo offline. |
| Carregando | Skeleton do card; nunca bloqueia o resto da Home. |

---

## OF02 Tela da oferta

Tela cheia (sem tab bar) com voltar (`<`) no topo e barra de ações fixa embaixo (sólida, `surface.1`, sem blur). O texto de leitura rola; as ações ficam no terço inferior.

```
┌────────────────────────────────────────┐
│ [<]  Oferta do palco                   │ TopBar
│ [Para VIP e Diamond]                   │ chip info
│ Olimpo                                 │ h1
│ Programa de mentoria em grupo para     │ body (1 a 2 linhas)
│ donos que querem crescer com método.   │
│ ────────────────────────────────────── │
│ Para quem é                            │ h2
│ Donos de empresa com 2 ou mais anos... │ body, máx. 2 linhas
│ O que inclui                           │ h2
│ ✓ 12 encontros mensais ao vivo         │ lista, máx. 5 itens
│ ✓ Plano de ação por trimestre          │
│ ✓ Comunidade fechada de alunos         │
│ ────────────────────────────────────── │
│ Condição do evento (VIP)               │ caption
│ 12x de R$ 1.490,00                     │ display, tabular
│ Total: R$ 17.880,00 · à vista no PIX   │ body
│ R$ 15.990,00                           │
│ Preço regular: 12x de R$ 1.650,00      │ body, SEM tachado (só se for real)
│ ────────────────────────────────────── │
│ Bônus da condição do evento            │ h2
│ + Diagnóstico individual de 60 min     │
│ + Kit de materiais do Protagon         │
│ ────────────────────────────────────── │
│ Condição válida até 18h30              │ body-strong
│ Faltam 3h10                            │ Countdown
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐ │
│ │          Assinar o Olimpo          │ │ primário
│ └────────────────────────────────────┘ │
│ ┌──────────────────────┐ ┌───────────┐ │
│ │ Falar com um consultor│ │ Agora não │ │ secundário | ghost
│ └──────────────────────┘ └───────────┘ │
│ Abre o pagamento no navegador.         │ caption
└────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Ordem | Do que decide para o que detalha: produto → para quem → o que inclui → **preço e condições** → bônus → prazo. Preço total e parcelado sempre juntos, antes do botão (nada escondido). |
| Preço por ingresso | Mostra **só o preço da categoria do aluno** (VIP ou Diamond) e o chip "Para VIP e Diamond" indica quem pode. Nenhuma tabela comparativa entre ingressos. |
| Preço regular | Só aparece se o time confirmar o valor real; texto simples, sem riscado e sem "economize X%". [HIPÓTESE: dado pendente] |
| Bônus | Listados como bônus da condição do evento, com a mesma validade do prazo. |
| Prazo | Frase absoluta primeiro ("até 18h30"), contagem depois. Formato do Countdown: "Faltam 3h10" > 60 min, "Faltam 38 min" até 10 min, "mm:ss" só nos 10 últimos. **Sem mudança de cor, háptico, pulso ou aviso** ao se aproximar (a cor `warning` do Countdown padrão fica desligada aqui, para não criar pressão). Atualiza por minuto. |
| Rótulo do botão primário | Por oferta, definido pelo time: **"Assinar o Olimpo"** (assinatura) ou **"Reservar minha vaga"** (turma com vagas limitadas **reais**). "Garantir minha vaga" só se a limitação for real. Máx. ~24 caracteres. |
| Assinar | Abre checkout externo (simulado no mockup, tela "Pagamento no navegador" com "Voltar ao app"). Ao voltar: StatusBanner `info` "Estamos confirmando sua compra. Pode levar alguns minutos." e depois estado Compra concluída. O app **não afirma** compra antes da confirmação (no app real vem do webhook). |
| Falar com um consultor | Abre OF03 (sheet). |
| Agora não | Fecha a tela e volta de onde veio. Sem confirmação, sem texto de culpa. A oferta continua em OF04. Equivalente ao voltar. |
| Leitura em plenária | Tela escura, sem imagem de fundo; nenhum elemento pisca. |

| Estado | Comportamento e microcopy |
|---|---|
| Liberada (padrão) | Como acima; marca "vista" ao abrir. |
| Interesse enviado | Faixa `info` no topo: "Interesse enviado. O time comercial vai falar com você." (data de envio em `caption`). Assinar e Falar continuam disponíveis. |
| Compra em confirmação | Banner `info` "Estamos confirmando sua compra. Pode levar alguns minutos." Botões somem; fica "Falar com um consultor". |
| **Compra concluída (simulada)** | Check `state.live` + **"Compra confirmada"** · "Enviamos os próximos passos para rafael@mouracafe.com.br." (e-mail fictício) · Botão primário "Voltar para o início". Háptico de sucesso 1 vez. Preço some; ficam o resumo e o contato do consultor. |
| Prazo atualizado pelo time | Banner `info` "O time atualizou o prazo: agora vale até 19h." Sem destaque de cor de alerta. |
| **Condição encerrada** | Chip "Condição encerrada" + **"A condição do evento terminou às 18h30."** O bloco de preço e bônus é substituído por "Para saber as condições atuais, fale com um consultor." Botão primário "Falar com um consultor"; "Assinar" some. Nada de "ainda dá tempo". |
| **Não disponível para o ingresso** | Só alcançável por link/código externo. Ícone de informação (nunca cadeado, regra 4) + **"Esta oferta não está disponível para o seu ingresso."** · "Se quiser entender suas opções, fale com um consultor." · primário "Falar com um consultor" · ghost "Voltar". Sem preço, sem bônus, sem prazo. |
| **Sem internet** | Banner `offline`: **"Sem internet. Para contratar agora, mostre este QR no estande."** QR grande (dados do aluno + oferta) + "Estande Comercial · Foyer, ao lado do credenciamento" + ghost "Ver estande no mapa" (cache). Conteúdo da oferta vem do cache (se já tinha sido liberada); prazo pelo relógio local; "Assinar" e OF03 desabilitados com "Precisa de internet". |
| Carregando | Skeleton do título, lista e bloco de preço. |
| Erro | "Não conseguimos abrir a oferta. Tente de novo." + "Tentar de novo". |

---

## OF03 Formulário de interesse de 1 toque (BottomSheet `auto`)

Sem campos para digitar: os dados vêm da compra do ingresso. Um toque envia.
```
┌────────────────────────────────────────┐
│              ────                      │
│ Falar com um consultor             [X] │ h2
│ Sobre: Olimpo                          │ body-strong
│ O time comercial recebe:               │ body
│  Rafael Moura · Moura Café Torrefação  │
│  rafael@mouracafe.com.br               │
│  WhatsApp (51) 98888-1234              │
│ Estande Comercial · Foyer, ao lado do  │ ícone mapa
│ credenciamento · Ver no mapa           │ ghost
│ ┌────────────────────────────────────┐ │
│ │    Quero falar com um consultor    │ │ primário (envia)
│ └────────────────────────────────────┘ │
│ Ao enviar, você autoriza o time        │ caption
│ comercial a falar com você sobre o     │
│ Olimpo. Usamos esses dados só para     │
│ isso.                                  │
└────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Dados | Nome, empresa, e-mail e WhatsApp da compra, **visíveis antes do envio**. Nunca CPF, nunca ingresso completo. Link "Corrigir" abre edição só de e-mail e WhatsApp; padrão é não precisar. |
| Consentimento | O próprio botão, com o texto explícito acima dele, é o ato de consentir (nenhuma caixa pré-marcada). Revisar com o `security-engineer`. |
| Enviar | 1 toque. Carregando no botão; sucesso fecha o sheet e mostra faixa "Interesse enviado" em OF02 + Toast "Pedido enviado. O time comercial vai falar com você." (resposta à ação do aluno, permitido em palestra), háptico leve. |
| Variante "não disponível" | Título "Falar com um consultor", sem "Sobre: Olimpo"; texto "O time comercial vai falar sobre as opções para o seu ingresso." |
| Estande | O mapa (A04) abre com o pin do estande; não obriga ir. O aluno em palestra pode só enviar e continuar assistindo. |

| Estado | Comportamento e microcopy |
|---|---|
| Pré-preenchido | Como acima. |
| Enviando | Botão em carregando, campos congelados. |
| Enviado | Sheet fecha; se reaberto: "Você já pediu contato em 15h26. Quer enviar de novo?" + "Enviar de novo" / "Fechar". |
| Erro | Acima do botão, `danger`: "Não conseguimos enviar seu pedido. Confira a internet e tente de novo." + "Tentar de novo"; sem perda de dados. |
| Sem internet | Botão desabilitado + "Sem internet. Mostre o QR no estande ou tente de novo quando a conexão voltar." + link para o QR (estado offline do OF02). Não enfileira o pedido (lead não pode depender de reenvio silencioso). |
| Dados incompletos | Sem WhatsApp na compra: aparece um campo único "WhatsApp" (`inputMode="tel"`, `autoComplete="tel"`) e o botão só habilita quando válido: "Digite o WhatsApp com DDD." |

---

## OF04 "Ofertas do evento"

Alcance: Home (tile após "Agora não"/vista) e **Eu → "Ofertas do evento"**, ambos só depois da 1ª liberação para o ingresso do aluno.
```
┌────────────────────────────────────────┐
│ [<]  Ofertas do evento                 │
│ ┌────────────────────────────────────┐ │
│ │ Olimpo                    [Ativa]  │ │ Card
│ │ Condição válida até 18h30          │ │ tabular
│ │ Faltam 3h10                      › │ │
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ Imersão Liderança 360  [Encerrada] │ │ Dia 3 (só após liberar)
│ │ A condição terminou às 18h30     › │ │
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Lista | Só ofertas liberadas e **do ingresso do aluno**. Ordem: ativas, depois por data. Status em chip com texto: Ativa · Interesse enviado · Compra confirmada · Encerrada. Cada card abre OF02 no estado correspondente. |
| Estados | com ofertas ativas · só encerradas ("Nenhuma oferta ativa agora. As anteriores ficam aqui." + lista) · sem internet (lista do cache + banner `offline`) · carregando (skeleton). **Vazio total não existe**: sem liberação a tela não é alcançável. |
| Depois do evento | Pergunta 7 do prompt em aberto. Até decidir: as ofertas ficam visíveis como "Encerrada" até o fim do evento, sem preço. |

---

## Validações e mensagens (resumo)
| Situação | Mensagem | Ação |
|---|---|---|
| Erro de rede ao enviar interesse | "Não conseguimos enviar seu pedido. Confira a internet e tente de novo." | Tentar de novo |
| Erro desconhecido | "Algo deu errado do nosso lado. Tente de novo em instantes." | Tentar de novo |
| Checkout não confirmou | "Ainda não vimos sua compra. Se você já pagou, fale com um consultor." | Falar com um consultor |
| Oferta encerrada ao tocar "Assinar" | "A condição terminou às 18h30. Fale com um consultor para ver as condições atuais." | Falar com um consultor |

## Acessibilidade
- Ordem de OF02: voltar → título → para quem → inclui → preço → bônus → prazo → ações. O preço é lido como "Condição do evento, 12 parcelas de 1.490 reais. Total de 17.880 reais, ou 15.990 reais à vista no PIX."
- Toast `role="status"` (`polite`), sem anúncio repetido. Contagem nunca é live region; anuncia só o rótulo "Condição válida até 18h30" ao focar.
- Contraste: `display` do preço `text.primary` sobre `surface.2` (15,75:1); `border.gold` decorativa; texto sobre `gold` sempre #020111.
- Alvos 48; barra fixa não cobre campo (2.4.11) ao corrigir telefone no OF03. Fonte 200%: barra de ações empilha os 3 botões e limita a 35% da altura, o resto rola.
- Estado nunca só por cor: "Ativa", "Encerrada" em texto + ícone.

## Movimento
| Gatilho | Propósito | Propriedade | Duração | Reduzido | Háptico |
|---|---|---|---|---|---|
| Toast da oferta | Avisar sem tirar o olho do palco | opacity + translateY 8 | base | opacity | nenhum |
| Abrir OF02 | Continuidade | fade da tela | base | igual | — |
| Sheet OF03 | Continuidade | translateY + véu | slow | opacity | — |
| Interesse enviado / compra confirmada | Confirmar | check em fade | base | igual | sucesso/leve |
| Countdown | Estado | troca de número, sem animação | — | igual | nenhum |

## Diferenças Android x iOS
Checkout abre no navegador do sistema (Custom Tabs / SFSafariViewController). Voltar do Android fecha sheet, depois a tela. Android: Toast acompanha a insets de navegação por gestos. iOS: háptico `notification success` na compra; Android, vibração curta equivalente.

## Diferenças por ingresso
| Ingresso | Comportamento |
|---|---|
| Diamond / VIP | Vê a oferta se ela inclui sua categoria; preço pode mudar (exemplo: Olimpo VIP 12x de R$ 1.490,00; Diamond 12x de R$ 1.290,00, fictício). |
| Executivo | Vê só as ofertas que incluem Executivo. Exemplo do mockup: Olimpo **não** tem Executivo, então ele não vê card nem Toast; vê "não disponível" só se abrir o link. Sem cadeado em nenhum ponto de Ofertas (regra 4). |

## Eventos de analytics (validar com o PO)
`offer_released {offer_id}` · `offer_toast_shown` · `offer_toast_tapped` · `offer_card_tapped {state}` · `offer_viewed {seconds_since_release}` · `offer_cta_tapped {cta: subscribe|consultant|not_now}` · `offer_checkout_opened` · `offer_purchase_confirmed` · `offer_interest_sent` · `offer_interest_failed {reason}` · `offer_closed_viewed` · `offer_unavailable_viewed {tier}` · `offer_offline_qr_shown`.

## Pontos para o fundador
1. **Toast durante a palestra quebra uma regra do design system (P7).** Está aprovado no prompt e eu o mantenho, mas só com as proteções acima: um por oferta, sem som e sem vibração, sem push, 6 s, em silêncio. Se a diretoria quiser mais (push, badge), é a primeira peça a gerar reclamação de quem está ouvindo o palestrante. Registrar `DEC-###`.
2. **A oferta depende de internet no auditório.** Quem está sem Wi-Fi nunca recebe a liberação, e é justamente quem mais está sem conexão (o Wi-Fi do salão é o ponto frágil). Sem fallback, parte da sala não vê a oferta no momento do pitch. Recomendação: o palestrante sempre fala o caminho físico ("estande 4") e o time reforça no intervalo. Quem reconectar depois recebe as ofertas já liberadas e ainda ativas (com o Toast uma única vez), e o QR do estande permite comprar mesmo sem internet depois de a oferta ter chegado ao aparelho.
3. **"Garantir minha vaga" só se a vaga for real.** O rótulo sugere escassez. Usei "Assinar o Olimpo" por padrão e deixei "Reservar minha vaga" para turmas com limite verdadeiro. "Restam N vagas" só com número real e atualizado, senão fica fora.
4. **Contagem regressiva sem alarme.** Mantive a contagem (prazo real), sem mudar de cor, sem vibração, sem push de "acaba em 10 min". Pressão real continua sendo pressão; se o time quiser alerta de prazo, isso é decisão sua e eu recomendo testar a reação do público antes.
5. **Compra externa.** `[HIPÓTESE]` As lojas podem restringir venda de produto digital fora do app (F10 do design system), e "compra concluída" no app real depende de webhook (Hotmart). O mockup simula. O texto nunca afirma compra antes da confirmação.
6. **Dados pessoais para o comercial.** O formulário envia nome, empresa, e-mail e WhatsApp da compra para a venda. O texto de consentimento acima do botão precisa de revisão do `security-engineer` e confirmação jurídica sobre a base legal.
7. **Preço regular e valores.** Todos os valores são fictícios. "Preço regular" e o riscado só entram se forem reais e autorizados; por padrão, sem riscado.
8. **Pergunta ao PO:** qual o prazo de resposta do consultor? A tela diz apenas "vai falar com você". Prometer horário que o comercial não cumpre custa mais que não prometer.
