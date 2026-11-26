# Roteiro de demonstração (5 minutos) para a diretoria

Status: rascunho para ensaio | Dono: PO | Data: 2026-11-26 | Insumos: `docs/00-visao/brief.md` §1, §3, §5, §7; `apps/mockup/README.md`; `DemoPanel.tsx` (nomes dos controles conferidos em 2026-11-26)

## 1. Antes de começar

- Apresentador: Yago. Tela do mockup (moldura + painel) projetada. Dados fictícios; avisar isso na abertura.
- Abrir o link, clicar em "Reiniciar demo". Ensaiar 2 vezes; o cronômetro abaixo não tem folga.
- Plano B se algo travar: atalhos de URL (README): `?auth=app&tier=vip&moment=live&day=1&connections=1` (VIP) e `?auth=app&tier=executivo&moment=break&day=1` (Executivo).
- Não dizer "Tinder de negócios" (ver `decisoes-diretoria.md` DD-07). Dizer: "networking com hora e lugar marcados".
- Não prometer números: o "214 participantes já estão se conectando" do mockup é fictício.

Controles do painel (nomes reais): seção Ingresso (Executivo / VIP / Diamond); Momento (Antes do evento, Sessão ao vivo, Intervalo, Almoço, Fim do dia, Depois do evento); Dia (Dia 1/2/3); botão "Disparar notificação"; chaves "Sem internet" e "Tela bloqueada"; chave "Perfil ativado" e contador "Pedidos hoje" com "Esgotar" e "Zerar" (só VIP/Diamond); chave "Agenda atualizada"; "Reiniciar demo".

Dependência a confirmar com `mobile-dev` antes do ensaio: o README lista como prontas só Login (E01), Código (E02), Home (A01), Credencial (G01), Notificações (G02), Conexões C00, C02, C04 e C01 como stub. Passos que usam Trilha, Materiais, Eu (NPS), pedido, aceite e encontro estão marcados `[confirmar tela]`; se não estiverem prontos, narrar a partir de `docs/design/etapa-1.html`.

## 2. Roteiro cronometrado

Problemas do brief (§1): P1 desorientação; P2 materiais espalhados; P3 networking por acaso; P4 valor do VIP/Diamond invisível.

| Tempo | No app | No painel | O que falar | Resolve |
|---|---|---|---|---|
| 0:00-0:20 | Login (E01): digitar qualquer CPF; código (E02): qualquer, exceto 000000 | Ingresso: VIP | "Hoje o aluno depende do palco e do WhatsApp. Aqui entra com e-mail ou CPF e um código, sem senha." | P1 |

### Parte A: dia de um aluno VIP (0:20 a 2:50)

| Tempo | No app | No painel | O que falar | Resolve |
|---|---|---|---|---|
| 0:20-0:50 | Home (A01): mostrar "Acontecendo agora" e "A seguir" com contagem | Momento: Sessão ao vivo; Dia 1 | "Em 3 segundos o aluno sabe o que está no palco e o que vem depois. Sem perguntar ao vizinho." | P1 |
| 0:50-1:10 | Tocar na credencial (topo); QR grande aparece | Ligar "Sem internet", mostrar o banner, depois desligar | "Credencial e agenda funcionam sem Wi-Fi. O salão lotado é o pior cenário de rede." | P1 |
| 1:10-1:30 | Voltar à Home | Clicar "Disparar notificação" com o momento em Sessão ao vivo; ler o texto do painel ("N em espera até o intervalo") | "Durante a palestra só chega aviso operacional. O resto espera o intervalo. É o que reduz a reclamação de notificação demais." | P1 |
| 1:30-1:55 | Home no intervalo; abrir a Trilha `[confirmar tela]` e uma sessão com material "libera às 14h" `[confirmar tela]` | Momento: Intervalo; ligar "Agenda atualizada"; ligar "Tela bloqueada" (push e Live Activity) e desligar | "No intervalo chegam as notificações em espera e o aviso de agenda atualizada. Material fica na própria sessão, não em três canais." | P1, P2 |
| 1:55-2:30 | Aba Conexões: convite para ativar; ativar o perfil (C01, estado do mockup) e abrir as sugestões (C02): card com empresa, objetivo e motivo em uma linha; tocar "Conectar" | Chave "Perfil ativado" (desligada mostra o convite; ligar para as sugestões) | "VIP ativa em menos de 60 segundos, com consentimento desligado por padrão. A sugestão diz por que vale conversar. Não há chat aberto: contato só depois de aceite dos dois." | P3, P4 |
| 2:30-2:50 | Mostrar pedido recebido (C04); aceitar; ver "Vamos nos ver?" com Ponto de Conexão `[confirmar tela]` | "Pedidos hoje": clicar "Esgotar" e mostrar o limite do dia; "Zerar" | "Tem limite diário para ninguém disparar pedido em massa. O encontro sai com hora e lugar: Ponto C, 15h40." | P3, P4 |

