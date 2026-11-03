// Gera os ícones (PNG e ICO) desenhando o Jerry do próprio jogo num quadradinho de grama e estrada.
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
const sizes = [16, 32, 48, 64, 128, 192, 256, 512];
const out = await p.evaluate(async (sizes) => {
  const { jerryFrame } = await import('/src/jerry.js');
  const { SKIN_BY_ID } = await import('/src/skins.js');
  const art = document.createElement('canvas'); art.width = art.height = 32; const c = art.getContext('2d');
  const R = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  // fundo: grama em xadrez, uma faixa de estrada e uma moeda
  for (let y = 0; y < 32; y += 8) for (let x = 0; x < 32; x += 8) R(x, y, 8, 8, ((x + y) / 8) % 2 ? '#5aa04a' : '#4f9442');
  R(0, 22, 32, 10, '#8a6a4a'); R(0, 22, 32, 1, '#a8865e'); R(3, 26, 6, 1, '#6e5238'); R(20, 29, 6, 1, '#6e5238');
  R(24, 5, 5, 5, '#ffcc3a'); R(24, 5, 5, 1, '#fff2a0'); R(24, 9, 5, 1, '#c8901a');
  const fr = jerryFrame('front', 'idle', 0, SKIN_BY_ID.s000, false);
  c.drawImage(fr, 2, 3);
  const res = {};
  for (const s of sizes) { const o = document.createElement('canvas'); o.width = o.height = s; const k = o.getContext('2d'); k.imageSmoothingEnabled = s < 32; k.drawImage(art, 0, 0, s, s); res[s] = o.toDataURL('image/png').split(',')[1]; }
  return res;
}, sizes);
await b.close(); server.close();
mkdirSync(join(ROOT, 'icons'), { recursive: true });
const png = (s) => Buffer.from(out[s], 'base64');
for (const s of [32, 192, 512]) writeFileSync(join(ROOT, 'icons', `icon-${s}.png`), png(s));
// ICO com PNGs dentro (16, 32, 48, 64, 128, 256)
const icoSizes = [16, 32, 48, 64, 128, 256], datas = icoSizes.map(png);
const head = Buffer.alloc(6 + 16 * icoSizes.length); head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(icoSizes.length, 4);
let off = head.length;
icoSizes.forEach((s, i) => { const e = 6 + i * 16; head.writeUInt8(s % 256, e); head.writeUInt8(s % 256, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6); head.writeUInt32LE(datas[i].length, e + 8); head.writeUInt32LE(off, e + 12); off += datas[i].length; });
writeFileSync(join(ROOT, 'icons', 'app.ico'), Buffer.concat([head, ...datas]));
console.log('ícones gerados em icons/');
