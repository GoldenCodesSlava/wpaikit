// Renders the mockup templates to PNG at 3x.
// Usage: node render.js --config work/config.json --out work/out [--only A,C]
// config.json: { "work": "/abs/work", "domain": "site.com", "palette": {...}, "logo": {...},
//   "slots": {...}, "renders": [ { "template": "A", "file": "overview.png" }, ... ] }
const fs = require('fs');
const path = require('path');
const { parseArgs, launch } = require('./lib');

const args = parseArgs(process.argv);
const cfg = JSON.parse(fs.readFileSync(args.config, 'utf8'));
cfg.meta = cfg.meta || JSON.parse(fs.readFileSync(path.join(cfg.work, 'shots', 'meta.json'), 'utf8'));
const only = args.only ? args.only.split(',') : null;
const SIZES = { A: [1312, 940], B: [1312, 720], C: [644, 556], D: [644, 556] };
fs.mkdirSync(args.out, { recursive: true });

(async () => {
  const browser = await launch();
  for (const r of cfg.renders) {
    if (only && !only.includes(r.template)) continue;
    const [w, h] = SIZES[r.template];
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 3 });
    await page.addInitScript((c) => { window.CONFIG = c; }, { ...cfg, slots: { ...cfg.slots, ...(r.slots || {}) }, template: r.template, work: 'file://' + cfg.work });
    await page.goto('file://' + path.join(__dirname, '..', 'templates', 'compose.html'));
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(args.out, r.file) });
    console.log('OK', r.file);
    await page.close();
  }
  await browser.close();
})();
