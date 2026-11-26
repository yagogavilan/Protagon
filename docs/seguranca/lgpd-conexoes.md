# LGPD e privacidade das Conexões

Data: 2026-11-26 · Dono: security-engineer · Base: commit `0b17e47` (mockup com DEC-002) · Status: parecer da Fase 1 (opinião; nada aqui é construído agora)

Escopo lido: `apps/mockup/src/screens/connections/` (C00, C01, C03, C05, C06, C09, C11, edição de perfil), `screens/me/PrivacyScreen.tsx` (U03), `MeScreen.tsx` (U01), `LoginScreen.tsx`/`CodeScreen.tsx` (E01/E02), `lib/format.ts`, `lib/connections.ts`, `data/participants.ts`, `data/content.ts`, `data/notifications.ts`; `docs/decisoes.md` (D4, D5, D7, DEC-002), `docs/produto/decisoes-diretoria.md` (DD-04, DD-06), `docs/arquitetura/recomendacao-stack.md` (§4 e §6), `docs/design/design-system.md` (F2).
Fora do escopo: chat (C07) e encontro (C08) só por leitura rápida; nada foi executado no navegador.

Não sou advogado. Bases legais, artigos e prazos abaixo foram escritos de memória da Lei 13.709/2018 e **precisam de validação do jurídico do Grupo Virtus** antes da política de privacidade.

## 1. Resumo

- O mockup acerta o essencial: consentimento desligado por padrão, contato só após aceite, recusa invisível (D5), prévia do Executivo abstrata (sem nome nem rosto no DOM), CPF sempre mascarado, exclusão pelo app, bloquear/denunciar/pausar em todo perfil.
- Nenhum achado Crítico ou Alto no mockup. Há 8 ajustes de texto e fluxo (SEC-001 a SEC-008) que devem entrar **antes da demo à diretoria**, porque ela vai aprovar o fluxo pelo que vê.
- Para o app real há 2 requisitos Altos (SEC-009 uso comercial/Olimpo e SEC-010 contato antes do aceite), que bloqueiam o lançamento se não forem atendidos.

## 2. Tabela LGPD (uma linha por dado e finalidade)

Bases: I consentimento, V execução de contrato, VI exercício regular de direitos, IX legítimo interesse (art. 7). `[validar com jurídico]` em todas.

| Dado | Finalidade | Base legal | Quem vê e quando | Retenção (proposta) | Como o titular revoga ou exclui |
|---|---|---|---|---|---|
| Nome, e-mail, ingresso (edição, tier) | Login, credencial, regras de acesso | V | Só o próprio aluno; equipe de credenciamento | Conta: até o titular excluir ou [prazo pós-evento a definir]; mínimo do ingresso conforme obrigação legal | "Excluir meus dados" (U03); conta: ver SEC-014 |
| CPF | Login alternativo e casamento com a lista do credenciamento | V (minimizar: DD-06 opção B/C) | Ninguém em claro; app recebe só a máscara | HMAC + máscara enquanto houver conta | Exclusão da conta |
| Perfil de Conexões: nome, ingresso, foto, empresa, cargo, cidade, segmento, nicho, objetivos, objetivo no Protagon, interesses | Sugerir conexões e ser encontrado | I (finalidade 1) | VIP/Diamond da **mesma edição**, com consentimento ativo, não pausado, não bloqueado | Sai do pool no fim do evento; apagado com a rede em 90 dias (D7). Outra edição: novo aceite, com dados pré-preenchidos | Pausar, desligar perfil, excluir (U03) |
| Maior desafio e "Domina" (DEC-002) | Afinidade ("ela domina o seu maior desafio") | I (finalidade 1) | Idem; desafio com chave própria de visibilidade (SEC-003). **Nunca a equipe comercial** (SEC-009) | Idem perfil | Editar, ocultar, excluir |
| Miniatura borrada da foto (só se a diretoria escolher foto real no C00) | Mostrar ao Executivo que há gente se conectando | I separado (finalidade 2) | Executivos da edição, sem nome/empresa/id | Apagada na hora ao revogar ou pausar | Chave própria, desligada por padrão (SEC-006) |
| WhatsApp, LinkedIn, Instagram | Continuar a conversa fora do app | I (finalidade 3) | Só conexões com aceite mútuo; a pessoa conectada pode salvar e exportar (C09) | No app: 90 dias. Cópia exportada: fora do controle do Grupo | Desfazer conexão, excluir; o que o outro já salvou não volta (dizer isso) |
| Instagram antes do aceite (opção de U03) | Conhecer a pessoa antes de pedir conexão | I separado (finalidade 4) | VIP/Diamond da edição que também ligaram a opção (recíproco) | Enquanto ligado | Desligar em U03 (efeito imediato) |
| Pedido de conexão e mensagem (C04) | Pedir conexão | I (finalidade 1) | Remetente e destinatário | 90 dias após o evento | Exclusão |
| Chat (C07) e encontros (C08) | Combinar e encontrar no evento | I (finalidade 1) | Os dois conectados; moderação lê só o que foi denunciado | 90 dias (D7) | Desfazer conexão, excluir |
| Notas privadas (C09) | Memória do aluno | V (serviço pedido pelo autor) | Só o autor; entram na exportação dele | 90 dias | Exclusão. `[jurídico]` são dados de terceiro: definir resposta se o outro pedir acesso |
| Bloqueios | Segurança do titular | IX | Ninguém | Enquanto a conta existir, inclusive em outras edições | Desbloquear (não existe no mockup; avaliar) |
| Denúncias | Moderação, segurança, defesa em processo | IX e VI (teste de balanceamento escrito) | Equipe de moderação nomeada | [1 a 2 anos, jurídico] mesmo após exclusão da conta do denunciado | Não revogável pelo denunciado; acesso mediante pedido |
| Registro de consentimento (finalidade, versão do texto, data, origem) | Provar o consentimento (ônus do controlador) | VI | Interno | Duração do tratamento + prazo prescricional [jurídico] | Não excluível enquanto necessário à prova |
| Token de push, eventos de uso (`app_events`), logs | Avisos e métricas | V e IX | Operadores Expo/APNs/FCM/Sentry (fora do Brasil) | Token: até sair/excluir. Eventos e logs: 90 dias [proposta] | Sair, excluir, desligar notificações |

