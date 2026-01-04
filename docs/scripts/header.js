/**
 * File         : docs/scripts/auth.js
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

/* ---------- DOM ---------- */
const userMenu = document.getElementById("userMenu");
const userBtn = document.getElementById("userBtn");
const userName = document.getElementById("userName");
const userPic = document.getElementById("userPic");
const dropdown = document.getElementById("dropdown");
const authBtn = document.getElementById("authBtn");
const settingsBtn = document.getElementById("settingsBtn");

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

  if (auth.currentUser) {
    try {
      await signOut(auth);
      showToast("Logged out", "info");
    } catch (err) {
      console.error(err);
      showToast("Logout failed", "error");
    }
  } else {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("Logged in", "success");
    } catch (err) {
      console.error(err);
      showToast("Login failed", "error");
    }
  }
});

/* ---------- Auth state ---------- */
onAuthStateChanged(auth, (user) => {
  if (user) {
    userName.textContent = user.displayName || "Striver Jr";
    userPic.src = user.photoURL || "assets/guest.png";
    authBtn.textContent = "Logout";
  } else {
    userName.textContent = "Guest User";
    userPic.src = "assets/guest.png";
    authBtn.textContent = "Login";
  }
});

/* ---------- Escape key closes dropdown ---------- */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    dropdown.classList.add("hidden");
  }
});
