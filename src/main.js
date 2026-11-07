// Richard Entediado — sozinho na Torre das Treze Vozes, Richard enlouquece de tédio e enxerga "visões".
// Cada visão é um personagem com seus minijogos de poucos segundos (estilo microjogos): 3 erros e acabou.
// A 1ª visão tem 7 minijogos, a 2ª tem 8, a 3ª tem 9... e cada uma termina num minijogo chefe mais difícil.
import { brandIntro } from './brand.js';
import { tr, font, LANGS, getLang, setLang } from './i18n.js';

const W = 320, H = 180, SITE = 'https://songofmoonlight.online';
const cv = document.getElementById('screen'), c = cv.getContext('2d');
const low = document.createElement('canvas'); low.width = W; low.height = H; const g = low.getContext('2d');
g.imageSmoothingEnabled = false;

// ---------------------------------------------------------------- salvo (progresso e ajustes)
const SAVE_KEY = 're_save';
const save = { music: 0.6, sfx: 0.8, unlocked: 1, best: {} };
try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (_) { /* novo */ }
const commit = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) { /* ok */ } };

// ---------------------------------------------------------------- som (sintetizado, sem arquivos)
let ac = null, musicGain = null, sfxGain = null, musicTimer = 0, musicStep = 0;
function audio() {
  if (ac) return ac;
  try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { return null; }
  musicGain = ac.createGain(); sfxGain = ac.createGain(); musicGain.connect(ac.destination); sfxGain.connect(ac.destination); applyVolume();
  return ac;
}
function applyVolume() { if (musicGain) musicGain.gain.value = save.music * 0.18; if (sfxGain) sfxGain.gain.value = save.sfx * 0.3; }
function tone(f, d = 0.12, type = 'square', v = 0.6, when = 0, bus = sfxGain) {
  if (!audio() || !bus) return;
  const t = ac.currentTime + when, o = ac.createOscillator(), gn = ac.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(0.001, t + d);
  o.connect(gn); gn.connect(bus); o.start(t); o.stop(t + d + 0.02);
}
const sfx = {
  ok: () => { tone(660, 0.08); tone(990, 0.12, 'square', 0.5, 0.07); },
  bad: () => { tone(200, 0.2, 'sawtooth'); tone(140, 0.3, 'sawtooth', 0.5, 0.12); },
  tick: () => tone(1200, 0.03, 'square', 0.3),
  blip: () => tone(520, 0.05, 'triangle', 0.5),
  win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.15, 'square', 0.5, i * 0.09)),
  lose: () => [392, 330, 262, 196].forEach((f, i) => tone(f, 0.25, 'triangle', 0.6, i * 0.14)),
  speed: () => [440, 554, 659, 880, 1108].forEach((f, i) => tone(f, 0.07, 'square', 0.4, i * 0.05)),
};
// música da torre: um arpejo melancólico em lá menor que acelera com o jogo
const MEL = [57, 60, 64, 69, 64, 60, 57, 55, 53, 57, 60, 65, 60, 57, 52, 56];
function musicTick(dt, tempo) {
  if (!ac || !musicGain || save.music <= 0) return;
  musicTimer -= dt;
  if (musicTimer > 0) return;
  musicTimer = 0.22 / tempo;
  const n = MEL[musicStep++ % MEL.length], f = 440 * Math.pow(2, (n - 69) / 12);
  tone(f, 0.2, 'triangle', 0.5, 0, musicGain);
  if (musicStep % 4 === 1) tone(f / 2, 0.4, 'sine', 0.6, 0, musicGain);
}

// ---------------------------------------------------------------- entrada (teclado, controle e toque)
const keys = new Set(), hits = new Set();
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'a', Enter: 'a', KeyZ: 'a', KeyJ: 'a', Escape: 'back', Backspace: 'back' };
addEventListener('keydown', (e) => { const k = KEYMAP[e.code]; if (!k) return; e.preventDefault(); audio(); if (!keys.has(k)) hits.add(k); keys.add(k); });
addEventListener('keyup', (e) => { const k = KEYMAP[e.code]; if (k) keys.delete(k); });
const pointer = { down: false, x: W / 2, y: H / 2 };
const toLogic = (e) => { const r = cv.getBoundingClientRect(), s = Math.min(r.width / W, r.height / H), ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2; return [(e.clientX - r.left - ox) / s, (e.clientY - r.top - oy) / s]; };
cv.addEventListener('pointerdown', (e) => { audio(); [pointer.x, pointer.y] = toLogic(e); pointer.down = true; pointer.tap = true; });
cv.addEventListener('pointermove', (e) => { [pointer.x, pointer.y] = toLogic(e); });
addEventListener('pointerup', () => { pointer.down = false; });
const held = (k) => keys.has(k);
const hit = (k) => hits.has(k);
// toque: lado esquerdo/direito = escolher, meio = confirmar (para minijogos de escolha)
const tapZone = () => (pointer.tap ? (pointer.x < W / 3 ? 'left' : pointer.x > (W * 2) / 3 ? 'right' : 'a') : null);
let padPrev = {};
function pollPad() {
  const p = navigator.getGamepads ? [...navigator.getGamepads()].find(Boolean) : null; if (!p) return;
  const now = { left: p.buttons[14]?.pressed || p.axes[0] < -0.5, right: p.buttons[15]?.pressed || p.axes[0] > 0.5, up: p.buttons[12]?.pressed || p.axes[1] < -0.5, down: p.buttons[13]?.pressed || p.axes[1] > 0.5, a: p.buttons[0]?.pressed, back: p.buttons[1]?.pressed };
  for (const [k, v] of Object.entries(now)) { if (v && !padPrev[k]) hits.add(k); if (v) keys.add(k); else if (padPrev[k]) keys.delete(k); }
  padPrev = now;
}

