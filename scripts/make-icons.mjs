// Gera os ícones do Richard Is Bored (PNG, ICO e, se existir a pasta android, os do Android) com o Richard do próprio jogo.
// Uso: node scripts/make-icons.mjs   (usa o Chromium do Playwright)
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.ttf': 'font/ttf', '.html': 'text/html' };
const server = createServer((q, r) => { const f = join(ROOT, decodeURIComponent(new URL(q.url, 'http://x').pathname)); if (!existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' }); r.end(readFileSync(f)); });
await new Promise((res) => server.listen(0, res));
const exe = process.env.CHROME_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const b = await chromium.launch(exe ? { executablePath: exe } : {}), p = await b.newPage();
await p.goto(`http://localhost:${server.address().port}/index.html`);
await p.waitForFunction(() => window.__re);
const ANDROID = [['mdpi', 48, 108], ['hdpi', 72, 162], ['xhdpi', 96, 216], ['xxhdpi', 144, 324], ['xxxhdpi', 192, 432]];
const out = await p.evaluate((ANDROID) => {
  const { drawRichard, drawVision } = window.__re.art;
  const S = 64, icon = document.createElement('canvas'); icon.width = icon.height = S; const g = icon.getContext('2d'); g.imageSmoothingEnabled = false;
  // o jogo desenha no contexto "g" interno; aqui usamos o canvas baixo do jogo e copiamos um pedaço 54x54
  const { g: gg, low } = window.__re.art;
  const R = (x, y, w, h, col) => { gg.fillStyle = col; gg.fillRect(x, y, w, h); };
  const SKY = ['#0a0716', '#140c26', '#1e1236', '#2a1a48', '#36205a'];
  for (let y = 0; y < 54; y++) R(0, y, 54, 1, SKY[Math.min(4, Math.floor(y / 11))]);
  for (const [x, y] of [[4, 4], [12, 10], [46, 6], [40, 14], [6, 20], [50, 22]]) R(x, y, 1, 1, '#fff6c8');
  for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) { const d = x * x + y * y; if (d <= 25 && (x + 2) * (x + 2) + (y - 2) * (y - 2) > 16) R(44 + x, 10 + y, 1, 1, '#fff4c0'); }
  drawVision({ i: 0, shape: 'wings', pal: ['#d8b8ff', '#9a6ad8', '#f6e8ff'], eye: '#2a1a3a' }, 12, 18, 0.3, 0.55);
  R(0, 46, 54, 8, '#2a2040'); R(0, 46, 54, 1, '#4a3e5c');
  drawRichard(27, 7, 1.7, 0.9, 1.75);
  const scene = document.createElement('canvas'); scene.width = scene.height = 54; scene.getContext('2d').drawImage(low, 0, 0, 54, 54, 0, 0, 54, 54);
  const rr = (x, y, w, h, r, col) => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
  rr(0, 0, S, S, 12, '#05081e'); rr(1, 1, S - 2, S - 2, 11, '#4a2a8a'); rr(3, 3, S - 6, S - 6, 9, '#b08aff'); rr(4, 4, S - 8, S - 8, 8, '#2a1650');
  g.save(); g.beginPath(); g.roundRect(5, 5, S - 10, S - 10, 7); g.clip(); g.drawImage(scene, 5, 5); g.restore();
  for (const [x, y] of [[2, 2], [S - 7, 2], [2, S - 7], [S - 7, S - 7]]) { g.fillStyle = '#e0c060'; g.fillRect(x, y, 5, 5); g.fillStyle = '#fff2a0'; g.fillRect(x, y, 2, 2); g.fillStyle = '#8a6a1c'; g.fillRect(x + 3, y + 3, 2, 2); }
  const scale = (src, size, pad = 0) => { const o = document.createElement('canvas'); o.width = o.height = size; const q = o.getContext('2d'); q.imageSmoothingEnabled = size < S; const inner = Math.round(size - pad * 2); q.drawImage(src, Math.round(pad), Math.round(pad), inner, inner); return o.toDataURL('image/png').split(',')[1]; };
  const res = { png: {}, android: {} };
  for (const s of [16, 32, 48, 64, 128, 192, 256, 512]) res.png[s] = scale(icon, s);
  for (const [d, sz, fg] of ANDROID) res.android[d] = { icon: scale(icon, sz), fg: scale(icon, fg, fg * 18 / 108) };
  return res;
}, ANDROID);
await b.close(); server.close();
mkdirSync(join(ROOT, 'icons'), { recursive: true });
const buf = (b64) => Buffer.from(b64, 'base64');
for (const s of [32, 192, 512]) writeFileSync(join(ROOT, 'icons', `icon-${s}.png`), buf(out.png[s]));
const icoSizes = [16, 32, 48, 64, 128, 256], datas = icoSizes.map((s) => buf(out.png[s]));
const head = Buffer.alloc(6 + 16 * icoSizes.length); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(icoSizes.length, 4);
let off = head.length;
icoSizes.forEach((s, i) => { const e = 6 + i * 16; head.writeUInt8(s % 256, e); head.writeUInt8(s % 256, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6); head.writeUInt32LE(datas[i].length, e + 8); head.writeUInt32LE(off, e + 12); off += datas[i].length; });
writeFileSync(join(ROOT, 'icons', 'app.ico'), Buffer.concat([head, ...datas]));
const RES = join(ROOT, 'android', 'app', 'src', 'main', 'res');
if (existsSync(RES)) {
  for (const [d] of ANDROID) for (const [n, k] of [['ic_launcher', 'icon'], ['ic_launcher_round', 'icon'], ['ic_launcher_foreground', 'fg']]) writeFileSync(join(RES, `mipmap-${d}`, `${n}.png`), buf(out.android[d][k]));
  writeFileSync(join(RES, 'values', 'ic_launcher_background.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#05081E</color>\n</resources>\n');
}
console.log('ícones gerados');
