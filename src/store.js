// Progresso do jogador: moedas, skins, recorde, última partida e o fantasma do recorde.
// Fica no aparelho (localStorage) e, com conta, também na nuvem (mesma conta do Song of Moonlight).
import { DEFAULT_SKIN, SKIN_BY_ID } from './skins.js';
import { FIREBASE_CONFIG, API_URL } from './config.js';
import { nativeGoogleLogin, pendingGoogleLogin, acknowledgeGoogleLogin } from './google-login.js';

const KEY = (uid) => 'jerryway.save.' + (uid || 'local');
const fresh = () => ({ v: 1, coins: 0, best: 0, last: 0, runs: 0, pulls: 0, owned: [DEFAULT_SKIN], skin: DEFAULT_SKIN, name: '', ghost: null, updatedAt: 0 });
export const save = fresh();
let uid = null, cloud = null, account = null, cloudTimer = null;
const listeners = new Set();
export const onChange = (fn) => listeners.add(fn);
const emit = () => listeners.forEach((fn) => { try { fn(); } catch (_) { /* ok */ } });

function sanitize(s) {
  const o = { ...fresh(), ...(s || {}) };
  o.coins = Math.max(0, Math.floor(+o.coins || 0)); o.best = Math.max(0, Math.floor(+o.best || 0));
  o.owned = [...new Set((Array.isArray(o.owned) ? o.owned : []).filter((id) => SKIN_BY_ID[id]).concat(DEFAULT_SKIN))];
  if (!o.owned.includes(o.skin)) o.skin = DEFAULT_SKIN;
  o.name = String(o.name || '').slice(0, 16);
  return o;
}
function readLocal(id) { try { return JSON.parse(localStorage.getItem(KEY(id)) || 'null'); } catch (_) { return null; } }
function writeLocal() { try { localStorage.setItem(KEY(uid), JSON.stringify(save)); } catch (_) { /* cheio ou bloqueado */ } }
function load(obj) { for (const k of Object.keys(save)) delete save[k]; Object.assign(save, sanitize(obj)); }
load(readLocal(null));

export function commit() {
  save.updatedAt = Date.now();
  writeLocal(); emit();
  if (uid && account && account.verified) { clearTimeout(cloudTimer); cloudTimer = setTimeout(pushCloud, 1500); }
}
// conversa com o servidor do site (/api/jerry); as chamadas da conta levam o token do Firebase
async function api(op, payload) {
  const headers = { 'content-type': 'application/json' };
  if (op !== 'top') headers.authorization = 'Bearer ' + (await cloud.idToken());
  const r = payload ? await fetch(API_URL, { method: 'POST', headers, body: JSON.stringify({ op, ...payload }) }) : await fetch(API_URL + '?op=' + op, { headers, cache: 'no-store' });
  if (!r.ok) throw Object.assign(new Error('servidor'), { code: r.status === 401 ? 'permission-denied' : 'network' });
  return r.json();
}
async function pushCloud() { try { await api('save', { data: JSON.parse(JSON.stringify(save)) }); } catch (e) { console.warn('nuvem', e && e.code); } }

// ---------------------------------------------------------------- conta
export const cloudReady = () => !!cloud;
export const currentAccount = () => account;
export async function initCloud() {
  if (!FIREBASE_CONFIG) return;
  try {
    cloud = await import('../vendor/cloud.bundle.js');
    cloud.init(FIREBASE_CONFIG, { android: !!window.Capacitor?.isNativePlatform?.() });
    cloud.onAuth((u) => { account = u; attach(u); });
    resumeGoogle();
  } catch (e) { cloud = null; console.warn('sem nuvem', e); }
}
// ao entrar: junta o que estava no aparelho (sem conta) com o que está na nuvem (o recorde maior, todas as skins)
async function attach(u) {
  if (!u) { uid = null; load(readLocal(null)); emit(); return; }
  uid = u.uid;
  const local = readLocal(uid) || readLocal(null) || {};
  load(local);
  emit();
  if (!u.verified) return;
  try {
    const remote = (await api('save')).data;
    if (remote) {
      const m = sanitize(remote);
      m.best = Math.max(m.best, save.best);
      m.owned = [...new Set([...m.owned, ...save.owned])];
      if (!m.name) m.name = save.name;
      if ((save.updatedAt || 0) > (m.updatedAt || 0)) { m.coins = save.coins; m.skin = save.skin; m.ghost = save.ghost || m.ghost; m.last = save.last; }
      load(m);
    }
    // o progresso jogado sem conta passa para a conta uma única vez
    try { localStorage.removeItem(KEY(null)); } catch (_) { /* ok */ }
    commit();
    submitScore().catch(() => {});   // o recorde do aparelho entra no ranking ao entrar na conta
  } catch (e) { console.warn('nuvem', e && e.code); }
}
export const signIn = (e, p) => cloud.signIn(e, p);
export const signUp = (e, p) => cloud.signUp(e, p);
export const resetPass = (e) => cloud.reset(e);
export const sendVerify = () => cloud.sendVerify();
export async function refreshVerified() { const u = await cloud.refreshVerified(); account = u; await attach(u); return u; }
export const logout = () => cloud.logout();
export async function signInGoogle(pending = null) {
  const u = await cloud.signInGoogle(nativeGoogleLogin(FIREBASE_CONFIG, pending));
  if (u.googleState) { try { await acknowledgeGoogleLogin(u.googleState); } catch (_) { /* a conta já entrou */ } }
  return u;
}
// Android: se o app foi fechado no meio do login com o Google, termina o login ao abrir de novo
export async function resumeGoogle() { try { const p = await pendingGoogleLogin(); if (p) await signInGoogle(p); } catch (_) { /* sem login pendente */ } }

// ---------------------------------------------------------------- ranking
export async function submitScore() {
  if (!cloud || !account || !account.verified || !save.best) return false;
  const name = (save.name || account.email.split('@')[0]).replace(/[^\p{L}\p{N} _.-]/gu, '').slice(0, 16) || 'Jerry';
  await api('score', { name, best: save.best, skin: save.skin });
  return true;
}
// o ranking é público: aparece mesmo sem conta
export async function top10() { return (await api('top')).list; }
export function friendly(e) {
  const c = (e && e.code) || '';
  if (c.includes('invalid-credential') || c.includes('wrong-password') || c.includes('user-not-found')) return 'E-mail ou senha incorretos.';
  if (c.includes('email-already-in-use')) return 'Já existe uma conta com esse e-mail. É a mesma do Song of Moonlight: use Entrar.';
  if (c.includes('weak-password')) return 'A senha precisa de pelo menos 6 caracteres.';
  if (c.includes('invalid-email')) return 'E-mail inválido.';
  if (c.includes('too-many-requests')) return 'Muitas tentativas. Espere um pouco e tente de novo.';
  if (c.includes('network')) return 'Sem internet no momento.';
  if (c.includes('popup-blocked')) return 'O navegador bloqueou a janela do Google. Permita e tente de novo.';
  if (c.includes('account-exists-with-different-credential')) return 'Esse e-mail já tem conta com senha. Entre com e-mail e senha.';
  if (c.includes('permission-denied')) return 'O servidor recusou (confirme seu e-mail ou tente mais tarde).';
  return 'Não deu certo agora. Tente de novo.';
}