// ---------------------------------------------------------------- desenho em pixel
const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), w, h); };
function text(s, x, y, size = 8, col = '#fff', align = 'center', edge = '#120c1e') {
  g.font = font(size); g.textAlign = align; g.textBaseline = 'top';
  g.fillStyle = edge; for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [1, 1]]) g.fillText(s, x + dx, y + dy);
  g.fillStyle = col; g.fillText(s, x, y);
}
function wrapText(s, x, y, maxW, size = 8, col = '#fff', lh = 11) {
  g.font = font(size); const words = s.split(' '); let line = '', yy = y;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (g.measureText(t).width > maxW && line) { text(line, x, yy, size, col); line = w; yy += lh; } else line = t; }
  if (line) text(line, x, yy, size, col); return yy + lh;
}
const hash = (i, s = 0) => { let h = Math.imul(i ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(s + 7, 0xc2b2ae35); h ^= h >>> 13; h = Math.imul(h, 0x27d4eb2f); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
function bands(y0, y1, cols) { const n = cols.length, bh = (y1 - y0) / n; for (let i = 0; i < n; i++) R(0, y0 + i * bh, W, Math.ceil(bh) + 1, cols[i]); }

// Richard: cientista de cabelo branco espetado, óculos redondos e jaleco roxo. `mood`: 0 calmo .. 1 enlouquecido
function drawRichard(x, y, t, mood = 0, s = 1) {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(s, s);
  const sh = mood > 0.5 ? Math.round(Math.sin(t * 30) * mood) : 0;
  R(-7, 22, 14, 2, 'rgba(0,0,0,0.3)');
  R(-6, 10, 12, 12, '#120c1e'); R(-5, 11, 10, 11, '#6a4aa8'); R(-5, 11, 2, 11, '#8a6ac8'); R(-1, 12, 2, 8, '#e8e0f0');   // jaleco
  R(-5, 22, 4, 2, '#2a2236'); R(1, 22, 4, 2, '#2a2236');
  R(-7 + sh, 12, 2, 7, '#6a4aa8'); R(5 + sh, 12, 2, 7, '#6a4aa8'); R(-7 + sh, 18, 2, 2, '#f0c8a0'); R(5 + sh, 18, 2, 2, '#f0c8a0');
  R(-5, 0, 10, 11, '#120c1e'); R(-4, 1, 8, 9, '#f0c8a0'); R(-4, 8, 8, 2, '#d8a880');
  for (let i = 0; i < 6; i++) R(-6 + i * 2 + sh, -2 - (i % 2) * 2 - Math.round(mood * 2 * hash(i, Math.floor(t * 8))), 2, 4, '#f4f4fa');   // cabelo branco espetado
  R(-4, 4, 3, 3, '#e8f4ff'); R(1, 4, 3, 3, '#e8f4ff'); R(-1, 5, 2, 1, '#3a3a4a');   // óculos
  R(-3 + (mood > 0.6 ? Math.round(Math.sin(t * 9)) : 0), 5, 1, 1, '#120c1e'); R(2 - (mood > 0.6 ? Math.round(Math.sin(t * 9)) : 0), 5, 1, 1, '#120c1e');
  if (mood > 0.3) R(-2, 8, 4, 1, '#7a3a3a'); else R(-1, 8, 2, 1, '#7a3a3a');
  g.restore();
}
// Visões: cada personagem tem cores, forma e um "jeito" próprio (asas, chapéu, coroa, olhos...)
function drawVision(V, x, y, t, s = 1) {
  g.save(); g.translate(Math.round(x), Math.round(y + Math.sin(t * 2.5 + V.i) * 2)); g.scale(s, s);
  const [c1, c2, c3] = V.pal, disc = (cx, cy, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); };
  g.globalAlpha = 0.25; disc(0, 2, 20 + Math.sin(t * 3) * 1.5, c3); g.globalAlpha = 1;
  if (V.shape === 'wings') for (const sd of [-1, 1]) { const f = Math.sin(t * 8 + V.i) * 4; g.fillStyle = '#120c1e'; g.beginPath(); g.moveTo(sd * 4, -2); g.lineTo(sd * 21, -13 + f); g.lineTo(sd * 18, 11); g.closePath(); g.fill(); g.fillStyle = c2; g.beginPath(); g.moveTo(sd * 5, -2); g.lineTo(sd * 19, -11 + f); g.lineTo(sd * 16, 9); g.closePath(); g.fill(); disc(sd * 14, -2 + f / 2, 2.5, c3); }
  if (V.shape === 'tentacles') for (let i = 0; i < 5; i++) { const xx = -9 + i * 4.5, len = 9 + Math.round(Math.sin(t * 4 + i) * 3); R(xx - 1, 6, 4, len + 1, '#120c1e'); R(xx, 6, 2, len, c2); R(xx, 6 + len - 2, 2, 2, c3); }
  disc(0, 0, 11, '#120c1e'); disc(0, 0, 10, c2); disc(-1, -1, 9, c1); disc(-4, -4, 3, c3);   // corpo redondo com luz
  R(-2, 7, 5, 1, c2);
  if (V.shape === 'hat') { R(-12, -10, 24, 4, '#120c1e'); R(-11, -9, 22, 2, c2); R(-6, -20, 12, 11, '#120c1e'); R(-5, -19, 10, 10, c2); R(-5, -12, 10, 2, c3); }
  if (V.shape === 'crown') { R(-8, -14, 16, 6, '#120c1e'); R(-7, -13, 14, 4, '#ffd23a'); for (const xx of [-7, -2, 3]) { R(xx, -17, 4, 4, '#ffd23a'); } R(-1, -12, 2, 2, '#ff3a6a'); }
  if (V.shape === 'horns') for (const sd of [-1, 1]) { R(sd * 8 - 2, -15, 4, 8, '#120c1e'); R(sd * 8 - 1, -14, 2, 7, c3); R(sd * 9 - 1, -16, 2, 2, c3); }
  if (V.shape === 'helmet') { g.strokeStyle = '#e8eef8'; g.globalAlpha = 0.8; g.lineWidth = 1.5; g.beginPath(); g.arc(0, -1, 13, 0, 7); g.stroke(); g.globalAlpha = 1; R(-6, -12, 3, 2, '#ffffff'); }
  if (V.shape === 'gear') for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t; R(Math.cos(a) * 13 - 2, Math.sin(a) * 13 - 2, 4, 4, '#120c1e'); R(Math.cos(a) * 13 - 1, Math.sin(a) * 13 - 1, 2, 2, c3); }
  const blink = (t * 1.3 + V.i) % 4 < 0.12, look = Math.round(Math.sin(t * 0.9 + V.i));
  for (const ex of [-5, 2]) { if (blink) R(ex, 0, 4, 1, '#120c1e'); else { R(ex, -3, 4, 5, '#ffffff'); R(ex + 1 + look, -2, 2, 3, V.eye === '#ffffff' ? '#120c1e' : V.eye); R(ex + 1 + look, -2, 1, 1, '#ffffff'); } }
  R(-3, 4, 6, 2, '#120c1e'); R(-2, 5, 4, 1, '#ff7a9a');
  R(-8, 2, 2, 1, '#ff9ab8'); R(6, 2, 2, 1, '#ff9ab8');
  g.restore();
}
// ---------------------------------------------------------------- as 23 visões (personagens que o Richard enxerga)
// pool: quantos minijogos diferentes a visão tem (7, 8, 9...). As 3 primeiras já dá para jogar neste protótipo.
const VISIONS = [
  ['Mara, a Mariposa', 'wings', ['#d8b8ff', '#9a6ad8', '#f6e8ff'], '#2a1a3a', 'A primeira criatura que falou'],
  ['Ícaro', 'wings', ['#ffd8a0', '#e8a050', '#fff2d0'], '#3a2410', 'O explorador da cratera'],
  ['Aldo, o Sábio', 'hat', ['#7a8ad8', '#3a4a9a', '#c8d0ff'], '#ffffff', 'O mago que abriu o portal'],
  ['Selene Rúnica', 'crown', ['#a8e8ff', '#5ab0d8', '#e8faff'], '#1a3a5a', 'Lê o futuro nas runas'],
  ['Gus Rabugento', 'hat', ['#a89070', '#6a5040', '#d8c8a8'], '#2a1a10', 'Reclama de tudo, até do silêncio'],
  ['Doran das Minas', 'helmet', ['#c8a070', '#8a6040', '#f0d8a8'], '#1a1008', 'Cava túneis dentro da cabeça dele'],
  ['Coralina', 'crown', ['#ff9ab8', '#d85a80', '#ffe0ea'], '#3a0a1a', 'Canta debaixo d\'água'],
  ['Pipo Lanterna', 'helmet', ['#ffe07a', '#d8a020', '#fff8d0'], '#3a2a00', 'Nunca deixa a luz apagar'],
  ['Monice', 'horns', ['#ff7ad8', '#b83a98', '#ffd8f4'], '#2a0a20', 'Toca guitarra no meio da noite'],
  ['Nico do Farol', 'hat', ['#7ad8d8', '#2a8a8a', '#d8ffff'], '#0a2a2a', 'Conta navios que não existem'],
  ['Marcos das Marés', 'horns', ['#4a8ac8', '#2a5a98', '#9ad4f4'], '#fffbe8', 'O homem-peixe campeão'],
  ['Ray, a Arraia', 'wings', ['#7fd0f0', '#2f74bd', '#bff2ff'], '#ffffff', 'Voa por dentro das paredes'],
  ['Jerry', 'horns', ['#d8843a', '#a85a20', '#ffc890'], '#1a1008', 'O esquilo que esconde nozes no teto'],
  ['Lyon', 'helmet', ['#4a6ac8', '#2a3a8a', '#9ab0ff'], '#1a1226', 'O herói que nunca chega'],
  ['Hermes', 'horns', ['#a86a3a', '#6a3a1a', '#d8a070'], '#1a0a00', 'Um cavalo... dentro da torre?'],
  ['Sentinela Autômato', 'gear', ['#8a8aa0', '#5a5a70', '#c8c8dc'], '#ff3a3a', 'Esqueceu o código de socorro'],
  ['Prisma de Empatia', 'gear', ['#ff8aff', '#7af0ff', '#ffffff'], '#ffffff', 'Traduz tudo errado'],
  ['O Paciente do Leito 13', 'tentacles', ['#9ab0a0', '#5a7060', '#d8e8d8'], '#000000', 'Doze doses, treze pacientes'],
  ['General Antigo', 'horns', ['#a83a3a', '#6a1a1a', '#ff8a8a'], '#ffe07a', 'A guerra ainda não acabou para ele'],
  ['Conselheiro Desperto', 'crown', ['#e8d8a8', '#a89060', '#fffaf0'], '#2a2010', 'Quer um documento para tudo'],
  ['Eco da Cratera', 'tentacles', ['#6a6ad8', '#3a3a8a', '#b8b8ff'], '#ffffff', 'Repete tudo o que você pensa'],
  ['Leviatã dos Sonhos', 'tentacles', ['#2a8a7a', '#145a50', '#7ae8d0'], '#ffe07a', 'Nada no ar da torre'],
  ['A Sombra de Richard', 'tentacles', ['#3a2a4a', '#1a1226', '#8a6ac8'], '#ff3a6a', 'O próprio tédio, em pessoa'],
].map(([name, shape, pal, eye, line], i) => ({ i, name, shape, pal, eye, line, pool: 7 + i, playable: i < 3 }));

