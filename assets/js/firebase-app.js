import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, GoogleAuthProvider,
  signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, deleteUser,
  sendPasswordResetEmail, updateProfile, setPersistence,
  browserLocalPersistence, inMemoryPersistence
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, setDoc, serverTimestamp, getDoc, writeBatch,
  addDoc, collection, deleteDoc, getDocs, query, where, orderBy, limit,
  runTransaction, increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig, collections } from "/static/config/firebase.config.js";

const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);

setPersistence(auth, browserLocalPersistence)
  .catch(() => setPersistence(auth, inMemoryPersistence))
  .catch((error) => console.warn("No se pudo fijar persistencia de sesión", error));

const google = new GoogleAuthProvider();

export const loginWithGoogle = () => signInWithPopup(auth, google);
export const loginEmailPass  = (email, pass) => signInWithEmailAndPassword(auth, email, pass);
export const registerEmailPass = (email, pass) => createUserWithEmailAndPassword(auth, email, pass);
export const logout = () => signOut(auth);
export const resetPassword = (email) => sendPasswordResetEmail(auth, email);

async function upsertUserProfile(user) {
  const userRef = doc(db, collections.users, user.uid);
  const existingSnap = await getDoc(userRef).catch(() => null);
  const existingData = existingSnap && existingSnap.exists() ? existingSnap.data() || {} : {};
  const payload = {
    uid: user.uid,
    email: user.email || null,
    displayName: user.displayName || null,
    photoURL: user.photoURL || null,
    username: existingData.username || null,
    providerIds: user.providerData.map(p => p.providerId),
    updatedAt: serverTimestamp(),
  };

  if (existingData.createdAt) {
    payload.createdAt = existingData.createdAt;
  } else {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(userRef, payload, { merge: true });
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
  const likeRef = doc(db, collections.likes || "likes", id);
  const saveRef = doc(db, collections.saves || "saves", id);
  let existing = null;
  try {
    existing = await getDoc(likeRef);
  } catch (error) {
    console.warn("No se pudo verificar el estado del like", error);
  }
  if (existing && typeof existing.exists === "function" && existing.exists()) {
    const batch = writeBatch(db);
    batch.delete(likeRef);
    const saveSnap = await getDoc(saveRef).catch(() => null);
    if (saveSnap && typeof saveSnap.exists === "function" && saveSnap.exists()) {
      batch.delete(saveRef);
    }
    await batch.commit();
    return { liked: false };
  }
  const batch = writeBatch(db);
  batch.set(likeRef, {
    uid: auth.currentUser.uid,
    contentType,
    contentId,
    title: title || null,
    liked: true,
    saved: true,
    ts: serverTimestamp()
  });
  batch.set(saveRef, {
    uid: auth.currentUser.uid,
    contentType,
    contentId,
    title: title || null,
    ts: serverTimestamp()
  });
  await batch.commit();
  return { liked: true };
}

export async function toggleSave({contentType, contentId, title}) {
  if (!auth.currentUser) throw new Error("Inicia sesión");
  const id = key(auth.currentUser.uid, contentType, contentId);
  const ref = doc(db, collections.saves || "saves", id);
  let existing = null;
  try {
    existing = await getDoc(ref);
  } catch (error) {
    console.warn("No se pudo verificar el estado del guardado", error);
  }
  if (existing && typeof existing.exists === "function" && existing.exists()) {
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

function buildRatingStatsId(contentType, contentId){
  const safeType = (contentType || "content").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  const safeId = (contentId || "unknown").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  return `${safeType}::${safeId}`;
}

function buildEngagementKey(contentType, contentId){
  const safeType = (contentType || "content").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  const safeId = (contentId || "unknown").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  return `${safeType}::${safeId}`;
}

function getUserSnapshot(){
  const u = auth.currentUser;
  if (!u) return { uid: null };
  return {
    uid: u.uid,
    email: u.email || null,
    displayName: u.displayName || null
  };
}

export async function setRating({contentType, contentId, rating, title}) {
  if (!auth.currentUser) throw new Error("Inicia sesión");
  const id = key(auth.currentUser.uid, contentType, contentId);
  const value = Math.max(1, Math.min(5, rating | 0));
  const ratingRef = doc(db, collections.ratings || "ratings", id);
  const statsRef = doc(db, collections.ratingStats || "ratingStats", buildRatingStatsId(contentType, contentId));
  const userProfile = {
    displayName: auth.currentUser?.displayName || null,
    email: auth.currentUser?.email || null
  };

  await runTransaction(db, async (transaction) => {
    const ratingSnap = await transaction.get(ratingRef);
    const previousRating = ratingSnap.exists() ? Number(ratingSnap.data()?.rating) || null : null;

    transaction.set(ratingRef, {
      uid: auth.currentUser.uid,
      contentType,
      contentId,
      rating: value,
      title: title || null,
      ...userProfile,
      ts: serverTimestamp()
    }, { merge: true });

    const statsSnap = await transaction.get(statsRef);
    const statsData = statsSnap.exists() ? statsSnap.data() || {} : {};
    let ratingCount = Number(statsData.ratingCount) || 0;
    let totalRating = Number(statsData.totalRating) || 0;

    if (typeof previousRating === "number") {
      totalRating -= previousRating;
    } else {
      ratingCount += 1;
    }

    totalRating += value;
    if (ratingCount < 0) ratingCount = 0;
    if (totalRating < 0) totalRating = 0;
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    const payload = {
      contentType,
      contentId,
      ratingCount,
      totalRating,
      averageRating,
      updatedAt: serverTimestamp()
    };

    if (!statsSnap.exists()) {
      payload.createdAt = serverTimestamp();
    }

    transaction.set(statsRef, payload, { merge: true });
  });

  return { rating: value };
}

export async function getFavoriteState({ contentType, contentId }) {
  const user = auth.currentUser;
  if (!user) {
    return { liked: false, rating: null };
  }
  const id = key(user.uid, contentType, contentId);
  const likeRef = doc(db, collections.likes || "likes", id);
  const ratingRef = doc(db, collections.ratings || "ratings", id);

  const [likeSnap, ratingSnap] = await Promise.all([
    getDoc(likeRef).catch(() => null),
    getDoc(ratingRef).catch(() => null)
  ]);

  const likeExists = !!(likeSnap && typeof likeSnap.exists === "function" && likeSnap.exists());
  let ratingValue = null;
  if (ratingSnap && typeof ratingSnap.exists === "function" && ratingSnap.exists()) {
    const data = typeof ratingSnap.data === "function" ? ratingSnap.data() : null;
    if (data && typeof data.rating === "number") {
      ratingValue = Number(data.rating);
    }
  }

  return {
    liked: likeExists,
    rating: ratingValue
  };
}

export async function getRatingSummary({ contentType, contentId }) {
  const ref = doc(db, collections.ratingStats || "ratingStats", buildRatingStatsId(contentType, contentId));
  const snap = await getDoc(ref).catch(() => null);
  if (!snap || typeof snap.exists !== "function" || !snap.exists()) {
    return { ratingCount: 0, averageRating: 0, totalRating: 0 };
  }
  const data = typeof snap.data === "function" ? snap.data() || {} : {};
  return {
    ratingCount: Number(data.ratingCount) || 0,
    averageRating: Number(data.averageRating) || 0,
    totalRating: Number(data.totalRating) || 0
  };
}

export async function recordEngagement({ contentType, contentId, title, action = "click" }) {
  if (!contentId) return;
  const ref = doc(db, collections.engagement || "engagement", buildEngagementKey(contentType, contentId));
  const counters = action === "search" ? { searchCount: increment(1) } : { interactionCount: increment(1) };
  await setDoc(ref, {
    contentType: contentType || "content",
    contentId,
    title: title || null,
    updatedAt: serverTimestamp(),
    ...counters,
    ...getUserSnapshot(),
    createdAt: serverTimestamp()
  }, { merge: true });
}

export async function recordSearch({ term, filters, matches = [] }) {
  const payload = {
    term: (term || "").trim().slice(0, 120),
    filters: filters || {},
    results: matches.slice(0, 50),
    totalResults: matches.length,
    ...getUserSnapshot(),
    ts: serverTimestamp(),
    type: "search"
  };
  await addDoc(collection(db, collections.searches || "searches"), payload);
  if (matches.length) {
    const top = matches.slice(0, 10);
    await Promise.all(top.map((id) => recordEngagement({ contentType: filters?.contentType || "game", contentId: id, action: "search" }))).catch(console.error);
  }
}

export async function fetchEngagementStats(items = []) {
  const entries = Array.isArray(items) ? items : [];
  const results = {};
  await Promise.all(entries.map(async (item) => {
    if (!item || !item.contentId) return;
    const ref = doc(db, collections.engagement || "engagement", buildEngagementKey(item.contentType, item.contentId));
    const snap = await getDoc(ref).catch(() => null);
    if (!snap || typeof snap.exists !== "function" || !snap.exists()) return;
    const data = typeof snap.data === "function" ? snap.data() || {} : {};
    results[item.contentId] = {
      interactionCount: Number(data.interactionCount) || 0,
      searchCount: Number(data.searchCount) || 0
    };
  }));
  return results;
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

  const savesQuery = query(
    collection(db, collections.saves || "saves"),
    where("uid", "==", userId),
    orderBy("ts", "desc"),
    limit(cap)
  );

  const [likesSnap, ratingsSnap, savesSnap] = await Promise.all([
    getDocs(likesQuery).catch((err) => { console.error(err); return { forEach: () => {} }; }),
    getDocs(ratingsQuery).catch((err) => { console.error(err); return { forEach: () => {} }; }),
    getDocs(savesQuery).catch((err) => { console.error(err); return { forEach: () => {} }; })
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

  savesSnap.forEach((docSnap) => {
    const data = docSnap.data && docSnap.data();
    if (!data) return;
    const entry = ensureEntry(data);
    entry.saved = true;
    entry.lastInteraction = Math.max(entry.lastInteraction, toMillis(data.ts));
    if (data.title && !entry.title) {
      entry.title = data.title;
    }
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
