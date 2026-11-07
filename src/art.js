// Ponte com a arte do Song of Moonlight: desenha qualquer personagem, monstro ou chefe dos outros jogos
// numa tela de rascunho e copia ampliado (escala inteira, sem borrar) com o pé no ponto pedido.
import * as G from './som/gfx.js';
import { jerryFrame } from './som/jerry.js';
import { fillTextAccents } from './som/accents.js';
export { G, fillTextAccents };

// cada ator: como desenhar no tamanho original (em x, y do rascunho) e o tamanho do rascunho
const npc = (look) => ({ size: 64, draw: (c, x, y, t) => G.drawNPC(c, x - 8, y - 18, look, t) });
const mob = (fn, args) => ({ size: 64, draw: (c, x, y, t) => G[fn](c, x - 8, y - 16, ...args(t)) });
export const ACTORS = {
  richard: npc('richard'), richardCalm: npc('richardCalm'),
  mara: npc('lacFae'), icaro: npc('astro'), aldo: npc('sage'), selene: npc('mystic'), gus: npc('gus'), doran: npc('lacMushroom'),
  coralina: npc('mermaid'), pipo: npc('merchild'), monice: npc('rocker'), nico: npc('sailor'), marcos: npc('gunter'),
  ray: { size: 96, draw: (c, x, y, t) => G.drawRay(c, x, y - 10, 3, Math.floor(t * 4), t) },
  jerry: { size: 64, draw: (c, x, y, t) => { const f = jerryFrame('front', 'idle', Math.floor(t * 3) % 2, null, false); c.drawImage(f, Math.round(x - f.width / 2), Math.round(y - f.height)); } },
  lyon: { size: 64, draw: (c, x, y, t) => G.drawHero(c, x - 8, y - 16, 'down', Math.floor(t * 4) % 2) },
  hermes: { size: 96, draw: (c, x, y, t) => G.drawHorse(c, x, y - 2, 2, Math.floor(t * 4) % 4, 'all') },
  sentinela: { size: 64, draw: (c, x, y, t) => G.drawSentinel(c, x - 8, y - 16, Math.sin(t) * 3, 2, false, t) },
  prisma: npc('lacCrystal'), paciente: npc('lacBeast:1'), general: npc('lacBeast:2'), conselheiro: npc('lacMoth:1'),
  eco: { size: 64, draw: (c, x, y, t) => G.drawGhost(c, x - 8, y - 16, t, 0.85) },
  // o Leviatã aparece pequeno nos minijogos (no chefe ele vem em tamanho real)
  leviata: { size: 96, draw: (c, x, y, t) => { c.save(); c.translate(x, y - 8); c.scale(0.4, 0.4); G.drawBoss(c, 'leviathan', 0, -40, t, 0, 'idle'); c.restore(); } },
  // a Sombra de Richard: o próprio Richard, escuro e roxo
  sombra: { size: 64, draw: (c, x, y, t) => { c.save(); c.filter = 'brightness(0.35) saturate(3) hue-rotate(40deg)'; G.drawNPC(c, x - 8, y - 18, 'richard', t * 1.7); c.restore(); } },
  // passado de Brumavale (quem conta a história do Rei Aldric, da rainha Elara, do mago Orin e da Noite do Silêncio)
  hilda: npc('baker2'), pedro: npc('guard'), mirela: npc('baker'), bento: npc('fisher'), brenda: npc('smith'), tobias: npc('merchant'), odete: npc('granny3'),
  aldric: { size: 128, draw: (c, x, y, t) => { c.save(); c.translate(x, y); c.scale(0.7, 0.7); G.drawBoss(c, 'skelking', 0, -40, t, 0, 'idle'); c.restore(); } },
  valerio: { size: 64, draw: (c, x, y, t) => G.drawKnight(c, x - 12, y - 26, Math.floor(t * 4) % 2, 'idle', t, 0, false) },
  ecoSilencio: { size: 64, draw: (c, x, y, t) => G.drawKnight(c, x - 12, y - 26, Math.floor(t * 4) % 2, 'idle', t, 0, true) },
  // presente de Lacrímora
  tom: npc('kid5'), rosa: npc('farmer'), coral: npc('collector'), lia: npc('keeper'), ulisses: npc('traveler2'), bruno: npc('scholar'), selene: npc('mystic'),
  tessa: npc('lacMoth:4'), oma: npc('lacMushroom:3'),
  nara: npc('lacCrystal'), maelis: npc('lacMoth:1'), salvia: npc('lacMushroom:2'), elo: npc('lacBeast:1'), iria: npc('lacFae:4'), ruk: npc('lacBeast:2'), brusk: npc('lacCrystal:4'), orvo: npc('lacMoth'),
  // monstros e chefes usados nos minijogos
  slime: mob('drawSlime', (t) => [t, 'green']), slimeP: mob('drawSlime', (t) => [t, 'purple']), bat: mob('drawBat', (t) => [t]),
  ghost: mob('drawGhost', (t) => [t, 0.85]), skeleton: mob('drawSkeleton', (t) => ['down', Math.floor(t * 4) % 2]), frog: mob('drawFrog', (t) => [t, false]),
  crab: mob('drawCrab', (t) => [t]), plant: mob('drawPlant', (t) => [t, Math.sin(t * 3) > 0]), mummy: mob('drawMummy', (t) => [Math.floor(t * 4) % 2]),
  wolf: mob('drawWolf', (t) => ['down', Math.floor(t * 4) % 2]), scorpion: mob('drawScorpion', (t) => [t, 'down']), mage: mob('drawMage', (t) => [t, false]),
  boss: (type) => ({ size: 160, draw: (c, x, y, t) => G.drawBoss(c, type, x, y - 24, t, 0, 'idle') }),
};
const scratch = new Map(), boxes = new Map();
function pad(size) { let s = scratch.get(size); if (!s) { s = document.createElement('canvas'); s.width = s.height = size; scratch.set(size, s); } return s; }
// caixa do desenho (para centralizar e pôr o pé no chão), medida uma vez por ator
function boxOf(key, A) {
  let b = boxes.get(key); if (b) return b;
  const s = pad(A.size), c = s.getContext('2d'); c.clearRect(0, 0, A.size, A.size); A.draw(c, A.size / 2, A.size * 0.75, 0.5);
  const d = c.getImageData(0, 0, A.size, A.size).data; let x0 = A.size, x1 = 0, y0 = A.size, y1 = 0;
  for (let y = 0; y < A.size; y++) for (let x = 0; x < A.size; x++) if (d[(y * A.size + x) * 4 + 3] > 40) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  b = x1 >= x0 ? { cx: (x0 + x1 + 1) / 2, bottom: y1 + 1, w: x1 - x0 + 1, h: y1 - y0 + 1 } : { cx: A.size / 2, bottom: A.size * 0.75, w: 16, h: 16 };
  boxes.set(key, b); return b;
}
// desenha o ator `who` (nome ou {key, A}) com o pé em (x, y), escala inteira; opções: flip, alpha, filter (tom), shake
export function drawActor(g, who, x, y, t, scale = 1, o = {}) {
  const key = typeof who === 'string' ? who : who.key, A = typeof who === 'string' ? ACTORS[who] : who.A; if (!A) return { w: 0, h: 0 };
  const b = boxOf(key, A), s = pad(A.size), c = s.getContext('2d');
  c.clearRect(0, 0, A.size, A.size); A.draw(c, A.size / 2, A.size * 0.75, t);
  // sombra no chão (deixa os personagens "pisando" no cenário)
  if (o.shadow !== false && !o.rot) { g.save(); g.globalAlpha = (o.alpha ?? 1) * 0.32; g.fillStyle = '#05030c'; g.beginPath(); g.ellipse(Math.round(x), Math.round(y) - scale, Math.max(4, b.w * scale * 0.42), Math.max(2, scale * 1.6), 0, 0, 7); g.fill(); g.restore(); }
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha; if (o.filter) g.filter = o.filter;
  g.translate(Math.round(x), Math.round(y)); if (o.flip) g.scale(-1, 1); if (o.rot) g.rotate(o.rot);
  g.imageSmoothingEnabled = false;
  g.drawImage(s, Math.round(-b.cx * scale), Math.round(-b.bottom * scale), A.size * scale, A.size * scale);
  g.restore();
  return { w: b.w * scale, h: b.h * scale };
}
export const bossActor = (type) => ({ key: 'boss:' + type, A: ACTORS.boss(type) });
// escala inteira para o ator ficar com mais ou menos `h` pixels de altura
export const fitScale = (who, h, max = 4) => Math.max(1, Math.min(max, Math.round(h / actorSize(who).h)));
export const actorSize = (who) => { const key = typeof who === 'string' ? who : who.key, A = typeof who === 'string' ? ACTORS[who] : who.A; return boxOf(key, A); };