// ---------------------------------------------------------------- minijogos (cada um com variações de número, velocidade e tema)
// Cada minijogo: { word, init(o), update(o, dt), draw(o, t) }. o.win/o.lose decidem; tempo esgotado = o.timeout ('win' ou 'lose').
const KINDS = {
  pegar: { word: 'PEGUE!', timeout: 'lose',
    init(o) { o.px = W / 2; o.items = Array.from({ length: o.n }, (_, i) => ({ x: 40 + hash(i, o.seed) * (W - 80), y: -10 - i * 38 / o.sp, done: false })); },
    update(o, dt) { movePlayer(o, dt, 140); for (const it of o.items) { if (it.done) continue; it.y += (45 + o.v * 18) * o.sp * dt; if (it.y > 150 && it.y < 162 && Math.abs(it.x - o.px) < 16) { it.done = true; sfx.blip(); } if (it.y > 175) o.lose = true; } if (o.items.every((it) => it.done)) o.win = true; },
    draw(o, t) { scene(o); for (const it of o.items) if (!it.done) prop(o, it.x, it.y, t); basket(o.px, 156); } },
  desviar: { word: 'DESVIE!', timeout: 'win',
    init(o) { o.px = W / 2; o.items = []; o.spawn = 0; },
    update(o, dt) { movePlayer(o, dt, 150); o.spawn -= dt; if (o.spawn <= 0) { o.spawn = (0.55 - o.v * 0.05) / o.sp; o.items.push({ x: 20 + Math.random() * (W - 40), y: -10, vy: (70 + o.v * 15) * o.sp }); } for (const it of o.items) { it.y += it.vy * dt; if (it.y > 128 && it.y < 168 && Math.abs(it.x - o.px) < 13) o.lose = true; } },
    draw(o, t) { scene(o); for (const it of o.items) prop(o, it.x, it.y, t, true); drawRichard(o.px, 130, t, o.mood, 1.5); } },
  hora: { word: 'NA HORA!', timeout: 'lose',
    init(o) { o.m = 0; o.zone = 0.25 + Math.random() * 0.5; o.zw = 0.16 - o.v * 0.015; },
    update(o, dt) { o.m += dt * (0.9 + o.v * 0.25) * o.sp; if (hit('a') || pointer.tap) { const p = (Math.sin(o.m * Math.PI) + 1) / 2; if (Math.abs(p - o.zone) < o.zw / 2) o.win = true; else o.lose = true; } },
    draw(o, t) { scene(o); const x0 = 40, w = W - 80, p = (Math.sin(o.m * Math.PI) + 1) / 2; R(x0 - 2, 98, w + 4, 16, '#120c1e'); R(x0, 100, w, 12, '#2a2236'); R(x0 + (o.zone - o.zw / 2) * w, 100, o.zw * w, 12, o.V.pal[0]); R(x0 + p * w - 2, 94, 4, 24, '#ffffff'); drawVision(o.V, W / 2, 60, t, 0.9); } },
  martelar: { word: 'APERTE MUITO!', timeout: 'lose',
    init(o) { o.need = 6 + o.v * 2; o.got = 0; },
    update(o, dt) { if (hit('a') || pointer.tap) { o.got++; sfx.tick(); } if (o.got >= o.need) o.win = true; },
    draw(o, t) { scene(o); const k = o.got / o.need; drawVision(o.V, W / 2 + 40, 80, t, 1.2 - k * 0.6); drawRichard(70, 88, t, o.mood, 1.4); R(60, 140, 200, 10, '#120c1e'); R(62, 142, 196 * k, 6, o.V.pal[0]); } },
  contar: { word: 'QUANTOS?', timeout: 'lose',
    init(o) { o.k = 2 + Math.floor(Math.random() * (3 + o.v)); o.pick = 1; o.show = 1.2 / o.sp; o.pos = Array.from({ length: o.k }, (_, i) => [40 + hash(i, o.seed) * (W - 80), 30 + hash(i, o.seed + 1) * 90]); },
    update(o, dt) { o.show -= dt; if (o.show > 0) return; const z = tapZone(); if (hit('left') || z === 'left') { o.pick = Math.max(1, o.pick - 1); sfx.tick(); } if (hit('right') || z === 'right') { o.pick = Math.min(9, o.pick + 1); sfx.tick(); } if (hit('a') || z === 'a') { if (o.pick === o.k) o.win = true; else o.lose = true; } },
    draw(o, t) { scene(o); if (o.show > 0) { for (const [x, y] of o.pos) prop(o, x, y, t); return; } text('◀  ' + o.pick + '  ▶', W / 2, 80, 16, '#ffe07a'); } },
  porta: { word: 'QUAL PORTA?', timeout: 'lose',
    init(o) { o.doors = 3 + (o.v > 2 ? 1 : 0); o.right = Math.floor(Math.random() * o.doors); o.show = 0.9 / o.sp; o.sel = Math.floor(o.doors / 2); },
    update(o, dt) { o.show -= dt; if (o.show > 0) return; const z = tapZone(); if (hit('left') || z === 'left') { o.sel = Math.max(0, o.sel - 1); sfx.tick(); } if (hit('right') || z === 'right') { o.sel = Math.min(o.doors - 1, o.sel + 1); sfx.tick(); } if (hit('a') || z === 'a') { if (o.sel === o.right) o.win = true; else o.lose = true; } },
    draw(o, t) { scene(o); const dw = 34, gap = (W - o.doors * dw) / (o.doors + 1); for (let i = 0; i < o.doors; i++) { const x = gap + i * (dw + gap); R(x - 2, 58, dw + 4, 66, '#120c1e'); R(x, 60, dw, 64, '#5a3a24'); R(x + 3, 63, dw - 6, 58, '#7a5232'); R(x + dw - 9, 92, 3, 3, '#ffd23a'); if (o.show > 0 && i === o.right) drawVision(o.V, x + dw / 2, 92, t, 0.8); if (o.show <= 0 && i === o.sel) R(x, 130, dw, 4, '#ffe07a'); } } },
  pular: { word: 'PULE!', timeout: 'win',
    init(o) { o.jy = 0; o.vy = 0; o.obs = Array.from({ length: 1 + (o.v > 1 ? 1 : 0) }, (_, i) => ({ x: W + 30 + i * 120 })); },
    update(o, dt) { if ((hit('a') || pointer.tap) && o.jy === 0) { o.vy = -190; sfx.blip(); } o.vy += 520 * dt; o.jy = Math.min(0, o.jy + o.vy * dt); if (o.jy === 0) o.vy = 0; for (const b of o.obs) { b.x -= (110 + o.v * 15) * o.sp * dt; if (Math.abs(b.x - 70) < 14 && o.jy > -18) o.lose = true; } },
    draw(o, t) { scene(o); for (const b of o.obs) prop(o, b.x, 140, t, true); drawRichard(70, 114 + o.jy, t, o.mood, 1.5); } },
  acertar: { word: 'ACERTE!', timeout: 'lose',
    init(o) { o.need = 3 + o.v; o.got = 0; o.slot = Math.floor(Math.random() * 3); o.stay = 0.9 / o.sp; },
    update(o, dt) { o.stay -= dt; if (o.stay <= 0) { o.slot = Math.floor(Math.random() * 3); o.stay = (0.9 - o.v * 0.08) / o.sp; } const z = tapZone(), pressed = hit('left') ? 0 : hit('a') || hit('up') ? 1 : hit('right') ? 2 : z === 'left' ? 0 : z === 'a' ? 1 : z === 'right' ? 2 : -1; if (pressed >= 0) { if (pressed === o.slot) { o.got++; sfx.ok(); o.slot = (o.slot + 1 + Math.floor(Math.random() * 2)) % 3; o.stay = 0.9 / o.sp; } else o.lose = true; } if (o.got >= o.need) o.win = true; },
    draw(o, t) { scene(o); for (let i = 0; i < 3; i++) { const x = 70 + i * 90; R(x - 22, 110, 44, 10, '#120c1e'); R(x - 20, 112, 40, 6, '#3a2a4a'); if (i === o.slot) drawVision(o.V, x, 88, t, 0.8); } text(o.got + '/' + o.need, W / 2, 140, 8); } },
  chefe: { word: 'SOBREVIVA!', timeout: 'win', boss: true,
    init(o) { o.px = W / 2; o.items = []; o.spawn = 0; o.bx = W / 2; },
    update(o, dt) { movePlayer(o, dt, 160); o.bx = W / 2 + Math.sin(o.age * 1.7) * 110; o.spawn -= dt; if (o.spawn <= 0) { o.spawn = (0.42 - o.v * 0.03) / o.sp; const dx = o.px - o.bx, d = Math.hypot(dx, 120) || 1; o.items.push({ x: o.bx, y: 40, vx: dx / d * 110 * o.sp, vy: 120 / d * 110 * o.sp }); if (Math.random() < 0.5) o.items.push({ x: 20 + Math.random() * (W - 40), y: -10, vx: 0, vy: 90 * o.sp }); } for (const it of o.items) { it.x += it.vx * dt; it.y += it.vy * dt; if (it.y > 128 && it.y < 168 && Math.abs(it.x - o.px) < 12) o.lose = true; } },
    draw(o, t) { scene(o, true); drawVision(o.V, o.bx, 34, t, 1.3); for (const it of o.items) prop(o, it.x, it.y, t, true); drawRichard(o.px, 130, t, o.mood, 1.5); } },
};
const KIND_LIST = ['pegar', 'desviar', 'hora', 'martelar', 'contar', 'porta', 'pular', 'acertar'];
// as variações de cada visão: tipo x nível (pool 7 = 7 combinações diferentes; pool maiores misturam níveis mais altos)
function poolOf(V) { const out = []; for (let k = 0; out.length < V.pool; k++) out.push({ kind: KIND_LIST[(k + V.i * 3) % KIND_LIST.length], v: Math.floor(k / KIND_LIST.length) + Math.floor(V.i / 4) }); return out; }

