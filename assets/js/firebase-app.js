import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, deleteUser,
  sendPasswordResetEmail, updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, serverTimestamp, getDoc, writeBatch,
  addDoc, collection, deleteDoc, getDocs, query, where, orderBy, limit
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
  return onAuthStateChanged(auth, (user) => {
    cb(user);
    if (user) {
      upsertUserProfile(user).catch(console.error);
    }
  });
}

export async function setDisplayName(name){
  if(!auth.currentUser) throw new Error("No hay sesión");
  await updateProfile(auth.currentUser, { displayName: name });
  await upsertUserProfile(auth.currentUser);
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

function key(uid, type, id){
  return `${uid}_${type}_${id}`;
}

export async function toggleLike({contentType, contentId, title}) {
  if (!auth.currentUser) throw new Error("Inicia sesión");
  const id = key(auth.currentUser.uid, contentType, contentId);
  const ref = doc(db, collections.likes || "likes", id);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await deleteDoc(ref);
    return { liked: false };
  }
  await setDoc(ref, {
    uid: auth.currentUser.uid,
    contentType,
    contentId,
    title: title || null,
    liked: true,
    ts: serverTimestamp()
  });
  return { liked: true };
}

export async function toggleSave({contentType, contentId, title}) {
  if (!auth.currentUser) throw new Error("Inicia sesión");
  const id = key(auth.currentUser.uid, contentType, contentId);
  const ref = doc(db, collections.saves || "saves", id);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    await deleteDoc(ref);
    return { saved: false };
  }
  await setDoc(ref, {
    uid: auth.currentUser.uid,
    contentType,
    contentId,
    title: title || null,
    ts: serverTimestamp()
  });
  return { saved: true };
}

export async function setRating({contentType, contentId, rating, title}) {
  if (!auth.currentUser) throw new Error("Inicia sesión");
  const id = key(auth.currentUser.uid, contentType, contentId);
  const value = Math.max(1, Math.min(5, rating | 0));
  await setDoc(doc(db, collections.ratings || "ratings", id), {
    uid: auth.currentUser.uid,
    contentType,
    contentId,
    rating: value,
    title: title || null,
    ts: serverTimestamp()
  }, { merge: true });
  return { rating: value };
}

function toMillis(ts){
  if (!ts) return 0;
  if (typeof ts.toMillis === "function") return ts.toMillis();
  if (typeof ts === "number") return ts;
  return 0;
}

function buildFavoriteKey(contentType, contentId){
  return `${contentType || "unknown"}::${contentId || ""}`;
}

export async function listFavorites({ limit: maxItems = 50 } = {}) {
  if (!auth.currentUser) throw new Error("Inicia sesión");
  const userId = auth.currentUser.uid;
  const cap = Math.max(1, Math.min(200, Number(maxItems) || 50));

  const likesQuery = query(
    collection(db, collections.likes || "likes"),
    where("uid", "==", userId),
    orderBy("ts", "desc"),
    limit(cap)
  );

  const ratingsQuery = query(
    collection(db, collections.ratings || "ratings"),
    where("uid", "==", userId),
    orderBy("ts", "desc"),
    limit(cap)
  );

  const [likesSnap, ratingsSnap] = await Promise.all([
    getDocs(likesQuery).catch((err) => { console.error(err); return { forEach: () => {} }; }),
    getDocs(ratingsQuery).catch((err) => { console.error(err); return { forEach: () => {} }; })
  ]);

  const entries = new Map();

  const ensureEntry = (data) => {
    const keyValue = buildFavoriteKey(data.contentType, data.contentId);
    if (!entries.has(keyValue)) {
      entries.set(keyValue, {
        contentType: data.contentType || "",
        contentId: data.contentId || "",
        title: data.title || data.contentId || "",
        liked: false,
        saved: false,
        rating: null,
        lastInteraction: 0
      });
    }
    return entries.get(keyValue);
  };

  likesSnap.forEach((docSnap) => {
    const data = docSnap.data && docSnap.data();
    if (!data) return;
    const entry = ensureEntry(data);
    entry.liked = true;
    entry.saved = true;
    entry.lastInteraction = Math.max(entry.lastInteraction, toMillis(data.ts));
  });

  ratingsSnap.forEach((docSnap) => {
    const data = docSnap.data && docSnap.data();
    if (!data) return;
    const entry = ensureEntry(data);
    if (typeof data.rating === "number") {
      entry.rating = data.rating;
    }
    if (data.title && !entry.title) {
      entry.title = data.title;
    }
    entry.lastInteraction = Math.max(entry.lastInteraction, toMillis(data.ts));
  });

  return Array.from(entries.values())
    .filter((item) => item.contentId)
    .sort((a, b) => b.lastInteraction - a.lastInteraction)
    .slice(0, cap);
}

export async function sendReport({message, context}) {
  const u = auth.currentUser;
  await addDoc(collection(db, collections.reports || "reports"), {
    message,
    context: context || null,
    uid: u ? u.uid : null,
    ts: serverTimestamp(),
    type: "report"
  });
}

export function requireAuth(openLoginModal){
  if (auth.currentUser) return true;
  if (typeof openLoginModal === "function") openLoginModal();
  return false;
}
