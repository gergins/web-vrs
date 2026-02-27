const fs = require('fs');
const schema = JSON.parse(fs.readFileSync('./references/session_state_machine_schema.json'));

const requiredStates = ['IDLE','REGISTERED','INVITED','ACTIVE','TERMINATED'];

for (const state of requiredStates) {
  if (!schema.states[state]) {
    console.error('Missing required state:', state);
    process.exit(1);
  }
}

console.log('State transition schema validated.');