function movePlayer(o, dt, sp) {
  let d = (held('right') ? 1 : 0) - (held('left') ? 1 : 0);
  if (pointer.down) d = Math.abs(pointer.x - o.px) < 3 ? 0 : Math.sign(pointer.x - o.px);
  o.px = Math.max(12, Math.min(W - 12, o.px + d * sp * o.sp * dt));
}
// cenário: alterna estilos (de lado, visto de cima, sonho) conforme o minijogo
const mix = (h1, h2, k) => { const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16); const ch = (sh) => Math.round(((a >> sh) & 255) * (1 - k) + ((b >> sh) & 255) * k); return '#' + ((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1); };
// cenário: alterna estilos (sala da torre vista de lado, chão visto de cima, sonho) e ganha a cor da visão
function scene(o, boss = false) {
  const [c1, c2, c3] = o.V.pal, st = o.style, dk = (k) => mix('#0c0818', c2, k);
  if (st === 0) {
    // sala da torre, de lado: parede de pedra, janela redonda com lua, estante, chão de tábuas
    R(0, 0, W, H, dk(0.18));
    for (let y = 0; y < 150; y += 10) for (let x = ((y / 10) % 2) * 12 - 12; x < W; x += 24) { R(x, y, 23, 9, dk(0.26 + hash(x * 7 + y, 5) * 0.06)); R(x, y, 23, 1, dk(0.34)); }
    R(250, 22, 44, 44, '#120c1e'); R(253, 25, 38, 38, '#0e1a3a'); g.fillStyle = '#fff4c0'; g.beginPath(); g.arc(278, 38, 8, 0, 7); g.fill(); g.fillStyle = '#0e1a3a'; g.beginPath(); g.arc(282, 36, 7, 0, 7); g.fill(); R(270, 25, 3, 38, '#120c1e'); R(253, 42, 38, 3, '#120c1e');
    R(18, 40, 46, 70, '#120c1e'); for (let i = 0; i < 3; i++) { R(20, 42 + i * 23, 42, 2, '#5a3a24'); for (let k = 0; k < 7; k++) R(22 + k * 5 + (i % 2), 49 + i * 23 - (k % 3), 4, 14 + (k % 3), [c1, c2, '#8a5a34', c3, '#5a7a9a'][(k + i) % 5]); }
    R(0, 150, W, 30, '#3a2418'); for (let x = (-o.age * 6) % 40; x < W; x += 40) R(x, 150, 1, 30, '#2a180e'); R(0, 150, W, 2, '#6a4430');
  } else if (st === 1) {
    // visto de cima: piso de pedra e um tapete com a cor da visão
    for (let y = 0; y < H; y += 20) for (let x = 0; x < W; x += 20) { R(x, y, 20, 20, dk(0.2)); R(x + 1, y + 1, 18, 18, dk(0.28 + ((x + y) / 20 % 2) * 0.05)); }
    R(30, 30, W - 60, H - 60, mix(c2, '#0c0818', 0.55)); R(34, 34, W - 68, H - 68, mix(c1, '#0c0818', 0.65));
    for (let x = 40; x < W - 40; x += 12) { R(x, 36, 6, 2, c3); R(x, H - 38, 6, 2, c3); }
  } else {
    // sonho: céu com a cor da visão, anéis girando e nuvens
    const top = mix('#06040e', c2, 0.45), bot = mix('#06040e', c1, 0.25);
    for (let y = 0; y < H; y += 6) R(0, y, W, 6, mix(top, bot, y / H));
    g.globalAlpha = 0.2; g.strokeStyle = c3; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.arc(W / 2, H / 2, 30 + i * 30 + ((o.age * 20) % 30), o.age + i, o.age + i + 4); g.stroke(); }
    g.globalAlpha = 1;
    for (let i = 0; i < 5; i++) { const x = ((hash(i, 8) * W + o.age * 8 * (1 + i % 2)) % (W + 60)) - 30, y = 20 + hash(i, 9) * 100; g.globalAlpha = 0.35; R(x, y, 34, 6, c3); R(x + 6, y - 4, 20, 4, c3); g.globalAlpha = 1; }
  }
  g.globalAlpha = 0.25; for (let i = 0; i < 18; i++) { const x = (hash(i, 3) * W + o.age * 10 * (i % 3 + 1)) % W, y = hash(i, 4) * H; R(x, y, 2, 2, c3); } g.globalAlpha = 1;
  // vinheta: a loucura do Richard escurece as bordas
  g.globalAlpha = 0.35; R(0, 0, W, 6, '#05030c'); R(0, H - 6, W, 6, '#05030c'); R(0, 0, 6, H, '#05030c'); R(W - 6, 0, 6, H, '#05030c'); g.globalAlpha = 1;
  if (boss) { g.globalAlpha = 0.18 + 0.1 * Math.sin(o.age * 6); R(0, 0, W, H, '#ff2a4a'); g.globalAlpha = 1; }
}
// o objeto do minijogo combina com a visão: estrela boa para pegar, bola espinhosa para desviar
function prop(o, x, y, t, danger = false) {
  const [c1, c2, c3] = o.V.pal; x = Math.round(x); y = Math.round(y);
  if (danger) {
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + t * 4; R(x + Math.cos(a) * 9 - 1, y + Math.sin(a) * 9 - 1, 3, 3, '#120c1e'); }
    g.fillStyle = '#120c1e'; g.beginPath(); g.arc(x, y, 8, 0, 7); g.fill(); g.fillStyle = c2; g.beginPath(); g.arc(x, y, 7, 0, 7); g.fill();
    R(x - 4, y - 4, 3, 3, c3); R(x - 3, y, 2, 2, '#ffffff'); R(x + 1, y, 2, 2, '#ffffff'); R(x - 2, y + 3, 4, 1, '#120c1e');
  } else {
    const k = 1 + Math.round(Math.sin(t * 8 + x) * 0.6);
    g.fillStyle = '#120c1e'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 4 : 9 + k; g.lineTo(x + Math.cos(a) * (r + 1), y + Math.sin(a) * (r + 1)); } g.fill();
    g.fillStyle = c1; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 3 : 8 + k; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.fill();
    R(x - 2, y - 3, 2, 2, '#ffffff'); R(x - 1, y - 1, 3, 3, c3);
  }
}
function basket(x, y) { R(x - 16, y - 2, 32, 10, '#120c1e'); R(x - 15, y - 1, 30, 8, '#8a5a34'); R(x - 15, y - 1, 30, 2, '#b07a44'); R(x - 10, y + 2, 2, 4, '#6a4024'); R(x + 8, y + 2, 2, 4, '#6a4024'); }

