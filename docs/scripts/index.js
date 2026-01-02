// scripts/index.js

(async function () {
  const tableBody = document.querySelector(".topics-table tbody");
  const progressEl = document.getElementById("overall-progress");

  if (!tableBody || !progressEl) return;

  let topics;
  try {
    topics = await fetchJSON("data/topics.json");
  } catch (err) {
    console.error(err);
    return;
  }

  let globalDone = 0;
  let globalTotal = 0;

  for (const topic of topics) {
    let problems = [];

    try {
      problems = await fetchJSON(`data/${topic.id}.json`);
    } catch {
      problems = [];
    }

    const total = problems.length;
    let done = 0;

    for (const p of problems) {
      if (isCompleted(topic.id, p.id)) {
        done++;
      }
    }

    globalDone += done;
    globalTotal += total;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>
        <a href="topic.html?topic=${topic.id}">
          ${topic.name}
        </a>
      </td>
      <td class="count">
        ${done} / ${total}
      </td>
    `;

    tableBody.appendChild(tr);
  }

  progressEl.textContent = `(${globalDone} / ${globalTotal})`;
})();
