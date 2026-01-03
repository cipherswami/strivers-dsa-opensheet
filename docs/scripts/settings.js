import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  updateProfile,
  deleteUser,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const email = document.getElementById("email");
const displayName = document.getElementById("displayName");
const saveName = document.getElementById("saveName");
const deleteAccountBtn = document.getElementById("deleteAccount");

let currentUser = null;

/* ---- Auth guard ---- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUser = user;
  email.textContent = user.email;
  displayName.value = user.displayName || "";
});

/* ---- Update display name ---- */
saveName.onclick = async () => {
  if (!currentUser) return;

  try {
    await updateProfile(currentUser, {
      displayName: displayName.value.trim(),
    });
    alert("Name updated");
  } catch (e) {
    alert(e.message);
  }
};

/* ---- Delete account ---- */
deleteAccountBtn.onclick = async () => {
  if (!currentUser) return;

  const ok = confirm(
    "This will permanently delete your account.\nThis cannot be undone."
  );

  if (!ok) return;

  try {
    await deleteUser(currentUser);
    alert("Account deleted");
    window.location.href = "index.html";
  } catch (e) {
    alert(e.message);
  }
};
