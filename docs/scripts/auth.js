/**
 * File         : docs/scripts/auth.js
 * Description  : auth logic.
 */

import { auth, provider, db } from "./firebase.js";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { showToast } from "./main.js";

const loginBtn = document.getElementById("loginBtn");
const userMenu = document.getElementById("userMenu");
const userBtn = document.getElementById("userBtn");
const dropdown = document.getElementById("dropdown");
const logoutBtn = document.getElementById("logoutBtn");
const settingsBtn = document.getElementById("settingsBtn");
const userName = document.getElementById("userName");
const userPic = document.getElementById("userPic");

/* ---------- Login ---------- */
loginBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error(e);
    showToast(e.message || "Login failed", "error");
  }
};

/* ---------- Dropdown ---------- */
userBtn.onclick = () => {
  dropdown.classList.toggle("hidden");
};

document.addEventListener("click", (e) => {
  if (!userMenu.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

/* ---------- Logout ---------- */
logoutBtn.onclick = async () => {
  try {
    await signOut(auth);
    showToast("Logged out", "info");
  } catch (e) {
    showToast("Logout failed", "error");
  }
};

/* ---------- Settings ---------- */
settingsBtn.onclick = () => {
  window.location.href = "settings.html";
};

/* ---------- Helpers ---------- */

function getLocalProgress() {
  const progress = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(":")) {
      progress[key] = localStorage.getItem(key) === "true";
    }
  }
  return progress;
}

async function syncAndMerge(user) {
  const ref = doc(db, "users", user.uid);

  const local = getLocalProgress();
  const snap = await getDoc(ref);
  const remote = snap.exists() ? snap.data().progress || {} : {};

  const merged = { ...local, ...remote };

  await setDoc(ref, { progress: merged }, { merge: true });

  for (const key in merged) {
    localStorage.setItem(key, merged[key] ? "true" : "false");
  }
}

/* ---------- Auth state (single listener) ---------- */

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // UI
    loginBtn.classList.add("hidden");
    userMenu.classList.remove("hidden");
    userName.textContent = user.displayName || "User";
    userPic.src = user.photoURL || "";

    // one-time sync per login
    const synced = sessionStorage.getItem("synced-after-login");

    if (!synced) {
      try {
        await syncAndMerge(user);
        sessionStorage.setItem("synced-after-login", "true");
        window.location.reload(); // single, intentional reload
      } catch (e) {
        console.error(e);
        showToast("Failed to sync progress", "error");
      }
    }
  } else {
    // logout cleanup
    sessionStorage.removeItem("synced-after-login");

    userMenu.classList.add("hidden");
    loginBtn.classList.remove("hidden");
    dropdown.classList.add("hidden");
  }
});
