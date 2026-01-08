/**
 * File         : docs/scripts/index.js
 * Description  : Index page logic.
 */

/* Imports */
import { fetchJSON, computeLocalHash, showToast } from "./main.js";
import { auth } from "./firebase.js";
import {
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* DOM */
const userBtn = document.getElementById("userBtn");
const dropdown = document.getElementById("dropdown");
const authBtn = document.getElementById("authBtn");
const settingsBtn = document.getElementById("settingsBtn");
const userName = document.getElementById("userName");
const userPic = document.getElementById("userPic");
const overallProgress = document.getElementById("overall-progress");
const topicsBody = document.getElementById("topics-body");

(async function initIndex() {
  /**
   * Create topics table and update the status accordingly.
   */
  // Global vars
  let globalDone = 0;
  let globalTotal = 0;
  const topics = await fetchJSON("data/topics.json");

  for (const topic of topics) {
    // Topic vars
    const topicId = topic["topic-id"];
    const topicFile = topic["file"];
    const topicTitle = topic["title"];
    const topicTotal = topic["total"];

    // Get topic progress from local
    const topicProgress =
      Number(localStorage.getItem(`topic-progress:${topicId}`)) || 0;

    // Update vars
    globalDone += topicProgress;
    globalTotal += topicTotal;

    // Link (with hover prefetch)
    const tr = document.createElement("tr");
    const link = document.createElement("a");
    link.href = `topic.html?topic=${encodeURIComponent(topicFile)}`;
    link.textContent = topicTitle;

    // Prefetch topic JSON on hover
    link.addEventListener(
      "mouseenter",
      () => {
        fetch(`data/topics/${topicFile}.json`, {
          cache: "force-cache",
        }).catch(() => {});
      },
      { once: true }
    );

    const tdTitle = document.createElement("td");
    tdTitle.appendChild(link);

    const tdCount = document.createElement("td");
    tdCount.className = "count";
    tdCount.innerHTML = `
    <span class="done">${topicProgress}</span> /
    <span class="total">${topicTotal}</span>
  `;

    tr.appendChild(tdTitle);
    tr.appendChild(tdCount);
    topicsBody.appendChild(tr);
  }

  // Update the progress UI
  overallProgress.textContent = `(${globalDone} / ${globalTotal})`;
})();

/* Open dropdown */
userBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown.classList.toggle("hidden");
});

/* Close dropdown */
document.addEventListener("click", (e) => {
  if (!dropdown.classList.contains("hidden")) {
    dropdown.classList.add("hidden");
  }
});

/* Close dropdown with ESC */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    dropdown.classList.add("hidden");
  }
});

/* Settings Btn*/
settingsBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  dropdown?.classList.add("hidden");
  window.location.href = "settings.html";
});

/* Login or Logout */
authBtn.addEventListener("click", async (e) => {
  e.stopPropagation();
  dropdown?.classList.add("hidden");
  try {
    if (auth.currentUser) {
      await signOut(auth);
      userName.textContent = "Guest User";
      userPic.src = "assets/guest.png";
      authBtn.textContent = "Login";
      sessionStorage.removeItem("SYNC_ONCE");
      showToast("Logout successful", "success");
    } else {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      showToast("Login successful", "success");
    }
  } catch (err) {
    console.error("Auth error:", err);
    showToast("Authentication failed", "error");
  }
});

/**
 * Compute meta:syncHash if Not exists in the
 * local storage.
 */
if (!localStorage.getItem("meta:syncHash")) {
  const localHash = await computeLocalHash();
  localStorage.setItem("meta:syncHash", localHash);
}

/**
 * POST Toast message.
 */
const postToast = sessionStorage.getItem("POST_TOAST");
if (postToast) {
  const { message, type } = JSON.parse(postToast);
  sessionStorage.removeItem("POST_TOAST");
  showToast(message, type);
}
