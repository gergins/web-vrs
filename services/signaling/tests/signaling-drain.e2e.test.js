const assert = require("assert");
const { spawn } = require("child_process");
const path = require("path");

const PORT = 7171;
const BASE = `http://127.0.0.1:${PORT}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForLiveness() {
  const maxAttempts = 50;
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const res = await fetch(`${BASE}/health/liveness`);
      if (res.status === 200) return;
    } catch (_) {
      // service not ready yet
    }
    await sleep(100);
  }
  throw new Error("Signaling server did not become live in time");
}

async function postJson(pathname, payload) {
  const res = await fetch(`${BASE}${pathname}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload || {})
  });
  const body = await res.json();
  return { status: res.status, body };
}

async function getJson(pathname) {
  const res = await fetch(`${BASE}${pathname}`);
  const body = await res.json();
  return { status: res.status, body };
}

async function run() {
  const serverPath = path.join(process.cwd(), "services", "signaling", "src", "server.js");
  const child = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      SIGNALING_PORT: String(PORT),
      DRAIN_TIMEOUT_MS: "2000"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString("utf8");
  });

  try {
    await waitForLiveness();

    const invite1 = await postJson("/sip", { method: "INVITE", sessionId: "e2e-s1" });
    assert.strictEqual(invite1.status, 200);
    assert.strictEqual(invite1.body.action, "invite_accepted");

    const drain = await postJson("/admin/drain");
    assert.strictEqual(drain.status, 200);
    assert.strictEqual(drain.body.status, "draining");

    const readiness = await getJson("/health/readiness");
    assert.strictEqual(readiness.status, 503);
    assert.strictEqual(readiness.body.status, "draining");

    const invite2 = await postJson("/sip", { method: "INVITE", sessionId: "e2e-s2" });
    assert.strictEqual(invite2.status, 503);
    assert.strictEqual(invite2.body.action, "draining_reject");

    const bye = await postJson("/sip", { method: "BYE", sessionId: "e2e-s1" });
    assert.strictEqual(bye.status, 200);
    assert.strictEqual(bye.body.action, "session_ended");

    child.kill("SIGTERM");
    console.log("Signaling drain E2E tests passed.");
  } finally {
    await sleep(200);
    if (!child.killed) child.kill("SIGKILL");
    if (stderr.trim().length > 0) {
      throw new Error(`Signaling server stderr output detected: ${stderr}`);
    }
  }
}

run().catch((err) => {
  console.error(`SIGNALING E2E TEST FAILED: ${err.message}`);
  process.exit(1);
});
