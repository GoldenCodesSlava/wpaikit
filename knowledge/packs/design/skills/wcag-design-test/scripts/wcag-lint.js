// wcag-lint.js — read-only WCAG 2.2 checks for one Figma frame. Run as a use_figma script (raw
// Plugin API, top-level await/return). Edit CONFIG only. The audited frame is never modified; text
// over images is measured on a temporary off-canvas probe frame that is removed in `finally`.
// tokens: optional [{ name, hex }] from .wpaikit/design-system.json; local and bound Variables are read automatically.
const CONFIG = { rootId: 'ROOT_ID', level: 'AA', probeImages: true, tokens: [] };

// ---------- colour ----------
const WHITE = { r: 1, g: 1, b: 1 }, BLACK = { r: 0, g: 0, b: 0 };
const lin = c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const mix = (fg, bg, a) => ({ r: a * fg.r + (1 - a) * bg.r, g: a * fg.g + (1 - a) * bg.g, b: a * fg.b + (1 - a) * bg.b });
const hex = c => '#' + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
const r2 = x => Math.round(x * 100) / 100;
const AAA = CONFIG.level === 'AAA';
const textThreshold = large => (AAA ? (large ? 4.5 : 7) : (large ? 3 : 4.5));

// ---------- colour fixes: OKLab distance, OKLCH lightness search ----------
const toLinS = c => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const fromLinS = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
function toOklab(c) { const r = toLinS(c.r), g = toLinS(c.g), b = toLinS(c.b);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return { L: 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s, a: 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, b: 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s }; }
function oklchToRgb(L, C, h) {
  for (let k = 0; k < 40; k++, C *= 0.9) { const A = C * Math.cos(h), B = C * Math.sin(h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3, m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3, s = (L - 0.0894841775 * A - 1.2914855480 * B) ** 3;
    const lr = [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s];
    if (lr.every(v => v >= -1e-4 && v <= 1.0001)) { const [r, g, b] = lr.map(v => fromLinS(Math.min(1, Math.max(0, v)))); return { r, g, b }; } }
  const v = fromLinS(Math.min(1, Math.max(0, L ** 3))); return { r: v, g: v, b: v }; }
const snap = c => ({ r: Math.round(c.r * 255) / 255, g: Math.round(c.g * 255) / 255, b: Math.round(c.b * 255) / 255 });
const dE = (x, y) => { const a = toOklab(x), b = toOklab(y); return 100 * Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b); };
// Closest colour (same hue and chroma where the gamut allows) that satisfies ok(); null if neither black nor white side can.
function nearestPassing(orig, ok) {
  const o = toOklab(orig), C = Math.hypot(o.a, o.b), h = Math.atan2(o.b, o.a); let best = null;
  for (const end of [0, 1]) { if (!ok(snap(oklchToRgb(end, C, h)))) continue;
    let lo = o.L, hi = end; for (let i = 0; i < 28; i++) { const mid = (lo + hi) / 2; if (ok(snap(oklchToRgb(mid, C, h)))) hi = mid; else lo = mid; }
    const col = snap(oklchToRgb(hi, C, h)); if (!ok(col)) continue; const d = dE(orig, col); if (!best || d < best.d) best = { color: col, d }; }
  return best; }

// ---------- PNG decode (no DecompressionStream in the plugin sandbox) ----------
const LB=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258], LE=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
const DB=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577], DE=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
function inflate(src, size) {
  let pos = 2, bb = 0, bc = 0, op = 0; const out = new Uint8Array(size);
  const bits = n => { while (bc < n) { bb |= src[pos++] << bc; bc += 8; } const v = bb & ((1 << n) - 1); bb >>>= n; bc -= n; return v; };
  const build = (lens, n) => { const count = new Uint16Array(16), sym = new Uint16Array(n), offs = new Uint16Array(16);
    for (let i = 0; i < n; i++) count[lens[i]]++; count[0] = 0; for (let i = 1; i < 16; i++) offs[i] = offs[i-1] + count[i-1];
    for (let i = 0; i < n; i++) if (lens[i]) sym[offs[lens[i]]++] = i; return { count, sym }; };
  const dec = h => { let code = 0, first = 0, index = 0; for (let len = 1; len < 16; len++) { code |= bits(1); const c = h.count[len];
    if (code - c < first) return h.sym[index + (code - first)]; index += c; first += c; first <<= 1; code <<= 1; } throw new Error('png: bad code'); };
  const fl = new Uint8Array(288); fl.fill(8, 0, 144); fl.fill(9, 144, 256); fl.fill(7, 256, 280); fl.fill(8, 280, 288);
  const FL = build(fl, 288), FD = build(new Uint8Array(30).fill(5), 30), ORD = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
  let last; do { last = bits(1); const type = bits(2);
    if (type === 0) { bb = 0; bc = 0; const len = src[pos] | (src[pos+1] << 8); pos += 4; out.set(src.subarray(pos, pos + len), op); pos += len; op += len; continue; }
    let L = FL, D = FD;
    if (type === 2) { const hl = bits(5) + 257, hd = bits(5) + 1, hc = bits(4) + 4; const cl = new Uint8Array(19); for (let i = 0; i < hc; i++) cl[ORD[i]] = bits(3);
      const CL = build(cl, 19), lens = new Uint8Array(hl + hd);
      for (let i = 0; i < hl + hd;) { const s = dec(CL); if (s < 16) lens[i++] = s; else if (s === 16) { const p = lens[i-1], r = 3 + bits(2); for (let k = 0; k < r; k++) lens[i++] = p; } else if (s === 17) i += 3 + bits(3); else i += 11 + bits(7); }
      L = build(lens.subarray(0, hl), hl); D = build(lens.subarray(hl), hd); }
    for (;;) { const s = dec(L); if (s < 256) out[op++] = s; else if (s === 256) break;
      else { const li = s - 257, len = LB[li] + bits(LE[li]), di = dec(D), dist = DB[di] + bits(DE[di]); for (let k = 0; k < len; k++, op++) out[op] = out[op - dist]; } }
  } while (!last);
  return out;
}
function decodePNG(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); let p = 8, w, h, ct; const idat = []; let tot = 0;
  while (p < bytes.length) { const len = dv.getUint32(p), t = String.fromCharCode(...bytes.subarray(p+4, p+8));
    if (t === 'IHDR') { w = dv.getUint32(p+8); h = dv.getUint32(p+12); ct = bytes[p+17]; } if (t === 'IDAT') { idat.push(bytes.subarray(p+8, p+8+len)); tot += len; } p += 12 + len; }
  const z = new Uint8Array(tot); let o = 0; for (const c of idat) { z.set(c, o); o += c.length; }
  const bpp = ct === 6 ? 4 : 3, st = w * bpp, raw = inflate(z, (st + 1) * h), px = new Uint8Array(st * h);
  for (let y = 0; y < h; y++) { const f = raw[y * (st + 1)], ri = y * (st + 1) + 1, oi = y * st;
    for (let x = 0; x < st; x++) { const a = x >= bpp ? px[oi+x-bpp] : 0, b = y ? px[oi-st+x] : 0, c = (x >= bpp && y) ? px[oi-st+x-bpp] : 0; let v = raw[ri+x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      px[oi+x] = v & 255; } }
  return { w, h, bpp, px };
}

