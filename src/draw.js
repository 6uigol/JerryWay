// Desenho do mundo em pixel art, no mesmo estilo do Song of Moonlight: chão com ruído e pontilhado (dither),
// árvores em gomos sombreados com contorno, pedras redondas, água com marolas e espuma na margem,
// veículos com contorno e animação, o Trem Infinito, slimes, moedas e partículas de clima em cada zona.
import { TILE, COLS } from './world.js';

const T = TILE;
const OUT = '#1a1226';
export function hash(x, y, s = 0) {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function vnoise(wx, wy, sc, seed) {
  const gx = wx / sc, gy = wy / sc, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = gx - x0, fy = gy - y0;
  const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
  const a = hash(x0, y0, seed), b = hash(x0 + 1, y0, seed), c = hash(x0, y0 + 1, seed), d = hash(x0 + 1, y0 + 1, seed);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const rgbOf = (hex) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
export const shade = (hex, k) => '#' + rgbOf(hex).map((v) => Math.max(0, Math.min(255, Math.round(v * k))).toString(16).padStart(2, '0')).join('');
const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };

// ---------------------------------------------------------------- zonas
export const Z = {
  campo: { kind: 'grass', g: '#5a9e46', gd: '#4a8a3a', gl: '#6ab452', bl: '#8ad06a', flowers: true, trees: ['tree', 'tree', 'apple', 'bush'], rock: '#8e8e9a', water: ['#3a7ad8', '#2f6cc4'], road: ['#c8a46c', '#b08c58', '#dcbc84'], cart: 'horse', rail: '#7a6a5a' },
  floresta: { kind: 'grass', g: '#3f7a38', gd: '#33682e', gl: '#4c8c42', bl: '#6aa858', flowers: true, trees: ['pine', 'darktree', 'pine', 'mushroom'], rock: '#7a7c82', moss: '#4c8a3a', water: ['#2e6a8a', '#285e7a'], road: ['#8a6a48', '#70543a', '#a0805a'], cart: 'horse', rail: '#6a5a4a' },
  deserto: { kind: 'sand', g: '#e2c47c', gd: '#d0ae66', gl: '#eed494', bl: '#f8e6b0', trees: ['cactus', 'cactus', 'palm', 'deadtree'], rock: '#c49c6c', water: ['#2fb0b8', '#269ca8'], road: ['#c89a5e', '#b0844c', '#dcb478'], cart: 'camel', rail: '#a08060' },
  neve: { kind: 'snow', g: '#e6eef8', gd: '#cfdaee', gl: '#f6f9ff', bl: '#ffffff', trees: ['snowpine', 'snowpine', 'icetree'], rock: '#9aa6ba', water: ['#2c5c9c', '#244e8a'], road: ['#a8b4c8', '#90a0b8', '#c8d2e2'], cart: 'reindeer', rail: '#8a96aa' },
  lacrimora: { kind: 'grass', g: '#5c4090', gd: '#4c327c', gl: '#6c50a6', bl: '#a080e0', flowers: true, trees: ['quartz', 'cedar', 'fungus'], rock: '#6e5ea0', water: ['#8a3ab0', '#7a30a0'], road: ['#6a5a8a', '#5a4a78', '#8a7aa8'], cart: 'unicorn', rail: '#5a4a6a' },
  lua: { kind: 'moon', g: '#a2a6bc', gd: '#9094ac', gl: '#b2b6ca', bl: '#c8ccdc', trees: ['moonrock', 'crystal', 'moonrock'], rock: '#8e92aa', water: ['#1a1640', '#141132'], road: ['#787c94', '#666a82', '#8e92a8'], cart: 'rover', rail: '#5a5e74' },
};

// ---------------------------------------------------------------- folhas de sprite (cache)
const SPR = new Map();
function canvas(w, h) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
// desenha numa grade com margem de 1 px e passa um contorno escuro em volta de tudo
function sprite(key, w, h, paint, outline = true) {
  let cv = SPR.get(key);
  if (cv) return cv;
  cv = canvas(w + 2, h + 2); const c = cv.getContext('2d');
  c.translate(1, 1); paint(c); c.setTransform(1, 0, 0, 1, 0, 0);
  if (outline) {
    const img = c.getImageData(0, 0, w + 2, h + 2), a = img.data, W = w + 2, H = h + 2;
    const solid = (x, y) => x >= 0 && y >= 0 && x < W && y < H && a[(y * W + x) * 4 + 3] > 120;
    const pts = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!solid(x, y) && (solid(x - 1, y) || solid(x + 1, y) || solid(x, y - 1) || solid(x, y + 1))) pts.push(x, y);
    c.fillStyle = OUT; for (let i = 0; i < pts.length; i += 2) c.fillRect(pts[i], pts[i + 1], 1, 1);
  }
  SPR.set(key, cv); return cv;
}
function flipped(key, src) {
  let cv = SPR.get(key + '|f');
  if (cv) return cv;
  cv = canvas(src.width, src.height); const c = cv.getContext('2d'); c.translate(src.width, 0); c.scale(-1, 1); c.drawImage(src, 0, 0);
  SPR.set(key + '|f', cv); return cv;
}
export const clearArt = () => { SPR.clear(); };

