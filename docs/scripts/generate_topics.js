/**
 * docs/scripts/generate_topics.js
 *
 * Scans docs/data/topics/*.json
 * Generates docs/data/topics.json
 *
 */

import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd(), "docs");
const DATA_DIR = path.join(ROOT, "data");
const TOPICS_DIR = path.join(DATA_DIR, "topics");
const OUTPUT_PATH = path.join(DATA_DIR, "topics.json");

if (!fs.existsSync(TOPICS_DIR)) {
  throw new Error("docs/data/topics directory not found");
}

const files = fs.readdirSync(TOPICS_DIR).filter((f) => f.endsWith(".json"));

const topics = [];

for (const file of files) {
  const filePath = path.join(TOPICS_DIR, file);
  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (
    typeof raw["topic-id"] !== "number" ||
    typeof raw.title !== "string" ||
    !Array.isArray(raw.problems)
  ) {
    throw new Error(`Invalid topic format in ${file}`);
  }

  topics.push({
    "topic-id": raw["topic-id"],
    file: file.replace(".json", ""),
    title: raw.title,
    total: raw.problems.length,
  });
}

/* sort by topic-id to keep index stable */
topics.sort((a, b) => a["topic-id"] - b["topic-id"]);

fs.writeFileSync(OUTPUT_PATH, JSON.stringify(topics, null, 2), "utf-8");

console.log("✅ Generated docs/data/topics.json");
console.table(topics);
