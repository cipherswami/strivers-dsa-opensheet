import { auth, db } from "./firebase.js";
import {
  onAuthStateChanged,
  updateProfile,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
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

/* ---------- Delete account + data ---------- */
deleteAccountBtn.onclick = async () => {
  if (!currentUser) return;

  const ok = confirm(
    "This will permanently delete your account AND all your data.\nThis cannot be undone."
  );

  if (!ok) return;

  try {
    // 1️⃣ delete Firestore user data FIRST
    await deleteDoc(doc(db, "users", currentUser.uid));

    // 2️⃣ delete auth account
    await deleteUser(currentUser);

    showToast("Account and data deleted", "success");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1000);
  } catch (e) {
    console.error(e);
    showToast(e.message || "Failed to delete account", "error");
  }
};
