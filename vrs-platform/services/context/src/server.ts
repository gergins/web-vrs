import express from "express";
import { authMiddleware } from "./auth-middleware";
import { createSession, getSession } from "./session-store";

const app = express();
app.use(express.json());

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.post("/sessions/:sessionId", authMiddleware, async (req, res) => {
  const { sessionId } = req.params;
  await createSession(sessionId, req.body);
  res.json({ status: "stored", sessionId });
});

app.get("/sessions/:sessionId", authMiddleware, async (req, res) => {
  const { sessionId } = req.params;
  const session = await getSession(sessionId);
  if (!session) return res.status(404).json({ status: "not_found", sessionId });
  return res.json({ status: "ok", session });
});

app.listen(4004, () => {
  console.log("Context service running on 4004");
});
