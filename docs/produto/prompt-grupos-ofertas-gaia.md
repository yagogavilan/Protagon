# Missão: Grupos de 3, Ofertas ao vivo e Atividade Gaia One no mockup

Status: APROVADO pelo fundador em 2026-11-26. Perguntas do §8 sem resposta seguem como "proposta" no mockup.
Data: 2026-11-26 · Dono: CEO

## Contexto
O mockup do App Protagon (Fase 1) está completo em `apps/mockup` e passou pela revisão do QA. O fundador pediu três dinâmicas reais do evento que ainda não existem no app:
1. **Grupos de 3:** no Dia 1, os alunos formam trios que valem para o evento todo, sempre dentro da mesma categoria de ingresso.
2. **Ofertas ao vivo (pitch):** em alguns momentos o palco apresenta produtos. A oferta não pode aparecer antes, nem na Trilha; só quando o produto é apresentado, para o aluno assinar ou contratar.
3. **Atividade Gaia One:** no Dia 2, os alunos baixam o app Gaia One e ativam o trial. Precisa ser fácil e rápido no salão.

Tudo continua sendo mockup: sem backend, dados fictícios, controlado pelo painel de demonstração. As regras de `CLAUDE.md` §8 valem para tudo.

## 1. Grupos de 3 (código GR)

### Objetivo
Formar trios em poucos minutos, sem ninguém ficar de fora e sem misturar ingressos.

### Regras
- O grupo tem 3 pessoas da mesma categoria (Executivo, VIP ou Diamond). O app só mostra e aceita grupos da categoria do aluno.
- Vale para os 3 dias. Cada aluno participa de um grupo só.
- A formação abre no Dia 1, no bloco "Formação dos grupos" da Trilha, e fecha num horário definido pelo time (proposta: fim do primeiro intervalo, 10h45).
- Depois que fecha, quem ficou sem grupo é encaixado automaticamente pelo time (no mockup, um botão no painel simula isso).
- Sobra de pessoas (número que não divide por 3) vira grupo de 2 ou de 4, decidido pelo time. Marcar como "proposta".
- Funciona para os três ingressos. Não depende de Conexões, então o Executivo também usa.

### Fluxo (o mais simples possível)
1. **Entrada:** card grande na Home e no bloco da Trilha: "Forme seu grupo de 3". Três caminhos, nessa ordem:
   - **Entrar num grupo com vaga:** lista dos grupos da mesma categoria que têm vaga, com "1 vaga" ou "2 vagas", os nomes (primeiro nome + empresa) e o setor/fila onde estão sentados. Um toque em "Entrar".
   - **Criar um grupo:** gera um código curto de 4 letras e um QR. O aluno mostra para quem está ao lado; o grupo aparece na lista de grupos com vaga.
   - **Me coloque em um grupo:** o app encaixa o aluno no grupo com vaga mais próximo do setor dele.
   - Atalho extra: "Entrar com código ou QR" para quem já combinou ao vivo.
2. **Confirmação:** ao entrar, todos os membros recebem aviso na hora e vibração. Quando o grupo completa 3, ele sai da lista e aparece "Grupo completo".
3. **Meu grupo:** tela com os 3 membros (foto, nome, empresa, setor), nome do grupo (opcional, editável), as próximas dinâmicas em trio da Trilha e o ponto de encontro sugerido nos intervalos.
4. **Contato no grupo:** cada membro escolhe se compartilha o WhatsApp com o grupo (desligado por padrão, regra de contato só com aceite). Sem chat de grupo no app nesta fase (proposta: o grupo usa o WhatsApp).
5. **Sair do grupo:** possível enquanto a formação está aberta; depois, só pelo time no estande. A vaga volta para a lista.

### Onde aparece
- Home: card "Forme seu grupo" durante a formação; depois, card "Meu grupo" pequeno.
- Trilha: blocos de dinâmica em trio mostram os nomes do grupo.
- Eu: "Meu grupo".
- Não é uma aba nova.

### Estados
Sem grupo; formação aberta; criando (código e QR); grupo com 1/3 e 2/3; completo; lista vazia ("Nenhum grupo com vaga agora. Crie um ou peça para o app te encaixar."); grupo cheio ao tentar entrar (alguém entrou antes); formação encerrada; encaixado pelo time; offline (lista indisponível, mas o QR do grupo funciona).

## 2. Ofertas ao vivo (código OF)

### Objetivo
Transformar o momento do pitch em ação imediata, sem revelar nada antes.

### Regras
- **Invisível antes:** a oferta não aparece na Trilha, em Materiais, em Notificações, na busca nem nos dados do app antes de ser liberada. Na Trilha, o bloco onde o pitch acontece aparece com o título normal da sessão.
- **Liberação pelo palco:** o time libera a oferta no momento da apresentação (no mockup: botão "Liberar oferta" no painel).
- **Aparece assim:** um card destacado no topo da Home ("Oferta especial do palco") e uma tela da oferta. Como o aluno está na plenária, isso não vira pop-up que tapa o app; um toast discreto avisa que a oferta está disponível. Proposta: push só se o fundador aprovar a exceção à regra de silêncio nas palestras.
- **Tela da oferta:** nome do produto, para quem é, o que inclui, preço e condições (parcelamento), bônus da condição especial, prazo da condição com contagem regressiva (ex.: "Condição válida até 18h30"), e ações:
  - **Garantir minha vaga / Assinar** (checkout externo simulado);
  - **Falar com um consultor** (mostra o estande no mapa e um formulário de interesse de 1 toque, com os dados da compra já preenchidos);
  - **Agora não** (fecha; a oferta fica em "Ofertas do evento" até expirar).
