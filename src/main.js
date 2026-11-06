// Jerry's Way: laço principal, controles (toque/arrasto e teclado), tela e placar.
import { Game, label } from './game.js';
import { TILE, MYTH_RUN_CHANCE, MYTH_ROW, MYTH_SPREAD } from './world.js';
import { SKIN_BY_ID, missingMythics, ABILITIES } from './skins.js';
import { BONUS } from './world.js';
import { pollPad } from './gamepad.js';
import { save, commit, initCloud, currentAccount, submitScore, top10, friendly, onChange, noAds, refreshEnt } from './store.js';
import { initAds, showRewarded, maybeInterstitial, countDeath } from './ads.js';
import { REVIVE_COST } from './ui.js';
import { initUI, show, hide, showing } from './ui.js';
import { brandIntro } from './brand.js';
import { initAudio, setBackground, onResume } from './audio.js';
import { startMusic, resyncMusic } from './music.js';

const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const lc = document.createElement('canvas'), lctx = lc.getContext('2d');   // tela lógica em pixel art, ampliada para a tela real
let LW = 176, LH = 300, dpr = 1;
const game = new Game();
window.__jw = game; window.__jwlc = lc; window.__jwcv = cv;
game.skinId = save.skin;
onChange(() => { game.skinId = save.skin; });
let topList = [];

// No computador (tela larga) o jogo fica numa janela em pé no meio, com a moldura azul do Song of Moonlight em volta e as
// informações da partida nas laterais. No celular só uma borda azul fina, sem informação (o placar fica dentro do jogo).
let VP = { x: 0, y: 0, w: 1, h: 1 }, desktop = false, frameCv = null, panels = null;
// botão de pausa no canto superior esquerdo (aparece só durante a partida)
const pauseBtn = document.createElement('button');
pauseBtn.id = 'pausebtn'; pauseBtn.type = 'button'; pauseBtn.setAttribute('aria-label', 'Pausar'); pauseBtn.innerHTML = '<i></i><i></i>'; pauseBtn.hidden = true;
document.body.appendChild(pauseBtn);
pauseBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
pauseBtn.addEventListener('click', () => { if (game.state === 'play') { game.state = 'pause'; show('pause'); } });
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 3);
  const W = window.innerWidth, H = window.innerHeight;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const CW = cv.width, CH = cv.height;
  const full = /[?&]full\b/.test(location.search);   // ?full: só o jogo, sem moldura (usado para gravar o gameplay do site)
  desktop = !full && W >= 760 && W / H > 1.15;
  if (desktop) {
    const pad = Math.round(18 * dpr), vh = CH - pad * 2, vw = Math.round(Math.min(vh * 0.78, CW - 2 * Math.round(250 * dpr) - pad * 4));
    VP = { x: Math.round((CW - vw) / 2), y: pad, w: vw, h: vh };
    const side = VP.x - pad * 2;
    panels = { l: { x: pad, y: pad, w: side, h: vh }, r: { x: VP.x + vw + pad, y: pad, w: side, h: vh }, u: dpr * Math.max(1, Math.min(1.9, H / 720, side / dpr / 300)) };
  } else {
    const b = full ? 0 : Math.round(5 * dpr);
    VP = { x: b, y: b, w: CW - 2 * b, h: CH - 2 * b }; panels = null;
  }
  // um pequeno zoom: cabem umas 9,8 colunas na largura (a área jogável quase inteira) e 12,6 fileiras na altura
  let sc = Math.min(VP.w / (8.8 * TILE), VP.h / (11.2 * TILE));
  if (sc >= 3) sc = Math.floor(sc);
  LW = Math.ceil(VP.w / sc); LH = Math.ceil(VP.h / sc);
  lc.width = LW; lc.height = LH;
  pauseBtn.style.left = Math.round(VP.x / dpr + 8) + 'px'; pauseBtn.style.top = `max(${Math.round(VP.y / dpr + 8)}px, calc(env(safe-area-inset-top) + 4px))`;
  frameCv = buildFrame(CW, CH);
}
// moldura desenhada uma vez por tamanho de tela: céu noturno azul com estrelas, borda em camadas azuis com cantos dourados
function buildFrame(CW, CH) {
  const f = document.createElement('canvas'); f.width = CW; f.height = CH;
  const c = f.getContext('2d'), u = dpr;
  const g = c.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, '#0b1240'); g.addColorStop(0.55, '#121a5a'); g.addColorStop(1, '#0a0e30');
  c.fillStyle = g; c.fillRect(0, 0, CW, CH);
  for (let i = 0; i < (desktop ? 220 : 60); i++) {   // estrelinhas
    const x = (Math.sin(i * 12.9898) * 43758.5453 % 1 + 1) % 1 * CW, y = (Math.sin(i * 78.233) * 12543.123 % 1 + 1) % 1 * CH, sz = i % 9 === 0 ? 2 : 1;
    c.fillStyle = i % 7 === 0 ? '#ffe9a8' : i % 3 ? '#8aa8ff' : '#ffffff'; c.globalAlpha = 0.4 + (i % 5) * 0.12; c.fillRect(Math.round(x), Math.round(y), sz * u, sz * u);
  }
  c.globalAlpha = 1;
  if (desktop) {   // lua no canto de cima
    const mx = CW - 70 * u, my = 64 * u;
    c.fillStyle = 'rgba(160,190,255,0.12)'; c.beginPath(); c.arc(mx, my, 44 * u, 0, 7); c.fill();
    c.fillStyle = '#f4ecc8'; c.beginPath(); c.arc(mx, my, 26 * u, 0, 7); c.fill();
    c.fillStyle = '#d8cfa8'; for (const [dx, dy, r] of [[-8, -6, 5], [7, 6, 6], [6, -10, 3]]) { c.beginPath(); c.arc(mx + dx * u, my + dy * u, r * u, 0, 7); c.fill(); }
  }
  frameBox(c, VP.x, VP.y, VP.w, VP.h, u, desktop ? 6 : 3);
  if (panels) for (const p of [panels.l, panels.r]) { frameBox(c, p.x, p.y, p.w, p.h, u, 4); c.fillStyle = 'rgba(8,10,40,0.82)'; c.fillRect(p.x, p.y, p.w, p.h); }
  return f;
}
// borda em camadas: azul escuro, azul Moonlight, brilho e cantinhos dourados
function frameBox(c, x, y, w, h, u, k) {
  const layers = [['#05081e', k + 3], ['#2a3aa8', k + 1.5], ['#7a9aff', 1], ['#1a2470', 0]];
  for (const [col, d] of layers) { c.fillStyle = col; c.fillRect(x - d * u, y - d * u, w + 2 * d * u, h + 2 * d * u); }
  for (const [cx, cy] of [[x, y], [x + w, y], [x, y + h], [x + w, y + h]]) {
    const s = (k + 4) * u; c.fillStyle = '#e0c060'; c.fillRect(cx - s / 2, cy - s / 2, s, s); c.fillStyle = '#fff2a0'; c.fillRect(cx - s / 2, cy - s / 2, s / 2, s / 2); c.fillStyle = '#8a6a1c'; c.fillRect(cx, cy, s / 2, s / 2);
  }
}
window.addEventListener('resize', resize); resize();

