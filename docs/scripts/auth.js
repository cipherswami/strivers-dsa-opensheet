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
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const userMenu = document.getElementById("userMenu");
const userBtn = document.getElementById("userBtn");
const dropdown = document.getElementById("dropdown");
const logoutBtn = document.getElementById("logoutBtn");
const settingsBtn = document.getElementById("settingsBtn");
const userName = document.getElementById("userName");
const userPic = document.getElementById("userPic");

/* ---- Login (popup) ---- */
loginBtn.onclick = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (e) {
    console.error(e);
    alert(e.message);
  }
};

/* ---- Dropdown ---- */
userBtn.onclick = () => {
  dropdown.classList.toggle("hidden");
};

document.addEventListener("click", (e) => {
  if (!userMenu.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

/* ---- Logout ---- */
logoutBtn.onclick = async () => {
  await signOut(auth);
};

/* ---- Settings ---- */
settingsBtn.onclick = () => {
  window.location.href = "settings.html";
};

/* ---- Sync helper ---- */
async function syncFromCloud(user) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const data = snap.data().progress || {};
  for (const key in data) {
    localStorage.setItem(key, data[key] ? "true" : "false");
  }
}

/* ---- Auth state (SINGLE source of truth) ---- */
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // UI
    loginBtn.classList.add("hidden");
    userMenu.classList.remove("hidden");
    userName.textContent = user.displayName || "User";
    userPic.src = user.photoURL || "";

    // 🔒 reload guard
    const alreadySynced = sessionStorage.getItem("synced-after-login");

    if (!alreadySynced) {
      try {
        await syncFromCloud(user);
        sessionStorage.setItem("synced-after-login", "true");
        window.location.reload();
      } catch (err) {
        console.error("Firestore sync failed", err);
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