Operadores a registrar e contratar: Supabase, Expo, Apple/Google (push), Sentry, provedor de e-mail, Hotmart (origem). Transferência internacional: push e Sentry sem dado pessoal no corpo.

## 3. Threat model curto

```mermaid
flowchart LR
  A[Aluno VIP/Diamond] -->|RPC com sessão| R[Funções RPC / Edge]
  E[Aluno Executivo] -->|só contador| R
  R --> P[(connection_profiles)]
  R --> C[(contact_cards)]
  R --> M[(requests, messages, notes)]
  R --> S[(Storage: fotos, miniaturas)]
  R -.push genérico.-> X[Expo / APNs / FCM]
  I[Equipe interna: moderação, comercial] -->|painel admin| R
  A -->|exportação C09| F[Arquivo no aparelho: fora do controle]
```

Fronteiras: aparelho (não confiável) ↔ RPC; RPC ↔ tabelas sob RLS; equipe interna ↔ dados (o maior risco de desvio de finalidade); arquivo exportado (sai de qualquer controle).

| STRIDE | Ameaça nas Conexões | Controle (existe no desenho / falta) |
|---|---|---|
| S | Perfil com nome de outra pessoa (comprador ≠ participante, DD-06) ou cargo/empresa inventados | Cadastro só por compra (stack §4); nome travado no C01. Falta: vínculo com o credenciamento (SEC-012) |
| T | App adulterado tira o limite diário ou ativa perfil sem consentimento | Escritas só por RPC (stack §4). Falta: RPC de ativação exige registro de consentimento da versão vigente (SEC-015) |
| R | "Nunca aceitei mostrar meu perfil" / "não mandei essa mensagem" | Tabela `consents` com versão; mensagens com autor e data |
| I | Contato antes do aceite por join descuidado; raspagem do pool; nome em push na tela bloqueada; miniatura com id | Tabelas separadas por sensibilidade (stack §4). Falta: matriz de testes de RLS (SEC-010), limites de leitura (SEC-011), push genérico (SEC-016) |
| D | Denúncias em massa derrubam um concorrente; enxurrada de pedidos | Limite diário D4. Falta: suspensão por denúncia só com revisão humana (SEC-013) |
| E | Executivo (ou ex-VIP após reembolso) lê perfis via API; equipe comercial consulta desafios | Tier lido do banco, não do JWT (stack §4). Falta: papel interno sem acesso a Conexões (SEC-009); revogação no reembolso (pergunta 7 da stack) |

Casos de abuso do networking:

| Abuso | Ator | Sinal de detecção | Controle mínimo |
|---|---|---|---|
| Assédio por pedido, chat ou no encontro presencial | Participante | Denúncias, muitos pedidos sem aceite, mensagens repetidas | Recusa invisível (D5, existe); bloquear em cascata; denúncia com motivo "assédio", opção de bloquear junto e rota urgente com a equipe no local (SEC-005, SEC-013); encontros só em Pontos de Conexão públicos (D6, existe) |
| Assédio fora do app via Instagram liberado antes do aceite | Participante | Não detectável pelo app | Opção desligada por padrão (existe); aviso de que bloquear aqui não vale lá (SEC-004) |
| Raspagem da lista de VIP/Diamond (nome, empresa, cargo, desafio, @) | Vendedor com ingresso VIP, concorrente | Muitos perfis abertos ou páginas do Explorar por hora | RPC paginada com campos mínimos, sem `select` direto; teto de perfis vistos por dia; alerta; termos de uso proibindo (SEC-011) |
| Perfil falso ou ingresso de terceiro | Revendedor, golpista | Denúncia "perfil falso"; nome diferente no credenciamento | Selo "credenciado" após check-in; Conexões com pedidos só após credenciamento; suspensão preventiva com revisão (SEC-012) |
| Uso comercial dos contatos por participantes (listas de transmissão, prospecção) | Participante vendedor | Denúncia "spam" | Aviso na exportação; termos de uso; exportar só canais que o outro liberou (SEC-007) |
| Uso comercial pelo organizador (leads do Olimpo com foto, desafio, rede) | Insider/comercial | Consulta interna às tabelas de Conexões | Proibido por padrão; consentimento separado; papel sem acesso; log de acesso (SEC-009) |
| Retaliação após recusa | Participante | — | "Pendente", nunca "Recusado" (D5, existe); bloqueio sem aviso (existe) |
| Denúncia em massa contra concorrente | Concorrente | Várias denúncias em minutos de contas ligadas | Sem suspensão automática; revisão humana |

Pontuação (probabilidade × impacto, 1 a 3): uso comercial pelo organizador 2×3=6; contato antes do aceite 2×3=6; assédio 2×3=6 (mitigado pelo desenho); raspagem 3×2=6 → controle obrigatório antes do piloto; perfil falso 2×2=4; denúncia em massa 1×2=2.

Risco residual que o fundador deve aceitar por escrito em `docs/decisoes.md`: contatos já compartilhados e exportados ficam com a outra pessoa para sempre; o Instagram liberado antes do aceite sai da moderação do app.

## 4. Achados

### (a) Ajustes no mockup agora (texto e fluxo)

