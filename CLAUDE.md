# Protagon — Regras do Time

Este arquivo é lido por TODOS os agentes do time. Ele define o projeto, a fase atual, a forma de trabalhar e as regras que ninguém pode quebrar.

## 1. O projeto

**App Protagon** é o app mobile do aluno do Protagon, o evento presencial de 3 dias do Grupo Virtus (Wendell Carvalho e Karina Peloi Carvalho). O aluno deve saber, a qualquer momento do evento, o que está acontecendo agora, o que vem depois e com quem vale a pena se conectar.

- **Fundador / dono do produto:** Yago. Dá a visão, aprova decisões e leva o mockup à diretoria.
- **Ingressos:** Executivo, VIP e Diamond. Mesmo app; muda o que fica liberado. Conexões (networking) só para VIP e Diamond; o Executivo vê a área com cadeado.
- **Multievento:** Porto Alegre, Belo Horizonte, Goiânia, São Paulo, Joinville. O aluno vê a edição em que está credenciado.
- **Briefing completo:** `docs/00-visao/brief.md` (fonte da verdade de escopo, telas, regras de acesso e tokens visuais).

## 2. Fase atual: Fase 1 — só mockup

- Entregar SOMENTE um mockup navegável de alta fidelidade, em `apps/mockup`.
- Nada de backend, banco de dados, login real ou publicação em loja. `backend-dev` e `security-engineer` só opinam (modelo de dados futuro, LGPD), não constroem.
- O desenvolvimento do app real só começa depois que a diretoria aprovar funcionalidades e visual.

Ordem de trabalho (cada pausa é um gate com o fundador):
1. Pesquisa + mapa de navegação + telas × estados. **Concluída**, aguardando validação: `docs/design/etapa-1.html`, decisões D1–D8 em `docs/decisoes.md`.
2. Design system (tokens + componentes) e 3 telas-chave: Home ao vivo, Conexões (VIP), Conexões (Executivo com cadeado). **Pausar para validar o visual.**
3. Mockup completo navegável com painel de demonstração.
4. Revisão do `qa-engineer` (quem não construiu), ajustes e entrega.

## 3. Stack

| Camada | Mockup (agora) | App (após aprovação, proposta) |
|---|---|---|
| Base | Vite + React + TypeScript em moldura de iPhone 390×844 | Expo / React Native |
| UI | Tailwind + shadcn/ui + Motion, tokens em variáveis CSS | Mesmos tokens no tema nativo |
| Dados | JSON de exemplo + relógio do evento controlável | Supabase (Postgres + RLS por ingresso, Realtime, login por código) |
| Notificações | Simuladas na tela | Expo Push segmentado + Live Activities |
| Ingressos | — | Webhook da Hotmart + lista do credenciamento |

Decisão definitiva da stack do app real vira ADR só depois da aprovação do mockup.

## 4. Estrutura do repositório

```
apps/
  mockup/        # protótipo navegável (Vite + React)       (mobile-dev)
docs/
  00-visao/      # brief do fundador                           (CEO)
  produto/       # pesquisa, decisões de escopo, métricas      (PO)
  gestao/        # board, riscos                               (PM)
  design/        # fluxos, telas×estados, tokens, specs        (Designer)
  arquitetura/   # ADRs, reviews                               (Tech Lead)
  qa/            # planos e relatórios de revisão              (QA)
  seguranca/     # LGPD das Conexões                           (Security)
  decisoes.md    # log de decisões (todos registram, CEO valida)
```

## 5. Como o time trabalha

**Os documentos em `docs/` são a memória compartilhada do time.** Agentes não lembram conversas uns dos outros: o que outro agente precisa saber tem que estar escrito no arquivo certo.

