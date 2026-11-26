# Telas: GA01–GA03 Atividade Gaia One   (história PT-### a definir pelo PO)

Fonte de regras: `docs/produto/prompt-grupos-ofertas-gaia.md` §3 · Componentes: `docs/design/design-system.md` (Card, Button, Chip, StatusBanner, BottomSheet, Toast, Countdown) · Wi-Fi: A05 · Códigos: `docs/design/etapa-1.html`.

**Objetivo do usuário:** instalar o Gaia One e ativar o teste em menos de 3 minutos, no salão, seguindo só o app, sem se perder ao alternar entre o Protagon e a loja de aplicativos.

**Contexto do exemplo:** Porto Alegre, Dia 2, **11h05**, atividade iniciada às 11h00. Rafael Moura, VIP, iPhone (variante Android descrita em cada passo). Dados fictícios. Textos marcados `[a confirmar]` dependem do fundador (perguntas 8 e 9 do prompt) e ficam como "texto de exemplo" no mockup.

**Composição nova:** `StepCard` (passo numerado: número/check, título, instrução, ação, "Feito"), feito só com Card, Button e Chip existentes.

---

## GA01 Card/bloco do Dia 2

| Onde | Spec |
|---|---|
| Trilha (T01), Dia 2 | Bloco normal "Atividade: Gaia One" com horário. Visível desde antes (é programação, não segredo). Toque abre GA02. |
| Home (A01) | Card aparece **quando a atividade começa** (painel: "Iniciar atividade"), abaixo de Wi-Fi/atalhos e acima dos Avisos; sobe para logo abaixo do LiveCard se não houver sessão ao vivo. Se uma oferta estiver ativa, a oferta (OF01) continua no topo. |

```
┌────────────────────────────────────────┐
│ [celular] Atividade Gaia One           │ caption + ícone
│ Ative seu teste em 4 passos            │ h2
│ Leva cerca de 3 minutos                │ body
│ Passo 2 de 4 · [Wi-Fi: Protagon-Alunos]│ body-strong / chip
│ ┌────────────────────────────────────┐ │
│ │           Continuar                │ │ primário → GA02 no passo atual
│ └────────────────────────────────────┘ │
│ 2 de 3 do seu grupo já ativaram        │ caption (opcional, ver Grupo)
└────────────────────────────────────────┘
```
Variante `emphasis` (`surface.2`, `border.gold`), sem `glow`. Um primário na Home enquanto a atividade estiver em andamento.

| Estado | Comportamento e microcopy |
|---|---|
| Não iniciada | Só o bloco na Trilha: "Atividade: Gaia One · 11h00". Sem card na Home. |
| Iniciada, sem começar | Card: "Ative seu teste em 4 passos" · "Leva cerca de 3 minutos" · botão "Começar". |
| Em andamento | "Passo 2 de 4" + botão "Continuar". Progresso é persistido: sair para a loja e voltar não perde nada. |
| Concluída | Tile `half` com check `state.live`: "Gaia One ativado" · `caption` "às 11h08". Sai da Home no dia seguinte. Sem botão. |
| Durante palestra | A atividade não ocorre em palestra; se o time iniciar durante uma, o card entra sem Toast e sem háptico (P7). |
| Sem internet | Card normal, com `caption`: "Para baixar o app você precisa de internet" + ghost "Ver Wi-Fi". |
| Ingressos | Igual para Executivo, VIP e Diamond. `[HIPÓTESE]` Se o trial diferir por ingresso, a diferença entra só no texto do passo 3. |

---

## GA02 Checklist de 4 passos