// ---------------------------------------------------------------- partida
// marcas no chão: recorde pessoal, recorde mundial (o 1º do ranking), a última partida e os outros do ranking
function ghostsFor() {
  const list = [], me = currentAccount(), w = topList[0];
  const worldIsMine = w && me && w.uid === me.uid;
  if (save.best > 2) list.push({ key: 'best', kind: 'best', row: save.best, name: worldIsMine && w.best <= save.best ? 'Recorde pessoal e mundial' : 'Recorde pessoal', skin: save.skin });
  if (w && w.best > 2 && !(worldIsMine && w.best <= save.best)) list.push({ key: 'world', kind: 'world', row: w.best, name: 'Recorde mundial', who: w.name, skin: w.skin });
  if (save.last > 2 && save.last !== save.best) list.push({ key: 'last', kind: 'last', row: save.last, name: 'Última partida', skin: save.skin });
  for (const r of topList.slice(1)) if (!me || r.uid !== me.uid) list.push({ key: 'top:' + r.uid, kind: 'top', row: r.best, name: r.name, skin: r.skin });
  return list;
}
function play() {
  initAudio(); startMusic(); hide();
  game.reset((Date.now() ^ (Math.random() * 1e9)) & 0x7fffffff);
  game.skinId = save.skin;
  game.setAbility((SKIN_BY_ID[save.skin] || {}).ability || null);   // habilidade passiva da skin escolhida
  // esquilo mítico da partida: uma das míticas que ainda faltam (se não faltar nenhuma, ele não aparece)
  const left = missingMythics(save.owned), myth = left.length ? left[Math.floor(Math.random() * left.length)] : null;
  // um sorteio só, no começo da partida: 0,00014% de chance de o esquilo mítico aparecer nela
  game.world.mythOn = !!myth && Math.random() < MYTH_RUN_CHANCE;
  game.world.mythAt = MYTH_ROW + Math.floor(Math.random() * MYTH_SPREAD);
  game.mythSkin = myth ? myth.id : null; game.mythFound = null;
  game.onMyth = () => {   // pegou: a skin é dele e já salva (vale mesmo se perder a partida depois)
    if (!myth || save.owned.includes(myth.id)) return null;
    save.owned.push(myth.id); commit(); return myth;
  };
  game.setGhosts(ghostsFor());
  game.worldBest = topList[0] ? topList[0].best : 0; game.worldName = topList[0] ? topList[0].name : '';
  game.start();
}
const reviveCost = () => (game.ability === 'pechincha' ? 40 : REVIVE_COST);   // Pechincheiro: reviver mais barato
// morreu: antes do fim, oferece reviver (1 vez por partida) vendo um vídeo ou por 70 moedas
function died() {
  const g = game;
  if (g.revived) return finish();
  g.state = 'ask';   // a partida fica parada (sem contar como fim) enquanto o jogador escolhe
  const back = () => { hide(); g.revive(); last = performance.now(); };
  show('revive', {
    score: g.score, coins: save.coins + g.coins, cost: reviveCost(),
    video: async () => {
      hide(); setBackground(true);   // o som do jogo para durante o vídeo
      let ok = false; try { ok = await showRewarded(); } catch (_) { ok = false; }
      setBackground(document.hidden);
      if (ok) back(); else finish();
    },
    pay: () => {
      // paga primeiro com as moedas guardadas; o que faltar sai das moedas desta partida
      const cost = reviveCost(), fromSave = Math.min(save.coins, cost); save.coins -= fromSave; g.coins -= cost - fromSave; commit();
      back();
    },
    skip: finish,
  });
}
// jogar de novo: a cada 3 mortes (e no máximo 1 a cada 2 minutos) aparece um anúncio antes, para quem não tirou os anúncios
let adBusy = false;
async function playAgain() {
  if (adBusy) return;
  adBusy = true; hide();
  let r = null;
  try { setBackground(true); r = await maybeInterstitial(noAds); } catch (_) { /* sem anúncio: segue */ } finally { setBackground(document.hidden); adBusy = false; }
  if (r === 'buy') return show('noads');
  play();
}
function finish() {
  const g = game, record = g.score > save.best;
  countDeath();
  save.coins += g.coins; save.runs++; save.last = g.score;
  if (record) save.best = g.score;
  commit();
  const r = { myth: g.mythFound ? SKIN_BY_ID[g.mythFound] : null, kind: g.end.kind, score: g.score, coins: g.coins, record, world: g.beatWorld, worldBest: g.worldBest, worldName: g.worldName, top: topList.slice(0, 5), rankMsg: '' };
  g.state = 'over';
  show('result', r);
  const me = currentAccount();
  if (record && me && me.verified) submitScore().then(() => { const el = document.getElementById('rk-msg'); if (el) el.textContent = 'Recorde enviado para o ranking!'; refreshTop(); }).catch((e) => { const el = document.getElementById('rk-msg'); if (el) el.textContent = friendly(e); });
  else if (record && !me) { const el = document.getElementById('rk-msg'); if (el) el.textContent = 'Entre com sua conta (Conta) para aparecer no ranking.'; }
}
async function refreshTop() { try { topList = (await top10()) || []; } catch (_) { /* sem ranking agora */ } }

