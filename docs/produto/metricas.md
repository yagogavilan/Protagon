# Métricas do app Protagon (proposta para o piloto)

Status: proposta | Dono: PO | Data: 2026-11-26 | Insumo: `docs/00-visao/brief.md` §2 e §8

Todas as metas são `[HIPÓTESE]`: o brief não traz benchmark brasileiro e seus números vêm de fornecedores (Nunify: adoção de apps de evento de 48 a 63%; Swapcard: metade dos pedidos de conexão não aceita; Bizzabo 2025: 92% fizeram follow-up). Nada disso foi verificado por mim. As metas servem para definir, antes do piloto, o que fará a diretoria continuar, ajustar ou parar (DD-08). O mockup não instrumenta nada; estes eventos são para o app real.

## 1. Regras comuns

- Nome do evento: `objeto_acao` em passado, `snake_case`. Eventos de dinheiro e de ingresso nascem no servidor (webhook), não no app.
- Propriedades comuns: `edition_id`, `tier` (executivo, vip, diamond), `day` (1 a 3), `user_id` opaco (nunca CPF, e-mail, nome ou telefone).
- Nenhum texto livre em evento (mensagem de pedido, nota, comentário de NPS ficam em armazenamento próprio, fora do analytics).
- Janela de medição: o evento tem 3 dias. A revisão é diária, ao fim de cada dia, e o que não se mexe no dia seguinte não vale medir.
- Amostra: uma edição tem centenas de pessoas, e por categoria pode ter poucas dezenas. Mostrar sempre o número absoluto ao lado do percentual; não comparar categorias com menos de 30 pessoas `[HIPÓTESE]`.
- LGPD: finalidade, base legal e consentimento para analytics de produto precisam de parecer do `security-engineer` antes do app real; dado agregado para a diretoria, nunca por pessoa para Eventos.

## 2. Adoção

| Item | Proposta |
|---|---|
| Definição | Participante com login concluído e pelo menos 1 ação qualificada, na edição |
| Ação qualificada | Abrir detalhe de sessão, abrir ou baixar material, salvar anotação, abrir mapa, ativar perfil de Conexões, enviar pedido de conexão. Não conta: abrir a Home e abrir a credencial (o QR é usado no credenciamento e inflaria o número) |
| Fórmula | usuários únicos com `app_login_succeeded` e ao menos uma ação qualificada / participantes credenciados (check-in) da edição |
| Denominador | Presentes no check-in; se a lista do credenciamento não chegar ao app, usar ingressos ativos e declarar isso |
| Eventos | `app_login_succeeded` {method: email ou cpf, sem o valor}; `session_detail_opened`; `material_opened`; `material_downloaded`; `session_note_saved`; `map_opened`; `connections_profile_activated`; `connection_requested`. Também `login_failed` {reason: not_found, invalid_code} para medir a falha de entrada |
| Cortes | Por ingresso e por dia (adoção diária ativa no dia 2 e no dia 3 é a retenção) |
| Meta inicial `[HIPÓTESE]` | Adoção total de 50% ou mais (ref.: Nunify 48 a 63%, fornecedor); abaixo de 35%, ajustar a divulgação no palco antes de mexer no produto |
| Cuidado LGPD | Login por CPF: registrar só o método. Não gravar IP e dispositivo além do necessário à segurança |

## 3. Taxa de aceite de conexões

| Item | Proposta |
|---|---|
| Definição | Pedidos de conexão aceitos pelo destinatário até o fim do evento, entre os pedidos enviados |
| Fórmula | `connection_accepted` / `connection_requested` (únicos, por par), por dia de envio. Troca por QR presencial fica de fora, é outra métrica (D4) |
| Eventos | `connection_requested` {template_id ou "livre", sem o texto}; `connection_accepted`; `connection_snoozed` (toque em "Agora não"); `connection_request_expired` no fim do evento; `person_blocked`; `person_reported` |
| Atenção D5 | O remetente vê "Pendente", nunca "Recusado". "Agora não" volta só no dia seguinte, então pedido sem resposta não é recusa: medir também a taxa de resposta (aceitou ou "Agora não" / recebidos) |
| Contra-métricas | Pedidos por pessoa (média e máximo, contra os limites de 15 e 25), bloqueios e denúncias por 100 pedidos, mensagens livres contra de modelo |
| Meta inicial `[HIPÓTESE]` | 40 a 50% (ref.: Swapcard, "metade dos pedidos não aceita", fornecedor); abaixo de 25%, investigar a relevância das sugestões e o motivo em uma linha |
| Cuidado LGPD | O fato de alguém ter dito "Agora não" é dado social sensível ao relacionamento: só agregado, com um mínimo de 10 pedidos por corte `[HIPÓTESE]`. Nunca mostrar a Eventos quem recusou quem |

## 4. Encontros marcados