// grade 16x16 para árvores (técnica do Song of Moonlight: gomos redondos com 5 tons e luz do alto à esquerda)
function grid16(key, draw, w = 16, h = 16) {
  let cv = SPR.get(key);
  if (cv) return cv;
  const g = Array.from({ length: h }, () => Array(w).fill(null));
  draw(g);
  cv = canvas(w, h); const c = cv.getContext('2d');
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g[y][x]) { c.fillStyle = g[y][x]; c.fillRect(x, y, 1, 1); }
  SPR.set(key, cv); return cv;
}
const put1 = (g, x, y, col) => { if (y >= 0 && y < g.length && x >= 0 && x < g[0].length) g[y][x] = col; };
const fillG = (g, x, y, w, h, col) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) put1(g, xx, yy, col); };
function paintLobes(g, lobes, pal, seed = 0) {
  const inside = (px, py) => lobes.some(([lx, ly, r]) => (px + 0.5 - lx) ** 2 + (py + 0.5 - ly) ** 2 <= r * r);
  const cells = [];
  for (let py = 0; py < g.length; py++) for (let px = 0; px < g[0].length; px++) {
    if (!inside(px, py)) continue;
    let best = null, bd = 1e9;
    for (const l of lobes) { const d = Math.hypot(px + 0.5 - l[0], py + 0.5 - l[1]) - l[2]; if (d < bd) { bd = d; best = l; } }
    const [lx, ly, r] = best, lv = -((px + 0.5 - lx) * 0.62 + (py + 0.5 - ly) * 0.85) / r;
    const edge = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !inside(px + dx, py + dy));
    let k = edge ? 0 : lv > 0.5 ? 4 : lv > 0.12 ? 3 : lv > -0.38 ? 2 : 1;
    if (!edge && k > 1 && k < 4 && hash(px, py, 90 + seed) < 0.16) k -= 1;
    if (!edge && k === 1 && hash(px, py, 91 + seed) < 0.12) k = 2;
    cells.push([px, py, pal[k]]);
  }
  for (const [px, py, col] of cells) g[py][px] = col;
}
function trunk(g, x0, y0, h, cols = ['#3a2412', '#5b3a22', '#7a5233', '#9a6a40']) {
  fillG(g, x0 - 1, y0, 5, h, cols[0]); fillG(g, x0, y0, 3, h, cols[1]); fillG(g, x0, y0, 1, h, cols[2]);
  put1(g, x0 - 2, y0 + h - 1, cols[0]); put1(g, x0 + 4, y0 + h - 1, cols[0]); put1(g, x0 - 1, y0 + h - 1, cols[1]); put1(g, x0 + 3, y0 + h - 1, cols[1]);
  put1(g, x0 + 1, y0 + 1, cols[3]);
}
const LOBES = [[[8, 7.2, 6.2], [4, 9.5, 4.2], [12, 9.5, 4.2], [8, 3.8, 4]], [[8, 7.6, 6.4], [4.6, 5.6, 4], [11.4, 6, 4.1], [8, 11, 4.4]], [[7.6, 7, 6], [12, 8.8, 4], [4, 9.4, 3.8], [9.2, 3.4, 3.8]]];
const LEAF = {
  tree: ['#173a1c', '#245524', '#2f7a30', '#4c9a43', '#7cc45e'], dark: ['#0f2a16', '#1a3e20', '#23502a', '#356e34', '#4f8f46'],
  quartz: ['#2a2a5a', '#414f8a', '#5a6fb3', '#86a6e0', '#d8ecff'], cedar: ['#163a36', '#22504a', '#2f6a5e', '#4c9a83', '#8fd2c5'],
  ice: ['#2a4a6a', '#5a8ab8', '#8ac0e8', '#c0e4fa', '#ffffff'], bush: ['#173a1c', '#2a6a2c', '#3a8a3a', '#58a84a', '#8ad06a'],
};
// árvore de 16x20 (copa mais alta, para dar profundidade entre as fileiras)
function treeArt(kind, v) {
  return grid16(`t:${kind}:${v}`, (g) => {
    const lob = LOBES[v % 3].map(([x, y, r]) => [x, y + 2, r]);
    switch (kind) {
      case 'tree': case 'apple': case 'darktree': case 'cedar': case 'quartz': case 'icetree': {
        const tc = kind === 'quartz' || kind === 'cedar' ? ['#2e2228', '#59464b', '#8a6f78', '#a88e98'] : kind === 'icetree' ? ['#3a4a5a', '#6a7a8a', '#9aaaba', '#c8d4e0'] : undefined;
        trunk(g, 7, 13, 7, tc);
        paintLobes(g, lob, kind === 'darktree' ? LEAF.dark : kind === 'cedar' ? LEAF.cedar : kind === 'quartz' ? LEAF.quartz : kind === 'icetree' ? LEAF.ice : LEAF.tree, v);
        if (kind === 'apple') for (const [ax, ay] of [[5, 7], [10, 10], [8, 12], [11, 5]]) { put1(g, ax, ay, '#d23b3b'); put1(g, ax, ay - 1, '#ff8a8a'); }
        if (kind === 'quartz') { for (let k = 0; k < 5; k++) put1(g, 10, 2 + k, '#d8ecff'); put1(g, 5, 8, '#ffffff'); put1(g, 5, 9, '#d8ecff'); }
        if (kind === 'icetree') { put1(g, 5, 5, '#ffffff'); put1(g, 6, 4, '#ffffff'); put1(g, 11, 9, '#ffffff'); }
        if (kind === 'cedar' && v === 1) { put1(g, 10, 8, '#c8fff0'); put1(g, 5, 6, '#c8fff0'); }
        break;
      }
      case 'bush': {
        paintLobes(g, [[8, 13, 6], [4, 15, 3.6], [12, 15, 3.6], [8, 10.5, 4]], LEAF.bush, v);
        if (v === 1) for (const [ax, ay] of [[5, 13], [10, 12], [8, 16]]) { put1(g, ax, ay, '#ff5a8a'); put1(g, ax + 1, ay, '#ffd0e0'); }
        if (v === 2) for (const [ax, ay] of [[6, 12], [11, 14]]) { put1(g, ax, ay, '#4a5aff'); put1(g, ax, ay - 1, '#9aa8ff'); }
        break;
      }
      case 'pine': case 'snowpine': {
        const snow = kind === 'snowpine', P = snow ? ['#16302a', '#22463c', '#2e5e4e', '#3f7a64', '#5a9a7c'] : ['#0f2e1c', '#1a4a2c', '#24603a', '#2f7a46', '#4c9a5a'];
        fillG(g, 7, 16, 2, 4, '#3a2412'); put1(g, 7, 17, '#5b3a22'); put1(g, 7, 18, '#5b3a22');
        for (const [a, h] of [[11, 6], [7, 6], [3, 6], [0, 4]]) for (let i = 0; i < h; i++) {
          const half = 1 + i, yy = a + i, last = i === h - 1;
          for (let px = 8 - half; px < 8 + half; px++) {
            const edge = px === 8 - half || px === 8 + half - 1;
            put1(g, px, yy, edge || last ? P[0] : px < 8 - half / 2 ? P[4 - (i > 2 ? 1 : 0)] : px < 8 ? P[3] : px < 8 + half / 2 ? P[2] : P[1]);
          }
          if (snow && i < 3) for (let px = 8 - half; px < 8 + Math.max(1, half - 2); px++) put1(g, px, yy, px < 8 ? '#ffffff' : '#dce8f8');
        }
        if (v === 1 && !snow) { put1(g, 5, 11, '#8a5a2a'); put1(g, 10, 14, '#8a5a2a'); }
        break;
      }
      case 'cactus': {
        const O = '#1f4a26', D = '#2f6e3a', M = '#3c8a4a', L = '#5aa868', H = '#8ad09a';
        const col = (x0, y0, w, h) => { fillG(g, x0 - 1, y0, w + 2, h, O); fillG(g, x0, y0 - 1, w, h + 1, O); fillG(g, x0, y0, w, h, M); fillG(g, x0, y0, 1, h, L); fillG(g, x0 + w - 1, y0, 1, h, D); };
        col(6, 4, 4, 15); col(2, 8 + v, 3, 3); col(2, 11 + v, 4, 2); col(11, 10 - v, 3, 3); col(10, 12 - v, 4, 2);
        fillG(g, 7, 5, 1, 13, H); fillG(g, 8, 5, 1, 13, '#4a9a58');
        for (let k = 0; k < 6; k++) put1(g, 6 + (k % 2) * 3, 6 + k * 2, '#e8f0c8');
        if (v === 2) { put1(g, 7, 3, '#ff6a8a'); put1(g, 8, 3, '#ff9ab0'); put1(g, 7, 2, '#ff6a8a'); }
        break;
      }
      case 'palm': {
        const tk = ['#4a2e14', '#7a5028', '#a07038'];
        for (let r = 7; r < 20; r++) { const bx = 7 + Math.round(Math.sin((r - 7) * 0.3) * (v - 1)); put1(g, bx - 1, r, tk[0]); put1(g, bx, r, r % 2 ? tk[1] : tk[2]); put1(g, bx + 1, r, tk[1]); put1(g, bx + 2, r, tk[0]); }
        const fr = ['#1e5a28', '#2f8a3a', '#46b050', '#7ad078'];
        const frond = (pts) => pts.forEach(([px, py], i) => { put1(g, px, py, i % 3 === 0 ? fr[3] : fr[2]); put1(g, px, py + 1, fr[1]); put1(g, px, py + 2, fr[0]); });
        frond([[7, 4], [6, 4], [5, 4], [4, 5], [3, 5], [2, 6], [1, 7], [1, 8]]); frond([[9, 4], [10, 4], [11, 4], [12, 5], [13, 5], [14, 6], [14, 7], [15, 8]]);
        frond([[7, 3], [6, 2], [5, 2], [4, 2], [3, 3]]); frond([[9, 3], [10, 2], [11, 2], [12, 2], [13, 3]]);
        frond([[6, 5], [5, 6], [4, 7], [4, 8], [3, 9]]); frond([[10, 5], [11, 6], [12, 7], [12, 8], [13, 9]]);
        fillG(g, 7, 3, 3, 3, fr[2]); put1(g, 7, 3, fr[3]);
        for (const [cx, cy] of [[7, 6], [9, 6], [8, 7]]) put1(g, cx, cy, '#6a4220');
        break;
      }
      case 'deadtree': {
        fillG(g, 6, 6, 4, 14, '#241c1c'); fillG(g, 7, 6, 2, 14, '#5a4a3e'); fillG(g, 7, 6, 1, 14, '#7a6a5a');
        for (const [px, py] of [[6, 8], [5, 7], [4, 6], [4, 5], [3, 4], [9, 9], [10, 8], [11, 7], [12, 6], [12, 5], [13, 4], [8, 5], [8, 4], [9, 3]]) put1(g, px, py, '#5a4a3e');
        break;
      }
      case 'mushroom': case 'fungus': {
        const cap = kind === 'fungus' ? ['#4a1a5a', '#753c82', '#a955a7', '#c06fbc', '#f4d8e8'] : ['#5a1414', '#8a2424', '#c83a3a', '#e85a4a', '#ffffff'];
        fillG(g, 6, 11, 4, 9, '#a89a8a'); fillG(g, 6, 11, 1, 9, '#f2eae0'); fillG(g, 7, 11, 2, 9, '#e0d4c4'); fillG(g, 9, 11, 1, 9, '#a89a8a');
        paintLobes(g, [[8, 8, 7], [8, 6, 5.5]], cap, v);
        for (let x = 1; x < 15; x++) if (g[11]?.[x] || g[10]?.[x]) put1(g, x, 11, cap[0]);
        for (const [sx, sy] of [[4, 6], [10, 4], [7, 8], [12, 8]]) { put1(g, sx, sy, cap[4]); put1(g, sx + 1, sy, cap[4]); }
        break;
      }
      case 'crystal': {
        const cr = (x0, y0, h, cols) => { for (let i = 0; i < h; i++) { const w = i < 2 ? 1 + i : 3; for (let k = 0; k < w; k++) put1(g, x0 + k - (w > 1 ? 1 : 0), y0 + i, k === 0 ? cols[1] : k === w - 1 ? cols[2] : cols[0]); } };
        cr(7, 3, 15, ['#86e0ff', '#e8fbff', '#3a8ab8']); cr(4, 9, 9, ['#c08aff', '#f0d8ff', '#7a4ab8']); cr(11, 7, 11, ['#7af0ff', '#ffffff', '#2a7a9a']);
        fillG(g, 3, 18, 11, 2, '#6a6e86');
        break;
      }
    }
  }, 16, 20);
}
// pedra redonda sombreada pixel a pixel (luz do alto à esquerda)
function boulderArt(base, v, moss) {
  return grid16(`b:${base}:${v}:${moss || ''}`, (g) => {
    const small = v === 2, cx = 8, cy = small ? 11 : 10, rx = small ? 5.4 : 6.8, ry = small ? 4.4 : 5.8;
    const tones = [shade(base, 0.5), shade(base, 0.72), base, shade(base, 1.16), shade(base, 1.38)];
    for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
      const wob = (hash(px * 3 + v, py, 3) - 0.5) * 0.14, nx = (px + 0.5 - cx) / rx, ny = (py + 0.5 - cy) / ry, d2 = nx * nx + ny * ny;
      if (d2 > 1 + wob) continue;
      let k;
      if (d2 > 0.84 + wob) k = 0;
      else { const l = -nx * 0.6 - ny * 0.8 + (1 - d2) * 0.5; k = l > 0.75 ? 4 : l > 0.35 ? 3 : l > -0.15 ? 2 : 1; if (hash(px, py * 7 + v, 9) < 0.08 && k > 1) k--; }
      put1(g, px, py, tones[k]);
    }
    if (moss) for (let i = 0; i < 6; i++) put1(g, 4 + ((hash(i, v, 40) * 8) | 0), (small ? 8 : 5) + ((hash(i, v, 50) * 2) | 0), moss);
    if (v === 1) { put1(g, 9, 7, tones[1]); put1(g, 10, 8, tones[1]); put1(g, 10, 9, tones[1]); }
  });
}

