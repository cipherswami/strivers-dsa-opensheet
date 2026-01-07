/**
 * File         : docs/scripts/index.js
 * Description  : Runtime generation of index table using cached topic progress
 */

import { fetchJSON } from "./main.js";
import { computeLocalHash } from "./main.js";

(async function () {
  const overallProgress = document.getElementById("overall-progress");
  const topicsBody = document.getElementById("topics-body");

  if (!topicsBody || !overallProgress) return;

  let topics;
  try {
    topics = await fetchJSON("data/topics.json");
  } catch (e) {
    console.error("Failed to load topics.json", e);
    return;
  }

  let globalDone = 0;
  let globalTotal = 0;

  for (const topic of topics) {
    const topicId = topic["topic-id"];
    const file = topic.file;
    const title = topic.title;
    const total = topic.total;

    const done = Number(localStorage.getItem(`topic-progress:${topicId}`)) || 0;

    globalDone += done;
    globalTotal += total;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>
        <a href="topic.html?topic=${encodeURIComponent(file)}">
          ${title}
        </a>
      </td>
      <td class="count">
        <span class="done">${done}</span> /
        <span class="total">${total}</span>
      </td>
    `;

    topicsBody.appendChild(tr);
  }

  overallProgress.textContent = `(${globalDone} / ${globalTotal})`;

  /**
   * Compute Localhash if null.
   */
  if (!localStorage.getItem("meta:syncHash")) {
    const localHash = await computeLocalHash();
    localStorage.setItem("meta:syncHash", localHash);
  }
})();
