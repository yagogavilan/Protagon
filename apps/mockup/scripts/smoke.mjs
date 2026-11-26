#!/usr/bin/env node
/**
 * Smoke test do mockup (Playwright). Percorre o dia de um aluno VIP, do login ao fim do Dia 3, e o de um
 * Executivo; falha se houver erro de console ou de página; salva uma captura por tela principal.
 *
 * Uso (de apps/mockup):
 *   npm run build            # gera dist/
 *   node scripts/smoke.mjs   # serve dist/ numa porta local e roda os dois roteiros
 *
 * Variáveis: SMOKE_URL (usa um servidor já rodando, ex. http://127.0.0.1:5173/), CHROME_PATH (Chrome/Chromium),
 * SMOKE_OUT (pasta das capturas; padrão docs/design/capturas/etapa-3).
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const require = createRequire(join(root, 'package.json'));
const { chromium } = require('playwright-core');

const OUT = resolve(process.env.SMOKE_OUT ?? join(root, '../../docs/design/capturas/etapa-3'));
const CHROME = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => p && existsSync(p));

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2' };

function serve(dir) {
  return new Promise((ok) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://x');
      let file = normalize(join(dir, decodeURIComponent(url.pathname)));
      if (!file.startsWith(dir)) file = join(dir, 'index.html');
      if (!existsSync(file) || statSync(file).isDirectory()) file = join(dir, 'index.html');
      res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
      res.end(readFileSync(file));
    });
    server.listen(0, '127.0.0.1', () => ok({ server, url: `http://127.0.0.1:${server.address().port}/` }));
  });
}

const errors = [];
let shots = 0;
let page;
/** URLs pedidas pela página atual (prova de que os dados da oferta só chegam na liberação) */
let requests = [];

const frame = () => page.getByRole('region', { name: /Tela do app Protagon/ });
const panel = () => page.getByRole('complementary', { name: 'Painel de demonstração' });
const wait = (ms = 350) => page.waitForTimeout(ms);

async function shot(name) {
  await wait(450);
  await frame().screenshot({ path: join(OUT, `${name}.png`) });
  shots += 1;
}

/** Toque num botão do aparelho pelo nome acessível (texto exato ou regex) */
async function tap(name, opts = {}) {
  const loc = frame().getByRole(opts.role ?? 'button', { name, exact: typeof name === 'string' }).last();
  await loc.waitFor({ state: 'visible', timeout: 6000 });
  await loc.click();
  await wait();
}

/** Toque numa sheet (fica dentro do aparelho, em #sheet-root) */
async function tapDialog(name) {
  const loc = frame().getByRole('dialog').getByRole('button', { name, exact: typeof name === 'string' }).first();
  await loc.waitFor({ state: 'visible', timeout: 6000 });
  await loc.click();
  await wait();
}

async function tab(name) {
  await frame().getByRole('navigation', { name: 'Navegação principal' }).getByRole('button', { name: new RegExp(`^${name}`) }).click();
  await wait();
}

async function setPanel(group, label) {
  await panel().getByRole('radiogroup', { name: group }).getByRole('radio', { name: label, exact: true }).click();
  await wait(250);
}

async function toggle(label) {
  await panel().getByRole('switch', { name: new RegExp(label) }).click();
  await wait(250);
  // "Conectado de novo" some em 2,5 s: espera para a captura seguinte mostrar o estado normal
  if (label === 'Sem internet' && (await panel().getByRole('switch', { name: /Sem internet/ }).getAttribute('aria-checked')) === 'false') await wait(2800);
}

async function expectText(text, scope = frame()) {
  await scope.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout: 6000 });
}

const IG = /@[\w.]+\.exemplo/;

/** Instagram é contato: nenhum @ de outra pessoa pode estar na tela (antes do aceite, com a opção desligada) */
async function expectNoInstagram(where) {
  const n = await frame().getByText(IG).count();
  if (n > 0) throw new Error(`Instagram apareceu antes do aceite (${where}): ${n} ocorrência(s)`);
}

async function expectInstagram(where) {
  await frame().getByText(IG).first().waitFor({ state: 'visible', timeout: 6000 }).catch(() => {
    throw new Error(`Instagram não apareceu (${where})`);
  });
}

async function openPage(url) {
  const ctx = await browser.newContext({ viewport: { width: 1100, height: 940 }, locale: 'pt-BR' });
  page = await ctx.newPage();
  requests = [];
  page.on('request', (r) => requests.push(r.url()));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`[console] ${m.text()}`);
  });
  page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));
  await page.goto(url, { waitUntil: 'networkidle' });
  return ctx;
}

async function login(identifier) {
  await shot(`${prefix}-01-login`);
  await frame().getByLabel('E-mail ou CPF').fill(identifier);
  await tap('Receber código');
  await frame().getByLabel('Código de 6 dígitos').waitFor({ state: 'attached', timeout: 6000 });
  await shot(`${prefix}-02-codigo`);
  await frame().getByLabel('Código de 6 dígitos').fill('482917');
  await expectText('Entrando');
  await frame().getByRole('heading', { name: 'Saiba o que está acontecendo agora' }).waitFor({ timeout: 6000 });
}

let browser;
let prefix = 'vip';

