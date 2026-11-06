// Telas por cima do jogo (HTML): início, resultado, Sortear skin, Coleção, Ranking, Conta e pausa.
import { onChange, save, commit, setName, cloudReady, currentAccount, signIn, signUp, signInGoogle, checkOnline, resetPass, sendVerify, refreshVerified, logout, friendly, top10, submitScore, coinMult, refreshEnt } from './store.js';
import { SKINS, SKIN_BY_ID, RARITIES, PULL_COST, rollSkin } from './skins.js';
import { jerryFrame } from './jerry.js';
import { makeAcorn } from './acorn.js';
import { sfx, isMuted, setMuted, initAudio } from './audio.js';
import { musicEnabled, setMusic, startMusic } from './music.js';
import { SITE_URL } from './config.js';

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
let root, hooks = {}, current = null;
// "Conectando..." com os segundos contando (até 20 s); devolve uma função que para o contador
function connecting(el) {
  const t0 = Date.now(), tick = () => { if (el) el.innerHTML = `<span class="spin"></span> Conectando... ${Math.min(20, Math.floor((Date.now() - t0) / 1000))}s`; };
  tick(); const id = setInterval(tick, 500);
  return () => clearInterval(id);
}

export function initUI(h) {
  hooks = h; root = $('#ui');
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-go]'); if (!b) return;
    initAudio(); startMusic(); sfx.click();
    const go = b.dataset.go;
    if (go === 'play') hooks.play();
    else if (go === 'resume') hooks.resume();
    else if (go === 'quit') hooks.quit();
    else if (go === 'quitapp') quitApp();
    else if (go === 'sound') { setMuted(!isMuted()); show(current); }
    else if (go === 'music') { setMusic(!musicEnabled()); show(current); }
    else show(go);
  });
}
// o nome (e o resto do progresso) chega da nuvem depois de entrar: a tela Conta se atualiza sozinha
let lastName = null;
onChange(() => { if (current === 'conta' && save.name !== lastName && document.activeElement?.id !== 'nm') { lastName = save.name; show('conta'); } });
export const hide = () => { current = null; root.innerHTML = ''; root.hidden = true; };
export const showing = () => current;

// prévia do Jerry com a skin (desenho grande, sem reduzir)
function preview(skin, view = 'front', scale = 4) {
  const cv = document.createElement('canvas'), fr = jerryFrame(view, 'idle', 0, skin, false);
  cv.width = fr.width * scale; cv.height = fr.height * scale;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(fr, 0, 0, cv.width, cv.height);
  cv.className = 'pix'; return cv;
}
function thumb(skin, owned) {
  const cv = document.createElement('canvas'), fr = jerryFrame('front', 'idle', 0, skin);
  cv.width = fr.width * 2; cv.height = fr.height * 2;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false; c.drawImage(fr, 0, 0, cv.width, cv.height);
  if (!owned) { c.globalCompositeOperation = 'source-in'; c.fillStyle = '#5a4a8a'; c.fillRect(0, 0, cv.width, cv.height); }
  cv.className = 'pix'; return cv;
}
// sair do jogo: no PC fecha o programa; no Android fecha o app
const canQuit = () => !!(window.desktop && window.desktop.quit) || !!window.Capacitor?.isNativePlatform?.();
function quitApp() {
  if (window.desktop && window.desktop.quit) return window.desktop.quit();
  const cap = window.Capacitor, plug = cap && (cap.Plugins?.AppExit || cap.registerPlugin?.('AppExit'));
  if (plug) plug.exit().catch(() => {});
}
// habilidade passiva da skin (nome e o que faz)
const abilityTag = (s) => { const a = s.power; return a ? `<span class="ability">${a.active ? 'Poder (botão)' : 'Poder'}: <b>${esc(a.name)}</b><br>${esc(a.desc)}</span>` : ''; };
const coinsTag = () => `<span class="coins"><i class="coin"></i>${save.coins}</span>`;
const soundBtns = () => `<div class="row small"><button class="ghost" data-go="sound">${isMuted() ? 'Som: desligado' : 'Som: ligado'}</button><button class="ghost" data-go="music">${musicEnabled() ? 'Música: ligada' : 'Música: desligada'}</button></div>`;

