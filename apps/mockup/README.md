# Protagon · Mockup (Fase 1, Etapas 3 e 4)

Protótipo navegável do app do aluno, numa moldura de iPhone 390×844, com painel de demonstração ao lado. Só front-end: sem backend, dados fictícios. Cobre as 35 telas do inventário da Etapa 1 (`docs/design/etapa-1.html`) e as três funcionalidades aprovadas depois (DEC-003 e DEC-004): **Grupos de 3** (GR01 a GR06), **Ofertas do palco** (OF01 a OF04) e a **atividade Gaia One** (GA01 a GA03), sem aba nova. Tudo é alcançável pelo app e/ou pelo painel.

## Como rodar

```bash
cd apps/mockup
npm install
npm run dev           # servidor local (Vite)
npm run typecheck     # TypeScript strict
npm run build         # gera dist/ com caminhos relativos (base './'), pronto para hospedar como página estática
npm run build:single  # um único dist-single/index.html (JS, CSS e marca embutidos)
npm run smoke         # roteiro Playwright (VIP e Executivo); precisa de dist/ (npm run build) e de Chrome/Chromium
npm run qa            # verificações de QA da Etapa 4 (scripts/qa.mjs): estados, contraste, fonte, alvos, foco, regras, toques, brilho, notificações, agora também nas telas de Grupos, Ofertas e Gaia One. Também precisa de dist/. Seções: node scripts/qa.mjs b c e
```

`npm run smoke` (cobre também o motivo por desafio e conhecimento e o Instagram só após o aceite) serve o `dist/` numa porta local, percorre o dia de um aluno VIP (login ao fim do Dia 3) e o de um Executivo, depois os fluxos de Grupos, Ofertas e Gaia One, falha se houver erro de console e salva uma captura por tela em `docs/design/capturas/etapa-3/` (prefixos `vip-`, `exec-`, `gr-`, `of-` e `ga-`). Variáveis: `SMOKE_URL` (usar um servidor já rodando), `SMOKE_DIST` (outra pasta de build), `SMOKE_ONLY` (`vip`, `exec`, `groups`, `offers`, `gaia`, separados por vírgula), `CHROME_PATH`, `SMOKE_OUT`.

