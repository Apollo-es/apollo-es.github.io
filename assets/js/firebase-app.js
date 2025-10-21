import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, deleteUser,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, serverTimestamp, getDoc, writeBatch,
  addDoc, collection, query, where, getCountFromServer
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig, collections } from "/static/config/firebase.config.js";

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

const google = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, google);
export const loginEmailPass  = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
export const registerEmailPass = (email, pass) => createUserWithEmailAndPassword(auth, email, pass);
export const logout = () => signOut(auth);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

async function upsertUserProfile(user) {
  await setDoc(doc(db, collections.users, user.uid), {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    username: (await getDoc(doc(db, collections.users, user.uid))).data()?.username || null,
    providerIds: user.providerData.map(p => p.providerId),
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  }, { merge: true });
}

export function onAuth(cb){
  return onAuthStateChanged(auth, async (user) => {
    if (user) await upsertUserProfile(user);
    cb(user);
  });
}

export async function setUsername(newNameRaw) {
  const user = auth.currentUser;
  if (!user) throw new Error("Necesitas iniciar sesión");
  const uname = newNameRaw.trim().toLowerCase();
  if (!/^[a-z0-9_.]{3,20}$/.test(uname)) throw new Error("Usuario 3-20 chars [a-z0-9_.]");

  const userRef = doc(db, collections.users, user.uid);
  const snap = await getDoc(userRef);
  const current = snap.data()?.username || null;

  const batch = writeBatch(db);
  if (current) batch.delete(doc(db, collections.usernames, current));
  batch.set(doc(db, collections.usernames, uname), { uid: user.uid, ts: serverTimestamp() });
  batch.set(userRef, { username: uname, updatedAt: serverTimestamp() }, { merge: true });
  await batch.commit();
  return uname;
}

export async function deleteAccount() {
  const u = auth.currentUser;
  if (!u) throw new Error("No hay sesión");
  const snap = await getDoc(doc(db, collections.users, u.uid));
  const uname = snap.data()?.username;
  const batch = writeBatch(db);
  if (uname) batch.delete(doc(db, collections.usernames, uname));
  batch.set(doc(db, collections.users, u.uid), { deletedAt: serverTimestamp() }, { merge: true });
  await batch.commit();
  await deleteUser(u);
}

export async function trackDownload({ fileId, fileName }) {
  const u = auth.currentUser;
  await addDoc(collection(db, collections.downloads), {
    fileId, fileName: fileName || null,
    uid: u ? u.uid : null, ts: serverTimestamp(), type: "download"
  });
}