export function show(name, data) {
  current = name; root.hidden = false;
  const screens = { title, result, sorte, colecao, ranking, conta, pause, revive, loja };
  root.innerHTML = '';
  screens[name](data);
}

function title() {
  const skin = SKIN_BY_ID[save.skin];
  root.innerHTML = `<div class="panel title">
    <h1 class="logo">JERRY'S<br>WAY</h1>
    <div id="pv" class="pv"></div>
    <div class="info">${coinsTag()}<span>Recorde <b>${save.best}</b></span></div>
    <button class="big" data-go="play">JOGAR</button>
    <div class="row"><button data-go="sorte">Sortear skin</button><button data-go="colecao">Coleção</button></div>
    <div class="row"><button data-go="ranking">Ranking</button><button data-go="conta">Conta</button></div>
    <button class="shop-btn" data-go="loja">Loja: moedas, Multiplicador e pacotes</button>
    ${soundBtns()}
    ${canQuit() ? '<button class="ghost" data-go="quitapp">Sair do jogo</button>' : ''}
    <p class="hint">Toque para pular para frente. Arraste para os lados ou para trás.<br>No PC: setas ou WASD. No controle: direcional ou analógico.</p>
  </div>`;
  $('#pv').append(preview(skin), Object.assign(document.createElement('div'), { className: 'skinname', textContent: skin.name }));
  $('#pv').insertAdjacentHTML('beforeend', abilityTag(skin));
}

const END_TEXT = { portal: 'A tela passou do Jerry... ele abriu um portal para Lacrímora e foi embora!', water: 'O Jerry caiu na água!', hit: 'O Jerry foi atropelado!', monstro: 'Algo saiu da escuridão e pegou o Jerry...' };
function result(r) {
  const top = (r.top || []).map((t, i) => `<li><span class="pos">${i + 1}</span><span class="nm">${esc(t.name)}</span><b>${t.best}</b></li>`).join('');
  root.innerHTML = `<div class="panel">
    <h2 style="${r.world ? 'color:#ffcc3a' : ''}">${r.world ? 'NOVO RECORDE MUNDIAL!' : r.record ? 'NOVO RECORDE PESSOAL!' : 'Fim da corrida'}</h2>
    <p class="muted">${END_TEXT[r.kind] || ''}</p>
    <div class="score">${r.score}</div>
    ${r.myth ? `<div class="myth-won"><b>Skin Mítica desbloqueada!</b><div class="pv" id="myth-pv"></div><span>${esc(r.myth.name)}</span><button class="use" id="myth-use">Usar agora</button></div>` : ''}
    <div class="info"><span>Pessoal <b>${save.best}</b></span><span>Mundial <b>${r.world ? r.score : r.worldBest || '-'}</b></span></div>
    <div class="info"><span>+${r.coins} <i class="coin"></i>${r.mult > 1 ? ' <b class="x2">x2</b>' : ''}</span>${coinsTag()}</div>
    ${r.mult > 1 || !r.base ? '' : `<button class="shop-btn" data-go="loja">Com o Multiplicador você levaria +${r.base} moedas a mais</button>`}
    ${top ? `<ol class="rank small-rank">${top}</ol>` : ''}
    <p class="muted" id="rk-msg">${r.rankMsg || ''}</p>
    <button class="big" data-go="play">JOGAR DE NOVO</button>
    <div class="row"><button data-go="ranking">Ranking</button><button data-go="sorte">Sortear</button><button data-go="title">Menu</button></div>
  </div>`;
  if (r.myth) {
    $('#myth-pv').append(preview(r.myth, 'front', 4));
    $('#myth-use').onclick = (e) => { save.skin = r.myth.id; commit(); sfx.click(); e.target.disabled = true; e.target.textContent = 'Usando'; };
    sfx.reveal(4);
  }
}