// ---------------------------------------------------------------- chão de cada faixa (desenhado uma vez e guardado)
const GX0 = -18, GX1 = COLS + 18;   // faixa guardada: 18 colunas para cada lado da área jogável
const GW = (GX1 - GX0) * T;
function noiseFill(c, L, tones, kind, rowSeed, scale = 34) {
  const img = c.createImageData(GW, T), d = img.data, cols = tones.map(rgbOf);
  for (let py = 0; py < T; py++) for (let px = 0; px < GW; px++) {
    const wx = px + GX0 * T, wy = -L.row * T + py;
    let v = vnoise(wx, wy, scale, 31 + rowSeed) * 0.75 + vnoise(wx, wy, 9, 32 + rowSeed) * 0.25;
    if (kind === 'sand') v = v * 0.6 + (Math.sin(wy * 0.55 + Math.sin(wx * 0.07) * 3 + wx * 0.12) * 0.5 + 0.5) * 0.4;
    const f = Math.max(0, Math.min(cols.length - 1.001, (v - 0.25) * 2.6 * (cols.length - 1) / 2)), k = Math.floor(f), dith = (f - k) * 16 > BAYER[(py % 4) * 4 + (px % 4)] ? 1 : 0;
    const col = cols[Math.min(cols.length - 1, k + dith)], i = (py * GW + px) * 4;
    d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
  }
  c.putImageData(img, 0, 0);
}
function laneGround(L) {
  if (L.gcv) return L.gcv;
  const z = Z[L.zone], cv = canvas(GW, T), c = cv.getContext('2d');
  const tx = (px) => Math.floor(px / T) + GX0;
  if (L.type === 'grass' || L.type === 'slime') {
    noiseFill(c, L, [z.gd, z.g, z.gl], z.kind, 0);
    for (let col = GX0; col < GX1; col++) {
      const x = (col - GX0) * T, h = (k) => hash(col, L.row, k);
      if (z.kind === 'grass') {
        for (let i = 0; i < 2; i++) { if (h(120 + i) > 0.55) continue; const gx = x + 2 + ((h(122 + i) * 11) | 0), gy = 4 + ((h(124 + i) * 9) | 0); R(c, gx, gy + 2, 5, 1, z.gd); R(c, gx, gy, 1, 2, z.gl); R(c, gx + 2, gy - 1, 1, 3, z.bl); R(c, gx + 4, gy, 1, 2, z.gl); }
        for (let i = 0; i < 3; i++) { const gx = x + ((h(i + 40) * 14) | 0), gy = (h(i + 60) * 13) | 0; R(c, gx, gy, 1, 2, z.bl); R(c, gx + 1, gy + 1, 1, 1, z.gd); }
        if (z.flowers && h(70) < 0.22) {
          const fl = [['#ff6b6b', '#c83a4a'], ['#ffd93b', '#d8a020'], ['#ffffff', '#c8c8dc'], ['#c38bff', '#8a5ad0'], ['#ff9ad0', '#d8609a']], [fc, fd] = fl[(h(71) * fl.length) | 0];
          const fx = x + 3 + ((h(72) * 10) | 0), fy = 3 + ((h(73) * 8) | 0);
          R(c, fx, fy + 2, 1, 3, '#2f7a2a'); R(c, fx + 1, fy + 3, 2, 1, '#4caa3c'); R(c, fx - 1, fy, 3, 1, fc); R(c, fx, fy - 1, 1, 3, fc); R(c, fx - 1, fy + 1, 1, 1, fd); R(c, fx + 1, fy + 1, 1, 1, fd); R(c, fx, fy, 1, 1, '#f5a623');
        }
      } else if (z.kind === 'sand') {
        for (let i = 0; i < 3; i++) if (h(140 + i) < 0.4) { const sx = x + ((h(143 + i) * 14) | 0), sy = (h(146 + i) * 14) | 0; R(c, sx, sy, 1, 1, z.bl); R(c, sx + 1, sy, 1, 1, z.gd); }
        if (h(150) < 0.06) { R(c, x + 6, 8, 3, 2, '#f4ece0'); R(c, x + 6, 10, 3, 1, z.gd); R(c, x + 7, 8, 1, 1, '#ffffff'); }
        if (h(151) < 0.05) { R(c, x + 4, 6, 1, 4, '#c8b8a0'); R(c, x + 2, 7, 5, 1, '#c8b8a0'); }   // ossinho
      } else if (z.kind === 'snow') {
        if (h(160) < 0.28) { const sx = x + 2 + ((h(161) * 8) | 0), sy = 4 + ((h(162) * 8) | 0); R(c, sx, sy, 6, 1, '#ffffff'); R(c, sx - 1, sy + 1, 8, 1, '#ffffff'); R(c, sx, sy + 2, 6, 1, '#c8d4ea'); }
        for (let i = 0; i < 2; i++) if (h(165 + i) < 0.4) R(c, x + ((h(167 + i) * 15) | 0), (h(169 + i) * 15) | 0, 1, 1, '#ffffff');
        if (h(171) < 0.05) { R(c, x + 4, 9, 2, 1, '#8aa0bc'); R(c, x + 9, 6, 2, 1, '#8aa0bc'); }   // pegadas
      } else if (z.kind === 'moon') {
        if (h(180) < 0.18) { const cx = x + 3 + ((h(181) * 6) | 0), cy = 4 + ((h(182) * 4) | 0), w = 6 + ((h(183) * 3) | 0); R(c, cx, cy, w, 4, z.gd); R(c, cx + 1, cy + 1, w - 2, 2, shade(z.gd, 0.85)); R(c, cx, cy, w, 1, shade(z.gd, 0.8)); R(c, cx, cy + 4, w, 1, z.bl); }
        for (let i = 0; i < 3; i++) if (h(185 + i) < 0.4) R(c, x + ((h(188 + i) * 15) | 0), (h(191 + i) * 15) | 0, 1, 1, i ? z.bl : shade(z.gd, 0.8));
      }
    }
    if (L.type === 'slime') {   // gosma pelo caminho dos slimes
      const goo = SLIME_COL[L.zone][0];
      for (let col = GX0; col < GX1; col++) { const x = (col - GX0) * T; if (hash(col, L.row, 200) < 0.35) { c.globalAlpha = 0.35; R(c, x + 3, 7, 9, 4, goo); c.globalAlpha = 0.25; R(c, x + 2, 8, 11, 2, goo); c.globalAlpha = 0.4; R(c, x + 5, 7, 3, 1, '#ffffff'); c.globalAlpha = 1; } }
    }
  } else if (L.type === 'road') {
    const [m, d, l] = z.road;
    noiseFill(c, L, [d, m, l], 'road', 5, 12);
    for (let col = GX0; col < GX1; col++) {
      const x = (col - GX0) * T, h = (k) => hash(col, L.row, k);
      R(c, x, 3, 16, 1, shade(d, 0.9)); R(c, x, 12, 16, 1, shade(d, 0.9));     // marcas de roda
      R(c, x + ((h(1) * 10) | 0), 4, 4, 1, l);
      if (h(2) < 0.4) { const px = x + 2 + ((h(3) * 11) | 0), py = 6 + ((h(4) * 4) | 0); R(c, px, py, 3, 2, shade(m, 0.8)); R(c, px, py, 2, 1, shade(l, 1.1)); }
      if (L.zone === 'lacrimora' && h(5) < 0.5) { R(c, x + 1, 6, 6, 4, shade(m, 1.1)); R(c, x + 9, 1, 6, 4, shade(m, 1.05)); R(c, x + 1, 6, 6, 1, l); }   // pedras do calçamento
    }
    R(c, 0, 0, GW, 1, shade(d, 0.75)); R(c, 0, T - 1, GW, 1, 'rgba(0,0,0,0.25)');
  } else if (L.type === 'rail') {
    noiseFill(c, L, ['#5a5560', '#76707c', '#948e98'], 'gravel', 9, 4);
    for (let col = GX0; col < GX1; col++) {
      const x = (col - GX0) * T;
      for (const sx of [1, 9]) { R(c, x + sx, 1, 6, 14, '#5a3a22'); R(c, x + sx, 1, 6, 1, '#8a5a36'); R(c, x + sx, 14, 6, 1, '#3a2414'); R(c, x + sx + 1, 4, 1, 8, '#4a2e1a'); }
    }
    for (const ry of [4, 10]) { R(c, 0, ry, GW, 2, '#9aa0b0'); R(c, 0, ry, GW, 1, '#e8ecf4'); R(c, 0, ry + 2, GW, 1, '#3a3a48'); }
    for (let col = GX0; col < GX1; col++) { const x = (col - GX0) * T; R(c, x + 3, 3, 2, 1, '#4a4a58'); R(c, x + 3, 9, 2, 1, '#4a4a58'); R(c, x + 11, 3, 2, 1, '#4a4a58'); R(c, x + 11, 9, 2, 1, '#4a4a58'); }
  } else if (L.type === 'river') {
    const [a, b] = z.water;
    R(c, 0, 0, GW, T, a);
    c.fillStyle = b;
    for (let py = 0; py < T; py += 2) for (let px = (py >> 1) % 2; px < GW; px += 2) if (hash((px + GX0 * T) >> 3, (L.row * T + py) >> 2, 37) < 0.35) c.fillRect(px, py, 1, 1);
    if (L.zone === 'lua') for (let i = 0; i < GW / 10; i++) { const sx = (hash(i, L.row, 3) * GW) | 0, sy = (hash(i, L.row, 4) * T) | 0; R(c, sx, sy, 1, 1, hash(i, L.row, 5) < 0.3 ? '#ffe9a8' : '#c8c0ff'); }
  }
  L.gcv = cv;
  return cv;
}
export function drawGround(c, L, x0, x1, ox, y, t, up, down) {
  const cv = laneGround(L), sx = (x0 - GX0) * T, w = (x1 - x0 + 1) * T;
  c.drawImage(cv, Math.max(0, sx), 0, Math.min(w, GW - Math.max(0, sx)), T, ox + Math.max(x0, GX0) * T, y, Math.min(w, GW - Math.max(0, sx)), T);
  const z = Z[L.zone];
  if (L.type === 'river') {
    // marolas que correm com a correnteza, brilhos e espuma na margem
    const hi = shade(z.water[0], 1.3), lo = z.water[1], flow = t * 10 * (L.dir || 0.3);
    for (let col = x0; col <= x1; col++) {
      const x = ox + col * T;
      for (let i = 0; i < 2; i++) {
        const wx = x + ((((hash(col, L.row, i) * 9) | 0) + flow + i * 5) % 16 + 16) % 16 - 3, wy = y + 3 + i * 6 + ((hash(col, L.row, i + 5) * 3) | 0);
        R(c, wx, wy + 1, 2, 1, hi); R(c, wx + 2, wy, 2, 1, hi); R(c, wx + 4, wy + 1, 2, 1, hi); R(c, wx + 1, wy + 2, 5, 1, lo);
      }
      if (Math.sin(t * 3 + col * 1.7 + L.row) > 0.92) R(c, x + 4 + ((hash(col, L.row, 10) * 8) | 0), y + 6, 1, 1, '#ffffff');
    }
    const shore = (yy, dir) => {
      const land = Z[(up && dir < 0 ? up : down || L).zone] || z;
      for (let px = (x0 * T); px < (x1 + 1) * T; px += 2) {
        const n = 1 + Math.round((Math.sin((px + L.row * 37) * 0.45) + Math.sin((px * 0.17) + t * 2) * 0.6) * 0.6 + 0.6);
        const xx = ox + px;
        c.globalAlpha = 0.3; R(c, xx, dir < 0 ? yy : yy - n - 3, 2, n + 3, '#ffffff'); c.globalAlpha = 1;
        R(c, xx, dir < 0 ? yy : yy - n - 1, 2, n + 1, '#eef8ff');
        R(c, xx, dir < 0 ? yy : yy - n, 2, n, shade(land.g || '#5a9e46', 0.82));
        R(c, xx, dir < 0 ? yy : yy - Math.max(1, n - 1), 2, Math.max(1, n - 1), land.g || '#5a9e46');
      }
    };
    if (up && up.type !== 'river') shore(y, -1);
    if (down && down.type !== 'river') shore(y + T, 1);
  } else if (L.type === 'road' || L.type === 'rail') {
    // a grama do lado invade um pouco a borda (tufos), sem corte reto
    for (const [nb, edgeY] of [[up, y], [down, y + T - 2]]) {
      if (!nb || (nb.type !== 'grass' && nb.type !== 'slime')) continue;
      const g = Z[nb.zone].g;
      for (let col = x0; col <= x1; col++) for (let k = 0; k < 16; k += 2) if (hash(col * 16 + k, L.row, edgeY === y ? 13 : 14) < 0.65) R(c, ox + col * T + k, edgeY + (edgeY === y ? 0 : 1 - ((hash(col + k, L.row, 15) * 2) | 0)), 2, 1 + ((hash(col + k, L.row, 16) * 2) | 0), g);
    }
  } else if (up && up.type !== L.type && (up.type === 'road' || up.type === 'rail')) {
    R(c, ox + x0 * T, y, (x1 - x0 + 1) * T, 1, 'rgba(0,0,0,0.12)');
  }
}