Os testes dos três fluxos conferem, entre outras coisas: **nenhuma oferta** (nome, preço, "Oferta do palco", "Ofertas do evento") aparece na página inteira, inclusive no painel, antes de "Liberar oferta" (Home, Trilha, detalhe da sessão do pitch, Materiais, Eu, Notificações, busca de Explorar), e o módulo de dados da oferta nem é baixado; **ninguém vê grupo de outra categoria** (lista, Meu grupo, código, leitor de QR e Gaia One, nos 3 ingressos); a lista de grupos mostra só primeiro nome, setor e vagas; o código de outra categoria dá a mesma mensagem do código inexistente; o WhatsApp do grupo nasce desligado e o número de ninguém é impresso; a oferta que o ingresso não tem nunca cria card, aviso nem cadeado.

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
| `go` | qualquer código da Etapa 1 (`E01` a `U05`, mais `E04n`, `A04c` e `C01b`) e os novos `GR01` a `GR06` (mais `GR02v` e `GR05n`), `OF01` a `OF04` (mais `OF02x` e `OF02e`) e `GA01` a `GA03` | Leva à tela e ajusta ingresso, perfil, rede de exemplo, dia, formação e oferta quando a tela exige |
| `groups` | `none`, `one`, `two`, `full` | Estado do aluno no grupo: sem grupo, 1 de 3, 2 de 3 ou completo (na categoria do ingresso) |
| `formation` | `closed` | Formação dos grupos já encerrada (sem isso, ela abre às 8h e fecha às 10h45 do Dia 1) |
| `offer` | `1`, `2` ou `1,2` | Libera a oferta do Dia 2 e/ou a do Dia 3, sem toast (os dados só são carregados por isso) |
| `gaia` | `start`, `1` a `4`, `done` | Atividade Gaia One iniciada, passo atual ou concluída |
| `device` | `ios`, `android` | Aparelho do passo 1 do Gaia One (App Store ou Google Play) |
| `err` | `1` | Simula falha de rede em Grupos, Ofertas e Gaia One (estado "erro" com "Tentar de novo") |
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
| C01 | Dados, nicho e objetivo no Protagon, objetivos (até 3), interesses (até 8), visibilidade (inclui nicho, objetivo, foto e maior desafio), "Depois do aceite, você compartilha" (uma chave por canal, desligadas), consentimento com texto completo e link da política, desligado (DEC-002 e SEC-001 a SEC-003) | `go=C01` | Onboarding (VIP), aba Conexões ou card da Home: "Ativar perfil" |
| C01b | "Complete seu perfil" (opcional): maior desafio (com chave "Mostrar meu maior desafio"), "Domina" (até 3), nicho, objetivo, WhatsApp (vem da compra, editável), LinkedIn e Instagram | `go=C01b` ou `?auth=app&connections=1&overlay=profile` | Card "Complete seu perfil" em Conexões > Sugestões, logo abaixo do card de sugestão (fechável); Eu > "Meu perfil de Conexões"; menu "..." de Conexões |
| C02 | Fila com afinidade e motivo (cruzamento desafio x conhecimento ou, sem ele, interesses e objetivos), nicho e objetivo no Protagon, "Maior desafio" e "Domina", fim, limite diário, perfil pausado, antes do evento (proposta) | Painel "Pedidos hoje: Esgotar"; momento "Antes do evento"; pausar em C11 ou U03 | Aba Conexões |
| C03 | Antes do aceite (nicho, objetivo, maior desafio e "Domina" completos), pedido enviado (Pendente), pedido recebido, conectados (só os canais que a pessoa liberou: Larissa não mostra LinkedIn, Felipe não mostra Instagram); Instagram antes do aceite só com a opção de Privacidade ligada (proposta) | `go=C03` (conectado); "Carregar rede de exemplo" | Toque no card, em "Ver perfil" ou numa linha de Explorar, Pedidos ou Minha rede |
| C04 | Modelos, mensagem própria, enviado, limite atingido | `go=C04`; "Esgotar" | "Conectar" |
| C05 | Com pedidos, vazio, aceito (vibração), recusado em silêncio (D5) | `go=C05` | Aba Conexões, Pedidos; "Aceitar" e "Agora não" |
| C06 | Filtros (segmento, cidade, objetivo, "Domina", ingresso), busca também por nicho e tema, resultados, sem resultados | `go=C06` | Aba Conexões, Explorar; combine "Segmento: Agronegócio" com "Ingresso: VIP" (ou busque um termo que não existe) para ver "sem resultados" |
| C07 | Primeira mensagem, conversa, encontro proposto, confirmado, outro horário | `go=C07` (conversa e encontro proposto a você); painel "Outro confirma" e "Outro horário" | "Conversar" depois do aceite; nos dados de exemplo, Larissa (primeira mensagem), Isabela (proposto), Felipe (confirmado), Renata (outro horário) |
| C08 | Próximo intervalo + Ponto, almoço, escolher outro | `go=C08` | "Vamos nos ver?" no chat, perfil ou depois do aceite |
| C09 | Lista, vazia, nota privada, exportar só os canais que cada pessoa liberou, com aviso de uso responsável (só depois do evento, D7; SEC-007) | `go=C09`; momento "Depois do evento" | Aba Conexões, Minha rede |
| C10 | Câmera, pessoa encontrada, aguardando confirmação, conectados; Executivo cai no C00 | `go=C10` | "Ler QR" em Conexões ou na Credencial |
| C11 | Bloquear, denunciar (motivo "Assédio ou comportamento inadequado", "Bloquear também", caminho urgente "Falar com a equipe no estande"), desfazer conexão, pausar meu perfil | `go=C11` | Menu "..." em perfil e chat |
| M01 | Liberado, agendado, baixado, concluído, offline (só baixados) | Momento (Dia 1: "Sessão ao vivo" mostra os agendados; "Fim do dia" mostra liberado, baixado e concluído); "Sem internet" | Aba Materiais |
| M02 | PDF, workbook, áudio, vídeo | `go=M02`; momento "Fim do dia" libera os demais | Toque num material liberado |
| U01 | Dados da compra, selo, CPF mascarado; "Meu perfil de Conexões" (nicho, objetivo, desafio, "Domina", Instagram) para VIP e Diamond com perfil ativo, com "Completar perfil" ou "Editar perfil" | `go=U01`; `?connections=1&tab=eu` | Aba Eu |
| U02 | Por categoria, permissão negada | `go=U02`; painel "Permissão" | Eu, Notificações |
| U03 | Campos visíveis, canais após o aceite, "Mostrar meu Instagram antes da conexão" (selo "proposta", desligado por padrão; ligar pede confirmação com o aviso de que o Instagram fica fora do app), perfil pausado, excluir dados com confirmação, dados excluídos | `go=U03` | Eu, Privacidade; Conexões, menu "..." |
| U04 | Pendente, respondida, NPS final | Momento "Fim do dia" ou "Depois do evento" | Eu, Avaliação do dia; cartões da Home |
| U05 | FAQ, falar com o CS | `go=U05` | Eu, Suporte e FAQ |
| GR01 | Antes de abrir (Trilha, "Abre às 8h"), aberta na palestra e no intervalo (contagem até 10h45), sem vaga, sem internet, em grupo (1/3, 2/3, completo, encaixado pelo time), encerrada sem grupo | `go=GR01`; painel "Grupos de 3" | Home (card), bloco "Formação dos grupos" da Trilha (Dia 1, 9h15), Eu > "Meu grupo" |
| GR02 | Carregando, lista (só primeiro nome, setor e vagas), vazia, grupo cheio ao tentar entrar, sem internet, erro, formação encerrada | `go=GR02`, `go=GR02v`; painel "Alguém entra antes de mim" | "Formar meu grupo" |
| GR03 | Gerando, criado (código de 4 consoantes e QR), "Só por código", alguém entrou com a tela aberta, sem internet (cache) | `go=GR03`; painel "Alguém entrou no meu grupo" | "Criar grupo" na lista; "Mostrar código" em Meu grupo |
| GR04 | Digitando, código não encontrado (mesma mensagem para código de outra categoria), grupo cheio, encerrada, sem internet, erro; câmera: explicação, diálogo do sistema, negada, leitor próprio (não é o C10) | `go=GR04`; códigos de exemplo abaixo | "Entrar com código ou QR" na lista |
| GR05 | Encaixado ("Escolhido pelo app"), sem vaga (cria o grupo e avisa), erro, sem internet | `go=GR05`, `go=GR05n` | "Me coloque em um grupo" |
| GR06 | 1/3, 2/3, completo, encaixado pelo time, grupo de 4 (proposta), alguém entrou e saiu, WhatsApp (desligado, confirmação, reciprocidade), pedir troca ou denunciar, sair, formação encerrada, sem internet, editar nome (inválido, erro) | `go=GR06`; painel "Grupos de 3" | Home (tile "Meu grupo"), Eu > "Meu grupo", Trilha (nomes nas dinâmicas em trio) |
| OF01 | Nada antes da liberação, toast único de 6 s e card de destaque, tile discreto (vista, "Agora não", interesse enviado, compra confirmada), duas ofertas, encerrada some, sem acesso (nada aparece) | `go=OF01`; painel "Ofertas do palco" > "Liberar oferta" | Home |
| OF02 | Padrão (preço só da categoria), interesse enviado, em confirmação, compra confirmada, condição encerrada, não disponível para o ingresso, sem internet (QR do estande), carregando, erro | `go=OF02`, `go=OF02e`, `go=OF02x` | "Ver oferta"; checkout simulado em "Assinar" |
| OF03 | Dados enviados e finalidade, corrigir telefone, enviando, enviado e "Cancelar pedido", reabrir, sem internet, erro | `go=OF03` | "Falar com um consultor" |
| OF04 | Ativas, só encerradas, carregando, erro (a tela não existe antes da 1ª liberação) | `go=OF04` | Eu > "Ofertas do evento" (só depois da liberação) |
| GA01 | Não iniciada (só o bloco na Trilha), iniciada, em andamento, concluída, sem internet | `go=GA01`; painel "Gaia One" | Home, Trilha (Dia 2, 9h20) |
| GA02 | Passos 1 a 4, concluída, sem internet, erro ao abrir a loja, iPhone e Android, contagem do grupo | `go=GA02`; painel "Passo do checklist" e "Aparelho" | "Começar" ou "Continuar" |
| GA03 | Equipe de apoio, perguntas frequentes, "Pedir ajuda no meu lugar" (proposta), sem internet | `go=GA03` | "Preciso de ajuda" |