// ---------------------------------------------------------------- Sortear skin (100 moedas por tentativa; pode repetir)
function sorte() {
  const odds = Object.values(RARITIES).map((r) => r.onlyRun ? `<span style="color:${r.color}">${r.name}: só achando no caminho</span>` : `<span style="color:${r.color}">${r.name} ${String(r.chance).replace('.', ',')}%</span>`).join('');
  root.innerHTML = `<div class="panel">
    <h2>Sortear skin</h2>
    <div class="info">${coinsTag()}<span>${save.owned.length}/${SKINS.length} skins</span></div>
    <div id="gacha" class="gacha"><canvas id="nutcv" class="pix" width="320" height="256"></canvas><div id="g-skin" class="g-skin"></div></div>
    <div id="g-out" class="g-out">Cada tentativa custa ${PULL_COST} moedas e sorteia uma skin. Pode vir repetida (aí as moedas não voltam). As míticas não saem aqui: só pegando o esquilo mítico no caminho.</div>
    <button class="big" id="g-pull" ${save.coins < PULL_COST ? 'disabled' : ''}>TENTAR (${PULL_COST})</button>
    ${save.coins < PULL_COST ? '<button class="shop-btn" data-go="loja">Faltam moedas? Comprar moedas</button>' : ''}
    <div class="odds">${odds}</div>
    <div class="row"><button data-go="colecao">Coleção</button><button data-go="title">Voltar</button></div>
  </div>`;
  $('#g-pull').addEventListener('click', pull);
  if (acorn) acorn.stop();
  acorn = makeAcorn($('#nutcv'));
}
let acorn = null;
let pulling = false;
function pull() {
  if (pulling || save.coins < PULL_COST) return;
  initAudio(); pulling = true;
  save.coins -= PULL_COST; save.pulls++;
  const s = rollSkin(), dup = save.owned.includes(s.id);
  if (!dup) save.owned.push(s.id);
  commit();
  const out = $('#g-out'), btn = $('#g-pull'), slot = $('#g-skin'), rr = RARITIES[s.rarity], rank = Object.keys(RARITIES).indexOf(s.rarity);
  btn.disabled = true; out.textContent = 'Abrindo a noz...'; slot.innerHTML = ''; slot.classList.remove('show');
  let n = 0; const tick = setInterval(() => { sfx.tick(); if (++n > 15) clearInterval(tick); }, 85);
  // a noz treme, racha com a luz da raridade e estoura; a skin aparece no meio dos raios
  acorn.open(rr.color, () => {
    clearInterval(tick);
    slot.append(preview(s, 'front', 5)); slot.style.setProperty('--glow', rr.color); slot.classList.add('show');
    (dup ? sfx.dup : () => sfx.reveal(rank))();
    out.innerHTML = `<b style="color:${rr.color}">${rr.name}</b><br>${esc(s.name)}<br>${abilityTag(s)}${dup ? '<span class="muted">Repetida! Você já tinha essa.</span>' : '<span class="new">NOVA!</span>'}`;
    if (!dup) { const u = document.createElement('button'); u.textContent = 'Usar agora'; u.className = 'use'; u.onclick = () => { save.skin = s.id; commit(); sfx.click(); u.disabled = true; u.textContent = 'Usando'; }; out.append(document.createElement('br'), u); }
    $('.info', root).innerHTML = `${coinsTag()}<span>${save.owned.length}/${SKINS.length} skins</span>`;
    btn.disabled = save.coins < PULL_COST; btn.textContent = `DE NOVO (${PULL_COST})`; pulling = false;
  });
}