| Papel | Agente | É dono de |
|---|---|---|
| CEO | `ceo` (sessão principal) | Visão, prioridade, gates, orquestração |
| Product Owner | `product-owner` | Pesquisa, escopo, regras de acesso, critérios de aceite, métricas |
| Gerente de Projetos | `project-manager` | Plano das etapas, board, riscos |
| Designer | `product-designer` | UX, fluxos, telas × estados, design system, microcopy |
| Front-end/Mobile | `mobile-dev` | Construção do mockup em `apps/mockup` |
| Tech Lead | `tech-lead` | Code review do mockup, recomendação de stack do app real |
| QA | `qa-engineer` | Revisão de UX e acessibilidade contra os critérios de aceite; veto na entrega |
| Security | `security-engineer` | LGPD e privacidade das Conexões, CPF mascarado, consentimento |
| Back-end | `backend-dev` | Só após a Fase 1 (pode opinar sobre modelo de dados futuro) |

Mapeamento com os papéis do prompt original: Pesquisa de produto = `product-owner`; UX e UI/Design system = `product-designer`; Front-end de protótipo = `mobile-dev`; Revisão (QA de UX e acessibilidade) = `qa-engineer`.

### Como você descobre o seu papel
- **Subagente** (sessão com `.claude/agents/` carregado): seu papel e skills já vêm carregados. O CEO garante que o trabalho aprovado chegue ao `main` ao fim de cada entrega.
- **Thread sem subagentes carregados:** o coordenador começa a tarefa com `PAPEL: <nome>`. Antes de tudo, leia `.claude/agents/<nome>.md` e, só deles, os `.claude/skills/<skill>/SKILL.md` listados em `skills:`. Atue exatamente como esse papel.
- Ao terminar: commit com Conventional Commits. Documentos: merge direto. Código do mockup: `tech-lead` e depois `qa-engineer` revisam antes do merge.

## 6. Postura obrigatória de todo agente

- **Seja crítico.** Se o pedido tem falha, risco ou alternativa melhor, diga antes de executar, com o porquê.
- **Nada de concordar por educação.** Discordar com argumento é parte do trabalho.
- **Separe fato de hipótese.** Marque `[HIPÓTESE]` no que não foi validado. Cite fonte e data de dados de mercado (muitos números do briefing vêm dos próprios fornecedores).
- **Diga o que não sabe.** Liste o que falta e quem deve responder.
- **Respeite as fronteiras.** Não decida o que é de outro papel; registre e encaminhe.

## 7. Produtividade e economia de tokens

- **Aponte, não cole.** Referencie arquivos (`ver docs/00-visao/brief.md §Conexões`).
- **Leia só o necessário.** Grep/Glob antes de abrir arquivos grandes.
- **Retorno curto ao CEO.** Máximo ~15 linhas: resumo, arquivos, decisões pedidas, riscos.
- **Delegue em paralelo** o que é independente; o CEO resolve sozinho o que é trivial.
- **Não gere o que ninguém vai usar.**

## 8. Regras invioláveis do produto

1. Nunca commitar segredos (`.env`, chaves, tokens).
2. Linguagem das Conexões: "conectar", "afinidade", "interesses em comum". Proibido "match", "curtir", corações ou estética de app de namoro.
3. Contato pessoal (telefone, e-mail, redes) só aparece após aceite mútuo. Não existe chat aberto.
4. Cadeado do Executivo: só na aba Conexões e em no máximo um card da Home; convite só ao tocar em "Conectar", sempre fechável, nunca pop-up na abertura.
5. Durante palestras, só avisos operacionais; Conexões e materiais esperam o intervalo.
6. Contraste WCAG AA; botão verde e selo dourado SEMPRE com texto `#020111`. Corpo ≥ 16px, números tabulares.
7. Vidro (blur) só na tab bar e em bottom sheets.
8. Dados fictícios no mockup; CPF sempre mascarado; consentimento de Conexões desligado por padrão.
9. Microcopy em português, direta, sem emoji.

## 9. Convenções

- Idioma: português do Brasil em documentos e interface; código, variáveis e commits em inglês.
- Commits: Conventional Commits. Branches: `feat/<id>-descricao`.
- IDs: telas pelos códigos de `docs/design/etapa-1.html` (E01, A01, C04…); decisões `DEC-###`; histórias `PT-###`; bugs `BUG-###`.
- Datas `AAAA-MM-DD`.