## Estrutura

```
src/
  assets/brand/            # protagon-logo.svg (wordmark oficial), protagon-simbolo.webp (versão antiga do símbolo, não usada: o leão vem do SVG)
  assets/fonts/            # Sora latin (variável 400 a 700, woff2), embutida: o mockup não busca fonte na rede
  styles/tokens.css        # espelho de docs/design/tokens.json em variáveis CSS (glass.nav 0,84, F6)
  styles/index.css         # Tailwind + utilitários (glass-nav, card, tabular) + reduced motion
  data/                    # dados de exemplo tipados: edição, agenda (3 dias, D2), materiais, participantes, pedidos,
                           # notificações, conteúdo do local (onde comer, FAQ, o que levar, contatos fictícios);
                           # groups.ts (grupos por categoria), gaia.ts, offerTypes.ts e offers.ts (só carregado na liberação)
  lib/                     # clock (relógio do evento e fase da pausa), affinity, connections (relação, fila, encontros),
                           # materials, nav (goTo: "Ir direto para"), liveActivity, haptics, format, scroll
  state/store.ts           # estado global (zustand): ingresso, momento, pilha de páginas, Conexões, chat, notas...
  state/features.ts        # estado de Grupos, Ofertas e Gaia One (lê ingresso, dia e momento do store)
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
    groups/                # GR01 a GR06 (card, lista, criar, código, Meu grupo)
    offers/                # OF01 a OF04 (card da Home, tela, formulário de interesse, checkout simulado, lista)
    gaia/                  # GA01 a GA03 (card, checklist, ajuda)
scripts/smoke.mjs          # roteiro Playwright (VIP, Executivo, Grupos, Ofertas e Gaia One) + capturas
```