// ---------------------------------------------------------------- coisas que boiam
export function drawFloaters(c, L, ox, y, t) {
  if (L.type !== 'river') return;
  for (const o of L.objs) {
    const x = Math.round(ox + o.x), bob = Math.round(Math.sin(t * 2.4 + o.x * 0.05) * 0.6);
    if (L.lily) { c.drawImage(lilyArt(hash(o.x, L.row, 1) < 0.35 ? 1 : 0, L.zone), x - 1, y - 1 + bob); continue; }
    // ondinhas em volta do que boia
    c.globalAlpha = 0.5; R(c, x - 2, y + 13, o.w + 4, 1, '#ffffff'); c.globalAlpha = 1;
    c.drawImage(floatArt(L.zone, o.w, o.kind), x - 1, y + 1 + bob);
  }
}
function lilyArt(flower, zone) {
  return sprite(`lily:${flower}:${zone}`, 16, 16, (c) => {
    const pal = zone === 'lacrimora' ? ['#3a6a9a', '#5a8ac8', '#8ab8f0'] : zone === 'lua' ? ['#5a5e7a', '#7a7e9a', '#a8acc4'] : ['#1f6a2c', '#2f8a3a', '#5ab858'];
    for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
      const nx = (px + 0.5 - 8) / 7, ny = (py + 0.5 - 8.5) / 6, d = nx * nx + ny * ny;
      if (d > 1) continue;
      if (px >= 8 && px <= 9 && py < 8 && py > 1) continue;   // a fenda da folha
      const l = -nx * 0.5 - ny * 0.8; R(c, px, py, 1, 1, l > 0.4 ? pal[2] : l > -0.2 ? pal[1] : pal[0]);
    }
    for (let k = 0; k < 4; k++) R(c, 8, 8, -k - 2, 1, pal[0]);
    if (flower) { R(c, 4, 6, 3, 3, '#ffffff'); R(c, 5, 5, 1, 5, '#ffd0e8'); R(c, 3, 7, 5, 1, '#ffd0e8'); R(c, 5, 7, 1, 1, '#ffd93b'); }
  });
}
function floatArt(zone, w, kind) {
  return sprite(`float:${zone}:${w}:${kind % 2}`, w, 14, (c) => {
    if (zone === 'neve') {   // placa de gelo com rachaduras
      R(c, 0, 1, w, 12, '#bfe4f8'); R(c, 1, 0, w - 2, 1, '#e8f8ff'); R(c, 0, 1, w, 3, '#e8f8ff'); R(c, 0, 10, w, 3, '#86b8dc');
      for (let k = 6; k < w - 4; k += 9) { R(c, k, 4, 1, 3, '#86b8dc'); R(c, k + 1, 6, 2, 1, '#86b8dc'); }
      R(c, 2, 2, 5, 1, '#ffffff'); return;
    }
    if (zone === 'lua' || zone === 'lacrimora') {   // pedra flutuante / jangada de cristal
      const [m, h, d] = zone === 'lua' ? ['#7a7e96', '#a8acc4', '#4e5268'] : ['#4a8ab8', '#9ae8ff', '#2a5080'];
      R(c, 1, 1, w - 2, 12, m); R(c, 0, 3, w, 8, m); R(c, 1, 1, w - 2, 3, h); R(c, 0, 9, w, 3, d);
      for (let k = 4; k < w - 3; k += 7) { R(c, k, 5, 3, 2, d); R(c, k, 5, 2, 1, h); }
      if (zone === 'lacrimora') for (let k = 3; k < w - 2; k += 10) { R(c, k, -1, 2, 4, '#e8fbff'); R(c, k + 1, 0, 1, 3, '#7af0ff'); }
      return;
    }
    // tronco: casca com sulcos, luz em cima, sombra embaixo, anéis nas pontas e às vezes musgo
    R(c, 0, 1, w, 12, '#7a4e2a');
    R(c, 0, 1, w, 3, '#a8743e'); R(c, 0, 2, w, 1, '#c08850'); R(c, 0, 10, w, 3, '#5a3418'); R(c, 0, 12, w, 1, '#3e2410');
    for (let k = 3; k < w - 3; k += 5) { R(c, k, 5, 3, 1, '#5a3418'); R(c, k + 2, 8, 3, 1, '#5a3418'); R(c, k + 1, 4, 1, 1, '#c08850'); }
    for (const ex of [0, w - 4]) { R(c, ex, 1, 4, 12, '#d8a868'); R(c, ex + 1, 3, 2, 8, '#b88448'); R(c, ex + 1, 5, 2, 4, '#e8c088'); R(c, ex + 1, 6, 2, 2, '#a07038'); }
    if (kind % 2) for (let k = 6; k < w - 6; k += 11) { R(c, k, 1, 4, 2, '#4c8a3a'); R(c, k + 1, 0, 2, 1, '#6aa858'); }
  });
}

