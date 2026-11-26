#!/usr/bin/env node
/**
 * Verificações de QA da Etapa 4 (revisão de UX e acessibilidade), independentes do smoke do dev.
 *
 * Uso (de apps/mockup, com dist/ gerado por "npm run build"):
 *   node scripts/qa.mjs            # roda todas as seções
 *   node scripts/qa.mjs a b        # só as seções pedidas (a b c d e f g h i)
 *
 * a  estados do inventário alcançáveis      f  foco e teclado nos sheets e telas
 * b  contraste WCAG AA no DOM renderizado   g  agenda, mapa e credencial a <= 2 toques
 * c  tamanhos de fonte (< 16 px)            h  brilho baixo (capturas com filtro) e extras
 * d  regras invioláveis (texto, contato,    i  notificações durante a palestra
 *    cadeado, blur)
 * e  alvos de toque (>= 44 px)
 *
 * Saída: resumo no console e JSON em QA_OUT (padrão docs/qa/capturas/etapa-4/qa-resultado.json).
 * Variáveis: QA_URL (servidor já rodando), CHROME_PATH.
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const require = createRequire(join(root, 'package.json'));
const { chromium } = require('playwright-core');

const OUT_DIR = resolve(process.env.QA_OUT ?? join(root, '../../docs/qa/capturas/etapa-4'));
mkdirSync(OUT_DIR, { recursive: true });
const CHROME = [process.env.CHROME_PATH, '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find((p) => p && existsSync(p));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png' };

function serve(dir) {
  return new Promise((ok) => {
    const server = createServer((req, res) => {
      const url = new URL(req.url ?? '/', 'http://x');
      let file = normalize(join(dir, decodeURIComponent(url.pathname)));
      if (!file.startsWith(dir) || !existsSync(file) || statSync(file).isDirectory()) file = join(dir, 'index.html');
      res.setHeader('Content-Type', MIME[extname(file)] ?? 'application/octet-stream');
      res.end(readFileSync(file));
    });
    server.listen(0, '127.0.0.1', () => ok({ server, url: `http://127.0.0.1:${server.address().port}/` }));
  });
}

const wanted = new Set(process.argv.slice(2).length ? process.argv.slice(2) : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']);
const results = { checks: [], findings: {} };
const pageErrors = [];
let browser;
let base;

/** Registra o resultado de uma verificação (ok=true passa) */
function check(section, name, ok, detail = '') {
  results.checks.push({ section, name, ok, detail });
  console.log(`${ok ? 'OK   ' : 'FALHA'} [${section}] ${name}${detail ? ' :: ' + detail : ''}`);
}
function keep(section, key, value) {
  (results.findings[section] ??= {})[key] = value;
}

async function open(query, { width = 1400, height = 1000, init } = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
  if (init) await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.on('console', (m) => m.type() === 'error' && pageErrors.push(`[console] ${query} ${m.text()}`));
  page.on('pageerror', (e) => pageErrors.push(`[pageerror] ${query} ${e.message}`));
  await page.goto(base + (query.startsWith('?') ? query : '?' + query), { waitUntil: 'networkidle' });
  await page.waitForTimeout(650);
  return { ctx, page };
}
const frameOf = (page) => page.getByRole('region', { name: /Tela do app Protagon/ });
const panelOf = (page) => page.getByRole('complementary', { name: 'Painel de demonstração' });
const text = async (page) => (await frameOf(page).innerText()).replace(/\s+/g, ' ');
const settle = (page, ms = 450) => page.waitForTimeout(ms);

/** Clica no primeiro controle visível com o nome (regex ou texto), dentro do aparelho */
async function tap(page, name, { within } = {}) {
  const scope = within ?? frameOf(page);
  const roles = ['button', 'tab', 'radio', 'switch', 'link', 'checkbox'];
  for (const role of roles) {
    const loc = scope.getByRole(role, { name }).filter({ visible: true });
    if ((await loc.count()) > 0) {
      await loc.last().click({ timeout: 4000 });
      await settle(page);
      return role;
    }
  }
  const t = scope.getByText(name).filter({ visible: true });
  if ((await t.count()) > 0) {
    await t.last().click({ timeout: 4000 });
    await settle(page);
    return 'text';
  }
  throw new Error(`controle não encontrado: ${name}`);
}

// ---------------------------------------------------------------------------
// Extratores executados dentro da página
// ---------------------------------------------------------------------------

/** Escopo visível da tela atual: sheet > bloqueio > página empilhada (+ tab bar) > aba inteira */
const SCOPE_FN = `
(() => {
  const frame = document.querySelector('[role=region][aria-label^="Tela do app"]');
  const dialog = frame.querySelector('[role=dialog]');
  if (dialog) return { frame, scopes: [dialog], kind: 'sheet' };
  const lockNode = [...frame.querySelectorAll('div')].find((d) => d.textContent && d.textContent.includes('Toque para desbloquear') && getComputedStyle(d).position === 'absolute' && d.getBoundingClientRect().height > 700);
  if (lockNode) return { frame, scopes: [lockNode], kind: 'lock' };
  const overlay = frame.querySelector('.z-overlay');
  if (overlay) {
    const nav = frame.querySelector('nav[aria-label="Navegação principal"]');
    const immersive = nav && overlay.getBoundingClientRect().bottom > nav.getBoundingClientRect().top + 20;
    return { frame, scopes: immersive || !nav ? [overlay] : [overlay, nav], kind: 'overlay' };
  }
  return { frame, scopes: [frame], kind: 'tab' };
})()`;

const COLOR_HELPERS = `
const parse = (s) => {
  if (!s) return null;
  let m = s.match(/^rgba?\\(([^)]+)\\)$/);
  if (m) { const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
  m = s.match(/^color\\(srgb ([^)]+)\\)$/);
  if (m) { const p = m[1].split(/[ \\/]+/).filter(Boolean).map(Number); return [p[0]*255, p[1]*255, p[2]*255, p.length > 3 ? p[3] : 1]; }
  return null;
};
const over = (fg, bg, a) => { const al = fg[3] * a; return [fg[0]*al + bg[0]*(1-al), fg[1]*al + bg[1]*(1-al), fg[2]*al + bg[2]*(1-al), 1]; };
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); }; return 0.2126*f(c[0]) + 0.7152*f(c[1]) + 0.0722*f(c[2]); };
const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05); };
const stops = (img) => { const out = []; const re = /rgba?\\([^)]*\\)/g; let m; while ((m = re.exec(img))) out.push(parse(m[0])); return out; };
const opAcc = (el) => { let o = 1; for (let n = el; n && n.nodeType === 1; n = n.parentElement) o *= parseFloat(getComputedStyle(n).opacity); return o; };
const bgCandidates = (el, skipSelf) => {
  const chain = []; for (let n = el; n && n.nodeType === 1; n = n.parentElement) chain.push(n); chain.reverse();
  let cands = [[2, 1, 17, 1]];
  for (const n of chain) {
    if (skipSelf && n === el) continue;
    const cs = getComputedStyle(n); const o = opAcc(n);
    const layers = [];
    const c = parse(cs.backgroundColor); if (c && c[3] > 0) layers.push(c);
    if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) { const st = stops(cs.backgroundImage); if (st.length) { layers.length = 0; st.forEach((s) => layers.push(s)); } }
    if (!layers.length) continue;
    const next = []; for (const base of cands) for (const l of layers) next.push(over(l, base, o));
    const seen = new Set(); cands = next.filter((x) => { const k = x.map(Math.round).join(','); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 8);
  }
  return cands;
};
`;

