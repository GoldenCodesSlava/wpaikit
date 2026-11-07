// wcag-report.js — builds the WCAG report frame next to the audited frame and, unless REPORT.annotate
// is false, Accessibility annotations on the flagged layers. Run as a use_figma script; edit REPORT only.
// The audited design is not changed: the report is a separate frame, and annotations are metadata shown
// in Dev Mode and the annotation view. A re-run replaces this script's own report and annotations.
const REPORT = { rootId: 'ROOT_ID', annotate: true, title: '', meta: '', summary: [], items: [], sections: [], t: {} };

const T = Object.assign({ critical: 'Critical', serious: 'Serious', moderate: 'Moderate', advisory: 'Advisory',
  measured: 'Measured', screenshot: 'From screenshot', layer: 'Layer', now: 'Now', need: 'Required', fix: 'Fix', why: 'Who is affected', findings: 'Findings' }, REPORT.t);
// Severity colours pass 4.5:1 with white text and on the light card background, so the report meets AA itself.
const SEV = { critical: '#B42318', serious: '#B93815', moderate: '#93370D', advisory: '#475467' };
const INK = '#101828', MUTED = '#475467', LINE = '#D0D5DD', CARD = '#F9FAFB';
const rgb = h => ({ r: parseInt(h.slice(1, 3), 16) / 255, g: parseInt(h.slice(3, 5), 16) / 255, b: parseInt(h.slice(5, 7), 16) / 255 });
const solid = h => [{ type: 'SOLID', color: rgb(h) }];
const MARK = '**WCAG ';

const root = await figma.getNodeByIdAsync(REPORT.rootId);
if (!root || !('exportAsync' in root) || !root.absoluteBoundingBox) throw new Error(`Node ${REPORT.rootId} is not a frame`);
let page = root; while (page.type !== 'PAGE') page = page.parent;
await figma.setCurrentPageAsync(page);
const rb = root.absoluteBoundingBox;

// ---------- fonts: Inter, else Roboto, else Arial ----------
const FAMILIES = { Inter: ['Regular', 'Semi Bold', 'Bold'], Roboto: ['Regular', 'Medium', 'Bold'], Arial: ['Regular', 'Bold', 'Bold'] };
let FAM = null, STY = null;
for (const [fam, styles] of Object.entries(FAMILIES)) {
  try { await Promise.all([...new Set(styles)].map(style => figma.loadFontAsync({ family: fam, style }))); FAM = fam; STY = styles; break; } catch (e) { /* next family */ }
}
if (!FAM) throw new Error('none of Inter, Roboto, Arial is available');

// ---------- building blocks ----------
const text = (chars, size, weight = 0, color = INK, width = 0) => {
  const t = figma.createText(); t.fontName = { family: FAM, style: STY[weight] }; t.characters = String(chars || ' ');
  t.fontSize = size; t.lineHeight = { unit: 'PIXELS', value: Math.round(size * 1.45) }; t.fills = solid(color);
  if (width) { t.resize(width, t.height); t.textAutoResize = 'HEIGHT'; } return t; };
const box = (dir, gap, pad, width = 0) => {
  const f = figma.createFrame(); f.layoutMode = dir; f.itemSpacing = gap; f.fills = []; f.clipsContent = false;
  [f.paddingTop, f.paddingRight, f.paddingBottom, f.paddingLeft] = Array.isArray(pad) ? pad : [pad, pad, pad, pad];
  if (width) f.resize(width, 10);
  f.primaryAxisSizingMode = dir === 'HORIZONTAL' && width ? 'FIXED' : 'AUTO';
  f.counterAxisSizingMode = dir === 'VERTICAL' && width ? 'FIXED' : 'AUTO'; return f; };
const chip = (label, colour) => { const c = box('HORIZONTAL', 0, [4, 10, 4, 10]); c.cornerRadius = 999;
  if (colour) { c.fills = solid(colour); c.appendChild(text(label, 13, 1, '#FFFFFF')); }
  else { c.strokes = solid(LINE); c.appendChild(text(label, 13, 1, MUTED)); } return c; };
const badge = (n, colour, size = 24) => { const b = box('HORIZONTAL', 0, 0); b.resize(size, size); b.primaryAxisSizingMode = 'FIXED'; b.counterAxisSizingMode = 'FIXED';
  b.primaryAxisAlignItems = 'CENTER'; b.counterAxisAlignItems = 'CENTER'; b.cornerRadius = size / 2; b.fills = solid(colour);
  b.strokes = solid('#FFFFFF'); b.strokeWeight = 2; b.appendChild(text(n, size > 20 ? 12 : 10, 2, '#FFFFFF')); return b; };
