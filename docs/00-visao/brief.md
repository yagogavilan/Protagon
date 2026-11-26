# App Protagon — Brief do fundador (Fase 1: Mockup)

Data: 2026-11-26 · Dono: Yago · Status: aprovado como escopo da Fase 1

Fonte: documento "App Protagon — Prompt para a equipe de agentes (Fase 1: Mockup)". Este arquivo guarda o essencial; o que não estiver aqui, pergunte ao CEO.

## 1. Contexto e objetivo

O aluno deve saber, a qualquer momento do evento, **o que está acontecendo agora, o que vem depois e com quem vale a pena se conectar**.

O Protagon é o evento presencial de 3 dias do Grupo Virtus (Wendell Carvalho e Karina Peloi Carvalho): desenvolvimento pessoal, liderança, mentalidade e negócios. Roda em várias cidades (Porto Alegre, Belo Horizonte, Goiânia, São Paulo, Joinville), começa às 9h todos os dias e é o principal canal de leads para o Olimpo.

Problemas que o app resolve:
- **Desorientação:** o aluno depende do palco e do WhatsApp para horários, pausas e almoço.
- **Materiais espalhados** por canais diferentes.
- **Networking por acaso:** centenas de empresários na sala se conectam pouco e sem critério.
- **Valor do VIP e do Diamond:** falta um benefício visível durante o evento que justifique o upgrade.

## 2. Pesquisa de mercado (resumo)

- Networking guiado por objetivos declarados, aceite mútuo e encontro com hora e lugar. Sem chat aberto.
- Uso ao vivo: tela "Agora", agenda e credencial offline, poucas notificações e bem segmentadas.
- No Brasil (Sympla, Even3, Doity): ingresso e agenda, pouco matchmaking. Espaço para as Conexões serem o diferencial.

| Referência | O que levamos |
|---|---|
| Brella | Objetivos em opções prontas; encontro com hora e Ponto de Conexão |
| Grip | "Conectar" e "Agora não"; chat só após aceite |
| Swapcard | Limite diário, quebra-gelos prontos, acesso por ingresso |
| Whova | Conectar pelo QR da credencial com confirmação |
| Cvent | Banner "Agenda atualizada" |
| Bizzabo Klik | Validar no futuro (exige hardware) |
| Doity | Offline obrigatório; gamificação fica para depois |

Reclamações comuns: notificações demais (72% das menções negativas na Whova/Capterra), cadastro longo, dependência do Wi-Fi, lista sem filtro e pedidos em massa, app que trava no pico.

Padrão de cadeado: prévia borrada com uma linha de valor; convite ao tentar usar, nunca na abertura; texto neutro; sempre fácil de fechar.

Números de referência (maioria de fornecedores, tratar como `[HIPÓTESE]`): Swapcard — 60% do networking antes do evento, metade dos pedidos não aceita, IA aumenta aceitação em 55%; Bizzabo 2025 — 92% fizeram follow-up; adoção de apps de evento 48–63% (Nunify). Sem benchmark brasileiro público.

## 3. Regras de acesso por ingresso

| Recurso | Executivo | VIP | Diamond |
|---|---|---|---|
| Trilha, agenda, Agora/Próximo | Sim | Sim | Sim |
| Notificações e avisos | Sim | Sim | Sim |
| Materiais e exercícios | Sim | Sim | Sim |
| Credencial (QR) e mapa | Sim | Sim | Sim |
| Selo do ingresso no perfil | Executivo | VIP | Diamond |
| Conexões: ver a área | Cadeado + prévia borrada | Sim | Sim |
| Conexões: perfil, sugestões, pedidos, chat | Não | Sim | Sim |
| Conexões: destaque e prioridade | Não | Não | Sim (proposta) |

Cadeado do Executivo: ícone de cadeado na aba; prévia real borrada ("38 pessoas com interesses parecidos com os seus estão aqui", só se o número for real), nunca dados legíveis; "Quero me conectar" leva ao upgrade (checkout ou time no estande); só nessa aba e em no máximo um card da Home.