/** Contraste + fonte de todos os textos visíveis no escopo */
const TEXT_SCAN = `
(() => {
  const { frame, scopes, kind } = ${SCOPE_FN};
  ${COLOR_HELPERS}
  const seen = new Set(); const out = [];
  const inScope = (el) => scopes.some((s) => s === el || s.contains(el));
  const all = []; scopes.forEach((s) => { all.push(s); s.querySelectorAll('*').forEach((e) => all.push(e)); });
  for (const el of all) {
    if (!inScope(el)) continue;
    if (['SCRIPT','STYLE','svg','path'].includes(el.tagName)) continue;
    const direct = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    const isField = ['INPUT','TEXTAREA','SELECT'].includes(el.tagName) && (el.value || '').length > 0;
    if (!direct && !isField) continue;
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width < 1 || r.height < 1) continue;
    if (cs.clip && cs.clip !== 'auto' && r.width <= 1) continue;
    const o = opAcc(el); if (o < 0.05) continue;
    const fs = parseFloat(cs.fontSize); const fw = parseInt(cs.fontWeight, 10);
    const clipText = cs.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || cs.color === 'rgba(0, 0, 0, 0)';
    let fgs;
    if (clipText && cs.backgroundImage.includes('gradient')) fgs = stops(cs.backgroundImage); else { const c = parse(cs.color); fgs = c ? [c] : []; }
    if (!fgs.length) continue;
    const bgs = bgCandidates(el, clipText);
    let worst = Infinity, worstFg = null, worstBg = null;
    for (const f of fgs) for (const b of bgs) { const eff = over(f, b, o); const rr = ratio(eff, b); if (rr < worst) { worst = rr; worstFg = eff; worstBg = b; } }
    const large = fs >= 24 || (fs >= 18.66 && fw >= 700);
    const need = large ? 3 : 4.5;
    const ctl = el.closest('button,a,[role=tab],[role=radio],[role=switch],[role=checkbox],select,input,summary');
    const disabled = !!(ctl && (ctl.disabled || ctl.getAttribute('aria-disabled') === 'true'));
    const label = (direct || el.value || '').slice(0, 60);
    const key = label + '|' + cs.color + '|' + fs + '|' + (ctl ? 'c' : 's');
    if (seen.has(key)) continue; seen.add(key);
    out.push({ t: label, fs, fw, ratio: Math.round(worst * 100) / 100, need, large, ok: worst >= need,
      fg: worstFg.map(Math.round).join(','), bg: worstBg.map(Math.round).join(','), op: Math.round(o*100)/100,
      ctl: ctl ? (ctl.getAttribute('role') || ctl.tagName.toLowerCase()) : '', disabled, len: label.length,
      h: Math.round(r.height), clip: clipText, ctlLen: ctl ? (ctl.innerText || '').trim().length : 0, island: !!el.closest('[aria-label^="Atividade ao vivo"]') });
  }
  return { kind, items: out, frameW: Math.round(frame.getBoundingClientRect().width) };
})()`;

/** Alvos de toque no escopo */
const TARGET_SCAN = `
(() => {
  const { frame, scopes, kind } = ${SCOPE_FN};
  const sel = 'button, a[href], [role=button], [role=tab], [role=radio], [role=switch], [role=checkbox], input:not([type=hidden]), select, textarea, summary';
  const out = []; const seen = new Set();
  scopes.forEach((s) => s.querySelectorAll(sel).forEach((el) => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    if (cs.display === 'none' || cs.visibility === 'hidden' || r.width < 1 || r.height < 1) return;
    let op = 1; for (let n = el; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity); if (op < 0.05) return;
    const name = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('placeholder') || el.id || '').replace(/\\s+/g, ' ').trim().slice(0, 50);
    const key = name + '|' + Math.round(r.width) + 'x' + Math.round(r.height) + '|' + el.tagName;
    if (seen.has(key)) return; seen.add(key);
    out.push({ name, w: Math.round(r.width * 10) / 10, h: Math.round(r.height * 10) / 10, tag: el.tagName.toLowerCase(), role: el.getAttribute('role') || '', top: Math.round(r.top - frame.getBoundingClientRect().top) });
  }));
  return { kind, items: out };
})()`;

// ---------------------------------------------------------------------------
// Catálogo de telas e estados para as varreduras (b, c, d, e)
// ---------------------------------------------------------------------------
const A = 'auth=app';
const SCREENS = [
  // [id, query, passos opcionais (page) => Promise]
  ['E01', 'go=E01'],
  ['E01-erro', 'go=E01', async (p) => { await frameOf(p).getByLabel('E-mail ou CPF').fill('000.000.000-00'); await tap(p, 'Receber código'); await settle(p, 1500); }],
  ['E02', 'go=E02'],
  ['E02-invalido', 'go=E02', async (p) => { await frameOf(p).getByLabel('Código de 6 dígitos').focus(); await p.keyboard.type('000000', { delay: 40 }); await settle(p, 1500); }],
  ['E03-exec-1', 'go=E03&tier=executivo'],
  ['E03-vip-1', 'go=E03&tier=vip'],
  ['E03-vip-2', 'go=E03&tier=vip', async (p) => { await tap(p, /^Continuar/); }],
  ['E03-vip-3', 'go=E03&tier=vip', async (p) => { await tap(p, /^Continuar/); await tap(p, /^Continuar/); }],
  ['E04', 'go=E04'],
  ['E04n', 'go=E04n'],
  ['A01-before-vip', `${A}&moment=before`],
  ['A01-before-exec', `${A}&moment=before&tier=executivo`],
  ['A01-live-vip', `${A}&moment=live`],
  ['A01-live-exec', `${A}&moment=live&tier=executivo`],
  ['A01-live-vip-ativo', `${A}&moment=live&connections=1&profile=full`],
  ['A01-break-vip', `${A}&moment=break`],
  ['A01-break-five', `${A}&moment=break&phase=five`],
  ['A01-lunch', `${A}&moment=lunch`],
  ['A01-lunch-now', `${A}&moment=lunch&phase=now`],
  ['A01-endOfDay', `${A}&moment=endOfDay`],
  ['A01-after-vip', `${A}&moment=after`],
  ['A01-after-exec', `${A}&moment=after&tier=executivo`],
  ['A01-offline', `${A}&offline=1`],
  ['A02-break', 'go=A02&moment=break'],
  ['A02-five', 'go=A02&moment=break&phase=five'],
  ['A02-now', 'go=A02&moment=lunch&phase=now'],
  ['A03', 'go=A03'],
  ['A04', 'go=A04'],
  ['A04-exec', 'go=A04&tier=executivo'],
  ['A04c', 'go=A04c'],
  ['A05', 'go=A05'],
  ['G01', 'go=G01'],
  ['G01-offline', 'go=G01&offline=1'],
  ['G02', `${A}&overlay=notifications`],
  ['G02-vazia', 'go=G02'],
  ['G03', 'go=G03'],
  ['G04-lunch', 'go=G04&moment=lunch'],
  ['G04-live', `${A}&moment=live&locked=1`],
  ['T01-live', `${A}&tab=trilha&perm=granted`],
  ['T01-day2', `${A}&tab=trilha&perm=granted&moment=live&day=2`],
  ['T01-day3-end', `${A}&tab=trilha&perm=granted&moment=after`],
  ['T02-live', 'go=T02'],
  ['T02-break', 'go=T02&moment=break'],
  ['C00-exec', 'go=C00'],
  ['C00-convite', 'go=C00', async (p) => { await tap(p, /Quero me conectar/); }],
  ['C01', 'go=C01'],
  ['C02', 'go=C02&moment=break'],
  ['C02-limite', 'go=C02&moment=break&sent=15'],
  ['C02-before', 'go=C02&moment=before'],
  ['C02-vazio-perfil', `${A}&tab=conexoes&connections=0`],
  ['C03-conectado', 'go=C03'],
  ['C03-sugestao', 'go=C02&moment=break', async (p) => { await tap(p, /Ver perfil/); }],
  ['C04', 'go=C04&moment=break'],
  ['C04-limite', 'go=C04&moment=break&sent=15'],
  ['C05', 'go=C05&moment=break'],
  ['C06', 'go=C06&moment=break'],
  ['C07', 'go=C07&moment=break'],
  ['C08', 'go=C08&moment=break'],
  ['C09', 'go=C09&moment=break'],
  ['C09-after', 'go=C09&moment=after'],
  ['C10', 'go=C10'],
  ['C11', 'go=C11'],
  ['C01b', `${A}&connections=1&overlay=profile`],
  ['M01-live', 'go=M01'],
  ['M01-endOfDay', 'go=M01&moment=endOfDay'],
  ['M02', 'go=M02'],
  ['U01-vip', 'go=U01&connections=1'],
  ['U01-exec', 'go=U01&tier=executivo'],
  ['U02', 'go=U02'],
  ['U03', 'go=U03'],
  ['U04', 'go=U04&moment=endOfDay'],
  ['U05', 'go=U05'],
  ['checkout', `${A}&tier=executivo&overlay=checkout`],
];

