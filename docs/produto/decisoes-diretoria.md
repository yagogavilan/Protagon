# Decisões em aberto para a diretoria

Status: para apresentar após a demo | Dono: PO | Data: 2026-11-26 | Roteiro: `docs/produto/roteiro-demo.md`

Convenção: "Recomendação" é do time (PO, com pareceres citados); quem decide é a diretoria e o fundador. Sem resposta, vale o "Se não decidir". Decisões D1-D8 de `docs/decisoes.md` já foram aprovadas pelo fundador, mas D7 e D8 aparecem aqui porque tocam LGPD e operação e a diretoria ainda não viu.

| ID | Tema | Urgência |
|---|---|---|
| DD-01 | Benefícios do Diamond no app | Antes de iniciar o app real |
| DD-02 | Upgrade: no app ou só no estande | Antes do piloto |
| DD-03 | Quem publica avisos e agenda no dia | Antes do piloto |
| DD-04 | Retenção do chat e da rede (D7) e uso dos dados | Antes do piloto (precisa do jurídico) |
| DD-05 | Abrir Conexões antes do evento (D8) | Antes do piloto |
| DD-06 | Webhook da Hotmart trazer CPF | Antes de iniciar o app real |
| DD-07 | Uso do termo "Tinder de negócios" | Já (afeta a demo) |
| DD-08 | Meta e escolha da edição piloto | Antes do piloto |
| DD-09 | Suporte no dia (extra, levantado pelo PO) | Antes do piloto |

## DD-01. Benefícios do Diamond no app

- Contexto: o brief marca "destaque e prioridade" do Diamond como proposta; o designer (F5) alerta que prioridade nas sugestões tira o mérito da afinidade.
- Opções:
  - A. Limite maior (25 contra 15, D4), selo Diamond e pedido Diamond no topo da caixa de quem recebe. Não mexe na ordem das sugestões.
  - B. Prioridade na fila de sugestões (aparece antes para os outros).
  - C. Benefícios fora do app (lounge, Ponto de Conexão exclusivo, mentoria) apenas listados no app.
  - D. Diamond igual ao VIP no app, diferença só no selo.
- Recomendação: A, somada a C se a operação já oferece algo. Evitar B.
- Se não decidir: o mockup segue com A marcado "proposta". Risco: a diretoria preferir B por parecer mais óbvio e o VIP passar a ver "anúncio" na fila.
- Faltam insumos: o que o Diamond recebe hoje no evento e o preço em relação ao VIP. Quem responde: diretoria comercial.

## DD-02. Upgrade vendido pelo app ou só no estande

- Contexto: o cadeado do Executivo leva ao upgrade (D3: checkout simulado e "Falar com o time no estande").
- Opções:
  - A. Só estande: o time vende e Eventos libera o ingresso.
  - B. Checkout web externo (link Hotmart) aberto pelo app.
  - C. Compra dentro do app (pagamento da loja).
  - D. A no piloto, com o app registrando a intenção (toque em "Quero me conectar"), e B ou C depois.
- Recomendação: D. Valida demanda sem depender da loja e gera o dado de conversão (`metricas.md` §5).
- Risco de política das lojas `[HIPÓTESE]`: a loja pode exigir pagamento dentro do app (e comissão) quando a compra libera função digital (Conexões); um link externo pode ser recusado na revisão. A busca em 2026-11-26 não localizou o texto oficial atual (regra 3.1.3(e), bens e serviços consumidos fora do app, e 3.1.1); há discussão em fórum da Apple sobre ingresso de evento que também libera conteúdo digital, sem resposta oficial; regras dos EUA mudaram em 2025 e podem não valer no Brasil. Não verificado. Encaminhar ao `tech-lead` e ao `security-engineer`; ver design-system F10.
- Risco de consumo `[HIPÓTESE]`: venda online fora do estabelecimento pode ter direito de arrependimento (Código de Defesa do Consumidor). Não sou advogado; encaminhar ao jurídico do Grupo Virtus.
- Se não decidir: o app real nasce sem fluxo de venda definido e o checkout do mockup vira promessa sem dono.
- Quem responde: diretoria (comercial) e jurídico.

## DD-03. Quem publica avisos e agenda no dia

- Contexto: "Agenda atualizada", avisos fixados, push e Live Activity só valem se alguém atualizar em minutos; hoje isso é feito no palco e no WhatsApp.
- Opções:
  - A. Painel web simples para Eventos (publicar aviso, mudar horário, push por tipo de ingresso).
  - B. Edição por um dev (arquivo ou banco) a pedido de Eventos.
  - C. Planilha que o app lê.
- Recomendação: no piloto, C ou B com uma pessoa de Eventos nomeada, aprovadora de todo aviso, e a regra "durante palestra, só aviso operacional"; A só depois de validar o uso. `[HIPÓTESE]` meta de publicar em até 2 minutos; validar com Eventos.
- Se não decidir: o app mostra agenda velha, pior do que o WhatsApp, e o aluno volta ao grupo.
- Custo de A: esforço de back-end não estimado (`backend-dev` ainda não opinou).
- Quem responde: diretoria e líder de Eventos/CS (o time de Eventos não foi ouvido; roteiro de entrevista é pendência do PO).

## DD-04. Retenção do chat e da rede após o evento (D7)

