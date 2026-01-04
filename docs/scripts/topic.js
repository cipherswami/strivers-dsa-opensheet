/**
 * File         : docs/scripts/topic.js
 * Description  : Topic page logic (render + progress updates)
 */

import { fetchJSON, getProblemStatus, setProblemStatus } from "./main.js";

(async function () {
  const params = new URLSearchParams(window.location.search);
  const topicFile = params.get("topic");

  if (!topicFile) {
    console.error("Missing topic file in URL");
    return;
  }

  document.title = `Strivers OpenSheet | ${topicFile}`;

  let topicData;
  try {
    topicData = await fetchJSON(`data/topics/${topicFile}.json`);
  } catch (e) {
    console.error("Failed to load topic file", e);
    return;
  }

  const topicId = topicData["topic-id"];
  if (topicId === undefined) {
    console.error("topic-id missing in topic JSON");
    return;
  }

  const titleEl = document.getElementById("topic-title");
  const tbody = document.getElementById("topic-table-body");

  if (!titleEl || !tbody) return;

  tbody.innerHTML = "";

  const total = topicData.problems.length;

  /* ---------- Initial progress from cache ---------- */
  let done = Number(localStorage.getItem(`topic-progress:${topicId}`)) || 0;

  titleEl.innerHTML = `
    ${topicData.title}
    <span class="progress">(${done} / ${total})</span>
  `;

  const progressEl = titleEl.querySelector(".progress");

  /* ---------- Render problems ---------- */
  for (const problem of topicData.problems) {
    const problemId = problem["problem-id"];
    const completed = getProblemStatus(topicId, problemId);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${problem.name}</td>
      <td>${renderLink(problem.video)}</td>
      <td>${renderLink(problem.resource)}</td>
      <td>${renderLink(problem.reference)}</td>
      <td>${renderLink(problem.practice)}</td>
      <td>
        <span class="badge ${problem.difficulty.toLowerCase()}">
          ${problem.difficulty}
        </span>
      </td>
      <td>
        <input type="checkbox" ${completed ? "checked" : ""} />
      </td>
    `;

    const checkbox = tr.querySelector("input");

    checkbox.addEventListener("change", () => {
      const checked = checkbox.checked;
      const prev = getProblemStatus(topicId, problemId);

      if (prev === checked) return;

      setProblemStatus(topicId, problemId, checked);

      done += checked ? 1 : -1;
      progressEl.textContent = `(${done} / ${total})`;

      localStorage.setItem(`topic-progress:${topicId}`, done);
    });

    tbody.appendChild(tr);
  }
})();

/* ---------- Helpers ---------- */
function renderLink(obj) {
  if (!obj || !obj.url) return "-";
  return `<a href="${obj.url}" target="_blank" rel="noopener">
    ${obj.label || "Link"}
  </a>`;
}