async function eachScreen(fn, only) {
  for (const [id, query, steps] of SCREENS) {
    if (only && !only(id)) continue;
    const { ctx, page } = await open(query);
    try {
      if (steps) await steps(page);
      await fn(id, page);
    } catch (e) {
      check('infra', `tela ${id}`, false, e.message.split('\n')[0]);
    } finally {
      await ctx.close();
    }
  }
}

// ---------------------------------------------------------------------------
// (a) Estados do inventário alcançáveis
// ---------------------------------------------------------------------------
async function sectionA() {
  const P = [];
  const probe = (code, state, query, expects, steps) => P.push({ code, state, query, expects: [].concat(expects), steps });

  probe('E01', 'vazio', 'go=E01', /E-mail ou CPF/);
  probe('E01', 'ingresso não encontrado', 'go=E01', /Não encontramos ingresso/, async (p) => { await frameOf(p).getByLabel('E-mail ou CPF').fill('000.000.000-00'); await tap(p, 'Receber código'); await settle(p, 1500); });
  probe('E01', 'enviando', 'go=E01', /Enviando|Entrando|Aguarde|Enviamos/i, async (p) => { await frameOf(p).getByLabel('E-mail ou CPF').fill('rafael@exemplo.com.br'); await frameOf(p).getByRole('button', { name: 'Receber código' }).click(); });
  probe('E02', 'digitando', 'go=E02', /Digite o código/);
  probe('E02', 'inválido', 'go=E02', /inválido|incorreto|não confere/i, async (p) => { await frameOf(p).getByLabel('Código de 6 dígitos').focus(); await p.keyboard.type('000000', { delay: 40 }); await settle(p, 1500); });
  probe('E02', 'reenviar em 30 s', 'go=E02', /Reenviar código em 0:\d\d/);
  probe('E02', 'sucesso', 'go=E02', /Entrando|Que bom|Saiba o que está/i, async (p) => { await frameOf(p).getByLabel('Código de 6 dígitos').focus(); await p.keyboard.type('482917', { delay: 40 }); await settle(p, 1500); });
  probe('E03', 'Executivo (2 telas, sem convite)', 'go=E03&tier=executivo', [/Começar/, /^(?!.*Ativar meu perfil)/], async (p) => { await tap(p, /^Continuar/); });
  probe('E03', 'VIP 3 telas com convite', 'go=E03&tier=vip', /Ativar meu perfil/, async (p) => { await tap(p, /^Continuar/); await tap(p, /^Continuar/); });
  probe('E04', 'pedido contextual (1ª abertura da Trilha)', `${A}&tab=agora`, /Receber os avisos do evento/, async (p) => { await tap(p, /^Trilha/); });
  probe('E04', 'negado + como ativar', 'go=E04n', /Avisos desligados/);
  for (const [m, rx, what] of [['before', /Faltam 2 dias/, 'antes do evento'], ['live', /Ao vivo/, 'sessão ao vivo'], ['break', /Intervalo/, 'intervalo'], ['lunch', /Almoço até 13h30/, 'almoço'], ['endOfDay', /Dia 1 concluído/, 'fim do dia'], ['after', /Resumo da sua jornada/, 'depois do evento']])
    probe('A01', what, `${A}&moment=${m}`, rx);
  probe('A01', 'fim do dia: NPS', `${A}&moment=endOfDay`, /Como foi o Dia 1/);
  probe('A01', 'depois: Indique o Protagon + NPS final', `${A}&moment=after`, [/Indique o Protagon/, /Como foi o Protagon/]);
  probe('A01', 'agenda atualizada', `${A}&moment=live`, /Agenda atualizada/);
  probe('A01', 'sem internet', `${A}&offline=1`, /Sem internet/);
  probe('A01', 'Executivo: 1 card Conexões com cadeado/teaser', `${A}&tier=executivo`, /Conhecer/);
  probe('A02', 'intervalo', 'go=A02&moment=break&phase=start', /Intervalo/);
  probe('A02', 'almoço', 'go=A02&moment=lunch&phase=start', /Almoço/);
  probe('A02', 'faltam 5 min', 'go=A02&moment=break&phase=five', /Faltam 5 min/);
  probe('A02', 'volte agora', 'go=A02&moment=lunch&phase=now', /Volte agora/);
  probe('A03', 'praça e restaurantes próximos', 'go=A03', [/Praça de alimentação/, /Restaurantes próximos/]);
  probe('A03', 'aba restaurantes próximos', 'go=A03', /Espera|R\$/, async (p) => { await tap(p, /Restaurantes próximos/); });
  probe('A04', 'meu setor', 'go=A04', /Meu setor/);
  probe('A04', 'setor Executivo', 'go=A04&tier=executivo', /Setor Executivo/);
  probe('A04', 'setor Diamond', 'go=A04&tier=diamond', /Setor Diamond/);
  probe('A04', 'estande', 'go=A04', /Estande/);
  probe('A04c', 'Ponto de Conexão selecionado', 'go=A04c', /Ponto C: /);
  probe('A05', 'rede e senha', 'go=A05', [/Protagon-Alunos/, /Senha/]);
  probe('A05', 'copiado', 'go=A05', /copiad/i, async (p) => { await tap(p, /Copiar senha/); });
  probe('G01', 'online', 'go=G01', /Disponível offline/);
  probe('G01', 'offline', 'go=G01&offline=1', /Sem internet|offline/i);
  probe('G01', 'adicionado à Wallet', 'go=G01', /Wallet/i, async (p) => { await tap(p, /Adicionar à Wallet/); });
  probe('G02', 'não lidas', `${A}&overlay=notifications`, /Todas/);
  probe('G02', 'vazia', 'go=G02', /Nada por aqui/);
  probe('G02', 'filtro Avisos', `${A}&overlay=notifications`, /Avisos/, async (p) => { await tap(p, /^Avisos$/); });
  probe('G02', 'limpar tudo + desfazer', `${A}&overlay=notifications`, /Desfazer/, async (p) => { await tap(p, /Limpar tudo/); });
  probe('G02', 'em espera até o intervalo', `${A}&moment=live&overlay=notifications`, /espera|intervalo/i, async (p) => {
    await panelOf(p).locator('select#tpl').selectOption('n-request-received'); await panelOf(p).getByRole('button', { name: /Disparar notificação/ }).click(); await settle(p);
  });
  probe('G03', 'push na tela bloqueada', 'go=G03', /Toque para desbloquear/);
  probe('G04', 'compacta', `${A}&moment=lunch&locked=0`, /Almoço · retorno 13h30|retorno 13h30/);
  probe('G04', 'expandida', `${A}&moment=lunch`, /Volte ao salão às 13h20/, async (p) => { await frameOf(p).locator('[aria-label*="Almoço"]').first().click().catch(() => {}); await settle(p); });
  probe('G04', 'tela bloqueada com Live Activity', 'go=G04&moment=lunch', /Atividade|Almoço · retorno/);
  probe('G05', 'offline', 'go=G05', /Sem internet/);
  probe('G05', 'reconectado', `${A}&offline=1`, /Conectado de novo|Reconectado|conectado/i, async (p) => { await panelOf(p).getByRole('switch', { name: /Sem internet/ }).click(); await settle(p, 600); });
  probe('T01', 'dia em andamento', `${A}&tab=trilha&perm=granted`, [/Ao vivo/, /Concluída/]);
  probe('T01', 'bloco alterado', `${A}&tab=trilha&perm=granted`, /Alterado/);
  probe('T01', 'dia futuro', `${A}&tab=trilha&perm=granted`, /./, async (p) => { await tap(p, /^Dia 3/); });
  probe('T01', 'dia encerrado', `${A}&tab=trilha&perm=granted&moment=live&day=2`, /Concluíd|Encerrad/, async (p) => { await tap(p, /^Dia 1/); });
  probe('T01', 'progresso da jornada', `${A}&tab=trilha&perm=granted`, /Sua jornada/);
  probe('T02', 'ao vivo', 'go=T02', /Ao vivo/);
  probe('T02', 'material "libera às"', 'go=T02', /Libera às/);
  probe('T02', 'anotações', 'go=T02', /Minhas anotações/);
  probe('T02', 'concluída', `${A}&tab=trilha&perm=granted`, /Sessão|Objetivo/, async (p) => { await tap(p, /Abertura: por que você está aqui/); });
  probe('C00', 'prévia + contador (Executivo)', 'go=C00', /\d+ participantes/);
  probe('C00', 'convite de upgrade', 'go=C00', /estande/i, async (p) => { await tap(p, /Quero me conectar/); });
  probe('C00', 'convite fechável (Agora não)', 'go=C00', /Quero me conectar/, async (p) => { await tap(p, /Quero me conectar/); await tap(p, /Agora não|Fechar/); });
  probe('C01', 'dados, nicho, objetivos', 'go=C01', [/Qual é o seu nicho/, /O que você busca/]);
  probe('C01', 'interesses + visibilidade + consentimento', 'go=C01', /Autorizo mostrar meu perfil/, async (p) => { await tap(p, /^Busco sócio/); await tap(p, /^Destravar/); await tap(p, /^Continuar/); await tap(p, /^Continuar/); });
  probe('C01b', 'Complete seu perfil', `${A}&connections=1&overlay=profile`, /maior desafio/i);
  probe('C02', 'fila com afinidade e motivo', 'go=C02&moment=break', [/Afinidade/, /interesses em comum/]);
  probe('C02', 'limite diário', 'go=C02&moment=break&sent=15', /Você usou os 15 pedidos de hoje/);
  probe('C02', 'antes do evento (proposta)', 'go=C02&moment=before', /Proposta/);
  probe('C02', 'perfil pausado', 'go=C02&moment=break', /pausad/i, async (p) => { await tap(p, /Mais opções|Menu/); await tap(p, /Pausar meu perfil/); await settle(p); });
  probe('C02', 'fim da fila', 'go=C02&moment=break', /Você viu todas|acabaram|fim|Volte amanhã|Sem mais/i, async (p) => { for (let i = 0; i < 27; i++) { const b = frameOf(p).getByRole('button', { name: 'Agora não' }).filter({ visible: true }); if ((await b.count()) === 0) break; await b.first().click(); await p.waitForTimeout(260); } });
  probe('C03', 'antes do aceite', 'go=C02&moment=break', /Por que vale conversar|Maior desafio/, async (p) => { await tap(p, /Ver perfil/); });
  probe('C03', 'pedido enviado (Pendente)', 'go=C02&moment=break', /Pendente/, async (p) => { await tap(p, /^Conectar com/); await tap(p, /Enviar pedido/); await settle(p, 700); await tap(p, /^Explorar/); });
  probe('C03', 'conectado (WhatsApp, LinkedIn, Instagram)', 'go=C03', [/WhatsApp/, /LinkedIn/, /Instagram/]);
  probe('C04', 'modelos', 'go=C04&moment=break', /Escolha uma mensagem/);
  probe('C04', 'mensagem própria', 'go=C04&moment=break', /Mensagem para/, async (p) => { await tap(p, /Escrever a minha/); });
  probe('C04', 'limite atingido', 'go=C04&moment=break&sent=15', /Restam 0 de 15/);
  probe('C05', 'com pedidos', 'go=C05&moment=break', /Aceitar/);
  probe('C05', 'aceito', 'go=C05&moment=break', /Conectados|aceit|Conversar/i, async (p) => { await tap(p, /^Aceitar/); await settle(p, 600); });
  probe('C05', 'vazio', 'go=C05&moment=break', /Você respondeu a todos os pedidos/, async (p) => { for (let i = 0; i < 6; i++) { const b = frameOf(p).getByRole('button', { name: /Agora não/ }).filter({ visible: true }); if ((await b.count()) === 0) break; await b.first().click(); await p.waitForTimeout(300); } });
  probe('C06', 'filtros', 'go=C06&moment=break', [/Segmento/, /Cidade/, /Objetivo/], async (p) => { await tap(p, /^Filtros/); });
  probe('C06', 'sem resultados', 'go=C06&moment=break', /Ninguém com esses filtros/, async (p) => { await frameOf(p).locator('input').first().fill('zzzzzz'); await settle(p, 500); });
  probe('C07', 'primeira mensagem', 'go=C08&moment=break', /Comece com uma mensagem pronta/, async (p) => { await settle(p); });
  probe('C07', 'conversa + encontro proposto', 'go=C07&moment=break', [/propôs um encontro/, /Confirmar/]);
  probe('C07', 'encontro confirmado (Felipe)', 'go=C09&moment=break', /Encontro confirmado/, async (p) => { await tap(p, /Abrir perfil de Felipe Correa/); await tap(p, /^Conversar/); });
  probe('C08', 'próximo intervalo + ponto', 'go=C08&moment=break', [/Próximo: Intervalo/, /Ponto A/]);
  probe('C08', 'escolher outro horário', 'go=C08&moment=break', /Almoço · 12h50/, async (p) => { await tap(p, /Escolher outro horário/); });
  probe('C09', 'lista', 'go=C09&moment=break', /5 conexões/);
  probe('C09', 'exportar só depois do evento', 'go=C09&moment=break', /dia seguinte ao fim do evento/);
  probe('C09', 'exportar liberado depois', 'go=C09&moment=after', /Exportar contatos/);
  probe('C09', 'nota privada', 'go=C09&moment=break', /Dono da imobiliária/);
  probe('C10', 'câmera', 'go=C10', /Aponte para o QR/);
  probe('C10', 'pessoa encontrada', 'go=C10', /Confirmar|encontrada|Conectar/i, async (p) => { await tap(p, /Simular leitura/); });
  probe('C10', 'Executivo cai no C00', 'go=C00&tier=executivo', /Quero me conectar/);
  probe('C11', 'bloquear, denunciar, desfazer, pausar', 'go=C11', [/Bloquear/, /Denunciar/, /Desfazer conexão/, /Pausar meu perfil/]);
  probe('M01', 'liberado/agendado/baixado/concluído', 'go=M01&moment=endOfDay', [/Baixado/, /Concluído/, /Libera|liberad/i]);
  probe('M01', 'offline (só baixados)', 'go=M01&offline=1', /Sem internet|baixados/i);
  probe('M02', 'PDF', 'go=M02', /PDF/);
  probe('M02', 'workbook', 'go=M01&moment=endOfDay', /Workbook/, async (p) => { await tap(p, /Workbook: Roda da vida/); });
  probe('M02', 'áudio', 'go=M01&moment=endOfDay', /Áudio/, async (p) => { await tap(p, /Áudio: Autorresponsabilidade/); });
  probe('M02', 'vídeo', 'go=M01&moment=endOfDay', /Vídeo/, async (p) => { await tap(p, /Vídeo: resumo do Dia 1/); });
  probe('U01', 'dados da compra, CPF mascarado', 'go=U01', /\*\*\*\.\d{3}\.\d{3}-\*\*/);
  probe('U01', 'Meu perfil de Conexões', 'go=U01&connections=1', /Meu perfil de Conexões/);
  probe('U02', 'por categoria', 'go=U02', [/Avisos operacionais/, /Agenda e materiais/, /Conexões/]);
  probe('U02', 'permissão negada', 'go=U02&perm=denied', /Avisos do sistema desligados/);
  probe('U03', 'campos visíveis + Instagram proposta', 'go=U03', [/Sempre visíveis/, /Instagram/]);
  probe('U03', 'excluir dados com confirmação', 'go=U03', /Excluir|certeza|confirm/i, async (p) => { await tap(p, /^Excluir meus dados/); });
  probe('U03', 'dados excluídos', 'go=U03', /Dados excluídos/, async (p) => { await tap(p, /^Excluir meus dados/); await tap(p, /Entendo/); await tap(p, /Excluir tudo agora/); await settle(p, 700); });
  probe('U04', 'pendente', 'go=U04&moment=endOfDay', /Pendente/, async (p) => { await tap(p, /Voltar/); });
  probe('U04', 'NPS final', 'go=U04&moment=after', /Como foi o Protagon/);
  probe('U05', 'FAQ + falar com o CS', 'go=U05', [/Perguntas frequentes/, /Falar com o CS/]);

  const unreachable = [];
  for (const pr of P) {
    const { ctx, page } = await open(pr.query);
    let ok = false;
    let detail = '';
    try {
      if (pr.steps) await pr.steps(page);
      const t = await text(page);
      const miss = pr.expects.filter((rx) => !rx.test(t));
      ok = miss.length === 0;
      if (!ok) detail = `faltou ${miss.map(String).join(' e ')}`;
    } catch (e) {
      detail = e.message.split('\n')[0];
    }
    if (!ok) unreachable.push(`${pr.code} ${pr.state}: ${detail}`);
    check('a', `${pr.code} ${pr.state}`, ok, ok ? '' : detail);
    await ctx.close();
  }
  keep('a', 'naoConfirmados', unreachable);
  console.log(`\n[a] ${P.length} estados sondados, ${unreachable.length} não confirmados (investigar um a um).`);
}

