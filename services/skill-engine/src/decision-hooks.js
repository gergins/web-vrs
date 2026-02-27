function scoreInterpreterCandidates(context) {
  const candidates = Array.isArray(context?.candidates) ? context.candidates : [];
  return candidates
    .map((c) => ({
      interpreter_id: c.interpreter_id,
      score: Number(c.score || 0)
    }))
    .sort((a, b) => b.score - a.score || String(a.interpreter_id).localeCompare(String(b.interpreter_id)));
}

module.exports = { scoreInterpreterCandidates };
