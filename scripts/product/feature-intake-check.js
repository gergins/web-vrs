#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const query = process.argv.slice(2).join(" ").trim();
if (!query) {
  console.error("Usage: npm run feature:check -- \"your feature description\"");
  process.exit(1);
}

const ROOT = process.cwd();
const CANDIDATE_FILES = [
  "docs/product/feature-backlog.md",
  "docs/product/feature-gate-matrix.md",
  "docs/ai/capability-registry.md",
  "config/capabilities/registry.json",
  "docs/production-plan.md"
];

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have", "in", "is",
  "it", "its", "of", "on", "or", "that", "the", "this", "to", "was", "will", "with", "user", "users"
]);

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  const words = normalize(value).split(" ").filter(Boolean);
  return [...new Set(words.filter((w) => w.length > 2 && !STOP_WORDS.has(w)))];
}

function overlapScore(queryTokens, lineTokens) {
  if (!lineTokens.length) return 0;
  let hits = 0;
  for (const token of queryTokens) {
    if (lineTokens.includes(token)) hits += 1;
  }
  return hits;
}

const queryTokens = tokenize(query);
const queryNormalized = normalize(query);
const matches = [];
const filesRead = [];

for (const relativePath of CANDIDATE_FILES) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) continue;

  filesRead.push(relativePath);
  const content = fs.readFileSync(fullPath, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    const lineNormalized = normalize(line);
    if (!lineNormalized) return;
    const tokens = tokenize(line);
    const score = overlapScore(queryTokens, tokens);
    const phraseHit = lineNormalized.includes(queryNormalized) || queryNormalized.includes(lineNormalized);
    if (score >= 2 || phraseHit) {
      matches.push({
        file: relativePath,
        line: index + 1,
        text: line.trim(),
        score: phraseHit ? Math.max(score, 5) : score
      });
    }
  });
}

matches.sort((a, b) => b.score - a.score);
const topMatches = matches.slice(0, 8);
const likelyExists = topMatches.some((m) => m.score >= 5) || topMatches.length >= 4;

console.log("Feature Intake Check");
console.log(`Query: ${query}`);
console.log(`Files scanned: ${filesRead.length}`);
console.log(`Decision: ${likelyExists ? "POSSIBLE_DUPLICATE" : "NEW_OR_UNCLEAR"}`);

if (!topMatches.length) {
  console.log("No close matches found.");
} else {
  console.log("Top matches:");
  for (const match of topMatches) {
    console.log(`- ${match.file}:${match.line} [score ${match.score}] ${match.text}`);
  }
}

console.log("Next steps:");
console.log("- If duplicate: update existing backlog entry instead of adding a new one.");
console.log("- If new: add to docs/product/feature-backlog.md and run gate scoring.");
console.log("- If AI feature: complete docs/ai/intake/capability-intake-template.md.");