// ---------------------------------------------------------------------------
// (b)(c) contraste e fonte; (e) alvos
// ---------------------------------------------------------------------------
const textScans = {};
async function sectionBC() {
  await eachScreen(async (id, page) => {
    const r = await page.evaluate(TEXT_SCAN);
    textScans[id] = r;
    if (r.frameW !== 390) check('infra', `escala 1:1 ${id}`, false, `largura ${r.frameW}`);
  });
  const fails = [];
  const small = { body: [], action: [], meta: [], chrome: [] };
  for (const [id, r] of Object.entries(textScans)) {
    for (const it of r.items) {
      if (!it.ok && !it.disabled) fails.push({ screen: id, ...it });
      if (it.fs < 16) {
        const bucket = it.island ? 'chrome' : it.ctl && it.ctlLen <= 40 ? 'action' : it.len >= 45 ? 'body' : 'meta';
        small[bucket].push({ screen: id, t: it.t, fs: it.fs, ctl: it.ctl });
      }
    }
  }
  keep('b', 'falhas', fails);
  keep('c', 'pequenas', small);
  const uniq = (arr, key) => [...new Map(arr.map((x) => [key(x), x])).values()];
  const f = uniq(fails, (x) => `${x.t}|${x.fg}|${x.bg}`);
  check('b', 'contraste WCAG AA em todos os textos visíveis', f.length === 0, `${f.length} pares únicos abaixo do mínimo (${fails.length} ocorrências em ${Object.keys(textScans).length} telas)`);
  f.sort((a, b) => a.ratio - b.ratio).slice(0, 60).forEach((x) => console.log(`   ${x.ratio}:1 (<${x.need}) [${x.screen}] "${x.t}" ${x.fs}px fg=${x.fg} bg=${x.bg} op=${x.op}${x.ctl ? ' ctl=' + x.ctl : ''}`));
  const disabledLow = [];
  for (const [id, r] of Object.entries(textScans)) for (const it of r.items) if (!it.ok && it.disabled) disabledLow.push({ screen: id, ...it });
  keep('b', 'desabilitados', disabledLow);
  console.log(`   (desabilitados abaixo do mínimo, isentos pela WCAG: ${uniq(disabledLow, (x) => x.t).length})`);

  const sizes = (arr) => {
    const m = {};
    arr.forEach((x) => (m[x.fs] = (m[x.fs] ?? 0) + 1));
    return JSON.stringify(m);
  };
  check('c', 'texto corrido (>= 45 caracteres) com fonte >= 16px', small.body.length === 0, `${small.body.length} ocorrências, tamanhos ${sizes(small.body)}`);
  small.body.slice(0, 40).forEach((x) => console.log(`   corpo<16 [${x.screen}] ${x.fs}px "${x.t}"`));
  const actU = uniq(small.action, (x) => `${x.t}|${x.fs}`);
  check('c', 'rótulos de ação (botões, chips, abas, links) >= 16px', actU.length === 0, `${actU.length} rótulos únicos, tamanhos ${sizes(actU)}`);
  actU.slice(0, 60).forEach((x) => console.log(`   ação<16 [${x.screen}] ${x.fs}px ${x.ctl} "${x.t}"`));
  const metaU = uniq(small.meta, (x) => `${x.t}|${x.fs}`);
  console.log(`   (legendas/metadados < 16px, permitidos como caption pelo design system: ${metaU.length} textos únicos; tamanhos ${sizes(metaU)})`);
  const under13 = uniq([...small.body, ...small.action, ...small.meta].filter((x) => x.fs < 13), (x) => `${x.t}|${x.fs}`);
  check('c', 'nenhum texto abaixo do mínimo de caption (13px)', under13.length === 0, `${under13.length} textos`);
  under13.slice(0, 40).forEach((x) => console.log(`   <13px [${x.screen}] ${x.fs}px "${x.t}"`));
}

