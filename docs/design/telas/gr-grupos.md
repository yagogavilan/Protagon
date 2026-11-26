# Telas: GR01–GR06 Grupos de 3   (história PT-### a definir pelo PO)

Fonte de regras: `docs/produto/prompt-grupos-ofertas-gaia.md` §1 · Componentes: `docs/design/design-system.md` (Card, StatusBanner, BottomSheet, Toast, Chip, Button, Avatar, Countdown, Switch, EmptyState) · Códigos de inventário: `docs/design/etapa-1.html` (grupo "Grupos, Ofertas e Gaia One").

**Objetivo do usuário:** formar ou entrar num grupo de 3 em menos de 1 minuto, sem ajuda, sem ficar de fora e sem ver gente de outro ingresso. Nada de chat novo: o grupo é um jeito de se conhecer, não uma rede social.

**Contexto do exemplo:** Porto Alegre, Dia 1, **10h32** (intervalo). Rafael Moura, VIP, Moura Café Torrefação, setor VIP, fila 8. Formação aberta, fecha às 10h45 [proposta]. Dados fictícios.

**Composições novas (só juntam componentes existentes):** `GroupRow` (linha de grupo da lista), `MemberRow` (membro no Meu grupo), `CodeBox` (código de 4 letras + QR).

## Regras de interface (valem para as 6 telas)
- O app nunca nomeia outra categoria de ingresso. Quem é VIP só enxerga grupos VIP; a categoria aparece só como chip estático "Só ingresso VIP" (TierBadge do próprio aluno).
- Uma pessoa, um grupo. Com grupo ativo, "Criar", "Entrar" e "Me coloque" somem; no lugar vem o card Meu grupo.
- Entrar e criar são **1 toque**, sem sheet de confirmação (menos fricção). A segurança está em poder sair e no "Desfazer" de 6 s.
- Vocabulário: grupo, vaga, entrar, criar, sair. O trio nunca é chamado de "time", "equipe" ou "squad": "o time" na interface é só a organização do evento ("o time vai encaixar você", "fale com o time no estande"), como no resto do app.
- Tamanho 2 ou 4 (sobra) é decisão do time e vira chip "Proposta" na tela.

---

## GR01 Card "Forme seu grupo" (Home A01 e bloco da Trilha T01)

**Posição na Home:** logo abaixo do LiveCard/StatusBanner, acima dos atalhos, enquanto a formação estiver aberta e o aluno sem grupo. Na Trilha: dentro do bloco "Formação dos grupos", mesmo conteúdo.

```
┌────────────────────────────────────────┐
│ [pessoas] Grupos                       │ ícone 16 + caption
│ Forme seu grupo de 3                   │ h2
│ Pessoas com o mesmo ingresso que você, │ body
│ para os 3 dias.                        │
│ Fecha às 10h45 · em 13 min             │ body-strong, Countdown, tabular
│ 9 grupos com vaga agora                │ caption
│ ┌────────────────────────────────────┐ │
│ │          Formar meu grupo          │ │ primário, abre GR02
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```
Variante `emphasis` (`surface.2`, `border.gold`), sem `glow` (o único brilho da Home segue sendo o anel ao vivo). Um botão primário por tela: na Home da formação este é ele.

| Estado | Comportamento e microcopy |
|---|---|
| Antes de abrir | Home sem card. Bloco da Trilha: "Formação dos grupos" · "Abre às 8h". |
| Formação aberta, sem grupo | Como acima. Se não há vaga: linha "Nenhum grupo com vaga agora" e o botão continua. |
| Durante palestra ao vivo | Card sem Toast, sem badge, sem háptico (P7). Texto troca para "Formação aberta até 10h45. Você pode entrar no intervalo." e o botão fica secundário. |
| Em grupo (1/3, 2/3) | Vira tile `half` "Meu grupo" · "Grupo 12 · 2 de 3" · caption "Falta 1 pessoa" → GR06. |
| Grupo completo | Tile `half` "Meu grupo" · "Grupo 12 · completo" · 3 avatares 32 sobrepostos → GR06. |
| Encaixado pelo time | Igual a completo, com chip info "Encaixado pelo time". |
| Formação encerrada, sem grupo | Card `default`: "A formação terminou" · "O time vai encaixar você em um grupo. Se quiser saber agora, passe no estande." · ghost "Ver estande" (A04). Sem botão de criar. |
| Sem internet | "Sem internet. Para entrar em um grupo você precisa de conexão." + ghost "Ver Wi-Fi" (A05). Quem já tem grupo vê o tile do cache. |
| Executivo / VIP / Diamond | Idêntico. Não depende de Conexões, então nada de cadeado aqui. |