```
SEC-001 | Severidade: Média | Status: Aberto
Onde: apps/mockup/src/screens/connections/ActivateScreen.tsx:211-220 (C01, passo 3)
Problema: o consentimento é uma frase genérica ("Autorizo mostrar meu perfil..."). Não diz quais dados aparecem (nicho, objetivo no Protagon, desafio, foto), que contatos são liberados após o aceite e podem ser exportados, por quanto tempo ficam, nem que não há uso comercial; não tem link para a política.
Cenário de ataque: consentimento não informado tende a ser contestável (autorizações genéricas são nulas, art. 8 §4, de memória); a diretoria aprova um fluxo que o jurídico depois reescreve, e o "< 60 s" é medido com o texto errado.
Correção recomendada: trocar pelo texto da seção 5 (chave + 4 linhas + link "Política de privacidade"); manter desligado por padrão.
Como verificar a correção: no C01 passo 3, o texto lista dados, contatos, exportação, 90 dias e uso; a chave começa desligada; o link existe.
```

```
SEC-002 | Severidade: Média | Status: Aberto
Onde: ActivateScreen.tsx (passo 3) e ProfileEditScreen.tsx:111-128; contatos vêm prontos de data/content.ts:54-67
Problema: o titular não escolhe quais contatos libera após o aceite. WhatsApp e LinkedIn aparecem para a conexão sem nunca terem sido pedidos ou mostrados a ele; só o Instagram é editável.
Cenário de ataque: no app real, o telefone da compra (Hotmart) vira contato público para cada conexão sem escolha do titular: dado usado para finalidade diferente da coletada.
Correção recomendada: bloco "Depois do aceite, você compartilha" em C01 passo 3 (ou em "Complete seu perfil"), com WhatsApp, LinkedIn e Instagram, cada um com o valor e uma chave; o telefone da compra só pré-preenche, editável.
Como verificar a correção: o aluno vê e desliga cada canal; o C03 da outra pessoa mostra só os canais ligados.
```

```
SEC-003 | Severidade: Média | Status: Aberto
Onde: ActivateScreen.tsx:16-22 e PrivacyScreen.tsx:11-17 (lista de campos visíveis); ProfileScreen.tsx:150-212 (C03)
Problema: os campos de DEC-002 (nicho, objetivo no Protagon, maior desafio, "Domina") e a foto não aparecem em "O que fica visível" nem em U03. "Maior desafio" expõe fragilidade do negócio ("organizar o caixa", "preparar a sucessão") e é exatamente o dado que atrai abordagem de venda.
Cenário de ataque: vendedor com ingresso VIP filtra quem tem o desafio que ele "resolve" e aborda em massa; o titular não sabia que o desafio estava visível.
Correção recomendada: em C01 passo 3, informar "Também aparecem: nicho e objetivo no Protagon; foto, se você adicionar". Em U03 e em "Complete seu perfil", chave "Mostrar meu maior desafio" (ligada só se o aluno preencher). Se desligada, o desafio continua servindo às sugestões dele, mas o motivo "ela domina o seu maior desafio" não aparece para os outros. Explorar não deve filtrar por desafio (hoje não filtra: manter).
Como verificar a correção: com a chave desligada, o C03 visto por outro não mostra "Maior desafio" nem o motivo derivado dele.
```

```
SEC-004 | Severidade: Baixa | Status: Aberto
Onde: PrivacyScreen.tsx:72-80 (U03, Instagram antes da conexão)
Problema: a dica não avisa que o Instagram fica fora do app: bloquear e denunciar aqui não valem lá, e a pessoa pode mandar direct sem aceite. A reciprocidade e o padrão desligado estão corretos.
Cenário de ataque: aluna libera o @, recusa (ou bloqueia) alguém e continua recebendo mensagens no Instagram; a percepção é de que o app expôs.
Correção recomendada: dica "Seu @ aparece para VIP e Diamond desta edição antes do aceite, e você vê o @ de quem também liberou. No Instagram, bloquear e denunciar daqui não valem. Desligado por padrão."
Como verificar a correção: texto presente; chave continua desligada por padrão.
```

```
SEC-005 | Severidade: Média | Status: Aberto
Onde: SafetySheet.tsx:11, 89-99 (C11, denunciar)
Problema: não há motivo "assédio ou comportamento inadequado" (inclusive no encontro presencial), não há opção de bloquear junto, e a promessa "analisa em até 24 h" é lenta para um evento de 3 dias e não tem rota urgente.
Cenário de ataque: assédio no Ponto de Conexão às 15h40; a resposta chega depois do fim do evento e a vítima continua recebendo mensagens.
Correção recomendada: motivos "Assédio ou comportamento inadequado", "Mensagem ofensiva", "Perfil falso ou de outra pessoa", "Oferta indevida ou spam", "Outro motivo"; caixa "Bloquear [nome] também" marcada; confirmação "Denúncia enviada. Durante o evento, a equipe analisa no mesmo dia. Se for urgente, procure a equipe no estande." (SLA a definir com Eventos, DD-09).
Como verificar a correção: denunciar com a caixa marcada também bloqueia e fecha o perfil/chat.
```

```
SEC-006 | Severidade: Média (decisão) | Status: Aberto
Onde: docs/arquitetura/recomendacao-stack.md:55 (miniatura borrada real) x LockedPreview.tsx:5-38 (cards abstratos)
Problema: o mockup está certo (cards abstratos, nada pessoal); a stack propõe miniatura real borrada. Usar a foto de um VIP para vender upgrade a outro aluno é finalidade de marketing, distinta da finalidade 1.
Cenário de ataque: aluno reconhece a si mesmo (ou é reconhecido pelo cabelo, cor, fundo) num anúncio de upgrade sem ter autorizado.
Correção recomendada: manter cards abstratos também no app real (o contador já entrega o argumento de venda; F1). Se a diretoria quiser fotos, segunda chave no C01, separada e desligada: "Usar minha foto, desfocada e sem nome, na prévia de Conexões para quem ainda não tem acesso". Sem essa chave, a foto nunca vai para a prévia.
Como verificar a correção: decisão registrada em docs/decisoes.md; se fotos, a chave existe e começa desligada.
```