async function sectionE() {
  const bad = [];
  const warn = [];
  await eachScreen(async (id, page) => {
    const r = await page.evaluate(TARGET_SCAN);
    for (const it of r.items) {
      const min = Math.min(it.w, it.h);
      if (min < 44) bad.push({ screen: id, ...it });
      else if (min < 48) warn.push({ screen: id, ...it });
    }
  });
  const uniq = (arr) => [...new Map(arr.map((x) => [`${x.name}|${x.w}x${x.h}`, x])).values()];
  const b = uniq(bad);
  keep('e', 'menor44', b);
  keep('e', 'entre44e48', uniq(warn));
  check('e', 'alvo de toque >= 44 px (HIG) em todos os controles', b.length === 0, `${b.length} controles únicos abaixo de 44 px`);
  b.sort((x, y) => Math.min(x.w, x.h) - Math.min(y.w, y.h)).slice(0, 60).forEach((x) => console.log(`   ${x.w}x${x.h} [${x.screen}] ${x.tag}${x.role ? '[' + x.role + ']' : ''} "${x.name}"`));
  const w = uniq(warn);
  console.log(`   (entre 44 e 47 px, abaixo dos 48 px do design system: ${w.length} controles únicos)`);
  w.slice(0, 25).forEach((x) => console.log(`     ${x.w}x${x.h} [${x.screen}] "${x.name}"`));
}

