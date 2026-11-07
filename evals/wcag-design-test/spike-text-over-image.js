// Spike (stage 0, 2026-11-06): contrast of text over an image fill, measured inside use_figma.
// Plugin runtime has no DecompressionStream / TextDecoder / WebAssembly, so PNG is decoded here.
// Method: a temporary clipped probe frame (off-canvas) holds only the background paints under the
// text bbox → exportAsync PNG → inflate + unfilter → per-pixel contrast vs text colour → min/p5/median.
// The audited frame is never modified; the probe is removed in `finally`.
// Validated on golden.json: Broken promo 1.02–1.16:1, Clean promo (0.75 scrim) 8.00–8.49:1.
// Limitation: uses the fills of BANNER only (nearest ancestor). Sibling background layers need a
// "background stack" (stage 1).

const LBASE=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258];
const LEXT=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
const DBASE=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];
const DEXT=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];

// zlib inflate (puff-style canonical Huffman). src: zlib stream, outSize: exact decompressed size.
function inflate(src, outSize) {
  let pos = 2, bb = 0, bc = 0, op = 0; const out = new Uint8Array(outSize);
  const bits = n => { while (bc < n) { bb |= src[pos++] << bc; bc += 8; } const v = bb & ((1 << n) - 1); bb >>>= n; bc -= n; return v; };
  const build = (lens, n) => { const count = new Uint16Array(16), sym = new Uint16Array(n), offs = new Uint16Array(16);
    for (let i = 0; i < n; i++) count[lens[i]]++; count[0] = 0;
    for (let i = 1; i < 16; i++) offs[i] = offs[i-1] + count[i-1];
    for (let i = 0; i < n; i++) if (lens[i]) sym[offs[lens[i]]++] = i; return { count, sym }; };
  const decode = h => { let code = 0, first = 0, index = 0;
    for (let len = 1; len < 16; len++) { code |= bits(1); const c = h.count[len];
      if (code - c < first) return h.sym[index + (code - first)]; index += c; first += c; first <<= 1; code <<= 1; }
    throw new Error('bad huffman code'); };
  const fl = new Uint8Array(288); fl.fill(8, 0, 144); fl.fill(9, 144, 256); fl.fill(7, 256, 280); fl.fill(8, 280, 288);
  const FL = build(fl, 288), FD = build(new Uint8Array(30).fill(5), 30);
  const ORD = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];
  let last;
  do {
    last = bits(1); const type = bits(2);
    if (type === 0) { bb = 0; bc = 0; const len = src[pos] | (src[pos+1] << 8); pos += 4; out.set(src.subarray(pos, pos + len), op); pos += len; op += len; continue; }
    let L = FL, D = FD;
    if (type === 2) {
      const hlit = bits(5) + 257, hdist = bits(5) + 1, hclen = bits(4) + 4;
      const cl = new Uint8Array(19); for (let i = 0; i < hclen; i++) cl[ORD[i]] = bits(3);
      const CL = build(cl, 19); const lens = new Uint8Array(hlit + hdist);
      for (let i = 0; i < hlit + hdist;) { const s = decode(CL);
        if (s < 16) lens[i++] = s;
        else if (s === 16) { const p = lens[i-1], r = 3 + bits(2); for (let k = 0; k < r; k++) lens[i++] = p; }
        else if (s === 17) { i += 3 + bits(3); } else { i += 11 + bits(7); } }
      L = build(lens.subarray(0, hlit), hlit); D = build(lens.subarray(hlit), hdist);
    }
    for (;;) { const s = decode(L);
      if (s < 256) out[op++] = s; else if (s === 256) break;
      else { const li = s - 257, len = LBASE[li] + bits(LEXT[li]); const di = decode(D), dist = DBASE[di] + bits(DEXT[di]);
        for (let k = 0; k < len; k++, op++) out[op] = out[op - dist]; } }
  } while (!last);
  return out;
}

// 8-bit RGB / RGBA non-interlaced PNG (what Figma exportAsync produces).
function decodePNG(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); let p = 8, w, h, ct, idat = [], tot = 0;
  while (p < bytes.length) { const len = dv.getUint32(p), type = String.fromCharCode(...bytes.subarray(p+4, p+8));
    if (type === 'IHDR') { w = dv.getUint32(p+8); h = dv.getUint32(p+12); ct = bytes[p+17]; }
    if (type === 'IDAT') { idat.push(bytes.subarray(p+8, p+8+len)); tot += len; }
    p += 12 + len; }
  const z = new Uint8Array(tot); let o = 0; for (const c of idat) { z.set(c, o); o += c.length; }
  const bpp = ct === 6 ? 4 : 3, stride = w * bpp; const raw = inflate(z, (stride + 1) * h); const px = new Uint8Array(stride * h);
  for (let y = 0; y < h; y++) { const f = raw[y * (stride + 1)], ri = y * (stride + 1) + 1, oi = y * stride;
    for (let x = 0; x < stride; x++) { const a = x >= bpp ? px[oi + x - bpp] : 0, b = y ? px[oi - stride + x] : 0, c = (x >= bpp && y) ? px[oi - stride + x - bpp] : 0; let v = raw[ri + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      px[oi + x] = v & 255; } }
  return { w, h, bpp, ct, px };
}

const lin = c => (c /= 255, c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
const stats = arr => { if (!arr.length) return { n: 0 }; arr.sort((a, b) => a - b);
  const q = f => +arr[Math.floor(f * (arr.length - 1))].toFixed(2); return { n: arr.length, min: q(0), p5: q(0.05), median: q(0.5), max: q(1) }; };

async function measureTextOverImage(bannerId, textId) {
  const banner = await figma.getNodeByIdAsync(bannerId), text = await figma.getNodeByIdAsync(textId);
  const tc = text.fills[0].color, tL = lum(tc.r * 255, tc.g * 255, tc.b * 255);
  const bb = banner.absoluteBoundingBox, tb = text.absoluteBoundingBox;
  const tmp = figma.createFrame();
  try {
    tmp.name = '__wcag_probe'; tmp.x = -100000; tmp.y = -100000;
    tmp.resize(Math.ceil(tb.width), Math.ceil(tb.height)); tmp.clipsContent = true; tmp.fills = [];
    const r = figma.createRectangle(); tmp.appendChild(r);
    r.resize(bb.width, bb.height); r.x = bb.x - tb.x; r.y = bb.y - tb.y; r.fills = banner.fills;
    const png = await tmp.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value: 1 } });
    const d = decodePNG(png); const m = [];
    for (let i = 0; i < d.px.length; i += d.bpp) m.push(ratio(tL, lum(d.px[i], d.px[i+1], d.px[i+2])));
    return { text: text.name, fontSize: text.fontSize, ...stats(m) };
  } finally { tmp.remove(); }
}

// Example (golden.json): Broken promo title / caption, Clean promo title / caption.
return {
  broken: [await measureTextOverImage('2:31', '2:32'), await measureTextOverImage('2:31', '2:33')],
  clean: [await measureTextOverImage('3:26', '3:27'), await measureTextOverImage('3:26', '3:28')],
};