async function vipDay(baseUrl) {
  prefix = 'vip';
  const ctx = await openPage(baseUrl);

  // E01 erro: ingresso não encontrado
  await frame().getByLabel('E-mail ou CPF').fill('000.000.000-00');
  await tap('Receber código');
  await expectText('Não encontramos ingresso');
  await shot('vip-00-login-ingresso-nao-encontrado');
  await page.reload({ waitUntil: 'networkidle' });

  await login('rafael.moraes@exemplo.com.br');

  // E03 onboarding (VIP: 3 telas, a última convida para Conexões)
  await shot('vip-03-onboarding-1');
  await tap('Continuar');
  await shot('vip-04-onboarding-2');
  await tap('Continuar');
  await shot('vip-05-onboarding-3-convite-conexoes');
  await tap('Ativar meu perfil');

  // C01 ativar perfil em 3 passos
  await shot('vip-06-c01-passo-1');
  await tap('Continuar');
  await shot('vip-07-c01-passo-2');
  await tap('Continuar');
  await shot('vip-08-c01-passo-3-consentimento');
  // SEC-001/SEC-002: o texto do consentimento e as chaves por canal nascem desligados
  const consentSwitch = frame().getByRole('switch', { name: /Autorizo mostrar meu perfil/ });
  if ((await consentSwitch.getAttribute('aria-checked')) !== 'false') throw new Error('Consentimento deveria começar desligado');
  for (const canal of ['WhatsApp', 'LinkedIn', 'Instagram']) {
    if ((await frame().getByRole('switch', { name: new RegExp(`^${canal}`) }).first().getAttribute('aria-checked')) !== 'false') throw new Error(`Canal ${canal} deveria começar desligado`);
  }
  await expectText('Não usamos para venda de outros produtos');
  await consentSwitch.evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await shot('vip-08b-c01-passo-3-autorizacao');
  await consentSwitch.click();
  await tap('Ativar perfil');
  await expectText('Seu perfil está no ar');
  await shot('vip-09-c01-concluido');
  await tap('Ver sugestões');

  // C02 sugestões e C04 pedido
  await expectText('Afinidade');
  await expectText('Complete seu perfil');
  await expectNoInstagram('C02, card sem desafio e conhecimento');
  await shot('vip-10-c02-sugestoes');

  // DEC-002: perfil sem desafio/conhecimento usa o motivo antigo; ao completar, o motivo passa a ser o cruzamento
  await tap('Completar');
  await expectText('Qual é o seu maior desafio hoje?');
  await shot('vip-10a-c01-complete-seu-perfil');
  await tap('Reter clientes depois do 3º mês');
  await tap('Expansão por franquia');
  await tap('Liderança de equipes');
  await tap('Salvar perfil');
  await expectText(/Vocês podem se ajudar:|Domina .+, seu maior desafio hoje|Você domina /);
  await expectNoInstagram('C02, depois de completar o perfil');
  await wait(4800); // o aviso "Perfil salvo" some antes da captura
  await shot('vip-10b-c02-motivo-por-desafio-e-conhecimento');

  // C03 antes do aceite: nicho, objetivo, desafio e "Domina" completos; nenhum Instagram
  await tap(/^Ver perfil de /);
  await expectText('Por que vale conversar');
  await expectText('Objetivo no Protagon');
  await expectNoInstagram('C03 antes do aceite');
  await shot('vip-10c-c03-perfil-antes-do-aceite');
  await tap('Voltar');
  await tap(/^Conectar com /);
  await expectText('Escolha uma mensagem', frame());
  await shot('vip-11-c04-pedido');
  await tapDialog('Enviar pedido');
  await expectText('Pedido enviado');
  await shot('vip-12-c02-pedido-enviado');

  // A01 Home ao vivo
  await tab('Agora');
  await shot('vip-13-a01-home-ao-vivo');

  // T01 Trilha + E04 permissão
  await tab('Trilha');
  await expectText('Receber os avisos do evento');
  await shot('vip-14-e04-permissao');
  await tapDialog('Ativar avisos');
  await tapDialog('Permitir');
  await wait(500);
  await shot('vip-15-t01-trilha');

  // T02 detalhe da sessão com anotação
  await frame().getByRole('button', { name: /^Palestra: A mentalidade do protagonista/ }).click();
  await wait(500);
  await frame().getByRole('textbox', { name: 'Minhas anotações' }).fill('Assumir o resultado: revisar metas da Rede Movimento nesta semana.');
  await shot('vip-16-t02-sessao-ao-vivo');
  await tap('Voltar');

  // M01 Materiais
  await tab('Materiais');
  await shot('vip-17-m01-materiais-agendados');

  // G02 Notificações
  await tab('Agora');
  await frame().getByRole('button', { name: /^Notificações/ }).first().click();
  await expectText('Marcar todas como lidas');
  await shot('vip-18-g02-notificacoes');
  await frame().getByRole('tablist', { name: 'Filtrar notificações' }).getByRole('tab', { name: /^Conexões/ }).click();
  await shot('vip-18b-g02-filtro-conexoes');
  await tap('Voltar');

  // Intervalo: pedidos recebidos, aceite, chat, encontro
  await setPanel('Momento do evento', 'Intervalo');
  await shot('vip-19-a01-home-intervalo');
  await tap(/Intervalo\. Abrir tela cheia/);
  await expectText('Volte ao salão em');
  await shot('vip-20-a02-intervalo');
  await setPanel('Posição na pausa', 'Faltam 5 min');
  await shot('vip-21-a02-faltam-5-min');
  await setPanel('Posição na pausa', 'Volte agora');
  await shot('vip-22-a02-volte-agora');
  await tap('Fechar tela do intervalo');

  await tab('Conexões');
  await tap(/^Pedidos/, { role: 'tab' });
  await frame().getByRole('article', { name: /^Pedido de/ }).first().waitFor({ timeout: 6000 });
  await shot('vip-23-c05-pedidos-recebidos');
  await tap(/^Aceitar pedido de /);
  await expectText('Conectados com');
  await shot('vip-24-c05-aceito');
  await tap('Conversar');
  await expectText('Comece com uma mensagem');
  await expectInstagram('chat depois do aceite');
  await shot('vip-25-c07-primeira-mensagem');
  await frame().getByRole('button', { name: /Vamos nos ver no próximo intervalo/ }).click();
  await tap('Enviar mensagem');
  await tap('Vamos nos ver?');
  await expectText('Quando');
  await shot('vip-26-c08-marcar-encontro');
  await tapDialog(/^Propor /);
  await expectText('Você propôs um encontro');
  await shot('vip-27-c07-encontro-proposto');
  await panel().getByRole('button', { name: /Outro confirma/ }).click();
  await expectText('Encontro confirmado');
  await shot('vip-28-c07-encontro-confirmado');
  await tap('Voltar');

  // Perfil e segurança
  await tab('Conexões');
  await tap(/^Minha rede/, { role: 'tab' });
  await expectInstagram('Minha rede');
  await shot('vip-29-c09-minha-rede');
  await tap(/^Abrir perfil de /);
  await frame().getByRole('region', { name: 'Contatos', exact: true }).getByText('Instagram', { exact: true }).waitFor({ state: 'visible', timeout: 6000 });
  await frame().getByRole('region', { name: 'Contatos', exact: true }).evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await shot('vip-29b-c03-conectados-contatos-com-instagram');
  await tap('Voltar');
  await tap(/^Explorar/, { role: 'tab' });
  await shot('vip-30-c06-explorar');
  await tap(/^Filtros/);
  await tapDialog(/^Varejo$|Varejo/).catch(() => {});
  await tapDialog('Tráfego pago');
  await shot('vip-31-c06-filtros');
  await tapDialog(/^Ver /);
  await expectText('Domina tráfego pago');
  await shot('vip-32-c06-resultados-filtrados');

  // C10 QR
  await tap('Ler QR');
  await shot('vip-33-c10-camera');
  await tap('Simular leitura de um QR');
  await shot('vip-34-c10-pessoa-encontrada');
  await tap('Enviar pedido de conexão');
  await expectText('Aguardando');
  await shot('vip-35-c10-aguardando');
  await expectText('estão conectados');
  await shot('vip-36-c10-conectados');
  await tap('Fechar leitor de QR');

  // Almoço: onde comer e mapa
  await setPanel('Momento do evento', 'Almoço');
  await tab('Agora');
  await shot('vip-37-a01-home-almoco');
  await tap(/Onde comer/);
  await shot('vip-38-a03-onde-comer');
  await tap('Voltar');
  await tap(/Mapa do local, abrir/);
  await shot('vip-39-a04-mapa');
  await tap('Ponto C');
  await shot('vip-40-a04-mapa-ponto-selecionado');
  await tab('Agora');

  // Sem internet, tela bloqueada e Live Activity
  await toggle('Sem internet');
  await shot('vip-41-g05-sem-internet');
  await tab('Materiais');
  await shot('vip-42-m01-offline-so-baixados');
  await toggle('Sem internet');
  await tab('Agora');
  await toggle('Tela bloqueada');
  await shot('vip-43-g04-live-activity-bloqueada');
  await panel().getByRole('button', { name: /Disparar notificação/ }).click();
  await shot('vip-44-g03-push-bloqueada');
  await toggle('Tela bloqueada');

  // Fim do Dia 1, NPS
  await setPanel('Momento do evento', 'Fim do dia');
  await shot('vip-45-a01-fim-do-dia');
  await frame().getByRole('radio', { name: '9', exact: true }).first().click();
  await tap('Enviar avaliação');
  await shot('vip-46-u04-nps-respondido-na-home');

  // M02 leitor, credencial
  await tab('Materiais');
  await shot('vip-47-m01-liberado-baixado-concluido');
  await tap(/Slides: A mentalidade do protagonista\. PDF/);
  await shot('vip-48-m02-leitor-pdf');
  await tap('Fechar');
  await tap(/Áudio: Autorresponsabilidade.*Abrir/);
  await shot('vip-49-m02-player-audio');
  await tap('Fechar');
  await frame().getByRole('button', { name: 'Abrir credencial' }).click();
  await wait(500);
  await shot('vip-50-g01-credencial');
  await tap('Voltar');

  // Dias 2 e 3
  await setPanel('Dia do evento', 'Dia 2');
  await setPanel('Momento do evento', 'Sessão ao vivo');
  await tab('Trilha');
  await shot('vip-51-t01-dia-2-em-andamento');
  await setPanel('Dia do evento', 'Dia 3');
  await setPanel('Momento do evento', 'Fim do dia');
  await tab('Agora');
  await shot('vip-52-a01-fim-do-dia-3');
  await setPanel('Momento do evento', 'Depois do evento');
  await shot('vip-53-a01-depois-do-evento');
  await tab('Conexões');
  await tap(/^Minha rede/, { role: 'tab' });
  await shot('vip-54-c09-exportar-contatos');
  await tab('Eu');
  await shot('vip-55-u01-perfil-e-ingresso');
  await tap(/^Avaliação do dia/);
  await shot('vip-56-u04-avaliacao');
  await tab('Eu');
  await tap(/^Privacidade/);
  const igSwitch = frame().getByRole('switch', { name: /Mostrar meu Instagram antes da conexão/ });
  await igSwitch.waitFor({ state: 'visible', timeout: 6000 });
  if ((await igSwitch.getAttribute('aria-checked')) !== 'false') throw new Error('Opção de Instagram antes da conexão deveria começar desligada');
  await expectText('Proposta');
  await shot('vip-57-u03-privacidade');
  // Ligando a opção, quem também liberou mostra o @ antes do aceite (Juliana Prates libera; sem aceite entre vocês)
  await igSwitch.click();
  // SEC-004: ligar pede confirmação com o aviso de que o Instagram fica fora do app; a chave só liga ao confirmar
  await expectText('bloquear e denunciar daqui não valem', frame());
  if ((await igSwitch.getAttribute('aria-checked')) !== 'false') throw new Error('A chave só deve ligar depois de confirmar o aviso');
  await shot('vip-57a-u03-aviso-instagram');
  await tapDialog('Mostrar meu Instagram');
  await wait(4800); // o aviso da opção some antes das próximas capturas
  await tap('Voltar');
  await tab('Conexões');
  await tap(/^Explorar/, { role: 'tab' });
  await frame().getByLabel('Buscar por nome, empresa, nicho ou interesse').fill('Prates Moda');
  await wait();
  await tap(/^Prates Moda, /);
  await expectText('@julianaprates.exemplo');
  await frame().getByRole('region', { name: 'Contatos', exact: true }).evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await shot('vip-57b-c03-instagram-liberado-por-opcao-ligada');
  await tap('Voltar');
  await tab('Eu');
  await tap(/^Privacidade/);
  await igSwitch.click();
  await wait(4800); // o aviso da opção some antes das próximas capturas
  await tap('Voltar');
  await tap(/^Notificações/);
  await shot('vip-58-u02-preferencias');
  await tap('Voltar');
  await tap(/^Suporte e FAQ/);
  await shot('vip-59-u05-suporte-faq');
  await ctx.close();
}

