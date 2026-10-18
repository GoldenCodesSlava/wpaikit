// Captures the screenshots listed in a plan file.
// Usage: node capture.js --plan work/plan.json --out work/shots
//        [--auth user:pass] [--login-url URL --user U --pass P]
// plan.json: { "site": "https://site.com", "shots": [
//   { "key": "home",  "path": "/",          "vp": "d" },            // viewport shot from the top
//   { "key": "map",   "path": "/",          "vp": "d", "heading": "Discover our treasures" },
//   { "key": "list",  "path": "/museums/",  "vp": "t" },            // tablet 834 px
//   { "key": "p1",    "path": "/journeys/", "vp": "m", "offset": 0 } // mobile, optional scroll offset in css px
// ]}
// Writes <key>-<vp>.png and meta.json (header logo and hero rectangles of every viewport shot).
const fs = require('fs');
const path = require('path');
const { parseArgs, launch, newContext, openSettled, settle, isLocked } = require('./lib');

const args = parseArgs(process.argv);
const plan = JSON.parse(fs.readFileSync(args.plan, 'utf8'));
const auth = { basic: args.auth, loginUrl: args['login-url'], user: args.user, pass: args.pass };
fs.mkdirSync(args.out, { recursive: true });

(async () => {
  const browser = await launch();
  const meta = {};
  for (const vp of ['d', 't', 'm']) {
    const shots = plan.shots.filter((s) => s.vp === vp);
    if (!shots.length) continue;
    const ctx = await newContext(browser, vp, auth);
    for (const s of shots) {
      const url = new URL(s.path, plan.site).href;
      const { pg, status } = await openSettled(ctx, url);
      if (await isLocked(pg, status)) { console.log(`LOCKED ${s.key}: ${url}`); await pg.close(); continue; }
      let y = s.offset || 0;
      if (s.heading) {
        y = await pg.evaluate((h) => {
          const norm = (t) => t.trim().replace(/\s+/g, ' ').toLowerCase();
          const el = [...document.querySelectorAll('h1,h2,h3')].find((e) => norm(e.innerText).startsWith(norm(h)));
          if (!el) return -1;
          const top = (el.closest('section') || el).getBoundingClientRect().top + scrollY;
          // Keep the section right under a sticky/fixed header so no strip of the previous block shows.
          let hb = 0; for (const e of document.querySelectorAll('header, [class*=header]')) { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); if ((cs.position === 'fixed' || cs.position === 'sticky') && r.top <= 1 && r.height < 200) hb = Math.max(hb, r.bottom); }
          return Math.max(0, top - (hb ? hb + 16 : 0));
        }, s.heading);
        if (y < 0) { console.log(`MISS ${s.key}: heading "${s.heading}" not found on ${url}`); await pg.close(); continue; }
      }
      await pg.evaluate((y) => scrollTo(0, y), y);
      await settle(pg);
      const file = path.join(args.out, `${s.key}-${vp}.png`);
      await pg.screenshot({ path: file });
      if (s.full) await pg.screenshot({ path: path.join(args.out, `${s.key}-${vp}-full.png`), fullPage: true });
      meta[`${s.key}-${vp}`] = await pg.evaluate(() => {
        const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 15 && r.bottom > 0 && r.top < innerHeight; };
        const logo = [...document.querySelectorAll('header img, header svg, [class*=logo] img, img[class*=logo], [class*=logo] svg, a[rel=home] img')].find(vis);
        // Hero: the widest large block that starts in the first screen below the header.
        const hero = [...document.querySelectorAll('section, [class*=hero], main > div')].filter(vis)
          .map((e) => ({ e, r: e.getBoundingClientRect() }))
          .filter(({ r }) => r.top < 260 && r.height > 300 && r.width > innerWidth * 0.6)
          .sort((a, b) => a.r.top - b.r.top)[0];
        // Inner visual of the hero (rounded image card) if it is inset from the section edges.
        let heroBox = hero ? hero.r : null;
        if (hero) {
          const inner = [...hero.e.querySelectorAll('*')].map((e) => ({ e, r: e.getBoundingClientRect(), cs: getComputedStyle(e) }))
            .filter(({ r, cs }) => r.width > innerWidth * 0.5 && r.height > 250 && (cs.backgroundImage !== 'none' || cs.borderRadius !== '0px' || cs.overflow === 'hidden'))
            .sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height)[0];
          if (inner) heroBox = inner.r;
        }
        const pick = (r) => r && { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom };
        return { viewport: { w: innerWidth, h: innerHeight }, logo: pick(logo && logo.getBoundingClientRect()), hero: pick(heroBox) };
      });
      console.log(`OK ${s.key}-${vp}`);
      await pg.close();
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(args.out, 'meta.json'), JSON.stringify(meta, null, 2));
  await browser.close();
})();