### Parte B: dia de um aluno Executivo (2:50 a 4:25)

| Tempo | No app | No painel | O que falar | Resolve |
|---|---|---|---|---|
| 2:50-3:10 | Home | Ingresso: Executivo; Momento: Almoço | "Mesmo app. Agenda, credencial, mapa e materiais são iguais. Almoço: tela com contagem e volta ao salão às 13h20." | P1 |
| 3:10-3:30 | Mapa pelo atalho da Home (overlay) | (nenhum) | "Mapa com o setor dele destacado e os Pontos de Conexão." | P1 |
| 3:30-4:05 | Aba Conexões (C00): prévia borrada com o contador; tocar "Quero me conectar": convite com duas saídas; fechar o convite | (nenhum) | "O Executivo vê a área, sem dado legível. O convite só aparece quando ele toca, é sempre fechável e nunca vem como pop-up na abertura. Duas saídas: checkout ou falar com o time no estande." | P4 |
| 4:05-4:25 | Reabrir o convite e tocar o checkout simulado; ver "Seu ingresso agora é VIP" | (nenhum) | "Esse é o valor do upgrade visível durante o evento. Se a venda será no app ou só no estande é uma decisão de vocês." | P4 |

### Fechamento (4:25 a 5:00)

| Tempo | No app | No painel | O que falar | Resolve |
|---|---|---|---|---|
| 4:25-4:40 | Eu: NPS do dia `[confirmar tela]` e, depois, resumo pós-evento com "Indique o Protagon" (Home) | Momento: Fim do dia; depois Depois do evento | "No fim do dia, uma nota de 0 a 10. Depois do evento: resumo, materiais, a rede por 90 dias (D7) e indicação." | Retenção pós-evento |
| 4:40-5:00 | Voltar à Home | Ingresso: VIP | Ler as 3 perguntas da seção 3 e abrir a discussão. | Decisões |

Margem: o roteiro usa 5:00 cheios. Se atrasar, cortar o mapa (3:10-3:30) e a chave "Tela bloqueada".

## 3. Três perguntas para a diretoria ao fim da demo

Detalhe, opções e recomendação em `docs/produto/decisoes-diretoria.md`.

1. O upgrade para VIP deve poder ser comprado dentro do app, ou nesta primeira edição só no estande com o time? (DD-02)
2. Quem, do time de Eventos, publica avisos e muda a agenda no dia, e vocês topam um painel simples para isso no app real? (DD-03)
3. Qual edição será o piloto e o que precisa acontecer para vocês dizerem "funcionou" (adoção, conexões aceitas, upgrades)? (DD-08)

## 4. Críticas e lacunas deste roteiro

- Cinco minutos não cobrem Diamond, Materiais, Notificações filtradas e Explorar. O Diamond fica fora porque o benefício ainda não está decidido (DD-01).
- O brief pede "critérios de aceite: navegar o dia do login ao fim do dia 3 sem explicação". A demo guiada não prova isso. Proposta: o teste do cadeado com 3 pessoas do time (brief §9) acontece sem roteiro, antes da diretoria.
- Os nomes dos controles vêm do código atual do painel (2026-11-26); se o `mobile-dev` renomear, atualizar a seção 1.
- Quem apresenta não deve prometer data de app real: o brief só autoriza falar de mockup.
