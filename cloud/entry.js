// Ponte com o Firebase (mesma conta do Song of Moonlight). Empacotada em vendor/cloud.bundle.js (npm run build:cloud)
// para o app abrir sem baixar nada. O ranking e o progresso passam pelo servidor do site (/api/jerry), com o token da conta.
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, signOut, GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';

let auth, user = null;
export function init(config, options = {}) {
  const app = initializeApp(config);
  auth = options.android ? initializeAuth(app, { persistence: browserLocalPersistence }) : getAuth(app);
}
const pub = (u) => (u ? { uid: u.uid, email: u.email, verified: !!u.emailVerified } : null);
export function onAuth(cb) { return onAuthStateChanged(auth, (u) => { user = u; cb(pub(u)); }); }
export const signIn = (e, p) => signInWithEmailAndPassword(auth, e, p).then(() => {});
export const signUp = (e, p) => createUserWithEmailAndPassword(auth, e, p).then(() => sendEmailVerification(auth.currentUser));
export const sendVerify = () => sendEmailVerification(auth.currentUser);
export async function refreshVerified() { await auth.currentUser.reload(); await auth.currentUser.getIdToken(true); user = auth.currentUser; return pub(user); }
export const reset = (e) => sendPasswordResetEmail(auth, e);
export const logout = () => signOut(auth);
export const idToken = () => auth.currentUser.getIdToken();
// Google: no PC e no Android recebe os tokens do login feito no navegador do sistema; no navegador usa o pop-up normal
export async function signInGoogle(getTokens) {
  await auth.authStateReady();
  const tokens = getTokens ? await getTokens() : null;
  const result = tokens
    ? await signInWithCredential(auth, GoogleAuthProvider.credential(tokens.idToken, tokens.accessToken))
    : await signInWithPopup(auth, new GoogleAuthProvider());
  user = result.user;
  return { ...pub(user), googleState: tokens && tokens.state };
}
// usada pela página de login aberta no navegador do sistema (PC e Android)
export async function googleTokens() {
  const r = await signInWithPopup(auth, new GoogleAuthProvider());
  const c = GoogleAuthProvider.credentialFromResult(r);
  return { idToken: c && c.idToken, accessToken: c && c.accessToken };
}
