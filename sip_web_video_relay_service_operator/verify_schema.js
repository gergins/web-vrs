const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('./references/session_state_machine_schema.json'));

if (!schema.states) {
  console.error('Invalid state schema.');
  process.exit(1);
}

console.log('Schema validation passed.');
