// Os minijogos (microjogos de poucos segundos). Cada um tem uma ordem clara (a palavra grande), um ícone de controle
// e um jeito só de ganhar. Usam a arte do Song of Moonlight: pisos, paredes, personagens e monstros de verdade.
// Controles: setas/WASD ou arrastar o dedo = mover; A/Espaço/Enter ou tocar = ação; tocar no objeto = escolher.
import { drawActor, room, ROOM_OPEN, G } from './art.js';
import { sfx } from './audio.js';

export const W = 320, H = 192;
let g = null, inp = null;
export function bindMicro(ctx, input) { g = ctx; inp = input; }
const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), w, h); };
const rnd = (a, b) => a + Math.random() * (b - a);
const ri = (a, b) => Math.floor(rnd(a, b + 1));
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
const press = () => inp.hit('a') || inp.ptr.tap;

// ---------------------------------------------------------------- cenários
// visto de cima: sala de verdade do Song of Moonlight no tema da visão
function topBg(o) { g.drawImage(room(o.V.theme, ROOM_OPEN), 0, 0); }
// de frente (estilo plataforma): céu da visão com lua e torres, chão de pedra do tema
const FLOOR = ['####################', '####################', '####################'];
function sideBg(o, floorY = 160) {
  const hue = o.trip ? (o.age * 40) % 360 : 0;
  const top = o.V.sky[0], bot = o.V.sky[1];
  const gr = g.createLinearGradient(0, 0, 0, floorY); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, W, floorY);
  if (hue) { g.save(); g.globalAlpha = 0.18; g.fillStyle = `hsl(${hue},90%,60%)`; g.fillRect(0, 0, W, floorY); g.restore(); }
  for (let i = 0; i < 40; i++) { const x = (i * 97) % W, y = (i * 53) % (floorY - 40); if ((i + Math.floor(o.age * 3)) % 7) R(x, y, 1, 1, '#e8e0ff'); }
  g.fillStyle = '#fff4c0'; g.beginPath(); g.arc(270, 32, 14, 0, 7); g.fill(); g.fillStyle = top; g.beginPath(); g.arc(277, 28, 12, 0, 7); g.fill();
  // silhuetas: torres de Lacrímora com janelas acesas
  for (let i = 0; i < 6; i++) { const x = i * 58 - 10, h = 50 + ((i * 37) % 40); R(x, floorY - h, 34, h, o.V.sky[2]); R(x + 4, floorY - h - 8, 26, 8, o.V.sky[2]); for (let k = 0; k < 3; k++) if ((i + k) % 2) R(x + 8 + k * 7, floorY - h + 10 + k * 9, 4, 6, '#ffd27a'); }
  g.drawImage(room(o.V.theme, FLOOR), 0, floorY);
  R(0, floorY, W, 2, 'rgba(255,255,255,0.18)');
}
// frasco de remédio (de Lacrímora): rolha, vidro e líquido brilhando
function vial(x, y, t, s = 2) {
  x = Math.round(x); y = Math.round(y); const P = (a, b, w, h, c) => R(x + a * s, y + b * s, w * s, h * s, c);
  P(-3, -7, 6, 10, '#120c1e'); P(-2, -9, 4, 3, '#120c1e'); P(-1, -9, 2, 2, '#a86a3a');
  P(-2, -6, 4, 8, '#bfe8ff'); P(-2, -3, 4, 5, Math.sin(t * 8) > 0 ? '#c86aff' : '#a84ae8'); P(-2, -6, 1, 3, '#ffffff');
}
function spark(x, y) { R(x - 2, y - 5, 4, 10, '#fff4a0'); R(x - 1, y - 7, 2, 14, '#ffffff'); }
function bed(x, y, glow, t) {
  R(x - 18, y - 6, 36, 14, '#120c1e'); R(x - 17, y - 5, 34, 8, '#e8e0f0'); R(x - 17, y + 3, 34, 4, '#8a5a34'); R(x - 17, y - 9, 8, 6, '#c8c0e0');
  R(x - 18, y + 7, 3, 6, '#5a3a24'); R(x + 15, y + 7, 3, 6, '#5a3a24');
  if (glow) { g.save(); g.globalAlpha = 0.35 + 0.25 * Math.sin(t * 10); R(x - 20, y - 12, 40, 26, '#7aff9a'); g.restore(); }
}
function arrowDown(x, y, t, col = '#ffe07a') { const b = Math.round(Math.sin(t * 10) * 2); for (let i = 0; i < 6; i++) R(x - 6 + i, y + b + i, 12 - i * 2, 1, col); R(x - 2, y - 8 + b, 4, 8, col); }
function books(x, y, n, ang) {
  g.save(); g.translate(x, y); g.rotate(ang);
  const cols = ['#c83a3a', '#3a6ac8', '#3ac86a', '#c8a03a', '#8a3ac8', '#3ac8c8'];
  for (let i = 0; i < n; i++) { const w = 30 - (i % 3) * 3; g.fillStyle = '#120c1e'; g.fillRect(-w / 2 - 1, -i * 9 - 9, w + 2, 10); g.fillStyle = cols[i % 6]; g.fillRect(-w / 2, -i * 9 - 8, w, 8); g.fillStyle = '#f0e8d0'; g.fillRect(-w / 2 + 2, -i * 9 - 6, w - 4, 2); }
  g.restore();
}
function runeArrow(dir, x, y, s, col) {
  g.save(); g.translate(x, y); g.rotate({ up: -Math.PI / 2, right: 0, down: Math.PI / 2, left: Math.PI }[dir]);
  g.fillStyle = '#120c1e'; g.beginPath(); g.moveTo(s + 3, 0); g.lineTo(-s / 3, -s - 3); g.lineTo(-s / 3, -s / 2.5); g.lineTo(-s - 3, -s / 2.5); g.lineTo(-s - 3, s / 2.5); g.lineTo(-s / 3, s / 2.5); g.lineTo(-s / 3, s + 3); g.closePath(); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(s, 0); g.lineTo(-s / 3 + 1, -s); g.lineTo(-s / 3 + 1, -s / 2.5 + 2); g.lineTo(-s, -s / 2.5 + 2); g.lineTo(-s, s / 2.5 - 2); g.lineTo(-s / 3 + 1, s / 2.5 - 2); g.lineTo(-s / 3 + 1, s); g.closePath(); g.fill();
  g.restore();
}
function choiceBox(x, y, w, h, on, label) {
  R(x - 2, y - 2, w + 4, h + 4, '#120c1e'); R(x, y, w, h, on ? '#ffe07a' : '#3a2a5a'); R(x + 2, y + 2, w - 4, h - 4, on ? '#fff2b0' : '#4a3a72');
  if (label != null) { g.font = '16px "Press Start 2P", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#120c1e'; g.fillText(label, x + w / 2 + 1, y + h / 2 + 2); g.fillStyle = on ? '#3a2a10' : '#ffffff'; g.fillText(label, x + w / 2, y + h / 2 + 1); }
}
// mover na horizontal (setas ou dedo segurando)
function moveX(o, sp = 150, lo = 16, hi = W - 16) {
  let d = (inp.held('right') ? 1 : 0) - (inp.held('left') ? 1 : 0);
  if (inp.ptr.down) d = Math.abs(inp.ptr.x - o.px) < 3 ? 0 : Math.sign(inp.ptr.x - o.px);
  o.px = Math.max(lo, Math.min(hi, o.px + d * sp * o.sp * o.dt));
  if (d) o.face = d < 0;
}
// mover em 4 direções (setas ou ir até o dedo)
function move4(o, sp = 110) {
  let dx = (inp.held('right') ? 1 : 0) - (inp.held('left') ? 1 : 0), dy = (inp.held('down') ? 1 : 0) - (inp.held('up') ? 1 : 0);
  if (inp.ptr.down) { const ex = inp.ptr.x - o.px, ey = inp.ptr.y - o.py, d = Math.hypot(ex, ey); if (d > 4) { dx = ex / d; dy = ey / d; } else { dx = dy = 0; } }
  const n = Math.hypot(dx, dy) || 1; o.px = Math.max(26, Math.min(W - 26, o.px + dx / n * sp * o.sp * o.dt)); o.py = Math.max(34, Math.min(H - 20, o.py + dy / n * sp * o.sp * o.dt));
  if (dx) o.face = dx < 0;
}
// escolher entre N alvos: setas + A, ou tocar direto no alvo
function pick(o, rects) {
  if (inp.hit('left')) { o.sel = (o.sel + rects.length - 1) % rects.length; sfx.tick(); }
  if (inp.hit('right')) { o.sel = (o.sel + 1) % rects.length; sfx.tick(); }
  if (inp.ptr.tap) { const i = rects.findIndex(([x, y, w, h]) => inp.ptr.x >= x && inp.ptr.x <= x + w && inp.ptr.y >= y && inp.ptr.y <= y + h); if (i >= 0) return i; return -1; }
  if (inp.hit('a')) return o.sel;
  return -1;
}
const rich = () => 'richard';