## 4. Navegação, telas e estados

Cinco abas: **Agora, Trilha, Conexões, Materiais, Eu**. Sino de notificações e credencial (QR) no topo de todas as telas. Agenda, mapa e credencial a no máximo 2 toques, funcionando offline.

Inventário completo de telas × estados (35 telas, 130 estados, com códigos): `docs/design/etapa-1.html`.

Pontos obrigatórios:
- **Login:** e-mail ou CPF + código de 6 dígitos, sem senha. Erros: código inválido, ingresso não encontrado (com suporte).
- **Onboarding:** até 3 telas, puláveis. Permissão de notificações só depois do primeiro valor (ao abrir a trilha do dia). VIP/Diamond recebem convite para ativar Conexões.
- **Home (bento grid):** "Acontecendo agora" com progresso; "A seguir" com contagem; banner de status (Intervalo 15 min, "Almoço até 13h30 — volte ao salão às 13h20", Agenda atualizada); atalhos credencial, mapa, Wi-Fi; avisos fixados; card de Conexões ou teaser com cadeado. Versões: antes do evento (contagem, checklist, local, estacionamento), durante, almoço, fim do dia, depois do evento (resumo, materiais, conexões, NPS final, "Indique o Protagon").
- **Trilha:** Dia 1/2/3, linha do tempo com palestras, dinâmicas, exercícios, intervalos e almoço; concluído / agora / próximo; progresso da jornada.
- **Detalhe da sessão:** palestrante, objetivo, material vinculado (liberado ou "libera às 14h"), anotações pessoais.
- **Notificações:** filtros Avisos, Agenda, Conexões; "limpar tudo". Durante palestras só avisos operacionais. Push na tela bloqueada e Live Activity / Dynamic Island ("Almoço · retorno 13h30").
- **Almoço/Intervalo:** tela cheia com contagem, onde comer, atalho para o mapa.
- **Mapa:** setor do aluno destacado; plenária por categoria, credenciamento, banheiros, almoço, estande, Pontos de Conexão A/B/C, saídas.
- **Credencial:** QR grande, nome, selo, setor, "Adicionar à Wallet", offline, brilho máximo.
- **Materiais:** por dia e sessão (PDF, workbook, áudio, vídeo); liberado, agendado, baixado, concluído.
- **Eu:** perfil, ingresso, notificações, privacidade (visibilidade, pausar perfil, excluir dados), suporte, FAQ, NPS do dia (0–10).

## 5. Conexões (o diferencial)

"Tinder de negócios" sóbrio, só VIP e Diamond.
1. **Ativar perfil em < 60 s:** foto, nome, empresa, cargo, cidade, segmento; objetivos prontos ("Busco sócio", "Busco clientes", "Contrato serviços", "Ofereço serviços", "Quero mentorar", "Quero ser mentorado", "Parcerias", "Investimento"); até 8 interesses; campos visíveis; consentimento LGPD desligado por padrão.
2. **Sugestões em cards:** empresa e objetivo antes da foto; motivo em uma linha ("3 interesses em comum · vocês dois buscam parcerias no varejo"); "Conectar" e "Agora não"; deslizar é secundário.
3. **Pedido:** mensagem de modelo ou própria; limite diário.
4. **Aceite mútuo:** libera chat e contatos (WhatsApp, LinkedIn, Instagram).
5. **Encontro:** "Vamos nos ver?" sugere intervalo ou almoço e Ponto de Conexão ("Ponto C, 15h40"); o outro confirma ou sugere outro horário.
6. **Minha rede:** notas privadas, exportação após o evento.
7. **Extras:** Explorar (filtros segmento, cidade, objetivo, ingresso), Pedidos recebidos, Chat, Perfil de outra pessoa, troca por QR com confirmação dos dois.
8. **Segurança:** bloquear, denunciar, desfazer conexão, pausar perfil em todo perfil.
9. **Propostas (marcar como "proposta"):** abrir Conexões 2–3 semanas antes; selo e destaque Diamond.

