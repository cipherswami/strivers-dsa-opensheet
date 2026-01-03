import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  updateProfile,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { showToast } from "./main.js";

const email = document.getElementById("email");
const displayName = document.getElementById("displayName");
const saveName = document.getElementById("saveName");
const deleteAccountBtn = document.getElementById("deleteAccount");

let currentUser = null;

/* ---------- Auth guard ---------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  email.textContent = user.email;
  displayName.value = user.displayName || "";
});

/* ---------- Update display name ---------- */
saveName.onclick = async () => {
  if (!currentUser) return;

  const name = displayName.value.trim();
  if (!name) {
    showToast("Display name cannot be empty", "error");
    return;
  }

  try {
    await updateProfile(currentUser, { displayName: name });
    showToast("Display name updated", "success");
  } catch (e) {
    console.error(e);
    showToast(e.message || "Failed to update display name", "error");
  }
};

/* ---------- Delete account ---------- */
deleteAccountBtn.onclick = async () => {
  if (!currentUser) return;

  const ok = confirm(
    "This will permanently delete your account.\nThis cannot be undone."
  );

  if (!ok) return;

  try {
    await deleteUser(currentUser);
    showToast("Account deleted", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (e) {
    console.error(e);
    showToast(e.message || "Failed to delete account", "error");
  }
};
