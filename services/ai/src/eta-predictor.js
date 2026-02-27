function predictQueueEta({ queueDepth, availableInterpreters, avgSessionMinutes }) {
  const depth = Math.max(0, Number(queueDepth || 0));
  const capacity = Math.max(1, Number(availableInterpreters || 1));
  const avg = Math.max(1, Number(avgSessionMinutes || 10));

  const etaMinutes = Math.ceil((depth / capacity) * avg);
  const confidence = depth <= 5 ? "high" : depth <= 15 ? "medium" : "low";

  return {
    etaMinutes: Math.min(180, etaMinutes),
    confidence
  };
}

module.exports = { predictQueueEta };
