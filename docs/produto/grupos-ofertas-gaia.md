# Grupos de 3, Ofertas ao vivo e Atividade Gaia One: regras e critérios de aceite

Status: proposta para o mockup | Dono: PO | Data: 2026-11-26 | Fonte da verdade: `docs/produto/prompt-grupos-ofertas-gaia.md` (aprovado pelo fundador)
Histórias: GR-01 a GR-20, OF-01 a OF-14, GA-01 a GA-10 (IDs provisórios; o CEO numera como PT-### ao entrar no backlog).

Tudo é mockup (sem backend, dados fictícios, relógio controlável). As regras de `CLAUDE.md` §8 valem. Onde o fundador não respondeu ao §8 do prompt, a regra está marcada **(proposta)** e é o que o mockup segue.

## 0. Pontos críticos (ler primeiro)

1. **Ofertas e a regra de silêncio nas palestras (CLAUDE.md §8.5).** Venda não é aviso operacional. O prompt aprova um toast discreto durante a palestra: isso é uma exceção à regra 5 e precisa de DEC do CEO/fundador. Proposta: toast só com o app aberto, sem som, sem vibração, sem push; o card na Home persiste. Push só com aprovação explícita (pergunta 6).
2. **Pressão de venda no pico emocional.** As duas ofertas caem no último bloco do dia (18h15), com a plateia no auge. Mitigações já nas regras: prazo real e longo (não "só hoje"), sem "restam N vagas", "Agora não" sem culpa e sem reaparecer em pop-up, uma única notificação por liberação. Venda online/fora do estabelecimento tem direito de arrependimento (CDC, art. 49): encaminhar ao fundador/jurídico, eu não sou advogado.
3. **Executivo e cadeado (§8.4).** Oferta não disponível para o ingresso NÃO usa cadeado, não faz upsell e não aparece em card. Cadeado continua só na aba Conexões e em no máximo um card da Home.
4. **Privacidade da lista de grupos.** A lista "grupos com vaga" mostra nome, empresa e setor de pessoas que talvez nunca tenham consentido com Conexões. Ver LGPD em §1.5; precisa de parecer do `security-engineer` antes do app real.
5. **Ingresso com poucos alunos.** No mockup, a lista de participantes tem 7 Executivo, 22 VIP e 11 Diamond (contagem minha em `participants.ts`). Executivo dá 2 trios e 1 sobra. Numa edição real, o Diamond pode ter menos de 6 pessoas. Regra de fallback em GR (R-GR-8).
6. **Agenda muda.** Nem "Formação dos grupos" nem "Atividade: Gaia One" existem hoje em `agenda.ts`. Eles precisam virar blocos (§4). Inserir linhas desloca os IDs `d1-sNN`/`d2-sNN`; `agendaChange.sessionId` (`d1-s12`) passa a `d1-s13`. Aviso ao `mobile-dev`.
7. **Oferta "invisível" no mockup.** O dado da oferta estará no bundle do mockup (limitação). Critério vale para a interface: nenhuma tela, busca, notificação ou material a referencia antes do "Liberar oferta". No app real, a oferta só chega ao aparelho depois da liberação, vinda do servidor.

## 1. Grupos de 3 (GR)

### 1.1 Regras de negócio

| ID | Regra |
|---|---|
| R-GR-1 | Grupo de 3 da mesma categoria (Executivo, VIP, Diamond). O app só mostra e aceita grupos da categoria do aluno. Código de outra categoria responde como código inexistente (não revela que existe). |
| R-GR-2 | Vale para os 3 dias. Um aluno, um grupo. Não depende de Conexões; os três ingressos usam. |
| R-GR-3 | Formação abre no Dia 1 às 09h00 (card na Home) e fecha às **10h45** (proposta, pergunta 1: fim do 1º intervalo). Bloco da Trilha: "Formação dos grupos" 09h15 a 09h30 (§4). Entrar e criar funcionam em qualquer momento da janela; avisos aos outros membros respeitam o silêncio das palestras (R-GR-9). |
| R-GR-4 | Fechamento: quem ficou sem grupo é encaixado pelo time até o almoço (12h30). No mockup, botão do painel. Aviso ao aluno só fora de palestra. |
| R-GR-5 | Sobra **(proposta, pergunta 1)**: resto 1 vira um grupo de 4; resto 2 vira dois grupos de 4 (se a categoria tem 8 ou mais) ou um grupo de 2 (se tem menos). Justificativa: a dinâmica em trio pede duas testemunhas, então 4 serve melhor que 2. O time pode alterar. |
| R-GR-6 | Nome oficial **(proposta, pergunta 3)**: número sequencial por edição, atribuído quando o grupo completa ("Grupo 12"), único entre categorias para uso no palco. Apelido opcional, editável por qualquer membro, visível só ao grupo. Justificativa: palco precisa de identificador curto e inequívoco. |
| R-GR-7 | Sair: só com a formação aberta; a vaga volta à lista. Depois do fechamento, só o time no estande. |
| R-GR-8 | Categoria com menos de 3 alunos presentes **(proposta, pergunta 2)**: nunca misturar categorias no app. O card mostra "A equipe vai te informar seu grupo" e o time decide fora do app. Justificativa: a regra do fundador é "mesma categoria"; misturar exige decisão dele. |
| R-GR-9 | Durante palestra: sem push e sem vibração para eventos de grupo; o aviso aparece como badge/toast ao abrir o app e com vibração apenas em intervalo ou dinâmica. (A vibração do prompt vale para o próprio aparelho do aluno; o mockup só pode simular a do aluno que age.) |
| R-GR-10 | "Me coloque em um grupo": encaixa no grupo com vaga do setor mais próximo; se não houver nenhum com vaga, abre um grupo novo com o aluno e avisa. |
| R-GR-11 | WhatsApp no grupo: desligado por padrão. Só vê o número de um membro quem ativou o seu também (reciprocidade, coerente com "contato só após aceite mútuo", §8.3). Sem chat no app **(proposta)**: o grupo conversa no WhatsApp. |
| R-GR-12 | Grupo e Conexões são independentes: não herdar a flag de visibilidade de Conexões (`visible`) na lista de grupos, e entrar no mesmo grupo não cria conexão. |
| R-GR-13 | Dinâmicas em trio usam o grupo: D1 17h00 (já "em trios") e D2 10h45 (proposta: "o líder que eu sou hoje", compara autopercepção com a do grupo). D2 17h00 segue em duplas. |

### 1.2 Cadeia de privacidade e LGPD (GR)

- Lista de grupos com vaga: mostrar **primeiro nome + empresa + setor** (sem fila, sem sobrenome, sem foto, sem cargo). A fila revela localização física precisa; setor basta para a busca. (Mudança sobre o prompt, que cita "o setor/fila"; **proposta**, pedir parecer ao `security-engineer`.)
- Aviso antes de criar/entrar (bottom sheet, 1 toque "Continuar", sem caixa pré-marcada): "Seu primeiro nome e sua empresa ficam visíveis para alunos do seu ingresso enquanto o grupo tiver vaga." Finalidade: formar o grupo. Separado do consentimento de Conexões (que continua desligado por padrão).
- Foto, sobrenome, cargo e WhatsApp só aparecem dentro de "Meu grupo" e só para membros.
- Grupo completo sai da lista (cessa a exposição). Aluno que sai tem o nome removido da lista na hora.
- Nada de CPF. Nenhum dado de grupo em evento de métrica além de IDs opacos. Retenção: grupo e vínculos apagados ao fim da edição `[HIPÓTESE, definir com Security]`.

### 1.3 Critérios de aceite (Gherkin)

```gherkin
Funcionalidade: Grupos de 3

  Cenário: GR-01 entrar num grupo com vaga (feliz)
    Dado que sou VIP sem grupo e a formação está aberta
    E existe um grupo VIP com 2 membros
    Quando toco em "Entrar" nesse grupo e confirmo "Continuar"
    Então vejo "Grupo completo" com 3 membros
    E o grupo some da lista de grupos com vaga
    E levo menos de 60 segundos desde o toque no card da Home

  Cenário: GR-02 criar grupo (feliz)
    Dado que sou VIP sem grupo e a formação está aberta
    Quando toco em "Criar um grupo"
    Então vejo um código de 4 letras e um QR
    E meu grupo aparece como "2 vagas" na lista dos VIPs

  Cenário: GR-03 entrar por código ou QR (feliz)
    Dado que um colega VIP me mostra o código "KRTA" de um grupo com 1 vaga
    Quando digito "KRTA" em "Entrar com código ou QR"
    Então entro no grupo e vejo "Meu grupo" com 3 membros

  Cenário: GR-04 "Me coloque em um grupo" (feliz)
    Dado que existem 2 grupos VIP com vaga, um no meu setor
    Quando toco em "Me coloque em um grupo"
    Então entro no grupo do meu setor

  Cenário: GR-05 grupo completa e vira "Meu grupo"
    Dado que estou num grupo com 2 membros
    Quando um terceiro aluno entra
    Então vejo "Grupo completo" e o número oficial (ex.: "Grupo 12")
    E vejo foto, nome, empresa e setor dos 3 membros

  Cenário: GR-06 limite, grupo cheio ao tentar entrar
    Dado que vejo um grupo com 1 vaga na lista
    E outro aluno entra antes de mim
    Quando toco em "Entrar"
    Então vejo "Esse grupo acabou de completar" e a lista atualizada
    E não fico em nenhum grupo

  Cenário: GR-07 limite, um grupo por aluno
    Dado que já estou no "Grupo 12"
    Quando tento entrar com o código de outro grupo
    Então vejo "Você já está no Grupo 12. Saia dele para entrar em outro"
    E a opção de sair só existe com a formação aberta

  Cenário: GR-08 duplo toque em "Entrar"
    Dado que existe um grupo com 1 vaga
    Quando toco duas vezes seguidas em "Entrar"
    Então ocupo uma única vaga

  Cenário: GR-09 código inválido ou de outra categoria
    Dado que sou Executivo
    Quando digito o código de um grupo Diamond
    Então vejo "Código não encontrado"
    E a mensagem é idêntica à de um código que não existe

  Cenário: GR-10 permissão por ingresso
    Dado que sou Executivo
    Quando abro a lista de grupos com vaga
    Então vejo só grupos Executivo
    E nenhum nome, empresa ou setor de VIP ou Diamond aparece em lugar algum

  Cenário: GR-11 vazio
    Dado que não há grupos com vaga na minha categoria
    Quando abro a lista
    Então vejo "Nenhum grupo com vaga agora. Crie um ou peça para o app te encaixar."

  Cenário: GR-12 sem grupo e formação encerrada às 10h45
    Dado que são 10h45 e não estou em grupo
    Então criar e entrar ficam indisponíveis
    E vejo "A formação terminou. A equipe vai te encaixar em um grupo"
    Quando o time encaixa os sem grupo
    Então vejo "Encaixado pela equipe" e o "Meu grupo" com o número oficial

  Cenário: GR-13 sair do grupo com a formação aberta
    Dado que estou num grupo de 2 e a formação está aberta
    Quando toco em "Sair do grupo" e confirmo
    Então o grupo volta a "2 vagas" com os membros restantes
    E meu nome some da lista

  Cenário: GR-14 sair depois do fechamento
    Dado que a formação está encerrada
    Quando abro "Meu grupo"
    Então não há botão "Sair"
    E vejo "Para trocar de grupo, procure a equipe no estande"

  Cenário: GR-15 WhatsApp desligado por padrão e reciprocidade
    Dado que estou num grupo completo e não ativei o compartilhamento
    Então não vejo o WhatsApp de nenhum membro
    Quando ativo "Compartilhar meu WhatsApp com o grupo"
    Então vejo apenas o WhatsApp dos membros que também ativaram

  Cenário: GR-16 consentimento de exposição na lista
    Dado que vou criar ou entrar num grupo
    Então antes de concluir vejo o aviso de que meu primeiro nome e empresa ficam visíveis aos alunos do meu ingresso
    E não existe caixa pré-marcada

  Cenário: GR-17 aviso durante palestra
    Dado que são 09h45 (palestra) e alguém entrou no meu grupo
    Então não há push nem vibração
    E ao abrir o app vejo o aviso "Ana entrou no seu grupo"

  Cenário: GR-18 offline
    Dado que estou sem internet
    Quando abro "Meu grupo" ou o QR do meu grupo
    Então vejo a última versão salva e o QR funciona
    E ao abrir a lista de grupos vejo "Sem internet. A lista precisa de conexão"
    E "Entrar" e "Criar" ficam desabilitados com o motivo

  Cenário: GR-19 categoria com menos de 3 alunos
    Dado que minha categoria tem 2 alunos presentes
    Então o card mostra "A equipe vai te informar seu grupo"
    E não aparecem grupos de outra categoria

  Cenário: GR-20 Trilha mostra o grupo
    Dado que estou no "Grupo 12" completo
    Quando abro a dinâmica "compromissos do dia" (D1 17h00)
    Então vejo os nomes dos 3 membros do meu grupo
```

### 1.4 Métricas (GR)

Propriedades comuns: `edition_id`, `tier`, `day`, `user_id` opaco, `group_id` opaco. Sem nome, empresa ou texto livre (apelido do grupo fica fora do analytics).

| Evento | Gatilho | Propriedades extras | Responde |
|---|---|---|---|
| `group_flow_started` | abre o card "Forme seu grupo" | `entry` (home, trilha) | alcance do card |
| `group_created` | grupo criado | | quantos criam vs entram |
| `group_joined` | entrou (servidor) | `via` (list, code, qr, auto_match, team_placed), `size_after`, `seconds_since_flow_started` | tempo até entrar (meta: mediana menor que 60 s) |
| `group_join_failed` | tentativa recusada | `reason` (full, wrong_code, already_in_group, closed, offline) | atrito |
| `group_completed` | chegou a 3 (ou 4/2 por decisão do time) | `size`, `minutes_since_open`, `minutes_since_created` | tempo até completar |
| `group_left` | saiu | | instabilidade |
| `group_formation_closed` | 10h45 | `grouped_count`, `ungrouped_count` | % formado sozinho antes do fechamento |
| `group_team_placed` | time encaixou | `count` | carga do time |
| `group_whatsapp_sharing_toggled` | alterna | `enabled` | uso do contato |

Metas `[HIPÓTESE]`: 85% ou mais agrupados antes do fechamento; mediana abaixo de 60 s no fluxo; abaixo de 15% encaixados pelo time. Não comparar categorias com menos de 30 pessoas (metricas.md §1).

## 2. Ofertas ao vivo (OF)

### 2.1 Regras de negócio

| ID | Regra |
|---|---|
| R-OF-1 | Antes de "Liberar oferta": invisível em Trilha, Materiais, Notificações, busca, Home e em qualquer contagem. O bloco do pitch na Trilha mantém o título normal da sessão ("O legado do líder"). |
| R-OF-2 | A liberação é manual pelo time, no momento da apresentação. O prazo da condição é cadastrado antes, mas só se torna visível na liberação. |
| R-OF-3 | Superfícies depois de liberada: card no topo da Home ("Oferta especial do palco"), tela da oferta, toast discreto uma única vez por liberação. Sem pop-up, sem tela cheia, sem som. Push só se o fundador aprovar a exceção (pergunta 6, **proposta: sem push**; justificativa: respeita o silêncio da palestra, que é o §8.5). |
| R-OF-4 | Tela da oferta: nome, para quem é, o que inclui, preço, parcelamento, bônus da condição, prazo com contagem regressiva, três ações: "Garantir minha vaga / Assinar", "Falar com um consultor", "Agora não". |
| R-OF-5 | Contagem regressiva só com prazo real, igual para todos. Proibido "restam N vagas" ou qualquer escassez não comprovada. Sem repetição do toast nem reabrir sozinho. |
| R-OF-6 | "Agora não" fecha sem confirmação e sem culpa. A oferta continua em "Ofertas do evento" (Eu) até a condição encerrar. |
| R-OF-7 | Por ingresso: cada oferta define as categorias. Fora delas, a oferta não aparece em card nem lista. Se o aluno chegar por link direto: "Esta oferta não está disponível para o seu ingresso", sem cadeado e sem botão de upgrade. |
| R-OF-8 | Compra por link de checkout externo (Hotmart) **(proposta, pergunta 5)**, aberto fora do app, mais consultor no estande. Justificativa: evita cobrança dentro do app e a dúvida de política das lojas, que segue `[HIPÓTESE]` não verificada. O mockup simula o checkout com a faixa "Simulação: nenhum pagamento é feito". |
| R-OF-9 | Depois do prazo: "Condição encerrada" e botão "Falar com um consultor". |
| R-OF-10 | Pós-evento **(proposta, pergunta 7)**: a oferta fica visível só até o fim da condição; depois permanece 7 dias em "Ofertas do evento" como "Condição encerrada" com botão de consultor, e então some. Justificativa: não deixar superfície de venda eterna, mas permitir contato de quem ficou na dúvida. |
| R-OF-11 | Produtos de exemplo **(proposta, pergunta 4)**, valores fictícios. Olimpo (mentoria): Dia 2, liberada às 18h15 durante "O legado do líder" (17h30 a 19h00), todos os ingressos, preço único, condição até o fim do Dia 3 (19h10). Imersão Liderança 360: Dia 3, liberada às 18h15 durante "Protagonista para sempre", apenas VIP e Diamond, preço diferente para Diamond, condição por 7 dias. Justificativa: cobre no mockup oferta para todos, oferta restrita e preço por categoria. O prazo longo evita decisão sob a emoção do palco. |
| R-OF-12 | Interesse de 1 toque: dados preenchidos mostrados antes do envio (nome, e-mail, telefone), editáveis; sem CPF. |

### 2.2 LGPD (OF)

- O formulário de interesse compartilha dados pessoais com o time comercial, finalidade nova (contato de venda). Mostrar os campos e a frase "Vamos enviar estes dados ao time comercial para falar sobre o Olimpo" imediatamente antes do botão; o envio é o ato de consentimento, sem caixa pré-marcada. Base legal e retenção a definir com o `security-engineer`.
- Contato só sobre o produto escolhido, sem entrar em lista de marketing genérica.
- Evento de métrica sem preço individual nem texto livre; compra confirmada nasce no servidor (webhook), nunca no clique.
- Mockup: dados fictícios, nenhum cartão, nenhum CPF.

### 2.3 Critérios de aceite (Gherkin)

```gherkin
Funcionalidade: Ofertas ao vivo

  Cenário: OF-01 invisível antes da liberação
    Dado que a oferta "Olimpo" ainda não foi liberada
    Então ela não aparece na Home, Trilha, Materiais, Notificações, busca nem em "Ofertas do evento"
    E o bloco "O legado do líder" mostra só o título e o objetivo normais

  Cenário: OF-02 liberação (feliz)
    Dado que são 18h15 do Dia 2 e estou na plenária
    Quando o time libera "Olimpo"
    Então vejo um toast "Oferta especial do palco disponível" sem som nem vibração
    E o card "Oferta especial do palco" aparece no topo da Home
    E a tela da oferta abre em 1 toque no card
    E nenhum pop-up cobre o app

  Cenário: OF-03 conteúdo da tela
    Dado que abri "Olimpo"
    Então vejo nome, para quem é, o que inclui, preço, parcelamento, bônus e "Condição válida até 19h10 de 14/03"
    E vejo "Garantir minha vaga", "Falar com um consultor" e "Agora não"
    E não vejo texto de escassez como "restam vagas"

  Cenário: OF-04 compra simulada
    Dado que abri "Olimpo"
    Quando toco em "Garantir minha vaga"
    Então vejo o checkout externo simulado com "Nenhum pagamento é feito"
    E ao concluir vejo "Compra concluída (simulada)"

  Cenário: OF-05 interesse com 1 toque
    Dado que abri "Olimpo"
    Quando toco em "Falar com um consultor"
    Então vejo o estande no mapa e o formulário com nome, e-mail e telefone preenchidos
    E vejo a frase de compartilhamento com o time comercial antes do botão
    Quando toco em "Enviar interesse"
    Então vejo "Interesse enviado. Um consultor vai falar com você"

  Cenário: OF-06 "Agora não"
    Dado que abri "Olimpo"
    Quando toco em "Agora não"
    Então a tela fecha sem confirmação
    E a oferta passa a aparecer em "Eu > Ofertas do evento"
    E o toast e o card de topo não voltam a abrir sozinhos

  Cenário: OF-07 permissão por ingresso, oferta restrita
    Dado que "Imersão Liderança 360" foi liberada só para VIP e Diamond
    E sou Executivo
    Então não vejo card, toast nem item na lista
    Quando acesso o link direto da oferta
    Então vejo "Esta oferta não está disponível para o seu ingresso"
    E não há cadeado nem botão de upgrade

  Cenário: OF-08 preço por categoria
    Dado que "Imersão Liderança 360" foi liberada
    Quando abro como VIP e depois como Diamond
    Então cada um vê apenas o preço da sua categoria

  Cenário: OF-09 condição encerrada
    Dado que a condição de "Olimpo" terminou
    Quando abro a oferta
    Então vejo "Condição encerrada"
    E o botão "Garantir minha vaga" está ausente
    E o botão "Falar com um consultor" continua disponível

  Cenário: OF-10 durante palestra, sem push
    Dado que a liberação ocorre durante uma palestra
    Então não é enviada notificação do sistema
    E a oferta é encontrada com 1 toque a partir da Home

  Cenário: OF-11 vazio
    Dado que não há oferta liberada para o meu ingresso
    Quando abro "Eu > Ofertas do evento"
    Então vejo "Nenhuma oferta do palco por enquanto"

  Cenário: OF-12 offline
    Dado que estou sem internet e abri "Olimpo"
    Então vejo a oferta salva, o prazo e o QR do estande para comprar lá
    E "Garantir minha vaga" e "Enviar interesse" ficam desabilitados com "Sem internet"

  Cenário: OF-13 duplo toque no envio
    Dado que o formulário de interesse está preenchido
    Quando toco duas vezes em "Enviar interesse"
    Então apenas um interesse é registrado

  Cenário: OF-14 contagem coerente com o painel
    Dado que o relógio do evento avança de 19h09 para 19h10 do Dia 3
    Então a contagem de "Olimpo" chega a zero e a oferta muda para "Condição encerrada" sem recarregar
```

### 2.4 Métricas (OF)

Propriedades comuns: `edition_id`, `tier`, `day`, `user_id` opaco, `offer_id`.

| Evento | Gatilho | Extras | Responde |
|---|---|---|---|
| `offer_released` | time libera (servidor) | `released_at` | marco do funil |
| `offer_card_viewed` | card visível na Home | `seconds_since_release` | alcance real |
| `offer_opened` | abre a tela | `seconds_since_release` | interesse inicial |
| `offer_dismissed` | "Agora não" | | rejeição |
| `offer_checkout_clicked` | toca em "Garantir minha vaga" | | intenção de compra |
| `offer_interest_submitted` | envia interesse | `channel` (app) | demanda por consultor |
| `offer_purchase_completed` | pagamento confirmado (webhook, servidor) | `value_cents` | receita |
| `offer_unavailable_viewed` | abre sem direito | | sinal de vazamento de link |
| `offer_expired_viewed` | abre depois do prazo | | demanda residual |

Funil: liberada, vista, aberta, checkout ou interesse, compra. Guardrails (app real): reclamação de venda, pedido de reembolso/arrependimento, reclamação de pressão no NPS do dia. Meta `[HIPÓTESE]`: definir com o comercial após o piloto; sem benchmark verificado. Mockup não instrumenta.

## 3. Atividade Gaia One (GA)

### 3.1 Regras de negócio

| ID | Regra |
|---|---|
| R-GA-1 | Dia 2, bloco "Atividade: Gaia One" 09h20 a 09h30 (§4). Card na Home a partir das 09h20 e persistente o dia todo para quem chegou depois ou não terminou. Não abre nada durante palestra. |
| R-GA-2 | Disponível para os três ingressos. |
| R-GA-3 | Checklist de 4 passos (baixar, criar conta, ativar trial, pronto) com progresso. Meta: concluir em menos de 3 minutos só com o app. |
| R-GA-4 | Passo 1 leva à loja do aparelho (App Store ou Google Play); QR para outro aparelho. Links reais só se o fundador passar; no mockup, simulados e marcados como tal (pergunta 8). |
| R-GA-5 | Passo 2 sugere o mesmo e-mail da compra, botão "Copiar meu e-mail". |
| R-GA-6 | Passo 3: instrução curta e código promocional com "Copiar código", se existir. Mockup **(proposta, pergunta 8)**: trial sem cartão e código fictício "PROTAGON27", e descrição do produto com texto provisório, a trocar pela frase do fundador. Justificativa: é o cenário mais simples; se o trial exigir cartão ou renovar sozinho, isso deve aparecer em destaque antes do passo 3 (transparência de cobrança, CDC). |
| R-GA-7 | "Já ativei" é autodeclaração; o app não verifica. Verificação real exigiria integração com o Gaia One `[HIPÓTESE]`, fora do mockup. |
| R-GA-8 | Wi-Fi (rede e senha) fixo no topo, com "Copiar senha". |
| R-GA-9 | Ajuda: mapa com a equipe de apoio e FAQ (sem cartão? não recebi o e-mail? já tenho conta?). |
| R-GA-10 | Progresso no grupo **(proposta, pergunta 9)**: o card mostra "2 de 3 do seu grupo concluíram" e o nome de quem concluiu, nunca de quem não concluiu; ativado por padrão, desligável pelo aluno em um toque. Justificativa: ajuda mútua no trio com exposição mínima. |
| R-GA-11 | Lista de quem concluiu para o palco **(proposta, pergunta 9)**: no mockup, só total agregado ("38 de 40"), nunca lista por pessoa. Lista nominal exige consentimento próprio e fica como requisito do app real. |

### 3.2 LGPD (GA)

- O app guarda só o estado "concluiu / não concluiu" por aluno e o passo atual; não guarda a conta criada no Gaia One.
- Status no grupo aparece apenas para membros do mesmo grupo; para o time, só agregado.
- Copiar e-mail usa dado do próprio aluno e só vai para a área de transferência dele.
- Se algum dia o Gaia One devolver confirmação de ativação, é novo compartilhamento entre sistemas: exige parecer de Security e base legal.

### 3.3 Critérios de aceite (Gherkin)

```gherkin
Funcionalidade: Atividade Gaia One

  Cenário: GA-01 concluir pelo app (feliz)
    Dado que são 09h20 do Dia 2 e abri o card "Atividade: Gaia One"
    Quando faço os passos 1, 2 e 3 e toco em "Já ativei"
    Então vejo a atividade como concluída com feedback de vibração
    E o tempo total desde "Iniciar" é menor que 3 minutos no teste com o painel

  Cenário: GA-02 loja certa por aparelho
    Dado que uso iPhone
    Quando toco em "Baixar o app"
    Então o botão aponta para a App Store (simulada)
    E o QR está disponível para quem usa outro aparelho

  Cenário: GA-03 copiar e-mail e código
    Dado que estou nos passos 2 e 3
    Quando toco em "Copiar meu e-mail" e "Copiar código"
    Então vejo a confirmação "Copiado" em cada um

  Cenário: GA-04 progresso e retomada
    Dado que concluí o passo 1 e saí do app
    Quando reabro a atividade
    Então estou no passo 2 com o passo 1 marcado

  Cenário: GA-05 não iniciada fora do horário
    Dado que são 08h00 do Dia 2
    Então não há card da atividade na Home
    E a Trilha mostra o bloco "Atividade: Gaia One" 09h20 a 09h30 sem ação

  Cenário: GA-06 ajuda
    Dado que estou travado no passo 3
    Quando toco em "Preciso de ajuda"
    Então vejo onde está a equipe de apoio e as perguntas "sem cartão?", "não recebi o e-mail?" e "já tenho conta?"

  Cenário: GA-07 Wi-Fi no topo
    Dado que abri a atividade
    Então vejo a rede "Protagon-Alunos" e "Copiar senha" no topo

  Cenário: GA-08 offline
    Dado que estou sem internet
    Quando abro a atividade
    Então vejo "Esta atividade precisa de internet" e o atalho do Wi-Fi
    E o progresso já feito continua salvo

  Cenário: GA-09 palestra em andamento
    Dado que são 10h00 do Dia 2 (palestra) e não concluí
    Então não há notificação sobre a atividade
    E o card segue na Home sem destaque de alerta

  Cenário: GA-10 progresso no grupo
    Dado que estou no "Grupo 12" e uma colega concluiu
    Então vejo "1 de 3 do seu grupo concluíram" e o nome dela
    E não vejo o nome de quem não concluiu
    Quando desligo "Mostrar meu progresso ao grupo"
    Então meu status deixa de aparecer para o grupo
```

### 3.4 Métricas (GA)

| Evento | Gatilho | Extras | Responde |
|---|---|---|---|
| `gaia_activity_started` | abre a tela pela 1ª vez | `entry` (home, trilha) | alcance |
| `gaia_step_completed` | marca um passo | `step` (1 a 3), `platform` (ios, android) | onde trava |
| `gaia_store_opened` | toca em baixar | `platform` | passo 1 |
| `gaia_help_opened` | abre ajuda | `faq_id` | perguntas mais frequentes |
| `gaia_wifi_copied` | copia senha | | problema de rede |
| `gaia_completed` | "Já ativei" | `seconds_since_started` | conclusão e tempo |
| `gaia_group_progress_toggled` | altera exibição | `enabled` | aceitação do recurso |

Metas `[HIPÓTESE]`: 60% ou mais concluem no Dia 2; mediana menor que 3 minutos; conclusão é autodeclarada, então o número é teto, não prova de ativação.

## 4. Agenda: onde cada coisa acontece

Base: `apps/mockup/src/data/agenda.ts` (mesma grade nos 3 dias: 09h abertura, 10h30 intervalo de 15 min, 12h30 almoço, 15h40 intervalo, 19h encerramento). Mudanças propostas, sem alterar nenhuma palestra:

| Dia | Horário | Bloco | Mudança | Funcionalidade |
|---|---|---|---|---|
| 1 | 09h00 a 09h15 | Abertura: por que você está aqui | encurta de 30 para 15 min | GR: card "Forme seu grupo" aparece na Home às 09h00 |
| 1 | 09h15 a 09h30 | **Formação dos grupos** (novo, tipo dinâmica) | novo bloco | GR: Trilha mostra o bloco; formação aberta |
| 1 | 09h30 a 10h30 | Palestra "A mentalidade do protagonista" | nenhuma | GR segue aberta, sem avisos push/vibração |
| 1 | 10h30 a 10h45 | Intervalo | nenhuma | GR: segunda janela de silêncio; **fecha às 10h45** |
| 1 | 10h45 | Início da dinâmica "crenças" | nenhuma | GR: encaixe pelo time; aviso ao aluno até o almoço (12h30) |
| 1 | 17h00 a 17h30 | Dinâmica em trios: compromissos do dia | nenhuma | GR: usa o grupo (R-GR-13) |
| 2 | 09h00 a 09h20 | Abertura do Dia 2 | encurta de 30 para 20 min | |
| 2 | 09h20 a 09h30 | **Atividade: Gaia One** (novo, tipo dinâmica) | novo bloco | GA: card na Home; permanece o dia todo |
| 2 | 10h45 a 11h30 | Dinâmica: o líder que eu sou hoje | nenhuma | GR: usa o grupo (R-GR-13) |
| 2 | 17h30 a 19h00 | Palestra "O legado do líder" | nenhuma | OF: "Olimpo" liberada às 18h15 |
| 2 | 19h10 | Encerramento | nenhuma | OF: Olimpo segue ativa até o fim do Dia 3 |
| 3 | 17h30 a 19h00 | Palestra "Protagonista para sempre" | nenhuma | OF: "Imersão Liderança 360" liberada às 18h15 |
| 3 | 19h10 | Encerramento do Protagon | nenhuma | OF: Olimpo encerra; Liderança 360 segue 7 dias |

Observações: a janela de 10 min da Gaia One cabe na meta de 3 minutos com folga e deixa o trial ativo para o dia inteiro; o Wi-Fi do salão pode saturar com centenas de downloads simultâneos (risco operacional do time, fora do app: orientar 4G como alternativa). O "Wi-Fi" já existe em `edition.ts` (`venue.wifi`). Os horários 18h15 e 10h45 são ajustáveis pelo painel.

## 5. Matriz por ingresso

| Item | Executivo | VIP | Diamond |
|---|---|---|---|
| Grupos (só dentro da própria categoria) | sim | sim | sim |
| Oferta "Olimpo" | sim | sim | sim |
| Oferta "Imersão Liderança 360" | não aparece (link direto: aviso neutro, sem cadeado) | sim | sim, preço próprio |
| Atividade Gaia One | sim | sim | sim |
| Cadeado | só em Conexões e em no máximo um card da Home; nunca em Grupos, Ofertas ou Gaia | n/a | n/a |

## 6. Estados obrigatórios (cobertura pelos cenários)

GR: sem grupo (GR-01), aberta (GR-01/02), criando (GR-02), 1/3 e 2/3 (GR-02/13), completo (GR-05), lista vazia (GR-11), grupo cheio (GR-06), encerrada (GR-12), encaixado (GR-12), offline (GR-18). OF: antes (OF-01), liberada (OF-02), vista (OF-03), interesse (OF-05), compra simulada (OF-04), encerrada (OF-09), indisponível (OF-07), offline (OF-12). GA: não iniciada (GA-05), em andamento (GA-04), concluída (GA-01), ajuda (GA-06), offline (GA-08).

## 7. Respostas do §8 do prompt: o que o mockup segue

| # | Pergunta | Resposta do fundador | Proposta que o mockup segue |
|---|---|---|---|
| 1 | Fechamento e sobra | sem resposta | 10h45; resto 1 vira grupo de 4, resto 2 vira dois de 4 ou um de 2 (R-GR-5) |
| 2 | Poucos Diamond, juntar com VIP | sem resposta | não juntar; time resolve fora do app (R-GR-8) |
| 3 | Nome ou número oficial | sem resposta | "Grupo N" sequencial por edição (R-GR-6) |
| 4 | Produtos, preço, momento | sem resposta | Olimpo D2 18h15 e Liderança 360 D3 18h15, valores fictícios (R-OF-11) |
| 5 | Link ou consultor | sem resposta | link externo + consultor, simulados (R-OF-8) |
| 6 | Push na liberação | sem resposta | sem push; toast silencioso e card (R-OF-3); exceção exige DEC |
| 7 | Oferta pós-evento | sem resposta | 7 dias como "Condição encerrada" e some (R-OF-10) |
| 8 | Gaia One: produto, lojas, trial, código | sem resposta | texto provisório, lojas simuladas, trial sem cartão, código fictício (R-GA-4/6) |
| 9 | Lista de quem concluiu | sem resposta | só agregado; nominal fica para o app real com consentimento (R-GA-11) |

## 8. Fora do escopo (nesta rodada)

Chat de grupo no app; troca de grupo pelo aluno depois do fechamento; mistura de categorias; pagamento real ou cartão; push de oferta; verificação real de ativação do Gaia One; lista nominal para o palco; ranking ou comparação entre grupos; upgrade de ingresso vendido por oferta (CDC e proximidade com o cadeado, decisão separada do fundador).

## 9. Perguntas em aberto e dono

- Exceção à regra de silêncio para o toast da oferta: CEO e fundador (DEC).
- Direito de arrependimento, publicidade da oferta e política de lojas para venda: fundador/jurídico; não verificado.
- Base legal e retenção de grupos, formulário de interesse e status do Gaia: `security-engineer`.
- Quantidade real de alunos por categoria por edição (afeta R-GR-5 e R-GR-8): time de Eventos.
- Inserção de blocos na agenda e deslocamento de IDs: `mobile-dev` e `product-designer`.