// ---------------------------------------------------------------- Coleção
let colFilter = 'todas', colOwn = 'todas', colSel = null;
const MYTH_HINT = 'Míticas não saem no sorteio: o esquilo mítico aparece no caminho, bem longe da largada. Pule em cima dele; se passar da fileira dele, ele foge. Nunca repete.';
// Coleção: a skin escolhida aparece grande em cima (com setinhas para ver uma por uma) e a grade embaixo,
// com filtro de raridade e de "todas / faltam / já tenho"
function colecao() {
  const tabs = ['todas', ...Object.keys(RARITIES)].map((k) => `<button class="tab ${k === colFilter ? 'on' : ''}" data-f="${k}" style="${k !== 'todas' ? 'color:' + RARITIES[k].color : ''}">${k === 'todas' ? 'Todas' : RARITIES[k].name}</button>`).join('');
  const ownTabs = [['todas', 'Todas'], ['faltam', 'Faltam'], ['tenho', 'Já tenho']].map(([k, n]) => `<button class="tab ${k === colOwn ? 'on' : ''}" data-o="${k}">${n}</button>`).join('');
  const per = Object.keys(RARITIES).map((k) => { const all = SKINS.filter((s) => s.rarity === k); return `<span style="color:${RARITIES[k].color}">${all.filter((s) => save.owned.includes(s.id)).length}/${all.length}</span>`; }).join('');
  const list = SKINS.filter((s) => (colFilter === 'todas' || s.rarity === colFilter) && (colOwn === 'todas' || (colOwn === 'tenho') === save.owned.includes(s.id)));
  if (!list.some((s) => s.id === colSel)) colSel = (list.find((s) => s.id === save.skin) || list[0] || {}).id || null;
  root.innerHTML = `<div class="panel wide">
    <h2>Coleção <small>${save.owned.length}/${SKINS.length}</small></h2>
    <div class="odds">${per}</div>
    <div class="col-view">
      <button class="arrow" id="cv-prev" aria-label="Anterior" ${list.length < 2 ? 'disabled' : ''}>‹</button>
      <div class="col-big" id="cv-big"></div>
      <button class="arrow" id="cv-next" aria-label="Próxima" ${list.length < 2 ? 'disabled' : ''}>›</button>
    </div>
    <div class="col-info" id="cv-info"></div>
    <div class="tabs">${ownTabs}</div>
    <div class="tabs">${tabs}</div>
    <div class="grid" id="grid">${list.length ? '' : '<p class="hint" style="grid-column:1/-1">Nenhuma skin aqui.</p>'}</div>
    <div class="row"><button data-go="sorte">Sortear skin</button><button data-go="title">Voltar</button></div>
  </div>`;
  const grid = $('#grid'), cells = new Map();
  const show = (id) => {
    const s = SKIN_BY_ID[id]; if (!s) { $('#cv-big').innerHTML = ''; $('#cv-info').innerHTML = ''; return; }
    colSel = id;
    const own = save.owned.includes(s.id), rr = RARITIES[s.rarity], hidden = !own && s.rarity === 'mitica';
    const big = preview(s, 'front', 6);
    if (hidden) { const c = big.getContext('2d'); c.globalCompositeOperation = 'source-in'; c.fillStyle = '#3a2a5a'; c.fillRect(0, 0, big.width, big.height); }
    if (!own && !hidden) big.classList.add('dim');
    const box = $('#cv-big'); box.innerHTML = ''; box.style.setProperty('--glow', rr.color); box.append(big);
    if (hidden) { const q = document.createElement('b'); q.className = 'q'; q.textContent = '?'; box.append(q); }
    const i = list.findIndex((x) => x.id === id);
    $('#cv-info').innerHTML = `<b style="color:${rr.color}">${rr.name}</b> <span class="muted">${i + 1}/${list.length}</span><br>${hidden ? '???' : esc(s.name)}<br>${hidden ? '' : abilityTag(s)}`
      + (own ? (s.id === save.skin ? '<button class="use" disabled>Usando</button>' : '<button class="use" id="cv-use">Usar esta skin</button>')
        : `<span class="muted">${s.rarity === 'mitica' ? MYTH_HINT : 'Ainda não tem: sai no Sortear skin.'}</span>`);
    const u = $('#cv-use'); if (u) u.onclick = () => { save.skin = s.id; commit(); sfx.click(); cells.forEach((c, k) => c.classList.toggle('on', k === s.id)); show(s.id); };
    cells.forEach((c, k) => c.classList.toggle('sel', k === id));
    const cell = cells.get(id); if (cell) cell.scrollIntoView({ block: 'nearest' });
  };
  for (const s of list) {
    const own = save.owned.includes(s.id), cell = document.createElement('button');
    cell.className = 'cell' + (s.id === save.skin ? ' on' : '') + (own ? '' : ' locked');
    cell.style.borderColor = RARITIES[s.rarity].color;
    cell.title = own ? s.name : '???';
    cell.append(thumb(s, own));
    cell.onclick = () => { sfx.click(); show(s.id); };
    cells.set(s.id, cell); grid.append(cell);
  }
  const step = (d) => { if (list.length < 2) return; const i = list.findIndex((x) => x.id === colSel); sfx.click(); show(list[(i + d + list.length) % list.length].id); };
  $('#cv-prev').onclick = () => step(-1); $('#cv-next').onclick = () => step(1);
  // no PC as setas do teclado também passam; no celular dá para arrastar a skin grande para os lados
  const big = $('#cv-big'); let sx = null;
  big.onpointerdown = (e) => { sx = e.clientX; }; big.onpointerup = (e) => { if (sx !== null && Math.abs(e.clientX - sx) > 30) step(e.clientX < sx ? 1 : -1); sx = null; };
  colKeys = (e) => { if (current !== 'colecao') return; if (e.key === 'ArrowLeft') step(-1); else if (e.key === 'ArrowRight') step(1); };
  root.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { colFilter = b.dataset.f; sfx.click(); colecao(); }));
  root.querySelectorAll('[data-o]').forEach((b) => (b.onclick = () => { colOwn = b.dataset.o; sfx.click(); colecao(); }));
  show(colSel);
}
let colKeys = null;
window.addEventListener('keydown', (e) => colKeys && colKeys(e));

