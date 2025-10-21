// assets/js/firebase-app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged,
  GoogleAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, serverTimestamp, addDoc, collection,
  query, where, getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig, collections } from "/static/config/firebase.config.js";

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

// ---- AUTH ----
const provider = new GoogleAuthProvider();

export async function loginWithGoogle() {
  await signInWithPopup(auth, provider);
}
export async function loginEmailPass(email, pass) {
  await signInWithEmailAndPassword(auth, email, pass);
}
export async function registerEmailPass(email, pass) {
  await createUserWithEmailAndPassword(auth, email, pass);
}
export async function logout() {
  await signOut(auth);
}

// Crea/actualiza el perfil del usuario en 'users/{uid}'
async function upsertUserProfile(user) {
  await setDoc(doc(db, collections.users, user.uid), {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    providerIds: user.providerData.map(p => p.providerId),
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });
}

// Observa estado de sesión y expone callback para UI
export function onAuth(cb) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) await upsertUserProfile(user);
    cb(user);
  });
}

// ---- TRACKING ----
// Guarda cada click de descarga (evento)
export async function trackDownload({ fileId, fileName }) {
  const user = auth.currentUser;
  const payload = {
    fileId,
    fileName: fileName || null,
    uid: user ? user.uid : null,
    ts: serverTimestamp(),
    type: "download"
  };
  await addDoc(collection(db, collections.downloads), payload);
}

// Guarda actividad de foro (post/reply)
export async function trackForumActivity({ threadId, action }) {
  const user = auth.currentUser;
  const payload = {
    threadId,
    action, // "post" | "reply" | "like"
    uid: user ? user.uid : null,
    ts: serverTimestamp(),
    type: "forum"
  };
  await addDoc(collection(db, collections.forumActivity), payload);
}

// Conteos (agregados) usando count() en el servidor
export async function getUserDownloadCount(uid) {
  const q = query(collection(db, collections.downloads), where("uid", "==", uid));
  const snap = await getCountFromServer(q);
  return snap.data().count || 0;
}
export async function getGlobalDownloadCountForFile(fileId) {
  const q = query(collection(db, collections.downloads), where("fileId", "==", fileId));
  const snap = await getCountFromServer(q);
  return snap.data().count || 0;
}
