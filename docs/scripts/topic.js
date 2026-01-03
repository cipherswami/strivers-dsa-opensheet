/**
 * File         : docs/scripts/topic.js
 * Description  : Logic for topic page.
 */

import {
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth, db } from "./firebase.js";
import { fetchJSON, progressKey, isCompleted } from "./main.js";

/* ---------- Sync helper ---------- */

async function saveProgress(key, value) {
  localStorage.setItem(key, value ? "true" : "false");

  const user = auth.currentUser;
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  await setDoc(
    ref,
    {
      progress: {
        [key]: value,
      },
    },
    { merge: true }
  );
}

/* ---------- Params ---------- */

const params = new URLSearchParams(window.location.search);
const topicId = params.get("topic");

if (!topicId) {
  throw new Error("No topic specified");
}

/* ---------- Helpers ---------- */

function renderLink(obj) {
  if (!obj || !obj.url) return "-";
  return `<a href="${obj.url}" target="_blank" rel="noopener">
    ${obj.label || "Link"}
  </a>`;
}

/* ---------- Load problems ---------- */

fetchJSON(`data/${topicId}.json`)
  .then((problems) => {
    const tbody = document.getElementById("topic-table-body");
    if (!tbody) return;

    problems.forEach((p) => {
      const key = progressKey(topicId, p.id);
      const checked = isCompleted(topicId, p.id);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>${renderLink(p.video)}</td>
        <td>${renderLink(p.resource)}</td>
        <td>${renderLink(p.reference)}</td>
        <td>${renderLink(p.practice)}</td>
        <td>
          <span class="badge ${p.difficulty.toLowerCase()}">
            ${p.difficulty}
          </span>
        </td>
        <td>
          <input type="checkbox" ${checked ? "checked" : ""} />
        </td>
      `;

      const checkbox = tr.querySelector("input");
      checkbox.addEventListener("change", async (e) => {
        try {
          await saveProgress(key, e.target.checked);
        } catch (err) {
          console.error("Failed to sync progress", err);
        }
      });

      tbody.appendChild(tr);
    });
  })
  .catch((err) => console.error("Failed to load topic data", err));
