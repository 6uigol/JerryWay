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