// ---------------------------------------------------------------- os 12 minijogos
export const MICROS = {
  frascos: { word: 'PEGUE OS FRASCOS!', icon: 'move', timeout: 'lose', dur: () => 5,
    init(o) { o.px = W / 2; o.n = 2 + Math.min(3, o.lvl); o.items = Array.from({ length: o.n }, (_, i) => ({ x: rnd(30, W - 30), y: -20 - i * (70 - o.lvl * 5), got: false })); },
    update(o) { moveX(o, 170); for (const it of o.items) { if (it.got) continue; it.y += (55 + o.lvl * 10) * o.sp * o.dt; if (it.y > 118 && it.y < 158 && Math.abs(it.x - o.px) < 18) { it.got = true; sfx.catch(); } if (it.y > 166) { o.lose = true; o.why = 'broke'; } } if (o.items.every((i) => i.got)) o.win = true; },
    draw(o, t) { sideBg(o); for (const it of o.items) if (!it.got) vial(it.x, it.y, t); drawActor(g, rich(o), o.px, 160, t, 2, { flip: o.face }); o.items.forEach((it, i) => { g.globalAlpha = it.got ? 1 : 0.35; vial(W / 2 - (o.n - 1) * 9 + i * 18, 26, t, 1); g.globalAlpha = 1; }); } },
  fuja: { word: 'FUJA!', icon: 'move4', timeout: 'win', dur: () => 4,
    init(o) { o.px = W / 2; o.py = H / 2 + 10; o.mobs = Array.from({ length: 2 + Math.min(4, o.lvl) }, (_, i) => { const a = rnd(0, 6.28); return { x: i % 2 ? 50 : W - 50, y: i % 3 ? 50 : H - 40, vx: Math.cos(a) * (55 + o.lvl * 8), vy: Math.sin(a) * (55 + o.lvl * 8) }; }); },
    update(o) { move4(o, 120); for (const m of o.mobs) { m.x += m.vx * o.sp * o.dt; m.y += m.vy * o.sp * o.dt; if (m.x < 30 || m.x > W - 30) m.vx *= -1; if (m.y < 40 || m.y > H - 20) m.vy *= -1; if (dist(m.x, m.y - 10, o.px, o.py - 16) < 20) o.lose = true; } },
    draw(o, t) { topBg(o); for (const m of o.mobs) drawActor(g, o.V.mob, m.x, m.y, t + m.x, 2); drawActor(g, rich(o), o.px, o.py, t, 2, { flip: o.face }); } },
  cure: { word: 'CURE NA HORA!', icon: 'press', timeout: 'lose', dur: () => 4.5,
    init(o) { o.beds = 5; o.target = ri(0, 4); o.hx = 30; o.dir = 1; o.drop = null; },
    update(o) {
      if (!o.drop) { o.hx += o.dir * (110 + o.lvl * 25) * o.sp * o.dt; if (o.hx > W - 26) { o.hx = W - 26; o.dir = -1; } if (o.hx < 26) { o.hx = 26; o.dir = 1; } if (press()) { o.drop = { x: o.hx, y: 46 }; sfx.blip(); } }
      else { o.drop.y += 260 * o.dt; if (o.drop.y >= 126) { const i = Math.round((o.drop.x - 32) / 64); if (i === o.target && Math.abs(o.drop.x - (32 + i * 64)) < 20) o.win = true; else o.lose = true; } }
    },
    draw(o, t) { topBg(o); for (let i = 0; i < 5; i++) { const x = 32 + i * 64; drawActor(g, i === o.target ? o.V.actor : 'paciente', x, 120, t + i, 1, { alpha: i === o.target ? 1 : 0.8 }); bed(x, 134, i === o.target, t); } arrowDown(32 + o.target * 64, 82, t, '#7aff9a'); R(0, 30, W, 2, '#5a4a7a'); const hx = o.drop ? o.drop.x : o.hx; R(hx - 6, 26, 12, 8, '#f0c8a0'); R(hx - 6, 26, 12, 2, '#d8a880'); vial(o.drop ? o.drop.x : o.hx, o.drop ? o.drop.y : 46, t); } },
  bau: { word: 'ONDE ESTÁ?', icon: 'pick', timeout: 'lose', dur: (o) => 0.9 + (3 + o.lvl) * (0.5 - Math.min(0.25, o.lvl * 0.04)) / o.sp + 2.4,
    init(o) { o.slots = [0, 1, 2]; o.hid = 1; o.swaps = 3 + o.lvl; o.swT = (0.5 - Math.min(0.25, o.lvl * 0.04)) / o.sp; o.sel = 1; o.done = 0; o.from = null; },
    update(o) {
      const showEnd = 0.9 / o.sp, shuffleEnd = showEnd + o.swaps * o.swT;
      if (o.age > showEnd && o.done < o.swaps && o.age > showEnd + o.done * o.swT) { const a = ri(0, 2), b = (a + ri(1, 2)) % 3; o.from = { a, b, t0: o.age }; const ia = o.slots.indexOf(a), ib = o.slots.indexOf(b); [o.slots[ia], o.slots[ib]] = [o.slots[ib], o.slots[ia]]; o.done++; sfx.tick(); }
      if (o.age < shuffleEnd + 0.1) return;
      const rects = [0, 1, 2].map((p) => [60 + p * 100 - 26, 90, 52, 52]); const i = pick(o, rects);
      if (i >= 0) { const chestAt = o.slots.findIndex((s, k) => o.slots[k] === o.hid); if (o.slots.indexOf(o.hid) === i) o.win = true; else o.lose = true; o.reveal = true; void chestAt; }
    },
    draw(o, t) {
      topBg(o); const showEnd = 0.9 / o.sp, picking = o.age > showEnd + o.swaps * o.swT;
      for (let id = 0; id < 3; id++) {
        let p = o.slots.indexOf(id), x = 60 + p * 100, y = 130;
        if (o.from && (id === o.from.a || id === o.from.b) && o.age - o.from.t0 < o.swT) { const k = (o.age - o.from.t0) / o.swT, other = id === o.from.a ? o.from.b : o.from.a, p0 = o.slots.indexOf(other); const x0 = 60 + p0 * 100; x = x0 + (x - x0) * k; y -= Math.sin(k * Math.PI) * 26 * (id === o.from.a ? 1 : -1); }
        if (id === o.hid && o.age < showEnd) drawActor(g, o.V.actor, x, 110 - Math.max(0, (o.age / showEnd - 0.5)) * 40, t, 2, { alpha: Math.min(1, 2 - o.age / showEnd * 2 + 0.6) });
        g.save(); g.translate(Math.round(x - 16), Math.round(y - 30)); g.scale(2, 2); G.drawChest(g, 0, 0, !!o.reveal && id === o.hid, false); g.restore();
        if (o.reveal && id === o.hid) drawActor(g, o.V.actor, x, y - 26, t, 2);
        if (picking && !o.reveal && p === o.sel) arrowDown(x, y - 52, t);
      }
    } },
  pule: { word: 'PULE!', icon: 'press', timeout: 'win', dur: () => 4.2,
    init(o) { o.jy = 0; o.vy = 0; o.obs = Array.from({ length: 1 + Math.min(2, Math.floor(o.lvl / 2)) }, (_, i) => ({ x: W + 30 + i * rnd(110, 150) })); },
    update(o) { if (press() && o.jy === 0) { o.vy = -250; sfx.jump(); } o.vy += 700 * o.dt; o.jy = Math.min(0, o.jy + o.vy * o.dt); if (o.jy === 0) o.vy = 0; for (const b of o.obs) { b.x -= (130 + o.lvl * 14) * o.sp * o.dt; if (Math.abs(b.x - 80) < 18 && o.jy > -22) o.lose = true; } },
    draw(o, t) { sideBg(o); for (const b of o.obs) drawActor(g, o.V.mob, b.x, 160, t + b.x, 2); drawActor(g, rich(o), 80, 160 + o.jy, t * (o.jy ? 0 : 3), 2); } },
  espante: { word: 'ESPANTE!', icon: 'movepress', timeout: 'lose', dur: () => 5,
    init(o) { o.px = W / 2; o.need = 1 + Math.min(3, Math.floor(o.lvl / 2) + 1); o.mobs = Array.from({ length: o.need }, (_, i) => ({ x: rnd(40, W - 40), y: 40 + i * 22, vx: (i % 2 ? -1 : 1) * (50 + o.lvl * 12), dead: 0 })); o.shots = []; o.cd = 0; },
    update(o) { moveX(o, 160); o.cd -= o.dt; if (press() && o.cd <= 0) { o.shots.push({ x: o.px, y: 120 }); o.cd = 0.22; sfx.zap(); }
      for (const m of o.mobs) { if (m.dead) { m.dead += o.dt; continue; } m.x += m.vx * o.sp * o.dt; if (m.x < 20 || m.x > W - 20) m.vx *= -1; }
      for (const s of o.shots) { s.y -= 300 * o.dt; for (const m of o.mobs) if (!m.dead && Math.abs(s.x - m.x) < 14 && Math.abs(s.y - (m.y - 10)) < 16) { m.dead = 0.01; s.y = -99; sfx.hit(); } }
      o.shots = o.shots.filter((s) => s.y > -20); if (o.mobs.every((m) => m.dead)) o.win = true; },
    draw(o, t) { sideBg(o); for (const m of o.mobs) if (!m.dead || m.dead < 0.3) drawActor(g, o.V.mob, m.x, m.y + (m.dead ? m.dead * 60 : 0), t + m.x, 2, { alpha: m.dead ? 1 - m.dead * 3 : 1, flip: m.vx < 0 }); for (const s of o.shots) spark(s.x, s.y); drawActor(g, rich(o), o.px, 160, t, 2, { flip: o.face }); } },
  acorde: { word: 'NÃO DURMA!', icon: 'mash', timeout: 'win', dur: () => 4,
    init(o) { o.awake = 0.6; o.z = []; },
    update(o) { o.awake -= (0.32 + o.lvl * 0.05) * o.sp * o.dt; if (press()) { o.awake = Math.min(1, o.awake + 0.11); sfx.tick(); } if (o.awake <= 0) o.lose = true; if (Math.random() < o.dt * 3) o.z.push({ x: 190, y: 80, t: 0 }); for (const z of o.z) { z.t += o.dt; z.x += 20 * o.dt; z.y -= 25 * o.dt; } o.z = o.z.filter((z) => z.t < 1.5); },
    draw(o, t) { topBg(o); g.save(); g.globalAlpha = 0.5; R(0, 0, W, H, '#05030c'); g.restore(); g.save(); g.translate(160, 150); g.scale(2.4, 2.4); bed(0, 0, false, t); g.restore(); drawActor(g, 'richard', 160, 146, t * (0.3 + o.awake), 3, { filter: `brightness(${0.45 + o.awake * 0.65})`, rot: (1 - o.awake) * 0.5 });
      g.font = '12px "Press Start 2P", monospace'; g.fillStyle = '#c8bce8'; for (const z of o.z) { g.globalAlpha = 1 - z.t / 1.5; g.fillText('Z', z.x, z.y); } g.globalAlpha = 1;
      R(40, 176, 240, 10, '#120c1e'); R(42, 178, 236 * o.awake, 6, o.awake < 0.3 ? '#ff5a5a' : '#7af0ff'); } },
  livro: { word: 'PEGUE O LIVRO!', icon: 'move4', timeout: 'lose', dur: () => 5,
    init(o) { const left = Math.random() < 0.5; o.px = left ? 40 : W - 40; o.py = ri(60, 150); o.bx = left ? W - 50 : 50; o.by = ri(50, 150);
      o.spikes = []; const n = 7 + o.lvl * 3; for (let k = 0; k < 200 && o.spikes.length < n; k++) { const tx = ri(2, 17), ty = ri(2, 10), cx = tx * 16 + 8, cy = ty * 16 + 8; if (dist(cx, cy, o.px, o.py - 8) < 30 || dist(cx, cy, o.bx, o.by) < 26) continue; if (!o.spikes.some(([a, b]) => a === tx && b === ty)) o.spikes.push([tx, ty]); } },
    update(o) { move4(o, 115); const tx = Math.floor(o.px / 16), ty = Math.floor((o.py - 4) / 16); if (o.spikes.some(([a, b]) => a === tx && b === ty)) { o.lose = true; o.why = 'spike'; } if (dist(o.px, o.py - 8, o.bx, o.by) < 16) o.win = true; },
    draw(o, t) { topBg(o); for (const [tx, ty] of o.spikes) G.drawTile(g, '^', tx, ty, o.V.theme, ROOM_OPEN); G.drawLacrBook(g, o.bx - 8, o.by - 10, t); arrowDown(o.bx, o.by - 30, t); drawActor(g, rich(o), o.px, o.py, t, 2, { flip: o.face }); } },
  conte: { word: 'QUANTOS?', icon: 'pick', timeout: 'lose', dur: (o) => 1.8 / o.sp + 2.6,
    init(o) { o.k = ri(3, 5 + Math.min(3, o.lvl)); o.flock = Array.from({ length: o.k }, (_, i) => ({ x: -30 - rnd(0, 120), y: rnd(30, 140), v: rnd(170, 230) })); const opts = new Set([o.k]); while (opts.size < 3) opts.add(Math.max(1, o.k + ri(-2, 2))); o.opts = [...opts].sort((a, b) => a - b); o.sel = 1; },
    update(o) { for (const b of o.flock) b.x += b.v * o.sp * o.dt; if (o.age < 1.8 / o.sp) return; const i = pick(o, o.opts.map((_, k) => [40 + k * 90, 80, 60, 50])); if (i >= 0) { if (o.opts[i] === o.k) o.win = true; else o.lose = true; } },
    draw(o, t) { sideBg(o); if (o.age < 1.8 / o.sp) { for (const b of o.flock) drawActor(g, o.V.mob, b.x, b.y, t + b.y, 2); return; } g.save(); g.globalAlpha = 0.6; R(0, 0, W, H, '#120c1e'); g.restore(); o.opts.forEach((n, k) => choiceBox(40 + k * 90, 80, 60, 50, k === o.sel, String(n))); } },
  equilibre: { word: 'EQUILIBRE!', icon: 'hold', timeout: 'win', dur: () => 4.2,
    init(o) { o.a = rnd(-0.1, 0.1); o.w = 0; o.n = 4 + Math.min(3, o.lvl); },
    update(o) { o.w += rnd(-1, 1) * 2.5 * o.dt * (1 + o.lvl * 0.3); o.w *= 0.98; let d = (inp.held('right') ? 1 : 0) - (inp.held('left') ? 1 : 0); if (inp.ptr.down) d = inp.ptr.x < W / 2 ? -1 : 1; o.a += (o.a * 1.6 + o.w * 0.6 + d * 1.6) * o.sp * o.dt; if (Math.abs(o.a) > 0.75) o.lose = true; },
    draw(o, t) { sideBg(o); drawActor(g, rich(o), 160 + o.a * 12, 160, t, 3, { rot: o.a * 0.15 }); books(160 + o.a * 30, 88, o.n, o.a); if (inp.ptr.down || inp.held('left') || inp.held('right')) { /* força mostrada nas setas */ } runeArrow('left', 24, 96, 10, o.a > 0.3 ? '#ff7a7a' : '#5a4a7a'); runeArrow('right', W - 24, 96, 10, o.a < -0.3 ? '#ff7a7a' : '#5a4a7a'); } },
  real: { word: 'QUAL É O DE VERDADE?', icon: 'pick', timeout: 'lose', dur: () => 3.6,
    init(o) { o.right = ri(0, 2); o.sel = 1; const fakes = ['hue-rotate(150deg)', 'invert(1) hue-rotate(180deg)', 'grayscale(1)', 'hue-rotate(260deg) saturate(2)']; o.fx = [0, 1, 2].map((i) => (i === o.right ? '' : fakes[(i + ri(0, 3)) % 4])); o.flip = [0, 1, 2].map((i) => i !== o.right && Math.random() < 0.3 + o.lvl * 0.1); },
    update(o) { const i = pick(o, [0, 1, 2].map((k) => [60 + k * 100 - 30, 70, 60, 90])); if (i >= 0) { if (i === o.right) o.win = true; else o.lose = true; } },
    draw(o, t) { topBg(o); R(8, 8, 52, 60, '#120c1e'); R(10, 10, 48, 56, '#ffe07a'); R(12, 12, 44, 52, '#2a1e44'); drawActor(g, o.V.actor, 34, 58, t, 2); for (let k = 0; k < 3; k++) { const x = 60 + k * 100; if (k === o.sel) arrowDown(x, 66, t); drawActor(g, o.V.actor, x, 156, t + k * 0.3, 3, { filter: o.fx[k] || undefined, flip: o.flip[k] }); } } },
  runas: { word: 'REPITA AS RUNAS!', icon: 'arrows', timeout: 'lose', dur: (o) => (2 + Math.min(4, o.lvl)) * 0.5 / o.sp + 3,
    init(o) { const D = ['up', 'right', 'down', 'left']; o.seq = Array.from({ length: 2 + Math.min(4, o.lvl) }, () => D[ri(0, 3)]); o.got = 0; o.flash = 0; },
    update(o) { const show = o.seq.length * 0.5 / o.sp; o.flash -= o.dt; if (o.age < show) return;
      let d = ['up', 'right', 'down', 'left'].find((k) => inp.hit(k));
      if (!d && inp.ptr.tap) { const dx = inp.ptr.x - W / 2, dy = inp.ptr.y - H / 2; d = Math.abs(dx) > Math.abs(dy) * 1.4 ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down'; }
      if (d) { if (d === o.seq[o.got]) { o.got++; o.flash = 0.15; sfx.blip(); if (o.got >= o.seq.length) o.win = true; } else o.lose = true; } },
    draw(o, t) { topBg(o); g.save(); g.globalAlpha = 0.5; R(0, 0, W, H, '#120c1e'); g.restore(); const show = o.seq.length * 0.5 / o.sp;
      if (o.age < show) { const i = Math.floor(o.age / (0.5 / o.sp)); runeArrow(o.seq[i], W / 2, H / 2, 34, ['#ff7ad8', '#7af0ff', '#ffe07a', '#7aff9a'][i % 4]); }
      else { o.seq.forEach((d, i) => runeArrow(d, W / 2 - (o.seq.length - 1) * 20 + i * 40, 40, 12, i < o.got ? '#7aff9a' : '#5a4a7a')); drawActor(g, 'richard', W / 2, 150, t, 2); for (const [d, x, y] of [['up', W / 2, 74], ['down', W / 2, 172], ['left', 30, 110], ['right', W - 30, 110]]) runeArrow(d, x, y, 12, '#c8bce8'); } } },
};
export const MICRO_KINDS = Object.keys(MICROS);

// ---------------------------------------------------------------- o chefe de cada visão
export const BOSS = { word: 'VENÇA A VISÃO!', icon: 'movepress', timeout: 'lose', dur: () => 11,
  init(o) { o.px = W / 2; o.hp = 4 + Math.min(6, o.lvl); o.max = o.hp; o.shots = []; o.foes = []; o.cd = 0; o.fire = 1; o.bx = W / 2; o.flash = 0; },
  update(o) { moveX(o, 165); o.cd -= o.dt; o.flash -= o.dt;
    o.bx = W / 2 + Math.sin(o.age * (0.9 + o.lvl * 0.08)) * 110; o.by = 70 + Math.sin(o.age * 2.1) * 10;
    if (press() && o.cd <= 0) { o.shots.push({ x: o.px, y: 120 }); o.cd = 0.2; sfx.zap(); }
    o.fire -= o.dt * o.sp; if (o.fire <= 0) { o.fire = Math.max(0.35, 0.9 - o.lvl * 0.06); const n = 1 + (o.lvl > 3 ? 1 : 0); for (let k = 0; k < n; k++) { const dx = o.px - o.bx + (k ? rnd(-60, 60) : 0), d = Math.hypot(dx, 90); o.foes.push({ x: o.bx, y: o.by, vx: dx / d * (95 + o.lvl * 8), vy: 90 / d * (95 + o.lvl * 8) }); } }
    for (const f of o.foes) { f.x += f.vx * o.sp * o.dt; f.y += f.vy * o.sp * o.dt; if (Math.abs(f.x - o.px) < 13 && f.y > 128 && f.y < 162) o.lose = true; }
    for (const s of o.shots) { s.y -= 320 * o.dt; if (Math.abs(s.x - o.bx) < 26 && Math.abs(s.y - o.by) < 26) { s.y = -99; o.hp--; o.flash = 0.12; sfx.hit(); } }
    o.shots = o.shots.filter((s) => s.y > -20); o.foes = o.foes.filter((f) => f.y < 200);
    if (o.hp <= 0) o.win = true; },
  draw(o, t) { sideBg(o); g.save(); g.globalAlpha = 0.16 + 0.08 * Math.sin(o.age * 8); R(0, 0, W, 160, '#ff2a4a'); g.restore();
    drawActor(g, o.V.boss || o.V.actor, o.bx, o.by + 30, t, o.V.boss ? 1 : 3, { filter: o.flash > 0 ? 'brightness(3)' : undefined });
    for (const f of o.foes) drawActor(g, o.V.mob, f.x, f.y + 10, t + f.x, 1);
    for (const s of o.shots) spark(s.x, s.y);
    drawActor(g, 'richard', o.px, 160, t, 2, { flip: o.face });
    R(60, 6, 200, 8, '#120c1e'); R(62, 8, 196 * Math.max(0, o.hp / o.max), 4, '#ff5a7a'); },
};