const linkable = id => (id.startsWith('I') ? id.slice(1).split(';')[0] : id);

// ---------- previous report: replaced; its annotated nodes are cleaned up below ----------
const old = page.children.find(c => c.getSharedPluginData('wpaikit', 'wcag-report-for') === root.id);
let prevAnnotated = [];
if (old) { try { prevAnnotated = JSON.parse(old.getSharedPluginData('wpaikit', 'wcag-annotated') || '[]'); } catch (e) { /* ignore */ } }

// ---------- report frame ----------
const W = 1400, PAD = 40, SNAP = 600, GAP = 32, FULL = W - 2 * PAD, SIDE = FULL - SNAP - GAP, CARD_W = (FULL - 16) / 2;
const rep = box('VERTICAL', 28, PAD, W); rep.name = `WCAG Report — ${root.name}`;
rep.fills = solid('#FFFFFF'); rep.strokes = solid(LINE); rep.cornerRadius = 16;
const head = box('VERTICAL', 10, 0, FULL);
head.appendChild(text(REPORT.title || `WCAG 2.2 — ${root.name}`, 28, 2, INK, FULL));
if (REPORT.meta) head.appendChild(text(REPORT.meta, 14, 0, MUTED, FULL));
if (REPORT.summary.length) { const row = box('HORIZONTAL', 8, 0); row.layoutWrap = 'WRAP'; row.counterAxisSpacing = 8;
  for (const s of REPORT.summary) row.appendChild(chip(s.label, SEV[s.sev])); head.appendChild(row); }
rep.appendChild(head);

// Top: snapshot of the audited frame (<= 4096px per side for createImage) with one pin per item, and the
// questions / not verified / browser / measured sections beside it. Below: the cards in two columns.
const body = box('HORIZONTAL', GAP, 0); body.counterAxisAlignItems = 'MIN'; rep.appendChild(body);
const scale = Math.min(SNAP / rb.width, 4096 / rb.height);
const img = figma.createImage(await root.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: scale } }));
const snap = figma.createFrame(); snap.name = 'Snapshot'; snap.resize(Math.round(rb.width * scale), Math.round(rb.height * scale));
snap.fills = [{ type: 'IMAGE', imageHash: img.hash, scaleMode: 'FILL' }]; snap.strokes = solid(LINE); snap.clipsContent = true;
body.appendChild(snap);
let pins = 0; const outside = [];
for (const it of REPORT.items) {
  const colour = SEV[it.sev] || MUTED; let first = true;
  for (const id of it.ids || []) {
    const n = await figma.getNodeByIdAsync(id); const b = n && n.absoluteBoundingBox; if (!b) continue;
    const x = (b.x - rb.x) * scale, y = (b.y - rb.y) * scale, w = b.width * scale, h = b.height * scale;
    if (x + w < 0 || y + h < 0 || x > snap.width || y > snap.height) { if (first) outside.push(it.n); continue; }
    const r = figma.createRectangle(); r.resize(Math.max(2, w), Math.max(2, h)); r.x = x; r.y = y; r.fills = [];
    r.strokes = solid(colour); r.strokeWeight = 1.5; snap.appendChild(r);
    if (first) { const p = badge(it.n, colour, 22); snap.appendChild(p);
      p.x = Math.min(Math.max(0, x - 11), snap.width - 22); p.y = Math.min(Math.max(0, y - 11), snap.height - 22); pins++; first = false; }
  }
}

const side = box('VERTICAL', 24, 0, SIDE); body.appendChild(side);
for (const sec of REPORT.sections) {
  const b = box('VERTICAL', 6, 0, SIDE); b.appendChild(text(sec.title, 18, 2, INK, SIDE));
  for (const line of sec.lines || []) b.appendChild(text(`• ${line}`, 14, 0, INK, SIDE));
  side.appendChild(b);
}