// ---------------------------------------------------------------- Ranking (10 maiores recordes)
async function ranking() {
  root.innerHTML = `<div class="panel">
    <h2>Ranking</h2>
    <p class="muted">Os 10 maiores recordes do Jerry's Way. O 1º é o recorde mundial. Seu recorde pessoal: <b>${save.best}</b></p>
    <ol class="rank" id="rk"><li class="muted" id="rk-wait"></li></ol>
    <div class="row"><button data-go="ranking">Atualizar</button><button data-go="title">Voltar</button></div>
  </div>`;
  const ol = $('#rk'), stop = connecting($('#rk-wait'));
  try {
    const list = await top10();
    if (current !== 'ranking') return;
    const me = currentAccount();
    ol.innerHTML = list.length ? list.map((r, i) => `<li class="${me && me.uid === r.uid ? 'me' : ''}"><span class="pos">${i + 1}</span><span class="th" data-skin="${esc(r.skin || '')}"></span><span class="nm">${esc(r.name)}</span><b>${r.best}</b></li>`).join('') : '<li class="muted">Ninguém no ranking ainda. Seja o primeiro!</li>';
    ol.querySelectorAll('[data-skin]').forEach((el) => { const s = SKIN_BY_ID[el.dataset.skin] || SKINS[0]; el.append(thumb(s, true)); });
    if (!me) ol.insertAdjacentHTML('afterend', '<p class="muted">Entre com sua conta para aparecer no ranking.</p>');
  } catch (e) { if (current === 'ranking') ol.innerHTML = `<li class="muted">${esc(friendly(e))}</li>`; }
  finally { stop(); }
}

