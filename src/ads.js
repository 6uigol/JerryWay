// Anúncios do Jerry's Way.
//  - Android: AdMob (vídeo premiado para reviver + anúncio entre partidas). IDs dos blocos em ADMOB (AdMob → Apps → Blocos de anúncios);
//    o ID do app fica em android/app/src/main/res/values/strings.xml.
//  - PC (Windows/Linux): anúncio próprio, do Song of Moonlight, em tela cheia com contagem.
// Limites (para não irritar e não dar erro de "muitos pedidos" no AdMob):
//  - entre partidas: no máximo 1 a cada 3 mortes E nunca antes de 2 minutos desde o último anúncio; nunca nas 2 primeiras
//    partidas do dia; no máximo 20 por dia;
//  - o vídeo para reviver só aparece quando o jogador escolhe (1 vez por partida);
//  - cada anúncio espera no máximo 8 s para carregar; se o AdMob não tiver anúncio (sem internet, sem estoque, erro),
//    entra o anúncio próprio do Song of Moonlight (no reviver e entre partidas), então os dois sempre aparecem.
import { SITE_URL } from './config.js';

export const ADMOB = {
  rewarded: 'ca-app-pub-7937201194751357/5566163110',      // vídeo premiado "reviver" (real)
  interstitial: 'ca-app-pub-7937201194751357/8972064817',  // tela cheia "Entre partidas" (real)
};
// bloco com o ID de teste do Google = modo teste; com o ID real = anúncio de verdade
const isTest = (kind) => ADMOB[kind].includes('3940256099942544');
export const AD_EVERY = 3;                 // anúncio entre partidas a cada 3 mortes
const MIN_GAP = 2 * 60 * 1000;             // e pelo menos 2 minutos desde o último anúncio
const DAILY_MAX = 20, FREE_RUNS = 2, LOAD_MS = 8000;

const native = () => !!window.Capacitor?.isNativePlatform?.();
const plugin = () => { const c = window.Capacitor; return c ? (c.Plugins?.AdMob || c.registerPlugin?.('AdMob')) : null; };
const wait = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('tempo')), ms))]);

// ---------------------------------------------------------------- contadores (no aparelho)
const KEY = 'jerryway.ads';
function state() {
  let s; try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { s = null; }
  const day = new Date().toDateString();
  if (!s || s.day !== day) s = { day, runs: 0, shown: 0, deaths: s ? s.deaths || 0 : 0, last: s ? s.last || 0 : 0 };
  return s;
}
const keep = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (_) { /* ok */ } };
export function countDeath() { const s = state(); s.runs++; s.deaths++; keep(s); }
// está na hora do anúncio entre partidas?
export function interstitialDue() {
  const s = state();
  return s.runs > FREE_RUNS && s.deaths >= AD_EVERY && Date.now() - s.last >= MIN_GAP && s.shown < DAILY_MAX;
}
function markShown() { const s = state(); s.deaths = 0; s.last = Date.now(); s.shown++; keep(s); }

// ---------------------------------------------------------------- AdMob (Android)
let ready = null, loaded = { rewarded: false, interstitial: false }, loading = {};
async function admob() {
  const p = plugin(); if (!p) return null;
  if (!ready) ready = wait(p.initialize({ initializeForTesting: false }), LOAD_MS).then(() => p).catch(() => { ready = null; return null; });
  return ready;
}
// carrega antes, para o anúncio abrir na hora (no máximo um pedido por vez de cada tipo)
function preload(kind) {
  if (loaded[kind] || loading[kind]) return loading[kind];
  loading[kind] = (async () => {
    const p = await admob(); if (!p) return false;
    const opts = { adId: ADMOB[kind], isTesting: isTest(kind) };
    await wait(kind === 'rewarded' ? p.prepareRewardVideoAd(opts) : p.prepareInterstitial(opts), LOAD_MS);
    loaded[kind] = true; return true;
  })().catch(() => false).finally(() => { loading[kind] = null; });
  return loading[kind];
}
export function initAds(noAds) {
  if (!native()) return;
  admob().then((p) => { if (!p) return; preload('rewarded'); if (!noAds()) preload('interstitial'); });
}
// espera um evento do AdMob (com tempo máximo) e solta os ouvintes
function once(p, names, ms) {
  return new Promise((ok) => {
    const hs = []; let done = false;
    const end = (v) => { if (done) return; done = true; hs.forEach((h) => h.then((x) => x.remove()).catch(() => {})); ok(v); };
    for (const [ev, v] of names) hs.push(Promise.resolve(p.addListener(ev, () => end(v))));
    setTimeout(() => end('timeout'), ms);
  });
}

