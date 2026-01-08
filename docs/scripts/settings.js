/**
 * File         : docs/scripts/settings.js
 * Description  : Settings page logic (guest + logged-in)
 */

import { auth, db } from "./firebase.js";
import { confirmAsync, setPostToast, showToast } from "./main.js";
import {
  onAuthStateChanged,
  updateProfile,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ---------- DOM ---------- */
const emailEl = document.getElementById("email");
const displayPic = document.getElementById("displayPic");
const displayNameInput = document.getElementById("displayName");
const saveNameBtn = document.getElementById("saveName");
const resetProgressBtn = document.getElementById("resetProgress");
const deleteAccountBtn = document.getElementById("deleteAccount");

/* ---------- State ---------- */
let currentUser = null;

/* ---------- POST TOAST --------- */
const postToast = sessionStorage.getItem("POST_TOAST");
if (postToast) {
  const { message, type } = JSON.parse(postToast);
  sessionStorage.removeItem("POST_TOAST");
  showToast(message, type);
}

/* ---------- Auth State ---------- */
onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (user) {
    emailEl.textContent = user.email;
    displayNameInput.value = user.displayName || "Strivers Jr";
    displayPic.src = user.photoURL || "assets/guest.png";
    deleteAccountBtn.style.display = "inline-block";
  } else {
    displayNameInput.value =
      localStorage.getItem("displayName") || "Guest User";
    deleteAccountBtn.style.display = "none";
  }
});

/* ---------- Display Name ---------- */
async function saveDisplayName() {
  const newName = displayNameInput.value.trim();

  if (!newName) {
    showToast("Display name cannot be empty", "error");
    return;
  }

  /* Logged-in user → Firebase */
  if (currentUser) {
    if (newName === currentUser.displayName) {
      showToast("Display name unchanged", "info");
      return;
    }

    try {
      await updateProfile(currentUser, { displayName: newName });
      showToast("Display name updated", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to update display name", "error");
    }
    return;
  }

  /* Guest → localStorage */
  if (newName === localStorage.getItem("displayName")) {
    showToast("Display name unchanged", "info");
    return;
  }

  localStorage.setItem("displayName", newName);
  showToast("Display name updated", "success");
}

/* Save via button */
saveNameBtn.addEventListener("click", saveDisplayName);

/* Save via Enter */
displayNameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    saveDisplayName();
  }
});

/* ---------- Danger Zone ---------- */

/* Reset progress */
resetProgressBtn.addEventListener("click", async () => {
  const ok = await confirmAsync(
    "This will erase ALL progress. This action cannot be undone, Continue?"
  );

  if (!ok) return;

  try {
    if (currentUser) {
      await deleteDoc(doc(db, "users", currentUser.uid));
    }
    localStorage.clear();
    setPostToast("Progress nuked successfully", "info");
    window.location.href = "settings.html";
  } catch (err) {
    console.error(err);
    showToast("Failed to reset progress", "error");
  }
});

/* Delete account (logged-in only) */
deleteAccountBtn.addEventListener("click", async () => {
  if (!currentUser) return;

  const ok = await confirmAsync(
    "This will permanently delete your account.\n\nThis CANNOT be undone, Continue?"
  );

  if (!ok) return;

  try {
    await deleteDoc(doc(db, "users", currentUser.uid));
    await deleteUser(currentUser);
    localStorage.clear();
    setPostToast("Account deleted", "info");
    window.location.href = "index.html";
  } catch (err) {
    console.error(err);
    showToast("Deletion failed. Please sign out and sign in again.", "error");
  }
});
