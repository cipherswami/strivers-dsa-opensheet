/**
 * File         : docs/scripts/header.js
 * Description  : Header user menu logic (Guest / Google login)
 */

import { showToast } from "./main.js";
import { auth } from "./firebase.js";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getDoc,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.js";

/* ---------- DOM ---------- */
const userMenu = document.getElementById("userMenu");
const userBtn = document.getElementById("userBtn");
const userName = document.getElementById("userName");
const userPic = document.getElementById("userPic");
const dropdown = document.getElementById("dropdown");
const authBtn = document.getElementById("authBtn");
const settingsBtn = document.getElementById("settingsBtn");

/* ---------- session guard key ---------- */
const SYNC_KEY = "auth-sync-done";

/* ---------- Dropdown toggle ---------- */
userBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("hidden");
});

/* ---------- Click outside to close ---------- */
document.addEventListener("click", (e) => {
  if (!userMenu.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

/* ---------- Settings ---------- */
settingsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.add("hidden");
  window.location.href = "settings.html";
});

/* ---------- Login / Logout ---------- */
authBtn.addEventListener("click", async (e) => {
  e.stopPropagation();
  dropdown.classList.add("hidden");

  try {
    if (auth.currentUser) {
      await signOut(auth);
      sessionStorage.removeItem(SYNC_KEY);
      showToast("Logged out successfully", "success");
    } else {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("Logged in successfully", "success");
    }
  } catch (err) {
    console.error(err);
    showToast("Auth failed", "error");
  }
});

/* ---------- Auth state ---------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    /* ---------- Guest UI ---------- */
    userName.textContent = localStorage.getItem("displayName") || "Guest User";
    userPic.src = "assets/guest.png";
    authBtn.textContent = "Login";
    sessionStorage.removeItem(SYNC_KEY);
    return;
  }

  /* ---------- Logged-in UI ---------- */
  userName.textContent = user.displayName || "Striver Jr";
  userPic.src = user.photoURL || "assets/guest.png";
  authBtn.textContent = "Logout";

  /* ---------- Guard: run sync once per session ---------- */
  if (sessionStorage.getItem(SYNC_KEY)) return;
  sessionStorage.setItem(SYNC_KEY, "1");

  /* ---------- SYNC: cloud ⇄ local (ONCE PER LOGIN) ---------- */
  try {
    const ref = doc(db, "users", user.uid);

    /* 1. Fetch cloud problem-status */
    const snap = await getDoc(ref);
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

    // To update UI
    location.reload();
  } catch (err) {
    console.error("Login sync failed:", err);
  }
});

/* ---------- Escape key closes dropdown ---------- */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    dropdown.classList.add("hidden");
  }
});