```
┌────────────────────────────────────────┐
│ [<]  Gaia One                          │ TopBar
│ [wifi] Protagon-Alunos  [Copiar senha] │ atalho (56), sempre no topo
│ ────────────────────────────────────── │
│ Ative seu teste do Gaia One            │ h1
│ 2 de 4 passos feitos   ▓▓▓▓░░░░        │ texto + trilho (border.strong)
│                                        │
│ (✓) 1  Baixar o app            Feito   │ StepCard concluído (colapsado)
│ ┌────────────────────────────────────┐ │
│ │ (2) Criar a conta                  │ │ StepCard ativo (surface.2, border.gold)
│ │ Use o mesmo e-mail da sua compra:  │ │
│ │ rafael@mouracafe.com.br            │ │
│ │ ┌────────────────────────────────┐ │ │
│ │ │       Copiar meu e-mail        │ │ │ primário
│ │ └────────────────────────────────┘ │ │
│ │ Já tem conta? Entre com ela.       │ │ ghost → GA03 FAQ
│ │ [ ] Feito                          │ │ alvo 48
│ └────────────────────────────────────┘ │
│ ( ) 3  Ativar o teste                  │ StepCard pendente (surface.1)
│ ( ) 4  Pronto                          │
├────────────────────────────────────────┤
│        Preciso de ajuda                │ ghost fixo, mesmo lugar em todo o fluxo
└────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Wi-Fi | Mesmo componente do bloco Wi-Fi da Home: rede "Protagon-Alunos" + "Copiar senha" (Toast "Senha do Wi-Fi copiada"). Toque no resto abre A05. Fixo no topo porque o passo 1 depende dele. |
| Progresso | Texto "2 de 4 passos feitos" + trilho; o texto manda, a barra é apoio (5 do design system). |
| Passos | **Todos tocáveis, nenhum bloqueado**: o aluno pode pular para o 3 ou voltar ao 1 (liberdade, H3). Só o primeiro pendente começa expandido; os outros mostram título e abrem ao toque. Cada passo tem "Feito" (checkbox de 48) para marcar e desmarcar. |
| Progresso é autodeclarado | O app não consegue saber se o app foi instalado ou o trial ativado; o texto nunca afirma verificação. |
| Voltar de outro app | Ao voltar do Gaia One/loja, o checklist reabre no passo em que o aluno estava. A cópia (e-mail, código) permanece na área de transferência até o aluno copiar outra coisa. |

### Passo 1: Baixar o app
| Plataforma | Conteúdo |
|---|---|
| iPhone | "Baixe o Gaia One na App Store." Primário **"Abrir na App Store"** (link da loja do iOS; simulado). |
| Android | "Baixe o Gaia One no Google Play." Primário **"Abrir no Google Play"**. |
| Outro aparelho | Ghost "Usar outro aparelho" abre sheet `auto`: **"Leia com o outro celular"**, QR único que abre a loja certa no aparelho que ler, e "Ou procure Gaia One na loja." Fechável (X, véu, arrastar, voltar). |
| Mockup | Painel escolhe "Aparelho: iPhone/Android" (o web não detecta loja de verdade). |
| Aviso de lentidão | `caption`: "O Wi-Fi do salão enche com muita gente. Se o download demorar, use os dados do celular." |

### Passo 2: Criar a conta
"Use o mesmo e-mail da sua compra: **rafael@mouracafe.com.br**" (e-mail fictício, mostrado inteiro para o aluno conferir). Primário "Copiar meu e-mail" → rótulo vira "E-mail copiado" por 2 s + háptico leve + anúncio de acessibilidade. Ghost "Já tem conta? Entre com ela." → FAQ. Dica após copiar: "Cole no cadastro do Gaia One e volte aqui."

### Passo 3: Ativar o teste
| Variante | Conteúdo |
|---|---|
| Com código promocional | "No Gaia One, abra Ativar teste e cole o código." Caixa tabular **PROTAGON26** (código fictício) + primário "Copiar código" → "Código copiado" 2 s. |
| Sem código | "O teste ativa direto na sua conta nova. Não precisa de código." Sem botão de copiar. |
| Cartão | Se o trial pedir cartão, linha "O teste pede um cartão de crédito. Você não é cobrado durante o teste. `[a confirmar]`"; senão "O teste não pede cartão. `[a confirmar]`". Sempre dito **antes** de o aluno agir. |

### Passo 4: Pronto
"Quando o teste estiver ativo, toque em Já ativei." Primário **"Já ativei"** → todos os passos viram feitos, háptico de sucesso, Toast "Tudo certo. Marcamos seu Gaia One como ativado." e a tela troca para o estado Concluída. Funciona mesmo sem marcar os passos anteriores (sem bloquear). Um toque em "Desfazer" no Toast (6 s) volta ao passo 4.

### Grupo (opcional, proposta)
Se o aluno tem grupo (GR06): linha final "2 de 3 do seu grupo já ativaram" e, ao tocar, lista de nomes com check ou "Ainda não". Só aparece para quem **liga** "Mostrar ao meu grupo quando eu ativar" (Switch no fim da tela, desligado por padrão). Quem não liga aparece como "Não compartilhou", sem lista pública. Chip tracejado "Proposta".

| Estado | Comportamento e microcopy |
|---|---|
| Não iniciada | Passo 1 expandido; progresso "0 de 4 passos feitos". |
| Passo 1, 2 ou 3 | Como acima; o passo ativo é o primeiro sem "Feito". |
| **Concluída** | Título "Gaia One ativado"; passos em check com texto "Feito"; resumo `caption` "Concluído às 11h08"; primário "Voltar para o início"; ghost "Rever os passos". |
| Precisa de ajuda | Qualquer momento: "Preciso de ajuda" (GA03). Estado do checklist preservado ao voltar. |
| **Sem internet** | StatusBanner `offline`: **"Sem internet. Conecte-se ao Wi-Fi para baixar o Gaia One."** Wi-Fi no topo ganha destaque (borda `info`). Copiar e-mail e código continuam funcionando (não dependem da rede); "Abrir na App Store/Google Play" fica habilitado e o sistema avisa se não há rede. |
| Carregando | Skeleton só do texto do e-mail/código; checklist já aparece. |
| Erro ao abrir a loja | "Não conseguimos abrir a loja. Procure Gaia One na App Store." (ou "…no Google Play.") + "Tentar de novo". |
| Copiar falhou | "Não conseguimos copiar. Toque e segure o texto para copiar." (o texto é selecionável). |

---

## GA03 Preciso de ajuda (BottomSheet `tall`)

Acessível de um ponto fixo da tela em todos os passos (WCAG 3.2.6) e também de GA01 offline.
```
┌────────────────────────────────────────┐
│              ────                      │
│ Preciso de ajuda                   [X] │ h2
│ Onde está a equipe                     │ h2
│ Equipe do Gaia One nas laterais do     │ body
│ salão e no estande. Mais perto de você:│
│ lateral direita, perto do setor VIP.   │ [a confirmar]
│ [ Ver no mapa ]                        │ ghost → A04 com pin
│ [ Pedir ajuda no meu lugar ]           │ secundário [Proposta]
│ ────────────────────────────────────── │
│ Perguntas frequentes                   │ h2
│ ▸ O teste pede cartão?                 │
│ ▸ Não recebi o e-mail                  │
│ ▸ Já tenho conta no Gaia One           │
│ ▸ O download está lento                │
│ ────────────────────────────────────── │
│ Falar com o suporte                    │ ghost → U05
└────────────────────────────────────────┘
```
| Pergunta | Resposta de exemplo (`[a confirmar]`) |
|---|---|
| O teste pede cartão? | "Não. O teste não pede cartão." / ou a variante da regra do passo 3. |
| Não recebi o e-mail | "Confira a caixa de spam e a pasta Promoções. Com muita gente conectada, pode levar alguns minutos. Use o mesmo e-mail da sua compra: rafael@mouracafe.com.br." |
| Já tenho conta | "Entre com ela no Gaia One e use o código no passo 3. Não precisa criar outra." |
| O download está lento | "O Wi-Fi do salão enche com muita gente. Use os dados do celular se puder, ou peça ajuda à equipe." |
| Item | Spec |
|---|---|
| Equipe | Mostra onde está a equipe de apoio, em texto + mapa (A04 com pins). Texto relativo ao setor do aluno ("lateral direita, perto do seu setor"). |
| Pedir ajuda no meu lugar | [proposta] Envia setor e fila (já conhecidos pela credencial) à equipe, que vai até a pessoa. 1 toque; confirmação "Pedido enviado. Alguém vai até o setor VIP, fila 8." Não envia dados pessoais além disso. Pode ser cortado se o time não tiver operação. |
| FAQ | Acordeão: 1 aberto por vez; cada resposta ≤ 3 linhas; funciona offline (cache). |

| Estado | Comportamento e microcopy |
|---|---|
| FAQ (padrão) | Como acima. |
| Equipe no salão | Sub-área com texto + mapa. |
| Pedido de ajuda enviado | Botão vira "Pedido enviado · Alguém vai até você" (desabilitado, check); `role="status"`. Nova tentativa só depois de 5 min. |
| Pedido falhou | "Não conseguimos avisar a equipe. Levante a mão ou vá até um ponto de apoio." + "Tentar de novo". |
| Sem internet | FAQ e mapa do cache; "Pedir ajuda no meu lugar" desabilitado: "Precisa de internet. Levante a mão ou vá até a equipe." |

---

## Acessibilidade
- Ordem de leitura GA02: título da tela → Wi-Fi → "Ative seu teste do Gaia One" → progresso ("2 de 4 passos feitos") → passos em ordem (cada `StepCard` é um grupo: "Passo 2 de 4: Criar a conta. Em andamento.") → Preciso de ajuda.
- Estado de passo nunca só por cor: número, check e a palavra "Feito". "Feito" é `checkbox` com `aria-checked`.
- Copiar: anúncio `polite` "E-mail copiado" / "Código copiado". Códigos e e-mail selecionáveis e legíveis (≥ 16, tabular).
- Alvos 48; "Preciso de ajuda" fica no mesmo lugar nos 4 passos. Sheet com foco no título e volta ao gatilho.
- Fonte 200%: StepCards quebram em coluna; código e e-mail quebram linha sem cortar.
- Contraste: texto `text.primary` em `surface.2`/`surface.1` ≥ 15,75:1; check `state.live` em `surface.1` 12,15:1; erro `danger` ≥ 5,28:1.

## Movimento
| Gatilho | Propósito | Propriedade | Duração | Reduzido | Háptico |
|---|---|---|---|---|---|
| Marcar "Feito" | Feedback | check em fade + trilho scaleX | base | igual, sem animar | seleção leve |
| Expandir passo | Continuidade | altura via fade do conteúdo (sem animar height) | base | igual | — |
| Copiar | Confirmar | rótulo troca por 2 s | — | igual | leve |
| "Já ativei" | Celebrar sóbrio | check grande em fade | base | igual | sucesso |

## Diferenças Android x iOS
Loja certa por sistema (App Store x Google Play) e rótulo do botão. Copiar: iOS mostra aviso de colagem do sistema no app de destino; Android 13+ mostra pré-visualização do que foi copiado. Voltar do Android fecha sheet/QR antes de sair da tela. Atalho de Wi-Fi abre o painel de rede do sistema onde existir (Android); iOS só copia a senha.

## Diferenças por ingresso
Nenhuma. Executivo, VIP e Diamond veem a mesma atividade. O passo "Grupo" só existe para quem está em grupo.

## Eventos de analytics (validar com o PO)
`gaia_card_viewed {state}` · `gaia_started` · `gaia_step_action {step: 1..3, action: store|copy_email|copy_code}` · `gaia_step_done {step, source: manual}` · `gaia_other_device_qr_opened` · `gaia_completed {seconds_since_start}` · `gaia_help_opened {step}` · `gaia_faq_opened {question}` · `gaia_help_request_sent` · `wifi_password_copied {source: gaia}`. Métrica-chave: tempo do "Começar" até "Já ativei" (meta < 180 s).

## Pontos para o fundador
1. **O Wi-Fi do salão é o gargalo, não o app.** Um download de dezenas de MB por centenas de pessoas ao mesmo tempo é onde a meta de 3 minutos falha. Recomendações: (a) lembrete na véspera, no fim do Dia 1, "Baixe o Gaia One hoje, com a sua internet" (notificação operacional, `[proposta]`); (b) o passo 1 avisa que dados móveis podem ser mais rápidos; (c) o time de apoio precisa de roteador/rede reservada, pergunta para a operação.
2. **O progresso é autodeclarado.** O app não vê se o Gaia One foi instalado ou ativado. A lista para o palco (pergunta 9) só será confiável quando houver integração real e consentimento; no mockup, "Já ativei" é só um toque.
3. **O progresso do grupo pode virar constrangimento.** Mostrar quem já ativou cria pressão social. Deixei opt-in (desligado por padrão, regra 8), mas recomendo cortar da Fase 1 e testar com 3 a 5 pessoas se o grupo realmente se ajuda.
4. **Textos pendentes.** Preciso do fundador para: o que é o Gaia One em uma frase, links reais das lojas, se pede cartão, se há código promocional e quanto dura o teste. Até lá, tudo é texto de exemplo marcado `[a confirmar]`, e o passo 3 tem as duas variantes.
5. **Alternar entre apps.** Copiar e-mail → colar no Gaia One → voltar → copiar código é o ponto onde o aluno se perde. O checklist guarda o passo atual e cada cópia tem confirmação visível, mas a área de transferência guarda um item por vez. Se o time puder gerar um link de ativação com e-mail e código embutidos, o passo cai de 4 para 2 (vale pedir à equipe do Gaia One).
6. **"Pedir ajuda no meu lugar"** depende de operação humana no salão; só entra se o time garantir resposta. Marcado como proposta.