---

## GR02 Grupos com vaga (lista) — tela de entrada

**Objetivo:** achar um grupo com 1 toque. Só aparecem grupos da categoria do aluno.

```
┌────────────────────────────────────────┐
│ [<]  Grupos com vaga        [Só VIP]   │ TopBar com voltar + chip
│ Fecha às 10h45 · em 13 min             │ body-strong
│ Entrar com código ou QR              › │ ghost (abre GR04)
│ ────────────────────────────────────── │
│ ┌────────────────────────────────────┐ │
│ │ Grupo 7 · 1 vaga      No seu setor │ │ GroupRow
│ │ Luciana · Ateliê Prates            │ │
│ │ Thiago · Bernardes Logística       │ │
│ │ Setor VIP · fila 6      [ Entrar ] │ │ secundário, alvo 48
│ └────────────────────────────────────┘ │
│ ┌────────────────────────────────────┐ │
│ │ Grupo 12 · 2 vagas                 │ │
│ │ Marcos · Pires Construtora         │ │
│ │ Setor VIP · fila 10     [ Entrar ] │ │
│ └────────────────────────────────────┘ │
├────────────────────────────────────────┤
│ [ Criar grupo ]  [ Me coloque em um grupo ] │ barra fixa: secundário | primário
└────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Ordem da lista | 1) mesmo setor do aluno, 2) menos vagas primeiro (fecha um grupo antes de abrir outro), 3) fila mais próxima. |
| GroupRow | Número do grupo + "1 vaga" / "2 vagas" (cor nunca sozinha: texto sempre). Primeiro nome + empresa de cada membro, sem foto, sem sobrenome, sem cargo. Linha de local: "Setor VIP · fila 6" (`caption`). Chip "No seu setor" quando for o caso. |
| Ação | "Entrar" por linha. A barra fixa (superfície `surface.1` sólida, sem blur, P4) mantém os 2 outros caminhos sempre à mão: "Criar grupo" (secundário) e "Me coloque em um grupo" (primário). |
| Entrar | Toque único: botão em carregando (largura mantida) → vai para GR06 com Toast "Você entrou no Grupo 7" + "Desfazer" (6 s), háptico leve. Todos os membros recebem aviso (ver §Avisos). |
| Criar grupo | Toque único: cria na hora e abre GR03. |
| Fonte 200% | Linhas viram coluna; barra fixa vira 2 botões empilhados (máx. 35% da altura); a lista rola por trás. |

| Estado | Comportamento e microcopy |
|---|---|
| Carregando | Skeleton de 3 GroupRow; barra fixa já ativa. "Buscando grupos com vaga…" |
| Lista com vagas | Como acima. |
| **Vazia** | EmptyState: ícone pessoas · **"Nenhum grupo com vaga agora"** · "Crie um ou peça para o app te encaixar." · os 2 botões da barra fixa (não duplicar dentro do EmptyState). |
| **Grupo cheio ao tentar entrar** | Linha some com fade; Toast `warning` "O Grupo 7 acabou de completar. Veja outros grupos ou peça para o app te encaixar." Lista atualiza; foco vai para a primeira linha. |
| Já estou em grupo | Tela não é alcançável (card vira Meu grupo). Por link/atalho: redireciona a GR06 com Toast "Você já está no Grupo 12." |
| Formação encerrada | Tela não é alcançável; mesmo texto do GR01 encerrado. |
| Sem internet | Banner `offline`: "Sem internet. A lista de grupos precisa de conexão." + ghost "Ver Wi-Fi". Lista some (dados velhos levariam a entrar em grupo cheio); barra fixa: "Criar grupo" e "Me coloque" desabilitados. |
| Erro | "Não conseguimos carregar os grupos. Tente de novo." + "Tentar de novo". |

---

## GR03 Criar grupo (código de 4 letras + QR)

**Objetivo:** o aluno mostra o código ou o QR para quem está ao lado, sem digitar nada antes.

```
┌────────────────────────────────────────┐
│ [<]  Seu grupo foi criado              │ h1
│ Grupo 14 · 1 de 3                      │ body-strong
│                                        │
│            ┌──────────────┐            │
│            │   QR (192)   │            │ fundo claro, margem 16
│            └──────────────┘            │
│                K T V R                 │ display, tabular, espaçado
│   Peça para quem está ao lado entrar   │ body
│   com este código ou ler o QR.         │
│ ┌────────────────────────────────────┐ │
│ │ Mostrar meu grupo na lista   [ON]  │ │ Switch
│ └────────────────────────────────────┘ │
│  Desligado: só entra quem tiver o      │ caption
│  código.                               │
│ ┌────────────────────────────────────┐ │
│ │               Pronto               │ │ primário, vai a GR06
│ └────────────────────────────────────┘ │
│        Copiar código                   │ ghost
└────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Código | 4 letras maiúsculas, **só consoantes sem ambiguidade** (sem I, O, L, Q, nenhuma vogal) para não formar palavra e não confundir 0/O. ~130 mil combinações, escopo por edição e categoria. Exemplo: KTVR. Válido até o fim da formação. |
| QR | Contém o grupo; fundo claro com margem de 16 (contraste e leitura em tela baixa). Ao abrir esta tela o brilho sobe como na credencial (G01). |
| "Mostrar meu grupo na lista" | Ligado por padrão (regra do prompt: o grupo aparece na lista). Desligar tira o grupo da lista e só entra quem tem código/QR. [proposta, ver Pontos] |
| Compartilhar | "Copiar código" (Toast "Código copiado") e botão de compartilhar do sistema no iOS/Android. |
| Pronto | Leva a GR06. O grupo permanece criado ao sair da tela. |
| Sair sem entrar ninguém | Grupo de 1 fica na lista até alguém entrar ou até o aluno sair dele (ver GR06). |

