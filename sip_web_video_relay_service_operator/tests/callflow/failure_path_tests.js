function interpreterUnavailable() {
  return true;
}

if (!interpreterUnavailable()) {
  console.error('Failure path handling failed.');
  process.exit(1);
}

console.log('Failure-path tests passed.');