Tailwind lê os tokens via `tailwind.config.ts`. Cor ou medida solta em componente é bug.

## Regras que o código já aplica

- Botão verde e selo dourado com texto `#020111` (`text-on-cta`, `text-on-gold`). Destrutivo: contorno vermelho; preenchido só na confirmação, com texto `#020111`.
- Vidro só na tab bar e nos bottom sheets. `prefers-reduced-motion` e `prefers-reduced-transparency` respeitados.
- Marca: wordmark branco do SVG oficial no login, onboarding e antes do evento; leão (recorte do mesmo SVG, gradiente dourado) na TopBar da Home e na credencial.
- Durante a palestra só chegam notificações operacionais; as demais ficam em espera até o intervalo. Mensagens e pedidos enviados na palestra são entregues no intervalo.
- Contato pessoal (WhatsApp, LinkedIn, Instagram) só aparece depois do aceite mútuo (C03 conectados, Minha rede, chat); não existe chat aberto. Única exceção, proposta e desligada por padrão (DEC-002): Eu > Privacidade > "Mostrar meu Instagram antes da conexão" mostra o @ de quem também liberou, no card e no perfil; ao ligar, o app avisa que bloquear e denunciar daqui não valem no Instagram. Consentimento de Conexões desligado por padrão; CPF sempre mascarado.
- Cadeado do Executivo só na aba Conexões e em um card da Home; convite só ao tocar em "Conectar", sempre fechável.
- Agenda, mapa e credencial a no máximo 2 toques: as páginas empilhadas deixam a tab bar visível (só a credencial e a tela do intervalo ocupam a tela inteira, e ambas têm saída direta).
- Linguagem das Conexões: conectar, afinidade, interesses em comum, Pendente. Sem "match", "curtir" ou corações.
- Tipografia (Etapa 4): corpo e texto corrido em 16 px; rótulos de ação (chips, filtros, abas, tab bar) em 14 ou 15 px com peso 500 a 600 (`text-label-sm` e `text-label`, propostos ao designer para entrar em `tokens.json`); 13 px só em metadado curto (hora, contador, legenda). Alvo de toque de 48 px em controles; 44 px é o mínimo.
- Acessibilidade (Etapa 4): sheets com foco preso e o resto da moldura `inert`; páginas empilhadas deixam a aba de trás `inert` e devolvem o foco ao gatilho ao fechar; a tab bar é `nav` com `aria-current`.
- Grupos (DEC-003, DEC-004, SEC-018 a SEC-021, SEC-026): grupos de 3 da mesma categoria, nunca misturados (cada ingresso só enxerga os grupos do próprio ingresso, e a lista, o código e o QR respondem pela categoria). A formação abre às 8h e fecha às 10h45 do Dia 1; depois, só o time encaixa quem ficou sem grupo (botão do painel). A lista mostra primeiro nome, setor (sem fila) e vagas; empresa e foto só em "Meu grupo". "Mostrar meu grupo na lista" nasce ligado; desligado vira "Só por código". O código tem 4 consoantes sem ambiguidade (sem L, Q, Y) e a mensagem de código inexistente, expirado ou de outra categoria é uma só. WhatsApp do grupo: chave desligada por padrão, só vê quem também compartilha e só quando o grupo completa ou a formação fecha; o número de ninguém é impresso na tela. "Algum problema com o grupo?" (pedir troca ou denunciar) existe para os 3 ingressos. O leitor de QR de grupo é próprio: não é o C10 e não cai no C00 para o Executivo.
- Ofertas (DEC-003, DEC-004, SEC-022, SEC-023, SEC-025): antes de "Liberar oferta" nada da oferta existe no app (nem na Trilha, Materiais, Notificações, busca ou Eu) e os dados nem são carregados (`import()` dinâmico do módulo `offers`, chunk à parte no build normal). Liberada: card no topo da Home e um toast de 6 s, uma vez, sem som, sem vibração e sem push (única exceção à regra 5); a notificação entra como lida e não soma no sino. "Ofertas do evento" só aparece depois da 1ª liberação para o ingresso do aluno. Quem não tem a oferta no ingresso nunca vê card, toast nem item, e nunca cadeado. O formulário de interesse lista o que será enviado (nome, e-mail, telefone editável e ingresso), diz para quem e para quê e nunca leva CPF nem dado das Conexões. O checkout é externo e simulado, com aviso de saída e aviso antifraude; o app não afirma a compra antes da confirmação. Prazo real, contagem sem alarme e sem "restam N vagas".
- Gaia One (SEC-024, SEC-030): progresso autodeclarado, links das lojas simulados e textos pendentes marcados "[a confirmar]". O grupo vê só quantos já ativaram, sem nomes.
- Perfil (Etapa 4): cada canal de contato (WhatsApp, LinkedIn, Instagram) tem chave própria, desligada por padrão; o C03 e a exportação mostram só os canais que cada pessoa liberou; o maior desafio tem chave própria (desligada, ele não aparece nem gera motivo para os outros). Máscara de CPF: só os 2 últimos dígitos (`***.***.***-35`), como na recomendação de stack.