// ---------- tree helpers ----------
const root = await figma.getNodeByIdAsync(CONFIG.rootId);
if (!root || !('findAll' in root)) throw new Error(`Node ${CONFIG.rootId} is not a frame`);
if (['PAGE', 'SECTION', 'COMPONENT_SET'].includes(root.type)) throw new Error(`${root.type} "${root.name}" — pick one frame: ${root.children.slice(0, 25).map(c => `${c.id} ${c.name}`).join('; ')}`);
let rootPage = root; while (rootPage.type !== 'PAGE') rootPage = rootPage.parent;
await figma.setCurrentPageAsync(rootPage);
const pageBg = (() => { const pg = rootPage.backgrounds?.find(b => b.type === 'SOLID' && b.visible !== false); return pg ? pg.color : WHITE; })();
const shown = n => { for (let x = n; x && x.type !== 'PAGE'; x = x.parent) { if (x.visible === false || x.opacity === 0) return false; if (x.id === root.id) break; } return true; };
const pathOf = n => { const parts = []; for (let x = n; x && x.id !== root.id && x.type !== 'PAGE'; x = x.parent) parts.unshift(x.name); return parts.join(' / '); };
const box = n => n.absoluteBoundingBox || { x: n.x, y: n.y, width: n.width, height: n.height };
const bboxOut = n => { const b = box(n), rb = box(root); return { x: Math.round(b.x - rb.x), y: Math.round(b.y - rb.y), w: Math.round(b.width), h: Math.round(b.height) }; };
const area = b => Math.max(0, b.width) * Math.max(0, b.height);
const overlap = (a, b) => Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
const paintsOf = n => ('fills' in n && Array.isArray(n.fills)) ? n.fills.filter(p => p.visible !== false && (p.opacity ?? 1) > 0) : [];
const NORMAL = m => !m || m === 'NORMAL' || m === 'PASS_THROUGH';
const isGrad = p => p.type.startsWith('GRADIENT_');
const opaque = (paints, op) => op >= 0.999 && paints.some(p => NORMAL(p.blendMode) && (p.opacity ?? 1) >= 0.999 &&
  (p.type === 'SOLID' || p.type === 'IMAGE' || p.type === 'VIDEO' || (isGrad(p) && p.gradientStops.every(s => s.color.a >= 0.999))));

// Background stack under `node`: lower siblings covering >=90% of its box, then ancestor fills, until opaque.
function bgStack(node) {
  const b = box(node), layers = []; let cur = node, chain = node.opacity ?? 1, frozen = false, blend = !NORMAL(node.blendMode);
  const add = (n, paints, op) => { layers.push({ node: n, paints, opacity: op }); if (paints.some(p => !NORMAL(p.blendMode))) blend = true; frozen = true; return opaque(paints, op); };
  while (cur.parent && cur.parent.type !== 'PAGE' && cur.parent.type !== 'DOCUMENT') {
    const p = cur.parent, idx = p.children.indexOf(cur);
    for (let i = idx - 1; i >= 0; i--) { const s = p.children[i]; if (s.visible === false) continue;
      const sb = s.absoluteBoundingBox; if (!sb || overlap(sb, b) < 0.9 * area(b)) continue;
      const paints = paintsOf(s); if (!paints.length) continue; if (!NORMAL(s.blendMode)) blend = true;
      if (add(s, paints, s.opacity ?? 1)) return { layers, blend, textAlpha: chain }; }
    const pp = paintsOf(p); if (pp.length && add(p, pp, 1)) return { layers, blend, textAlpha: chain };
    if (!frozen) chain *= p.opacity ?? 1; cur = p;
  }
  layers.push({ node: null, paints: [{ type: 'SOLID', color: pageBg, opacity: 1 }], opacity: 1 });
  return { layers, blend, textAlpha: chain };
}
// Candidate background colours (exact for solids, stops for gradients, white/black bound for images).
function resolveBg(stack) {
  let c = null, image = false, video = false; const dedupe = arr => { const m = new Map(); arr.forEach(x => m.set(hex(x), x)); return [...m.values()].slice(0, 64); };
  for (let i = stack.layers.length - 1; i >= 0; i--) { const L = stack.layers[i];
    for (const p of L.paints) { const a = (p.opacity ?? 1) * L.opacity; let cols;
      if (p.type === 'SOLID') cols = [{ col: p.color, a }];
      else if (isGrad(p)) cols = p.gradientStops.map(s => ({ col: s.color, a: a * s.color.a }));
      else if (p.type === 'IMAGE' || p.type === 'VIDEO') { image = true; if (p.type === 'VIDEO') video = true; cols = [{ col: WHITE, a }, { col: BLACK, a }]; }
      else continue;
      const base = c || [WHITE]; c = dedupe(base.flatMap(bg => cols.map(k => k.a >= 0.999 ? { r: k.col.r, g: k.col.g, b: k.col.b } : mix(k.col, bg, k.a)))); } }
  return { cands: c || [WHITE], image, video };
}
const worstVs = (fgCols, bgCands, alpha) => { let min = Infinity, max = 0, fgW, bgW;
  for (const bg of bgCands) for (const fg of fgCols) { const r = ratio(mix(fg, bg, alpha), bg); if (r < min) { min = r; fgW = fg; bgW = bg; } if (r > max) max = r; }
  return { min, max, fg: fgW, bg: bgW }; };

async function probe(node, stack, fgCols) {
  const tb = box(node), f = figma.createFrame();
  try {
    f.name = '__wcag_probe'; f.x = -100000; f.y = -100000; f.resize(Math.max(1, Math.ceil(tb.width)), Math.max(1, Math.ceil(tb.height))); f.clipsContent = true; f.fills = [];
    for (let i = stack.layers.length - 1; i >= 0; i--) { const L = stack.layers[i], b = L.node ? box(L.node) : tb, r = figma.createRectangle(); f.appendChild(r);
      r.resize(Math.max(1, b.width), Math.max(1, b.height)); r.x = b.x - tb.x; r.y = b.y - tb.y; r.fills = L.paints; r.opacity = L.opacity;
      if (L.node && typeof L.node.cornerRadius === 'number') r.cornerRadius = L.node.cornerRadius; }
    const scale = Math.min(1, Math.sqrt(60000 / Math.max(1, tb.width * tb.height)));
    const d = decodePNG(await f.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: scale } })); const rs = [];
    for (let i = 0; i < d.px.length; i += d.bpp) { const a = d.bpp === 4 ? d.px[i+3] / 255 : 1;
      const bg = mix({ r: d.px[i] / 255, g: d.px[i+1] / 255, b: d.px[i+2] / 255 }, pageBg, a); let m = Infinity;
      for (const fg of fgCols) m = Math.min(m, ratio(mix(fg, bg, stack.textAlpha), bg)); rs.push(m); }
    rs.sort((x, y) => x - y); const q = k => rs[Math.floor(k * (rs.length - 1))];
    return { min: q(0), p5: q(0.05), median: q(0.5), n: rs.length };
  } finally { f.remove(); }
}

