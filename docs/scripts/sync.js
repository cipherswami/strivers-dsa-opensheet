/**
 * File         : docs/scripts/sync.js
 * Description  : Handels the sync logic.
 */

import { auth, db } from "./firebase.js";
import { computeLocalHash, setPostToast } from "./main.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDoc,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ---------- DOM ---------- */
const userName = document.getElementById("userName");
const userPic = document.getElementById("userPic");
const authBtn = document.getElementById("authBtn");

/* ---------- Auth state ---------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    /* ---------- Guest UI ---------- */
    const displayName = localStorage.getItem("displayName");
    if (displayName) {
      userName.textContent = displayName;
    }
    return;
  }

  /* ---------- Logged-in UI ---------- */
  try {
    userName.textContent = user.displayName || "Striver Jr";
    userPic.src = user.photoURL || "assets/guest.png";
    authBtn.textContent = "Logout";
  } catch (e) {
    console.error(e);
  }

  /* ---------- Sync Guard: run sync once per session ---------- */
  if (sessionStorage.getItem("SYNC_ONCE")) return;
  sessionStorage.setItem("SYNC_ONCE", true);

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  /* ------------- Stage Guard: run sync only if data changes */
  const localHash = localStorage.getItem("meta:syncHash");
  const cloudHash = snap.exists() ? snap.data()?.["meta:syncHash"] : null;
  if (localHash && cloudHash === localHash) return;

  /* ---------- SYNC: cloud ⇄ local (ONCE PER LOGIN) ---------- */
  try {
    /* 1. Fetch cloud problem-status */
    const cloudStatus = {};
    if (snap.exists()) {
      const data = snap.data();
      for (const key in data) {
        if (key.startsWith("problem-status:") && data[key] === true) {
          cloudStatus[key] = true;
        }
      }
    }

    /* 2. Push local problem-status to cloud */
    const localPayload = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("problem-status:")) {
        localPayload[key] = true;
      }
    }

    if (Object.keys(localPayload).length) {
      await setDoc(ref, localPayload, { merge: true });
    }

    /* 3. Merge cloud into local */
    for (const key in cloudStatus) {
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, "true");
      }
    }

    /* 4. Compute topic-progress from local */
    const topicDone = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key.startsWith("problem-status:")) continue;

      const [, topicId] = key.split(":");
      topicDone[topicId] = (topicDone[topicId] || 0) + 1;
    }

    /* 5. Push topic-progress to cloud */
    const progressPayload = {};
    for (const topicId in topicDone) {
      const k = `topic-progress:${topicId}`;
      progressPayload[k] = topicDone[topicId];
      localStorage.setItem(k, String(topicDone[topicId]));
    }

    if (Object.keys(progressPayload).length) {
      await setDoc(ref, progressPayload, { merge: true });
    }

    /* 6. Push syncHash to cloud */
    const newHash = await computeLocalHash();
    localStorage.setItem("meta:syncHash", newHash);
    await setDoc(ref, { "meta:syncHash": newHash }, { merge: true });

    // To update UI
    setPostToast("SYNC Successful", "success");
    location.reload();
  } catch (err) {
    console.error("Sync failed:", err);
  }
});