- **Por ingresso:** cada oferta define para quais categorias aparece e se o preço muda por categoria.
- **Depois do prazo:** a oferta mostra "Condição encerrada" e o botão de consultor.
- **Sem pressão falsa:** contagem regressiva só com prazo real; nada de "restam 3 vagas" inventado.

### Exemplos para o mockup
- Dia 2, durante a palestra da tarde: "Olimpo" (programa de mentoria), condição especial do evento.
- Dia 3: um segundo produto fictício (ex.: "Imersão Liderança 360").

### Estados
Antes da liberação (nada visível em lugar nenhum); liberada; vista; interesse enviado; compra concluída (simulada); condição encerrada; não disponível para o ingresso; offline (mostra o QR do estande para comprar lá).

## 3. Atividade Gaia One (código GA)

### Objetivo
Fazer o aluno instalar o Gaia One e ativar o trial em menos de 3 minutos, no salão.

### Fluxo
- Bloco na Trilha do Dia 2 ("Atividade: Gaia One") e card na Home quando a atividade começar.
- Tela com checklist de 4 passos, com progresso:
  1. **Baixar o app:** botão que já leva à loja certa (App Store no iPhone, Google Play no Android); QR para quem está com outro aparelho.
  2. **Criar a conta:** sugere usar o mesmo e-mail da compra, com botão "Copiar meu e-mail".
  3. **Ativar o trial:** instruções curtas e, se houver, código promocional com botão "Copiar código".
  4. **Pronto:** o aluno toca "Já ativei". Feedback com vibração.
- **Preciso de ajuda:** mostra onde está a equipe de apoio no salão e as perguntas frequentes (sem cartão? não recebi o e-mail? já tenho conta?).
- **Wi-Fi:** atalho para a senha da rede no topo da tela, porque o download depende dela.
- **Grupo:** o card mostra quem do grupo já concluiu (opcional, proposta), para um ajudar o outro.

### Estados
Não iniciada; em andamento (passo 1, 2, 3); concluída; precisa de ajuda; offline (avisa que precisa de internet e mostra o Wi-Fi).

## 4. Painel de demonstração
Adicionar:
- Grupos: estado do aluno (sem grupo, 1/3, 2/3, completo), "Encerrar formação", "Encaixar quem ficou sem grupo", "Alguém entrou no meu grupo".
- Ofertas: "Liberar oferta" (escolher qual), "Encerrar condição".
- Gaia One: "Iniciar atividade" e passo atual.
- Códigos novos no "Ir direto para" e parâmetros de URL. Atualizar o README.

## 5. Dados de exemplo
- Grupos já formados e com vaga para cada categoria, coerentes com os ~40 participantes (e mais alunos fictícios só para os grupos, se faltar gente na categoria).
- Duas ofertas com preço, condições e prazo fictícios.
- Passos e FAQ do Gaia One (links reais das lojas só se o fundador passar; senão, simulados).

## 6. Equipe e ordem
1. `product-owner`: regras de negócio e critérios de aceite (`docs/produto/grupos-ofertas-gaia.md`).
2. `product-designer`: fluxos e specs das telas novas (`docs/design/telas/gr-*.md`, `of-*.md`, `ga-*.md`) e atualização do inventário telas × estados.
3. `security-engineer`: revisão rápida de privacidade da lista de grupos e do formulário de interesse da oferta.
4. `mobile-dev`: construção no mockup, com smoke test cobrindo os três fluxos e capturas.
5. `qa-engineer`: revisão dos três fluxos contra os critérios.
6. CEO: atualiza o link de visualização e o roteiro de demo.

## 7. Critérios de aceite
- Um aluno forma ou entra num grupo de 3 em menos de 1 minuto, sem ajuda.
- Nenhum aluno vê ou entra em grupo de outra categoria.
- A oferta não aparece em nenhum lugar antes de "Liberar oferta"; depois, aparece em 1 toque na Home.
- O aluno conclui a atividade Gaia One seguindo só o app.
- Tudo funciona nos três ingressos e é alcançável pelo painel.

## 8. Perguntas para o fundador (respostas mudam o mockup)
1. Grupos: qual o horário de fechamento da formação? E o que fazer com a sobra (grupos de 2 ou de 4)?
2. Grupos: o Diamond tem gente suficiente por edição para formar trios? Se forem poucos, pode juntar Diamond com VIP?
3. Grupos: o time quer um nome ou número oficial para cada grupo (ex.: "Grupo 12"), usado no palco?
4. Ofertas: quais produtos entram no mockup e em que momento (Olimpo no Dia 2 está certo)? Preço e condição podem aparecer ou usamos valores fictícios?
5. Ofertas: a compra é por link de checkout (Hotmart?) ou só com consultor no estande? (A política das lojas para venda dentro do app ainda é [HIPÓTESE].)
6. Ofertas: pode mandar push no momento da liberação, mesmo durante a palestra?
7. Ofertas: depois do evento, a oferta some ou fica disponível por um tempo?
8. Gaia One: o que é o produto em uma frase, quais os links das lojas, o trial pede cartão e existe código promocional?
9. Gaia One: o time precisa saber quem concluiu (lista para o palco)? Isso exige consentimento e entra como requisito do app real.