async function executivoDay(baseUrl) {
  prefix = 'exec';
  const ctx = await openPage(baseUrl);
  await setPanel('Ingresso', 'Executivo');
  await login('executivo@exemplo.com.br');

  // E03: Executivo vê 2 telas, sem convite de Conexões
  await shot('exec-03-onboarding-1');
  await tap('Continuar');
  await shot('exec-04-onboarding-2');
  await tap('Começar');

  // A01 com um único teaser de Conexões
  await expectText('Conexões');
  await shot('exec-05-a01-home-com-teaser');

  // C00 e convite de upgrade (sempre fechável)
  await tab('Conexões');
  await expectText('já estão se conectando');
  await shot('exec-06-c00-cadeado');
  await tap('Quero me conectar');
  await expectText('Libere as Conexões');
  await shot('exec-07-c00-convite-de-upgrade');
  await tapDialog('Falar com o time no estande');
  await expectText('Estande');
  await shot('exec-08-a04-mapa-estande');
  await tab('Conexões');
  await tap('Quero me conectar');
  await tapDialog('Agora não');
  await shot('exec-09-c00-convite-fechado');

  // Trilha, permissão negada, materiais, mapa, credencial
  await tab('Trilha');
  await tapDialog('Ativar avisos');
  await tapDialog('Não permitir');
  await expectText('Avisos desligados');
  await shot('exec-10-e04-permissao-negada');
  await tapDialog('Entendi');
  await shot('exec-11-t01-trilha');
  await tab('Materiais');
  await shot('exec-12-m01-materiais');
  await tab('Agora');
  await tap(/Mapa do local, abrir/);
  await shot('exec-13-a04-mapa-executivo');
  await frame().getByRole('button', { name: 'Abrir credencial' }).click().catch(async () => {
    await tab('Agora');
    await frame().getByRole('button', { name: 'Abrir credencial' }).click();
  });
  await wait(500);
  await shot('exec-14-g01-credencial-executivo');
  await tap('Ler QR de outra pessoa');
  await expectText('já estão se conectando');
  await shot('exec-15-c10-executivo-cai-no-c00');

  // Almoço, sem internet, Fim do dia e depois do evento
  await setPanel('Momento do evento', 'Almoço');
  await tab('Agora');
  await shot('exec-16-a01-almoco');
  await toggle('Sem internet');
  await shot('exec-17-a01-almoco-sem-internet');
  await toggle('Sem internet');
  await setPanel('Dia do evento', 'Dia 3');
  await setPanel('Momento do evento', 'Fim do dia');
  await shot('exec-18-a01-fim-do-dia-3');
  await setPanel('Momento do evento', 'Depois do evento');
  await shot('exec-19-a01-depois-do-evento');
  await tab('Eu');
  await shot('exec-20-u01-perfil-executivo');
  await tap(/^Privacidade/);
  await shot('exec-21-u03-privacidade-executivo');
  await ctx.close();
}