// ---------- results ----------
const findings = [], review = [], browserChecks = [], checked = {}, seen = new Set(), parentIds = {};
const noteParent = n => { if (n.parent) parentIds[n.id] = n.parent.id; };
const tick = (crit, ok) => { const c = checked[crit] || (checked[crit] = { checked: 0, failed: 0 }); c.checked++; if (!ok) c.failed++; };
const add = (crit, severity, node, observed, required, extra = {}) => { const k = `${crit}|${node.id}`; if (seen.has(k)) return; seen.add(k); noteParent(node);
  findings.push({ criterion: crit, severity, source: 'lint', nodeId: node.id, layerPath: pathOf(node) || node.name, observed, required, bbox: bboxOut(node), ...extra }); };
const addReview = (crit, node, reason, fix) => noteParent(node) || review.push({ criterion: crit, nodeId: node.id, layerPath: pathOf(node) || node.name, reason, bbox: bboxOut(node), ...(fix ? { fix: { summary: fix } } : {}) });

const all = root.findAll(() => true).filter(shown);
const texts = all.filter(n => n.type === 'TEXT');

// ---------- colour tokens: CONFIG.tokens, local COLOR Variables, Variables bound inside the frame ----------
const tokens = [];
{ const seenT = new Set(); const push = (name, c, scopes) => { const k = `${name}|${hex(c)}`; if (seenT.has(k)) return; seenT.add(k); tokens.push({ name, color: { r: c.r, g: c.g, b: c.b }, scopes: scopes && scopes.length ? scopes : ['ALL_SCOPES'] }); };
  for (const t of CONFIG.tokens || []) { const h = String(t.hex).replace('#', ''); if (/^[0-9a-f]{6}$/i.test(h)) push(t.name, { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 }); }
  const resolveVar = async (v, depth = 0) => { if (!v || depth > 5) return null; let mode = Object.keys(v.valuesByMode)[0];
    try { const col = await figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId); if (col && v.valuesByMode[col.defaultModeId] !== undefined) mode = col.defaultModeId; } catch (e) { /* remote collection */ }
    const val = v.valuesByMode[mode]; if (val && val.type === 'VARIABLE_ALIAS') return resolveVar(await figma.variables.getVariableByIdAsync(val.id), depth + 1);
    return val && typeof val === 'object' && 'r' in val ? val : null; };
  const vars = [];
  try { for (const c of await figma.variables.getLocalVariableCollectionsAsync()) for (const id of c.variableIds) vars.push(await figma.variables.getVariableByIdAsync(id)); } catch (e) { /* no access */ }
  const bound = new Set(); for (const n of all) for (const p of [...paintsOf(n), ...(('strokes' in n && Array.isArray(n.strokes)) ? n.strokes : [])]) if (p.boundVariables?.color?.id) bound.add(p.boundVariables.color.id);
  for (const id of bound) { try { vars.push(await figma.variables.getVariableByIdAsync(id)); } catch (e) { /* missing library */ } }
  for (const v of vars) if (v && v.resolvedType === 'COLOR') { const c = await resolveVar(v); if (c && (c.a ?? 1) >= 0.999) push(v.name, c, v.scopes); }
}
const SCOPE = { text: ['TEXT_FILL', 'ALL_FILLS'], fill: ['FRAME_FILL', 'SHAPE_FILL', 'ALL_FILLS'], stroke: ['STROKE_COLOR'] };
// Same colour family only: neutral for neutral, hue within 35° for chromatic — never swap a grey for a green.
const lch = c => { const o = toOklab(c); return { C: Math.hypot(o.a, o.b), h: Math.atan2(o.b, o.a) }; };
const sameFamily = (x, y) => { const a = lch(x), b = lch(y); if (a.C < 0.04 || b.C < 0.04) return a.C < 0.04 && b.C < 0.04;
  const d = Math.abs(a.h - b.h); return Math.min(d, 2 * Math.PI - d) <= 35 * Math.PI / 180; };
const nearestToken = (orig, ok, kind) => { let best = null;
  for (const t of tokens) { if (!(t.scopes.includes('ALL_SCOPES') || t.scopes.some(s => SCOPE[kind].includes(s))) || !sameFamily(orig, t.color) || !ok(t.color)) continue;
    const d = dE(orig, t.color); if (!best || d < best.d) best = { name: t.name, color: t.color, d }; }
  return best; };

