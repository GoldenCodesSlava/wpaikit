// Wraps mobile screenshots into 393x852 iPhone screens with a status bar.
// Usage: node screens.js --work /abs/work --keys home,map,pastport
const path = require('path');
const fs = require('fs');
const { parseArgs, launch } = require('./lib');
const args = parseArgs(process.argv);
(async () => {
  const b = await launch();
  const p = await b.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 3 });
  fs.mkdirSync(path.join(args.work, 'devices'), { recursive: true });
  for (const k of args.keys.split(',')) {
    const src = 'file://' + path.join(args.work, 'shots', `${k}-m.png`);
    await p.goto('file://' + path.join(__dirname, '..', 'templates', 'screen.html') + '?src=' + encodeURIComponent(src));
    await p.waitForLoadState('networkidle');
    await p.screenshot({ path: path.join(args.work, 'devices', `scr-${k}.png`) });
    console.log('OK', k);
  }
  await b.close();
})();
