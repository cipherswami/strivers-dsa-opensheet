// scripts/main.js

/**
 * Safely fetch JSON.
 */
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }
  return res.json();
}

/**
 * Get progress status key for a problem.
 */
function progressKey(topicId, problemId) {
  return `${topicId}:${problemId}`;
}

/**
 * Check if a problem is completed.
 */
function isCompleted(topicId, problemId) {
  return localStorage.getItem(progressKey(topicId, problemId)) === "true";
}