// ---------- 1.4.3 / 1.4.6 text contrast, 1.4.1 links, 1.4.12, small text ----------
let unstyled = 0;
for (const t of texts) {
  if (!t.characters.trim()) continue;
  if (t.textStyleId === '') unstyled++;
  const segs = t.getStyledTextSegments(['fills', 'fontSize', 'fontWeight', 'textDecoration']);
  const stack = bgStack(t), bg = resolveBg(stack);
  let worst = null;
  for (const s of segs) {
    const paints = (s.fills || []).filter(p => p.visible !== false && (p.opacity ?? 1) > 0); if (!paints.length) continue;
    if (paints.some(p => !NORMAL(p.blendMode)) || stack.blend) { addReview('1.4.3', t, 'non-normal blend mode — check contrast on the screenshot'); worst = null; break; }
    const fg = paints.flatMap(p => p.type === 'SOLID' ? [p.color] : isGrad(p) ? p.gradientStops.map(x => x.color) : []); if (!fg.length) continue;
    const alpha = stack.textAlpha * Math.min(...paints.map(p => p.opacity ?? 1));
    const large = s.fontSize >= 24 || (s.fontSize >= 18.66 && s.fontWeight >= 700), thr = textThreshold(large);
    const w = worstVs(fg, bg.cands, alpha); const cand = { ...w, thr, large, size: s.fontSize, weight: s.fontWeight, fgCols: fg, alpha };
    if (!worst || w.min / thr < worst.min / worst.thr) worst = cand;
  }
  if (worst) {
    let { min, thr } = worst, method = bg.image ? 'bound' : 'exact', px = null;
    if (bg.image && min < thr && worst.max >= thr) {
      // Video fills cannot be copied into the probe (Plugin API) and have no stable pixels: bound only.
      if (CONFIG.probeImages && !bg.video) { px = await probe(t, stack, worst.fgCols); min = px.p5; method = 'pixels'; }
      else { addReview('1.4.3', t, bg.video ? 'text over video — only the white/black bound is known; check the poster frame on the screenshot' : 'text over image — pixel probe disabled'); continue; }
    }
    const ok = px ? px.p5 >= thr : min >= thr; tick(AAA ? '1.4.6' : '1.4.3', ok);
    if (!ok) {
      const sev = min < thr * 0.67 ? 'critical' : 'serious';
      const what = method === 'pixels' ? `text ${hex(worst.fg)} over image: p5 ${r2(px.p5)}:1, min ${r2(px.min)}:1, median ${r2(px.median)}:1`
        : `${hex(worst.alpha < 0.999 ? mix(worst.fg, worst.bg, worst.alpha) : worst.fg)}${worst.alpha < 0.999 ? ` (${hex(worst.fg)} at ${r2(worst.alpha)} opacity)` : ''} on ${hex(worst.bg)}${bg.cands.length > 1 ? ` (worst of ${bg.cands.length} ${bg.image ? 'bounds' : 'gradient stops'})` : ''} = ${r2(min)}:1`;
      add(AAA ? '1.4.6' : '1.4.3', sev, t, `${what}; ${r2(worst.size)}px/${worst.weight}${worst.large ? ' (large)' : ''}`, `>= ${thr}:1`,
        { metrics: { ratio: r2(min), threshold: thr, large: worst.large, method, fg: hex(worst.fg), bg: method === 'pixels' ? null : hex(worst.bg), alpha: r2(worst.alpha) },
          _ctx: { kind: 'text', fg: worst.fg, fgCols: worst.fgCols, alpha: worst.alpha, bgCands: bg.cands, image: bg.image, thr, bgNode: stack.layers[0] && stack.layers[0].node } });
    } else if (px && px.min < thr) {
      add('1.4.3', 'moderate', t, `text over image: p5 ${r2(px.p5)}:1 passes, but darkest/lightest spots reach ${r2(px.min)}:1`, `>= ${thr}:1 everywhere`,
        { metrics: { ...px, method }, _ctx: { kind: 'text', fg: worst.fg, fgCols: worst.fgCols, alpha: worst.alpha, bgCands: bg.cands, image: true, thr } });
    }
  }
  // 1.4.1 link distinguished only by colour
  const solidSegs = segs.filter(s => s.fills?.[0]?.type === 'SOLID');
  if (solidSegs.length > 1) {
    const len = s => s.end - s.start, main = solidSegs.reduce((a, b) => (len(a) >= len(b) ? a : b));
    for (const s of solidSegs) { if (s === main || hex(s.fills[0].color) === hex(main.fills[0].color)) continue;
      const cue = s.textDecoration === 'UNDERLINE' || Math.abs((s.fontWeight || 400) - (main.fontWeight || 400)) >= 200;
      const r = ratio(s.fills[0].color, main.fills[0].color), ok = cue || r >= 3; tick('1.4.1', ok);
      if (!ok) add('1.4.1', 'serious', t, `"${t.characters.slice(s.start, s.end)}" ${hex(s.fills[0].color)} vs text ${hex(main.fills[0].color)} = ${r2(r)}:1, no underline`, 'underline, or >= 3:1 against surrounding text',
        { _ctx: { kind: 'link', color: s.fills[0].color, textColor: main.fills[0].color, bgCands: bg.cands, link: t.characters.slice(s.start, s.end) } }); }
  }
  // 1.4.12 / 1.4.4 fixed text boxes, line height; small text
  if (t.textAutoResize === 'NONE') { tick('1.4.12', false); add('1.4.12', 'moderate', t, `fixed text box ${Math.round(t.width)}x${Math.round(t.height)} (textAutoResize NONE)`, 'hug height / min-height so spacing overrides and zoom do not clip', { alsoCriteria: ['1.4.4'], _ctx: { kind: 'autoresize' } }); }
  const fs = typeof t.fontSize === 'number' ? t.fontSize : Math.min(...segs.map(s => s.fontSize));
  const lh = t.lineHeight !== figma.mixed && t.lineHeight.unit !== 'AUTO' ? (t.lineHeight.unit === 'PIXELS' ? t.lineHeight.value : t.lineHeight.value / 100 * fs) : fs * 1.2;
  if (fs <= 20 && t.characters.length > 60 && t.height > lh * 1.8 && lh / fs < 1.5) add('1.4.12', 'advisory', t, `${r2(fs)}px text, line-height ${r2(lh)}px (${r2(lh / fs)})`, 'body line-height >= 1.5 recommended', { _ctx: { kind: 'lineheight', fs } });
  if (fs < 12) add('best-practice', 'advisory', t, `${r2(fs)}px text`, 'nothing below 12px; body >= 16px', { _ctx: { kind: 'smalltext', fs } });
  if (/\b(click|tap|press|select|use)\s+the\s+(red|green|blue|yellow|orange|purple|gr[ae]y|round|square|circular)\b|\b(green|red|blue) (button|link|icon)\b|\bon the (left|right)\b|\b(above|below) (button|link)\b/i.test(t.characters))
    add('1.3.3', 'moderate', t, `instruction relies on colour/shape/position: "${t.characters.slice(0, 80)}"`, 'refer to controls by their visible label', { _ctx: { kind: 'sensory', node: t } });
}
if (texts.length && unstyled / texts.length > 0.5) add('1.3.1', 'advisory', root, `${unstyled} of ${texts.length} text layers have no Text Style — heading levels are not encoded`, 'handoff: confirm the proposed h1–h3 map', { _ctx: { kind: 'styles' } });

// Duplicate H1-sized headings
const sized = texts.filter(t => typeof t.fontSize === 'number' && t.characters.length <= 120);
const maxFs = Math.max(0, ...sized.map(t => t.fontSize));
const h1s = sized.filter(t => t.fontSize === maxFs && maxFs >= 32).sort((a, b) => box(a).y - box(b).y);
h1s.slice(1).forEach(t => add('1.3.1', 'moderate', t, `styled like the H1 (${maxFs}px) — "${t.characters.slice(0, 40)}" after "${h1s[0].characters.slice(0, 40)}"`, 'one H1 per page; section headings as H2', { alsoCriteria: ['2.4.6'], _ctx: { kind: 'h1' } }));
const bodyFs = (m => +Object.keys(m).sort((x, y) => m[y] - m[x])[0] || 16)(texts.reduce((m, t) => { if (typeof t.fontSize === 'number' && t.characters.length > 40) m[t.fontSize] = (m[t.fontSize] || 0) + 1; return m; }, {}));
const headingCandidates = sized.filter(t => t.fontSize >= Math.max(20, bodyFs * 1.5) || (t.fontSize >= 24 && (t.fontWeight === figma.mixed || t.fontWeight >= 600))).sort((a, b) => box(a).y - box(b).y)
  .map(t => ({ nodeId: t.id, text: t.characters.slice(0, 60), size: t.fontSize }));

// ---------- interactive targets ----------
const RX = /\b(button|btn|link|input|field|textarea|select|dropdown|checkbox|radio|switch|toggle|thumb|handle|tab|chip|dot|bullet|pagination|close|prev|next|previous|pause|play|arrow|menu|hamburger|search)\b/i;
const FIELD = /\b(input|field|textarea|select|dropdown)\b/i, CHECK = /\b(checkbox|radio|switch|toggle)\b/i, THUMB = /\b(thumb|handle|knob)\b/i, INDIC = /\b(dot|bullet|range|progress|indicator|active|selected)\b/i;
const solidStroke = n => { const s = ('strokes' in n && Array.isArray(n.strokes)) ? n.strokes.find(p => p.visible !== false && p.type === 'SOLID') : null;
  return s && (typeof n.strokeWeight !== 'number' || n.strokeWeight > 0) ? s.color : null; };
const matchedSelf = async n => { if (n.type === 'TEXT') return /\blink\b/i.test(n.name) && n.characters.length <= 40;
  if (!['FRAME', 'INSTANCE', 'COMPONENT', 'ELLIPSE', 'RECTANGLE', 'GROUP'].includes(n.type)) return false;
  if (RX.test(n.name)) return true;
  if (n.type === 'INSTANCE') { const mc = await n.getMainComponentAsync(); const nm = mc ? (mc.parent?.type === 'COMPONENT_SET' ? mc.parent.name : mc.name) : ''; return RX.test(nm); }
  return false; };