| Item | Proposta |
|---|---|
| Definição | Encontros propostos via "Vamos nos ver?" e confirmados pelos dois, com hora e Ponto de Conexão |
| Fórmula | `meeting_confirmed` / conexões aceitas; e encontros confirmados por 100 participantes com perfil ativo |
| Eventos | `meeting_proposed` {slot: intervalo ou almoço, point: A, B ou C}; `meeting_confirmed`; `meeting_rescheduled`; `meeting_canceled`; `meeting_outcome_reported` (pergunta de 1 toque no dia seguinte: "Vocês se encontraram?") |
| Observação | Se o encontro realmente ocorreu não é medido pelo app (não há check-in nos Pontos); a pergunta pós-evento é uma estimativa autodeclarada, com resposta parcial |
| Meta inicial `[HIPÓTESE]` | O brief não traz referência. Observar na primeira edição e fixar a meta depois. Hipótese de trabalho, sem fonte: 20% das conexões aceitas viram encontro confirmado |
| Cuidado LGPD | Sem localização por GPS; os Pontos são escolhidos pelas pessoas. Horário e ponto de um encontro identificam duas pessoas: não incluir em eventos o ID das duas partes no mesmo registro enviado a ferramentas de terceiros |

## 5. Conversão de upgrade pelo cadeado

| Item | Proposta |
|---|---|
| Definição | Executivos que viram o cadeado e fizeram upgrade para VIP ou Diamond até o fim do evento, pelo app ou pelo estande depois de passar pelo app |
| Funil | Viram a aba com cadeado, tocaram "Quero me conectar", viram o convite, escolheram uma saída, concluíram o upgrade. Calcular cada etapa separada |
| Fórmula | `upgrade_completed` atribuído (até 72 horas, ou fim do evento, o que vier antes, após `upgrade_option_selected`) / Executivos únicos com `locked_connections_viewed` |
| Eventos | `locked_connections_viewed` (C00 aberta); `connect_cta_tapped`; `upgrade_invite_shown`; `upgrade_invite_dismissed`; `upgrade_option_selected` {option: checkout ou stand}; `upgrade_completed` (servidor: webhook de pagamento ou registro de Eventos no estande) {channel: app_checkout, stand_assisted, stand_unattributed} |
| Dependência | Vendas no estande não passam pelo app: Eventos precisa registrar o upgrade e se o aluno veio do app (DD-02, DD-03). Sem isso, a conversão fica subestimada |
| Meta inicial `[HIPÓTESE]` | Sem referência no brief e sem dados do estande. Meta relativa: upgrades vindos do app maiores que zero e comparados ao que o estande vende hoje por edição (dado do comercial, a obter). Definir o número depois de conhecer o preço do upgrade e a quantidade de Executivos |
| Contra-métricas | Taxa de "fechar o convite" (se alta, o convite incomoda), NPS dos Executivos por dia, reclamações. Regra do produto: convite só ao toque, nunca pop-up |
| Cuidado LGPD e CDC | Não registrar dado de pagamento no analytics (só valor e canal). Compra online pode ter direito de arrependimento: parecer do jurídico (DD-02) |

## 6. NPS por dia

| Item | Proposta |
|---|---|
| Definição | Nota de 0 a 10 dada na área Eu, uma vez por dia, mais uma nota final depois do evento |
| Fórmula | NPS = % de notas 9 e 10 menos % de notas 0 a 6, entre quem respondeu. Taxa de resposta = respondentes / participantes com login no dia |
| Eventos | `nps_prompt_shown` {day, kind: daily ou final}; `nps_submitted` {day, score}; `nps_dismissed`. Comentário vai ao armazenamento próprio, fora do analytics |
| Quando perguntar | Só no momento "Fim do dia" (regra 5: durante palestra só aviso operacional) e sempre dispensável |
| Cortes | Por dia, por ingresso, e por usuários que adotaram o app contra os que não adotaram (relação, não causa) |
| Meta inicial `[HIPÓTESE]` | O brief não traz benchmark nem o NPS atual do evento. Meta de comparação: NPS do dia dos usuários do app igual ou acima do NPS do evento hoje (dado a obter com o fundador); taxa de resposta a partir de 30%, sem fonte |
| Problema a resolver | O brief diz "NPS do dia", sem dizer se mede o dia do evento ou o app. Se a pergunta for "recomendaria o Protagon", o resultado mistura palestras e app. Proposta: manter a pergunta do dia e acrescentar 1 pergunta opcional "o app ajudou hoje?" (sim, mais ou menos, não) |
| Cuidado LGPD | Nota associada a `user_id` opaco, com tier; relatório agregado, mínimo de 10 respostas por corte `[HIPÓTESE]`. Comentário livre pode trazer dado pessoal: aviso na tela |

## 7. Pendências e críticas

- Sem os dados do credenciamento por categoria (ingressos por tier por edição) não há denominador confiável; pedir ao fundador.
- Sem o estande instrumentado, a conversão de upgrade e a decisão DD-02 ficam às cegas.
- Cinco métricas pedidas no brief medem uso, não valor. Proposta de decisão do piloto: o app valeu se adoção e aceite atingirem a meta e ao menos X upgrades tiverem passado pelo cadeado (X a definir com o comercial). Registrar em DD-08.
- Ferramenta de analytics e consentimento: decisão do `tech-lead` e do `security-engineer`; fora do escopo da Fase 1.
