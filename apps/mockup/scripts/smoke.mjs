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
import { existsSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
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

browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let server;
let base = process.env.SMOKE_URL;
if (!base) {
  const dist = join(root, 'dist');
  if (!existsSync(join(dist, 'index.html'))) {
    console.error('dist/ não encontrado. Rode "npm run build" antes.');
    process.exit(2);
  }
  const s = await serve(dist);
  server = s.server;
  base = s.url;
}

let failed = null;
try {
  await vipDay(base);
  await executivoDay(base);
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