// ---------------------------------------------------------------- Conta (a mesma do Song of Moonlight)
function conta() {
  const a = currentAccount();
  if (!cloudReady()) { root.innerHTML = `<div class="panel"><h2>Conta</h2><p class="muted">Login indisponível neste aparelho.</p><button data-go="title">Voltar</button></div>`; return; }
  if (!a) {
    root.innerHTML = `<div class="panel">
      <h2>Conta</h2>
      <p class="muted">É a mesma conta do Song of Moonlight e do site. Com ela seu progresso fica salvo e você entra no ranking.</p>
      <button class="google" id="lf-google" type="button"><svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.1 1.4-4.9 2.3-8.2 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg><span>Entrar com o Google</span></button>
      <div class="or">ou com e-mail</div>
      <form id="lf" class="form">
        <input id="lf-e" type="email" placeholder="E-mail" autocomplete="email" required>
        <input id="lf-p" type="password" placeholder="Senha" autocomplete="current-password" required minlength="6">
        <button class="big" type="submit">Entrar</button>
      </form>
      <div class="row"><button id="lf-new">Criar conta</button><button id="lf-reset">Esqueci a senha</button></div>
      <p class="muted" id="lf-msg"></p>
      <button data-go="title">Jogar sem conta</button>
    </div>`;
    let stop = () => {};
    const msg = (t) => { stop(); $('#lf-msg').textContent = t; }, wait = () => { stop(); stop = connecting($('#lf-msg')); }, E = () => $('#lf-e').value.trim(), Pw = () => $('#lf-p').value;
    $('#lf').addEventListener('submit', async (e) => { e.preventDefault(); wait(); try { await signIn(E(), Pw()); setTimeout(() => show('conta'), 300); } catch (er) { msg(friendly(er)); } });
    $('#lf-new').onclick = async () => { if (!E() || Pw().length < 6) return msg('Preencha o e-mail e uma senha com pelo menos 6 caracteres.'); wait(); try { await signUp(E(), Pw()); setTimeout(() => show('conta'), 300); } catch (er) { msg(friendly(er)); } };
    $('#lf-google').onclick = async () => {
      const b = $('#lf-google'); b.disabled = true;
      wait();
      try { await checkOnline(); msg(window.desktop || window.Capacitor?.isNativePlatform?.() ? 'Termine o login no navegador que abriu e volte ao jogo.' : 'Abrindo o Google...'); await signInGoogle();  msg(''); setTimeout(() => show('conta'), 300); }
      catch (er) { b.disabled = false; msg(er && /popup-closed|cancelled/.test(er.code || '') ? 'Login cancelado.' : (er && er.code ? friendly(er) : (er && er.message) || 'Não deu certo agora.')); }
    };
    $('#lf-reset').onclick = async () => { if (!E()) return msg('Escreva seu e-mail acima.'); wait(); try { await resetPass(E()); msg('Enviamos um link para trocar a senha.'); } catch (er) { msg(friendly(er)); } };
    return;
  }
  if (!a.verified) {
    root.innerHTML = `<div class="panel"><h2>Confirme seu e-mail</h2>
      <p class="muted">Enviamos um link para <b>${esc(a.email)}</b>. Clique nele e depois toque em "Já confirmei".</p>
      <button class="big" id="vf-ok">Já confirmei</button>
      <div class="row"><button id="vf-send">Reenviar</button><button id="vf-out">Sair</button></div>
      <p class="muted" id="vf-msg"></p><button data-go="title">Voltar</button></div>`;
    $('#vf-ok').onclick = async () => { const stop = connecting($('#vf-msg')); try { const u = await refreshVerified(); stop(); if (u.verified) show('conta'); else $('#vf-msg').textContent = 'Ainda não confirmado. Veja sua caixa de entrada (e o spam).'; } catch (er) { stop(); $('#vf-msg').textContent = friendly(er); } };
    $('#vf-send').onclick = async () => { try { await sendVerify(); $('#vf-msg').textContent = 'Link reenviado.'; } catch (er) { $('#vf-msg').textContent = friendly(er); } };
    $('#vf-out').onclick = async () => { await logout(); setTimeout(() => show('conta'), 200); };
    return;
  }
  root.innerHTML = `<div class="panel"><h2>Conta</h2>
    <p class="muted">Conectado como <b>${esc(a.email)}</b>. Seu progresso fica salvo na nuvem.</p>
    <label class="lbl">${save.name ? 'Seu nome no ranking (para trocar, digite outro)' : 'Escolha seu nome no ranking (até 8 letras)'}</label>
    <div class="row"><input id="nm" maxlength="8" value="${esc(save.name || '')}" placeholder="Seu nome"><button id="nm-ok">${save.name ? 'Trocar' : 'Salvar'}</button></div>
    <p class="muted" id="nm-msg">${save.name ? 'Nome salvo na sua conta: vale em todos os aparelhos.' : ''}</p>
    <div class="row"><button id="out">Sair da conta</button><button data-go="title">Voltar</button></div>
    <p class="muted small">Também em <a href="${SITE_URL}" target="_blank" rel="noopener">${SITE_URL.replace('https://', '')}</a></p></div>`;
  $('#nm-ok').onclick = async () => {
    const nm = $('#nm').value.replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 8);
    if (!nm) { $('#nm-msg').textContent = 'Escolha um nome.'; return; }
    $('#nm-msg').textContent = 'Salvando...';
    try { await setName(nm); $('#nm-msg').textContent = 'Nome salvo. No ranking também.'; } catch (er) { $('#nm-msg').textContent = friendly(er); }
  };
  $('#out').onclick = async () => { await logout(); setTimeout(() => show('conta'), 200); };
}

function pause() {
  root.innerHTML = `<div class="panel"><h2>Pausa</h2>
    <button class="big" data-go="resume">CONTINUAR</button>
    ${soundBtns()}
    <button data-go="quit">Desistir</button></div>`;
}

