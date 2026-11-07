// layout-lint.js — read-only layout checks for sections and pages built by /generate-design. Run as a
// use_figma script (raw Plugin API, top-level await/return). Edit CONFIG only; nothing is changed.
// targets: node IDs of sections or page frames, all on one page. band: name pattern of the brand
// band from the Design Direction ('' to skip). minGap: smallest gap between two controls, in px.
// Contrast is not checked here: use wcag-lint (knowledge/design/rules/wcag-figma-checks.md).
const CONFIG = { targets: ['NODE_ID'], band: '\\b(band|ribbon)\\b|лента', minGap: 8, limit: 120 };

const CONTROL = /\b(button|btn|link|input|field|textarea|select|dropdown|checkbox|radio|switch|toggle|tab|chip|filter|tag|pill|cta|close|prev|next|search)\b/i;
const CHECKISH = /\b(checkbox|radio|switch|toggle)\b/i;
const CLIP_OK = /\b(carousel|slider|swiper|slideshow|gallery|marquee|scroll|scroller|track|rail)\b/i;
const DECOR = /\b(bg|background|decor|decoration|shadow|glow|texture|pattern|overlay|scrim|image|photo|illustration)\b/i;
const GROUPED = /\b(segment|segmented|tabs|button group|toggle group|pagination|stepper|quantity|counter)\b/i;
const ICONISH = /\b(icon|ico|glyph|bullet|check|arrow)\b/i;
const FRAMEY = new Set(['FRAME', 'INSTANCE', 'COMPONENT', 'COMPONENT_SET', 'GROUP', 'SECTION']);
const SHAPES = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'ELLIPSE', 'POLYGON', 'LINE']);
const BAND = CONFIG.band ? new RegExp(CONFIG.band, 'i') : null;
const SEV = { critical: 0, important: 1, moderate: 2, info: 3 };

const t0 = Date.now(), findings = [], missing = [], roots = [];
const add = (check, n, severity, detail) => findings.push({ check, nodeId: n.id, name: n.name.slice(0, 40), severity, detail });
const box = n => n.absoluteBoundingBox;
// absoluteRenderBounds is already cut by clipping ancestors, so add outside strokes and ring-like effects by hand.
const outset = n => { let e = 0;
  if ('strokes' in n && Array.isArray(n.strokes) && n.strokes.some(p => p.visible !== false) && typeof n.strokeWeight === 'number')
    e = n.strokeAlign === 'OUTSIDE' ? n.strokeWeight : n.strokeAlign === 'CENTER' ? n.strokeWeight / 2 : 0;
  for (const f of ('effects' in n ? n.effects : [])) if (f.visible !== false && (f.type === 'DROP_SHADOW') && f.radius <= 1)
    e = Math.max(e, (f.spread || 0) + Math.max(Math.abs(f.offset.x), Math.abs(f.offset.y)));
  return e; };
const rbox = n => { const b = box(n), e = outset(n); return b && { x: b.x - e, y: b.y - e, width: b.width + 2 * e, height: b.height + 2 * e }; };
const ov = (a, b) => ({ w: Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x), h: Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) });
const inside = (a, b, t = 0.5) => b.x >= a.x - t && b.y >= a.y - t && b.x + b.width <= a.x + a.width + t && b.y + b.height <= a.y + a.height + t;
const r1 = v => Math.round(v * 10) / 10;
const isAncestor = (a, n) => { for (let p = n.parent; p; p = p.parent) if (p.id === a.id) return true; return false; };
const setName = async n => { if (n.type !== 'INSTANCE') return ''; const mc = await n.getMainComponentAsync(); if (!mc) return '';
  return mc.parent?.type === 'COMPONENT_SET' ? mc.parent.name : mc.name; };
