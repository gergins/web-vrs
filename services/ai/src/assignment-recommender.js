function recommendInterpreter({ interpreters, language, priority }) {
  const list = Array.isArray(interpreters) ? interpreters : [];
  const weight = priority === "urgent" ? 2 : 1;

  return list
    .filter((i) => i && i.available && Array.isArray(i.languages) && i.languages.includes(language))
    .map((i) => {
      const workloadPenalty = Number(i.activeSessions || 0);
      const score = weight * 100 - workloadPenalty * 10 + Number(i.experience || 0);
      return { id: i.id, score, reason: "language+availability+workload" };
    })
    .sort((a, b) => b.score - a.score || String(a.id).localeCompare(String(b.id)));
}

module.exports = { recommendInterpreter };