## Códigos de exemplo e dados dos novos fluxos

- Códigos de grupo com vaga (painel "Grupos de 3" mostra o da categoria escolhida): Executivo `MKRB`, VIP `KTVR`, Diamond `RCWD`. `ZHGV` é um grupo VIP "só por código" (não aparece na lista, mas entra). Código de outra categoria ou inexistente (ex.: `XXXX`) responde igual.
- Por categoria: VIP tem 9 grupos (3 completos), Diamond 3 e Executivo 4. Como o Executivo só tem 7 alunos em `participants.ts`, `data/groups.ts` traz 4 alunos extras só para os grupos dele (marcados `extra`).
- Ofertas (valores fictícios): a do Dia 2 (liberada às 18h15, condição até 19h10 do Dia 3) é para VIP e Diamond, com preço próprio por categoria; a do Dia 3 (18h15, condição por 7 dias) é para as 3 categorias. Pela spec do designer o Executivo não tem a do Dia 2 (o PO listava o contrário): a matriz está em `prices` de `data/offers.ts` e muda em uma linha.
- Os blocos novos da agenda ("Formação dos grupos", Dia 1 9h15 a 9h30, e "Atividade: Gaia One", Dia 2 9h20 a 9h30) têm ID fixo (`d1-grupos`, `d2-gaia`): os IDs `d1-sNN` dos blocos antigos não se deslocam, então materiais, `agendaChange` e os horários do chat seguem apontando para a sessão certa.

## Limites desta versão

- Ofertas: no mockup o módulo com preço e bônus está no código publicado; ele só deixa de ser carregado até a liberação (no `build:single` tudo vai embutido, então a garantia vale para a interface, não para o arquivo). No app real a oferta só existe no servidor (SEC-025).
- Gaia One: o fundador ainda não passou o texto do produto, os links das lojas, a duração do teste, o código promocional nem se o teste pede cartão; tudo isso está marcado "[a confirmar]". "Já ativei" é autodeclarado. A lista nominal para o palco não existe (só contagem).

- Câmera do C10, download, Wallet, abrir app de mapas e WhatsApp são simulados (toast ou botão "Simular").
- A Live Activity e a Dynamic Island são desenhos na moldura; no app real exigem ActivityKit.
- O ranking de afinidade usa os objetivos e interesses do C01 e, se preenchidos, o maior desafio e o "Domina" (`src/lib/affinity.ts`). O cruzamento (desafio de um com o conhecimento do outro) pesa 6 por direção, acima de interesse (2) e objetivo (3); o motivo em uma linha prioriza o cruzamento ("Domina tráfego pago, seu maior desafio hoje"; se mútuo, "Vocês podem se ajudar: ... ↔ ...") e cai no motivo antigo sem ele. Os dados de exemplo são fixos (`src/data/participants.ts`, vocabulário `topics`).
- Notas, anotações e conversas vivem só no estado da página; recarregar reinicia a demo.
- Em sessão ao vivo, o painel só oferece os modelos de notificação do momento. Conexões e material que chegariam na palestra (inclusive as de boas-vindas) ficam "em espera até o intervalo"; ao voltar para a palestra, o que era não lido volta para a espera.
- Textos de prazo ("cópias de segurança apagadas em até 30 dias") e "não usamos para venda de outros produtos" são propostas para o jurídico e para a decisão DD-04; o segundo leva o selo "Proposta".