```
SEC-007 | Severidade: Média | Status: Aberto
Onde: NetworkPanel.tsx:76-95 (C09, exportar contatos)
Problema: a exportação tira contatos de terceiros do controle do app sem nenhum aviso de uso, e o texto lista todos os canais, não só os que cada pessoa liberou; as notas privadas vão junto.
Cenário de ataque: participante exporta 30 contatos e os coloca numa lista de transmissão comercial; as pessoas culpam o Protagon.
Correção recomendada: abaixo do botão: "O arquivo traz só os contatos que cada pessoa liberou e as suas notas. Use para falar com essas pessoas; não adicione a listas de transmissão ou de vendas." Conexões desfeitas, bloqueadas ou excluídas não entram.
Como verificar a correção: texto presente; no app real, teste de que conexão desfeita não sai no arquivo.
```

```
SEC-008 | Severidade: Baixa | Status: Aberto
Onde: textos imprecisos em U03 e C11 (PrivacyScreen.tsx:85, 125, 168; SafetySheet.tsx:143, 176; data/content.ts:51) e máscara de CPF (lib/format.ts:11-15 x stack:66)
Problema: (1) "Pausar: ninguém vê você" é inexato se as conexões já feitas continuam vendo; (2) "Desfazer conexão: contatos somem para os dois" promete apagar o que o outro já salvou; (3) "exclusão imediata" ignora backups; (4) "Tratamos seus dados com base na sua autorização" vale só para Conexões (ingresso é contrato); (5) mockup mostra os 6 dígitos do meio (***.482.917-**) e a stack fala em guardar só os 2 últimos: escolher um padrão. U01 nem precisa exibir CPF.
Cenário de ataque: promessa falsa ao titular vira reclamação na ANPD ou no Procon.
Correção recomendada: (1) "Você some das sugestões e da busca e não recebe pedidos novos. Suas conexões continuam." (confirmar regra com PO); (2) "deixam de aparecer no app para os dois. O que já foi salvo fora do app não é apagado."; (3) "Apagamos do app na hora. Cópias de segurança são apagadas em até [N] dias."; (4) "Seu perfil de Conexões só existe com a sua autorização. Os dados do ingresso servem para o seu acesso ao evento. Chat e Minha rede ficam 90 dias após o evento. Política de privacidade."; (5) padrão ***.482.917-** em todo lugar, ou tirar o CPF do U01.
Como verificar a correção: QA confere os 5 textos.
```

### (b) Requisitos para o app real

```
SEC-009 | Severidade: Alta | Status: Aberto (bloqueia lançamento)
Onde: desenho (DD-04; brief §1: Protagon é o principal canal de leads do Olimpo)
Problema: perfil, foto, maior desafio, objetivo no Protagon, rede e chat são dados perfeitos para qualificar lead. Usá-los para vender o Olimpo é outra finalidade; agrupar no consentimento das Conexões o torna nulo.
Cenário de ataque: comercial liga para quem marcou "Captar investimento" como desafio; aluno percebe que o perfil de networking virou ficha de vendas; dano de reputação e risco na ANPD.
Correção recomendada: diretoria registra "proibido por padrão"; se quiser, consentimento separado, fora do C01, desligado, nunca condição para usar Conexões, só com dados do próprio titular (nunca rede, chat, notas ou contatos de terceiros). Papel interno do comercial sem acesso às tabelas de Conexões; log de acesso de quem consulta.
Como verificar a correção: decisão em docs/decisoes.md; teste de RLS com papel "comercial" negado; texto do opt-in validado pelo jurídico.
```

```
SEC-010 | Severidade: Alta | Status: Requisito
Onde: modelo de dados (stack:49-50)
Problema: a regra 3 (contato só após aceite mútuo) depende de RLS e de RPC; um join, uma view ou um DTO descuidado devolve telefone antes do aceite.
Correção recomendada: manter `contact_cards` separada; leitura só por RPC que confere conexão aceita, não bloqueada e consentimento 3 vigente; matriz de testes de RLS no CI (sem conexão, pendente, recusado, bloqueado, desfeito, Executivo, outra edição, pausado, reembolsado) esperando zero linhas; Instagram antecipado exige as duas chaves ligadas.
Como verificar a correção: suíte de RLS verde no CI; revisão de segurança antes do piloto.
```

```
SEC-011 | Severidade: Média | Status: Requisito
Raspagem do pool (C02, C06, C03). Sem `select` direto em `connection_profiles`; RPC paginada com campos mínimos (sem desafio quando oculto, sem @ fora do perfil individual); teto de perfis abertos por dia [proposta 100] e alerta acima dele; termos de uso proibindo coleta; nada de lista de @ no Explorar.
```

```
SEC-012 | Severidade: Média | Status: Requisito
Perfil falso e ingresso de terceiro (DD-06). Nome do perfil = nome do participante confirmado no credenciamento, não do comprador; selo "credenciado" após check-in; avaliar pedidos só após credenciamento (casa com DD-05); denúncia "perfil falso" tira do pool após revisão humana, não automaticamente.
```