// ---------------------------------------------------------------- coisas em pé
export function drawUpright(c, L, x0, x1, ox, y, t) {
  const z = Z[L.zone];
  if (L.type === 'grass') {
    const tree = (col, blocking) => {
      const v = (hash(col, L.row, 2) * 3) | 0, kind = z.trees[(hash(col, L.row, 7) * z.trees.length) | 0], x = ox + col * T;
      // sombra oval no chão
      c.globalAlpha = 0.22; R(c, x + 3, y + 12, 10, 3, '#000000'); R(c, x + 5, y + 11, 6, 5, '#000000'); c.globalAlpha = 1;
      if (blocking && hash(col, L.row, 3) < 0.28) { c.drawImage(boulderArt(z.rock, v, z.moss), x, y - 2); return; }
      c.drawImage(treeArt(kind, v), x, y - 6);
    };
    for (const col of L.deco) if (col >= x0 && col <= x1) tree(col, false);
    for (const col of L.block) if (col >= x0 && col <= x1) tree(col, true);
  } else if (L.type === 'road') {
    for (const o of L.objs) vehicle(c, L, o, Math.round(ox + o.x), y, t);
  } else if (L.type === 'rail') {
    // semáforo do trem: pisca vermelho quando ele está para passar
    const px = ox - T + 2, warn = L.train || L.timer < 1.3, on = Math.floor(t * 4) % 2;
    c.drawImage(signalArt(), px - 2, y - 14);
    if (warn) { R(c, px + 1, y - 3, 3, 3, on ? '#ff3a3a' : '#5a2020'); R(c, px + 10, y - 3, 3, 3, on ? '#5a2020' : '#ff3a3a'); c.globalAlpha = 0.3; R(c, on ? px - 2 : px + 7, y - 6, 10, 10, '#ff3a3a'); c.globalAlpha = 1; }
    if (L.train) train(c, L, Math.round(ox + L.train.x), y, L.train.w, t);
  } else if (L.type === 'slime') {
    for (const o of L.objs) slime(c, L, Math.round(ox + o.x), y, o.ph, t);
  }
}
function signalArt() {
  return sprite('signal', 16, 28, (c) => {
    R(c, 7, 6, 2, 22, '#4a4a58'); R(c, 7, 6, 1, 22, '#7a7a90');
    R(c, 1, 4, 14, 3, '#f0f0f8'); R(c, 6, 0, 4, 12, '#f0f0f8'); R(c, 1, 4, 14, 1, '#c84a3a');   // cruz de aviso
    R(c, 1, 9, 5, 5, '#1a1a24'); R(c, 10, 9, 5, 5, '#1a1a24'); R(c, 2, 10, 3, 3, '#5a2020'); R(c, 11, 10, 3, 3, '#5a2020');
    R(c, 4, 26, 8, 2, '#3a3a48');
  });
}

