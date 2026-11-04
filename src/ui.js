// Telas por cima do jogo (HTML): início, resultado, Sortear skin, Coleção, Ranking, Conta e pausa.
import { save, commit, cloudReady, currentAccount, signIn, signUp, signInGoogle, checkOnline, resetPass, sendVerify, refreshVerified, logout, friendly, top10, submitScore } from './store.js';
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
    else if (go === 'sound') { setMuted(!isMuted()); show(current); }
    else if (go === 'music') { setMusic(!musicEnabled()); show(current); }
    else show(go);
  });
}
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
const coinsTag = () => `<span class="coins"><i class="coin"></i>${save.coins}</span>`;
const soundBtns = () => `<div class="row small"><button class="ghost" data-go="sound">${isMuted() ? 'Som: desligado' : 'Som: ligado'}</button><button class="ghost" data-go="music">${musicEnabled() ? 'Música: ligada' : 'Música: desligada'}</button></div>`;

export function show(name, data) {
  current = name; root.hidden = false;
  const screens = { title, result, sorte, colecao, ranking, conta, pause };
  root.innerHTML = '';
  screens[name](data);
}

function title() {
  const skin = SKIN_BY_ID[save.skin];
  root.innerHTML = `<div class="panel title">
    <h1 class="logo">JERRY<br>WAY</h1>
    <div id="pv" class="pv"></div>
    <div class="info">${coinsTag()}<span>Recorde <b>${save.best}</b></span></div>
    <button class="big" data-go="play">JOGAR</button>
    <div class="row"><button data-go="sorte">Sortear skin</button><button data-go="colecao">Coleção</button></div>
    <div class="row"><button data-go="ranking">Ranking</button><button data-go="conta">Conta</button></div>
    ${soundBtns()}
    <p class="hint">Toque para pular para frente. Arraste para os lados ou para trás.<br>No PC: setas ou WASD.</p>
  </div>`;
  $('#pv').append(preview(skin), Object.assign(document.createElement('div'), { className: 'skinname', textContent: skin.name }));
}

