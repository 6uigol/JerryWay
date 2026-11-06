// Controle (gamepad), igual ao Song of Moonlight: setinhas (direcional) e joystick esquerdo andam,
// A pula para a frente / confirma, B volta, Start pausa. Nos menus o direcional anda entre os botões.
// Mapeamento "standard" do navegador: 0 A, 1 B, 4 LB, 5 RB, 8 Select, 9 Start, 12-15 cima/baixo/esquerda/direita.
const DEAD = 0.5, REARM = 0.3;
let prev = {}, stickDir = null, active = false, repeatAt = 0;

function readPad() {
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  return pads ? [...pads].find((g) => g && g.connected) : null;
}
// direção do joystick esquerdo com "trava": só vale de novo depois de voltar perto do centro
function stick(p) {
  const x = p.axes[0] || 0, y = p.axes[1] || 0, m = Math.max(Math.abs(x), Math.abs(y));
  if (m < REARM) { stickDir = null; return null; }
  if (m < DEAD) return null;
  const d = Math.abs(x) > Math.abs(y) ? (x > 0 ? 'right' : 'left') : (y > 0 ? 'down' : 'up');
  if (d === stickDir) return null;
  stickDir = d; return d;
}
// menus: anda para o botão mais perto na direção pedida
function focusables() {
  const ui = document.getElementById('ui');
  if (!ui || ui.hidden) return [];
  return [...ui.querySelectorAll('button:not([disabled]), input, a[href]')].filter((e) => e.offsetParent !== null);
}
function moveFocus(dir) {
  const list = focusables(); if (!list.length) return;
  const cur = list.includes(document.activeElement) ? document.activeElement : null;
  if (!cur) { (list.find((e) => e.classList.contains('big')) || list[0]).focus(); return; }
  const r = cur.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  let best = null, bestD = Infinity;
  for (const e of list) {
    if (e === cur) continue;
    const q = e.getBoundingClientRect(), x = q.left + q.width / 2, y = q.top + q.height / 2, dx = x - cx, dy = y - cy;
    const ok = dir === 'up' ? dy < -4 : dir === 'down' ? dy > 4 : dir === 'left' ? dx < -4 : dx > 4;
    if (!ok) continue;
    const along = dir === 'up' || dir === 'down' ? Math.abs(dy) : Math.abs(dx), across = dir === 'up' || dir === 'down' ? Math.abs(dx) : Math.abs(dy);
    const d = along + across * 2;
    if (d < bestD) { bestD = d; best = e; }
  }
  if (best) { best.focus(); best.scrollIntoView({ block: 'nearest' }); }
}
const key = (code) => window.dispatchEvent(new KeyboardEvent('keydown', { code, key: code === 'Escape' ? 'Escape' : code, bubbles: true, cancelable: true }));

// chamado a cada quadro pelo laço do jogo
export function pollPad({ game, showing, onPause }) {
  const p = readPad();
  if (!p) { prev = {}; return; }
  const b = (i) => !!(p.buttons[i] && (p.buttons[i].pressed || p.buttons[i].value > 0.5));
  const now = { x: b(2) || b(3), a: b(0), b: b(1), lb: b(4), rb: b(5), start: b(9) || b(8), up: b(12), down: b(13), left: b(14), right: b(15) };
  const was = prev, hit = (k) => now[k] && !was[k];
  let dir = ['up', 'down', 'left', 'right'].find(hit) || stick(p);
  // segurar o direcional nos menus repete devagar
  const held = ['up', 'down', 'left', 'right'].find((k) => now[k]);
  const t = performance.now();
  if (!dir && held && showing() && t > repeatAt) dir = held;
  if (dir || held) { if (dir) repeatAt = t + (was[dir] ? 160 : 380); }
  const any = Object.keys(now).some(hit) || !!dir;
  if (any && !active) { active = true; document.body.classList.add('pad'); }
  prev = now;
  if (!any) return;

  // abertura da marca: qualquer botão pula (corta o som junto)
  if (document.getElementById('brand-intro')) { key('Escape'); return; }

  const menu = showing();
  if (menu) {
    if (dir) moveFocus(dir);
    if (hit('a')) { const f = document.activeElement; if (f && focusables().includes(f)) f.click(); else moveFocus('down'); }
    if (hit('b')) { const back = document.querySelector('#ui [data-go="resume"], #ui [data-go="title"]'); if (back) back.click(); }
    if (hit('start') && menu === 'pause') { const r = document.querySelector('#ui [data-go="resume"]'); if (r) r.click(); }
    if (menu === 'colecao') { if (hit('lb')) key('ArrowLeft'); if (hit('rb')) key('ArrowRight'); }
    return;
  }
  if (game.state !== 'play') return;
  if (hit('start')) { onPause(); return; }
  if (hit('x')) { game.usePower(); return; }   // X ou Y: poder
  if (dir) game.move(dir === 'left' ? -1 : dir === 'right' ? 1 : 0, dir === 'up' ? 1 : dir === 'down' ? -1 : 0);
  else if (hit('a')) game.move(0, 1);
}