// ---------------------------------------------------------------------------
// (d) Regras invioláveis
// ---------------------------------------------------------------------------
async function sectionD() {
  const FORBID = [
    ['match', /\bmatch(es|ed)?\b/i],
    ['curtir', /\bcurt(ir|ida|idas|iu|e|ir)\b/i],
    ['coração', /[❤♥♡❣]|\uD83D[\uDC95-\uDC9F]/],
    ['emoji', /\p{Extended_Pictographic}/u],
    ['namoro', /\b(namor|paquer|crush|solteir|date)\w*/i],
  ];
  const hits = [];
  const contact = [];
  const lockScreens = [];
  const CONTACT_RX = /(?:\(\d{2}\)\s?9?\d{4}-\d{4}|\+55\s?\d|@[\w.]+\.exemplo|linkedin\.com\/in\/[\w-]+|[\w.]+@[\w.]+\.\w{2,})/i;
  // telas antes do aceite: nada de contato de OUTRA pessoa (e-mail/telefone do aluno e do suporte são esperados)
  const PRE_ACCEPT = new Set(['C00-exec', 'C00-convite', 'C02', 'C02-limite', 'C02-before', 'C03-sugestao', 'C04', 'C04-limite', 'C05', 'C06', 'C10', 'A01-live-vip', 'A01-break-vip', 'A01-before-vip', 'A01-after-vip', 'A01-endOfDay']);
  const ME_CONTACTS = /rafael\.moraes@exemplo\.com\.br|@rafaelmoraes\.exemplo|suporte@protagon\.exemplo/i;

  await eachScreen(async (id, page) => {
    const t = await text(page);
    const attrs = await page.evaluate(() => {
      const f = document.querySelector('[role=region][aria-label^="Tela do app"]');
      return [...f.querySelectorAll('[aria-label],[title],[placeholder],[alt]')].map((e) => ['aria-label', 'title', 'placeholder', 'alt'].map((a) => e.getAttribute(a) || '').join(' ')).join(' | ');
    });
    const icons = await page.evaluate(() => [...document.querySelectorAll('[role=region] svg')].map((s) => s.getAttribute('class') || '').filter((c) => /heart|flame|thumbs/i.test(c)));
    for (const [k, rx] of FORBID) {
      const m = (t + ' ' + attrs).match(rx);
      if (m) hits.push({ screen: id, regra: k, trecho: m[0] });
    }
    if (icons.length) hits.push({ screen: id, regra: 'ícone', trecho: icons.join(',') });
    if (PRE_ACCEPT.has(id)) {
      const stripped = t.replace(ME_CONTACTS, '');
      const m = stripped.match(CONTACT_RX);
      if (m) contact.push({ screen: id, trecho: m[0] });
    }
  });
  keep('d', 'palavrasProibidas', hits);
  keep('d', 'contatoAntesDoAceite', contact);
  check('d', 'sem "match", "curtir", corações, emoji ou estética de namoro nas telas', hits.length === 0, JSON.stringify(hits.slice(0, 10)));
  check('d', 'nenhum contato de outra pessoa (telefone, e-mail, @, LinkedIn) antes do aceite', contact.length === 0, JSON.stringify(contact.slice(0, 10)));

  // Exceção proposta: Instagram antes da conexão (U03). Padrão deve ser desligado e nada aparecer com ele desligado
  {
    const { ctx, page } = await open('go=U03');
    const sw = frameOf(page).getByRole('switch', { name: /Mostrar meu Instagram antes da conexão/ });
    check('d', 'Instagram antes da conexão desligado por padrão (U03)', (await sw.getAttribute('aria-checked')) === 'false');
    const consent = frameOf(page).getByRole('switch', { name: /Meu perfil de Conexões/ });
    await ctx.close();
    const c2 = await open('go=C01');
    const t2 = await text(c2.page);
    keep('d', 'c01Consentimento', t2.includes('Ativar perfil'));
    await c2.ctx.close();
  }
  // Consentimento desligado por padrão: no C01, passo final, o switch deve nascer desligado
  {
    const { ctx, page } = await open('go=C01');
    let sw = null;
    for (let i = 0; i < 4; i++) {
      const s = frameOf(page).getByRole('switch').filter({ visible: true });
      if ((await s.count()) > 0) {
        const lbls = [];
        for (let k = 0; k < (await s.count()); k++) lbls.push(`${await s.nth(k).getAttribute('aria-label') ?? (await s.nth(k).innerText().catch(() => ''))}=${await s.nth(k).getAttribute('aria-checked')}`);
        sw = lbls;
        break;
      }
      const cont = frameOf(page).getByRole('button', { name: /^Continuar/ }).filter({ visible: true });
      if ((await cont.count()) === 0) break;
      // no passo 1 é preciso escolher nicho e objetivo para avançar
      await cont.first().click().catch(() => {});
      await settle(page, 300);
    }
    keep('d', 'c01Switches', sw);
    await ctx.close();
  }

  // Cadeado: só na aba Conexões e em no máximo um card da Home; sem convite na abertura
  const lockInfo = [];
  for (const [id, q] of [['Home live', `${A}&tier=executivo&moment=live`], ['Home before', `${A}&tier=executivo&moment=before`], ['Home lunch', `${A}&tier=executivo&moment=lunch`], ['Home break', `${A}&tier=executivo&moment=break`], ['Home endOfDay', `${A}&tier=executivo&moment=endOfDay`], ['Home after', `${A}&tier=executivo&moment=after`], ['Trilha', `${A}&tier=executivo&tab=trilha&perm=granted`], ['Materiais', `${A}&tier=executivo&tab=materiais`], ['Eu', `${A}&tier=executivo&tab=eu`], ['Conexões', `${A}&tier=executivo&tab=conexoes`]]) {
    const { ctx, page } = await open(q);
    const n = await page.evaluate(() => {
      const f = document.querySelector('[role=region][aria-label^="Tela do app"]');
      const main = f.querySelector('main');
      const locks = [...f.querySelectorAll('svg.lucide-lock, svg[class*="lucide-lock"]')].map((s) => {
        const inNav = !!s.closest('nav');
        const inMain = !!s.closest('main');
        return { inNav, inMain };
      });
      const dialogOpen = !!f.querySelector('[role=dialog]');
      return { inMain: locks.filter((l) => l.inMain).length, inNav: locks.filter((l) => l.inNav).length, dialogOpen, mainText: (main?.innerText ?? '').slice(0, 0) };
    });
    lockInfo.push({ tela: id, ...n });
    await ctx.close();
  }
  keep('d', 'cadeados', lockInfo);
  const homeLocks = lockInfo.filter((l) => l.tela.startsWith('Home'));
  check('d', 'Home Executivo: no máximo 1 card com cadeado', homeLocks.every((l) => l.inMain <= 1), JSON.stringify(homeLocks.map((l) => `${l.tela}:${l.inMain}`)));
  check('d', 'cadeado fora de Home/Conexões (Trilha, Materiais, Eu)', lockInfo.filter((l) => ['Trilha', 'Materiais', 'Eu'].includes(l.tela)).every((l) => l.inMain === 0), '');
  check('d', 'nenhum convite/dialog aberto na abertura (Executivo)', lockInfo.every((l) => !l.dialogOpen), '');

  // Vidro (blur) só na tab bar e nos sheets
  const blur = [];
  for (const id of ['A01-live-vip', 'C02', 'C00-exec', 'G01', 'A04', 'C04', 'U03', 'G03', 'M02', 'T01-live']) {
    const sc = SCREENS.find((s) => s[0] === id);
    const { ctx, page } = await open(sc[1]);
    if (sc[2]) await sc[2](page);
    const r = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('[role=region] *').forEach((e) => {
        const cs = getComputedStyle(e);
        const bf = cs.backdropFilter && cs.backdropFilter !== 'none' ? cs.backdropFilter : cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none' ? cs.webkitBackdropFilter : '';
        const f = cs.filter && cs.filter !== 'none' ? cs.filter : '';
        if (bf || f) out.push({ tag: e.tagName.toLowerCase(), cls: String(e.className).slice(0, 80), bf, f, nav: !!e.closest('nav'), dialog: !!e.closest('[role=dialog]'), text: (e.innerText || '').slice(0, 30) });
      });
      return out;
    });
    r.forEach((x) => blur.push({ screen: id, ...x }));
    await ctx.close();
  }
  keep('d', 'blur', blur);
  const stray = blur.filter((x) => !(x.nav || x.dialog) && x.bf);
  check('d', 'backdrop-filter (vidro) só na tab bar e em bottom sheets', stray.length === 0, JSON.stringify(stray.slice(0, 5)));
  const filt = blur.filter((x) => x.f);
  keep('d', 'filter', filt);
  console.log(`   (filter:blur no DOM: ${filt.length} ocorrências; esperado só na prévia borrada do C00: ${JSON.stringify(filt.map((x) => x.screen + ':' + x.cls.slice(0, 30)).slice(0, 4))})`);
  // Sheets com 'reduzir transparência'
  {
    const { ctx, page } = await open('go=A05');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const bf = await page.evaluate(() => getComputedStyle(document.querySelector('nav[aria-label="Navegação principal"]')).backdropFilter);
    keep('d', 'tabbarBlur', bf);
    await page.emulateMedia({ reducedTransparency: 'reduce' }).catch(() => {});
    const bg = await page.evaluate(() => getComputedStyle(document.querySelector('nav[aria-label="Navegação principal"]')).backgroundColor);
    keep('d', 'tabbarBgReducedTransparency', bg);
    await ctx.close();
  }
}