| Estado | Comportamento e microcopy |
|---|---|
| Gerando | Skeleton do QR + "Criando seu grupo…" (até 2 s). |
| Criado | Como acima. |
| Alguém entrou enquanto a tela está aberta | Linha "Grupo 14 · 2 de 3" atualiza e `role="status"` anuncia "Luciana entrou no seu grupo." Háptico leve. |
| Só por código | Switch desligado + chip info "Só por código". |
| Sem internet | Não cria (precisa do servidor). Banner `offline`: "Sem internet. Para criar um grupo você precisa de conexão." + "Ver Wi-Fi". Se o grupo já existe, QR e código aparecem do cache e funcionam (quem lê precisa de internet). |
| Erro | "Não conseguimos criar o grupo. Tente de novo." + "Tentar de novo"; nada é criado pela metade. |
| Formação encerrou durante a tela | "A formação terminou. O time vai encaixar você em um grupo." e volta para a Home. |

---

## GR04 Entrar por código ou QR

```
┌────────────────────────────────────────┐
│ [<]  Entrar com código                 │ h1
│ ┌────────────────────────────────────┐ │
│ │            _ _ _ _                 │ │ campo, 4 letras, caixa alta
│ └────────────────────────────────────┘ │
│ Digite as 4 letras do grupo.           │ caption
│ ┌────────────────────────────────────┐ │
│ │ [câmera]  Ler QR do grupo          │ │ secundário
│ └────────────────────────────────────┘ │
└────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Campo | `autoCapitalize="characters"`, `autoCorrect=off`, `inputMode="text"`, colar permitido (WCAG 3.3.8), aceita minúsculas e converte. Envia sozinho ao completar a 4ª letra (sem botão "Entrar"); foco permanece no campo se falhar. |
| Ler QR | Abre a câmera com leitor próprio (mesmo componente do C10, **mas fora da regra do Executivo**: o C10 cai em C00 para Executivo e este não pode). |
| Sucesso | Vai a GR06, Toast "Você entrou no Grupo 14". |

| Estado | Comportamento e microcopy |
|---|---|
| Digitando | Letras entram com `tabular-nums`/caixa fixa; sem animação. |
| **Código não encontrado** | Erro inline `danger` + ícone: **"Não achamos esse código. Confira as letras. Grupos só reúnem pessoas com o mesmo tipo de ingresso."** A mesma mensagem vale para código de outra categoria (não revela que o grupo existe). |
| Grupo cheio | "Esse grupo já tem 3 pessoas. Veja outros grupos com vaga." + botão "Ver grupos com vaga" (GR02). |
| Formação encerrada | "A formação terminou. O time vai encaixar você em um grupo." |
| Câmera: permissão negada | Antes do diálogo do sistema: "Usamos a câmera só para ler o QR do grupo." + "Agora não". Negada: "A câmera está desligada para o Protagon. Digite o código ou ative a câmera nos Ajustes." + "Abrir Ajustes" + campo de código visível. |
| Sem internet | "Sem internet. Para entrar no grupo você precisa de conexão." + "Ver Wi-Fi". O código digitado fica no campo e envia quando a conexão volta, com confirmação visível (não entra sozinho sem o aluno ver). |
| Erro | "Não conseguimos entrar no grupo. Tente de novo em instantes." + "Tentar de novo". |

---

## GR05 "Me coloque em um grupo"

**Regra de encaixe (proposta):** 1) grupo com **1 vaga** no mesmo setor, 2) grupo com 1 vaga mais próximo, 3) grupo com 2 vagas mais próximo. Priorizar quem falta para fechar evita grupos de 1 espalhados.

Fluxo: toque único em "Me coloque em um grupo" (GR02) → botão em carregando "Procurando um grupo…" (até 2 s) → GR06 com Toast "Encaixamos você no Grupo 7. Setor VIP, fila 6." e "Desfazer" (6 s). Sem tela intermediária.

| Estado | Comportamento e microcopy |
|---|---|
| Encaixado | Como acima; chip no GR06 "Escolhido pelo app". |
| **Sem grupo com vaga** | Cria o grupo do aluno e o deixa na lista. Sheet curto `auto`: **"Ainda não há vaga. Criamos o Grupo 14 para você. Quem pedir para ser encaixado entra nele."** + primário "Ver meu grupo" (GR06) + ghost "Mostrar código". |
| Erro | "Não conseguimos encaixar você agora. Tente de novo ou crie um grupo." + "Tentar de novo". |
| Sem internet | "Sem internet. O app precisa de conexão para encaixar você." + "Ver Wi-Fi". |
| Formação encerrada | O botão some; vale a regra do time (GR01 encerrado). |

---

## GR06 Meu grupo

```
┌────────────────────────────────────────┐
│ [<]  Meu grupo                         │
│ Grupo 12                               │ h1 (número oficial)
│ Os Cafeeiros  [editar nome]            │ body (nome opcional)
│ 2 de 3 · falta 1 pessoa                │ body-strong
│ ────────────────────────────────────── │
│ (foto) Rafael Moura (você)             │ MemberRow
│        Moura Café · Setor VIP, fila 8  │
│ (foto) Luciana Prates                  │
│        Ateliê Prates · fila 6          │
│        [ Chamar no WhatsApp ]          │ só se ela compartilha
│ ( + )  Vaga aberta   [ Mostrar código ]│ linha tracejada
│ ────────────────────────────────────── │
│ Compartilhar meu WhatsApp com o grupo  │
│ [OFF]                                  │ Switch, padrão desligado
│ ────────────────────────────────────── │
│ Próximas dinâmicas em trio             │ h2
│ Dia 1 · 14h · Dinâmica em trio         │ → T02
│ Com Luciana e [vaga aberta]            │
│ Ponto de encontro nos intervalos       │ h2
│ Foyer, perto do credenciamento [proposta] │
│ ────────────────────────────────────── │
│ Sair do grupo                          │ destrutivo (contorno)
└────────────────────────────────────────┘
```
| Item | Spec |
|---|---|
| Nome do grupo | O **número é oficial** e fixo ("Grupo 12", usado no palco, proposta Q3). O nome é opcional e é um apelido: 2 a 24 caracteres, qualquer membro edita, todos veem. Vazio mostra só o número. |
| MemberRow | Avatar 48, nome completo, empresa, "Setor VIP, fila 8". Sem cargo, sem telefone, sem e-mail. Sem TierBadge (todos têm o mesmo ingresso). Toque abre sheet com nome, empresa e, se compartilhado, WhatsApp. **Sem link para perfil de Conexões** (Executivo não tem). |
| WhatsApp | Switch próprio, **desligado por padrão**. Ao ligar, sheet curto antes de ativar: "Compartilhar seu WhatsApp? **(51) 98888-1234** ficará visível para os membros deste grupo, inclusive quem entrar depois. Você pode desligar quando quiser." Botões "Compartilhar" / "Agora não". Ao desligar ou sair do grupo, o acesso some na hora. Membros que compartilham mostram o botão "Chamar no WhatsApp" (abre wa.me); o número não é impresso na tela. |
| Dinâmicas em trio | Lista da Trilha: horário, título, nomes do grupo; toque abre T02. Sem dinâmica: "Nenhuma dinâmica em trio marcada ainda." |
| Ponto de encontro | **Ponto do grupo** sugerido por setor, igual para os 3 ingressos. **Não reutiliza os Pontos de Conexão A/B/C** (só VIP+, D6), senão o Executivo veria algo bloqueado dentro de Grupos. [proposta] |
| Sair | Visível só com a formação aberta. Sheet de confirmação: **"Sair do Grupo 12? Sua vaga volta para a lista. Seu WhatsApp deixa de aparecer para o grupo."** Botões "Sair do grupo" (destrutivo preenchido, #020111) / "Ficar no grupo". |

| Estado | Comportamento e microcopy |
|---|---|
| 1 de 3 (criador) | "1 de 3 · faltam 2 pessoas" + QR/código a 1 toque ("Mostrar código"). |
| 2 de 3 | Como acima. |
| **Completo (3 de 3)** | Chip info "Grupo completo", some "Vaga aberta" e "Mostrar código", o grupo sai da lista GR02. |
| Alguém entrou | Atualiza a lista, Toast "Luciana entrou no seu grupo" (só com a formação aberta e fora de palestra), háptico leve; durante palestra, o aviso espera o intervalo (regra 5), sem Toast. |
| Alguém saiu | "Thiago saiu do grupo. A vaga voltou para a lista." (linha de status, não Toast). |
| Grupo de 2 ou de 4 | Chip tracejado "Proposta" + "Grupo de 4 definido pelo time". |
| **Formação encerrada** | Remove "Sair do grupo"; no lugar, texto `text.secondary`: "A formação terminou. Para trocar de grupo, fale com o time no estande." + secundário "Ver estande". Nome e WhatsApp continuam editáveis. |
| **Encaixado pelo time** | Chip "Encaixado pelo time" e Toast ao abrir pela 1ª vez: "O time colocou você no Grupo 12." |
| Sem internet | Banner `offline`; membros, nome e QR/código vêm do cache; edição de nome e do WhatsApp ficam na fila ("Salvamos assim que a internet voltar"); "Sair" desabilitado com "Precisa de internet". |
| Carregando | Skeleton das 3 linhas. |
| Erro ao salvar nome | "Não conseguimos salvar o nome. Tente de novo." Nome em moderação inválido: "Esse nome não pode ser usado. Escolha outro." |

---

## Avisos de grupo (G02/G03, notificações)
- "Luciana entrou no seu grupo" / "Seu grupo está completo: Rafael, Luciana e Thiago" / "Thiago saiu do grupo". Categoria própria "Grupo" em U02; vibração leve só com a formação aberta e fora de palestra. Durante palestra: ficam em espera até o intervalo (regra 5). Não contam no badge do sino em palestra.
- "O time colocou você no Grupo 12" (encaixe): vale como aviso operacional, pode chegar na palestra sem Toast.

## Acessibilidade
- Ordem de leitura GR02: título → prazo → "Entrar com código ou QR" → lista (cada GroupRow é um grupo com rótulo único: "Grupo 7, 1 vaga, no seu setor. Luciana, Ateliê Prates; Thiago, Bernardes Logística. Setor VIP, fila 6." e botão "Entrar no Grupo 7") → barra fixa.
- Contagem de vagas sempre em texto; "No seu setor" é texto, não só destaque.
- Código lido letra a letra: "K, T, V, R" (`aria-label`); QR com `aria-label="QR do grupo 14, mesmo código KTVR"`.
- Troca de estado anunciada (`polite`): "Você entrou no Grupo 7", "Grupo 14 completo".
- Alvos 48; barra fixa não cobre o campo focado (2.4.11); campo de código aceita colar (3.3.8); "Desfazer" com alternativa (Sair do grupo, que sempre existe na formação).
- Contraste: texto `gold.200`/`text.primary` sobre `surface.2` (≥ 11,64:1); erro `danger` em `surface.2` (5,82:1); chip tracejado "Proposta" com `text.secondary`.
- Sem arrastar. QR e código dão duas rotas (visão e digitação).

## Movimento
| Gatilho | Propósito | Propriedade | Duração | Reduzido | Háptico |
|---|---|---|---|---|---|
| Entrar / Criar / Encaixar | Continuidade | fade da tela de destino | base | igual | impacto leve |
| Linha da lista some (grupo cheio) | Explicar | opacity | base | igual | — |
| Membro entra no grupo | Estado | nova linha em fade (sem translate) | base | igual | leve (formação aberta, fora de palestra) |
| Grupo completa | Confirmar | check no chip, sem confete | base | igual | sucesso |

## Diferenças Android x iOS
Compartilhar usa a folha do sistema em cada plataforma. Voltar do Android fecha sheet antes de sair da tela. Câmera: diálogo de permissão do sistema; "Abrir Ajustes" leva às configurações do app. Colar: iOS mostra aviso de colagem do sistema.

## Diferenças por ingresso
Nenhuma na interface (Executivo, VIP e Diamond usam igual). Muda só o conjunto de dados: cada um enxerga apenas a própria categoria. Diamond pode ter poucos grupos: ver Pontos para o fundador.

## Eventos de analytics (validar com o PO)
`group_card_viewed {state}` · `group_card_tapped` · `group_list_viewed {groups_with_spot}` · `group_joined {path: list|code|qr|auto, seconds_since_open}` · `group_join_failed {reason: full|not_found|closed|offline}` · `group_created {visible_in_list}` · `group_auto_assigned {had_spot: bool}` · `group_left` · `group_completed {minutes_since_open}` · `group_whatsapp_shared {on|off}` · `group_name_edited`. Métrica-chave: tempo do 1º toque na tela até estar em grupo (meta < 60 s).

## Pontos para o fundador
1. **Janela de formação curta demais.** O 1º intervalo tem 15 min (10h30 a 10h45) e as 1h antes são palestra, em que o app não empurra nada (regra 5). Sem janela maior, metade da sala só descobre a formação no intervalo. Recomendação: abrir na chegada (8h) e fechar às 10h45, ou ter um bloco de dinâmica dedicado na Trilha. Depende da grade real [HIPÓTESE].
2. **Ordem do prompt (lista → criar → Me coloque).** Mantive a lista em primeiro lugar, mas o caminho mais rápido para quem chega sozinho é "Me coloque" (1 toque, sem ler lista). Por isso ele é o botão primário da barra fixa. Se a ordem literal for obrigatória, é só inverter a hierarquia visual; não muda o fluxo.
3. **Grupo fechado entre amigos.** Dois amigos criam o grupo e um estranho ocupa a 3ª vaga antes do terceiro chegar. Acrescentei o switch "Mostrar meu grupo na lista" (ligado por padrão, como no prompt) para esses casos. [proposta]
4. **Privacidade da lista.** A lista mostra primeiro nome, empresa e "setor e fila" de gente que ainda não aceitou nada. Mantive porque o prompt pede (vira o critério de escolha), mas recomendo mostrar só o setor na lista e a fila apenas depois de entrar. Encaminhar ao `security-engineer`.
5. **WhatsApp com quem entra depois.** Quem liga o compartilhamento com 1 de 3 expõe o número a quem ainda vai chegar. A tela avisa explicitamente e permite desligar; alternativa mais segura: liberar o switch só com o grupo completo (custa o uso nos primeiros minutos). Decidir com Security.
6. **Ponto de encontro do grupo.** Não usei os Pontos de Conexão (VIP+), para não expor cadeado ao Executivo. Precisa de pontos físicos próprios.
7. **Diamond sem massa crítica.** Se a edição tiver poucos Diamond, a lista fica vazia e "sem grupo com vaga" vira o padrão; juntar Diamond com VIP quebraria a regra de categoria (pergunta 2 do prompt). Recomendo decidir antes de construir os dados de exemplo.
8. **Dúvida para o PO:** o que acontece com o grupo depois do evento (some no último dia, ou segue como contato por 90 dias como a Minha rede, D7)? A spec assume que o WhatsApp compartilhado deixa de aparecer ao fim do evento até o PO responder.