/* =====================================================================================================
 * Grupos de 3 (GR), Ofertas do palco (OF) e atividade Gaia One (GA): DEC-003, DEC-004, SEC-018 a SEC-024
 * ===================================================================================================== */

const expectNoText = async (rx, where, scope = frame()) => {
  const t = (await scope.innerText()).replace(/\s+/g, ' ');
  const m = t.match(rx);
  if (m) throw new Error(`Texto proibido em ${where}: "${m[0]}"`);
};

/** Página empilhada do topo (a aba de trás também está no DOM, então os testes de tela olham só aqui) */
const ov = () => frame().locator('.z-overlay').last();

/** Corpo da página inteira (moldura + painel): nada da oferta pode estar em lugar nenhum antes da liberação */
const pageText = async () => (await page.locator('body').innerText()).replace(/\s+/g, ' ');

// Nome do produto, preço e condição: não podem estar em NENHUM lugar da página (moldura e painel) antes da liberação
const OFFER_DATA = /Olimpo|Liderança 360|Assinar o|Reservar minha vaga|12x de|6x de|1\.490|1\.290|1\.788|17\.880|15\.990|Hotmart/i;
// Textos do app que anunciam uma oferta: não podem estar em nenhuma tela do aparelho antes da liberação
const OFFER_UI = /Oferta especial|Oferta do palco|Ofertas do evento|Condição válida|Condição do evento/i;

// Primeiros nomes de quem está nos grupos de cada categoria (data/groups.ts). Um aluno nunca vê os das outras.
const NAMES = {
  executivo: ['Gustavo', 'Vanessa', 'Henrique', 'Rodrigo', 'Gabriel', 'Sérgio', 'Mônica', 'Cláudio', 'Jonas', 'Eliane', 'Nelson'],
  vip: ['Juliana', 'Carolina', 'Patrícia', 'Leonardo', 'Aline', 'Marcos', 'Thiago', 'Camila', 'Larissa', 'Isabela', 'Mariana', 'André', 'Beatriz', 'Tatiane', 'Simone', 'Natália', 'Priscila', 'Fábio', 'Elisa'],
  diamond: ['Bruno', 'Diego', 'Fernanda', 'Renata', 'Eduardo', 'Ricardo', 'Felipe', 'Lucas', 'Otávio'],
};
const othersThan = (tier) => Object.entries(NAMES).filter(([k]) => k !== tier).flatMap(([, v]) => v);
const namesRx = (list) => new RegExp(`\\b(${list.join('|')})\\b`);

async function setTier(tier) {
  await setPanel('Ingresso', { executivo: 'Executivo', vip: 'VIP', diamond: 'Diamond' }[tier]);
}

async function openGo(code) {
  await panel().locator('select#go-to').selectOption(code);
  await wait(500);
}