// ---------------------------------------------------------------- veículos (sprites com contorno, virados para onde andam)
function vehicle(c, L, o, x, y, t) {
  const z = Z[L.zone], kind = z.cart, big = o.w >= 3 * T, fr = Math.floor(t * 8 + o.x * 0.05) % 2;
  const key = `veh:${kind}:${big ? 1 : 0}:${o.kind}:${fr}`, w = o.w, h = 24;
  let spr = sprite(key, w, h, (g) => paintVehicle(g, kind, w, h, big, o.kind, fr));
  if (L.dir < 0) spr = flipped(key, spr);
  c.globalAlpha = 0.25; R(c, x + 2, y + 12, w - 4, 3, '#000000'); c.globalAlpha = 1;
  c.drawImage(spr, x - 1, y - 10);
}
function wheel(g, x, y, r, fr, rim = '#3a2a1a', hub = '#c8a060') {
  for (let py = -r; py <= r; py++) for (let px = -r; px <= r; px++) { const d = Math.hypot(px, py); if (d <= r + 0.3) R(g, x + px, y + py, 1, 1, d > r - 1.2 ? rim : '#7a5a3a'); }
  const a = fr ? 0.8 : 0; for (let k = 0; k < 4; k++) { const an = a + k * Math.PI / 2; R(g, Math.round(x + Math.cos(an) * (r - 1.5)), Math.round(y + Math.sin(an) * (r - 1.5)), 1, 1, '#4a3420'); }
  R(g, x, y, 1, 1, hub);
}
// animal que puxa: desenhado olhando para a direita (frente do sprite)
function animal(g, kind, ax, fr) {
  const P = {
    horse: ['#7a4a2a', '#9a6a3e', '#5a3418', '#2a1a10'], camel: ['#c89a5a', '#e0b878', '#a07a42', '#5a4020'],
    reindeer: ['#8a6a4a', '#a8865e', '#6a4a30', '#f4f0e8'], unicorn: ['#e8e8f8', '#ffffff', '#b8b8d8', '#c08aff'],
  }[kind];
  const [m, l, d, mane] = P, legA = fr ? 1 : 0;
  // corpo
  R(g, ax, 12, 11, 6, m); R(g, ax, 12, 11, 2, l); R(g, ax, 17, 11, 1, d);
  if (kind === 'camel') { R(g, ax + 2, 9, 5, 4, m); R(g, ax + 3, 8, 3, 1, l); }
  // pescoço e cabeça
  R(g, ax + 9, 7, 3, 7, m); R(g, ax + 9, 7, 1, 7, l); R(g, ax + 10, 5, 5, 4, m); R(g, ax + 10, 5, 5, 1, l); R(g, ax + 14, 7, 1, 2, d);
  R(g, ax + 12, 6, 1, 1, '#1a1226'); R(g, ax + 10, 4, 1, 2, d);
  if (kind === 'horse' || kind === 'unicorn') { R(g, ax + 8, 6, 2, 7, mane); R(g, ax + 9, 4, 2, 2, mane); R(g, ax - 2, 13, 2, 5, mane); }
  if (kind === 'unicorn') { R(g, ax + 13, 1, 1, 4, '#ffe070'); R(g, ax + 13, 1, 1, 1, '#ffffff'); }
  if (kind === 'reindeer') { R(g, ax + 10, 1, 1, 4, mane); R(g, ax + 9, 1, 1, 1, mane); R(g, ax + 12, 0, 1, 4, mane); R(g, ax + 13, 1, 1, 1, mane); R(g, ax + 14, 7, 1, 1, '#ff3a3a'); }
  if (kind === 'camel') R(g, ax - 1, 13, 1, 3, d);
  // pernas (duas posições)
  for (const [lx, ph] of [[ax + 1, 0], [ax + 3, 1], [ax + 7, 1], [ax + 9, 0]]) R(g, lx + (ph ^ legA ? 1 : 0), 18, 2, 4 - (ph ^ legA), d);
  // arreio
  R(g, ax + 5, 12, 1, 6, '#c83a3a'); R(g, ax - 3, 14, 4, 1, '#3a2a1a');
}
function paintVehicle(g, kind, w, h, big, variant, fr) {
  if (kind === 'rover') {   // jipe lunar: sem animal, painel solar e antena
    R(g, 2, 9, w - 4, 8, '#d8dce8'); R(g, 2, 9, w - 4, 2, '#ffffff'); R(g, 2, 15, w - 4, 2, '#9aa0b4');
    R(g, w - 12, 5, 9, 5, '#7fd3ff'); R(g, w - 12, 5, 9, 1, '#e0f8ff'); R(g, w - 12, 4, 9, 1, '#9aa0b4');
    R(g, 4, 6, 12, 3, '#2a3a8a'); for (let k = 5; k < 16; k += 3) R(g, k, 6, 1, 3, '#5a7ae8');
    R(g, 7, 0, 1, 6, '#9aa0b4'); R(g, 6, 0, 3, 1, Math.floor(fr) ? '#ff5a4a' : '#ffd0c0');
    for (let k = 0; k < (big ? 4 : 3); k++) wheel(g, 6 + k * Math.floor((w - 12) / ((big ? 4 : 3) - 1)), 19, 3, fr, '#2a2a36', '#c8c8d8');
    if (big) { R(g, 18, 10, w - 34, 5, '#c8ccd8'); R(g, 20, 11, 6, 3, '#7fd3ff'); }
    return;
  }
  const ax = w - 16, cw = w - 18;   // animal na frente (direita); carroça atrás
  animal(g, kind, ax, fr);
  if (kind === 'reindeer') {   // trenó vermelho com esquis
    R(g, 1, 9, cw, 8, '#c83a3a'); R(g, 1, 9, cw, 2, '#e8604e'); R(g, 1, 15, cw, 2, '#8a2418'); R(g, 1, 9, cw, 1, '#ffd070');
    R(g, 0, 19, cw + 4, 1, '#c8a040'); R(g, cw + 2, 17, 2, 2, '#c8a040'); R(g, 2, 17, 1, 2, '#c8a040'); R(g, cw - 4, 17, 1, 2, '#c8a040');
    for (let k = 3; k < cw - 2; k += 5) { R(g, k, 5, 4, 4, ['#3a8a4a', '#e8c040', '#3a6ad8'][(k / 5) % 3 | 0]); R(g, k + 1, 5, 2, 4, '#ffffff'); }   // presentes
    return;
  }
  const wood = kind === 'unicorn' ? ['#6a4aa8', '#8a6ac8', '#4a2a7a'] : kind === 'camel' ? ['#b07a42', '#c89a5a', '#7a5228'] : ['#9a6a3a', '#b88850', '#6a4422'];
  if (big) {   // carruagem fechada com janela, porta e lanterna
    const body = kind === 'unicorn' ? ['#7a5ac8', '#a08ae8', '#4a2a8a'] : kind === 'camel' ? ['#d8c09a', '#f0dcb8', '#a8906a'] : ['#2a5aa8', '#4a7ad8', '#1a3a78'];
    R(g, 1, 4, cw, 14, body[0]); R(g, 1, 4, cw, 2, body[1]); R(g, 1, 16, cw, 2, body[2]); R(g, 0, 2, cw + 2, 2, body[2]); R(g, 2, 1, cw - 2, 1, body[2]);
    R(g, 1, 6, cw, 1, '#e0b040'); R(g, 1, 14, cw, 1, '#e0b040');
    R(g, 4, 7, 7, 5, '#ffe9a8'); R(g, 4, 7, 7, 1, '#ffffff'); R(g, 4, 7, 2, 5, '#c83a3a'); R(g, 9, 7, 2, 5, '#c83a3a');
    R(g, cw - 10, 7, 7, 5, '#ffe9a8'); R(g, cw - 10, 7, 2, 5, '#c83a3a'); R(g, cw - 5, 7, 2, 5, '#c83a3a');
    R(g, (cw >> 1) - 2, 7, 5, 9, body[2]); R(g, (cw >> 1) + 1, 11, 1, 1, '#e0b040');
    R(g, cw, 6, 2, 3, '#ffd070');
    if (kind === 'camel') for (let k = 2; k < cw; k += 6) R(g, k, 4, 3, 2, '#c84a3a');   // toldo listrado
    wheel(g, 6, 19, 4, fr); wheel(g, cw - 4, 19, 4, fr);
    return;
  }
  // carroça aberta com carga: feno, barris ou caixotes
  R(g, 1, 9, cw, 8, wood[0]); R(g, 1, 9, cw, 1, wood[1]); R(g, 1, 13, cw, 1, wood[2]); R(g, 1, 16, cw, 1, wood[2]);
  for (let k = 4; k < cw; k += 5) R(g, k, 9, 1, 8, wood[2]);
  if (variant === 0) { R(g, 2, 4, cw - 2, 6, '#e8c860'); R(g, 3, 3, cw - 4, 1, '#f4dc80'); for (let k = 3; k < cw - 1; k += 3) R(g, k, 5, 1, 4, '#c8a040'); }
  else if (variant === 1) for (let k = 2; k < cw - 4; k += 6) { R(g, k, 3, 5, 7, '#8a5a32'); R(g, k, 4, 5, 1, '#c8c8d8'); R(g, k, 8, 5, 1, '#c8c8d8'); R(g, k + 1, 3, 2, 7, '#a8744a'); }
  else for (let k = 2; k < cw - 4; k += 7) { R(g, k, 2, 6, 7, '#c8a060'); R(g, k, 2, 6, 1, '#e8c888'); R(g, k + 2, 4, 2, 3, '#8a6a3a'); }
  if (kind === 'camel') { R(g, 1, 1, cw, 2, '#e8dcc0'); for (let k = 1; k < cw; k += 4) R(g, k, 1, 2, 2, '#c84a3a'); }
  wheel(g, 5, 19, 4, fr); wheel(g, cw - 4, 19, 4, fr);
}

