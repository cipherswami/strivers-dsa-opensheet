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
  return `progress:${topicId}:${problemId}`;
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

// Register the service worker to enable offline support, caching,
// and background updates (must be a separate file: /sw.js)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