async function groupsFlow(baseUrl) {
  prefix = 'gr';
  // ---- VIP: card, lista, código, criar, Meu grupo, WhatsApp, problema, formação encerrada, Trilha ----
  let ctx = await openPage(`${baseUrl}?auth=app&tier=vip&moment=live&day=1&perm=granted`);
  await expectText('Forme seu grupo de 3');
  await expectText('Formação aberta até 10h45. Você pode entrar no intervalo.');
  await expectText('Conexões'); // a Home segue igual
  await shot('gr-01-home-card-sessao-ao-vivo');
  await setPanel('Momento do evento', 'Intervalo');
  await expectText('Fecha às 10h45');
  await shot('gr-02-home-card-intervalo');

  await tap('Formar meu grupo');
  await frame().getByRole('heading', { name: 'Grupos com vaga' }).waitFor({ timeout: 6000 });
  await expectText('Buscando grupos com vaga');
  await frame().screenshot({ path: join(OUT, 'gr-03-lista-carregando.png') });
  shots += 1;
  await frame().getByRole('article').first().waitFor({ timeout: 6000 });
  // SEC-018: só primeiro nome, setor e vagas. Nada de empresa, sobrenome, fila nem foto. Nunca outra categoria.
  const list = (await ov().innerText()).replace(/\s+/g, ' ');
  if (!/Grupo 4 · 1 vaga/.test(list) || !/Thiago, Camila/.test(list)) throw new Error('Lista de grupos VIP sem o Grupo 4 (Thiago, Camila)');
  if (!/Setor VIP/.test(list)) throw new Error('Lista sem o setor');
  if (/Brandão|Torres RH|Brandão Logística|fila \d|\bfila\b/i.test(list)) throw new Error('A lista mostra empresa, sobrenome ou fila (SEC-018)');
  if (namesRx(othersThan('vip')).test(list)) throw new Error(`Grupo de outra categoria na lista VIP: ${list.match(namesRx(othersThan('vip')))[0]}`);
  if (/Fábio|Elisa/.test(list)) throw new Error('Grupo "Só por código" apareceu na lista');
  await expectText('Aparecem o primeiro nome e o setor de quem já está no grupo. Empresa e foto, só depois de entrar.');
  await shot('gr-03-lista-grupos-com-vaga');

  // GR04: código inexistente e código de outra categoria dão a MESMA mensagem (SEC-021)
  await tap('Entrar com código ou QR');
  await frame().getByLabel('Código do grupo').fill('XXXX');
  await expectText('Código não encontrado');
  const notFound1 = (await frame().getByRole('status').filter({ hasText: 'Código não encontrado' }).first().innerText()).trim();
  await shot('gr-04-codigo-nao-encontrado');
  await frame().getByLabel('Código do grupo').fill('');
  await frame().getByLabel('Código do grupo').fill('MKRB'); // código de um grupo Executivo
  await expectText('Código não encontrado');
  const notFound2 = (await frame().getByRole('status').filter({ hasText: 'Código não encontrado' }).first().innerText()).trim();
  if (notFound1 !== notFound2) throw new Error('Código de outra categoria revelou que o grupo existe (SEC-021)');
  await tap('Voltar');

  // GR03: criar grupo, aviso de exposição, "Só por código"
  await tap('Criar grupo');
  await frame().getByRole('heading', { name: 'Seu grupo foi criado' }).waitFor({ timeout: 6000 });
  await expectText('Criando seu grupo');
  await expectText('Peça para quem está ao lado entrar com este código ou ler o QR.');
  await expectText('Seu grupo aparece para alunos com ingresso VIP desta edição que procuram grupo, com seu primeiro nome e setor, até completar.');
  await shot('gr-05-criar-grupo');
  const codeLabel = await frame().locator('p[aria-label*=","]').first().getAttribute('aria-label');
  if (!/^[BCDFGHJKMNPRSTVWXZ], [BCDFGHJKMNPRSTVWXZ], [BCDFGHJKMNPRSTVWXZ], [BCDFGHJKMNPRSTVWXZ]$/.test(codeLabel ?? '')) throw new Error(`Código fora do alfabeto sem ambiguidade: ${codeLabel}`);
  const sw = frame().getByRole('switch', { name: /Mostrar meu grupo na lista/ });
  if ((await sw.getAttribute('aria-checked')) !== 'true') throw new Error('"Mostrar meu grupo na lista" deveria nascer ligado (DEC-004)');
  await sw.click();
  await expectText('Só por código (fora da lista)');
  await shot('gr-06-criar-so-por-codigo');
  await sw.click();
  await panel().getByRole('button', { name: /Alguém entrou no meu grupo/ }).click();
  await expectText('entrou no seu grupo');
  await shot('gr-07-alguem-entrou-na-tela-do-codigo');
  await tap('Pronto');

  // GR06 Meu grupo: WhatsApp desligado por padrão, sem número na tela, confirmação ao ligar (SEC-020)
  await frame().getByRole('heading', { name: 'Meu grupo' }).waitFor({ timeout: 6000 });
  await expectText('2 de 3 · falta 1 pessoa');
  await expectText('Algum problema com o grupo? Pedir troca ou denunciar. A equipe resolve com discrição.');
  const wa = frame().getByRole('switch', { name: /Compartilhar meu WhatsApp com o grupo/ });
  if ((await wa.getAttribute('aria-checked')) !== 'false') throw new Error('WhatsApp no grupo deveria nascer desligado');
  await expectNoText(/Chamar no WhatsApp/, 'Meu grupo com a chave desligada', ov());
  await expectText('Aparece quando o grupo completar, só para quem também compartilhar. Quem salvar seu número fica com ele, mesmo se você desligar depois.');
  await shot('gr-08-meu-grupo-2-de-3');
  await wa.click();
  await expectText('Compartilhar seu WhatsApp?');
  await shot('gr-09-whatsapp-confirmacao');
  await tapDialog('Compartilhar');
  await expectText('Os números aparecem quando o grupo completar ou a formação fechar.'); // 2/3: nenhum número
  await expectNoText(/Chamar no WhatsApp/, 'Meu grupo 2 de 3', ov());
  await panel().getByRole('button', { name: /Alguém entrou no meu grupo/ }).click();
  await expectText('Grupo completo');
  await frame().getByRole('button', { name: 'Chamar no WhatsApp' }).first().waitFor({ state: 'visible', timeout: 6000 });
  await expectNoText(/\(\d{2}\) ?9?\d{4}-\d{4}/, 'Meu grupo completo (o número de ninguém é impresso)', ov());
  if (namesRx(othersThan('vip')).test(await ov().innerText())) throw new Error('Meu grupo VIP mostra nome de outra categoria');
  await shot('gr-10-meu-grupo-completo');
  await tap('Pedir troca ou denunciar');
  await expectText('Pedir troca de grupo');
  await expectText('Denunciar');
  await shot('gr-11-problema-com-o-grupo');
  await tapDialog(/^Pedir troca de grupo/);
  await tapDialog('Pedir troca');
  await expectText('Pedido enviado. A equipe resolve com discrição.');
  await tapDialog('Fechar');
  await frame().getByRole('button', { name: 'Sair do grupo' }).click();
  await expectText('Sua vaga volta para a lista. Seu WhatsApp deixa de aparecer para o grupo.');
  await shot('gr-12-sair-do-grupo');
  await tapDialog('Ficar no grupo');

  // Formação encerrada: sem "Sair", com o caminho do estande
  await toggle('Formação encerrada');
  await expectText('A formação terminou. Para trocar de grupo, fale com o time no estande.');
  await expectNoText(/Sair do grupo/, 'Meu grupo com a formação encerrada', ov());
  await shot('gr-13-meu-grupo-formacao-encerrada');
  await tap('Voltar');

  // Trilha mostra o bloco e os nomes do grupo; Home mostra "Meu grupo"; Eu tem a linha
  await tab('Trilha');
  await expectText('Formação dos grupos');
  await expectText(/Com .+/);
  await frame().getByRole('region', { name: /^Dinâmica: Formação dos grupos/ }).scrollIntoViewIfNeeded();
  await shot('gr-14-trilha-bloco-formacao-dos-grupos');
  await frame().getByRole('button', { name: /^Dinâmica: Dinâmica em trios/ }).scrollIntoViewIfNeeded();
  await shot('gr-14b-trilha-dinamica-em-trio-com-nomes');
  await tab('Agora');
  await expectText(/Grupo \d+ · completo/);
  await shot('gr-15-home-meu-grupo');
  await tab('Eu');
  await expectText('Meu grupo');
  await ctx.close();

  // ---- Corrida, "Me coloque", sem vaga, vazia, sem internet, erro ----
  ctx = await openPage(`${baseUrl}?auth=app&tier=vip&moment=break&day=1&perm=granted`);
  await tap('Formar meu grupo');
  await frame().getByRole('article').first().waitFor({ timeout: 6000 });
  await panel().getByRole('button', { name: /Alguém entra antes de mim/ }).click();
  await frame().getByRole('button', { name: 'Entrar no Grupo 4' }).click();
  await expectText('O Grupo 4 acabou de completar. Veja outros grupos ou peça para o app te encaixar.');
  await shot('gr-16-grupo-cheio-ao-tentar-entrar');
  const rows = await frame().getByRole('button', { name: 'Entrar no Grupo 4' }).count();
  if (rows !== 0) throw new Error('A linha do grupo cheio deveria sair da lista');
  await wait(4500);
  await tap('Me coloque em um grupo');
  await expectText(/Encaixamos você no Grupo \d+\. Setor VIP\./);
  await expectText('Escolhido pelo app');
  await shot('gr-17-me-coloque-encaixado');
  await openGo('GR05n');
  await expectText('Ainda não há vaga. Criamos o Grupo');
  await expectText('Quem pedir para ser encaixado entra nele.');
  await shot('gr-18-me-coloque-sem-vaga');
  await tapDialog('Ver meu grupo');
  await openGo('GR02v');
  await expectText('Nenhum grupo com vaga agora');
  await expectText('Crie um ou peça para o app te encaixar.');
  await shot('gr-19-lista-vazia');
  await toggle('Sem internet');
  await expectText('Sem internet. A lista de grupos precisa de conexão.');
  if (!(await frame().getByRole('button', { name: 'Criar grupo' }).isDisabled())) throw new Error('"Criar grupo" deveria estar desabilitado sem internet');
  await shot('gr-20-lista-sem-internet');
  await toggle('Sem internet');
  await toggle('Simular erro de rede');
  await openGo('GR02');
  await expectText('Não conseguimos carregar os grupos. Tente de novo.');
  await shot('gr-21-lista-erro');
  await tap('Tentar de novo');
  await expectText('Não conseguimos carregar os grupos. Tente de novo.'); // o erro persiste enquanto a rede falha
  await toggle('Simular erro de rede');
  await expectText('Nenhum grupo com vaga agora'); // GR02v tirou as vagas desta demonstração; o erro saiu
  await ctx.close();

  // ---- Código de grupo "Só por código" entra; só aparece com o código ----
  ctx = await openPage(`${baseUrl}?auth=app&tier=vip&moment=break&day=1&perm=granted&go=GR04`);
  await frame().getByLabel('Código do grupo').fill('ZHGV');
  await frame().getByRole('heading', { name: 'Meu grupo' }).waitFor({ timeout: 6000 });
  await expectText('Fábio Monteiro');
  await expectText('Você entrou no Grupo 12');
  await shot('gr-22-entrou-por-codigo-so-por-codigo');
  await ctx.close();

  // ---- Formação encerrada e encaixe do time ----
  ctx = await openPage(`${baseUrl}?auth=app&tier=vip&moment=lunch&day=1&perm=granted&groups=none`);
  await expectText('A formação terminou');
  await shot('gr-23-home-formacao-encerrada');
  await panel().getByRole('button', { name: /Encaixar quem ficou sem grupo/ }).click();
  await expectText('Encaixado pelo time');
  await frame().getByRole('button', { name: /^Meu grupo: Grupo/ }).click();
  await expectText(/O time colocou você no Grupo \d+\./);
  await shot('gr-24-encaixado-pelo-time');
  await ctx.close();

  // ---- Executivo e Diamond: só a própria categoria; o leitor de QR de grupo não cai no C00 ----
  for (const tier of ['executivo', 'diamond']) {
    ctx = await openPage(`${baseUrl}?auth=app&tier=${tier}&moment=break&day=1&perm=granted&go=GR02`);
    await frame().getByRole('article').first().waitFor({ timeout: 6000 });
    const t = (await ov().innerText()).replace(/\s+/g, ' ');
    if (namesRx(othersThan(tier)).test(t)) throw new Error(`Grupo de outra categoria na lista ${tier}: ${t.match(namesRx(othersThan(tier)))[0]}`);
    if (!namesRx(NAMES[tier]).test(t)) throw new Error(`Lista ${tier} sem nenhum aluno da própria categoria`);
    if (/cadeado|Conhecer|já estão se conectando/i.test(t)) throw new Error(`Grupos ${tier} não pode ter cadeado nem convite de Conexões`);
    await shot(`gr-25-lista-${tier}`);
    if (tier === 'executivo') {
      await tap('Entrar com código ou QR');
      await frame().getByLabel('Código do grupo').fill('KTVR'); // código de um grupo VIP
      await expectText('Código não encontrado');
      await tap('Ler QR do grupo');
      await expectText('Usamos a câmera só para ler o QR do grupo.');
      await shot('gr-26-exec-camera-explicacao');
      await tap('Continuar');
      await frame().getByRole('button', { name: 'Não permitir', exact: true }).click();
      await expectText('A câmera está desligada para o Protagon. Digite o código ou ative a câmera nos Ajustes.');
      await shot('gr-27-exec-camera-negada');
      await tap('Ler QR do grupo');
      await tap('Continuar');
      await frame().getByRole('button', { name: 'Permitir', exact: true }).click();
      await expectText('Aponte para o QR do grupo');
      await expectNoText(/já estão se conectando|Quero me conectar/, 'leitor de QR de grupo do Executivo (não é o C10)', ov());
      await shot('gr-28-exec-leitor-qr-de-grupo');
      await tap('Simular leitura do QR de um grupo');
      await frame().getByRole('heading', { name: 'Meu grupo' }).waitFor({ timeout: 6000 });
      await expectNoText(/Conexões/, 'Meu grupo do Executivo', ov());
      await shot('gr-29-exec-entrou-pelo-qr');
    }
    await ctx.close();
  }
}