const lineHeight = t => { if (!t.characters.length) return 0; const fs = typeof t.fontSize === 'number' ? t.fontSize : t.getRangeFontSize(0, 1);
  const lh = typeof t.lineHeight === 'object' && 'unit' in t.lineHeight ? t.lineHeight : t.getRangeLineHeight(0, 1);
  return lh.unit === 'PIXELS' ? lh.value : lh.unit === 'PERCENT' ? fs * lh.value / 100 : fs * 1.2; };
const lines = t => { const lh = lineHeight(t); return lh > 0 ? Math.max(1, Math.round(t.height / lh)) : 1; };
const radiusOf = n => { const r = typeof n.cornerRadius === 'number' ? n.cornerRadius : (n.topLeftRadius ?? 0); return r >= n.height / 2 - 0.5 ? 'full' : String(r); };
const hasShape = n => ['fills', 'strokes'].some(k => k in n && Array.isArray(n[k]) && n[k].some(p => p.visible !== false && (p.opacity ?? 1) > 0));

const first = CONFIG.targets.length ? await figma.getNodeByIdAsync(CONFIG.targets[0]) : null;
let page = first; while (page && page.type !== 'PAGE') page = page.parent;
if (page && page !== figma.currentPage) await figma.setCurrentPageAsync(page);