// ---------------------------------------------------------------- anúncio próprio (PC, ou quando o AdMob falha)
// mostra o Song of Moonlight em tela cheia; `secs` é a contagem até poder fechar (no vídeo de reviver, até ganhar)
function houseAd(secs, { rewarded, buy = false }) {
  return new Promise((ok) => {
    const el = document.createElement('div'); el.className = 'housead';
    el.innerHTML = `<div class="ha-box"><small class="ha-tag">ANÚNCIO</small>
      <img src="icons/som-ad.jpg" alt="Song of Moonlight" width="960" height="480">
      <h2>Song of Moonlight</h2><p>O Mistério do Castelo Silencioso. Aventura em pixel art com o Lyon e o Jerry: junte os 7 fragmentos do Coração da Lua.</p>
      <div class="ha-row"><button class="ha-more" type="button">Conhecer o jogo</button>${buy ? '<button class="ha-buy" type="button">Tirar anúncios</button>' : ''}</div>
      <button class="ha-close" type="button" disabled>${secs}</button></div>`;
    document.body.appendChild(el);
    const close = el.querySelector('.ha-close'); let left = secs, earned = false;
    const tick = setInterval(() => {
      left--; if (left > 0) { close.textContent = String(left); return; }
      clearInterval(tick); earned = true; close.disabled = false; close.textContent = rewarded ? 'Reviver ▶' : 'Fechar ✕';
    }, 1000);
    const finish = (v) => { clearInterval(tick); el.remove(); ok(v); };
    close.addEventListener('click', () => { if (earned) finish(rewarded ? 'reward' : 'closed'); });
    el.querySelector('.ha-more').addEventListener('click', () => openLink(SITE_URL + '/#/jogo/song-of-moonlight'));
    el.querySelector('.ha-buy')?.addEventListener('click', () => finish('buy'));   // quem chamou abre a tela "Tirar anúncios"
  });
}
export function openLink(url) { const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener'; document.body.appendChild(a); a.click(); a.remove(); }

// ---------------------------------------------------------------- o que o jogo chama
// vídeo para reviver: devolve true se o jogador assistiu até o fim
export async function showRewarded() {
  if (native()) {
    const p = await admob();
    if (p && (loaded.rewarded || await preload('rewarded'))) {
      loaded.rewarded = false;
      const res = once(p, [['onRewardedVideoAdReward', 'reward'], ['onRewardedVideoAdDismissed', 'closed'], ['onRewardedVideoAdFailedToShow', 'fail']], 90000);
      const shown = await wait(p.showRewardVideoAd(), 90000).then(() => true).catch(() => false);
      let r = shown ? await res : 'fail';
      if (r === 'reward') { await once(p, [['onRewardedVideoAdDismissed', 1]], 3000); }   // espera fechar o vídeo
      else if (shown && r === 'timeout') r = 'reward';   // o próprio show já devolveu a recompensa
      preload('rewarded');
      if (r === 'reward') return true;
      if (r !== 'fail') return false;
    }
  }
  return (await houseAd(native() ? 10 : 15, { rewarded: true })) === 'reward';
}
// anúncio entre partidas (só se estiver na hora e o jogador não tiver comprado "Sem anúncios").
// Devolve 'buy' se o jogador tocou em "Tirar anúncios" no anúncio próprio.
export async function maybeInterstitial(noAds) {
  if (noAds() || !interstitialDue()) return;
  markShown();
  if (native()) {
    const p = await admob();
    if (p && (loaded.interstitial || await preload('interstitial'))) {
      loaded.interstitial = false;
      const res = once(p, [['interstitialAdDismissed', 1], ['interstitialAdFailedToShow', 0]], 60000);
      const ok = await wait(p.showInterstitial(), 15000).then(() => true).catch(() => false);
      const r = ok ? await res : 0;
      preload('interstitial');
      if (ok && r !== 0) return;
    }
    // o AdMob não tinha anúncio agora (app novo, fora da Play Store, sem internet...): mostra o anúncio próprio
  }
  return houseAd(5, { rewarded: false, buy: true });
}
