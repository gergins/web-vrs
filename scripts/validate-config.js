const fs = require("fs");
const path = require("path");

function fail(message) {
  console.error(`CONFIG VALIDATION FAILED: ${message}`);
  process.exit(1);
}

const configPath = path.join(process.cwd(), "config", "vrs.config.json");
const accommodationPath = path.join(process.cwd(), "config", "interpreter-accommodation-policy.json");
if (!fs.existsSync(configPath)) fail("Missing config/vrs.config.json");
if (!fs.existsSync(accommodationPath)) fail("Missing config/interpreter-accommodation-policy.json");

const configRaw = fs.readFileSync(configPath, "utf8").replace(/^\uFEFF/, "");
const config = JSON.parse(configRaw);
const accommodationRaw = fs.readFileSync(accommodationPath, "utf8").replace(/^\uFEFF/, "");
const accommodation = JSON.parse(accommodationRaw);

if (config?.signaling?.transport !== "wss") fail("signaling.transport must be 'wss'");
if (config?.signaling?.tls_required !== true) fail("signaling.tls_required must be true");
if (config?.signaling?.allow_plaintext_sip !== false) fail("signaling.allow_plaintext_sip must be false");
if (config?.media?.srtp_required !== true) fail("media.srtp_required must be true");
if (!Array.isArray(config?.media?.allowed_codecs) || config.media.allowed_codecs.length === 0) {
  fail("media.allowed_codecs must be a non-empty array");
}
if (config?.security?.hardcoded_credentials_allowed !== false) {
  fail("security.hardcoded_credentials_allowed must be false");
}
if (accommodation?.policy_mode !== "opt_in") {
  fail("interpreter accommodation policy_mode must be 'opt_in'");
}
if (accommodation?.guardrails?.no_hardcoded_global_gender_rule !== true) {
  fail("accommodation guardrail no_hardcoded_global_gender_rule must be true");
}
if (accommodation?.guardrails?.user_consent_required !== true) {
  fail("accommodation guardrail user_consent_required must be true");
}
if (accommodation?.guardrails?.legal_profile_required_for_strict_constraints !== true) {
  fail("accommodation guardrail legal_profile_required_for_strict_constraints must be true");
}
if (accommodation?.guardrails?.audit_decision_required !== true) {
  fail("accommodation guardrail audit_decision_required must be true");
}

console.log("Config validation passed.");