async function offersFlow(baseUrl, dist) {
  prefix = 'of';
  // ---- Principal 1: o aluno VIP no Dia 2 ----
  let ctx = await openPage(`${baseUrl}?auth=app&tier=vip&moment=live&day=2&perm=granted&connections=1&profile=full`);
  const sweep = async (where) => {
    const m = (await pageText()).match(OFFER_DATA) ?? (await frame().innerText()).match(OFFER_UI);
    if (m) throw new Error(`A oferta apareceu antes da liberação (${where}): "${m[0]}"`);
  };
  await sweep('Home');
  await shot('of-00-home-antes-da-liberacao');
  await tab('Trilha');
  await expectText('O legado do líder'); // o bloco do pitch mostra o título normal
  await sweep('Trilha');
  await shot('of-00b-trilha-bloco-do-pitch-sem-oferta');
  await frame().getByRole('button', { name: /^Palestra: O legado do líder/ }).click();
  await wait(500);
  await sweep('detalhe da sessão do pitch');
  await tap('Voltar');
  await tab('Materiais');
  await sweep('Materiais');
  await tab('Conexões');
  await tap(/^Explorar/, { role: 'tab' });
  await frame().getByLabel('Buscar por nome, empresa, nicho ou interesse').fill('Olimpo');
  await wait(500);
  await expectText('Ninguém com esses filtros');
  await sweep('busca (Explorar)');
  await tab('Eu');
  await sweep('Eu (sem "Ofertas do evento")');
  await frame().getByRole('button', { name: /^Notificações/ }).first().click();
  await wait(400);
  await sweep('Notificações');
  await tap('Voltar');
  await panel().getByRole('button', { name: /Disparar notificação/ }).click();
  await wait(400);
  await sweep('notificação disparada pelo painel');
  await wait(5200); // o push simulado some sozinho antes das capturas
  if (requests.some((u) => /offers/i.test(u))) throw new Error('O módulo de dados da oferta foi baixado antes da liberação');
  if (dist) {
    const files = readdirSync(join(dist, 'assets')).filter((f) => f.endsWith('.js'));
    const holders = files.filter((f) => /Olimpo|Imersão Liderança 360/.test(readFileSync(join(dist, 'assets', f), 'utf8')));
    if (holders.length !== 1 || !/^offers-/.test(holders[0])) throw new Error(`Os dados da oferta deveriam estar só no chunk offers-*.js: ${holders.join(', ') || 'nenhum'}`);
  }

  await tab('Agora');
  const bell = () => frame().getByRole('button', { name: /^Notificações/ }).first().getAttribute('aria-label');
  const bellBefore = await bell();
  const hapticBefore = await panel().getByText(/Última:|Nenhuma ainda/).first().innerText();
  await panel().getByRole('button', { name: 'Liberar oferta' }).click();
  await expectText('Oferta do palco disponível'); // toast
  await expectText('Oferta especial do palco');
  await expectText('Olimpo');
  await shot('of-01-home-card-e-toast');
  if (!requests.some((u) => /offers/i.test(u)) && !dist) console.log('(build único: os dados da oferta vêm embutidos)');
  if ((await bell()) !== bellBefore) throw new Error('A oferta somou no badge do sino (deveria entrar como lida)');
  const hapticAfter = await panel().getByText(/Última:|Nenhuma ainda/).first().innerText();
  if (hapticAfter !== hapticBefore) throw new Error(`A liberação da oferta vibrou: ${hapticAfter}`);
  await expectNoText(/restam|últimas vagas|só hoje|corra|imperdível/i, 'Home com a oferta');

  await tap('Ver oferta');
  await frame().getByRole('heading', { name: 'Oferta do palco' }).waitFor({ timeout: 6000 });
  await expectText('Para quem é');
  await expectText('Condição do evento (VIP)');
  await expectText('12x de R$ 1.490,00');
  await expectText('Total parcelado: R$ 17.880,00');
  await expectText('À vista no PIX: R$ 15.990,00');
  await expectText('Bônus da condição do evento');
  await expectText('Condição válida até 19h10 de 14/03');
  await expectText('Não pague por links recebidos em grupos.');
  await expectText('Você vai sair do app para pagar na Hotmart.');
  await expectNoText(/R\$ 1\.290|R\$ 1\.790|restam|últimas vagas|só hoje|corra|imperdível/i, 'tela da oferta (preço só da categoria, sem escassez)', ov());
  await shot('of-02-tela-da-oferta');
  await frame().locator('.z-overlay .overflow-y-auto').first().evaluate((el) => { el.scrollTop = el.scrollHeight; });
  await shot('of-03-tela-da-oferta-rolada');

  await tap('Falar com um consultor');
  await expectText('Vamos enviar ao time comercial do Grupo Virtus');
  await expectText('Só para falar com você sobre o Olimpo. Seu perfil e suas conexões não são enviados.');
  await expectNoText(/\*\*\*\.\*\*\*|\d{3}\.\d{3}\.\d{3}-\d{2}|CPF/, 'formulário de interesse (nunca CPF)');
  await shot('of-04-falar-com-consultor');
  await tapDialog('Quero falar com um consultor');
  await expectText('Interesse enviado. O time comercial vai falar com você.');
  await expectText('Cancelar pedido');
  await shot('of-05-interesse-enviado');

  await tap('Assinar o Olimpo');
  await expectText('Simulação: nenhum pagamento é feito');
  await shot('of-06-checkout-simulado');
  await tap('Simular pagamento concluído');
  await expectText('Estamos confirmando sua compra.');
  await expectNoText(/Compra confirmada/, 'logo ao voltar do checkout (o app não afirma a compra antes da confirmação)', ov());
  await shot('of-07-confirmando-compra');
  await expectText('Compra confirmada');
  await shot('of-08-compra-confirmada');
  await tap('Voltar para o início');
  await expectText('Olimpo · compra confirmada');
  await shot('of-09-home-compra-confirmada');
  await ctx.close();

  // ---- Principal 2: "Agora não", "Ofertas do evento", condição encerrada, sem internet e erro ----
  ctx = await openPage(`${baseUrl}?auth=app&tier=vip&moment=live&day=2&perm=granted`);
  await panel().getByRole('button', { name: 'Liberar oferta' }).click();
  await expectText('Oferta especial do palco');
  await tap('Ver oferta');
  await frame().getByRole('heading', { name: 'Oferta do palco' }).waitFor({ timeout: 6000 });
  await expectText('Condição do evento (VIP)');
  await toggle('Sem internet');
  await expectText('Para contratar agora, mostre este QR no estande.');
  await expectText('Estande Comercial · Foyer, ao lado do credenciamento');
  if (!(await frame().getByRole('button', { name: 'Assinar o Olimpo' }).isDisabled())) throw new Error('"Assinar" deveria estar desabilitado sem internet');
  await shot('of-10-sem-internet-qr-do-estande');
  await toggle('Sem internet');
  await toggle('Simular erro de rede');
  await expectText('Não conseguimos abrir a oferta. Tente de novo.');
  await shot('of-11-erro');
  await toggle('Simular erro de rede');
  await expectText('Condição do evento (VIP)');
  await tap('Agora não');
  await expectText('Olimpo · até 19h10 de 14/03'); // tile discreto, sem destaque
  await expectNoText(/Oferta especial do palco/, 'Home depois de "Agora não" (o card de destaque não volta)');
  await shot('of-12-home-agora-nao');
  await tab('Eu');
  await tap(/^Ofertas do evento/);
  await expectText('Ativa');
  await shot('of-13-ofertas-do-evento');
  await tap('Voltar');
  await panel().getByRole('button', { name: 'Encerrar condição' }).click();
  await tab('Agora');
  await expectNoText(/Olimpo/, 'Home depois de encerrar a condição');
  await tab('Eu');
  await tap(/^Ofertas do evento/);
  await expectText('Encerrada');
  await expectText('Nenhuma oferta ativa agora. As anteriores ficam aqui.');
  await tap(/^Olimpo, Encerrada/);
  await expectText('Condição encerrada');
  await expectText('A condição do evento terminou às');
  await expectNoText(/Assinar o Olimpo|12x de|R\$ 1\.490/, 'condição encerrada (sem preço nem Assinar)', ov());
  await frame().getByRole('button', { name: 'Falar com um consultor' }).waitFor({ timeout: 6000 });
  await shot('of-14-condicao-encerrada');
  await ctx.close();

  // ---- Executivo: a oferta que o ingresso não tem nunca aparece; sem cadeado ----
  ctx = await openPage(`${baseUrl}?auth=app&tier=executivo&moment=live&day=2&perm=granted`);
  const locks = () => frame().locator('main svg.lucide-lock').count();
  const locksBefore = await locks();
  await panel().getByRole('button', { name: 'Liberar oferta' }).click();
  await wait(1200);
  await expectNoText(/Olimpo|Oferta do palco|Oferta especial/, 'Home do Executivo depois da liberação');
  await tab('Eu');
  await expectNoText(/Ofertas do evento/, 'Eu do Executivo');
  await tab('Agora');
  if ((await locks()) !== locksBefore) throw new Error('A oferta criou um cadeado para o Executivo');
  await shot('of-15-executivo-oferta-sem-acesso-nao-aparece');
  await openGo('OF02x');
  await expectText('Esta oferta não está disponível para o seu ingresso.');
  await expectText('Se quiser entender suas opções, fale com um consultor.');
  await expectNoText(/R\$|Olimpo|Bônus|Condição válida|cadeado/, 'oferta não disponível (sem preço, sem nome)', ov());
  if ((await frame().locator('.z-overlay svg.lucide-lock').count()) > 0) throw new Error('Cadeado na oferta indisponível');
  await shot('of-16-nao-disponivel-para-o-ingresso');
  await tap('Falar com um consultor');
  await expectText('O time comercial vai falar sobre as opções para o seu ingresso.');
  await shot('of-17-consultor-sem-oferta');
  await tapDialog('Fechar');
  await tap('Voltar');
  await setPanel('Oferta', 'Dia 3 · 18h15');
  await panel().getByRole('button', { name: 'Liberar oferta' }).click();
  await expectText('Imersão Liderança 360');
  await tap('Ver oferta');
  await expectText('6x de R$ 990,00');
  await expectText('Reservar minha vaga');
  await shot('of-18-executivo-lideranca-360');
  await ctx.close();

  // ---- Diamond: preço próprio ----
  ctx = await openPage(`${baseUrl}?auth=app&tier=diamond&moment=live&day=2&perm=granted`);
  await panel().getByRole('button', { name: 'Liberar oferta' }).click();
  await expectText('Oferta especial do palco');
  await tap('Ver oferta');
  await expectText('Condição do evento (Diamond)');
  await expectText('12x de R$ 1.290,00');
  await expectNoText(/R\$ 1\.490/, 'preço do Diamond');
  await shot('of-19-diamond-preco-proprio');
  await ctx.close();

  // ---- Prazo real: a condição vira "encerrada" ao passar do fim do Dia 3 ----
  ctx = await openPage(`${baseUrl}?auth=app&tier=vip&moment=live&day=2&perm=granted`);
  await panel().getByRole('button', { name: 'Liberar oferta' }).click();
  await expectText('Oferta especial do palco');
  await setPanel('Dia do evento', 'Dia 3');
  await setPanel('Momento do evento', 'Fim do dia');
  await tab('Eu');
  await tap(/^Ofertas do evento/);
  await expectText('Encerrada');
  await shot('of-20-prazo-real-encerrou-no-fim-do-dia-3');
  await ctx.close();
}

