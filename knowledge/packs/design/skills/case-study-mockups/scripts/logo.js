// Downloads the site logo and renders it to a transparent high-res PNG (work/logo/logo-full.png).
// Usage: node logo.js --work /abs/work --src <logo url> [--auth user:pass]
const fs = require('fs');
const path = require('path');
const { parseArgs, launch } = require('./lib');
const args = parseArgs(process.argv);
(async () => {
  const dir = path.join(args.work, 'logo'); fs.mkdirSync(dir, { recursive: true });
  const b = await launch();
  const opts = {}; if (args.auth) { const [u, ...p] = args.auth.split(':'); opts.httpCredentials = { username: u, password: p.join(':') }; }
  const ctx = await b.newContext(opts);
  const res = await ctx.request.get(args.src);
  const buf = await res.body();
  const ext = /svg/.test(res.headers()['content-type'] || args.src) ? 'svg' : 'png';
  const file = path.join(dir, 'logo-src.' + ext); fs.writeFileSync(file, buf);
  const page = await ctx.newPage({ viewport: { width: 2400, height: 1200 } });
  await page.setContent(`<body style="margin:0;background:transparent"><img id="l" src="data:${ext === 'svg' ? 'image/svg+xml' : 'image/png'};base64,${buf.toString('base64')}" style="height:800px;width:auto;display:block"></body>`);
  await page.waitForTimeout(300);
  await page.locator('#l').screenshot({ path: path.join(dir, 'logo-full.png'), omitBackground: true });
  console.log('OK', file);
  await b.close();
})();