// ---------------------------------------------------------------- telas e fluxo
let mode = 'title', t = 0, sel = 0, run = null, micro = null, msg = null;
const MENU = [['Jogar', () => { mode = 'visions'; sel = 0; }], ['Configurações', () => { mode = 'settings'; sel = 0; }], ['Termos e privacidade', () => { mode = 'legal'; sel = 0; }]];
if (window.desktop?.quit) MENU.push(['Sair do jogo', () => window.desktop.quit()]);

function startRun(V) {
  run = { V, pool: poolOf(V), lives: 3, wins: 0, idx: 0, sp: 1, score: 0, boss: false };
  for (let i = run.pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [run.pool[i], run.pool[j]] = [run.pool[j], run.pool[i]]; }
  nextMicro();
}
function nextMicro() {
  const bossTime = run.wins >= run.pool.length;
  const spec = bossTime ? { kind: 'chefe', v: 1 + Math.floor(run.V.i / 3) } : run.pool[run.idx % run.pool.length];
  if (!bossTime && run.wins > 0 && run.wins % 4 === 0 && !run.sped) { run.sp = Math.min(2.2, run.sp + 0.15); run.sped = true; msg = { s: 'Mais rápido!', t: 1.1 }; sfx.speed(); } else run.sped = false;
  const K = KINDS[spec.kind];
  micro = { K, V: run.V, v: spec.v, sp: run.sp, n: 2 + spec.v, seed: (Math.random() * 1e6) | 0, style: K === KINDS.pular ? 0 : (run.idx + run.V.i) % 3, mood: Math.min(1, 0.2 + run.wins * 0.06), age: 0, dur: (K.boss ? 8 : 4.5) / run.sp, intro: 0.9, boss: !!K.boss };
  K.init(micro);
  mode = 'micro';
}
function endMicro(won) {
  if (won) { run.wins++; run.idx++; run.score += micro.boss ? 10 : 1; sfx.ok(); } else { run.lives--; run.idx++; sfx.bad(); }
  mode = 'between'; run.betweenT = 1.1; run.lastWon = won;
  if (won && micro.boss) { mode = 'cleared'; sfx.win(); save.unlocked = Math.max(save.unlocked, Math.min(VISIONS.filter((v) => v.playable).length, run.V.i + 2)); recordBest(); }
  else if (run.lives <= 0) { mode = 'over'; sfx.lose(); recordBest(); }
}
function recordBest() { const k = run.V.i; if ((save.best[k] || 0) < run.score) save.best[k] = run.score; commit(); }

