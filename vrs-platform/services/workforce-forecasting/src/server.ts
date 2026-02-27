import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.post("/forecast", (req, res) => {
  const { region = "default", hour = 12 } = req.body || {};
  const requiredInterpreters = Math.max(2, Math.round((Number(hour) % 24) / 2));

  res.json({
    region,
    hour,
    requiredInterpreters,
    shortageRisk: requiredInterpreters > 8 ? "high" : "normal"
  });
});

app.listen(4010, () => {
  console.log("Workforce forecasting service running on 4010");
});