```
SEC-013 | Severidade: Média | Status: Requisito
Assédio e moderação. Bloqueio em cascata no servidor (some do Explorar e das sugestões, cancela pedidos pendentes, impede QR e novo pedido, vale em outras edições); denúncia guarda a mensagem denunciada como evidência; fila com pessoa nomeada de plantão nos 3 dias e SLA escrito; equipe lê só o que foi denunciado; sem suspensão automática por volume (evita denúncia em massa); teste de balanceamento do legítimo interesse para reter denúncias.
```

```
SEC-014 | Severidade: Média | Status: Requisito
Exclusão e retenção. Purge por pg_cron em 90 dias (D7) cobrindo perfil, foto, miniatura, pedidos, chat, encontros e notas; perfil sai do pool no fim do evento; consentimentos e denúncias com prazo próprio; janela de backup escrita no texto de exclusão; prazo de resposta a pedido do titular [jurídico]. Lojas `[HIPÓTESE: confirmar regras vigentes]`: Apple pede exclusão de conta no app e Google pede exclusão no app e por link web; contas criadas pela compra provavelmente contam: oferecer "Excluir minha conta" além de "Excluir meus dados".
```

```
SEC-015 | Severidade: Média | Status: Requisito
Registro de consentimento. Tabela `consents` por finalidade (1 perfil, 2 foto na prévia, 3 contatos após aceite, 4 Instagram antecipado, 5 eventual Olimpo), versão e hash do texto, data, origem; RPC de ativação recusa sem consentimento 1 da versão vigente; texto novo exige novo aceite; revogação tem efeito imediato pela RLS (stack §6).
```

```
SEC-016 | Severidade: Baixa | Status: Requisito
Fotos e notificações. Upload: remover EXIF/GPS, limitar tipo e tamanho, bucket privado com URL assinada, moderação de imagem ofensiva por denúncia. Push com corpo genérico ("Você tem um novo pedido de conexão"), nome só dentro do app (tela bloqueada e operadores fora do Brasil); a central de notificações do mockup pode manter nomes.
```

```
SEC-017 | Severidade: Média | Status: Requisito
Login e enumeração (E01/E02, stack:53). "Ingresso não encontrado" revela se um CPF ou e-mail comprou o Protagon. Rate limit por IP e aparelho, captcha invisível, OTP com expiração curta e tentativas limitadas. No login por CPF, não mostrar o e-mail mascarado (a stack sugere mostrar; o mockup já não mostra: manter "o e-mail cadastrado").
```

Governança mínima antes do piloto (dono entre colchetes): política de privacidade e termos de uso com link no C01 e em U03 [jurídico]; RIPD das Conexões [security + jurídico]; encarregado (DPO) e canal indicados [Grupo Virtus]; contratos com operadores [jurídico]; Data Safety e App Privacy preenchidos a partir da seção 2 [security]; idade mínima 18 anos para Conexões `[validar]`; processo de incidente com prazo de comunicação à ANPD `[validar prazo vigente]`.

## 5. Texto proposto para o consentimento do C01 (passo 3)

Logo acima da chave, uma linha fixa: "Também aparecem: nicho e objetivo no Protagon; foto, desafio e conhecimentos, se você preencher."

Chave (desligada por padrão; sem ela o perfil não ativa):

> **Autorizo mostrar meu perfil de Conexões para participantes VIP e Diamond desta edição.**
> - Usamos esses dados só para sugerir conexões e marcar encontros. Não usamos para venda de outros produtos. `[depende de DD-04]`
> - WhatsApp, LinkedIn e Instagram só aparecem para quem aceitar a conexão com você. Essa pessoa pode salvar e exportar seus contatos.
> - Chat e Minha rede ficam 90 dias após o evento.
> - Você pode pausar, desligar ou excluir quando quiser, em Eu > Privacidade. [Política de privacidade]

Abaixo, quando desligada: "Sem a autorização, o perfil não é ativado." (já existe).

Segunda chave, **só se** a diretoria escolher foto real na prévia do Executivo (SEC-006; recomendo não usar), desligada e opcional:

> Usar minha foto, desfocada e sem nome, na prévia de Conexões para quem ainda não tem acesso.

Notas: ~70 palavras, leitura em cerca de 20 s; cabe no "< 60 s". O nome do controlador (razão social do Grupo Virtus) entra na política, não na chave. O texto final é do jurídico; o designer ajusta forma sem tirar nenhum dos 4 itens.

## 6. Limites desta revisão

- Revisão de código e documentos de um mockup com dados fictícios; não há backend para testar. RLS, rate limit e purge só se provam com testes no app real e um pentest antes de escalar para várias edições.
- Regras das lojas e artigos da LGPD não foram reconferidos nesta sessão.
- Decisões pedidas: DD-04 (uso comercial, SEC-009), foto na prévia (SEC-006), regra de pausa vs. conexões existentes (SEC-008, PO), SLA de denúncia (SEC-005, Eventos).

## 7. Grupos, Ofertas e Gaia One

Data: 2026-11-26 · Base: commit `742aa73` · Escopo: `docs/produto/prompt-grupos-ofertas-gaia.md` (APROVADO). Ainda não há código nem specs de GR/OF/GA (`docs/produto/grupos-ofertas-gaia.md` e `docs/design/telas/gr-*`, `of-*`, `ga-*` não existem): a revisão é do desenho, e o QA confere os textos abaixo no mockup.

Resumo: nenhum bloqueio para o mockup; 7 ajustes de texto e fluxo (SEC-018 a SEC-024) que devem entrar na construção, para a diretoria aprovar o fluxo certo. Para o app real, 2 requisitos Altos (SEC-025 oferta invisível de verdade e SEC-026 autorização dos grupos) bloqueiam o lançamento **dessas funcionalidades**.

### 7.1 Tabela LGPD