- Contexto: D7 aprovada: chat e Minha rede por 90 dias, exportação no dia seguinte ao fim.
- Opções: 30 dias; 90 dias (D7); até o aluno excluir; exportação e exclusão imediatas.
- Recomendação: manter 90 dias, com exclusão a qualquer momento pelo aluno, e confirmar com jurídico e `security-engineer` o texto de consentimento e a base legal.
- Ponto crítico: o Protagon é o principal canal de leads do Olimpo (brief §1). Usar a rede, os contatos ou o chat do aluno para venda do Olimpo é finalidade diferente; exigiria consentimento próprio e separado. Recomendação: proibir esse uso por padrão e registrar isso na diretoria.
- Se não decidir: o mockup mostra 90 dias; o app real não pode iniciar a política de privacidade.
- Quem responde: diretoria e jurídico; parecer do `security-engineer`.

## DD-05. Abrir Conexões antes do evento (D8)

- Contexto: D8 mostra Conexões no estado "antes do evento" com selo "proposta"; brief sugere abrir 2 a 3 semanas antes. A referência do brief (Swapcard: 60% do networking antes do evento) vem de fornecedor, `[HIPÓTESE]`.
- Opções: não abrir (só no dia); ativar perfil e ver sugestões 7 dias antes, com pedidos só a partir do credenciamento; abrir tudo 2 a 3 semanas antes.
- Recomendação: não abrir no piloto, ou no máximo ativar perfil 7 dias antes. Motivos: poucos perfis no início tornam as sugestões fracas; exige login antes do dia (a base de ingressos precisa estar limpa); aumenta moderação. Reavaliar com a taxa de ativação do piloto.
- Se não decidir: fica o estado "antes do evento" no mockup como proposta; o app real não o implementa.
- Quem responde: diretoria; dado de apoio: quantos VIP/Diamond há por edição (ainda não informado).

## DD-06. Webhook da Hotmart trazer CPF

- Contexto: login por e-mail ou CPF + código; ingresso vem do webhook da Hotmart e da lista do credenciamento.
- Fato parcial (consulta em 2026-11-26, fonte: [blog da Hotmart sobre HotConnect e Webhook](https://hotmart.com/es/blog/como-integrar-hotconnect-y-webhook)): o webhook traz um campo de documento informado no checkout; a ajuda da Hotmart diz que CPF/CNPJ só é pedido se o produtor exigir. Nome e formato do campo não verificados `[HIPÓTESE]`.
- Opções:
  - A. Exigir CPF no checkout e guardá-lo.
  - B. Login só por e-mail; CPF opcional ou só na lista do credenciamento.
  - C. Guardar apenas hash do CPF para casar com o credenciamento.
- Recomendação: B, com C se o credenciamento precisar casar pessoa e ingresso. Minimização de dados (LGPD) e CPF sempre mascarado na interface.
- Problema a decidir junto: o comprador pode não ser o participante (empresa compra vários ingressos). O e-mail do webhook seria do comprador. Como o participante recebe o código?
- Se não decidir: o modelo de dados do app real não pode ser desenhado.
- Quem responde: diretoria/comercial (configuração do checkout), `security-engineer`, `backend-dev` (capturar um webhook de teste).

## DD-07. Uso do termo "Tinder de negócios"

- Contexto: o brief usa a expressão; o designer (F3) recomenda não usá-la.
- Opções: usar em pitch e interface; usar só internamente; nunca usar.
- Recomendação: nunca usar, nem em pitch. Vai contra a regra 2 do CLAUDE.md, contamina a percepção da diretoria (app de namoro) e o próprio critério de aceite do brief é "não lembra app de namoro". Frase sugerida: "networking com hora e lugar marcados".
- Se não decidir: a expressão tende a aparecer na conversa e puxar o julgamento para deslizar e curtir.
- Quem responde: fundador (a expressão é dele).

## DD-08. Meta da edição piloto

- Contexto: não há benchmark brasileiro público; os números do brief são de fornecedores (adoção de 48 a 63% da Nunify; metade dos pedidos não aceita, Swapcard).
- Opções de edição: Porto Alegre (dados do mockup); a edição com menos ingressos; uma edição sem upgrade em andamento.
- Recomendação: uma só edição, com metas escritas antes (ver `docs/produto/metricas.md`), cada uma com número de sucesso e de "parar ou ajustar". Escolha da cidade: diretoria, pelo risco operacional.
- Metas iniciais sugeridas `[HIPÓTESE]` em `metricas.md`: adoção a partir de 50%, aceite de conexões em torno de 40 a 50%, upgrade comparado ao que o estande vende hoje.
- Insumos que faltam: ingressos por categoria por edição, vendas de upgrade no estande hoje, NPS atual do evento.
- Se não decidir: o piloto vira "lançamento" sem critério de sucesso e ninguém consegue dizer se o app valeu o investimento.

## DD-09. Suporte no dia (extra)

- Contexto: o login prevê o erro "ingresso não encontrado (com suporte)"; alunos com ingresso de terceiros ou e-mail diferente vão cair ali, no horário de pico do credenciamento.
- Opções: balcão de suporte no credenciamento; WhatsApp do time; formulário no app.
- Recomendação: balcão no credenciamento com acesso à lista, nos primeiros 60 minutos do dia 1; o WhatsApp só como apoio. `[HIPÓTESE]` a quantidade de casos; medir no piloto.
- Se não decidir: o primeiro contato do aluno com o app é uma tela de erro sem saída.
- Quem responde: líder de Eventos/CS.

## Pendências do PO (não são decisões da diretoria)

- Entrevistar o time de Eventos/CS e 5 a 10 alunos VIP/Executivo (roteiro a preparar para o fundador); hoje o escopo se apoia no brief e em pesquisa de fornecedores.
- `docs/produto/pesquisa-mercado.md`, personas e backlog ainda não existem.
