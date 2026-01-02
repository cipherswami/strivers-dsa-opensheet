// scripts/topic.js

const params = new URLSearchParams(window.location.search);
const topicId = params.get("topic");

if (!topicId) {
  document.getElementById("topic-title").innerText = "Invalid topic";
  document.title = "Strivers OpenSheet";
  throw new Error("No topic specified");
}

let topicTitle = topicId;

/* ---------- Helpers ---------- */

function renderLink(obj) {
  if (!obj || !obj.url) return "-";
  return `<a href="${obj.url}" target="_blank">${obj.label}</a>`;
}

function updateHeading(done, total) {
  const h1 = document.getElementById("topic-title");
  h1.innerHTML = `
    ${topicTitle}
    <span class="progress">(${done} / ${total})</span>
  `;
  document.title = `Strivers OpenSheet | ${topicTitle}`;
}

/* ---------- Load topic name ---------- */

fetchJSON("data/topics.json")
  .then((topics) => {
    const topic = topics.find((t) => t.id === topicId);
    topicTitle = topic ? topic.name : topicId;
  })
  .catch(console.error);

/* ---------- Load problems ---------- */

fetchJSON(`data/${topicId}.json`)
  .then((problems) => {
    const tbody = document.getElementById("topic-table-body");

    const total = problems.length;
    let done = 0;

    problems.forEach((p) => {
      const key = progressKey(topicId, p.id);
      const checked = isCompleted(topicId, p.id);
      if (checked) done++;

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
      checkbox.addEventListener("change", (e) => {
        localStorage.setItem(key, e.target.checked);
        done += e.target.checked ? 1 : -1;
        updateHeading(done, total);
      });

      tbody.appendChild(tr);
    });

    updateHeading(done, total);
  })
  .catch((err) => console.error("Failed to load topic data", err));
