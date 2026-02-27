import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.post("/assist/terminology", (req, res) => {
  const { topic = "general" } = req.body || {};
  res.json({
    topic,
    suggestions: [
      "confirm participant identity",
      "clarify domain terminology",
      "keep sentence boundaries short"
    ],
    mode: "assistive_only",
    humanOverrideRequired: true
  });
});

app.post("/assist/summary", (req, res) => {
  const { sessionId = "unknown" } = req.body || {};
  res.json({
    sessionId,
    summary: "Post-call summary draft generated for interpreter review.",
    reviewRequired: true
  });
});

app.listen(4011, () => {
  console.log("AI assist service running on 4011");
});
