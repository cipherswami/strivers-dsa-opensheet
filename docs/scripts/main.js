/**
 * File        : docs/scripts/main.js
 * Description : Common helpers.
 */

/**
 * Fetch and parse a JSON file.
 *
 * @param {string} path
 * @returns {Promise<any>}
 */
export async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return res.json();
}

/**
 * Build the localStorage key for problem progress.
 *
 * Format: progress:<topic-id>:<problem-id>
 *
 * @param {number|string} topicId
 * @param {number|string} problemId
 * @returns {string}
 */
export function problemProgressKey(topicId, problemId) {
  return `problem-status:${topicId}:${problemId}`;
}

/**
 * Check whether a problem is seen as completed.
 *
 * Completed if:
 *   localStorage[key] === "true"
 *
 * Missing key => not completed
 *
 * @param {number|string} topicId
 * @param {number|string} problemId
 * @returns {boolean}
 */
export function getProblemStatus(topicId, problemId) {
  return (
    localStorage.getItem(problemProgressKey(topicId, problemId)) === "true"
  );
}

/**
 * Mark a problem as completed or not completed.
 *
 * @param {number|string} topicId
 * @param {number|string} problemId
 * @param {boolean} value
 */
export function setProblemStatus(topicId, problemId, value) {
  const key = problemProgressKey(topicId, problemId);

  if (value) {
    localStorage.setItem(key, "true");
  } else {
    localStorage.removeItem(key);
  }
}

/**
 * Computes hash based on local storage data.
 */
export async function computeLocalHash() {
  const entries = [];

  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith("problem-status:") || k.startsWith("topic-progress:")) {
      entries.push(`${k}=${localStorage.getItem(k)}`);
    }
  }

  entries.sort();

  const data = entries.join("|");
  const encoder = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", encoder.encode(data));

  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Show a toast notification.
 *
 * @param {string} message
 * @param {"info"|"success"|"error"} [type="info"]
 */
export function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");

  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Show a confirm dialog.
 *
 * @param {string} message
 * @returns {Promise<boolean>}
 */
export async function confirmAsync(message) {
  return new Promise((resolve) => {
    /* ---------- Overlay ---------- */
    const overlay = document.createElement("div");
    overlay.className = "confirm-overlay";

    /* ---------- Box ---------- */
    const box = document.createElement("div");
    box.className = "confirm-box";

    /* ---------- Text ---------- */
    const text = document.createElement("p");
    text.textContent = message;

    /* ---------- Actions ---------- */
    const actions = document.createElement("div");
    actions.className = "confirm-actions";

    const yesBtn = document.createElement("button");
    yesBtn.textContent = "Yes";
    yesBtn.className = "confirm-yes";

    const noBtn = document.createElement("button");
    noBtn.textContent = "Cancel";
    noBtn.className = "confirm-no";

    actions.appendChild(yesBtn);
    actions.appendChild(noBtn);

    box.appendChild(text);
    box.appendChild(actions);
    overlay.appendChild(box);
    document.body.appendChild(overlay);

    /* ---------- Animate in ---------- */
    requestAnimationFrame(() => {
      overlay.classList.add("show");
    });

    /* ---------- Cleanup helper ---------- */
    const cleanup = (result) => {
      overlay.classList.remove("show");
      setTimeout(() => overlay.remove(), 200);
      resolve(result);
    };

    /* ---------- Events ---------- */
    yesBtn.onclick = () => cleanup(true);
    noBtn.onclick = () => cleanup(false);

    overlay.onclick = (e) => {
      if (e.target === overlay) cleanup(false);
    };

    document.addEventListener(
      "keydown",
      function escHandler(e) {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", escHandler);
          cleanup(false);
        }
      },
      { once: true }
    );
  });
}

/**
 * Queue a toast to be shown on the next page load.
 *
 * @param {string} message
 * @param {"info"|"success"|"error"} type
 */
export function setPostToast(message, type = "info") {
  sessionStorage.setItem("POST_TOAST", JSON.stringify({ message, type }));
}
