// Richard Is Bored — sozinho na Torre das Treze Vozes (Lacrímora), Richard para de dormir e começa a ter visões.
// Cada visão é uma sequência de minijogos de poucos segundos, com o "palco" entre eles (como nos clássicos de
// microjogos): o Richard e a visão no palco psicodélico, as velas (vidas), o contador, a ordem gigante e o zoom
// para dentro do minijogo. A 1ª visão tem 7 minijogos, a 2ª 8, a 3ª 9... e sempre termina num chefe.
import { brandIntro } from './brand.js';
import { tr, font, cjk, LANGS, getLang, setLang, VISION_TEXT } from './i18n.js';
import { initAudio, setVolumes, playSong, setTempo, pumpMusic, sfx } from './audio.js';
import { drawActor, room, ROOM_OPEN, fillTextAccents, bossActor, fitScale, G, lighting, vignette, motes, fog } from './art.js';
import { MICROS, MICRO_KINDS, BOSS, bindMicro, W, H } from './micro.js';

const SITE = 'https://songofmoonlight.online';
const cv = document.getElementById('screen'), c = cv.getContext('2d');
const mk = () => { const k = document.createElement('canvas'); k.width = W; k.height = H; return k; };
const low = mk(), g = low.getContext('2d'), mcv = mk(), mg = mcv.getContext('2d'), post = mk(), pg = post.getContext('2d');
for (const x of [g, mg, pg]) x.imageSmoothingEnabled = false;

// ---------------------------------------------------------------- progresso e ajustes
const SAVE_KEY = 'rib_save';
const save = { music: 0.7, sfx: 0.8, unlocked: 1, best: {}, seenStory: false };
try { Object.assign(save, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch (_) { /* novo */ }
const commit = () => { try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) { /* ok */ } };
setVolumes(save.music, save.sfx);

// ---------------------------------------------------------------- entrada: teclado, controle de videogame e toque
// `device` guarda o último jeito que você usou (teclado, controle ou toque): os avisos de controle mudam junto.
// No toque aparecem o joystick e os botões A/B do Song of Moonlight (mesmo desenho), só quando a tela precisa deles.
const keys = new Set(), hits = new Set();
let device = matchMedia?.('(pointer: coarse)').matches ? 'touch' : 'keyboard';
const KEYMAP = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', Space: 'a', Enter: 'a', KeyZ: 'a', KeyJ: 'a', Escape: 'back', Backspace: 'back' };
const wake = () => { initAudio(); };
addEventListener('keydown', (e) => { const k = KEYMAP[e.code]; if (!k) return; e.preventDefault(); wake(); device = 'keyboard'; if (!keys.has(k)) hits.add(k); keys.add(k); });
addEventListener('keyup', (e) => { const k = KEYMAP[e.code]; if (k) keys.delete(k); });
const ptr = { down: false, x: W / 2, y: H / 2, tap: false };
const toLogic = (e) => { const r = cv.getBoundingClientRect(), s = Math.min(r.width / W, r.height / H), ox = (r.width - W * s) / 2, oy = (r.height - H * s) / 2; return [(e.clientX - r.left - ox) / s, (e.clientY - r.top - oy) / s]; };
cv.addEventListener('pointerdown', (e) => {
  wake(); if (e.pointerType === 'touch' || e.pointerType === 'pen') device = 'touch'; else if (device === 'touch') device = 'keyboard';
  const [x, y] = toLogic(e); ptr.x = x; ptr.y = y; ptr.down = true; ptr.tap = true;
});
cv.addEventListener('pointermove', (e) => { [ptr.x, ptr.y] = toLogic(e); });
addEventListener('pointerup', () => { ptr.down = false; }); addEventListener('pointercancel', () => { ptr.down = false; });
// joystick e botões na tela (HTML, igual ao Song of Moonlight)
const stick = { x: 0, y: 0, on: false };
(function touchControls() {
  const zone = document.getElementById('stick-zone'), base = document.getElementById('stick'), knob = document.getElementById('knob');
  if (!zone) return;
  for (const btn of document.querySelectorAll('#touch [data-act]')) {
    const k = btn.dataset.act;
    const down = (e) => { e.preventDefault(); wake(); device = 'touch'; btn.setPointerCapture?.(e.pointerId); if (!keys.has(k)) hits.add(k); keys.add(k); btn.classList.add('on'); };
    const up = (e) => { e.preventDefault(); keys.delete(k); btn.classList.remove('on'); };
    btn.addEventListener('pointerdown', down); btn.addEventListener('pointerup', up); btn.addEventListener('pointercancel', up); btn.addEventListener('lostpointercapture', up);
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
  }
  let pid = null, cx = 0, cy = 0; const RAD = 56;
  const move = (x, y) => {
    let dx = x - cx, dy = y - cy; const d = Math.hypot(dx, dy);
    if (d > RAD) { dx = dx / d * RAD; dy = dy / d * RAD; }
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    const m = Math.min(d, RAD) / RAD; if (m < 0.18) { stick.x = stick.y = 0; return; }
    const k = Math.min(1, m / 0.7) / m; stick.x = dx / RAD * k; stick.y = dy / RAD * k;
  };
  zone.addEventListener('pointerdown', (e) => {
    if (pid !== null) return; e.preventDefault(); wake(); device = 'touch'; pid = e.pointerId; zone.setPointerCapture?.(pid);
    const r = zone.getBoundingClientRect(); cx = e.clientX; cy = e.clientY; base.style.left = cx - r.left + 'px'; base.style.top = cy - r.top + 'px';
    base.classList.add('on'); stick.on = true; move(e.clientX, e.clientY);
  });
  zone.addEventListener('pointermove', (e) => { if (e.pointerId === pid) { e.preventDefault(); move(e.clientX, e.clientY); } });
  const end = (e) => { if (e.pointerId !== pid) return; pid = null; stick.x = stick.y = 0; stick.on = false; knob.style.transform = 'translate(0px, 0px)'; base.classList.remove('on'); base.style.left = ''; base.style.top = ''; };
  zone.addEventListener('pointerup', end); zone.addEventListener('pointercancel', end);
})();
// quais controles a tela atual mostra no toque
function controlsFor() {
  if (['title', 'visions', 'settings', 'legal', 'howto'].includes(mode)) return 'stick a b';
  if (mode === 'cleared' || mode === 'over') return 'a';
  if (mode === 'play' && P && P.micro && ['micro', 'command', 'irisIn'].includes(P.phase)) {
    const ic = P.micro.K.icon;
    return ic === 'move' || ic === 'move4' || ic === 'hold' ? 'stick' : ic === 'press' || ic === 'mash' ? 'a' : 'stick a';
  }
  return '';
}
let ctlShown = null;
function syncControls() {
  const want = device === 'touch' ? controlsFor() : '';
  if (want === ctlShown) return; ctlShown = want;
  document.body.classList.toggle('touch', device === 'touch');
  for (const k of ['stick', 'a', 'b']) document.body.classList.toggle('ctl-' + k, want.split(' ').includes(k));
}
let padPrev = {}, padAxis = { x: 0, y: 0 }, stickPrev = '', stickRep = 0;
function pollPad(dt) {
  // joystick na tela também anda pelos menus (um passo por empurrão; segurando, repete)
  const sd = Math.abs(stick.x) > 0.6 || Math.abs(stick.y) > 0.6 ? (Math.abs(stick.x) > Math.abs(stick.y) ? (stick.x < 0 ? 'left' : 'right') : stick.y < 0 ? 'up' : 'down') : '';
  if (sd && sd !== stickPrev) { hits.add(sd); stickRep = 0.4; } else if (sd && (stickRep -= dt) <= 0) { hits.add(sd); stickRep = 0.16; }
  stickPrev = sd;
  const p = navigator.getGamepads ? [...navigator.getGamepads()].find(Boolean) : null; if (!p) { padAxis = { x: 0, y: 0 }; return; }
  const dz = (v) => (Math.abs(v) < 0.18 ? 0 : v);
  padAxis = { x: dz(p.axes[0] || 0) || (p.buttons[15]?.pressed ? 1 : p.buttons[14]?.pressed ? -1 : 0), y: dz(p.axes[1] || 0) || (p.buttons[13]?.pressed ? 1 : p.buttons[12]?.pressed ? -1 : 0) };
  const now = { left: padAxis.x < -0.5, right: padAxis.x > 0.5, up: padAxis.y < -0.5, down: padAxis.y > 0.5, a: p.buttons[0]?.pressed || p.buttons[2]?.pressed, back: p.buttons[1]?.pressed || p.buttons[8]?.pressed };
  let any = Math.abs(padAxis.x) > 0.3 || Math.abs(padAxis.y) > 0.3;
  for (const [k, v] of Object.entries(now)) { if (v) any = true; if (v && !padPrev[k]) { hits.add(k); wake(); } if (v) keys.add(k); else if (padPrev[k]) keys.delete(k); }
  if (any) device = 'pad';
  padPrev = now;
}
// direção analógica (-1..1): teclado, controle e joystick na tela, somados
function axis() {
  let x = (keys.has('right') ? 1 : 0) - (keys.has('left') ? 1 : 0), y = (keys.has('down') ? 1 : 0) - (keys.has('up') ? 1 : 0);
  if (Math.abs(padAxis.x) > Math.abs(x)) x = padAxis.x; if (Math.abs(padAxis.y) > Math.abs(y)) y = padAxis.y;
  if (stick.on && Math.hypot(stick.x, stick.y) > 0) { x = stick.x; y = stick.y; }
  return { x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) };
}
const joyOn = () => device === 'touch' && document.body.classList.contains('ctl-stick');
const inp = { held: (k) => keys.has(k) || (stick.on && ((k === 'left' && stick.x < -0.4) || (k === 'right' && stick.x > 0.4) || (k === 'up' && stick.y < -0.4) || (k === 'down' && stick.y > 0.4))), hit: (k) => hits.has(k), ptr, axis, joy: joyOn };
bindMicro(mg, inp);
const tapIn = (x, y, w, h) => ptr.tap && ptr.x >= x && ptr.x <= x + w && ptr.y >= y && ptr.y <= y + h;

