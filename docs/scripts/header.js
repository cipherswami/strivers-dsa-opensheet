/**
 * File         : docs/scripts/header.js
 * Description  : Header user menu logic (Guest / Google login)
 */

import { showToast } from "./main.js";
import { auth } from "./firebase.js";
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ---------- DOM ---------- */
const userMenu = document.getElementById("userMenu");
const userBtn = document.getElementById("userBtn");
const dropdown = document.getElementById("dropdown");
const authBtn = document.getElementById("authBtn");
const settingsBtn = document.getElementById("settingsBtn");

/* ---------- Open Dropdown ---------- */
userBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("hidden");
});

/* ---------- Close Dropdown ---------- */
document.addEventListener("click", (e) => {
  if (!userMenu.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
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