function update(dt) {
  t += dt; pollPad();
  musicTick(dt, mode === 'micro' ? micro.sp * 1.4 : 1);
  if (msg && (msg.t -= dt) <= 0) msg = null;
  const back = hit('back');
  if (mode === 'title') {
    if (hit('up')) { sel = (sel + MENU.length - 1) % MENU.length; sfx.tick(); }
    if (hit('down')) { sel = (sel + 1) % MENU.length; sfx.tick(); }
    if (pointer.tap) { const i = Math.floor((pointer.y - 104) / 16); if (i >= 0 && i < MENU.length) { sel = i; MENU[i][1](); sfx.blip(); } }
    else if (hit('a')) { MENU[sel][1](); sfx.blip(); }
  } else if (mode === 'visions') {
    const z = tapZone();
    if (hit('left') || hit('up')) { sel = Math.max(0, sel - 1); sfx.tick(); }
    if (hit('right') || hit('down')) { sel = Math.min(VISIONS.length - 1, sel + 1); sfx.tick(); }
    if (pointer.tap && pointer.y > 150) { if (pointer.x < 80) { mode = 'title'; sel = 0; } }
    else if (z === 'left') { sel = Math.max(0, sel - 1); sfx.tick(); } else if (z === 'right') { sel = Math.min(VISIONS.length - 1, sel + 1); sfx.tick(); }
    else if (hit('a') || z === 'a') { const V = VISIONS[sel]; if (V.playable && V.i < save.unlocked) { sfx.blip(); startRun(V); } else sfx.bad(); }
    if (back) { mode = 'title'; sel = 0; }
  } else if (mode === 'settings') {
    const rows = 4;
    if (hit('up')) { sel = (sel + rows - 1) % rows; sfx.tick(); }
    if (hit('down')) { sel = (sel + 1) % rows; sfx.tick(); }
    let d = (hit('right') ? 1 : 0) - (hit('left') ? 1 : 0);
    if (pointer.tap) { const i = Math.floor((pointer.y - 50) / 24); if (i >= 0 && i < rows) { sel = i; d = pointer.x > W / 2 ? 1 : -1; if (i === 3) d = 0; } }
    if (sel === 0 && d) { save.music = Math.max(0, Math.min(1, Math.round((save.music + d * 0.1) * 10) / 10)); applyVolume(); commit(); sfx.tick(); }
    if (sel === 1 && d) { save.sfx = Math.max(0, Math.min(1, Math.round((save.sfx + d * 0.1) * 10) / 10)); applyVolume(); commit(); sfx.tick(); }
    if (sel === 2 && d) { const i = LANGS.findIndex((l) => l.code === getLang()); setLang(LANGS[(i + d + LANGS.length) % LANGS.length].code); sfx.tick(); }
    if (back || (sel === 3 && (hit('a') || pointer.tap))) { mode = 'title'; sel = 1; }
  } else if (mode === 'legal') {
    const rows = 4, links = [['Termos de Uso', '/#/termos'], ['Privacidade', '/#/privacidade'], ['Compras e reembolsos', '/#/compras']];
    if (hit('up')) { sel = (sel + rows - 1) % rows; sfx.tick(); }
    if (hit('down')) { sel = (sel + 1) % rows; sfx.tick(); }
    let go = hit('a'); if (pointer.tap) { const i = Math.floor((pointer.y - 92) / 18); if (i >= 0 && i < rows) { sel = i; go = true; } }
    if (go) { if (sel < 3) window.open(SITE + links[sel][1], '_blank', 'noopener'); else { mode = 'title'; sel = 2; } sfx.blip(); }
    if (back) { mode = 'title'; sel = 2; }
  } else if (mode === 'micro') {
    const o = micro;
    if (o.intro > 0) { o.intro -= dt; }
    else {
      o.age += dt; o.K.update(o, dt);
      if (!o.win && !o.lose && o.age >= o.dur) { if (o.K.timeout === 'win') o.win = true; else o.lose = true; }
      if (o.win || o.lose) endMicro(!!o.win);
    }
  } else if (mode === 'between') {
    run.betweenT -= dt; if (run.betweenT <= 0) nextMicro();
  } else if (mode === 'cleared' || mode === 'over') {
    if (hit('a') || pointer.tap || back) { mode = 'visions'; sel = Math.min(save.unlocked - 1, VISIONS.length - 1); }
  }
  hits.clear(); pointer.tap = false;
}