initUI({
  play: () => (game.state === 'over' ? playAgain() : play()),
  resume: () => { hide(); game.state = 'play'; last = performance.now(); },
  quit: () => { game.state = 'play'; game.die('portal'); hide(); },
});
show('title');
brandIntro();   // abertura da marca Song of Moonlight por cima da tela inicial
initCloud().then(refreshTop);
initAds(noAds);
setInterval(refreshTop, 60000);   // ranking das laterais sempre atualizado

// ---------------------------------------------------------------- controles
const keys = { ArrowUp: [0, 1], KeyW: [0, 1], Space: [0, 1], ArrowDown: [0, -1], KeyS: [0, -1], ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0] };
window.addEventListener('keydown', (e) => {
  if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
  const ad = document.querySelector('.housead');   // anúncio na tela: Enter/Espaço fecham quando a contagem acaba
  if (ad) { if (e.code === 'Enter' || e.code === 'Space') { e.preventDefault(); const c = ad.querySelector('.ha-close'); if (c && !c.disabled) c.click(); } return; }
  if (e.code === 'Escape' || e.code === 'KeyP') { if (game.state === 'play') { game.state = 'pause'; show('pause'); } else if (game.state === 'pause') { hide(); game.state = 'play'; } return; }
  if ((e.code === 'Enter' || e.code === 'Space') && (showing() === 'title' || showing() === 'result')) { e.preventDefault(); if (showing() === 'result') playAgain(); else play(); return; }
  const k = keys[e.code];
  if (k && game.state === 'play') { e.preventDefault(); if (!e.repeat) game.move(k[0], k[1]); }
});
let touch = null;
cv.addEventListener('pointerdown', (e) => { initAudio(); startMusic(); touch = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
cv.addEventListener('pointerup', (e) => {
  if (!touch || touch.id !== e.pointerId) return;
  const dx = e.clientX - touch.x, dy = e.clientY - touch.y; touch = null;
  if (game.state !== 'play') return;
  if (Math.hypot(dx, dy) < 22) return game.move(0, 1);   // toque: pra frente
  if (Math.abs(dx) > Math.abs(dy)) game.move(dx > 0 ? 1 : -1, 0); else game.move(0, dy < 0 ? 1 : -1);
});
cv.addEventListener('pointercancel', () => { touch = null; });
// segundo plano: pausa a partida e silencia tudo (música e efeitos); ao voltar, a música continua de onde parou
function background(hidden) {
  setBackground(hidden);
  if (hidden && game.state === 'play') { game.state = 'pause'; show('pause'); }
}
document.addEventListener('visibilitychange', () => { background(document.hidden); if (!document.hidden) refreshEnt(); });   // voltou do site (comprou "Sem anúncios"): confere na hora
window.addEventListener('pagehide', () => background(true));
window.addEventListener('jerry-app-background', () => background(true));   // Android (MainActivity)
window.addEventListener('jerry-app-foreground', () => { if (!document.hidden) background(false); });
onResume(resyncMusic);

// ---------------------------------------------------------------- laço
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  const visRows = LH / TILE;
  pollPad({ game, showing, onPause: () => { game.state = 'pause'; show('pause'); } });   // controle: setinhas, joystick esquerdo, A, B e Start
  if (game.state !== 'pause') game.update(dt, visRows);
  if (game.over) died();
  lctx.imageSmoothingEnabled = false;
  game.draw(lctx, LW, LH);
  if (game.state === 'play' || game.state === 'dying') hud();
  const showPause = game.state === 'play' && !showing(); if (pauseBtn.hidden === showPause) pauseBtn.hidden = !showPause;
  ctx.imageSmoothingEnabled = false;
  if (frameCv) ctx.drawImage(frameCv, 0, 0);
  ctx.drawImage(lc, 0, 0, LW, LH, VP.x, VP.y, VP.w, VP.h);
  if (panels) drawPanels();
requestAnimationFrame(frame);
}
function hud() {
  const c = lctx;
  if (!desktop) {
  label(c, String(game.score), LW / 2, 22, '#ffffff', 16);
  c.textAlign = 'right';
  coin(c, LW - 8 - String(save.coins + game.coins).length * 8 - 10, 7);
  label(c, String(save.coins + game.coins), LW - 8 - String(save.coins + game.coins).length * 4, 15, '#ffe070');

  }
  if (game.bonus && game.state === 'play') label(c, `Bônus ${Math.max(0, Math.ceil(game.bonus.t))}s${game.bonus.kind === 'caca' ? ` · ${game.bonus.caught} esquilo${game.bonus.caught === 1 ? '' : 's'}` : ''}`, LW / 2, LH - 14, '#ffe070');
  const b = game.zoneBanner;
  if (b && game.state === 'play') { const a = b.t < 0.3 ? b.t / 0.3 : b.t > 2.2 ? (2.6 - b.t) / 0.4 : 1; c.globalAlpha = Math.max(0, a); label(c, b.name, LW / 2, 44, '#ffe9a8'); c.globalAlpha = 1; }
  game.toasts.forEach((s, i) => { c.globalAlpha = Math.min(1, (2.2 - s.t) * 2); label(c, s.text, LW / 2, 60 + i * 12 - s.t * 6, s.color); c.globalAlpha = 1; });
  if (!game.started && !game.bonus && game.state === 'play') { c.globalAlpha = 0.6 + Math.sin(game.t * 4) * 0.3; label(c, desktop ? 'Espaço ou setas para pular' : 'Toque para pular', LW / 2, LH - 30, '#ffffff'); c.globalAlpha = 1; }
}
function coin(c, x, y) { c.fillStyle = '#c8901a'; c.fillRect(x, y + 1, 8, 7); c.fillStyle = '#ffcc3a'; c.fillRect(x, y, 8, 7); c.fillStyle = '#fff2a0'; c.fillRect(x + 1, y + 1, 3, 2); }
// ---------------------------------------------------------------- painéis do computador (informações da partida)
const ZONE_NAMES = { campo: 'Campo de Brumavale', floresta: 'Floresta Sombria', deserto: 'Dunas', neve: 'Picos Gelados', lacrimora: 'Lacrímora', lua: 'A Lua' };
function ptext(text, x, y, size, col, align = 'left') {
  const u = panels.u; ctx.font = `${Math.round(size * u)}px "Press Start 2P", monospace`; ctx.textAlign = align; ctx.textBaseline = 'top';
  ctx.fillStyle = '#05081e'; ctx.fillText(text, x + u * 2, y + u * 2); ctx.fillStyle = col; ctx.fillText(text, x, y);
}
function fit(text, max) { return text.length > max ? text.slice(0, max - 1) + '…' : text; }
function drawPanels() {
  const u = panels.u, L = panels.l, Rp = panels.r, playing = game.state === 'play' || game.state === 'dying' || game.state === 'pause';
  const cols = Math.max(8, Math.floor(L.w / (11 * u)));
  let x = L.x + 18 * u, y = L.y + 22 * u;
  ptext('JERRY\'S', L.x + L.w / 2, y, 22, '#ffcc3a', 'center'); ptext('WAY', L.x + L.w / 2, y + 28 * u, 22, '#ffcc3a', 'center'); y += 78 * u;
  const row = (k, v, col = '#ffffff') => { ptext(k, x, y, 8, '#8aa8ff'); ptext(String(v), x, y + 14 * u, 16, col); y += 46 * u; };
  row('Distância', playing ? game.score : save.last || 0);
  row('Recorde pessoal', Math.max(save.best, playing ? game.score : 0), playing && game.score > save.best && save.best ? '#7aff9a' : '#ffe070');
  const wb = topList[0] ? topList[0].best : 0, beat = playing && game.beatWorld;
  ptext('Recorde mundial', x, y, 8, '#8aa8ff'); ptext(String(beat ? game.score : wb || '-'), x, y + 14 * u, 16, beat ? '#ffcc3a' : '#9ad0ff');
  ptext(fit(beat ? 'é seu agora!' : topList[0] ? 'de ' + topList[0].name : 'ninguém ainda', cols), x, y + 36 * u, 8, beat ? '#ffcc3a' : '#c8d0ff'); y += 60 * u;
  row('Moedas', save.coins + (playing ? game.coins : 0), '#ffcc3a');
  ptext('Lugar', x, y, 8, '#8aa8ff'); ptext(fit(game.bonus ? BONUS[game.bonus.kind].name : ZONE_NAMES[game.zone] || '', cols), x, y + 14 * u, 9, '#c8b8ff'); y += 40 * u;
  ptext('Skin', x, y, 8, '#8aa8ff'); ptext(fit(skinName(), cols), x, y + 14 * u, 9, '#ffffff');
  const ab = ABILITIES[(SKIN_BY_ID[save.skin] || {}).ability]; y += 40 * u;
  if (ab) { ptext('Habilidade', x, y, 8, '#8aa8ff'); ptext(fit(ab.name, cols), x, y + 14 * u, 9, '#7aff9a'); }
  // direita: ranking e controles
  x = Rp.x + 18 * u; y = Rp.y + 22 * u;
  ptext('Ranking', Rp.x + Rp.w / 2, y, 12, '#ffcc3a', 'center'); y += 30 * u;
  const me = currentAccount(), rcols = Math.max(6, Math.floor((Rp.w - 90 * u) / (9 * u)));
  if (!topList.length) { ptext('Ninguém ainda.', x, y, 8, '#8aa8ff'); y += 20 * u; }
  topList.slice(0, 10).forEach((r, i) => {
    const mine = me && r.uid === me.uid;
    ptext(String(i + 1).padStart(2, ' ') + '.', x, y, 8, i < 3 ? '#ffcc3a' : '#8aa8ff');
    ptext(fit(r.name, rcols), x + 34 * u, y, 8, mine ? '#7aff9a' : '#ffffff');
    ptext(String(r.best), Rp.x + Rp.w - 18 * u, y, 8, '#ffe070', 'right'); y += 18 * u;
  });
  y = Math.max(y + 16 * u, Rp.y + Rp.h - 150 * u);
  ptext('Controles', x, y, 8, '#8aa8ff'); y += 18 * u;
  for (const line of ['Setas ou WASD: pular', 'Espaço: pra frente', 'Esc: pausa', 'Controle: direcional', 'ou analógico, A, Start']) { ptext(line, x, y, 8, '#c8d0ff'); y += 16 * u; }
}
function skinName() { const s = SKIN_BY_ID[save.skin]; return s ? s.name : ''; }
requestAnimationFrame(frame);