for (const id of CONFIG.targets) {
  const root = await figma.getNodeByIdAsync(id);
  if (!root || !('children' in root) || !box(root)) { missing.push(id); continue; }
  const before = findings.length;

  // Walk visible nodes, remembering clipping ancestors and whether a carousel allows overflow.
  const entries = [];
  const walk = (n, clips, clipOk) => {
    if (n.visible === false || ('opacity' in n && n.opacity === 0)) return;
    entries.push({ n, clips, clipOk });
    if (!('children' in n)) return;
    const clips2 = 'clipsContent' in n && n.clipsContent ? [...clips, n] : clips;
    for (const c of n.children) walk(c, clips2, clipOk || CLIP_OK.test(n.name));
  };
  walk(root, [], false);

  // Controls: outermost nodes named like a control, or instances of such a component.
  const ctl = [];
  for (const { n } of entries) {
    if (n === root || !box(n)) continue;
    const named = n.type === 'TEXT' ? /\blink\b/i.test(n.name)
      : ['FRAME', 'INSTANCE', 'COMPONENT'].includes(n.type) && (CONTROL.test(n.name) || CONTROL.test(await setName(n)));
    if (named) ctl.push(n);
  }
  const ctlIds = new Set(ctl.map(n => n.id));
  const controls = ctl.filter(n => { for (let p = n.parent; p && p !== root; p = p.parent) if (ctlIds.has(p.id)) return false; return true; });
  const isControl = new Set(controls.map(n => n.id));
  const roleOf = new Map();
  for (const n of controls) roleOf.set(n.id, ((await setName(n)) || n.name).toLowerCase().split(/\s[—–-]\s|:|,/)[0].trim());

  // 1. Clipping. Text, controls and focus rings partly cut by a clipping ancestor, and frames or text hidden
  // entirely outside it. Only the outermost node is reported. Inside a carousel or scroll row (by name), only cuts
  // across the row are reported: overflow along it is intended.
  const cut = new Set();
  for (const { n, clips, clipOk } of entries) {
    if (n.parent && cut.has(n.parent.id)) { cut.add(n.id); continue; }
    if (!clips.length) continue;
    const kind = n.type === 'TEXT' ? 'text' : /focus/i.test(n.name) ? 'focus ring' : isControl.has(n.id) ? 'control' : FRAMEY.has(n.type) ? 'frame' : null;
    if (!kind) continue;
    const b = kind === 'text' || kind === 'frame' ? box(n) : rbox(n); if (!b || b.width < 8 || b.height < 8) continue;
    for (let i = clips.length - 1; i >= 0; i--) {
      const c = box(clips[i]); if (inside(c, b)) continue;
      if (clipOk && b.y >= c.y - 0.5 && b.y + b.height <= c.y + c.height + 0.5) break;
      const o = ov(c, b), hidden = o.w <= 0 || o.h <= 0;
      if (!hidden && kind === 'frame') break;
      cut.add(n.id);
      add('clip', n, hidden ? 'moderate' : kind === 'text' ? 'critical' : 'important',
        `${kind} ${hidden ? 'hidden outside' : 'cut by'} ${clips[i].id} "${clips[i].name.slice(0, 30)}"${kind === 'control' || kind === 'focus ring' ? ' (incl. stroke/effects)' : ''}`);
      break;
    }
  }

  // 2. Controls closer than minGap (rows or columns), unless they form one grouped control.
  for (let i = 0; i < controls.length; i++) for (let j = i + 1; j < controls.length; j++) {
    const a = controls[i], b = controls[j], A = box(a), B = box(b);
    if (inside(A, B) || inside(B, A) || !hasShape(a) || !hasShape(b)) continue;
    const o = ov(A, B); let gap = null;
    if (o.h > Math.min(A.height, B.height) * 0.5) gap = -o.w; else if (o.w > Math.min(A.width, B.width) * 0.5) gap = -o.h;
    if (gap === null || gap >= CONFIG.minGap) continue;
    let lca = a.parent; while (lca && !isAncestor(lca, b)) lca = lca.parent;
    if (lca && GROUPED.test(lca.name)) continue;
    add('gap', a, gap <= 0 ? 'important' : 'moderate', `${gap <= 0 ? 'touches or overlaps' : `gap ${r1(gap)}px to`} ${b.id} "${b.name.slice(0, 30)}" (min ${CONFIG.minGap})`);
  }

  // 3. Frames partly overlapping their siblings (free layout or absolute children), and the target vs its siblings.
  const blocks = n => n.children.filter(c => c.visible !== false && FRAMEY.has(c.type) && box(c) && c.width >= 24 && c.height >= 24 && !DECOR.test(c.name) && !(BAND && BAND.test(c.name))
    && (!('layoutMode' in n) || n.layoutMode === 'NONE' || c.layoutPositioning === 'ABSOLUTE'));
  const partial = (a, b) => { const A = box(a), B = box(b), o = ov(A, B); return o.w > 2 && o.h > 2 && !inside(A, B) && !inside(B, A) ? o : null; };
  for (const { n } of entries) {
    if (!('children' in n) || !FRAMEY.has(n.type) || n.type === 'INSTANCE') continue;
    const k = blocks(n);
    for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) { const o = partial(k[i], k[j]);
      if (o) add('overlap', k[i], 'moderate', `overlaps ${k[j].id} "${k[j].name.slice(0, 30)}" by ${r1(o.w)}×${r1(o.h)}px`); }
  }
  if (root.parent && ['PAGE', 'SECTION'].includes(root.parent.type))
    for (const s of root.parent.children) { if (s === root || s.visible === false || !box(s)) continue; const o = partial(root, s);
      if (o) add('overlap', root, 'important', `overlaps sibling ${s.id} "${s.name.slice(0, 30)}" by ${r1(o.w)}×${r1(o.h)}px`); }

  // 4. Icon centered against multi-line text much taller than the icon (> 1.5×) in a horizontal row: align it to the first line.
  for (const { n } of entries) {
    if (!('layoutMode' in n) || n.layoutMode !== 'HORIZONTAL' || n.counterAxisAlignItems !== 'CENTER' || isControl.has(n.id)) continue;
    const kids = n.children.filter(c => c.visible !== false && c.layoutPositioning !== 'ABSOLUTE');
    const icon = kids.find(c => SHAPES.has(c.type) || (['FRAME', 'INSTANCE', 'COMPONENT', 'GROUP'].includes(c.type) && c.width <= 40 && c.height <= 40
      && Math.abs(c.width - c.height) <= 8 && (ICONISH.test(c.name) || !c.findOne(d => d.type === 'TEXT'))));
    if (!icon) continue;
    for (const c of kids) {
      if (c === icon) continue;
      const t = c.type === 'TEXT' ? c : 'findAll' in c ? c.findAll(d => d.type === 'TEXT' && d.visible !== false)[0] : null;
      if (!t) continue;
      const nl = c.type === 'TEXT' ? lines(c) : (c.height > icon.height * 1.8 ? 2 : lines(t));
      if (nl >= 2 && c.height > icon.height * 1.5) { add('icon-align', n, 'moderate', `icon ${icon.id} centered on ${c.type === 'TEXT' ? `${nl}-line text` : 'a multi-line block'}; align it to the first line`); break; }
    }
  }

  // 5. Corner radii: one kind of control (same component set or name prefix) with several radii is a defect;
  // different kinds with different radii are listed as info, for the designer to confirm.
  const shaped = controls.filter(n => n.type !== 'TEXT' && n.height >= 28 && !CHECKISH.test(n.name) && hasShape(n));
  const dist = ns => { const m = new Map(); for (const n of ns) { const r = radiusOf(n); if (!m.has(r)) m.set(r, []); m.get(r).push(n); }
    return [...m].sort((x, y) => y[1].length - x[1].length); };
  const fmt = parts => parts.map(([r, ns]) => `${r} ×${ns.length} (${ns.slice(0, 3).map(x => `${x.id} "${x.name.slice(0, 20)}"`).join(', ')})`).join('; ');
  const byRole = new Map(); for (const n of shaped) { const k = roleOf.get(n.id); if (!byRole.has(k)) byRole.set(k, []); byRole.get(k).push(n); }
  for (const [role, ns] of byRole) { const parts = dist(ns); if (parts.length > 1) add('radius', parts[1][1][0], 'moderate', `"${role}" controls use radii ${fmt(parts)}`); }
  const all = dist(shaped);
  if (all.length > 1) add('radius', root, 'info', `control kinds use radii ${fmt(all)}; confirm the difference is intended`);

  // 6. Text running into the brand band.
  if (BAND) {
    const bands = entries.map(e => e.n).filter(n => n !== root && n.type !== 'TEXT' && BAND.test(n.name) && box(n));
    const outer = bands.filter(b => !bands.some(o => o !== b && isAncestor(o, b)));
    for (const band of outer) for (const { n } of entries) {
      if (n.type !== 'TEXT' || isAncestor(band, n) || !box(n)) continue;
      const o = ov(box(band), box(n));
      if (o.w > 1 && o.h > 1) add('band', n, 'important', `text overlaps brand band ${band.id} "${band.name.slice(0, 30)}" by ${r1(o.w)}×${r1(o.h)}px`);
    }
  }

  // 7. Text that is truncated or shorter than one line.
  for (const { n } of entries) {
    if (n.type !== 'TEXT') continue;
    if (n.textTruncation === 'ENDING') add('truncation', n, 'moderate', `truncation on${n.maxLines ? ` (maxLines ${n.maxLines})` : ''}; check that the full text fits or that cutting it is intended`);
    else if (n.textAutoResize === 'NONE' && lineHeight(n) > 0 && n.height < lineHeight(n) * 0.9) add('truncation', n, 'important', `box ${r1(n.height)}px is shorter than one line (${r1(lineHeight(n))}px)`);
  }

  roots.push({ id: root.id, name: root.name, nodes: entries.length, controls: controls.length, findings: findings.length - before });
}

findings.sort((a, b) => SEV[a.severity] - SEV[b.severity] || a.check.localeCompare(b.check));
const summary = {};
for (const f of findings) { summary[f.check] = summary[f.check] || {}; summary[f.check][f.severity] = (summary[f.check][f.severity] || 0) + 1; }
return { roots, missing, summary, findings: findings.slice(0, CONFIG.limit).map(f => `${f.check}|${f.nodeId}|${f.severity}|${f.name}|${f.detail}`),
  omitted: Math.max(0, findings.length - CONFIG.limit), ms: Date.now() - t0 };