async function gaiaFlow(baseUrl) {
  prefix = 'ga';
  let ctx = await openPage(`${baseUrl}?auth=app&tier=vip&moment=break&day=2&perm=granted`);
  await tab('Trilha');
  await expectText('Atividade: Gaia One');
  await expectText('9h20 às 9h30');
  await shot('ga-00-trilha-bloco-do-dia-2');
  await tab('Agora');
  await expectNoText(/Atividade Gaia One|Ative seu teste/, 'Home antes de iniciar a atividade');
  await panel().getByRole('button', { name: 'Iniciar atividade' }).click();
  await expectText('Ative seu teste em 4 passos');
  await expectText('Leva cerca de 3 minutos');
  await shot('ga-01-home-card');
  await tap('Começar');
  await frame().getByRole('heading', { name: 'Gaia One', exact: true }).waitFor({ timeout: 6000 });
  await expectText('Ative seu teste do Gaia One');
  await expectText('Protagon-Alunos');
  await expectText('Copiar senha');
  await expectText('0 de 4 passos feitos');
  await expectText('[a confirmar]');
  await expectText('Abrir na App Store');
  await shot('ga-02-checklist-passo-1-iphone');
  await setPanel('Aparelho', 'Android');
  await expectText('Abrir no Google Play');
  await shot('ga-03-passo-1-android');
  await setPanel('Aparelho', 'iPhone');
  await tap('Usar outro aparelho');
  await expectText('Leia com o outro celular');
  await shot('ga-04-outro-aparelho-qr');
  await tapDialog('Fechar');
  await frame().getByRole('checkbox', { name: 'Feito' }).first().click();
  await expectText('1 de 4 passos feitos');
  await tap('Copiar meu e-mail');
  await expectText('E-mail copiado');
  await expectText('rafael.moraes@exemplo.com.br');
  await shot('ga-05-passo-2-email-copiado');
  await frame().getByRole('checkbox', { name: 'Feito' }).first().click();
  await expectText('PROTAGON27');
  await tap('Copiar código');
  await expectText('Código copiado');
  await shot('ga-06-passo-3-codigo');
  await frame().getByRole('checkbox', { name: 'Feito' }).first().click();
  await expectText('Quando o teste estiver ativo, toque em Já ativei.');
  await shot('ga-07-passo-4');
  await tap('Preciso de ajuda');
  await expectText('Onde está a equipe');
  await tapDialog('O teste pede cartão?');
  await expectText('Não. O teste não pede cartão.');
  await shot('ga-08-ajuda');
  await tapDialog('Fechar ajuda');
  await tap('Já ativei');
  await expectText('Gaia One ativado');
  await expectText('Concluído às');
  await shot('ga-09-concluida');
  await tap('Voltar para o início');
  await expectText('Gaia One ativado');
  await shot('ga-10-home-concluido');

  // Sem internet (progresso volta para o passo 2 pelo painel)
  await setPanel('Passo do checklist', 'Passo 2');
  await toggle('Sem internet');
  await expectText('Para baixar o app você precisa de internet.');
  await tap('Continuar');
  await expectText('Conecte-se ao Wi-Fi para baixar o Gaia One.');
  await shot('ga-11-sem-internet');
  await toggle('Sem internet');

  // Erro ao abrir a loja
  await toggle('Simular erro de rede');
  await setPanel('Passo do checklist', 'Passo 1');
  await tap('Abrir na App Store');
  await expectText('Não conseguimos abrir a loja. Procure Gaia One na App Store.');
  await shot('ga-12-erro-ao-abrir-a-loja');
  await toggle('Simular erro de rede');

  // Grupo: só a contagem, sem nomes (SEC-024)
  await setPanel('Estado do aluno no grupo', 'Completo');
  await setPanel('Passo do checklist', 'Concluída');
  await expectText(/\d de 3 do seu grupo já ativaram\./);
  await expectNoText(namesRx([...NAMES.vip, ...NAMES.executivo, ...NAMES.diamond]), 'Gaia One (a contagem do grupo nunca mostra nomes)', ov());
  await shot('ga-13-grupo-so-contagem');
  await ctx.close();

  // Executivo e Diamond usam igual (sem cadeado)
  for (const tier of ['executivo', 'diamond']) {
    ctx = await openPage(`${baseUrl}?auth=app&tier=${tier}&moment=break&day=2&perm=granted&go=GA02`);
    await expectText('Ative seu teste do Gaia One');
    await expectNoText(/cadeado|Libere/i, `Gaia One ${tier}`, ov());
    await shot(`ga-14-${tier}`);
    await ctx.close();
  }

  // GA03 por atalho
  ctx = await openPage(`${baseUrl}?auth=app&tier=vip&moment=break&day=2&perm=granted&go=GA03`);
  await expectText('Perguntas frequentes');
  await tapDialog('Pedir ajuda no meu lugar');
  await expectText('Alguém vai até você');
  await shot('ga-15-pedir-ajuda-no-meu-lugar');
  await ctx.close();
}

browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let server;
let base = process.env.SMOKE_URL;
if (!base) {
  const dist = process.env.SMOKE_DIST ? resolve(process.env.SMOKE_DIST) : join(root, 'dist');
  if (!existsSync(join(dist, 'index.html'))) {
    console.error('dist/ não encontrado. Rode "npm run build" antes.');
    process.exit(2);
  }
  const s = await serve(dist);
  server = s.server;
  base = s.url;
}

let failed = null;
const only = process.env.SMOKE_ONLY ? process.env.SMOKE_ONLY.split(',') : null; // ex.: SMOKE_ONLY=groups,gaia
const run = (name) => !only || only.includes(name);
try {
  if (run('vip')) await vipDay(base);
  if (run('exec')) await executivoDay(base);
  if (run('groups')) await groupsFlow(base);
  if (run('offers')) await offersFlow(base, process.env.SMOKE_URL ? null : process.env.SMOKE_DIST ? resolve(process.env.SMOKE_DIST) : join(root, 'dist'));
  if (run('gaia')) await gaiaFlow(base);
} catch (e) {
  failed = e;
  try {
    await page?.screenshot({ path: join(OUT, 'zz-falha.png') });
  } catch {
    // ignora
  }
}
await browser.close();
server?.close();

if (failed) {
  console.error('FALHOU:', failed.message.split('\n').slice(0, 6).join('\n'));
}
if (errors.length) console.error(`Erros de console (${errors.length}):\n` + errors.slice(0, 10).join('\n'));
console.log(`${shots} capturas em ${OUT}`);
process.exit(failed || errors.length ? 1 : 0);
