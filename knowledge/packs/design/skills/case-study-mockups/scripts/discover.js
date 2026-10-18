// Crawls a site and proposes pages, sections, logo and palette for the mockups.
// Usage: node discover.js --url https://site.com --out work/discover.json
//        [--auth user:pass] [--login-url URL --user U --pass P] [--max 25]
const fs = require('fs');
const path = require('path');
const { parseArgs, launch, newContext, openSettled, isLocked } = require('./lib');

const args = parseArgs(process.argv);
const base = new URL(args.url);
const auth = { basic: args.auth, loginUrl: args['login-url'], user: args.user, pass: args.pass };
const MAX = Number(args.max || 25);

function hex(rgb) {
  const m = rgb.match(/\d+(\.\d+)?/g); if (!m) return null;
  const [r, g, b, a = 1] = m.map(Number); if (a < 0.9) return null;
  return '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');
}
function hsl(h) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  const s = mx === mn ? 0 : (l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn));
  return { l, s };
}

(async () => {
  const browser = await launch();
  const ctx = await newContext(browser, 'd', auth);
  const { pg, status } = await openSettled(ctx, base.href);
  if (await isLocked(pg, status)) {
    fs.writeFileSync(args.out, JSON.stringify({ locked: true, status }, null, 2));
    console.log('LOCKED: the site asks for a login. Pass --auth user:pass or --login-url/--user/--pass.');
    await browser.close(); return;
  }

  const home = await pg.evaluate(() => {
    const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    const cand = [...document.querySelectorAll('header img, header svg, [class*=header] img, [class*=logo] img, img[class*=logo], [class*=logo] svg, a[rel=home] img, a[href="/"] img, a[href="/"] svg')]
      .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 15 && r.top < 200; });
    const logoEl = cand.find((e) => /logo/i.test(e.className?.baseVal ?? e.className) || /logo/i.test(e.alt || '') || /logo/i.test(e.parentElement?.className || '')) || cand[0];
    let logo = null;
    if (logoEl) {
      const r = logoEl.getBoundingClientRect();
      logo = { tag: logoEl.tagName.toLowerCase(), src: logoEl.currentSrc || logoEl.src || null,
        svg: logoEl.tagName.toLowerCase() === 'svg' ? logoEl.outerHTML : null, rect: { x: r.x, y: r.y + scrollY, w: r.width, h: r.height } };
    }
    // Weighted background colors and button colors.
    const area = {}; const btn = {};
    for (const e of document.querySelectorAll('body, body *')) {
      if (!vis(e)) continue; const cs = getComputedStyle(e); const r = e.getBoundingClientRect();
      if (cs.backgroundColor) area[cs.backgroundColor] = (area[cs.backgroundColor] || 0) + r.width * r.height;
      if (e.matches('a[class*=btn], a[class*=button], button, .btn, [class*=button]')) {
        btn[cs.backgroundColor] = (btn[cs.backgroundColor] || 0) + 1; btn[cs.color] = (btn[cs.color] || 0) + 0.5;
      }
    }
    const links = [...document.querySelectorAll('a[href]')].map((a) => a.href);
    const footer = document.querySelector('footer, .site-footer, [class*=footer]');
    let footerBg = null; if (footer) { let e = footer; while (e && (!getComputedStyle(e).backgroundColor || getComputedStyle(e).backgroundColor === 'rgba(0, 0, 0, 0)')) e = e.firstElementChild; if (e) footerBg = getComputedStyle(e).backgroundColor; }
    return { logo, area, btn, links, bodyBg: getComputedStyle(document.body).backgroundColor, footerBg };
  });

  // Candidate pages: same-origin links + sitemap.
  const urls = new Set([base.href]);
  for (const l of home.links) { try { const u = new URL(l); if (u.origin === base.origin && !/\.(pdf|jpg|png|webp|svg|zip)$/i.test(u.pathname) && !u.pathname.includes('wp-')) urls.add(u.origin + u.pathname); } catch (e) {} }
  for (const sm of ['/wp-sitemap.xml', '/sitemap.xml', '/sitemap_index.xml']) {
    try { const r = await pg.request.get(base.origin + sm); if (r.ok()) { const xml = await r.text(); for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) if (!/sitemap|\.xml$/.test(m[1])) urls.add(m[1]); } } catch (e) {}
  }
  await pg.close();

  const pages = [];
  for (const u of [...urls].slice(0, MAX)) {
    const p = await ctx.newPage();
    try { await p.goto(u, { waitUntil: 'domcontentloaded', timeout: 30000 }); await p.waitForTimeout(800); } catch (e) { await p.close(); continue; }
    const info = await p.evaluate(() => {
      const h1 = document.querySelector('h1')?.innerText.trim().replace(/\s+/g, ' ') || '';
      // Sections with repeated card-like children (img + heading) are good mockup material.
      const sections = [];
      for (const h of document.querySelectorAll('h2, h3')) {
        const sec = h.closest('section') || h.parentElement; if (!sec) continue;
        const cards = sec.querySelectorAll('article, li, [class*=card], [class*=item]');
        let withImg = 0; cards.forEach((c) => { if (c.querySelector('img') && c.querySelector('h2,h3,h4,a')) withImg++; });
        const r = sec.getBoundingClientRect();
        sections.push({ heading: h.innerText.trim().replace(/\s+/g, ' ').slice(0, 80), cards: withImg, height: Math.round(r.height), hasMap: !!sec.querySelector('svg [class*=map], [class*=map], iframe[src*=map]') });
      }
      const allCards = [...document.querySelectorAll('article, [class*=card]')].filter((c) => c.querySelector('img')).length;
      return { title: document.title, h1, sections: sections.filter((s) => s.heading).slice(0, 15), cards: allCards, length: document.body.innerText.length };
    });
    const depth = new URL(u).pathname.split('/').filter(Boolean).length;
    pages.push({ url: u, depth, ...info });
    await p.close();
  }

  // Palette: dark = darkest large/brand colour, light = lightest non-white bg, accent = most used saturated button colour.
  const areaHex = {}; for (const [c, a] of Object.entries(home.area)) { const h = hex(c); if (h) areaHex[h] = (areaHex[h] || 0) + a; }
  const btnHex = {}; for (const [c, n] of Object.entries(home.btn)) { const h = hex(c); if (h) btnHex[h] = (btnHex[h] || 0) + n; }
  const all = Object.keys({ ...areaHex, ...btnHex });
  const accent = Object.entries(btnHex).filter(([h]) => hsl(h).s > 0.25 && hsl(h).l > 0.2 && hsl(h).l < 0.8).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  const fb = home.footerBg && hex(home.footerBg);
  const dark = (fb && hsl(fb).l < 0.25 ? fb : null) || all.filter((h) => hsl(h).l < 0.2 && hsl(h).s < 0.35 && h !== '#000000').sort((a, b) => (areaHex[b] || 0) - (areaHex[a] || 0))[0] || null;
  const light = all.filter((h) => hsl(h).l > 0.88 && h !== '#ffffff').sort((a, b) => (areaHex[b] || 0) - (areaHex[a] || 0))[0] || null;

  const out = { site: base.origin, logo: home.logo, palette: { dark, light, accent }, colorAreas: areaHex, buttonColors: btnHex, pages };
  fs.mkdirSync(path.dirname(args.out), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(out, null, 2));
  console.log(`OK pages=${pages.length} logo=${!!home.logo} dark=${dark} light=${light} accent=${accent}`);
  await browser.close();
})();