// ---------------------------------------------------------------- Trem Infinito (o mesmo do Song of Moonlight)
// Vagões em cores alternadas (vermelho, azul, dourado e verde), teto prateado com respiros, friso dourado, janelas
// acesas com passageiros, sanfona entre os vagões e rodas com raios. O da frente tem farol.
const CAR_COLORS = [['#c8443a', '#e8685a', '#8a2a24'], ['#3a6ac0', '#5a8ae0', '#264a8a'], ['#d8a830', '#f0c850', '#9a7418'], ['#3a9a5a', '#5ac07a', '#246a3a']];
function train(c, L, x, y, w, t) {
  const n = Math.floor(w / (3 * T)), right = L.dir > 0, fr = Math.floor(t * 12) % 2;
  c.globalAlpha = 0.3; R(c, x, y + 13, w, 3, '#000000'); c.globalAlpha = 1;
  for (let i = 0; i < n; i++) {
    const front = right ? i === n - 1 : i === 0, ci = (L.row + i) % 4, key = `car:${ci}:${front ? (right ? 'r' : 'l') : 'm'}:${fr}`;
    if (front) { c.drawImage(sprite(`loco:${right ? 'r' : 'l'}:${fr}`, 48, 28, (g) => paintLoco(g, right, fr)), x + i * 3 * T - 1, y - 13); continue; }
    c.drawImage(sprite(key, 48, 24, (g) => paintCar(g, ci, 0, fr, L.row + i)), x + i * 3 * T - 1, y - 9);
  }
  // fumaça da chaminé da locomotiva (sobe e fica para trás)
  const chx = right ? x + w - 3 * T + 33 : x + 14;
  for (let k = 0; k < 4; k++) {
    const p = (t * 1.6 + k / 4) % 1, sx = Math.round(chx - L.dir * p * 22), sy = Math.round(y - 14 - p * 12), r = 2 + Math.round(p * 3);
    c.globalAlpha = 0.75 * (1 - p); R(c, sx - r, sy - r + 1, r * 2, r * 2 - 2, '#d8d8e4'); R(c, sx - r + 1, sy - r, r * 2 - 2, r * 2, '#d8d8e4'); R(c, sx - r + 1, sy - r + 1, r, 1, '#ffffff');
  }
  c.globalAlpha = 1;
  // farol iluminando os trilhos à frente
  const hx = right ? x + w : x;
  c.globalAlpha = 0.18; c.fillStyle = '#fff4a0'; c.beginPath(); c.moveTo(hx, y + 4); c.lineTo(hx + (right ? 60 : -60), y - 6); c.lineTo(hx + (right ? 60 : -60), y + 16); c.fill(); c.globalAlpha = 1;
}
// locomotiva com o maquinista (igual à do Trem Infinito: caldeira vermelha, cabine azul, chaminé e farol)
// baixinha de propósito: passa pela fileira sem tampar quase nada da fileira de cima
function paintLoco(g, right, fr) {
  if (!right) { g.translate(48, 0); g.scale(-1, 1); }
  const by = 25, O = '#1a1a24';
  R(g, 0, by - 5, 46, 3, '#2a2a34'); R(g, 1, by - 5, 44, 1, '#4a4a58');                                  // chassi
  for (let i = 0; i < 4; i++) R(g, 42 + i, by - 5 + i, 1, 5 - i, i % 2 ? '#8a8a9c' : '#c8ccd8');           // limpa-trilhos
  // cabine azul com o maquinista na janela
  R(g, 1, by - 21, 16, 16, '#3a6ac0'); R(g, 1, by - 21, 16, 1, '#5a8ae0'); R(g, 1, by - 21, 1, 16, '#5a8ae0'); R(g, 15, by - 21, 2, 16, '#264a8a');
  R(g, 0, by - 23, 18, 2, '#8a8a9c'); R(g, 0, by - 23, 18, 1, '#c8ccd8');
  R(g, 1, by - 8, 16, 1, '#f0d068');
  R(g, 4, by - 19, 10, 9, O); R(g, 5, by - 18, 8, 7, '#ffe9a8');
  R(g, 7, by - 15, 5, 4, '#f0c8a0'); R(g, 6, by - 18, 7, 2, '#2a3a6a'); R(g, 6, by - 16, 8, 1, '#1a2448');    // rosto e boné
  R(g, 8, by - 14, 1, 1, O); R(g, 11, by - 14, 1, 1, O); R(g, 8, by - 12, 3, 1, '#c87a5a');                  // olhos e bigode
  // caldeira vermelha com faixas douradas
  R(g, 17, by - 15, 23, 10, '#c8443a'); R(g, 17, by - 15, 23, 2, '#e8685a'); R(g, 17, by - 7, 23, 2, '#8a2a24'); R(g, 17, by - 14, 23, 1, '#ff9a8a');
  for (const bx of [22, 30]) { R(g, bx, by - 15, 2, 10, '#d8a830'); R(g, bx, by - 15, 2, 1, '#f0c850'); }
  R(g, 39, by - 15, 5, 11, '#2a2a34'); R(g, 39, by - 15, 5, 1, '#4a4a58');                                // frente
  R(g, 42, by - 14, 4, 4, O); R(g, 43, by - 13, 3, 2, '#fff4a0'); R(g, 43, by - 13, 1, 1, '#ffffff');        // farol
  R(g, 32, by - 22, 5, 7, '#2a2a34'); R(g, 31, by - 24, 7, 2, '#3a3a48'); R(g, 31, by - 24, 7, 1, '#6a6a7c'); R(g, 33, by - 21, 1, 5, '#4a4a58');   // chaminé
  R(g, 24, by - 18, 5, 3, '#d8a830'); R(g, 25, by - 19, 3, 1, '#f0c850'); R(g, 25, by - 18, 1, 2, '#fff2a0');   // domo
  // rodas: duas grandes com biela, uma pequena atrás e uma na frente
  const wheel = (wx, rad) => {
    const cy = by + 2 - rad;
    for (let py = -rad; py <= rad; py++) for (let px = -rad; px <= rad; px++) { const d = Math.hypot(px, py); if (d <= rad + 0.3) R(g, wx + px, cy + py, 1, 1, d > rad - 1.1 ? O : d < 1 ? '#e8c060' : '#c83a3a'); }
    const an = fr ? 0.8 : 0; R(g, Math.round(wx + Math.cos(an) * (rad - 1.5)), Math.round(cy + Math.sin(an) * (rad - 1.5)), 1, 1, '#ffd0c8'); R(g, Math.round(wx - Math.cos(an) * (rad - 1.5)), Math.round(cy - Math.sin(an) * (rad - 1.5)), 1, 1, '#ffd0c8');
  };
  wheel(8, 3); wheel(22, 4); wheel(32, 4); wheel(41, 3);
  const ry = by - 3 + (fr ? -1 : 0); R(g, 21, ry, 12, 1, '#c8ccd8'); R(g, 21, ry, 1, 1, '#ffffff'); R(g, 32, ry, 1, 1, '#ffffff');
  g.setTransform(1, 0, 0, 1, 0, 0);
}
// vagão de passageiros, também baixinho
function paintCar(g, ci, front, fr, seed) {
  const [col, hi, lo] = CAR_COLORS[ci], by = 21, cw = 44;
  R(g, cw, by - 16, 4, 11, '#2a2a34'); for (let yy = by - 15; yy < by - 6; yy += 3) R(g, cw, yy, 4, 1, '#4a4a58');   // sanfona
  R(g, 0, by - 5, cw, 3, '#2a2a34'); R(g, 1, by - 5, cw - 2, 1, '#4a4a58');
  R(g, 1, by - 17, cw - 2, 12, col); R(g, 1, by - 17, cw - 2, 1, hi); R(g, 1, by - 7, cw - 2, 2, lo);
  R(g, 1, by - 17, 1, 12, hi); R(g, cw - 2, by - 17, 1, 12, lo);
  R(g, 1, by - 8, cw - 2, 1, '#f0d068');
  R(g, 2, by - 19, cw - 4, 2, '#8a8a9c'); R(g, 3, by - 20, cw - 6, 1, '#c8ccd8');                           // teto prateado
  for (let w = 0; w < 4; w++) {                                                                             // janelas acesas
    const wx = 4 + w * 10;
    R(g, wx, by - 15, 7, 6, '#1e1e28'); R(g, wx + 1, by - 14, 5, 4, '#ffe9a8'); R(g, wx + 1, by - 14, 5, 1, '#fff6d0');
    if (hash(seed, w, 3) < 0.45) { R(g, wx + 2, by - 13, 2, 1, '#3a2a3a'); R(g, wx + 1, by - 12, 4, 2, '#4a3a5a'); }
  }
  for (const wx of [7, 13, cw - 13, cw - 7]) {                                                              // rodas com raios
    for (let py = -3; py <= 3; py++) for (let px = -3; px <= 3; px++) { const d = Math.hypot(px, py); if (d <= 3.3) R(g, wx + px, by - 1 + py, 1, 1, d > 2.2 ? '#1a1a24' : '#5a5a6a'); }
    const an = fr ? 0.8 : 0; R(g, Math.round(wx + Math.cos(an) * 2), Math.round(by - 1 + Math.sin(an) * 2), 1, 1, '#c8c8d8'); R(g, Math.round(wx - Math.cos(an) * 2), Math.round(by - 1 - Math.sin(an) * 2), 1, 1, '#c8c8d8');
    R(g, wx, by - 1, 1, 1, '#e8c060');
  }
}

// ---------------------------------------------------------------- slime (o mesmo jeito do Song of Moonlight)
const SLIME_COL = { campo: ['#5ccf5c', '#3a9a3a', '#b8f5b8', '#2a6a2e'], floresta: ['#5ccf5c', '#3a9a3a', '#b8f5b8', '#2a6a2e'], deserto: ['#e0a05a', '#a87032', '#ffd8b3', '#7a4a22'], neve: ['#5a8ae0', '#3a5aa8', '#b8d0ff', '#28407a'], lacrimora: ['#a05ae0', '#6a32a8', '#e0b8ff', '#4a2278'], lua: ['#86dcec', '#3e9cb6', '#e0fbff', '#235f78'] };
function slime(c, L, x, y, ph, t) {
  const [col, d, hi, dd] = SLIME_COL[L.zone], hop = Math.max(0, Math.sin(ph)) * 5, s = Math.sin(ph) < -0.5 ? 0.6 : 0;
  c.globalAlpha = 0.3 - hop * 0.03; R(c, x + 3, y + 13, 10, 2, '#000000'); c.globalAlpha = 1;
  const rx = 6.6 + s * 2.4, ry = 6 - s * 2.2, cy = 14 - ry - hop;
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    const dx = (px + 0.5 - 8) / rx, dy = (py + 0.5 - cy) / (py + 0.5 < cy ? ry : ry * 1.15);
    if (dx * dx + dy * dy > 1 || py > 14 - hop) continue;
    const k = (py - (cy - ry)) / (ry * 2 + 0.01);
    R(c, x + px, y + py, 1, 1, k > 0.78 ? dd : k > 0.55 ? d : px < 5 && k < 0.5 ? hi : col);
  }
  const top = Math.round(cy - ry), ey = Math.round(cy - 1);
  R(c, x + 4, y + top + 2, 3, 1, '#ffffff');
  const look = L.dir > 0 ? 1 : 0;
  R(c, x + 4, y + ey, 3, 3, '#ffffff'); R(c, x + 9, y + ey, 3, 3, '#ffffff');
  R(c, x + 4 + look, y + ey + 1, 2, 2, '#1d1d2b'); R(c, x + 9 + look, y + ey + 1, 2, 2, '#1d1d2b');
  R(c, x + 7, y + ey + 3, 2, 1, dd);
}

