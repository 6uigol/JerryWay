// Gera os ícones do Jerry's Way (PNG, ICO e os do Android) desenhando o Jerry do próprio jogo:
// moldura azul do Song of Moonlight com cantinhos dourados, céu de noite com lua e estrelas, rio com tronco,
// estrada e grama atrás, o Jerry grande na frente e uma moeda.
// Uso: node scripts/make-icons.mjs   (usa o Chromium do Playwright)
import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const server = createServer((q, r) => { const f = join(ROOT, decodeURIComponent(new URL(q.url, 'http://x').pathname)); if (!existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': extname(f) === '.js' ? 'text/javascript' : 'text/html' }); r.end(readFileSync(f)); });
await new Promise((res) => server.listen(0, res));
const exe = process.env.CHROME_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
const b = await chromium.launch(exe ? { executablePath: exe } : {}), p = await b.newPage();
await p.goto(`http://localhost:${server.address().port}/index.html`).catch(() => {});
const ANDROID = [['mdpi', 48, 108], ['hdpi', 72, 162], ['xhdpi', 96, 216], ['xxhdpi', 144, 324], ['xxxhdpi', 192, 432]];
const out = await p.evaluate(async (ANDROID) => {
  const { jerryFrame } = await import('/src/jerry.js');
  const { SKIN_BY_ID } = await import('/src/skins.js');
  // ---------- cena (sem moldura) em 54x54: entra inteira dentro da moldura, pixel por pixel
  const N = 54;
  const scene = document.createElement('canvas'); scene.width = scene.height = N; const c = scene.getContext('2d');
  const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  const SKY = ['#0b0a2c', '#100e38', '#161446', '#1d1a54', '#262062', '#30286e'];
  for (let y = 0; y < 21; y++) { const i = Math.min(SKY.length - 1, Math.floor(y / 21 * SKY.length)); for (let x = 0; x < N; x++) R(x, y, 1, 1, SKY[Math.min(SKY.length - 1, i + ((y % 4 === 3 && (x + y) % 2) ? 1 : 0))]); }
  for (const [x, y] of [[4, 4], [15, 9], [24, 3], [31, 11], [3, 14], [21, 15]]) R(x, y, 1, 1, '#fff6c8');
  for (const [x, y] of [[10, 6], [28, 7]]) { R(x, y - 1, 1, 3, '#d8d8ff'); R(x - 1, y, 3, 1, '#d8d8ff'); }
  for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) { const d = x * x + y * y; if (d <= 36 && (x + 3) * (x + 3) + (y - 2) * (y - 2) > 22) R(44 + x, 9 + y, 1, 1, d > 22 ? '#f0d890' : '#fff4c0'); }
  // rio com tronco, estrada e grama
  for (let y = 21; y < 28; y++) for (let x = 0; x < N; x++) R(x, y, 1, 1, y === 21 ? '#bfe8ff' : (x * 3 + y * 5) % 9 === 0 ? '#7ac8ff' : '#3a7ad8');
  R(1, 22, 13, 5, '#6a4422'); R(1, 22, 13, 1, '#9a6a3a'); R(1, 26, 13, 1, '#4a2e16'); R(1, 22, 2, 5, '#c89a5a'); R(12, 22, 2, 5, '#c89a5a'); R(6, 24, 2, 1, '#4a2e16');
  for (let y = 28; y < 36; y++) for (let x = 0; x < N; x++) R(x, y, 1, 1, y === 28 ? '#a8865e' : (x + y * 3) % 7 === 0 ? '#9a7a54' : '#8a6a4a');
  for (let x = 2; x < N; x += 10) R(x, 31, 5, 1, '#e8d8a8');
  for (let y = 36; y < N; y++) for (let x = 0; x < N; x++) R(x, y, 1, 1, ((x >> 3) + (y >> 3)) % 2 ? '#5aa04a' : '#4f9442');
  for (const [x, y] of [[3, 42], [47, 47], [6, 50], [44, 40]]) { R(x, y, 1, 2, '#7ac85a'); R(x + 2, y - 1, 1, 3, '#7ac85a'); }
  R(48, 41, 2, 2, '#ff8ab0'); R(3, 47, 2, 2, '#fff2a0');
  // moeda brilhando, no alto à esquerda (no céu, bem visível)
  const coin = (cx, cy) => { for (let y = -4; y <= 4; y++) for (let x = -4; x <= 4; x++) { const d = x * x + y * y; if (d <= 20) R(cx + x, cy + y, 1, 1, d > 13 ? '#1a1226' : (x + y < -2 ? '#fff2a0' : x + y > 2 ? '#c8861a' : '#ffcc3a')); } R(cx, cy - 2, 1, 5, '#c8861a'); R(cx + 4, cy - 6, 1, 3, '#ffffff'); R(cx + 3, cy - 5, 3, 1, '#ffffff'); };
  coin(9, 32);
  // Jerry grande (2x), em pé na grama
  const fr = jerryFrame('front', 'idle', 0, SKIN_BY_ID.s000, false), k = 2, jx = Math.round(N / 2 - fr.width * k / 2) + 4, jy = N - fr.height * k + 2;
  c.globalAlpha = 0.3; R(jx + 10, N - 4, fr.width * k - 20, 3, '#000000'); c.globalAlpha = 1;
  c.imageSmoothingEnabled = false; c.drawImage(fr, jx, jy, fr.width * k, fr.height * k);
  const S = 64;
  // ---------- ícone: cena dentro da moldura azul arredondada, cantinhos dourados
  const icon = document.createElement('canvas'); icon.width = icon.height = S; const g = icon.getContext('2d'); g.imageSmoothingEnabled = false;
  const rr = (x, y, w, h, r, col) => { g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
  rr(0, 0, S, S, 12, '#05081e'); rr(1, 1, S - 2, S - 2, 11, '#2a3aa8'); rr(3, 3, S - 6, S - 6, 9, '#7a9aff'); rr(4, 4, S - 8, S - 8, 8, '#1a2470');
  g.save(); g.beginPath(); g.roundRect(5, 5, S - 10, S - 10, 7); g.clip(); g.drawImage(scene, 5, 5); g.restore();
  for (const [x, y] of [[2, 2], [S - 7, 2], [2, S - 7], [S - 7, S - 7]]) { g.fillStyle = '#e0c060'; g.fillRect(x, y, 5, 5); g.fillStyle = '#fff2a0'; g.fillRect(x, y, 2, 2); g.fillStyle = '#8a6a1c'; g.fillRect(x + 3, y + 3, 2, 2); }
  const scale = (src, size, pad = 0) => { const o = document.createElement('canvas'); o.width = o.height = size; const q = o.getContext('2d'); q.imageSmoothingEnabled = size < S; const inner = Math.round(size - pad * 2); q.drawImage(src, Math.round(pad), Math.round(pad), inner, inner); return o.toDataURL('image/png').split(',')[1]; };
  const res = { png: {}, android: {} };
  for (const s of [16, 32, 48, 64, 128, 192, 256, 512]) res.png[s] = scale(icon, s);
  for (const [d, sz, fg] of ANDROID) res.android[d] = { icon: scale(icon, sz), fg: scale(icon, fg, fg * 18 / 108) };   // ícone adaptável: dentro da área segura (72 de 108)
  return res;
}, ANDROID);
await b.close(); server.close();
mkdirSync(join(ROOT, 'icons'), { recursive: true });
const buf = (b64) => Buffer.from(b64, 'base64');
for (const s of [32, 192, 512]) writeFileSync(join(ROOT, 'icons', `icon-${s}.png`), buf(out.png[s]));
// ICO com PNGs dentro (16, 32, 48, 64, 128, 256)
const icoSizes = [16, 32, 48, 64, 128, 256], datas = icoSizes.map((s) => buf(out.png[s]));
const head = Buffer.alloc(6 + 16 * icoSizes.length); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(icoSizes.length, 4);
let off = head.length;
icoSizes.forEach((s, i) => { const e = 6 + i * 16; head.writeUInt8(s % 256, e); head.writeUInt8(s % 256, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6); head.writeUInt32LE(datas[i].length, e + 8); head.writeUInt32LE(off, e + 12); off += datas[i].length; });
writeFileSync(join(ROOT, 'icons', 'app.ico'), Buffer.concat([head, ...datas]));
// Android: ícone normal, redondo e a frente do ícone adaptável (o fundo é a cor azul-escura da moldura)
const RES = join(ROOT, 'android', 'app', 'src', 'main', 'res');
for (const [d] of ANDROID) {
  writeFileSync(join(RES, `mipmap-${d}`, 'ic_launcher.png'), buf(out.android[d].icon));
  writeFileSync(join(RES, `mipmap-${d}`, 'ic_launcher_round.png'), buf(out.android[d].icon));
  writeFileSync(join(RES, `mipmap-${d}`, 'ic_launcher_foreground.png'), buf(out.android[d].fg));
}
writeFileSync(join(RES, 'values', 'ic_launcher_background.xml'), '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#05081E</color>\n</resources>\n');
console.log('ícones gerados em icons/ e no Android');
