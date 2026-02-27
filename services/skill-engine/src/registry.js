const fs = require("fs");
const path = require("path");

function loadRegistry() {
  const p = path.join(process.cwd(), "config", "skills", "registry.json");
  const text = fs.readFileSync(p, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(text);
}

function listSkills() {
  const reg = loadRegistry();
  return reg.skills || [];
}

function getSkill(skillId, version) {
  return listSkills().find((s) => s.skill_id === skillId && s.version === version) || null;
}

module.exports = { loadRegistry, listSkills, getSkill };
