function fail(message) {
  console.error(`FAILURE-PATH TEST FAILED: ${message}`);
  process.exit(1);
}

function nextOnFailure(failureType, currentState) {
  if (currentState === "call_ended") {
    return { nextState: "call_ended", action: "noop" };
  }

  const terminalFailures = new Set([
    "interpreter_unavailable",
    "signaling_timeout",
    "media_negotiation_failure"
  ]);

  if (!terminalFailures.has(failureType)) {
    return { nextState: currentState, action: "retry" };
  }

  return { nextState: "call_ended", action: "end_call" };
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) fail(`${msg}. Expected '${expected}', got '${actual}'.`);
}

const cases = [
  {
    name: "interpreter unavailable ends the call deterministically",
    failureType: "interpreter_unavailable",
    currentState: "request_received",
    expectedState: "call_ended",
    expectedAction: "end_call"
  },
  {
    name: "signaling timeout ends the call deterministically",
    failureType: "signaling_timeout",
    currentState: "hearing_party_dialing",
    expectedState: "call_ended",
    expectedAction: "end_call"
  },
  {
    name: "media negotiation failure ends the call deterministically",
    failureType: "media_negotiation_failure",
    currentState: "relay_active",
    expectedState: "call_ended",
    expectedAction: "end_call"
  },
  {
    name: "unknown failure remains in current state for controlled retry",
    failureType: "unknown_transient_failure",
    currentState: "interpreter_assigned",
    expectedState: "interpreter_assigned",
    expectedAction: "retry"
  },
  {
    name: "terminal state remains terminal",
    failureType: "signaling_timeout",
    currentState: "call_ended",
    expectedState: "call_ended",
    expectedAction: "noop"
  }
];

for (const testCase of cases) {
  const result = nextOnFailure(testCase.failureType, testCase.currentState);
  assertEqual(result.nextState, testCase.expectedState, `${testCase.name} (state)`);
  assertEqual(result.action, testCase.expectedAction, `${testCase.name} (action)`);
}

console.log("Failure-path callflow tests passed.");