// Cards: one per item, in the report's order, two per row.
if (REPORT.items.length) rep.appendChild(text(T.findings, 22, 2, INK, FULL));
const cards = box('HORIZONTAL', 16, 0, FULL); cards.layoutWrap = 'WRAP'; cards.counterAxisSpacing = 16; cards.counterAxisAlignItems = 'MIN';
rep.appendChild(cards);
const inner = CARD_W - 32;
for (const it of REPORT.items) {
  const colour = SEV[it.sev] || MUTED;
  const card = box('VERTICAL', 6, 16, CARD_W); card.name = `${it.n}. ${it.crit}`; card.fills = solid(CARD); card.strokes = solid('#EAECF0'); card.cornerRadius = 12;
  const row = box('HORIZONTAL', 10, 0); row.counterAxisAlignItems = 'CENTER'; row.appendChild(badge(it.n, colour));
  row.appendChild(text(`${it.crit} ${it.title || ''}`.trim(), 15, 1, INK, inner - 34)); card.appendChild(row);
  card.appendChild(text(`${T[it.sev] || it.sev} · ${T[it.src] || it.src}${it.ids && it.ids.length > 1 ? ` · ${it.ids.length}` : ''}`, 12, 1, colour, inner));
  if (it.path) { const t = text(`${T.layer}: ${it.path}`, 13, 0, MUTED, inner); card.appendChild(t);
    if (it.ids && it.ids[0]) { try { t.setRangeHyperlink(T.layer.length + 2, t.characters.length, { type: 'NODE', value: linkable(it.ids[0]) }); } catch (e) { /* link optional */ } } }
  if (it.now) card.appendChild(text(`${T.now}: ${it.now}`, 13, 0, INK, inner));
  if (it.need) card.appendChild(text(`${T.need}: ${it.need}`, 13, 0, INK, inner));
  const fixes = [].concat(it.fix || []);
  if (fixes.length) card.appendChild(text(`${T.fix}: ${fixes.length > 1 ? '\n• ' + fixes.join('\n• ') : fixes[0]}`, 13, 1, INK, inner));
  if (it.why) card.appendChild(text(`${T.why}: ${it.why}`, 12, 0, MUTED, inner));
  cards.appendChild(card);
}

// ---------- position: right of the frame, else below it, else further right; clear of other nodes ----------
if (old) old.remove();
let outer = root; while (outer.parent && outer.parent.type !== 'PAGE') outer = outer.parent;
const H = rep.height;
const blocker = (x, y) => page.children.find(c => { const b = c.absoluteBoundingBox;
  return b && c !== rep && c !== outer && b.x < x + W && b.x + b.width > x && b.y < y + H && b.y + b.height > y; });
let x = rb.x + rb.width + 200, y = rb.y;
if (blocker(x, y) && !blocker(rb.x, rb.y + rb.height + 200)) { x = rb.x; y = rb.y + rb.height + 200; }
for (let i = 0; i < 50; i++) { const c = blocker(x, y); if (!c) break; x = c.absoluteBoundingBox.x + c.absoluteBoundingBox.width + 200; }
page.appendChild(rep); rep.x = x; rep.y = y;
rep.setSharedPluginData('wpaikit', 'wcag-report-for', root.id);

// ---------- annotations ----------
let annotated = [], annErrors = 0, cleared = 0;
const clean = a => ({ ...(a.labelMarkdown ? { labelMarkdown: a.labelMarkdown } : a.label ? { label: a.label } : {}),
  ...(a.properties && a.properties.length ? { properties: a.properties } : {}), ...(a.categoryId ? { categoryId: a.categoryId } : {}) });
const ours = a => (a.labelMarkdown || a.label || '').startsWith(MARK);
const strip = n => { if (!n || !('annotations' in n) || !n.annotations.some(ours)) return;
  try { n.annotations = n.annotations.filter(a => !ours(a)).map(clean); cleared++; } catch (e) { annErrors++; } };
strip(root); for (const n of root.findAll(n => 'annotations' in n)) strip(n);
for (const id of prevAnnotated) strip(await figma.getNodeByIdAsync(id));
if (REPORT.annotate !== false) {
  const cats = await figma.annotations.getAnnotationCategoriesAsync();
  const cat = cats.find(c => c.label === 'Accessibility') || await figma.annotations.addAnnotationCategoryAsync({ label: 'Accessibility', color: 'green' });
  for (const it of REPORT.items) {
    const fixes = [].concat(it.fix || []);
    const md = `${MARK}${it.n} · ${it.crit}** ${it.title || ''} — ${T[it.sev] || it.sev}${fixes[0] ? `\n${T.fix}: ${fixes[0]}` : ''}`;
    for (const id of it.ids || []) {
      for (const target of [id, linkable(id)]) { const n = await figma.getNodeByIdAsync(target); if (!n || !('annotations' in n)) continue;
        try { n.annotations = [...n.annotations.map(clean), { labelMarkdown: md, categoryId: cat.id }]; annotated.push(n.id); break; } catch (e) { if (target === linkable(id)) annErrors++; } }
    }
  }
}
rep.setSharedPluginData('wpaikit', 'wcag-annotated', JSON.stringify([...new Set(annotated)]));
return { reportId: rep.id, name: rep.name, x: rep.x, y: rep.y, w: rep.width, h: Math.round(rep.height), replaced: !!old,
  items: REPORT.items.length, pins, outside, scale: Math.round(scale * 1000) / 1000, annotated: new Set(annotated).size, cleared, annErrors, font: FAM };