| Dado | Finalidade | Base legal `[validar com jurídico]` | Quem vê e quando | Retenção (proposta) | Revogar / excluir |
|---|---|---|---|---|---|
| Participação no grupo: primeiro nome e setor | Encontrar grupo com vaga perto | V (dinâmica faz parte do evento contratado) | Alunos da mesma edição e categoria, só na lista, só durante a formação e enquanto há vaga | Sai da lista ao completar ou fechar | Sair durante a formação; "Só por código" |
| Membros do grupo: nome, empresa, setor; foto só de quem tem perfil de Conexões ativo (os outros: iniciais) | Dinâmicas em trio nos 3 dias | V | Os membros do grupo; equipe do evento | Fim do evento + purge D7 (90 dias) | Troca pela equipe (SEC-019); exclusão da conta |
| WhatsApp compartilhado no grupo | Combinar fora do app | I (finalidade 6, separada das Conexões) | Membros que também compartilharam, depois de o grupo completar ou a formação fechar | Oculto no fim do evento; purge D7. Cópias salvas: fora do controle | Desligar (efeito imediato no app) |
| Código e QR do grupo | Entrar no grupo combinado ao vivo | V | Quem recebe o código | Expira ao completar ou fechar a formação | — |
| Ofertas vistas, "Agora não", tempo na tela | Métrica do pitch | IX, **só agregado** | Time do evento, sem nome | 90 dias | — |
| Pedido de contato da oferta: nome, e-mail, telefone, ingresso, oferta, data | Consultor retornar a pedido do aluno | V (procedimentos preliminares a pedido do titular) | Time comercial do Grupo Virtus, só esse pedido | [6 meses se não virar compra, jurídico] | Cancelar o pedido no app; exclusão |
| Compra no checkout | Pagamento | V | Hotmart (papel de controladora ou operadora: jurídico) | Regra fiscal | Pela Hotmart |
| Progresso Gaia One e "Já ativei" | Ajudar o aluno e o grupo | V | O aluno; o grupo vê só a contagem; o time vê o total | Fim do evento | — |
| Nome na lista do palco (só se o time quiser) | Chamar ou sortear no palco | I (finalidade 7) | Equipe de palco | Apagada no fim do evento | Não marcar a opção |

Conexões não alimentam nada desta tabela: desafio, objetivos, rede, chat e notas nunca vão para o comercial, a lista do palco ou o Gaia One (SEC-009).

### 7.2 Achados

#### (a) Ajustes no mockup agora (texto e fluxo)

```
SEC-018 | Severidade: Média | Status: Aberto
Onde: prompt §1 Fluxo 1 (lista "Entrar num grupo com vaga") e "Criar um grupo"
Problema: a lista mostra primeiro nome + empresa + setor/fila de quem ainda não tem grupo para a categoria inteira, sem aviso a quem cria. Fila é localização precisa; empresa não serve para escolher grupo.
Cenário de ataque: alguém procura a aluna pelo primeiro nome e empresa, vê onde ela está sentada e entra no grupo dela para ficar perto nos 3 dias; no app real, quem percorre a lista monta um diretório nome-empresa-posição da categoria (raspagem, inclusive entre Executivos, que não aceitaram nada de Conexões).
Correção recomendada: na lista, só primeiro nome, setor (sem fila) e vagas; empresa e foto só em "Meu grupo". Ao criar, aviso fixo (texto 7.3) e opção "Só por código" (o grupo fica fora da lista). Foto em "Meu grupo" só para quem tem perfil de Conexões ativo; o resto usa iniciais.
Como verificar a correção: a lista não exibe empresa, fila nem foto; o aviso aparece em "Criar um grupo"; um grupo "Só por código" não aparece na lista.
```

```
SEC-019 | Severidade: Média | Status: Aberto
Onde: prompt §1 Fluxo 5 ("depois, só pelo time no estande") e tela "Meu grupo"
Problema: depois da formação, quem está num grupo com alguém que o incomoda não tem caminho no app. O Executivo nem tem o C11 (denunciar e bloquear existem só nas Conexões).
Cenário de ataque: assediador entra no grupo pela lista ou por código adivinhado; a vítima fica presa a ele por 3 dias, sem saber que pode pedir troca.
Correção recomendada: em "Meu grupo", link "Algum problema com o grupo?" que abre uma folha com "Pedir troca de grupo" (vai para a equipe, discreta, a qualquer momento) e "Denunciar" (mesmos motivos do SEC-005), para os 3 ingressos.
Como verificar a correção: no mockup, Executivo e VIP chegam à folha a partir de "Meu grupo" com a formação já encerrada.
```

```
SEC-020 | Severidade: Média | Status: Aberto
Onde: prompt §1 Fluxo 4 (WhatsApp no grupo)
Problema: desligado por padrão está certo, mas falta: reciprocidade, momento em que o número aparece e aviso de que quem salvou fica com ele.
Cenário de ataque: alguém entra num grupo incompleto, vê o WhatsApp de quem compartilhou sem expor o próprio e sai em seguida (sair é livre durante a formação).
Correção recomendada: chave desligada; o número é o da compra, só pré-preenchido e editável; vê o WhatsApp dos outros só quem também compartilhou; números aparecem só quando o grupo completa ou a formação fecha; quem sai deixa de ver e de ser visto. Texto 7.3.
Como verificar a correção: com a chave desligada, "Meu grupo" não mostra o WhatsApp de ninguém; com 2/3, não mostra nenhum número.
```

```
SEC-021 | Severidade: Baixa | Status: Aberto
Onde: prompt §1 "Entrar com código ou QR" e estados
Problema: falta o estado de código inválido; se a mensagem diferenciar "não existe" de "é de outra categoria", vira oráculo para descobrir códigos.
Cenário de ataque: no app real, a mensagem distinta confirma que o código existe em outra categoria e ajuda a força bruta (SEC-026).
Correção recomendada: mensagem única para código inexistente, expirado ou de outra categoria (texto 7.3). "Grupo cheio" pode ser distinta. Código sem letras ambíguas (sem I, O, Q).
Como verificar a correção: no painel, códigos inexistente e de outra categoria mostram o mesmo texto.
```