// ---------------------------------------------------------------- desenho das telas
function towerBg() {
  bands(0, H, ['#0a0716', '#120c22', '#1a112e', '#22163a', '#2a1a44']);
  for (let i = 0; i < 50; i++) { const tw = Math.sin(t * (1 + hash(i, 2) * 2) + i); if (tw > -0.3) R(hash(i, 1) * W, hash(i, 3) * 90, 1, 1, tw > 0.7 ? '#ffffff' : '#8a80c8'); }
  // a torre com janelinha acesa
  R(118, 40, 84, 140, '#120c1e'); R(120, 42, 80, 140, '#3a2e4c'); for (let y = 46; y < 180; y += 8) R(120, y, 80, 1, '#2e2440'); R(120, 42, 10, 140, '#4a3e5c');
  g.fillStyle = '#2a2040'; g.beginPath(); g.moveTo(112, 44); g.lineTo(160, 6); g.lineTo(208, 44); g.closePath(); g.fill();
  R(150, 64, 20, 24, '#120c1e'); R(152, 66, 16, 20, '#ffd27a'); R(159, 66, 2, 20, '#120c1e'); R(152, 75, 16, 2, '#120c1e');
  drawRichard(160, 78, t, 0.4 + 0.3 * Math.sin(t * 0.7), 0.6);
}
function lives(n, x, y) { for (let i = 0; i < 3; i++) { const on = i < n; R(x + i * 14, y + 4, 8, 10, '#120c1e'); R(x + i * 14 + 1, y + 5, 6, 8, on ? '#f0e8d8' : '#3a3046'); if (on) { R(x + i * 14 + 3, y - 1 + Math.round(Math.sin(t * 9 + i)), 2, 4, '#ffd23a'); R(x + i * 14 + 3, y + 1, 2, 2, '#ff8a3a'); } } }

