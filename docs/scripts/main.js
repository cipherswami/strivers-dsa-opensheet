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