```
SEC-022 | Severidade: Média | Status: Aberto
Onde: prompt §2 "Falar com um consultor" (formulário de 1 toque com dados da compra preenchidos)
Problema: envio de dados pessoais para venda sem mostrar o que vai, para quem e para quê; "dados da compra" pode incluir CPF. É a porta de entrada do comercial do Olimpo no app (relação com SEC-009).
Cenário de ataque: aluno toca para saber o preço, recebe ligação com dados que não sabia ter enviado; ou o formulário passa a levar desafio e objetivo das Conexões para "qualificar o lead".
Correção recomendada: 1 toque continua possível, mas os dados aparecem acima do botão: nome, e-mail, telefone (editável) e ingresso. Nunca CPF, nunca dado das Conexões. Diz o destinatário e a finalidade (só esta oferta). Confirmação com "Cancelar pedido". Texto 7.3.
Como verificar a correção: a tela lista exatamente os campos enviados; não há CPF; existe "Cancelar pedido" no estado "interesse enviado".
```

```
SEC-023 | Severidade: Baixa | Status: Aberto
Onde: prompt §2 (regra "invisível antes", checkout externo simulado, "Ofertas do evento")
Problema: (1) no mockup a oferta está no bundle; "invisível" só vale na tela (o critério "nem nos dados do app" é do app real, SEC-025); (2) uma entrada vazia "Ofertas do evento" antes da liberação já anuncia que haverá oferta; (3) o checkout externo não avisa a saída do app; (4) evento com plateia grande atrai link falso de "condição especial" nos grupos de WhatsApp que o próprio app incentiva.
Cenário de ataque: golpista manda "link da condição do Olimpo" no grupo do trio minutos após o pitch.
Correção recomendada: "Ofertas do evento" só aparece depois da primeira liberação; antes da liberação, smoke test procura o nome da oferta no DOM de todas as telas, busca e notificações; aviso de saída e aviso antifraude (texto 7.3).
Como verificar a correção: smoke test sem o nome da oferta antes de "Liberar oferta"; textos presentes na tela da oferta.
```

```
SEC-024 | Severidade: Baixa | Status: Aberto
Onde: prompt §3 "Grupo: quem do grupo já concluiu" e pergunta 9 (lista para o palco)
Problema: mostrar nomes de quem concluiu expõe por eliminação quem não ativou; o trial pode pedir cartão, e não ativar pode ser falta de cartão ou de dinheiro. Lista nominal para o palco é outra finalidade.
Cenário de ataque: o grupo (ou o palco) pressiona quem não ativou; constrangimento público num evento de 3 dias.
Correção recomendada: no card do grupo, só a contagem ("2 de 3 já ativaram"); pedir ajuda ao grupo é ação do próprio aluno. Lista do palco: por padrão só o total; nomes só com opção desligada por padrão ("Quero aparecer na lista do palco"), se o fundador confirmar a necessidade.
Como verificar a correção: o card mostra contagem sem nomes; a opção do palco, se existir, começa desligada.
```

#### (b) Requisitos para o app real

```
SEC-025 | Severidade: Alta | Status: Requisito (bloqueia o lançamento de Ofertas)
Onde: desenho futuro (offers, Trilha, Expo/OTA, Storage, push)
Problema: no Expo, o caminho mais fácil é embutir conteúdo no bundle ou numa atualização OTA, e tudo no bundle é público; imagem em URL previsível, payload de push ou deep link também vazam.
Cenário de ataque: alguém extrai o bundle ou chama a API no Dia 1 e publica preço e bônus do Olimpo antes do pitch; quem não está no evento compra pela condição especial.
Correção recomendada: oferta só existe no servidor; RLS/RPC devolve a oferta apenas com `released_at <= now()` e categoria do aluno lida do banco; Trilha guarda só o título da sessão; imagens em bucket privado com URL assinada emitida após a liberação; nada de prefetch, OTA, push ou analytics com nome ou preço antes; deep link para oferta não liberada responde igual a inexistente. Liberar e encerrar: papel "produção" com confirmação em 2 passos e log de quem e quando; prazo da condição imposto no servidor e também na Hotmart (SEC-028).
Como verificar a correção: teste automatizado antes da liberação (API, bundle por grep do nome, Storage, deep link) sem nenhum dado da oferta; log de liberação.
```

```
SEC-026 | Severidade: Alta | Status: Requisito (bloqueia o lançamento de Grupos)
Onde: desenho futuro (groups, group_members, RPC de lista, entrada por código/QR, "Me coloque")
Problema: a regra "só a mesma categoria" e a entrada por código de 4 letras (no máximo ~160 a 450 mil combinações, com centenas de grupos abertos por edição) dependem do servidor; autorização só na tela não vale.
Cenário de ataque: Executivo chama a RPC com o id ou o código de um grupo VIP e entra; script testa códigos e cai em grupos abertos; bloqueado entra no grupo de quem o bloqueou.
Correção recomendada: toda leitura e escrita confere edição e categoria lidas do banco, credenciamento válido e janela de formação aberta; código vale só na edição e categoria, só enquanto há vaga, e expira ao completar ou fechar; limite de tentativas de código por conta e aparelho [proposta: 5 erros em 10 min]; o QR leva token longo aleatório (o código curto é só para digitar); lista paginada com campos mínimos (primeiro nome, setor, vagas), sem ids de pessoa, só durante a formação; bloqueio das Conexões e pedido de troca (SEC-019) impedem os dois no mesmo grupo, inclusive no encaixe automático; ações da equipe com log; aviso "entrou no seu grupo" segue SEC-016.
Como verificar a correção: matriz de testes no CI (outra categoria, outra edição, não credenciado, formação fechada, grupo cheio, bloqueado, código expirado) esperando negação; teste do limite de tentativas.
```