// ---------------------------------------------------------------- moedas e portal
// Noz Mítica: noz rosa e dourada flutuando, com halo pulsando e faíscas (bem diferente de moeda)
export function drawMythNut(c, x, y, t) {
  const bob = Math.round(Math.sin(t * 3) * 2), cx = x + 8, cy = y + 5 + bob, pulse = 0.35 + Math.sin(t * 5) * 0.15;
  c.globalAlpha = 0.25; R(c, x + 3, y + 12, 10, 2, '#000000');
  c.globalAlpha = pulse; c.fillStyle = '#ff5a8a'; c.beginPath(); c.arc(cx, cy, 10, 0, 7); c.fill();
  c.globalAlpha = pulse * 0.8; c.fillStyle = '#fff0f6'; c.beginPath(); c.arc(cx, cy, 6, 0, 7); c.fill(); c.globalAlpha = 1;
  c.drawImage(sprite('mythnut', 10, 12, (g) => {
    R(g, 4, 0, 2, 2, '#6a3a1a');                                               // cabinho
    R(g, 1, 2, 8, 3, '#ffd23a'); R(g, 0, 3, 10, 2, '#ffd23a'); R(g, 1, 2, 8, 1, '#fff4b0'); R(g, 2, 4, 1, 1, '#c89a1a'); R(g, 6, 4, 1, 1, '#c89a1a');   // chapéu dourado
    R(g, 1, 5, 8, 4, '#ff5a8a'); R(g, 2, 9, 6, 1, '#ff5a8a'); R(g, 3, 10, 4, 1, '#d83a6a'); R(g, 4, 11, 2, 1, '#a82a52');   // corpo rosa
    R(g, 7, 5, 2, 4, '#d83a6a'); R(g, 2, 6, 2, 2, '#ffd0e0'); R(g, 2, 6, 1, 1, '#ffffff');
  }), cx - 6, cy - 7);
  for (let i = 0; i < 4; i++) { const a = t * 2.4 + i * Math.PI / 2, px = Math.round(cx + Math.cos(a) * 9), py = Math.round(cy + Math.sin(a) * 6); R(c, px, py, 1, 1, i % 2 ? '#ffffff' : '#ffd23a'); }
  if (Math.sin(t * 4) > 0.6) { R(c, cx + 5, cy - 9, 1, 3, '#ffffff'); R(c, cx + 4, cy - 8, 3, 1, '#ffffff'); }
}
export function drawCoin(c, x, y, v, t) {
  // moeda redonda girando (de frente fica um círculo; de lado, uma elipse fina), com borda, brilho e contorno
  const big = v > 1, spin = Math.abs(Math.cos(t * 3.5 + x * 0.13)), bob = Math.round(Math.sin(t * 3 + x) * 1.5);
  c.globalAlpha = 0.22; R(c, x + 4, y + 12, 8, 2, '#000000'); c.globalAlpha = 1;
  const r = big ? 5 : 4, rx = Math.max(0.6, r * spin), cx = x + 8, cy = y + 6 + bob - (big ? 1 : 0);
  const [m, l, d, e] = big ? ['#3ad890', '#b8ffe0', '#1a8a5a', '#0e5a3a'] : ['#ffc83a', '#fff2a0', '#c8861a', '#8a5a10'];
  for (let py = -r - 1; py <= r + 1; py++) for (let px = -Math.ceil(rx) - 1; px <= Math.ceil(rx) + 1; px++) {
    const nx = px / (rx + 0.5), ny = py / (r + 0.5), d2 = nx * nx + ny * ny, o = (px / (rx + 1.5)) ** 2 + (py / (r + 1.5)) ** 2;
    if (d2 <= 1) R(c, cx + px, cy + py, 1, 1, d2 > 0.6 ? (ny < 0 ? l : px > 0 ? e : d) : ny < -0.2 && nx < 0.2 ? l : m);
    else if (o <= 1) R(c, cx + px, cy + py, 1, 1, OUT);
  }
  if (rx > 2) R(c, cx, cy - 2, 1, 4, big ? '#e8fff4' : d);
  if (Math.sin(t * 5 + x) > 0.85) { R(c, cx + 3, cy - r - 1, 1, 3, '#ffffff'); R(c, cx + 2, cy - r, 3, 1, '#ffffff'); }
}
export function drawPortal(c, x, y, k, t) {
  // o mesmo portal violeta de Lacrímora do Song of Moonlight: disco com redemoinho e aro luminoso (32x32), abrindo com k
  if (k <= 0) return;
  const C = 7.5, ox = Math.round(x) - 16, oy = Math.round(y) - 16;
  c.globalAlpha = 0.25 * k; c.fillStyle = '#c47bff'; c.beginPath(); c.arc(x, y, 20 * k, 0, 7); c.fill(); c.globalAlpha = 1;
  for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
    const dx = xx - C, dy = yy - C, d = Math.hypot(dx, dy) / k;
    if (d > 7.9) continue;
    let color;
    if (d > 6.6) color = (xx + yy + Math.floor(t * 6)) % 4 === 0 ? '#f6d4ff' : '#c47bff';
    else {
      const ang = Math.atan2(dy, dx), wave = Math.sin(ang * 3 + d * 1.1 - t * 3.2) + Math.cos(d * 1.6 - t * 1.7);
      color = d < 1.8 ? '#f0b5ff' : wave > 1.0 ? '#d77bff' : wave > 0.2 ? '#b653e8' : wave > -0.7 ? '#913bc6' : '#69239c';
    }
    R(c, ox + xx * 2, oy + yy * 2, 2, 2, color);
  }
  for (let i = 0; i < 6; i++) { const a = t * 1.4 + i * 1.05, r = (5 + (i % 3) * 3) * k; R(c, x + Math.round(Math.cos(a) * r), y + Math.round(Math.sin(a) * r), 1, 1, '#ffffff'); }
}

// ---------------------------------------------------------------- clima de cada zona (por cima de tudo)
const PARTS = Array.from({ length: 46 }, (_, i) => ({ x: hash(i, 1, 1), y: hash(i, 2, 2), s: 0.5 + hash(i, 3, 3), p: hash(i, 4, 4) * 6.28 }));
export function drawWeather(c, zone, LW, LH, t, camPx) {
  for (const p of PARTS) {
    let x, y;
    if (zone === 'neve') {   // neve caindo
      x = ((p.x * LW + Math.sin(t * 0.8 + p.p) * 10 + t * 6 * p.s) % LW + LW) % LW; y = ((p.y * LH + t * 18 * p.s + camPx * 0.3) % LH + LH) % LH;
      R(c, x, y, p.s > 1.1 ? 2 : 1, p.s > 1.1 ? 2 : 1, '#ffffff');
    } else if (zone === 'deserto') {   // poeira levada pelo vento
      x = ((p.x * LW + t * 40 * p.s) % LW + LW) % LW; y = ((p.y * LH + camPx * 0.4 + Math.sin(t + p.p) * 4) % LH + LH) % LH;
      c.globalAlpha = 0.35; R(c, x, y, 3 + p.s * 3, 1, '#fff0c8'); c.globalAlpha = 1;
    } else if (zone === 'floresta' || zone === 'campo') {
      x = ((p.x * LW + Math.sin(t * 0.7 + p.p) * 14) % LW + LW) % LW; y = ((p.y * LH + camPx * 0.5 + t * 6 * p.s) % LH + LH) % LH;
      if (zone === 'floresta') { const on = Math.sin(t * 2 + p.p * 3); if (on > 0.2) { c.globalAlpha = on * 0.35; R(c, x - 1, y - 1, 3, 3, '#e8ff7a'); c.globalAlpha = 1; R(c, x, y, 1, 1, '#f8ffc8'); } }
      else if (p.s > 1.3) { const f = Math.sin(t * 12 + p.p) > 0 ? 1 : 0; R(c, x - 1 - f, y, 1 + f, 1, p.p > 3 ? '#ffffff' : '#ffd0e8'); R(c, x + 1, y, 1 + f, 1, p.p > 3 ? '#ffffff' : '#ffd0e8'); R(c, x, y, 1, 1, '#2a1a10'); }   // borboletas
      else { c.globalAlpha = 0.5; R(c, x, y, 1, 1, '#fff8c0'); c.globalAlpha = 1; }   // pólen
    } else if (zone === 'lacrimora') {   // brilhos violeta subindo
      x = ((p.x * LW + Math.sin(t * 0.9 + p.p) * 8) % LW + LW) % LW; y = ((p.y * LH - t * 10 * p.s + camPx * 0.5) % LH + LH) % LH;
      c.globalAlpha = 0.4 + Math.sin(t * 3 + p.p) * 0.3; R(c, x, y, 1, 1, p.s > 1 ? '#e0b8ff' : '#7af0ff'); if (p.s > 1.3) { R(c, x - 1, y, 3, 1, '#c08aff'); R(c, x, y - 1, 1, 3, '#c08aff'); } c.globalAlpha = 1;
    } else if (zone === 'lua') {   // estrelinhas piscando e poeira lunar flutuando devagar
      x = ((p.x * LW + t * 2 * p.s) % LW + LW) % LW; y = ((p.y * LH + camPx * 0.2) % LH + LH) % LH;
      c.globalAlpha = 0.25 + Math.abs(Math.sin(t * 1.5 + p.p)) * 0.4; R(c, x, y, 1, 1, '#e8e8ff'); c.globalAlpha = 1;
    }
  }
  // leve vinheta nas bordas
  const gr = c.createRadialGradient(LW / 2, LH / 2, Math.min(LW, LH) * 0.35, LW / 2, LH / 2, Math.max(LW, LH) * 0.75);
  gr.addColorStop(0, 'rgba(10,6,24,0)'); gr.addColorStop(1, zone === 'lua' ? 'rgba(10,6,40,0.45)' : zone === 'lacrimora' ? 'rgba(40,10,60,0.4)' : 'rgba(10,6,24,0.3)');
  c.fillStyle = gr; c.fillRect(0, 0, LW, LH);
}
