// Ponte com o Firebase (mesmo projeto e mesma conta do Song of Moonlight). Empacotada em vendor/cloud.bundle.js
// (npm run build:cloud) para o app abrir sem baixar nada da internet.
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc, collection, query, orderBy, limit, getDocsFromServer } from 'firebase/firestore';

let auth, db, user = null;
export function init(config, options = {}) {
  const app = initializeApp(config);
  auth = options.android ? initializeAuth(app, { persistence: browserLocalPersistence }) : getAuth(app);
  db = getFirestore(app);
}
const pub = (u) => (u ? { uid: u.uid, email: u.email, verified: !!u.emailVerified } : null);
export function onAuth(cb) { return onAuthStateChanged(auth, (u) => { user = u; cb(pub(u)); }); }
export const signIn = (e, p) => signInWithEmailAndPassword(auth, e, p).then(() => {});
export const signUp = (e, p) => createUserWithEmailAndPassword(auth, e, p).then(() => sendEmailVerification(auth.currentUser));
export const sendVerify = () => sendEmailVerification(auth.currentUser);
export async function refreshVerified() { await auth.currentUser.reload(); await auth.currentUser.getIdToken(true); user = auth.currentUser; return pub(user); }
export const reset = (e) => sendPasswordResetEmail(auth, e);
export const logout = () => signOut(auth);

// progresso do Jerry Way: jerryway/<uid> (moedas, skins, recorde...)
export async function loadSave() { const s = await getDocFromServer(doc(db, 'jerryway', user.uid)); return s.exists() ? s.data() : null; }
export const putSave = (data) => setDoc(doc(db, 'jerryway', user.uid), data);
// ranking: jerrywayScores/<uid> = { name, best, skin, at }; os 10 maiores
export const putScore = (s) => setDoc(doc(db, 'jerrywayScores', user.uid), s);
export async function top10() {
  const out = [];
  (await getDocsFromServer(query(collection(db, 'jerrywayScores'), orderBy('best', 'desc'), limit(10)))).forEach((d) => out.push({ uid: d.id, ...d.data() }));
  return out;
}