const END_TEXT = { portal: 'A tela passou do Jerry... ele abriu um portal para Lacrímora e foi embora!', water: 'O Jerry caiu na água!', hit: 'O Jerry foi atropelado!' };
function result(r) {
  const top = (r.top || []).map((t, i) => `<li><span class="pos">${i + 1}</span><span class="nm">${esc(t.name)}</span><b>${t.best}</b></li>`).join('');
  root.innerHTML = `<div class="panel">
    <h2 style="${r.world ? 'color:#ffcc3a' : ''}">${r.world ? 'NOVO RECORDE MUNDIAL!' : r.record ? 'NOVO RECORDE PESSOAL!' : 'Fim da corrida'}</h2>
    <p class="muted">${END_TEXT[r.kind] || ''}</p>
    <div class="score">${r.score}</div>
    ${r.myth ? `<div class="myth-won"><b>Skin Mítica desbloqueada!</b><div class="pv" id="myth-pv"></div><span>${esc(r.myth.name)}</span><button class="use" id="myth-use">Usar agora</button></div>` : ''}
    <div class="info"><span>Pessoal <b>${save.best}</b></span><span>Mundial <b>${r.world ? r.score : r.worldBest || '-'}</b></span></div>
    <div class="info"><span>+${r.coins} <i class="coin"></i></span>${coinsTag()}</div>
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
    out.innerHTML = `<b style="color:${rr.color}">${rr.name}</b><br>${esc(s.name)}<br>${dup ? '<span class="muted">Repetida! Você já tinha essa.</span>' : '<span class="new">NOVA!</span>'}`;
    if (!dup) { const u = document.createElement('button'); u.textContent = 'Usar agora'; u.className = 'use'; u.onclick = () => { save.skin = s.id; commit(); sfx.click(); u.disabled = true; u.textContent = 'Usando'; }; out.append(document.createElement('br'), u); }
    $('.info', root).innerHTML = `${coinsTag()}<span>${save.owned.length}/${SKINS.length} skins</span>`;
    btn.disabled = save.coins < PULL_COST; btn.textContent = `DE NOVO (${PULL_COST})`; pulling = false;
  });
}

// ---------------------------------------------------------------- Coleção
let colFilter = 'todas';
function colecao() {
  const tabs = ['todas', ...Object.keys(RARITIES)].map((k) => `<button class="tab ${k === colFilter ? 'on' : ''}" data-f="${k}" style="${k !== 'todas' ? 'color:' + RARITIES[k].color : ''}">${k === 'todas' ? 'Todas' : RARITIES[k].name}</button>`).join('');
  const per = Object.keys(RARITIES).map((k) => { const all = SKINS.filter((s) => s.rarity === k); return `<span style="color:${RARITIES[k].color}">${all.filter((s) => save.owned.includes(s.id)).length}/${all.length}</span>`; }).join('');
  root.innerHTML = `<div class="panel wide">
    <h2>Coleção <small>${save.owned.length}/${SKINS.length}</small></h2>
    <div class="odds">${per}</div>
    <div class="tabs">${tabs}</div>
    <div class="grid" id="grid"></div>
    <p class="hint" id="col-hint">${colFilter === 'mitica' ? 'Míticas não saem no sorteio: o esquilo mítico aparece no caminho, bem longe da largada. Pule em cima dele; se passar da fileira dele, ele foge. Nunca repete.' : ''}</p>
    <div class="row"><button data-go="sorte">Sortear skin</button><button data-go="title">Voltar</button></div>
  </div>`;
  const grid = $('#grid');
  for (const s of SKINS) {
    if (colFilter !== 'todas' && s.rarity !== colFilter) continue;
    const own = save.owned.includes(s.id), cell = document.createElement('button');
    cell.className = 'cell' + (s.id === save.skin ? ' on' : '') + (own ? '' : ' locked');
    cell.style.borderColor = RARITIES[s.rarity].color;
    cell.title = own ? s.name : s.rarity === 'mitica' ? 'Mítica: pegue o esquilo mítico no caminho (muito raro, longe da largada)' : '???';
    cell.append(thumb(s, own));
    cell.onclick = () => { if (!own) { sfx.bump(); if (s.rarity === 'mitica') { const h = $('#col-hint'); if (h) h.textContent = 'Míticas não saem no sorteio: o esquilo mítico aparece no caminho, bem longe da largada. Pule em cima dele; se passar da fileira dele, ele foge. Nunca repete.'; } return; } save.skin = s.id; commit(); sfx.click(); colecao(); };
    grid.append(cell);
  }
  root.querySelectorAll('[data-f]').forEach((b) => (b.onclick = () => { colFilter = b.dataset.f; colecao(); }));
}

// ---------------------------------------------------------------- Ranking (10 maiores recordes)
async function ranking() {
  root.innerHTML = `<div class="panel">
    <h2>Ranking</h2>
    <p class="muted">Os 10 maiores recordes do Jerry Way. O 1º é o recorde mundial. Seu recorde pessoal: <b>${save.best}</b></p>
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
    <label class="lbl">Nome no ranking (até 8 letras)</label>
    <div class="row"><input id="nm" maxlength="8" value="${esc(save.name || a.email.split('@')[0].slice(0, 8))}"><button id="nm-ok">Salvar</button></div>
    <p class="muted" id="nm-msg"></p>
    <div class="row"><button id="out">Sair da conta</button><button data-go="title">Voltar</button></div>
    <p class="muted small">Também em <a href="${SITE_URL}" target="_blank" rel="noopener">${SITE_URL.replace('https://', '')}</a></p></div>`;
  $('#nm-ok').onclick = async () => {
    save.name = $('#nm').value.replace(/[^\p{L}\p{N} _.-]/gu, '').trim().slice(0, 8); commit();
    try { await submitScore(); $('#nm-msg').textContent = 'Nome salvo.'; } catch (er) { $('#nm-msg').textContent = friendly(er); }
  };
  $('#out').onclick = async () => { await logout(); setTimeout(() => show('conta'), 200); };
}

function pause() {
  root.innerHTML = `<div class="panel"><h2>Pausa</h2>
    <button class="big" data-go="resume">CONTINUAR</button>
    ${soundBtns()}
    <button data-go="quit">Desistir</button></div>`;
}
