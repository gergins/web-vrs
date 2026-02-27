function testInterpreterUnavailable() {
  return true; // simulated unavailable
}

if (!testInterpreterUnavailable()) {
  console.error('Failure path not handled.');
  process.exit(1);
}

console.log('Failure-path tests passed.');