const cand = []; for (const n of all) if (await matchedSelf(n)) cand.push(n);
// Unnamed controls by shape (marked * in `targets`): one short label on a filled/stroked box = button; placeholder-like text in a wide box = field; small stroked square = checkbox.
const named = new Set(cand.map(n => n.id)), shaped = new Map();
const nearNamed = n => { for (let p = n.parent; p && p.id !== root.id; p = p.parent) if (named.has(p.id)) return true; return n.findAll(d => named.has(d.id)).length > 0; };
for (const n of all) { if (!['FRAME', 'INSTANCE', 'COMPONENT'].includes(n.type) || named.has(n.id)) continue;
  const tx = n.findAll(d => d.type === 'TEXT' && shown(d)), st = solidStroke(n), fl = paintsOf(n).some(p => p.type === 'SOLID'), w = n.width, h = n.height; let k = null;
  if (!tx.length && st && w >= 12 && w <= 24 && Math.abs(w - h) < 2) k = 'check';
  else if (tx.length === 1 && (st || fl) && h >= 28 && h <= 72) { const s = tx[0].characters.trim();
    if (w >= 160 && (/@|\b(your|enter|search|email|e-mail|name|phone|password)\b/i.test(s) || tx[0].opacity < 0.8)) k = 'field';
    else if (s.length <= 30 && w <= 360 && (n.cornerRadius === figma.mixed || n.cornerRadius > 0 || st)) k = 'button'; }
  if (k && !nearNamed(n)) { shaped.set(n.id, k); cand.push(n); } }
const candIds = new Set(cand.map(n => n.id)), innerOf = n => ('findAll' in n) ? n.findAll(d => candIds.has(d.id)) : [];
const glyph = n => n.type !== 'TEXT' && n.width <= 24 && n.height <= 24 && !(('findAll' in n) && n.findAll(d => d.type === 'TEXT').length);
// Innermost match wins, except a small icon button: the button (<= 64px) wins over its single icon.
const wrapper = n => n.width <= 64 && n.height <= 64 && (i => i.length === 1 && glyph(i[0]))(innerOf(n));
// An icon inside a labelled button (filled/stroked box, one short label, <= 72px tall) is decoration, not a target.
const deco = n => { const p = n.parent; if (n.type === 'TEXT' || n.width > 48 || n.height > 48 || !p || !('findAll' in p) || p.height > 72 || (('findAll' in n) && n.findAll(d => d.type === 'TEXT').length)) return false;
  const tx = p.findAll(d => d.type === 'TEXT' && shown(d)); return tx.length === 1 && tx[0].characters.trim().length <= 40 && (paintsOf(p).some(x => x.type === 'SOLID') || !!solidStroke(p)); };