// morreu: reviver uma vez por partida, por 70 moedas (40 com a habilidade Pechincheiro)
export const REVIVE_COST = 70;
function revive(d) {
  const cost = d.cost || REVIVE_COST;
  root.innerHTML = `<div class="panel revive"><h2>Reviver?</h2>
    <p class="muted">Continue de onde parou. Só dá para reviver uma vez por partida.</p>
    <div class="score">${d.score}</div>
    <button class="big" id="rv-coins">Reviver por ${cost} <i class="coin"></i></button>
    <p class="muted small">Você tem ${d.coins} <i class="coin"></i></p>
    <div class="rv-bar"><i id="rv-time"></i></div>
    <button class="ghost" id="rv-skip">Não, obrigado</button></div>`;
  const T0 = Date.now(), MS = 7000; let done = false;
  const end = (fn) => { if (done) return; done = true; clearInterval(timer); fn(); };
  const timer = setInterval(() => { const k = 1 - (Date.now() - T0) / MS; $('#rv-time').style.width = Math.max(0, k * 100) + '%'; if (k <= 0) end(d.skip); }, 50);
  $('#rv-coins').onclick = () => { sfx.click(); end(d.pay); };
  $('#rv-skip').onclick = () => { sfx.click(); end(d.skip); };
}

// ---------------------------------------------------------------- Loja (a compra é feita no site, com a mesma conta)
const SHOP = [
  { id: 'pacote-lua', name: 'Pacote Lua Cheia', price: 'R$ 47,90', badge: 'Melhor oferta', desc: 'Song of Moonlight: O Mistério do Castelo Silencioso + 500 moedas + Multiplicador de moedas.', big: true, part: () => coinMult() > 1 },
  { id: 'jerry-way-x2', name: 'Multiplicador de moedas', price: 'R$ 7,90', badge: 'x2', desc: 'Todas as moedas das suas partidas valem o dobro, para sempre.', own: () => coinMult() > 1 },
  { id: 'jerry-way-coins150', name: '150 moedas', price: 'R$ 12,00', badge: '+150', desc: 'Entram sozinhas no jogo. Pode comprar quantas vezes quiser.' },
  { id: 'jerry-way-allskins', name: 'Todas as skins', price: 'R$ 239,90', badge: 'Tudo', desc: 'Todas as 450 skins do Jerry, inclusive as míticas e as que saírem depois.', own: () => SKINS.every((k) => save.owned.includes(k.id)) },
];
function openSite(path) { const a = document.createElement('a'); a.href = SITE_URL + path; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }
function loja() {
  const me = currentAccount();
  root.innerHTML = `<div class="panel wide"><h2>Loja</h2>
    <p class="muted small">A compra é feita no site (Pix ou cartão), com a mesma conta do jogo. ${me && me.verified ? `Conta: ${esc(me.email)}` : '<b>Entre na sua conta antes</b> para receber o que comprar.'}</p>
    <div class="shop">${SHOP.map((x) => { const have = x.own && x.own(), part = !have && x.part && x.part();   // "Já é seu" só no que foi comprado; pacote com parte já comprada: não vende
      return `<div class="shop-item${x.big ? ' big' : ''}"><span class="badge">${esc(x.badge)}</span><b>${esc(x.name)}</b><span class="muted">${esc(x.desc)}</span>
        <div class="buy"><span class="price">${esc(x.price)}</span>${have ? '<span class="own">✓ Já é seu</span>' : part ? '<span class="own">Você já tem o Multiplicador</span>' : `<button data-buy="${x.id}">Comprar</button>`}</div></div>`; }).join('')}</div>
    <p class="muted" id="sh-msg"></p>
    <div class="row">${me && me.verified ? '<button id="sh-check">Já comprei</button>' : '<button data-go="conta">Entrar na conta</button>'}<button data-go="title">Voltar</button></div></div>`;
  root.querySelectorAll('[data-buy]').forEach((b) => b.addEventListener('click', () => { sfx.click(); openSite('/#/comprar/' + b.dataset.buy); $('#sh-msg').textContent = 'Depois de pagar no site, volte aqui: o jogo confere sozinho (ou toque em "Já comprei").'; }));
  $('#sh-check')?.addEventListener('click', async (e) => {
    e.target.disabled = true; const stop = connecting($('#sh-msg'));
    try { await refreshEnt(); } finally { stop(); e.target.disabled = false; }
    if (current === 'loja') { show('loja'); $('#sh-msg').textContent = 'Conferido! O que você comprou já está no jogo.'; }
  });
}
