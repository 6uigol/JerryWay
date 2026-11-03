// Jerry Way: laço principal, controles (toque/arrasto e teclado), tela e placar.
import { Game, label } from './game.js';
import { TILE } from './world.js';
import { save, commit, initCloud, currentAccount, submitScore, top10, friendly, onChange } from './store.js';
import { initUI, show, hide, showing } from './ui.js';
import { initAudio, startMusic, sfx } from './audio.js';

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const lc = document.createElement('canvas'), lctx = lc.getContext('2d');   // tela lógica em pixel art, ampliada para a tela real
let LW = 176, LH = 300, dpr = 1;
const game = new Game();
window.__jw = game;
game.skinId = save.skin;
onChange(() => { game.skinId = save.skin; });
let topList = [];

function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  const W = window.innerWidth, H = window.innerHeight;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  // cabem pelo menos 11 colunas na largura e 14 fileiras na altura
  let s = Math.min(W / (11 * TILE), H / (14 * TILE)) * dpr;
  if (s >= 3) s = Math.floor(s);
  LW = Math.ceil(cv.width / s); LH = Math.ceil(cv.height / s);
  lc.width = LW; lc.height = LH;
}
window.addEventListener('resize', resize); resize();

// ---------------------------------------------------------------- partida
function ghostsFor() {
  const list = [];
  if (save.best > 2) list.push({ key: 'best', kind: 'best', row: save.best, name: 'Recorde', skin: save.skin });
  if (save.last > 2 && save.last !== save.best) list.push({ key: 'last', kind: 'last', row: save.last, name: 'Última', skin: save.skin });
  const me = currentAccount();
  for (const r of topList) if (!me || r.uid !== me.uid) list.push({ key: 'top:' + r.uid, kind: 'top', row: r.best, name: r.name, skin: r.skin });
  return list;
}
function play() {
  initAudio(); startMusic(); hide();
  game.reset((Date.now() ^ (Math.random() * 1e9)) & 0x7fffffff);
  game.skinId = save.skin;
  game.setGhosts(ghostsFor());
  game.start();
}
function finish() {
  const g = game, record = g.score > save.best;
  save.coins += g.coins; save.runs++; save.last = g.score;
  if (record) save.best = g.score;
  commit();
  const r = { kind: g.end.kind, score: g.score, coins: g.coins, record, rankMsg: '' };
  g.state = 'over';
  show('result', r);
  const me = currentAccount();
  if (record && me && me.verified) submitScore().then(() => { const el = document.getElementById('rk-msg'); if (el) el.textContent = 'Recorde enviado para o ranking!'; refreshTop(); }).catch((e) => { const el = document.getElementById('rk-msg'); if (el) el.textContent = friendly(e); });
  else if (record && !me) { const el = document.getElementById('rk-msg'); if (el) el.textContent = 'Entre com sua conta (Conta) para aparecer no ranking.'; }
}
async function refreshTop() { try { topList = (await top10()) || []; } catch (_) { /* sem ranking agora */ } }

initUI({
  play,
  resume: () => { hide(); game.state = 'play'; last = performance.now(); },
  quit: () => { game.state = 'play'; game.die('portal'); hide(); },
});
show('title');
initCloud().then(refreshTop);

// ---------------------------------------------------------------- controles
const keys = { ArrowUp: [0, 1], KeyW: [0, 1], Space: [0, 1], ArrowDown: [0, -1], KeyS: [0, -1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] };
window.addEventListener('keydown', (e) => {
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  if (e.code === 'Escape' || e.code === 'KeyP') { if (game.state === 'play') { game.state = 'pause'; show('pause'); } else if (game.state === 'pause') { hide(); game.state = 'play'; } return; }
  if ((e.code === 'Enter' || e.code === 'Space') && (showing() === 'title' || showing() === 'result')) { e.preventDefault(); play(); return; }
  const k = keys[e.code];
  if (k && game.state === 'play') { e.preventDefault(); if (!e.repeat) game.move(k[0], k[1]); }
});
let touch = null;
cv.addEventListener('pointerdown', (e) => { initAudio(); touch = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
cv.addEventListener('pointerup', (e) => {
  if (!touch || touch.id !== e.pointerId) return;
  const dx = e.clientX - touch.x, dy = e.clientY - touch.y; touch = null;
  if (game.state !== 'play') return;
  if (Math.hypot(dx, dy) < 22) return game.move(0, 1);   // toque: pra frente
  if (Math.abs(dx) > Math.abs(dy)) game.move(dx > 0 ? 1 : -1, 0); else game.move(0, dy < 0 ? 1 : -1);
});
cv.addEventListener('pointercancel', () => { touch = null; });
document.addEventListener('visibilitychange', () => { if (document.hidden && game.state === 'play') { game.state = 'pause'; show('pause'); } });

// ---------------------------------------------------------------- laço
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const visRows = LH / TILE;
  if (game.state !== 'pause') game.update(dt, visRows);
  if (game.over) finish();
  lctx.imageSmoothingEnabled = false;
  game.draw(lctx, LW, LH);
  if (game.state === 'play' || game.state === 'dying') hud();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(lc, 0, 0, LW, LH, 0, 0, LW * (cv.width / LW), LH * (cv.height / LH));
  requestAnimationFrame(frame);
}
function hud() {
  const c = lctx;
  label(c, String(game.score), LW / 2, 22, '#ffffff', 16);
  c.textAlign = 'right';
  coin(c, LW - 8 - String(save.coins + game.coins).length * 8 - 10, 7);
  label(c, String(save.coins + game.coins), LW - 8 - String(save.coins + game.coins).length * 4, 15, '#ffe070');
  if (save.best) label(c, 'REC ' + save.best, 8 + ('REC ' + save.best).length * 4, 15, '#c8b8ff');
  const b = game.zoneBanner;
  if (b && game.state === 'play') { const a = b.t < 0.3 ? b.t / 0.3 : b.t > 2.2 ? (2.6 - b.t) / 0.4 : 1; c.globalAlpha = Math.max(0, a); label(c, b.name, LW / 2, 44, '#ffe9a8'); c.globalAlpha = 1; }
  game.toasts.forEach((s, i) => { c.globalAlpha = Math.min(1, (2.2 - s.t) * 2); label(c, s.text, LW / 2, 60 + i * 12 - s.t * 6, s.color); c.globalAlpha = 1; });
  if (!game.started && game.state === 'play') { c.globalAlpha = 0.6 + Math.sin(game.t * 4) * 0.3; label(c, 'TOQUE PARA PULAR', LW / 2, LH - 30, '#ffffff'); c.globalAlpha = 1; }
}
function coin(c, x, y) { c.fillStyle = '#c8901a'; c.fillRect(x, y + 1, 8, 7); c.fillStyle = '#ffcc3a'; c.fillRect(x, y, 8, 7); c.fillStyle = '#fff2a0'; c.fillRect(x + 1, y + 1, 3, 2); }
requestAnimationFrame(frame);