// ---------------------------------------------------------------------------
// (f) Foco e teclado
// ---------------------------------------------------------------------------
async function sectionF() {
  // F1: sheet de pedido (C04)
  const sheets = [
    ['C04 pedido', 'go=C04&moment=break', null],
    ['C11 segurança', 'go=C11', null],
    ['C08 encontro', 'go=C08&moment=break', null],
    ['A05 Wi-Fi', 'go=A05', null],
    ['C00 convite', 'go=C00', async (p) => { await tap(p, /Quero me conectar/); }],
    ['U03 excluir', 'go=U03', async (p) => { await tap(p, /^Excluir meus dados/); }],
    ['E04 permissão', 'go=E04', null],
  ];
  for (const [name, q, steps] of sheets) {
    const { ctx, page } = await open(q);
    try {
      if (steps) await steps(page);
      await settle(page, 600);
      const dlg = frameOf(page).getByRole('dialog');
      const has = (await dlg.count()) > 0;
      check('f', `${name}: abre como role=dialog aria-modal`, has && (await dlg.first().getAttribute('aria-modal')) === 'true');
      if (!has) { await ctx.close(); continue; }
      const inside = () => page.evaluate(() => { const d = document.querySelector('[role=dialog]'); return !!d && d.contains(document.activeElement); });
      check('f', `${name}: foco inicial dentro do sheet`, await inside());
      // 25 Tabs: o foco precisa ficar preso no sheet
      let escaped = 0;
      let escapedTo = '';
      for (let i = 0; i < 25; i++) {
        await page.keyboard.press('Tab');
        if (!(await inside())) {
          escaped++;
          if (!escapedTo) escapedTo = await page.evaluate(() => { const a = document.activeElement; return `${a?.tagName}:${(a?.getAttribute('aria-label') || a?.textContent || '').trim().slice(0, 30)}`; });
        }
      }
      check('f', `${name}: Tab não escapa do sheet (focus trap)`, escaped === 0, escaped ? `${escaped}/25 Tabs fora do sheet, primeiro: ${escapedTo}` : '');
      // foco visível no elemento focado dentro do sheet
      await page.keyboard.press('Shift+Tab');
      const ring = await page.evaluate(() => {
        const a = document.activeElement; if (!a) return null; const cs = getComputedStyle(a);
        return { tag: a.tagName, outline: cs.outlineStyle + ' ' + cs.outlineWidth, shadow: cs.boxShadow !== 'none' ? 'sombra' : '', matches: a.matches(':focus-visible') };
      });
      keep('f', `foco ${name}`, ring);
      await page.keyboard.press('Escape');
      await settle(page, 600);
      const closed = (await frameOf(page).getByRole('dialog').count()) === 0;
      check('f', `${name}: Esc fecha o sheet`, closed);
    } catch (e) {
      check('f', `${name}`, false, e.message.split('\n')[0]);
    }
    await ctx.close();
  }

  // F2: página empilhada: o conteúdo de trás continua focável por Tab? (deveria ser inert)
  {
    const { ctx, page } = await open(`${A}&overlay=notifications`);
    const r = await page.evaluate(() => {
      const f = document.querySelector('[role=region][aria-label^="Tela do app"]');
      const ov = f.querySelector('.z-overlay');
      const main = f.querySelector('main');
      const focusBehind = [...main.querySelectorAll('button,a,input,select,textarea,[tabindex]')].filter((e) => !ov.contains(e) && e.tabIndex >= 0);
      return { atrás: focusBehind.length, inert: !!(main.closest('[inert]')), ariaHidden: main.closest('[aria-hidden=true]') ? true : false };
    });
    keep('f', 'conteudoAtrasDoOverlay', r);
    check('f', 'página empilhada: conteúdo da aba de trás fora da ordem de foco (inert/aria-hidden)', r.atrás === 0 || r.inert || r.ariaHidden, JSON.stringify(r));
    await ctx.close();
  }

  // F3: Tab através da Home: todo controle focado mostra anel; ordem de foco; skip
  for (const [name, q] of [['Home VIP live', `${A}&moment=live&connections=1&profile=full`], ['Conexões VIP', 'go=C02&moment=break'], ['Trilha', `${A}&tab=trilha&perm=granted`], ['Login', 'go=E01']]) {
    const { ctx, page } = await open(q);
    const seen = [];
    const noRing = [];
    for (let i = 0; i < 45; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const a = document.activeElement; if (!a || a === document.body) return null;
        const f = document.querySelector('[role=region][aria-label^="Tela do app"]');
        if (!f.contains(a)) return { outside: true };
        const cs = getComputedStyle(a); const hasOutline = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0;
        const hasShadow = cs.boxShadow && cs.boxShadow !== 'none' && /rgb/.test(cs.boxShadow);
        // anel pode estar num ancestral com :focus-within
        let within = false; for (let n = a.parentElement; n && n !== f; n = n.parentElement) { const c = getComputedStyle(n); if (n.matches(':focus-within') && ((c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) || (c.boxShadow !== 'none'))) { within = true; break; } }
        return { name: (a.getAttribute('aria-label') || a.textContent || a.id || '').trim().replace(/\s+/g, ' ').slice(0, 40), tag: a.tagName, ring: hasOutline || hasShadow || within, outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor };
      });
      if (!info || info.outside) continue;
      seen.push(info.name);
      if (!info.ring) noRing.push(info.name + ' <' + info.tag + '>');
    }
    keep('f', `tab ${name}`, { focados: seen.length, semAnel: noRing });
    check('f', `${name}: anel de foco visível em todo controle alcançado por Tab`, noRing.length === 0 && seen.length > 3, `${seen.length} controles, sem anel: ${noRing.join('; ')}`);
    await page.screenshot({ path: join(OUT_DIR, `foco-${name.replace(/\W+/g, '-')}.png`), clip: await frameOf(page).boundingBox() });
    await ctx.close();
  }

  // F4: Enter/Espaço ativam controles customizados (cards, chips, tabs)
  {
    const { ctx, page } = await open(`${A}&moment=live&connections=1&profile=full`);
    const divs = await page.evaluate(() => {
      const f = document.querySelector('[role=region][aria-label^="Tela do app"]');
      return [...f.querySelectorAll('[onclick], div[class*="cursor-pointer"], [role=button]:not(button)')].length;
    });
    keep('f', 'clicaveisNaoNativos', divs);
    await ctx.close();
  }
}

// ---------------------------------------------------------------------------
// (g) <= 2 toques
// ---------------------------------------------------------------------------
async function sectionG() {
  const tabs = ['agora', 'trilha', 'conexoes', 'materiais', 'eu'];
  for (const tier of ['executivo', 'vip']) {
    for (const t of tabs) {
      for (const m of ['live', 'lunch']) {
        const { ctx, page } = await open(`${A}&tier=${tier}&tab=${t}&moment=${m}&perm=granted&connections=1`);
        const f = frameOf(page);
        const tag = `${tier}/${t}/${m}`;
        // credencial: 1 toque
        const qr = f.getByRole('button', { name: 'Abrir credencial' });
        const hasQr = (await qr.filter({ visible: true }).count()) > 0;
        let credOk = false;
        if (hasQr) { await qr.first().click(); await settle(page, 600); credOk = /Disponível offline|Adicionar à Wallet/.test(await text(page)); }
        check('g', `credencial a 1 toque [${tag}]`, hasQr && credOk);
        await ctx.close();
        // agenda: 1 toque (aba Trilha)
        const c2 = await open(`${A}&tier=${tier}&tab=${t}&moment=${m}&perm=granted&connections=1`);
        await tap(c2.page, /^Trilha/);
        const agOk = /Sua jornada|Hoje ·/.test(await text(c2.page));
        check('g', `agenda a 1 toque [${tag}]`, agOk);
        await c2.ctx.close();
        // mapa: <= 2 toques (aba Agora + card Mapa), ou 1 se já em Agora
        const c3 = await open(`${A}&tier=${tier}&tab=${t}&moment=${m}&perm=granted&connections=1`);
        let taps = 0;
        if (t !== 'agora') { await tap(c3.page, /^Agora$/); taps++; }
        let mapOk = false;
        try { await tap(c3.page, /^Mapa/); taps++; mapOk = /Mapa do local/.test(await text(c3.page)); } catch { mapOk = false; }
        check('g', `mapa a ${taps} toque(s) [${tag}]`, mapOk && taps <= 2);
        await c3.ctx.close();
      }
    }
  }
  // Funcionam offline
  for (const [name, q, rx] of [['credencial', 'go=G01&offline=1', /Disponível offline|Adicionar/], ['mapa', 'go=A04&offline=1', /Mapa do local/], ['agenda', `${A}&tab=trilha&perm=granted&offline=1`, /Sua jornada/]]) {
    const { ctx, page } = await open(q);
    check('g', `${name} funciona offline`, rx.test(await text(page)));
    await ctx.close();
  }
  // Mapa e credencial a partir de páginas empilhadas (chat, perfil, sessão)
  for (const [name, q] of [['chat', 'go=C07&moment=break'], ['perfil C03', 'go=C03'], ['sessão T02', 'go=T02'], ['material M02', 'go=M02'], ['Wi-Fi', 'go=A05']]) {
    const { ctx, page } = await open(q);
    const f = frameOf(page);
    const qr = await f.getByRole('button', { name: 'Abrir credencial' }).filter({ visible: true }).count();
    const covered = await page.evaluate(() => { const b = [...document.querySelectorAll('[role=region] button[aria-label="Abrir credencial"]')][0]; if (!b) return null; const r = b.getBoundingClientRect(); const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2); return !(b === top || b.contains(top)); });
    keep('g', `credencialVisivelEm ${name}`, { botoes: qr, cobertoPorOverlay: covered });
    await ctx.close();
  }
}

