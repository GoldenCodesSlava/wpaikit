// Shared browser helpers for discover.js and capture.js.
const { chromium } = require('playwright-core');
const fs = require('fs');

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

const VIEWPORTS = {
  d: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  m: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  t: { viewport: { width: 834, height: 1194 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
};

// Cookie / consent banners of the common WordPress and SaaS plugins.
const HIDE_CSS = [
  '.cky-consent-container', '.cky-btn-revisit-wrapper', '.cky-overlay', '.cky-modal',
  '#onetrust-consent-sdk', '#CybotCookiebotDialog', '#CybotCookiebotDialogBodyUnderlay',
  '.cmplz-cookiebanner', '.cmplz-manage-consent', '#cookie-notice', '#cookie-law-info-bar',
  '.cookie-notice-container', '#moove_gdpr_cookie_info_bar', '.iubenda-cs-container',
  '#usercentrics-root', '.cc-window', '.cc-revoke',
].join(',') + '{display:none!important;visibility:hidden!important}';

function parseArgs(argv) {
  const a = {};
  for (let i = 2; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const k = argv[i].slice(2);
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      a[k] = v;
    }
  }
  return a;
}

async function launch() {
  const executablePath = CHROME_PATHS.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error('Chrome not found. Set CHROME_PATH.');
  return chromium.launch({ executablePath });
}

// auth: { basic: 'user:pass' } and/or { loginUrl, user, pass }
async function newContext(browser, vp, auth = {}) {
  const opts = { ...VIEWPORTS[vp] };
  if (auth.basic) {
    const [username, ...rest] = auth.basic.split(':');
    opts.httpCredentials = { username, password: rest.join(':') };
  }
  const ctx = await browser.newContext(opts);
  if (auth.loginUrl && auth.user && auth.pass) {
    const p = await ctx.newPage();
    await p.goto(auth.loginUrl, { waitUntil: 'networkidle', timeout: 60000 });
    const user = p.locator('input[type=email], input[name=log], input[name=username], input[name=email], input[type=text]').first();
    await user.fill(auth.user);
    await p.locator('input[type=password]').first().fill(auth.pass);
    await Promise.all([
      p.waitForLoadState('networkidle').catch(() => {}),
      p.locator('input[type=password]').first().press('Enter'),
    ]);
    await p.waitForTimeout(2000);
    await p.close();
  }
  return ctx;
}

// Open a page, trigger lazy-load and reveal animations, wait until it settles.
async function openSettled(ctx, url) {
  const pg = await ctx.newPage();
  const res = await pg.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => null);
  await pg.addStyleTag({ content: HIDE_CSS });
  await pg.evaluate(async () => {
    const H = () => document.body.scrollHeight;
    for (let y = 0; y < H(); y += 220) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 170)); }
    await new Promise((r) => setTimeout(r, 800));
    scrollTo(0, 0);
  });
  return { pg, status: res ? res.status() : 0 };
}

async function settle(pg) {
  await pg.waitForTimeout(1200);
  for (let i = 0; i < 40; i++) {
    const n = await pg.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running'
      && a.effect && a.effect.getTiming().iterations !== Infinity && a.effect.getTiming().duration < 5000).length);
    if (!n) break;
    await pg.waitForTimeout(250);
  }
  await pg.evaluate(() => Promise.all([...document.images].filter((i) => !i.complete)
    .map((i) => new Promise((r) => { i.onload = i.onerror = r; setTimeout(r, 4000); }))));
  await pg.waitForTimeout(2500);
}

// Detects a login wall: password field on the page or 401/403.
async function isLocked(pg, status) {
  if (status === 401 || status === 403) return true;
  return pg.evaluate(() => !!document.querySelector('input[type=password]') && document.body.innerText.length < 4000);
}

module.exports = { parseArgs, launch, newContext, openSettled, settle, isLocked, VIEWPORTS };
