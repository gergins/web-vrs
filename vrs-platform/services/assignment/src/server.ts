import express from "express";

const app = express();
app.use(express.json());

const interpreters = [
  { id: "demo-interpreter", language: "ASL", available: true, workload: 0.2 },
  { id: "backup-interpreter", language: "ASL", available: true, workload: 0.4 }
];

function pickInterpreter(preferredLanguage = "ASL") {
  return interpreters
    .filter((i) => i.available && i.language === preferredLanguage)
    .sort((a, b) => a.workload - b.workload || a.id.localeCompare(b.id))[0] || null;
}

app.get("/assign", (_, res) => {
  const selected = pickInterpreter("ASL");
  if (!selected) return res.status(404).json({ status: "no_interpreter_available" });
  return res.json({ interpreterId: selected.id, eta: 5 });
});

app.post("/assign", (req, res) => {
  const preferredLanguage = req.body?.preferredLanguage || "ASL";
  const selected = pickInterpreter(preferredLanguage);
  if (!selected) return res.status(404).json({ status: "no_interpreter_available" });

  return res.json({
    interpreterId: selected.id,
    eta: 5,
    reason: "language+availability+workload"
  });
});

app.listen(4003, () => {
  console.log("Assignment service running on 4003");
});