## 6. Identidade visual

- Marca: logo https://protagon.wendellcarvalho.com.br/wp-content/uploads/2025/10/logooleao.svg · símbolo https://protagon.wendellcarvalho.com.br/wp-content/uploads/2025/07/cropped-Protagon-Simbolo-1-300x300.webp · site https://protagon.wendellcarvalho.com.br
- Dark-first, 4 superfícies, profundidade por bordas finas e luz. Dourado como luz (bordas 1px, anel ao vivo, ícones ativos, brilho radial), nunca fundo de texto branco. Vidro só na tab bar e sheets. Bento grid na Home. Microinterações com vibração (check-in, aceitar conexão, intervalo acabando); respeitar reduzir movimento e transparência. Ações principais no terço inferior.

```text
color.bg.base #020111 | surface.1 #0E0D24 | surface.2 #16153A | surface.3 #1E1D48
color.border.subtle rgba(240,206,153,0.12) | border.strong #6B6994
color.text.primary #F5F3EE | secondary #A8A6B8 | tertiary #8A8899
color.gold.500 #CC8F4E | gold.200 #F0CE99 | gradient.gold linear-gradient(135deg,#CC8F4E,#F0CE99)
color.cta linear-gradient(135deg,#33EC74,#1FCF58) | on-cta #020111
state.live #33EC74 | state.warning #FFB547 | state.danger #FF5C6C | state.info #5AB8FF
state.locked overlay rgba(2,1,17,0.72) + cadeado gold.200
tier.executivo #A8A6B8 | tier.vip gradient.gold | tier.diamond linear-gradient(135deg,#F0CE99,#FFFFFF 50%,#5AB8FF)
font Sora | display 32/40 700 | h1 24/32 600 | h2 20/28 600 | body 16/24 400 | caption 13/18 500 | tabular-nums
radius 8/12/20/28/pill | grid 4pt, margem 20
shadow.card 0 8px 24px rgba(0,0,0,.45) + inset 0 1px 0 rgba(240,206,153,.08)
glow.gold 0 0 24px rgba(204,143,78,.35) | glow.live 0 0 16px rgba(51,236,116,.45)
glass.nav rgba(14,13,36,.72) + blur 24px
motion 120/200/320ms cubic-bezier(.2,.8,.2,1)
```

## 7. Mockup: stack e painel de demonstração

- Vite + React + TypeScript + Tailwind + shadcn/ui + Motion (`motion`), moldura de iPhone 390×844.
- Dados JSON: 1 edição (Porto Alegre), 3 dias de agenda, ~40 participantes fictícios, materiais e notificações.
- Painel fora da moldura: ingresso (Executivo/VIP/Diamond); momento (antes, sessão ao vivo, intervalo, almoço, fim do dia, depois); "disparar notificação"; "sem internet".
- Publicar como link compartilhável.

## 8. Entregáveis finais

- Link do mockup e repositório.
- Roteiro de demo de 5 min: dia de um VIP e de um Executivo.
- Decisões em aberto para a diretoria (benefícios Diamond, upgrade no app ou estande, quem publica avisos, retenção do chat).
- Métricas: adoção (login + 1 ação), aceite de conexões, encontros marcados, conversão de upgrade pelo cadeado, NPS por dia.
- Recomendação de stack do app real, sem iniciar nada.

## 9. Critérios de aceite

- Navegar o dia de um aluno, do login ao fim do dia 3, sem explicação.
- Todos os estados existem e são acessíveis pelo painel.
- Reconhecido como Protagon à primeira vista e parece produto de tecnologia.
- WCAG AA; legível com brilho baixo.
- Conexões não lembra app de namoro; o cadeado convida sem irritar (teste com 3 pessoas do time).