// ---------------------------------------------------------------- texto em pixel (contorno + acentos certos)
// Os textos da tela são guardados numa lista e desenhados no fim, já na resolução do aparelho (nítidos, sem borrar
// ao ampliar). O contorno usa o "pixel" da própria fonte (1/8 do tamanho), como numa fonte de videogame.
const textQ = [];
function putText(ctx, q) {
  const { s, x, y, size, col, align, edge } = q, u = Math.max(0.6, size / 8);
  ctx.font = font(size); ctx.textAlign = align; ctx.textBaseline = 'top';
  const put = (xx, yy) => (cjk() ? ctx.fillText(s, xx, yy) : fillTextAccents(ctx, s, xx, yy, size));
  ctx.fillStyle = edge; for (const [dx, dy] of [[-u, 0], [u, 0], [0, -u], [0, u], [u, u], [-u, -u], [u, -u], [-u, u], [u * 1.5, u * 1.5]]) put(x + dx, y + dy);
  ctx.fillStyle = col; put(x, y);
}
function text(s, x, y, size = 8, col = '#fff', align = 'center', edge = '#120c1e', ctx = g) {
  const q = { s: String(s), x, y, size, col, align, edge };
  if (ctx === g) { q.m = g.getTransform(); q.a = g.globalAlpha; textQ.push(q); return; }
  putText(ctx, q);
}
function wrap(s, maxW, size) {
  g.font = font(size); const out = []; let line = '';
  const parts = cjk() ? [...s] : s.split(' '), sep = cjk() ? '' : ' ';
  for (const w of parts) { const t = line ? line + sep + w : w; if (g.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; }
  if (line) out.push(line); return out;
}
function para(s, x, y, maxW, size = 8, col = '#fff', lh = size + 5, align = 'center') { const ls = wrap(s, maxW, size); ls.forEach((l, i) => text(l, x, y + i * lh, size, col, align)); return y + ls.length * lh; }
const R = (x, y, w, h, col, ctx = g) => { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
function panel(x, y, w, h, alpha = 0.88) { g.save(); g.globalAlpha = alpha; R(x, y, w, h, '#120c1e'); g.restore(); R(x, y, w, 1, '#8a6ac8'); R(x, y + h - 1, w, 1, '#8a6ac8'); R(x, y, 1, h, '#8a6ac8'); R(x + w - 1, y, 1, h, '#8a6ac8'); for (const [a, b] of [[x, y], [x + w - 3, y], [x, y + h - 3], [x + w - 3, y + h - 3]]) R(a, b, 3, 3, '#e0c060'); }

// ---------------------------------------------------------------- as 32 visões (personagens do universo Song of Moonlight)
const SKY = { lacforest: ['#0e1a2a', '#2a4a3a', '#0a141e'], castle: ['#0c0c22', '#2a2a5a', '#0a0a1a'], lactower: ['#140c2a', '#3a2a6a', '#1a1236'], dmine: ['#1a120a', '#4a3420', '#140e08'],
  coast: ['#0a1426', '#2a4a7a', '#0a1222'], lacroots: ['#140e06', '#4a3a1a', '#0e0a04'], plains: ['#0c1430', '#3a4a8a', '#0a1022'], lacash: ['#1a0c0c', '#5a2a1a', '#120808'],
  laccrystal: ['#0a1a2e', '#2a5a8a', '#0e2238'], dcrypt: ['#0e0e14', '#3a3a4a', '#0a0a10'], moon: ['#06061a', '#24244a', '#12122a'], lacmarsh: ['#08162a', '#2a6aa8', '#0a1830'], moondg: ['#04040e', '#1a1a3a', '#06060e'] };
// [desenho, tema do chão, monstro dos minijogos, chefe (opcional)]
// [desenho, tema do chão, monstro dos minijogos, fala (índice em VISION_TEXT), chefe (opcional)]
const V_DEF = [
  ['mara', 'lacforest', 'bat', 0], ['hilda', 'castle', 'ghost', 1], ['salvia', 'lactower', 'ghost', 2], ['pedro', 'castle', 'skeleton', 3], ['doran', 'dmine', 'skeleton', 4],
  ['tom', 'castle', 'skeleton', 23], ['mirela', 'castle', 'slime', 5], ['elo', 'lactower', 'ghost', 6], ['bento', 'coast', 'crab', 7], ['iria', 'lacforest', 'frog', 8],
  ['rosa', 'plains', 'wolf', 24], ['brenda', 'dmine', 'bat', 9], ['ruk', 'lacroots', 'plant', 10], ['coral', 'coast', 'crab', 25], ['tobias', 'plains', 'slime', 11],
  ['brusk', 'lacash', 'scorpion', 12], ['lia', 'coast', 'bat', 26], ['odete', 'castle', 'ghost', 13], ['tessa', 'lacforest', 'bat', 27], ['ulisses', 'plains', 'slime', 28],
  ['nara', 'laccrystal', 'slimeP', 14], ['bruno', 'dcrypt', 'mummy', 29], ['hermes', 'plains', 'wolf', 15], ['oma', 'lacroots', 'plant', 30], ['selene', 'laccrystal', 'slimeP', 31],
  ['maelis', 'lacforest', 'bat', 16], ['aldo', 'dcrypt', 'skeleton', 17], ['icaro', 'moon', 'slimeP', 18], ['ray', 'lacmarsh', 'frog', 19],
  ['aldric', 'dcrypt', 'skeleton', 20, bossActor('skelking')], ['valerio', 'castle', 'bat', 21], ['ecoSilencio', 'moondg', 'ghost', 22],
];
const VISIONS = V_DEF.map(([actor, theme, mob, q, boss], i) => ({ i, actor, theme, mob, sky: SKY[theme], boss, name: VISION_TEXT[q].name, quote: VISION_TEXT[q].quote, pool: 7 + i }));
// a lista de minijogos da visão: 7 + i variações (tipo x nível), embaralhadas sem repetir o mesmo tipo em seguida
function makePool(V) {
  const kinds = MICRO_KINDS.map((_, k) => MICRO_KINDS[(k + V.i * 5) % MICRO_KINDS.length]), out = [];
  for (let k = 0; k < V.pool; k++) out.push({ kind: kinds[k % kinds.length], lvl: Math.floor(k / kinds.length) + Math.floor(V.i / 3) });
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  for (let i = 1; i < out.length; i++) if (out[i].kind === out[i - 1].kind) { const j = out.findIndex((x, k) => k > i && x.kind !== out[i - 1].kind); if (j > 0) [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

// ---------------------------------------------------------------- elementos do palco
function candle(x, y, lit, t, s = 2, smoke = 0) {
  const P = (a, b, w, h, col) => R(x + a * s, y + b * s, w * s, h * s, col);
  P(-3, 0, 6, 12, '#120c1e'); P(-2, 1, 4, 10, '#f0e8d8'); P(-2, 1, 1, 10, '#ffffff'); P(1, 1, 1, 10, '#c8bca8'); P(-4, 11, 8, 2, '#120c1e'); P(-3, 11, 6, 1, '#8a6a3a');
  P(0, -2, 1, 3, '#3a2a2a');
  if (lit) { const f = Math.sin(t * 17 + x) > 0 ? 1 : 0; g.save(); g.globalAlpha = 0.25; g.fillStyle = '#ffb04a'; g.beginPath(); g.arc(x + s / 2, y - 4 * s, 7 * s, 0, 7); g.fill(); g.restore(); P(-1, -7 + f, 3, 6 - f, '#ff8a3a'); P(0, -6 + f, 1, 4, '#fff2a0'); }
  else if (smoke > 0) { g.save(); g.globalAlpha = Math.min(1, smoke) * 0.6; for (let i = 0; i < 4; i++) P(Math.round(Math.sin(t * 3 + i) * 2), -4 - i * 3 - (1 - smoke) * 6, 2, 2, '#8a80a0'); g.restore(); }
}
// fundo psicodélico: raios girando, anéis pulsando, cores que trocam sem parar
function trippy(t, k = 1, hue0 = 270) {
  const cx = W / 2, cy = H / 2 - 6, n = 18, rot = t * 0.35 * k;
  for (let i = 0; i < n; i++) {
    const a0 = rot + (i / n) * Math.PI * 2, a1 = rot + ((i + 1) / n) * Math.PI * 2;
    g.fillStyle = `hsl(${(hue0 + (i % 2) * 50 + t * 40 * k) % 360},${55 + (i % 2) * 15}%,${i % 2 ? 20 : 30}%)`;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a0) * 400, cy + Math.sin(a0) * 400); g.lineTo(cx + Math.cos(a1) * 400, cy + Math.sin(a1) * 400); g.closePath(); g.fill();
  }
  g.lineWidth = 3;
  for (let r = 0; r < 6; r++) { const rad = ((t * 50 * k + r * 45) % 270); g.strokeStyle = `hsla(${(hue0 + 180 + r * 30 + t * 60) % 360},90%,70%,${0.35 * (1 - rad / 270)})`; g.beginPath(); g.arc(cx, cy, rad, 0, 7); g.stroke(); }
  // olhos flutuando (as vozes)
  for (let i = 0; i < 7; i++) { const a = t * 0.3 + i * 0.9, x = cx + Math.cos(a) * (90 + i * 9), y = cy + Math.sin(a * 1.3) * 60; const open = Math.sin(t * 2 + i * 3) > -0.6;
    R(x - 6, y - 3, 12, 6, '#120c1e'); if (open) { R(x - 5, y - 2, 10, 4, '#f0e8ff'); R(x - 1 + Math.round(Math.sin(t + i)), y - 2, 3, 4, `hsl(${(i * 50 + t * 90) % 360},90%,45%)`); } else R(x - 5, y, 10, 1, '#f0e8ff'); }
}
// distorção de onda na tela inteira (a loucura do Richard): cada faixa de linhas desliza um pouco
function wobble(amp, t, speed = 3) {
  if (amp <= 0.2) return;
  pg.clearRect(0, 0, W, H); pg.drawImage(low, 0, 0);
  for (let y = 0; y < H; y += 2) { const off = Math.round(Math.sin(y * 0.07 + t * speed) * amp); if (off) g.drawImage(post, 0, y, W, 2, off, y, W, 2); }
}
const STAGE_FLOOR = ['....................', '....................'];
// ícones de controle (o que fazer no minijogo)
const ICON_TEXT = { move: 1, move4: 1, press: 1, mash: 1, pick: 1, arrows: 1, hold: 1, movepress: 1, platform: 1 };
function ctrlText(icon, dev = device) {
  const mv = dev === 'pad' ? 'Analógico ou direcional' : dev === 'touch' ? 'Joystick na tela' : icon === 'move4' || icon === 'arrows' ? 'Setas ou WASD' : 'Setas ou A/D';
  const btn = dev === 'pad' ? 'Botão A' : dev === 'touch' ? (icon === 'press' || icon === 'mash' ? 'Toque na tela' : 'Botão na tela') : 'Espaço';
  if (icon === 'move' || icon === 'move4' || icon === 'hold') return tr(mv);
  if (icon === 'press') return tr(btn);
  if (icon === 'mash') return tr(btn) + ' ' + tr('sem parar!');
  if (icon === 'pick') return tr(dev === 'touch' ? 'Toque no certo' : dev === 'pad' ? 'Escolha + A' : 'Escolha + Espaço');
  if (icon === 'arrows') return tr(dev === 'touch' ? 'Toque no lado da seta' : mv);
  return tr(mv) + ' · ' + tr(btn) + ' ' + tr(icon === 'platform' ? 'pula' : 'atira');
}
function arrowTri(x, y, dir, s, col) {
  g.fillStyle = col; g.beginPath();
  if (dir === 'left') { g.moveTo(x - s, y); g.lineTo(x + s, y - s); g.lineTo(x + s, y + s); }
  if (dir === 'right') { g.moveTo(x + s, y); g.lineTo(x - s, y - s); g.lineTo(x - s, y + s); }
  if (dir === 'up') { g.moveTo(x, y - s); g.lineTo(x - s, y + s); g.lineTo(x + s, y + s); }
  if (dir === 'down') { g.moveTo(x, y + s); g.lineTo(x - s, y - s); g.lineTo(x + s, y - s); }
  g.closePath(); g.fill();
}
const HAND = ['....##......', '...#ww#.....', '...#ww#.....', '...#ww####..', '...#ww#ww##.', '.###ww#ww#w#', '#ww#wwwwww#w#', '#wwwwwwwwwww#', '#wwwwwwwwwws#', '.#wwwwwwwws#.', '..#wwwwwwss#.', '...#ssssss#..', '....######...'];
function hand(x, y, s = 1) {
  const C = { '#': '#3a1e14', w: '#f6d0a8', s: '#d8a078' };
  for (let j = 0; j < HAND.length; j++) for (let i = 0; i < HAND[j].length; i++) { const ch = HAND[j][i]; if (ch === '.') continue; R(x + (i - 6) * s, y + (j - 6) * s, s, s, C[ch]); }
  R(x - 2 * s, y - 5 * s, s, s, '#ffffff');
}
function btnA(x, y, t, pressed = false) {
  if (device === 'keyboard') { R(x - 14, y - 6 + (pressed ? 1 : 0), 28, 13, '#120c1e'); R(x - 13, y - 5 + (pressed ? 1 : 0), 26, 10, pressed ? '#8a80a8' : '#e8e0f0'); R(x - 9, y + 1 + (pressed ? 1 : 0), 18, 2, '#3a2a4a'); return; }
  if (device === 'touch') { hand(x, y + (pressed ? 2 : 0), 1); if (pressed) { g.strokeStyle = '#ffe07a'; g.lineWidth = 1; g.beginPath(); g.arc(x - 2, y - 7, 5, 0, 7); g.stroke(); } return; }
  g.fillStyle = '#120c1e'; g.beginPath(); g.arc(x, y + 1, 9, 0, 7); g.fill(); g.fillStyle = pressed ? '#c83a5a' : '#ff5a7a'; g.beginPath(); g.arc(x, y + (pressed ? 1 : 0), 8, 0, 7); g.fill(); text('A', x + 1, y - 3 + (pressed ? 1 : 0), 8, '#ffffff', 'center', '#7a1a3a');
}
function drawIcon(kind, x, y, t) {
  const blink = Math.floor(t * 6) % 2 === 0, Y = '#ffe07a', D = '#5a4a7a';
  R(x - 22, y - 14, 44, 28, '#120c1e'); R(x - 21, y - 13, 42, 26, '#2a1e44');
  if (kind === 'move') { arrowTri(x - 11, y, 'left', 7, blink ? Y : D); arrowTri(x + 11, y, 'right', 7, blink ? D : Y); }
  if (kind === 'move4') { R(x - 4, y - 11, 8, 22, '#5a4a7a'); R(x - 11, y - 4, 22, 8, '#5a4a7a'); const d = ['up', 'right', 'down', 'left'][Math.floor(t * 4) % 4]; const pos = { up: [0, -7], right: [7, 0], down: [0, 7], left: [-7, 0] }[d]; arrowTri(x + pos[0], y + pos[1], d, 4, Y); }
  if (kind === 'press') btnA(x, y, t, blink);
  if (kind === 'mash') { btnA(x - 4, y, t, Math.floor(t * 14) % 2 === 0); R(x + 9, y - 9, 2, 6, Y); R(x + 13, y - 6, 2, 6, Y); R(x + 9, y + 5, 2, 2, Y); }
  if (kind === 'pick') hand(x + 1, y + Math.round(Math.sin(t * 8) * 2), 2);
  if (kind === 'arrows') { const d = ['up', 'right', 'down', 'left'][Math.floor(t * 3) % 4]; for (const [dd, dx, dy] of [['up', 0, -7], ['right', 9, 0], ['down', 0, 7], ['left', -9, 0]]) arrowTri(x + dx, y + dy, dd, 4, dd === d ? Y : D); }
  if (kind === 'hold') { arrowTri(x - 11, y, 'left', 6, Y); arrowTri(x + 11, y, 'right', 6, Y); R(x - 3, y - 8, 6, 16, blink ? Y : D); }
  if (kind === 'platform') { arrowTri(x - 13, y + 4, 'left', 5, Y); arrowTri(x + 1, y + 4, 'right', 5, Y); const j = Math.round(Math.abs(Math.sin(t * 6)) * 6); R(x + 10, y + 2 - j, 6, 6, '#7af0ff'); R(x + 9, y + 9, 8, 2, D); }
  if (kind === 'movepress') { arrowTri(x - 13, y, 'left', 5, Y); arrowTri(x + 1, y, 'right', 5, Y); R(x + 10, y - 3, 6, 6, blink ? '#ff5a7a' : '#7a2a3a'); }
}

// ---------------------------------------------------------------- estado geral
let mode = 'boot', t = 0, sel = 0, P = null, storyPage = 0, storyNext = 'title', howPage = 0, rotateHint = false;
const MENU = [['Jogar', () => { if (!save.seenHow) { save.seenHow = true; commit(); go('howto'); } else go('visions'); }], ['Como jogar', () => go('howto')], ['Configurações', () => go('settings')], ['Termos e privacidade', () => go('legal')]];
if (window.desktop?.quit) MENU.push(['Sair do jogo', () => window.desktop.quit()]);
function go(m, next) { mode = m; sel = 0; if (m === 'story') { storyPage = 0; storyT = 0; storyNext = next || 'title'; } if (m === 'howto') howPage = 0; if (m === 'visions') sel = Math.min(save.unlocked - 1, VISIONS.length - 1); if (['title', 'visions', 'story', 'howto', 'settings', 'legal'].includes(m)) playSong('title'); }

// ---------------------------------------------------------------- partida (palco + minijogos)
const PH = { start: 2.4, command: 1.15, irisIn: 0.4, freeze: 0.6, irisOut: 0.4, result: 1.35, speed: 1.7, bossIntro: 6 };
function startVision(V) {
  P = { V, pool: makePool(V), idx: 0, wins: 0, lives: 3, sp: 1, score: 0, phase: 'start', pt: 0, micro: null, last: null, boss: false, bossDone: false, smoke: [0, 0, 0] };
  mode = 'play'; playSong('stage', 1); sfx.whoosh();
}
function setPhase(ph) { P.phase = ph; P.pt = 0; }
const mad = () => Math.min(1, P.wins / Math.max(6, P.pool.length));
function prepareMicro() {
  const K = P.boss ? BOSS : MICROS[P.pool[P.idx % P.pool.length].kind], lvl = P.boss ? Math.floor(P.V.i / 2) : P.pool[P.idx % P.pool.length].lvl;
  const o = { K, V: P.V, lvl, sp: P.sp, age: 0, dt: 0, sel: 0, trip: P.wins >= 5, mad: mad() };
  K.init(o); o.dur = K.dur(o) / (K.fixed || K === MICROS.bau || K === MICROS.conte || K === MICROS.runas ? 1 : P.sp);
  // primeiro quadro já desenhado (aparece durante o zoom)
  mg.save(); K.draw(o, t); mg.restore(); microPost();
  P.micro = o; setPhase('command'); sfx.slam();
}
function microPost() { motes(mg, t, 18, '230,220,255', 3); vignette(mg, 0.5); }
function finishMicro(won) {
  P.last = won; setPhase('freeze');
  if (won) { sfx.win(); P.score += P.boss ? 10 : 1; } else { sfx.lose(); }
}
function afterResult() {
  if (P.lives <= 0) { mode = 'over'; P.pt = 0; playSong(null); sfx.over(); record(); return; }
  if (P.bossDone) { mode = 'cleared'; P.pt = 0; playSong('title'); sfx.clear(); const nxt = Math.min(VISIONS.length, P.V.i + 2); P.unlockedNew = nxt > save.unlocked; save.unlocked = Math.max(save.unlocked, nxt); record(); return; }
  if (!P.boss && P.wins >= P.pool.length) { P.boss = true; setPhase('bossIntro'); playSong('boss', P.sp); sfx.boss(); return; }
  if (P.last && P.wins > 0 && P.wins % 4 === 0 && !P.boss) { P.sp = Math.min(2.2, P.sp + 0.16); setPhase('speed'); sfx.speed(); setTempo(P.sp); return; }
  prepareMicro();
}
function record() { const k = P.V.i; if ((save.best[k] || 0) < P.score) save.best[k] = P.score; commit(); }
function updatePlay(dt) {
  P.pt += dt; const ph = P.phase, k = (n) => n / (ph === 'start' || ph === 'speed' || ph === 'bossIntro' ? 1 : P.sp);
  if (hits.has('back') && ph !== 'micro') { go('visions'); return; }
  if (ph === 'start' && P.pt > k(PH.start)) prepareMicro();
  else if (ph === 'command' && P.pt > k(PH.command)) { setPhase('irisIn'); sfx.whoosh(); }
  else if (ph === 'irisIn' && P.pt > PH.irisIn) { setPhase('micro'); playSong(P.boss ? 'boss' : 'micro', P.sp); }
  else if (ph === 'micro') {
    const o = P.micro; o.dt = dt; o.age += dt; o.K.update(o);
    if (!o.win && !o.lose && o.age >= o.dur) { if (o.K.timeout === 'win') o.win = true; else o.lose = true; }
    if (o.win || o.lose) finishMicro(!!o.win);
  } else if (ph === 'freeze' && P.pt > PH.freeze) { setPhase('irisOut'); playSong(P.boss ? 'boss' : 'stage', P.sp); }
  else if (ph === 'irisOut' && P.pt > PH.irisOut) {
    if (P.last) { P.wins++; if (P.boss) P.bossDone = true; } else { P.lives--; P.smoke[P.lives] = 1; sfx.snuff(); }
    P.idx++; setPhase('result');
  } else if (ph === 'result' && P.pt > k(PH.result)) afterResult();
  else if ((ph === 'speed' && P.pt > PH.speed) || (ph === 'bossIntro' && (P.pt > PH.bossIntro || (P.pt > 1 && (hits.has('a') || ptr.tap))))) prepareMicro();
  P.smoke = P.smoke.map((s) => Math.max(0, s - dt * 0.6));
  setTempo(P.sp);
}
// o palco entre os minijogos
function drawStage(fx = {}) {
  const ph = P.phase, beat = Math.abs(Math.sin(t * Math.PI * 2 * (128 / 60 / 2) * P.sp));
  trippy(t, fx.boss ? 2.2 : fx.speed ? 3 : 1 + mad(), fx.boss ? 340 : 270 + P.V.i * 13);
  if (fx.boss) { g.save(); g.globalAlpha = 0.3; R(0, 0, W, H, '#ff1a3a'); g.restore(); }
  g.drawImage(room(P.V.theme === 'moon' ? 'lactower' : P.V.theme, STAGE_FLOOR), 0, 162);
  g.save(); g.globalAlpha = 0.35; R(0, 162, W, 30, '#120c1e'); g.restore();
  const won = ph === 'result' && P.last, lost = ph === 'result' && !P.last;
  const rich = P.bossDone ? 'richardCalm' : 'richard';
  // Richard à esquerda (dança quando acerta, treme quando erra), a visão à direita
  const rj = won ? -Math.abs(Math.sin(P.pt * 14)) * 10 : 0, rs = lost ? Math.round(Math.sin(P.pt * 60) * 2) : 0;
  drawActor(g, rich, 82 + rs, 170 + rj - Math.round(beat * 2), t * (won ? 3 : 1), 3, { rot: won ? Math.sin(P.pt * 12) * 0.12 : 0 });
  const va = fx.boss && P.V.boss ? P.V.boss : P.V.actor, vs = fitScale(va, 76, 3);
  drawActor(g, va, 240, 170 - Math.round(beat * 3), t, vs, { flip: true, filter: lost ? 'hue-rotate(60deg) brightness(1.3)' : undefined });
  // velas = vidas
  for (let i = 0; i < 3; i++) candle(22 + i * 22, 22, i < P.lives, t, 2, P.smoke[i]);
  // contador de minijogos vencidos (pula no ritmo)
  const cnt = String(P.wins), bs = 1 + beat * 0.12 + (won ? Math.max(0, 0.4 - P.pt) : 0);
  g.save(); g.translate(W / 2, 30); g.scale(bs, bs); g.fillStyle = '#120c1e'; g.beginPath(); g.arc(0, 0, 20, 0, 7); g.fill(); g.fillStyle = '#ffe07a'; g.beginPath(); g.arc(0, 0, 18, 0, 7); g.fill(); g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(-5, -6, 6, 0, 7); g.fill(); text(cnt, 1, -7, 16, '#3a2a10', 'center', '#ffe07a'); g.restore();
  text(P.boss ? tr('chefe') : `${Math.min(P.wins, P.pool.length)}/${P.pool.length}`, W / 2, 54, 6, '#ffffff');
  text(tr('Pontos') + ' ' + P.score, W - 8, 8, 6, '#ffe07a', 'right');
  if (won) text('✓', W / 2, 74 - Math.min(8, P.pt * 40), 24, '#7aff9a');
  if (lost) text('✗', W / 2, 74, 24, '#ff5a5a');
}
function drawCommand(k) {
  const o = P.micro, word = tr(o.K.word), s = k < 0.18 ? 3 - (k / 0.18) * 2 : 1 + Math.sin(t * 20) * 0.03;
  g.save(); g.globalAlpha = 0.55; R(0, 66, W, 74, '#120c1e'); g.restore();
  const size = word.length > 14 ? 12 : 16;
  g.save(); g.translate(W / 2, 84); g.scale(s, s); g.rotate(Math.sin(t * 9) * 0.03);
  text(word, 0, -size / 2, size, `hsl(${(t * 200) % 360},100%,72%)`, 'center', '#120c1e'); g.restore();
  drawIcon(o.K.icon, W / 2, 118, t);
  text(ctrlText(o.K.icon), W / 2, 134, 6, '#ffffff');
}
// o chefe aparece e se apresenta antes do quebra-cabeça final da visão
function drawBossIntro() {
  const k = P.pt, ba = P.V.boss || P.V.actor;
  g.drawImage(room(P.V.theme, ROOM_OPEN), 0, 0);
  const rise = Math.min(1, k / 1.2), s = fitScale(ba, 88, 4);
  drawActor(g, ba, 214, 128 + (1 - rise) * 30, t, s, { flip: true, alpha: rise });
  drawActor(g, 'richard', 74, 128, t, 2);
  lighting(g, [[214, 80, 110, 1], [74, 100, 50, 0.7]], 0.7, '20,4,20', '255,120,160');
  for (let i = 0; i < 14; i++) { const a = t * 0.8 + i * 0.45; R(214 + Math.cos(a) * (70 + (i % 3) * 10), 84 + Math.sin(a) * 40, 2, 2, '#ff9ab0'); }
  vignette(g, 0.6);
  const sc = Math.min(1, k * 3); g.save(); g.translate(W / 2, 16); g.scale(2.6 - sc * 1.6, 2.6 - sc * 1.6); text(tr('CHEFE!'), 0, -8, 12, '#ff5a7a'); g.restore();
  // fala digitada: o nome, a fala da visão e o desafio
  const say = tr(P.V.name) + ': "' + tr(P.V.quote) + '" ' + tr('Agora é comigo. Lembre o caminho das runas!');
  const n = Math.min(say.length, Math.floor(Math.max(0, k - 0.6) * 34));
  panel(10, 140, W - 20, 46, 0.86); para(say.slice(0, n), W / 2, 146, W - 36, 6, '#ffffff', 10);
  if (k > 1) text(tr('Toque ou aperte A para continuar'), W - 16, 176, 5, '#c8bce8', 'right');
}
// pavio queimando (o tempo do minijogo)
function drawFuse(o) {
  if (o.K.noFuse) return;
  const k = Math.max(0, 1 - o.age / o.dur), x0 = 30, x1 = W - 12, xe = x0 + (x1 - x0) * k, y = H - 8;
  g.fillStyle = '#120c1e'; g.beginPath(); g.arc(18, y - 1, 9, 0, 7); g.fill(); g.fillStyle = '#3a3a4a'; g.beginPath(); g.arc(18, y - 1, 8, 0, 7); g.fill(); R(14, y - 5, 3, 2, '#8a8aa0');
  for (let x = x0; x < xe; x += 4) R(x, y + (x / 4 % 2 ? 0 : 1), 4, 2, '#c8a06a');
  if (k > 0) { for (let i = 0; i < 5; i++) R(xe + Math.sin(t * 40 + i) * 4, y - 2 + Math.cos(t * 33 + i * 2) * 4, 2, 2, i % 2 ? '#fff2a0' : '#ff8a3a'); R(xe - 2, y - 2, 5, 5, '#ffffff'); }
  const left = o.dur - o.age; if (left < 3 && left > 0) text(String(Math.ceil(left)), xe, y - 18, 8, '#ffffff');
}
function drawPlay() {
  const ph = P.phase;
  if (ph === 'micro' || ph === 'freeze') {
    if (ph === 'micro') { mg.save(); P.micro.K.draw(P.micro, t); mg.restore(); microPost(); }
    g.drawImage(mcv, 0, 0);
    if (ph === 'micro') { drawFuse(P.micro); for (let i = 0; i < 3; i++) candle(W - 50 + i * 14, 16, i < P.lives, t, 1); }
    if (ph === 'freeze') { const s = Math.max(1, 2.4 - P.pt * 8); g.save(); g.translate(W / 2, H / 2); g.scale(s, s); text(P.last ? '✓' : '✗', 0, -16, 32, P.last ? '#7aff9a' : '#ff5a5a'); g.restore(); }
    if (P.micro.mad > 0.5 && ph === 'micro') wobble((P.micro.mad - 0.5) * 2.4, t, 2);
    return;
  }
  if (ph === 'bossIntro') { drawBossIntro(); return; }
  const fx = { boss: P.boss && ( ph === 'command' || ph === 'irisIn' || ph === 'irisOut' || ph === 'result'), speed: ph === 'speed' };
  drawStage(fx);
  if (ph === 'start') {
    const k = Math.min(1, P.pt / 0.4);
    g.save(); g.globalAlpha = 0.6; R(0, 60, W, 46, '#120c1e'); g.restore();
    text(tr('Visão') + ' ' + (P.V.i + 1), W / 2, 63 - (1 - k) * 30, 6, '#c8bce8');
    text(tr(P.V.name), W / 2, 73, 10, '#ffe07a');
    para('"' + tr(P.V.quote) + '"', W / 2, 89, 290, 5, '#ffffff', 8);
  }
  if (ph === 'command') drawCommand(P.pt / (PH.command / P.sp));
  if (ph === 'speed') { const s = 1 + Math.sin(P.pt * 20) * 0.1; g.save(); g.translate(W / 2, 90); g.scale(s, s); g.rotate(Math.sin(P.pt * 7) * 0.08); text(tr('MAIS RÁPIDO!'), 0, -8, 16, `hsl(${(t * 400) % 360},100%,70%)`); g.restore(); }
  // zoom circular para dentro e para fora do minijogo
  if (ph === 'irisIn' || ph === 'irisOut') {
    const k = ph === 'irisIn' ? P.pt / PH.irisIn : 1 - P.pt / PH.irisOut, r = Math.max(0, Math.min(1, k)) * 200;
    g.save(); g.beginPath(); g.arc(W / 2, H / 2, r, 0, 7); g.clip(); g.drawImage(mcv, 0, 0); g.restore();
    g.strokeStyle = '#ffe07a'; g.lineWidth = 3; g.beginPath(); g.arc(W / 2, H / 2, r, 0, 7); g.stroke();
  }
  vignette(g, 0.6); motes(g, t, 20);
  wobble(1.2 + mad() * 2.2 + (ph === 'speed' ? 3 : 0), t, 3 + P.sp);
}

// ---------------------------------------------------------------- telas
function bgRoom(theme) { g.drawImage(room(theme, ROOM_OPEN), 0, 0); }
// o observatório do Richard: piso da torre, mesa com papéis, janela com a lua, velas acesas e a escuridão em volta
const OBS = ['####################', '#..................#', '#..................#', '#..................#', '#..................#', '#..................#', '#..................#', '#..................#', '#..................#', '#..................#', '#..................#', '####################'];
function desk(x, y, t) {
  R(x - 30, y - 2, 60, 14, '#120c1e'); R(x - 29, y - 1, 58, 10, '#6a4428'); R(x - 29, y - 1, 58, 2, '#8a5a34'); R(x - 26, y + 9, 4, 12, '#4a2e1a'); R(x + 22, y + 9, 4, 12, '#4a2e1a');
  for (let i = 0; i < 4; i++) { const px = x - 22 + i * 12, py = y - 4 - (i % 2); R(px, py, 9, 6, '#120c1e'); R(px + 1, py + 1, 7, 4, '#e8dcbc'); R(px + 2, py + 2, 4, 1, '#8a7a9a'); }
  G.drawLacrBook(g, x + 6, y - 18, t);
}
function moonWindow(x, y, t) {
  R(x - 22, y - 26, 44, 52, '#120c1e'); g.fillStyle = '#0e1a3a'; g.beginPath(); g.arc(x, y - 4, 19, Math.PI, 0); g.fill(); R(x - 19, y - 4, 38, 28, '#0e1a3a');
  for (let i = 0; i < 6; i++) R(x - 16 + ((i * 13) % 32), y - 18 + ((i * 7) % 36), 1, 1, '#e8eeff');
  g.fillStyle = '#fff4c0'; g.beginPath(); g.arc(x + 4, y - 8, 8, 0, 7); g.fill(); g.fillStyle = '#0e1a3a'; g.beginPath(); g.arc(x + 8, y - 11, 7, 0, 7); g.fill();
  R(x - 1, y - 23, 2, 47, '#120c1e'); R(x - 19, y + 4, 38, 2, '#120c1e'); R(x - 22, y + 24, 44, 4, '#3a2e4c');
}
function drawTitle() {
  g.drawImage(room('lactower', OBS), 0, 0);
  const X = 214;   // o Richard e a mesa ficam à direita, o menu à esquerda
  moonWindow(288, 74, t); desk(X, 140, t);
  drawActor(g, 'richard', X, 136, t, 2);
  for (let i = 0; i < 9; i++) { const a = t * 0.5 + i * 0.7, x = X + Math.cos(a) * (30 + i * 5), y = 92 + Math.sin(a * 1.4) * 22; R(x - 3, y - 4, 7, 8, '#120c1e'); R(x - 2, y - 3, 5, 6, '#e8dcbc'); R(x - 1, y - 1, 3, 1, '#8a7a9a'); }
  candle(X - 42, 132, true, t, 1); candle(X + 44, 132, true, t, 1); candle(170, 170, true, t, 2); candle(300, 170, true, t, 2);
  lighting(g, [[X - 42, 124, 70], [X + 44, 124, 70], [170, 154, 60], [300, 154, 60], [288, 68, 70, 0.8], [X, 110, 50, 0.5], [76, 80, 90, 0.55]], 0.72);
  motes(g, t, 30); vignette(g, 0.5);
  const title = 'RICHARD IS BORED';
  g.font = font(16); let x = W / 2 - g.measureText(title).width / 2;
  for (let i = 0; i < title.length; i++) { const ch = title[i], w = g.measureText(ch).width; text(ch, x + w / 2, 10 + Math.round(Math.sin(t * 3 + i * 0.6) * 3), 16, `hsl(${(t * 60 + i * 22) % 360},90%,72%)`); x += w; }
  panel(8, 40, 138, MENU.length * 15 + 10);
  MENU.forEach(([s], i) => text((i === sel ? '▶' : ' ') + tr(s), 14, 46 + i * 15, 6, i === sel ? '#ffe07a' : '#ffffff', 'left'));
  text('Song of Moonlight', W - 6, 32, 5, '#8a80b0', 'right');
}
function updateTitle() {
  if (hits.has('up')) { sel = (sel + MENU.length - 1) % MENU.length; sfx.tick(); }
  if (hits.has('down')) { sel = (sel + 1) % MENU.length; sfx.tick(); }
  for (let i = 0; i < MENU.length; i++) if (tapIn(8, 44 + i * 15, 138, 15)) { sel = i; sfx.blip(); MENU[i][1](); return; }
  if (hits.has('a')) { sfx.blip(); MENU[sel][1](); }
}
// A história de abertura: cenas animadas que rodam sozinhas (toque ou A adianta; B/Esc pula tudo)
const STORY = [
  { text: 'Lacrímora. Torre das Treze Vozes.', dur: 6 },
  { text: 'Richard deu palavras às criaturas. A primeira foi Mara, uma mariposa ferida. Ela escolheu o próprio nome.', dur: 7.5 },
  { text: 'Depois veio a guerra entre Antigos e Despertos. Treze feridos, doze frascos de remédio.', dur: 7.5 },
  { text: 'Richard se trancou na torre para não ferir mais ninguém. E parou de dormir.', dur: 7 },
  { text: 'Sozinho, entediado, ele começa a ouvir vozes... e a ver coisas.', dur: 6.5 },
  { text: 'Pelo portal de Aldo chegam também os ecos de Brumavale: o rei que parou de dormir e a Noite do Silêncio.', dur: 8 },
  { text: 'Cada visão é alguém que ele conheceu, ou algo bem mais estranho. Vença as visões antes que a última vela apague.', dur: 8 },
];
let storyT = 0;
function towerOutside(k) {
  const cam = (1 - Math.min(1, k / 4)) * 90;   // a câmera sobe pela torre
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#05030f'); gr.addColorStop(1, '#2a1a4a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 70; i++) { const tw = Math.sin(t * (1 + (i % 5) * 0.4) + i); if (tw > -0.4) R((i * 97) % W, ((i * 53) % 140) + cam * 0.2, 1, 1, tw > 0.7 ? '#ffffff' : '#8a80c8'); }
  g.fillStyle = '#fff4c0'; g.beginPath(); g.arc(250, 40 + cam * 0.3, 18, 0, 7); g.fill(); g.fillStyle = '#05030f'; g.beginPath(); g.arc(258, 34 + cam * 0.3, 16, 0, 7); g.fill();
  // árvores de cristal de Lacrímora

  // a Torre das Treze Vozes, o mesmo desenho do Song of Moonlight (96x112), em dobro, sobre o chão de Lacrímora
  const tx = 160, top = 14 - cam * 1.1;   // a câmera sobe da porta até o telhado
  g.drawImage(room('lacrimora', ['####################', '####################']), 0, top + 210);
  g.save(); g.translate(tx - 96, top); g.scale(2, 2); G.drawLacrTower(g, 0, 0, t); g.restore();
  for (const [i, x] of [[0, 16], [1, 60], [2, 252], [3, 296]]) { g.save(); g.translate(x - 16, top + 178); g.scale(2, 2); G.drawCrystalTree(g, 0, 0, t + i); g.restore(); }
  lighting(g, [[tx, top + 90, 90], [250, 40 + cam * 0.3, 60, 0.6]], 0.4);
  fog(g, t, 130, 62, '170,160,230', 0.25); motes(g, t, 24, '160,255,220', 5);
}
function storyBeds(k) {
  g.drawImage(room('lactower', ROOM_OPEN), 0, 0);
  const who = ['elo', 'ruk', 'brusk', 'iria', 'nara', 'maelis'];
  for (let i = 0; i < 6; i++) { const x = 30 + i * 52; drawActor(g, who[i], x, 104, t + i, 1); R(x - 18, 104, 36, 12, '#120c1e'); R(x - 17, 105, 34, 6, '#e8e0f0'); R(x - 17, 111, 34, 4, '#8a5a34'); }
  // Richard anda de leito em leito entregando frascos
  const rx = 20 + ((k * 40) % 290), n = Math.min(12, Math.floor(k * 1.8));
  drawActor(g, 'richard', rx, 142, t * 3, 2);
  for (let i = 0; i < 13; i++) { const x = 32 + i * 21, y = 128; R(x - 3, y - 6, 6, 9, '#120c1e'); R(x - 2, y - 5, 4, 7, i < n ? '#c86aff' : '#3a2e4c'); }
  text(n + ' / 13', W - 10, 8, 8, n >= 12 ? '#ff7a9a' : '#ffffff', 'right');
  if (k > 5) { g.save(); g.globalAlpha = 0.25 + 0.15 * Math.sin(t * 8); R(0, 0, W, H, '#ff1a3a'); g.restore(); }
  lighting(g, [[rx, 120, 70], [160, 40, 90, 0.5]], 0.5); vignette(g, 0.6);
}
function storyAlone(k) {
  g.drawImage(room('lactower', OBS), 0, 0); moonWindow(254, 70, t); desk(160, 140, t);
  drawActor(g, 'richard', 160, 136, t, 2);
  // a porta se fecha e a escuridão cresce
  const door = Math.min(1, k / 2.5); R(14, 40, 30, 70, '#120c1e'); R(16, 42 + 66 * (1 - door), 26, 66 * door, '#5a3a24');
  for (let i = 0; i < 3; i++) candle(120 + i * 40, 132, true, t, 1);
  lighting(g, [[120, 124, 60], [160, 124, 60], [200, 124, 60], [254, 64, 60, 0.6]], 0.55 + door * 0.3);
  // olhos sempre abertos: o relógio gira, ele não dorme
  const cx = 70, cy = 60; g.strokeStyle = '#c8bce8'; g.lineWidth = 1; g.beginPath(); g.arc(cx, cy, 12, 0, 7); g.stroke(); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(t * 6) * 10, cy + Math.sin(t * 6) * 10); g.stroke(); g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(t * 0.5) * 6, cy + Math.sin(t * 0.5) * 6); g.stroke();
  vignette(g, 0.7);
}
const VOICES = ['Richard...', 'Treze...', 'Doze frascos...', 'Acorde...', 'Mara...', 'Durma...'];
function storyVoices(k) {
  trippy(t, 0.6 + k * 0.4, 270); g.save(); g.globalAlpha = Math.max(0, 0.7 - k * 0.12); R(0, 0, W, H, '#05030c'); g.restore();
  drawActor(g, 'richard', W / 2, 130, t * 2, 3, { rot: Math.sin(t * 2) * 0.08 });
  VOICES.forEach((v, i) => { const a = t * 0.6 + i * 1.05, r = 70 + Math.sin(t + i) * 20; g.save(); g.globalAlpha = Math.max(0, Math.min(1, k - i * 0.5)) * (0.6 + 0.4 * Math.sin(t * 3 + i)); text(tr(v), W / 2 + Math.cos(a) * r * 1.4, 80 + Math.sin(a) * r * 0.6, 6, `hsl(${(i * 60 + t * 80) % 360},90%,75%)`); g.restore(); });
  vignette(g, 0.5);
}
function portalFx(x, y, t, s = 1) {
  for (let r = 5; r >= 0; r--) { g.fillStyle = `hsla(${270 + r * 10 + Math.sin(t * 3) * 20},80%,${30 + r * 9}%,0.9)`; g.beginPath(); g.ellipse(x, y, (16 + r * 4) * s, (26 + r * 6) * s, 0, 0, 7); g.fill(); }
  for (let i = 0; i < 10; i++) { const a = t * 2 + i * 0.63, rr = 24 + (i % 3) * 8; R(x + Math.cos(a) * rr * s, y + Math.sin(a) * rr * 1.5 * s, 2, 2, '#f0d0ff'); }
}
function storyPortal(k) {
  g.drawImage(room('castle', ROOM_OPEN), 0, 0);
  portalFx(250, 100, t, 1.1);
  [['aldo', 0.5], ['hilda', 2], ['valerio', 3.5]].forEach(([w, at], i) => { const p = Math.max(0, Math.min(1, (k - at) / 2)); if (p <= 0) return; drawActor(g, w, 250 - p * (120 + i * 50), 140 - i * 10, t * 2, 2, { alpha: 0.35 + p * 0.45, filter: 'saturate(0.4) brightness(1.3) hue-rotate(200deg)', flip: true }); });
  lighting(g, [[250, 100, 110, 1]], 0.6, '8,4,24', '200,140,255'); motes(g, t, 30, '220,180,255', 9); vignette(g, 0.5);
}
function storyFinal(k) {
  trippy(t, 1 + k * 0.5, 270 + k * 30);
  const ring = ['mara', 'hilda', 'pedro', 'doran', 'mirela', 'aldo', 'icaro', 'ray', 'valerio', 'ecoSilencio'];
  ring.forEach((w, i) => { const a = t * (0.6 + k * 0.2) + i / ring.length * Math.PI * 2; drawActor(g, w, W / 2 + Math.cos(a) * 120, 118 + Math.sin(a) * 34, t + i, fitScale(w, 30, 2), { shadow: false }); });
  drawActor(g, 'richard', W / 2, 136, t * 2, 3);
  vignette(g, 0.5);
  if (k > 5.5) { const f = Math.min(1, (k - 5.5) * 3); g.save(); g.globalAlpha = 1 - Math.min(1, (k - 5.5) * 1.2); R(0, 0, W, H, '#ffffff'); g.restore(); g.save(); g.translate(W / 2, 50); g.scale(3 - f * 2, 3 - f * 2); text('RICHARD IS BORED', 0, -8, 16, '#ffe07a'); g.restore(); }
}
const STORY_DRAW = [towerOutside, (k) => {
  g.drawImage(room('lacforest', ROOM_OPEN), 0, 0);
  const rx = Math.min(130, -20 + k * 60), mx = 210, my = Math.min(118, 10 + k * 40);
  drawActor(g, 'richardCalm', rx, 138, rx < 130 ? t * 3 : t, 2);
  drawActor(g, 'mara', mx, my + Math.sin(t * 3) * 4, t, 2, { flip: true, shadow: my >= 118 });
  if (k > 3) { for (let i = 0; i < 6; i++) { const a = t * 2 + i; R(mx + Math.cos(a) * 20, my - 30 + Math.sin(a) * 10, 2, 2, '#fff4a0'); } text('Mara!', mx, my - 58, 8, '#ffe07a'); }
  lighting(g, [[rx, 120, 60], [mx, my - 20, 70, 0.9]], 0.5, '8,4,24', '180,255,200'); motes(g, t, 30, '180,255,220', 2); vignette(g, 0.5);
}, storyBeds, storyAlone, storyVoices, storyPortal, storyFinal];
function drawStory() {
  const sc = STORY[storyPage], k = storyT;
  STORY_DRAW[storyPage](k);
  if (storyPage === 4) wobble(1 + k * 0.6, t);
  // texto aparecendo letra por letra
  const full = tr(sc.text), n = Math.min(full.length, Math.floor(k * 28)), shown = full.slice(0, n);
  // escurece entre as cenas (o texto some junto)
  const fade = Math.min(1, Math.max(0, 1 - k * 2.5, (k - sc.dur + 0.4) * 2.5)); if (fade > 0) { g.save(); g.globalAlpha = fade; R(0, 0, W, H, '#05030c'); g.restore(); }
  g.save(); g.globalAlpha = 1 - fade;
  panel(10, 146, W - 20, 40, 0.82); para(shown, W / 2, 152, W - 40, 6, '#ffffff', 10);
  if (n >= full.length && Math.floor(t * 3) % 2) text('▶', W - 20, 176, 6, '#ffe07a');
  g.restore();
  text(tr('Pular') + ' ▶▶', W - 6, 4, 5, '#c8bce8', 'right');
}
function nextStory() { storyPage++; storyT = 0; if (storyPage >= STORY.length) go(storyNext); }
function updateStory(dt) {
  storyT += dt; const sc = STORY[storyPage];
  if (tapIn(W - 70, 0, 70, 16) || hits.has('back')) { go(storyNext); return; }
  if (hits.has('a') || ptr.tap) { const full = tr(sc.text); if (Math.floor(storyT * 28) < full.length) storyT = full.length / 28 + 0.01; else nextStory(); return; }
  if (storyT > sc.dur) nextStory();
}
const HOW = ['Cada visão é uma sequência de minijogos de poucos segundos.', 'Leia a ordem gigante e obedeça antes do pavio queimar.', 'Errou? Uma vela se apaga. Com 3 velas apagadas, acabou.', 'A cada 4 acertos tudo fica mais rápido. No fim vem o chefe.', 'A 1ª visão tem 7 minijogos, a 2ª tem 8, a 3ª tem 9...'];
function drawHow() {
  bgRoom('lactower'); panel(8, 8, W - 16, H - 16);
  text(tr('Como jogar'), W / 2, 14, 8, '#ffe07a');
  if (howPage === 0) {
    let y = 30; HOW.forEach((s, i) => { R(20, y + 2, 4, 4, ['#ffe07a', '#7af0ff', '#ff7a9a', '#7aff9a', '#c89aff'][i]); y = para(tr(s), 30, y, 268, 6, '#ffffff', 10, 'left') + 4; });
    for (let i = 0; i < 3; i++) candle(250 + i * 16, 156, i < 2, t, 1, 0.5);
    drawIcon('press', 60, 164, t);
  } else {
    text(tr('Os ícones dizem como jogar:'), W / 2, 28, 6, '#c8bce8');
    Object.keys(ICON_TEXT).forEach((k, i) => { const x = 58 + (i % 3) * 102, y = 54 + Math.floor(i / 3) * 44; drawIcon(k, x, y, t); para(ctrlText(k), x, y + 16, 96, 5, '#ffffff', 8); });
  }
  text((howPage + 1) + '/2  ▶', W - 18, H - 20, 5, '#c8bce8', 'right');
}
function updateHow() { if (hits.has('a') || ptr.tap) { sfx.blip(); howPage++; if (howPage > 1) go('visions'); } if (hits.has('back')) go('title'); }
function drawVisions() {
  const V = VISIONS[sel], open = V.i < save.unlocked;
  bgRoom(V.theme); g.save(); g.globalAlpha = 0.45; R(0, 0, W, H, '#0a0616'); g.restore();
  text(tr('Escolha uma visão'), W / 2, 6, 8, '#ffe07a');
  for (const d of [-1, 1]) { const j = sel + d; if (j < 0 || j >= VISIONS.length) continue; const X = VISIONS[j]; drawActor(g, X.actor, W / 2 + d * 110, 108, t + j, 2, { alpha: 0.5, filter: X.i < save.unlocked ? undefined : 'brightness(0)' }); }
  drawActor(g, V.actor, W / 2, 114, t, fitScale(V.actor, 76, 3), { filter: open ? undefined : 'brightness(0)' });
  if (sel > 0) arrowTri(20, 80, 'left', 8, '#ffe07a'); if (sel < VISIONS.length - 1) arrowTri(W - 20, 80, 'right', 8, '#ffe07a');
  panel(14, 122, W - 28, 62);
  text(`${tr('Visão')} ${V.i + 1}/${VISIONS.length} · ${open ? tr(V.name) : '???'}`, W / 2, 128, 7, open ? '#ffffff' : '#8a80a8');
  if (open) para('"' + tr(V.quote) + '"', W / 2, 142, W - 50, 5, '#c8bce8', 9);
  else text(tr('Bloqueada: vença a visão anterior'), W / 2, 144, 5, '#ff9ab0');
  text(`${V.pool} ${tr('minijogos')} + ${tr('chefe')}${save.best[V.i] ? '  ·  ' + tr('Recorde') + ' ' + save.best[V.i] : ''}`, W / 2, 162, 5, '#9a90c0');
  text(open ? '▶ ' + tr('Jogar') : '', W / 2, 172, 6, '#ffe07a');
  text('◀ ' + tr('Voltar'), 6, H - 10, 5, '#c8bce8', 'left');
}
function updateVisions() {
  if (hits.has('left') || hits.has('up')) { sel = Math.max(0, sel - 1); sfx.tick(); }
  if (hits.has('right') || hits.has('down')) { sel = Math.min(VISIONS.length - 1, sel + 1); sfx.tick(); }
  if (hits.has('back') || tapIn(0, H - 16, 70, 16)) { go('title'); return; }
  if (ptr.tap) { if (ptr.x < 70) { sel = Math.max(0, sel - 1); sfx.tick(); return; } if (ptr.x > W - 70) { sel = Math.min(VISIONS.length - 1, sel + 1); sfx.tick(); return; } }
  if (hits.has('a') || (ptr.tap && ptr.x >= 70 && ptr.x <= W - 70)) { const V = VISIONS[sel]; if (V.i < save.unlocked) { sfx.blip(); startVision(V); } else sfx.lose(); }
}
function drawSettings() {
  bgRoom('lactower'); panel(30, 20, 260, 150);
  text(tr('Configurações'), W / 2, 28, 8, '#ffe07a');
  const rows = [[tr('Música'), '◀ ' + Math.round(save.music * 100) + '% ▶'], [tr('Efeitos'), '◀ ' + Math.round(save.sfx * 100) + '% ▶'], [tr('Idioma'), '◀ ' + LANGS.find((l) => l.code === getLang()).name + ' ▶'], [tr('Voltar'), '']];
  rows.forEach(([a, b], i) => { const y = 54 + i * 26, on = i === sel; text(a, 46, y, 7, on ? '#ffe07a' : '#ffffff', 'left'); if (b) text(b, 274, y, 6, on ? '#ffe07a' : '#c8bce8', 'right'); });
}
function updateSettings() {
  const rows = 4; if (hits.has('up')) { sel = (sel + rows - 1) % rows; sfx.tick(); } if (hits.has('down')) { sel = (sel + 1) % rows; sfx.tick(); }
  let d = (hits.has('right') ? 1 : 0) - (hits.has('left') ? 1 : 0);
  if (ptr.tap) { const i = Math.floor((ptr.y - 48) / 26); if (i >= 0 && i < rows) { sel = i; d = i === 3 ? 0 : ptr.x > W / 2 ? 1 : -1; if (i === 3) { go('title'); return; } } }
  if (sel === 0 && d) { save.music = Math.max(0, Math.min(1, Math.round((save.music + d * 0.1) * 10) / 10)); setVolumes(save.music, save.sfx); commit(); sfx.tick(); }
  if (sel === 1 && d) { save.sfx = Math.max(0, Math.min(1, Math.round((save.sfx + d * 0.1) * 10) / 10)); setVolumes(save.music, save.sfx); commit(); sfx.tick(); }
  if (sel === 2 && d) { const i = LANGS.findIndex((l) => l.code === getLang()); setLang(LANGS[(i + d + LANGS.length) % LANGS.length].code); sfx.tick(); }
  if (hits.has('back') || (sel === 3 && hits.has('a'))) go('title');
}
const LEGAL = [['Termos de Uso', '/#/termos'], ['Privacidade', '/#/privacidade'], ['Compras e reembolsos', '/#/compras']];
function drawLegal() {
  bgRoom('lactower'); panel(20, 14, 280, 162);
  text(tr('Termos e privacidade'), W / 2, 22, 8, '#ffe07a');
  para(tr('O jogo guarda só o seu progresso neste aparelho. Os textos completos estão no site.'), W / 2, 40, 250, 6, '#c8bce8', 10);
  text(tr('Versão') + ' 1.0.0.0', W / 2, 164, 5, '#8a80b0');
  [...LEGAL.map(([s]) => tr(s) + ' ↗'), tr('Voltar')].forEach((s, i) => text((i === sel ? '▶ ' : '') + s, W / 2, 92 + i * 18, 7, i === sel ? '#ffe07a' : '#ffffff'));
}
function updateLegal() {
  const rows = 4; if (hits.has('up')) { sel = (sel + rows - 1) % rows; sfx.tick(); } if (hits.has('down')) { sel = (sel + 1) % rows; sfx.tick(); }
  let goSel = hits.has('a'); if (ptr.tap) { const i = Math.floor((ptr.y - 88) / 18); if (i >= 0 && i < rows) { sel = i; goSel = true; } }
  if (goSel) { if (sel < 3) window.open(SITE + LEGAL[sel][1], '_blank', 'noopener'); else go('title'); sfx.blip(); }
  if (hits.has('back')) go('title');
}
function drawEnd() {
  const won = mode === 'cleared';
  trippy(t, won ? 0.6 : 0.2, won ? 120 : 330); g.save(); g.globalAlpha = won ? 0.3 : 0.65; R(0, 0, W, H, '#0a0616'); g.restore();
  drawActor(g, won ? 'richardCalm' : 'richard', 90, 150, t, 4, { rot: won ? 0 : Math.min(1.4, P.pt * 2), filter: won ? undefined : 'grayscale(0.6)' });
  drawActor(g, P.V.actor, 236, 150, t, fitScale(P.V.actor, 76, 3), { flip: true, alpha: won ? Math.max(0.15, 1 - P.pt * 0.25) : 1 });
  for (let i = 0; i < 3; i++) candle(130 + i * 30, 160, won && i < P.lives, t, 2, won ? 0 : 0.6);
  text(tr(won ? 'VISÃO VENCIDA!' : 'A ÚLTIMA VELA APAGOU'), W / 2, 14, won ? 12 : 10, won ? '#7aff9a' : '#ff7a9a');
  text(tr('Pontos') + ': ' + P.score + '   ' + tr('Recorde') + ': ' + (save.best[P.V.i] || 0), W / 2, 34, 6, '#ffe07a');
  if (won) { panel(40, 48, 240, 36); para('"' + tr(P.V.quote) + '"', W / 2, 56, 220, 6, '#ffffff', 10); if (P.unlockedNew && P.V.i + 1 < VISIONS.length) text(tr('Nova visão liberada!'), W / 2, 90, 7, '#7af0ff'); }
  if (P.pt > 1) text(tr('Toque ou aperte A para continuar'), W / 2, H - 12, 5, '#ffffff');
}
function updateEnd(dt) { P.pt += dt; if (P.pt > 1 && (hits.has('a') || ptr.tap || hits.has('back'))) go('visions'); }

// ---------------------------------------------------------------- laço principal
function update(dt) {
  t += dt; pollPad(dt); pumpMusic(); syncControls();
  const r = cv.getBoundingClientRect(); rotateHint = r.height > r.width * 1.05;
  if (!rotateHint) {
    if (mode === 'title') updateTitle(); else if (mode === 'story') updateStory(dt); else if (mode === 'howto') updateHow();
    else if (mode === 'visions') updateVisions(); else if (mode === 'settings') updateSettings(); else if (mode === 'legal') updateLegal();
    else if (mode === 'play') updatePlay(dt); else if (mode === 'cleared' || mode === 'over') updateEnd(dt);
  }
  hits.clear(); ptr.tap = false;
}
function draw() {
  textQ.length = 0;
  g.save();
  if (mode === 'title') drawTitle(); else if (mode === 'story') drawStory(); else if (mode === 'howto') drawHow();
  else if (mode === 'visions') drawVisions(); else if (mode === 'settings') drawSettings(); else if (mode === 'legal') drawLegal();
  else if (mode === 'play') drawPlay(); else if (mode === 'cleared' || mode === 'over') drawEnd();
  else if (mode === 'boot') R(0, 0, W, H, '#05030c');
  g.restore();
  // tela: escala para caber, sempre nítida; no celular em pé, pede para girar
  const r = cv.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  if (cv.width !== Math.round(r.width * dpr) || cv.height !== Math.round(r.height * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
  c.imageSmoothingEnabled = false; c.fillStyle = '#05030c'; c.fillRect(0, 0, cv.width, cv.height);
  if (rotateHint) {
    const s = Math.floor(Math.min(cv.width / 120, cv.height / 160)) || 1; c.save(); c.translate(cv.width / 2, cv.height / 2); c.scale(s, s);
    c.rotate(Math.sin(t * 2) * 0.6 - 0.3); c.fillStyle = '#ffe07a'; c.fillRect(-14, -24, 28, 48); c.fillStyle = '#2a1e44'; c.fillRect(-11, -19, 22, 36); c.restore();
    c.font = `${Math.max(12, s * 6)}px "Press Start 2P", monospace`; c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.fillText(tr('Gire o celular'), cv.width / 2, cv.height / 2 + 40 * s);
    return;
  }
  const s = Math.min(cv.width / W, cv.height / H), dw = W * s, dh = H * s, ox = Math.floor((cv.width - dw) / 2), oy = Math.floor((cv.height - dh) / 2);
  c.drawImage(low, ox, oy, Math.floor(dw), Math.floor(dh));
  // textos nítidos por cima, na mesma posição (com a mesma escala, giro e transparência que tinham no jogo)
  const k = Math.floor(dw) / W, base = new DOMMatrix([k, 0, 0, Math.floor(dh) / H, ox, oy]);
  c.save(); c.beginPath(); c.rect(ox, oy, Math.floor(dw), Math.floor(dh)); c.clip(); c.imageSmoothingEnabled = true;
  for (const q of textQ) { c.setTransform(base.multiply(q.m)); c.globalAlpha = q.a; putText(c, q); }
  c.restore();
}
let last = performance.now();
function frame(now) { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); draw(); requestAnimationFrame(frame); }
document.fonts?.load(font(8)).finally(() => { requestAnimationFrame(frame); Promise.resolve(brandIntro()).catch(() => {}).then(() => { go('story', 'title'); }); });
// ganchos para testes automáticos
window.__re = { get mode() { return mode; }, get P() { return P; }, VISIONS, makePool, go, startVision: (i) => startVision(VISIONS[i]),
  test(kind, i = 0) { startVision(VISIONS[i]); if (kind === 'boss') { P.boss = true; } else P.pool = [{ kind, lvl: 1 }]; prepareMicro(); setPhase('micro'); },
  phase(ph) { P.phase = ph; P.pt = 0; }, setDevice(d) { device = d; ctlShown = null; }, story(i, k) { mode = 'story'; storyPage = i; storyT = k; storyNext = 'title'; } };