// ---------------------------------------------------------------------------
// (h) Brilho baixo + capturas de evidência
// ---------------------------------------------------------------------------
async function sectionH() {
  const shots = [
    ['home-live-vip', `${A}&moment=live&tier=vip`],
    ['home-live-exec', `${A}&moment=live&tier=executivo`],
    ['conexoes-vip', 'go=C02&moment=break'],
    ['conexoes-exec-cadeado', 'go=C00'],
    ['trilha', `${A}&tab=trilha&perm=granted`],
    ['credencial', 'go=G01'],
    ['materiais', 'go=M01&moment=endOfDay'],
    ['mapa', 'go=A04'],
    ['intervalo', 'go=A02&moment=break&phase=five'],
    ['eu', 'go=U01&connections=1'],
  ];
  for (const [name, q] of shots) {
    const { ctx, page } = await open(q);
    const box = await frameOf(page).boundingBox();
    await page.screenshot({ path: join(OUT_DIR, `normal-${name}.png`), clip: box });
    await page.addStyleTag({ content: `[role=region][aria-label^="Tela do app"]{filter:brightness(0.4)}` });
    await settle(page, 200);
    await page.screenshot({ path: join(OUT_DIR, `brilho40-${name}.png`), clip: box });
    await ctx.close();
  }
  // contraste efetivo com brilho 40%: o filtro escala os canais por 0,4 (aproximação linear em sRGB)
  const dim = [];
  for (const [id, r] of Object.entries(textScans)) {
    for (const it of r.items) {
      const f = it.fg.split(',').map(Number).map((v) => v * 0.4);
      const b = it.bg.split(',').map(Number).map((v) => v * 0.4);
      const L = (c) => { const g = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * g(c[0]) + 0.7152 * g(c[1]) + 0.0722 * g(c[2]); };
      const rr = (Math.max(L(f), L(b)) + 0.05) / (Math.min(L(f), L(b)) + 0.05);
      if (rr < 4.5 && !it.large && it.ok) dim.push({ screen: id, t: it.t, ratioNormal: it.ratio, ratioBrilho40: Math.round(rr * 100) / 100 });
    }
  }
  keep('h', 'quedaComBrilho40', dim);
  console.log(`   (textos que passam em AA com brilho normal mas caem abaixo de 4,5:1 a 40% de brilho: ${new Set(dim.map((d) => d.t)).size}; ver JSON)`);
}

// ---------------------------------------------------------------------------
// (i) Notificações durante a palestra
// ---------------------------------------------------------------------------
async function sectionI() {
  const { ctx, page } = await open(`${A}&moment=live&connections=1&profile=full&perm=granted`);
  const panel = panelOf(page);
  const opts = await panel.locator('select#tpl option').evaluateAll((os) => os.map((o) => [o.value, o.textContent]).filter(([v]) => v));
  const delivered = [];
  const held = [];
  for (const [id, title] of opts) {
    await page.reload({ waitUntil: 'networkidle' });
    await settle(page, 500);
    await panelOf(page).locator('select#tpl').selectOption(id);
    await panelOf(page).getByRole('button', { name: /Disparar notificação/ }).click();
    await settle(page, 600);
    const pushVisible = await frameOf(page).getByText(title, { exact: false }).filter({ visible: true }).count();
    const heldTxt = /(\d+) em espera/.exec(await panelOf(page).innerText());
    (pushVisible > 0 && !heldTxt ? delivered : held).push(title);
    const tpl = id;
    keep('i', tpl, { pushVisible, emEspera: heldTxt ? heldTxt[1] : 0 });
  }
  keep('i', 'entregues', delivered);
  keep('i', 'emEspera', held);
  const EXPECT_DELIVERED = ['Agenda atualizada', 'Retorno ao salão'];
  const notOk = delivered.filter((t) => !EXPECT_DELIVERED.includes(t) && !/Faltam|Intervalo|Almoço/.test(t));
  check('i', 'durante a palestra só chegam avisos operacionais (push)', notOk.length === 0, `entregues: ${JSON.stringify(delivered)}; em espera: ${JSON.stringify(held)}`);
  await ctx.close();

  // Notificações de boas-vindas no momento "live" (auth=app): alguma de Conexões/Materiais já chega durante a palestra?
  {
    const { ctx: c2, page: p2 } = await open(`${A}&moment=live&overlay=notifications`);
    const list = (await p2.locator('.z-overlay').innerText()).replace(/\s+/g, ' ');
    keep('i', 'listaBoasVindasLive', list);
    check('i', 'lista de notificações em sessão ao vivo sem Conexões/material não operacional', !/Conexões abertas|Conexões liberadas|Novo pedido|Material liberado/.test(list), list.slice(0, 500));
    await c2.close();
  }
  // Badge da tab bar e do sino durante palestra: contadores de Conexões não aparecem
  {
    const { ctx: c3, page: p3 } = await open(`${A}&moment=live&connections=1&profile=full`);
    const t = await frameOf(p3).getByRole('tab', { name: /Conexões/ }).getAttribute('aria-label');
    check('i', 'tab bar sem badge de pedidos durante a palestra', !/pedidos/.test(t ?? ''), t ?? '');
    const home = await text(p3);
    keep('i', 'homeLiveVipAtivo', home.slice(0, 900));
    await c3.close();
  }
}

// ---------------------------------------------------------------------------
async function main() {
  browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
  if (process.env.QA_URL) base = process.env.QA_URL;
  else {
    const s = await serve(join(root, 'dist'));
    base = s.url;
  }
  if (process.env.QA_DBG) {
    const { ctx, page } = await open(process.env.QA_DBG);
    const r = await page.evaluate(TEXT_SCAN);
    console.log(r.kind, r.frameW, r.items.length);
    console.log(JSON.stringify(r.items.slice(0, 12), null, 1));
    await browser.close();
    process.exit(0);
  }
  const order = ['a', 'bc', 'e', 'd', 'f', 'g', 'h', 'i'];
  for (const sec of order) {
    const run = sec === 'bc' ? wanted.has('b') || wanted.has('c') || wanted.has('h') : wanted.has(sec);
    if (!run) continue;
    console.log(`\n=== seção ${sec} ===`);
    if (sec === 'a') await sectionA();
    if (sec === 'bc') await sectionBC();
    if (sec === 'e') await sectionE();
    if (sec === 'd') await sectionD();
    if (sec === 'f') await sectionF();
    if (sec === 'g') await sectionG();
    if (sec === 'h') await sectionH();
    if (sec === 'i') await sectionI();
  }
  await browser.close();
  keep('infra', 'errosDeConsole', pageErrors);
  const failed = results.checks.filter((c) => !c.ok);
  const outName = `qa-resultado-${[...wanted].sort().join('')}.json`;
  writeFileSync(join(OUT_DIR, outName), JSON.stringify(results, null, 2));
  console.log(`\nResumo: ${results.checks.length - failed.length} ok, ${failed.length} falhas, ${pageErrors.length} erros de console/página. JSON em ${join(OUT_DIR, outName)}`);
  process.exit(failed.length || pageErrors.length ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