```
SEC-027 | Severidade: Média | Status: Requisito (variante de SEC-009)
Ofertas e uso comercial. O comercial recebe dado individual só do pedido de contato ou da compra; ofertas vistas, "Agora não" e tempo de tela ficam agregados, sem nome (senão vira lead scoring sem o aluno saber). Tabela `offer_interests` com campos fixos (allowlist do DTO); papel "comercial" lê só essa tabela, com log de acesso, e nunca as tabelas de Conexões, grupos ou Gaia One; cancelamento pelo aluno apaga o pedido; retenção [6 meses, jurídico]; limite de pedidos por oferta por aluno (evita spam ao consultor).
```

```
SEC-028 | Severidade: Média | Status: Requisito
Checkout externo. Abrir no navegador do sistema (SFSafariViewController / Custom Tabs), nunca WebView com ponte JS; URL vinda do servidor e validada contra allowlist de domínios da Hotmart; nenhum dado pessoal na query string (CPF nunca; nome e e-mail só se a Hotmart exigir para pré-preencher) [HIPÓTESE: confirmar parâmetros da Hotmart]; "compra concluída" só por webhook da Hotmart validado (token), com re-consulta e idempotência, nunca pela URL de retorno; condição especial com validade configurada na própria Hotmart (cupom ou oferta com data de fim), porque o link será repassado em grupos. Regras de compra fora do app nas lojas: [HIPÓTESE] (prompt §8.5), validar antes do piloto.
```

```
SEC-029 | Severidade: Média | Status: Requisito (variante de SEC-010)
WhatsApp no grupo. Tabela própria (`group_contacts`), separada de `group_members`; leitura só por RPC que confere: membro atual, consentimento 6 vigente, reciprocidade, grupo completo ou formação fechada, sem bloqueio; quem sai ou é trocado perde acesso na hora; ocultar no fim do evento e purge D7. Teste de RLS com membro que saiu, não membro e quem não compartilhou esperando zero linhas.
```

```
SEC-030 | Severidade: Média | Status: Requisito
Gaia One. O Protagon não envia lista de alunos ao Gaia One; "Copiar meu e-mail" é ação do aluno (nunca copiar CPF). Se o time quiser confirmar ativação cruzando com a base do Gaia One, isso é compartilhamento entre produtos: definir controlador, contrato e aviso antes [pergunta ao fundador: o Gaia One é do Grupo Virtus?]. "Já ativei" é autodeclarado: não usar para prêmio sem conferência. Links das lojas fixos e de domínios oficiais. Senha do Wi-Fi só para aluno autenticado; rede do evento com isolamento entre clientes (todo mundo na mesma senha) [Eventos/TI].
```

Push no momento da oferta durante a palestra é exceção à regra 5 (decisão do fundador, prompt §8.6); se aprovada, corpo genérico ("Há uma oferta do palco no app"), sem preço (SEC-016 e SEC-025).

### 7.3 Textos para o mockup

| Onde | Texto |
|---|---|
| Lista de grupos com vaga (subtítulo) | "Aparecem o primeiro nome e o setor de quem já está no grupo. Empresa e foto, só depois de entrar." |
| Criar um grupo (aviso) | "Seu grupo aparece para alunos [categoria] desta edição que procuram grupo, com seu primeiro nome e setor, até completar." Opção: "Só por código (fora da lista)" |
| Código inválido | "Código não encontrado. Confira as letras com quem criou o grupo." |
| Chave WhatsApp no grupo (desligada) | "Compartilhar meu WhatsApp com o grupo." Dica: "Aparece quando o grupo completar, só para quem também compartilhar. Quem salvar seu número fica com ele, mesmo se você desligar depois." |
| Meu grupo, rodapé | "Algum problema com o grupo? Pedir troca ou denunciar. A equipe resolve com discrição." |
| Formulário de interesse, acima do botão | "Vamos enviar ao time comercial do Grupo Virtus: [nome], [e-mail], [telefone] e ingresso [VIP]. Só para falar com você sobre o [Olimpo]. Seu perfil e suas conexões não são enviados." Botão: "Quero falar com um consultor" |
| Interesse enviado | "Pedido enviado. Um consultor vai falar com você por WhatsApp ou e-mail." Link: "Cancelar pedido" |
| Botão de checkout (nota abaixo) | "Você vai sair do app para pagar na Hotmart." |
| Rodapé da tela da oferta | "Ofertas do palco só aparecem aqui no app e no estande oficial. Não pague por links recebidos em grupos." |
| Card Gaia One do grupo | "2 de 3 do seu grupo já ativaram." |
| "Já ativei" (confirmação) | "Pronto. Seu grupo vê só quantos já ativaram, sem nomes." |
| Lista do palco (só se o fundador confirmar; desligada) | "Quero aparecer na lista do palco da atividade Gaia One." |

### 7.4 Limites e perguntas

- Revisão do prompt, sem código nem specs; repetir a passada rápida nas telas GR/OF/GA quando o `mobile-dev` construir (só os textos e estados acima).
- Contagem de combinações do código é estimativa (alfabeto de 20 a 26 letras); o número de grupos por edição depende do público (pergunta 2).
- Perguntas: o Gaia One é do Grupo Virtus ou parceiro (SEC-030)? A compra é pela Hotmart (SEC-028, prompt §8.5)? O time precisa de nomes no palco ou só do total (SEC-024, prompt §8.9)? Push na palestra (prompt §8.6)?
