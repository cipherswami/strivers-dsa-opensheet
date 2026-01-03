/**
 * File: scripts/main.js
 */

export async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return res.json();
}

export function progressKey(topicId, problemId) {
  return `${topicId}:${problemId}`;
}

export function isCompleted(topicId, problemId) {
  return localStorage.getItem(progressKey(topicId, problemId)) === "true";
}

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

  // animate in
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // auto-remove
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