function draw() {
  if (mode === 'title') {
    towerBg();
    text(tr('RICHARD ENTEDIADO'), W / 2, 92 - 70, 16, '#ffe07a');
    wrapText(tr('Sozinho na torre, Richard começa a ver coisas.'), W / 2, 44, 300, 6, '#c8bce8', 9);
    g.globalAlpha = 0.85; R(80, 100, 160, MENU.length * 16 + 6, '#120c1e'); g.globalAlpha = 1;
    MENU.forEach(([s], i) => text((i === sel ? '▶ ' : '') + tr(s), W / 2, 104 + i * 16, 8, i === sel ? '#ffe07a' : '#ffffff'));
  } else if (mode === 'visions') {
    R(0, 0, W, H, '#120c1e'); bands(0, H, ['#120c1e', '#1a1230', '#22183e']);
    text(tr('Escolha uma visão'), W / 2, 8, 8, '#ffe07a');
    const V = VISIONS[sel], open = V.playable && V.i < save.unlocked;
    for (let k = -2; k <= 2; k++) { const j = sel + k; if (j < 0 || j >= VISIONS.length) continue; const X = VISIONS[j], ok = X.playable && X.i < save.unlocked; g.globalAlpha = k === 0 ? 1 : 0.45; if (ok || k === 0) drawVision(X, W / 2 + k * 64, 64, t, k === 0 ? 1.3 : 0.8); else { R(W / 2 + k * 64 - 10, 50, 20, 26, '#2a2236'); text('?', W / 2 + k * 64, 58, 8, '#8a80a8'); } g.globalAlpha = 1; }
    text((sel + 1) + '/23  ' + V.name, W / 2, 100, 8, open ? '#ffffff' : '#8a80a8');
    text(V.line, W / 2, 114, 6, '#c8bce8');
    text(V.pool + ' ' + tr('minijogos') + ' + ' + tr('Chefe!'), W / 2, 128, 6, '#9a90c0');
    text(!V.playable ? tr('Em breve') : !open ? tr('Bloqueada') : (save.best[V.i] ? tr('Recorde') + ': ' + save.best[V.i] : '▶'), W / 2, 142, 8, open ? '#ffe07a' : '#8a80a8');
    text('◀ ' + tr('Voltar'), 8, 166, 6, '#c8bce8', 'left');
  } else if (mode === 'settings') {
    towerBg(); g.globalAlpha = 0.9; R(30, 20, 260, 150, '#120c1e'); g.globalAlpha = 1;
    text(tr('Configurações'), W / 2, 28, 8, '#ffe07a');
    const rows = [[tr('Música'), '◀ ' + Math.round(save.music * 100) + '% ▶'], [tr('Efeitos'), '◀ ' + Math.round(save.sfx * 100) + '% ▶'], [tr('Idioma'), '◀ ' + LANGS.find((l) => l.code === getLang()).name + ' ▶'], [tr('Voltar'), '']];
    rows.forEach(([a, b], i) => { const y = 54 + i * 24, on = i === sel; text(a, 48, y, 8, on ? '#ffe07a' : '#ffffff', 'left'); if (b) text(b, 272, y, 6, on ? '#ffe07a' : '#c8bce8', 'right'); });
  } else if (mode === 'legal') {
    towerBg(); g.globalAlpha = 0.9; R(20, 16, 280, 156, '#120c1e'); g.globalAlpha = 1;
    text(tr('Termos e privacidade'), W / 2, 24, 8, '#ffe07a');
    wrapText(tr('O jogo guarda só o seu progresso neste aparelho. Os textos completos estão no site.'), W / 2, 44, 250, 6, '#c8bce8', 10);
    [tr('Termos de Uso'), tr('Privacidade'), tr('Compras e reembolsos'), tr('Voltar')].forEach((s, i) => text((i === sel ? '▶ ' : '') + s + (i < 3 ? ' ↗' : ''), W / 2, 96 + i * 18, 8, i === sel ? '#ffe07a' : '#ffffff'));
  } else if (mode === 'micro' || mode === 'between' || mode === 'cleared' || mode === 'over') {
    if (mode === 'micro' && micro.intro <= 0) {
      micro.K.draw(micro, t);
      const k = 1 - micro.age / micro.dur; R(0, H - 3, W, 3, '#120c1e'); R(0, H - 3, W * Math.max(0, k), 3, k < 0.3 ? '#ff5a5a' : '#ffe07a');   // pavio do tempo
      lives(run.lives, 4, 4);
    } else {
      towerBg(); g.globalAlpha = 0.55; R(0, 0, W, H, '#0a0716'); g.globalAlpha = 1;
      drawRichard(80, 92, t, Math.min(1, 0.2 + run.wins * 0.06), 1.6);
      drawVision(run.V, 230, 92, t, 1.4);
      lives(run.lives, W / 2 - 20, 150);
      text(tr('Pontos') + ': ' + run.score, W / 2, 132, 6, '#c8bce8');
      if (mode === 'micro') { const word = tr(micro.K.word); text(micro.boss ? tr('Chefe!') : '', W / 2, 18, 8, '#ff7a9a'); text(word, W / 2, 50 - Math.round(Math.max(0, micro.intro - 0.6) * 60), 16, '#ffe07a'); if (micro.K === KINDS.contar || micro.K === KINDS.porta || micro.K === KINDS.acertar) wrapText(tr('Setas ou toque nos lados: escolher. A ou toque no meio: confirmar.'), W / 2, 74, 280, 5, '#c8bce8', 8); }
      if (mode === 'between') text(run.lastWon ? '✓' : '✗', W / 2, 60, 24, run.lastWon ? '#7aff9a' : '#ff5a5a');
      if (mode === 'cleared') { text(tr('Visão vencida!'), W / 2, 40, 12, '#7aff9a'); text(tr('Toque ou aperte para continuar'), W / 2, 166, 6, '#ffffff'); }
      if (mode === 'over') { text(tr('Fim da visão'), W / 2, 40, 12, '#ff7a9a'); text(tr('Recorde') + ': ' + (save.best[run.V.i] || 0), W / 2, 60, 8, '#ffe07a'); text(tr('Toque ou aperte para continuar'), W / 2, 166, 6, '#ffffff'); }
    }
  }
  if (msg) text(tr(msg.s), W / 2, 24, 12, '#7af0ff');
  // tela: escala inteira quando dá, sempre nítida
  const r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  const s = Math.min(cv.width / W, cv.height / H), dw = W * s, dh = H * s;
  c.imageSmoothingEnabled = false; c.fillStyle = '#05030c'; c.fillRect(0, 0, cv.width, cv.height);
  c.drawImage(low, Math.floor((cv.width - dw) / 2), Math.floor((cv.height - dh) / 2), Math.floor(dw), Math.floor(dh));
}

let last = performance.now();
function frame(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); draw(); requestAnimationFrame(frame); }
document.fonts?.load(font(8)).finally(() => { requestAnimationFrame(frame); brandIntro(); });
window.__re = { test(kind) { startRun(VISIONS[2]); run.pool = [{ kind: kind === "chefe" ? "pegar" : kind, v: 1 }]; run.wins = kind === "chefe" ? 1 : 0; nextMicro(); }, art: { drawRichard, drawVision, g, low }, get mode() { return mode; }, VISIONS, poolOf, startRun: (i) => startRun(VISIONS[i]), get run() { return run; }, get micro() { return micro; } };