const targets = cand.filter(n => { if (deco(n)) return false; if (innerOf(n).length) return wrapper(n); for (let p = n.parent; p && p.id !== root.id; p = p.parent) if (candIds.has(p.id) && wrapper(p)) return false; return true; });
const kindOf = n => { if (shaped.has(n.id)) return shaped.get(n.id); const nm = n.name; if (THUMB.test(nm)) return 'thumb'; if (CHECK.test(nm)) return 'check'; if (FIELD.test(nm)) return 'field';
  if ((n.type === 'ELLIPSE' || n.type === 'RECTANGLE') && INDIC.test(nm)) return 'indicator';
  if (n.type === 'TEXT') return 'link';
  const hasText = ('findAll' in n) ? n.findAll(d => d.type === 'TEXT').length > 0 : false; const hasShape = ('findAll' in n) ? n.findAll(d => ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE'].includes(d.type)).length > 0 : false;
  return !hasText && hasShape ? 'icon' : 'button'; };
const outerBg = n => resolveBg(bgStack(n)).cands;
const minVs = (c, cands) => Math.min(...cands.map(b => ratio(c, b)));
// State indicators (selected range, active dot, progress) against the area around them, not the track under them.
const checkIndicator = n => { const fill = paintsOf(n).find(p => p.type === 'SOLID'); if (!fill || !n.parent) return;
  const bg = outerBg(n.parent), r = minVs(fill.color, bg), ok = r >= 3; tick('1.4.11', ok);
  if (!ok) add('1.4.11', 'moderate', n, `state indicator ${hex(fill.color)} on ${hex(bg[0])} = ${r2(r)}:1`, '>= 3:1 for state indicators', { metrics: { ratio: r2(r) }, _ctx: { kind: 'nontext', part: 'indicator fill', color: fill.color, bgCands: bg, scope: 'fill' } }); };
for (const n of all.filter(x => (x.type === 'ELLIPSE' || x.type === 'RECTANGLE') && INDIC.test(x.name) && !targets.includes(x))) checkIndicator(n);

for (const n of targets) {
  const k = kindOf(n);
  // 1.4.11 non-text contrast
  if (k === 'field' || k === 'check' || k === 'thumb') {
    const bg = outerBg(n), st = solidStroke(n), fill = paintsOf(n).find(p => p.type === 'SOLID');
    const rs = [st ? minVs(st, bg) : 1, fill ? minVs(fill.color, bg) : 1], best = Math.max(...rs), ok = best >= 3; tick('1.4.11', ok);
    if (!ok) add('1.4.11', 'serious', n, `boundary: ${st ? `border ${hex(st)}` : 'no border'}${fill ? `, fill ${hex(fill.color)}` : ''} on ${hex(bg[0])} — best ${r2(best)}:1`, '>= 3:1 for the control boundary',
      { metrics: { ratio: r2(best) }, _ctx: { kind: 'nontext', part: st ? 'border' : 'border (new, 1px)', color: st || (fill ? fill.color : bg[0]), bgCands: bg, scope: 'stroke' } });
  } else if (k === 'icon') {
    const vec = n.findAll(d => ['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE', 'ELLIPSE', 'RECTANGLE'].includes(d.type) && shown(d))
      .map(d => ({ d, c: solidStroke(d) || paintsOf(d).find(p => p.type === 'SOLID')?.color })).find(x => x.c);
    if (vec) { const bg = resolveBg(bgStack(vec.d)).cands, r = minVs(vec.c, bg), ok = r >= 3; tick('1.4.11', ok);
      if (!ok) add('1.4.11', 'serious', n, `icon ${hex(vec.c)} on ${hex(bg[0])} = ${r2(r)}:1`, '>= 3:1 for meaningful icons', { metrics: { ratio: r2(r) }, _ctx: { kind: 'nontext', part: 'icon colour', color: vec.c, bgCands: bg, scope: 'stroke' } }); }
  } else if (k === 'indicator') checkIndicator(n);
  // 2.4.7 focus state designed?
  if (n.type === 'INSTANCE') { const mc = await n.getMainComponentAsync(); const owner = mc?.parent?.type === 'COMPONENT_SET' ? mc.parent : mc;
    if (owner) { const variants = owner.type === 'COMPONENT_SET' ? owner.children.map(c => c.name).join(', ') : owner.name; const ok = /focus/i.test(variants); tick('2.4.7', ok);
      if (!ok) add('2.4.7', 'serious', owner, `component "${owner.name}" has no Focus variant (${variants || 'no variants'})`, 'design a visible focus state (>= 2px, >= 3:1)',
        { usedBy: n.id, _ctx: { kind: 'focus', bgCands: outerBg(n), fill: paintsOf(owner.type === 'COMPONENT_SET' ? owner.defaultVariant : owner).find(p => p.type === 'SOLID')?.color } }); } }
  else browserChecks.push({ nodeId: n.id, layerPath: pathOf(n), check: 'focus state not designed in Figma — verify in the browser' });
}
// 2.5.8 target size with the 24px spacing exception
const T = targets.map(n => ({ n, b: box(n) })).filter(x => !(x.n.type === 'TEXT' && x.n.characters.length > 40));
const ctr = b => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
const circleHitsBox = (c, b) => { const dx = Math.max(b.x - c.x, 0, c.x - (b.x + b.width)), dy = Math.max(b.y - c.y, 0, c.y - (b.y + b.height)); return dx * dx + dy * dy < 144; };
for (const t of T) {
  const small = t.b.width < 24 || t.b.height < 24; if (!small) { tick('2.5.8', true); continue; }
  const c = ctr(t.b);
  const clash = T.find(o => o !== t && (circleHitsBox(c, o.b) || ((o.b.width < 24 || o.b.height < 24) && Math.hypot(ctr(o.b).x - c.x, ctr(o.b).y - c.y) < 24)));
  tick('2.5.8', !clash);
  const tctx = { kind: 'target', w: Math.round(t.b.width), h: Math.round(t.b.height) };
  if (clash) add('2.5.8', 'serious', t.n, `${tctx.w}x${tctx.h} target; 24px circle overlaps "${clash.n.name}"`, '>= 24x24, or 24px spacing between undersized targets',
    { _ctx: { ...tctx, clash: { name: clash.n.name, undersized: clash.b.width < 24 || clash.b.height < 24, dist: Math.hypot(ctr(clash.b).x - c.x, ctr(clash.b).y - c.y) } } });
  else if (t.b.width < 24 && t.b.height < 24) add('2.5.5', 'advisory', t.n, `${tctx.w}x${tctx.h} target — passes 2.5.8 only via the spacing exception`, '44x44 recommended (2.5.5 AAA)', { _ctx: { ...tctx, aaa: true } });
}
// 3.3.2 labels, 3.3.1 error only by colour
const isRed = c => c && c.r > 0.75 && c.g < 0.45 && c.b < 0.45;
for (const n of targets.filter(x => kindOf(x) === 'field')) {
  const b = box(n), sibs = n.parent ? n.parent.children.filter(s => s !== n && s.type === 'TEXT' && shown(s)) : [];
  const near = s => { const sb = box(s); const above = sb.y + sb.height <= b.y + 2 && b.y - (sb.y + sb.height) <= 24 && sb.x < b.x + b.width && sb.x + sb.width > b.x;
    const left = sb.x + sb.width <= b.x + 2 && b.x - (sb.x + sb.width) <= 24 && sb.y < b.y + b.height && sb.y + sb.height > b.y; return above || left; };
  const label = sibs.find(s => near(s) && s.characters.trim().length <= 40);
  const inner = ('findAll' in n) ? n.findAll(d => d.type === 'TEXT') : [];
  tick('3.3.2', !!label);
  if (!label) { const example = sibs.find(s => s.characters.trim().length <= 40 && typeof s.fontSize === 'number' && targets.some(o => { if (o === n || !FIELD.test(o.name)) return false;
      const ob = box(o), sb = box(s); return sb.y + sb.height <= ob.y + 2 && ob.y - (sb.y + sb.height) <= 24 && sb.x < ob.x + ob.width && sb.x + sb.width > ob.x; }));
    add('3.3.2', 'critical', n, inner.length ? `no visible label; only placeholder "${inner[0].characters.slice(0, 30)}"` : 'no visible label', 'persistent visible label above or beside the field',
      { _ctx: { kind: 'label', placeholder: inner[0] ? inner[0].characters.slice(0, 30) : '', example: example ? { name: example.name, text: example.characters, size: example.fontSize, weight: example.fontWeight } : null } }); }
  const st = solidStroke(n);
  if (isRed(st)) { const msg = sibs.find(s => { const sb = box(s); return sb.y >= b.y + b.height - 2 && sb.y - (b.y + b.height) <= 24 &&
      (/error|invalid|required|must|enter|please|incorrect|ошиб|обязат|eroare|obligatoriu/i.test(s.characters) || isRed(paintsOf(s).find(p => p.type === 'SOLID')?.color)); });
    tick('3.3.1', !!msg); if (!msg) add('3.3.1', 'critical', n, `error shown only by a red border ${hex(st)}; no error text`, 'identify the error in text next to the field', { alsoCriteria: ['1.4.1'], _ctx: { kind: 'error', stroke: st, bgCands: outerBg(n) } }); }
}
// ---------- 1.3.2 reading order in frames without auto layout ----------
for (const f of all.filter(n => ['FRAME', 'GROUP', 'COMPONENT', 'INSTANCE'].includes(n.type) && (n.type === 'GROUP' || n.layoutMode === 'NONE'))) {
  const kids = f.children.filter(c => shown(c) && ['FRAME', 'TEXT', 'INSTANCE', 'COMPONENT', 'GROUP'].includes(c.type) && c.layoutPositioning !== 'ABSOLUTE' && (c.type === 'TEXT' || c.findAll(d => d.type === 'TEXT').length));
  if (kids.length < 2) continue;
  const vis = [...kids].sort((a, b) => { const A = box(a), B = box(b); return Math.abs(A.y - B.y) < Math.min(A.height, B.height) / 2 ? A.x - B.x : A.y - B.y; });
  const ok = vis.every((k, i) => k === kids[i]); tick('1.3.2', ok);
  if (!ok) add('1.3.2', 'moderate', f, `layer order ${kids.map(k => k.name).join(', ')}; visual order ${vis.map(k => k.name).join(', ')}`, 'layer order = reading order (or auto layout)', { _ctx: { kind: 'order', order: vis.map(k => k.name), frame: f.name } });
}
// ---------- review hints for the screenshot pass ----------
const CAROUSEL = /\b(carousel|slider|swiper|slideshow|gallery)\b/i;
const outerCarousels = all.filter(x => ['FRAME', 'GROUP', 'INSTANCE', 'COMPONENT', 'SECTION'].includes(x.type) && CAROUSEL.test(x.name) &&
  !(() => { for (let p = x.parent; p && p.id !== root.id && p.type !== 'PAGE'; p = p.parent) if (CAROUSEL.test(p.name)) return true; return false; })());
for (const n of outerCarousels) {
  const desc = ('findAll' in n) ? n.findAll(() => true) : [];
  if (desc.some(d => THUMB.test(d.name))) { const scope = n.parent || n; const alt = scope.findAll(d => d !== n && !THUMB.test(d.name) && FIELD.test(d.name) && shown(d));
    if (!alt.length) addReview('2.5.7', n, 'range set only by dragging thumbs — no inputs/steppers found next to it', 'add Min/Max number inputs (or ± steppers) next to the slider; keep the thumbs'); }
  else if (!desc.some(d => /\b(pause|stop|play)\b/i.test(d.name))) addReview('2.2.2', n, 'carousel without pause/stop control — a failure if it auto-advances',
    'if it auto-advances: add a visible Pause/Play button (>= 24x24, labelled) next to the slides; otherwise mark it as manual-only in the handoff');
}
const images = all.filter(n => paintsOf(n).some(p => p.type === 'IMAGE' || p.type === 'VIDEO')).map(n => ({ nodeId: n.id, layerPath: pathOf(n), w: Math.round(n.width), h: Math.round(n.height),
  textOver: texts.filter(t => { for (let x = t.parent; x && x.type !== 'PAGE'; x = x.parent) if (x.id === n.id) return true; return false; }).map(t => t.id) }));

// ---------- fix suggestions: values are computed here; the report only words them ----------
const tok = o => (o.token ? ` (${o.token})` : '');
const colorOpts = (orig, ok, kind, ratioFn) => { const out = [], tk = nearestToken(orig, ok, kind), cm = nearestPassing(orig, ok);
  if (tk && hex(tk.color) !== hex(orig)) out.push({ to: hex(tk.color), token: tk.name, ratio: r2(ratioFn(tk.color)), deltaE: r2(tk.d) });
  if (cm && hex(cm.color) !== hex(orig) && (!tk || hex(cm.color) !== hex(tk.color))) out.push({ to: hex(cm.color), ratio: r2(ratioFn(cm.color)), deltaE: r2(cm.d) });
  return out; };
// Buttons and chips may change their fill; fields and checkboxes keep a light fill (the text or border changes instead).
const isControl = n => !!n && shaped.get(n.id) === 'button' || !!n && !FIELD.test(n.name) && !CHECK.test(n.name) && (n.type === 'INSTANCE' || n.type === 'COMPONENT' || RX.test(n.name));
function overlay(fgCols, bgCands, thr) {
  const pool = tokens.filter(t => t.scopes.includes('ALL_SCOPES') || t.scopes.some(s => SCOPE.fill.includes(s))).sort((a, b) => lum(a.color) - lum(b.color));
  const dark = pool[0] && lum(pool[0].color) < 0.05 ? pool[0] : { name: null, color: BLACK }, lite = pool.length && lum(pool[pool.length - 1].color) > 0.9 ? pool[pool.length - 1] : { name: null, color: WHITE };
  let best = null;
  for (const pick of [dark, lite]) { const worstAt = a => Math.min(...bgCands.flatMap(b => fgCols.map(fg => ratio(fg, mix(pick.color, b, a)))));
    if (worstAt(1) < thr) continue; let lo = 0, hi = 1; for (let i = 0; i < 20; i++) { const m = (lo + hi) / 2; if (worstAt(m) >= thr) hi = m; else lo = m; }
    const a = Math.min(1, Math.ceil(hi * 20) / 20); if (!best || a < best.a) best = { color: pick.color, token: pick.name, a, ratio: worstAt(a) }; }
  return best; }
const WORDY = /[A-Za-zА-Яа-яĂÂÎȘȚăâîșț]{3,}/;
function buildFix(f, c) {
  const o = [], vsOf = cands => col => Math.min(...cands.map(b => ratio(col, b)));
  switch (c.kind) {
    case 'text': { const vsBg = vsOf(c.bgCands);
      if (c.alpha < 0.999 && !c.image) { const at = a => Math.min(...c.fgCols.flatMap(fg => c.bgCands.map(b => ratio(mix(fg, b, a), b))));
        for (let k = Math.ceil(c.alpha * 20); k <= 20; k++) if (at(k / 20) >= c.thr) { o.push({ action: 'opacity', target: 'text', text: `raise the opacity ${Math.round(c.alpha * 100)}% → ${k * 5}% (${r2(at(k / 20))}:1; 100% gives ${r2(at(1))}:1)` }); break; } }
      if (c.image || c.bgCands.length > 1) { const s = overlay(c.fgCols, c.bgCands, c.thr);
        if (s) o.push({ action: 'overlay', target: 'background', color: hex(s.color), token: s.token, opacity: s.a, ratio: r2(s.ratio), text: `add an overlay ${hex(s.color)}${tok(s)} at ${Math.round(s.a * 100)}% under the text (worst case ${r2(s.ratio)}:1)` }); }
      if (c.image) { o.push({ action: 'panel', target: 'background', text: 'or put the text on a solid panel or a calm, dark part of the image' }); break; }
      const textOpts = colorOpts(c.fg, col => vsBg(col) >= c.thr, 'text', vsBg).map(x => ({ action: 'color', target: 'text', nodeId: f.nodeId, from: hex(c.fg), ...x, vs: c.bgCands.map(hex), thr: c.thr, text: `text ${hex(c.fg)} → ${x.to}${tok(x)} = ${x.ratio}:1` }));
      let bgOpts = [];
      if (isControl(c.bgNode) && c.bgCands.length === 1) { const vsFg = vsOf(c.fgCols);
        bgOpts = colorOpts(c.bgCands[0], col => vsFg(col) >= c.thr, 'fill', vsFg).map(x => ({ action: 'color', target: 'background', nodeId: c.bgNode.id, layer: c.bgNode.name, from: hex(c.bgCands[0]), ...x, vs: c.fgCols.map(hex), thr: c.thr,
          text: `"${c.bgNode.name}" fill ${hex(c.bgCands[0])} → ${x.to}${tok(x)} = ${x.ratio}:1 with the current text colour` })); }
      o.push(...bgOpts, ...textOpts); break; }
    case 'link': { o.push({ action: 'underline', target: 'text', text: `underline "${c.link}" (keeps the colour)` });
      const vsBg = vsOf(c.bgCands), opts = colorOpts(c.color, col => ratio(col, c.textColor) >= 3 && vsBg(col) >= 4.5, 'text', col => ratio(col, c.textColor));
      if (opts.length) o.push(...opts.map(x => ({ action: 'color', target: 'text', from: hex(c.color), ...x, vs: [hex(c.textColor)], thr: 3, text: `or link colour ${hex(c.color)} → ${x.to}${tok(x)}: ${x.ratio}:1 against the text, >= 4.5:1 against the background` })));
      else o.push({ action: 'note', text: 'no link colour reaches 3:1 against this text and 4.5:1 against the background at the same time — use the underline' });
      break; }
    case 'nontext': { const vs = vsOf(c.bgCands);
      o.push(...colorOpts(c.color, col => vs(col) >= 3, c.scope, vs).map(x => ({ action: 'color', target: c.part, nodeId: f.nodeId, from: hex(c.color), ...x, vs: c.bgCands.map(hex), thr: 3, text: `${c.part} ${hex(c.color)} → ${x.to}${tok(x)} = ${x.ratio}:1` })));
      break; }
    case 'focus': { const vs = vsOf(c.bgCands), x = colorOpts(c.fill || c.bgCands[0], col => vs(col) >= 3, 'stroke', vs)[0];
      if (x) o.push({ action: 'variant', target: 'component', nodeId: f.nodeId, to: x.to, token: x.token, ratio: x.ratio, vs: c.bgCands.map(hex), thr: 3,
        text: `add a State=Focus variant: 2px outline at 2px offset in ${x.to}${tok(x)} (${x.ratio}:1 on ${hex(c.bgCands[0])}); use the same ring for non-component controls in code` });
      break; }
    case 'target': {
      if (c.aaa) { o.push({ action: 'hit-area', text: `hit area 44×44: add ${Math.ceil((44 - c.w) / 2)}px left/right and ${Math.ceil((44 - c.h) / 2)}px top/bottom padding around the ${c.w}×${c.h} shape` }); break; }
      o.push({ action: 'hit-area', text: `hit area >= 24×24: add ${Math.max(0, Math.ceil((24 - c.w) / 2))}px left/right and ${Math.max(0, Math.ceil((24 - c.h) / 2))}px top/bottom padding (the visible ${c.w}×${c.h} shape can stay); 44×44 is better for touch` });
      if (c.clash && c.clash.undersized) o.push({ action: 'spacing', text: `or widen the gap by ${Math.ceil(24 - c.clash.dist)}px so undersized targets are >= 24px apart, centre to centre` });
      break; }
    case 'label': o.push({ action: 'label', text: `add a visible label above the field${c.placeholder ? ` ("${c.placeholder}")` : ''}${c.example ? `, styled like "${c.example.text}" (${r2(c.example.size)}px/${c.example.weight})` : ', 14px/500, 6–8px above the box'}; keep the placeholder only as an example value` }); break;
    case 'error': { const vs = vsOf(c.bgCands), x = colorOpts(c.stroke, col => vs(col) >= 4.5, 'text', vs)[0];
      o.push({ action: 'error-text', target: 'error text', ...(x ? { to: x.to, token: x.token, ratio: x.ratio, vs: c.bgCands.map(hex), thr: 4.5 } : {}),
        text: `add error text under the field (what is wrong and how to fix it)${x ? ` in ${x.to}${tok(x)} (${x.ratio}:1)` : ''} with an error icon; keep the red border` }); break; }
    case 'autoresize': o.push({ action: 'resize', text: 'set the text to Auto height (textAutoResize HEIGHT) so it grows instead of clipping' }); break;
    case 'lineheight': o.push({ action: 'line-height', text: `line-height ${Math.ceil(c.fs * 1.5)}px (1.5)` }); break;
    case 'smalltext': o.push({ action: 'font-size', text: 'at least 12px; 13–14px for legal text and captions' }); break;
    case 'sensory': { const tb = box(c.node); let best = null;
      for (const t2 of targets) { if (kindOf(t2) !== 'button') continue; const lbl = ('findAll' in t2) ? t2.findAll(d => d.type === 'TEXT')[0] : null; if (!lbl) continue;
        const d = Math.hypot(box(t2).x - tb.x, box(t2).y - tb.y); if (!best || d < best.d) best = { d, label: lbl.characters }; }
      o.push({ action: 'copy', text: best ? `name the control by its label, e.g. "…select “${best.label}”…", not by colour, shape or position` : 'name the control by its visible label, not by colour, shape or position' }); break; }
    case 'h1': { const words = headingCandidates.filter(h => h.size < maxFs && WORDY.test(h.text)), count = {};
      words.forEach(h => { count[h.size] = (count[h.size] || 0) + 1; });
      const size = Object.keys(count).map(Number).sort((a, b) => count[b] - count[a] || b - a)[0], ex = words.find(h => h.size === size);
      o.push({ action: 'restyle', text: ex ? `restyle as H2, e.g. ${size}px like "${ex.text}"` : 'restyle as H2, smaller than the H1' }); break; }
    case 'styles': { const sizes = [...new Set(headingCandidates.filter(h => WORDY.test(h.text)).map(h => h.size))].sort((a, b) => b - a).slice(0, 4), body = {};
      texts.filter(t => typeof t.fontSize === 'number' && t.characters.length > 40).forEach(t => { body[t.fontSize] = (body[t.fontSize] || 0) + 1; });
      const b = Object.keys(body).sort((x, y) => body[y] - body[x])[0];
      o.push({ action: 'text-styles', text: `create Text Styles and apply them (confirm the levels): ${sizes.map((s, i) => `H${i + 1} ${s}px`).join(', ')}${b ? `, Body ${b}px` : ''}` }); break; }
    case 'order': o.push({ action: 'order', text: `reorder layers to ${c.order.join(', ')} — or turn "${c.frame}" into auto layout` }); break;
  }
  return o.length ? { summary: o[0].text, options: o } : null;
}
const compactFix = [];
for (const f of findings) { const c = f._ctx; delete f._ctx; if (!c) continue; const fx = buildFix(f, c); if (!fx) continue; f.fix = fx;
  for (const x of fx.options) if (x.to && x.vs && x.thr) compactFix.push(`fix|${f.nodeId}|${x.target}|${x.to}|${x.vs.join(',')}|${x.thr}|${x.token || ''}`); }

const rank = { critical: 0, serious: 1, moderate: 2, advisory: 3 };
findings.sort((a, b) => rank[a.severity] - rank[b.severity] || a.bbox.y - b.bbox.y);
const summary = { critical: 0, serious: 0, moderate: 0, advisory: 0 }; findings.forEach(f => summary[f.severity]++);
const leftovers = figma.currentPage.findAll(n => n.name === '__wcag_probe'); leftovers.forEach(n => n.remove());
const out = { root: { id: root.id, name: root.name, type: root.type, w: Math.round(root.width), h: Math.round(root.height) }, level: `WCAG 2.2 ${CONFIG.level}`, summary,
  findings, review, browserChecks, headingCandidates, images, checked, tokens: tokens.length, fixes: compactFix,
  targets: targets.map(n => `${n.id}|${kindOf(n)}${shaped.has(n.id) ? '*' : ''}|${n.name.slice(0, 32)}`),
  compact: [...findings, ...review.map(r => ({ ...r, severity: 'review' }))].map(f => `${f.criterion}|${f.nodeId}|${f.severity}|${parentIds[f.nodeId] || ''}`) };
// use_figma returns at most 48 KB: group repeats, keep fix texts only; then drop advisory/moderate details (counts stay in `omitted`).
const big = () => JSON.stringify(out).length > 46000;
if (big()) { const g = new Map(), q = x => x.replace(/"[^"]*"/g, '"…"');
  for (const f of findings) { const k = [f.criterion, f.severity, q(f.observed), f.fix ? q(f.fix.summary) : ''].join('|'), e = g.get(k);
    if (e) e.ids.push(f.nodeId); else g.set(k, { c: f.criterion, s: f.severity, ids: [f.nodeId], path: f.layerPath.split(' / ').slice(-2).join(' / '), obs: f.observed, req: f.required, fix: f.fix ? f.fix.options.map(o => o.text) : [], y: f.bbox.y }); }
  Object.assign(out, { mode: 'compact', findings: [...g.values()], browserChecks: browserChecks.map(b => b.nodeId), images: images.map(m => `${m.nodeId}|${m.w}x${m.h}|${m.textOver.length}`), omitted: {} });
  for (const sev of ['advisory', 'moderate']) if (big()) { out.omitted[sev] = out.findings.filter(f => f.s === sev).reduce((a, f) => a + f.ids.length, 0); out.findings = out.findings.filter(f => f.s !== sev); }
  for (const k of ['fixes', 'compact', 'targets']) if (big()) { out.omitted[k] = out[k].length; out[k] = []; } }
return out;