// pisos e paredes de verdade do Song of Moonlight (uma sala de 20x12 tiles), guardados prontos por tema
const rooms = new Map();
export function room(theme, map) {
  const key = theme + '|' + map.join('');
  let cv = rooms.get(key); if (cv) return cv;
  cv = document.createElement('canvas'); cv.width = 320; cv.height = map.length * 16; const c = cv.getContext('2d');
  for (let ty = 0; ty < map.length; ty++) for (let tx = 0; tx < 20; tx++) { try { G.drawTile(c, map[ty][tx], tx, ty, theme, map); } catch (_) { /* tile desconhecido: fica vazio */ } }
  rooms.set(key, cv); return cv;
}
export const ROOM_OPEN = ['####################', ...Array.from({ length: 10 }, () => '#..................#'), '####################'];

// ---------------------------------------------------------------- luz e clima (deixam as cenas com cara de jogo pronto)
const lightCv = document.createElement('canvas'), lightG = lightCv.getContext('2d');
// escuridão com buracos de luz: lights = [[x, y, raio, intensidade(0..1)]]; depois um brilho quente por cima
export function lighting(g, lights, dark = 0.6, tint = '8,4,24', warm = '255,190,110') {
  const W = g.canvas.width, H = g.canvas.height;
  if (lightCv.width !== W || lightCv.height !== H) { lightCv.width = W; lightCv.height = H; }
  lightG.globalCompositeOperation = 'source-over'; lightG.clearRect(0, 0, W, H); lightG.fillStyle = `rgba(${tint},${dark})`; lightG.fillRect(0, 0, W, H);
  lightG.globalCompositeOperation = 'destination-out';
  for (const [x, y, r, k = 1] of lights) { const gr = lightG.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(0,0,0,${k})`); gr.addColorStop(0.6, `rgba(0,0,0,${k * 0.6})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); lightG.fillStyle = gr; lightG.fillRect(x - r, y - r, r * 2, r * 2); }
  g.drawImage(lightCv, 0, 0);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [x, y, r, k = 1] of lights) { if (!warm) break; const gr = g.createRadialGradient(x, y, 0, x, y, r * 0.55); gr.addColorStop(0, `rgba(${warm},${0.16 * k})`); gr.addColorStop(1, `rgba(${warm},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  g.restore();
}
// bordas escuras (vinheta)
export function vignette(g, k = 0.55) {
  const W = g.canvas.width, H = g.canvas.height, gr = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.65);
  gr.addColorStop(0, 'rgba(5,3,12,0)'); gr.addColorStop(1, `rgba(5,3,12,${k})`); g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
// poeira e brilhinhos flutuando
export function motes(g, t, n = 26, col = '255,240,200', seed = 1) {
  const W = g.canvas.width, H = g.canvas.height;
  for (let i = 0; i < n; i++) { const h1 = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453, r1 = h1 - Math.floor(h1), h2 = Math.sin(i * 39.3468 + seed * 11.135) * 24634.6345, r2 = h2 - Math.floor(h2);
    const x = (r1 * W + Math.sin(t * 0.4 + i) * 12 + t * 4) % W, y = (r2 * H - t * (4 + (i % 5) * 2) + H * 10) % H, a = 0.25 + 0.35 * Math.abs(Math.sin(t * 1.3 + i));
    g.fillStyle = `rgba(${col},${a})`; g.fillRect(Math.round(x), Math.round(y), i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1); }
}
// neblina rasteira
export function fog(g, t, y0, h, col = '200,190,255', a = 0.18) {
  const W = g.canvas.width; const gr = g.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(1, `rgba(${col},${a})`); g.fillStyle = gr; g.fillRect(0, y0, W, h);
  g.fillStyle = `rgba(${col},${a * 0.6})`; for (let i = 0; i < 6; i++) { const x = ((i * 71 + t * (6 + i)) % (W + 80)) - 40; g.beginPath(); g.ellipse(x, y0 + h - 6 - (i % 3) * 4, 40, 6, 0, 0, 7); g.fill(); }
}
