// Shared helpers: argument parsing and a headless Chrome for rendering.
const { chromium } = require('playwright-core');
const fs = require('fs');

const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

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

module.exports = { parseArgs, launch };
