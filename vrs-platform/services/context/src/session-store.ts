import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const memoryStore = new Map<string, string>();

redis.on("error", (err) => {
  console.warn("[context] redis_unavailable_fallback_memory", { message: err?.message });
});

export async function createSession(sessionId: string, data: any) {
  const payload = JSON.stringify(data);
  try {
    await redis.set(`session:${sessionId}`, payload);
    return;
  } catch (err: any) {
    memoryStore.set(`session:${sessionId}`, payload);
    console.warn("[context] store_session_fallback_memory", { sessionId, message: err?.message });
  }
}

export async function getSession(sessionId: string) {
  const key = `session:${sessionId}`;
  try {
    const data = await redis.get(key);
    if (data) return JSON.parse(data);
  } catch (err: any) {
    console.warn("[context] load_session_fallback_memory", { sessionId, message: err?.message });
  }

  const fallback = memoryStore.get(key);
  return fallback ? JSON.parse(fallback) : null;
}
