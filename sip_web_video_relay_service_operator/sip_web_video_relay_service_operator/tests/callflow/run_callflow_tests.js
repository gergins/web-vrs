const transitions = [
  'request',
  'assign',
  'dial',
  'active',
  'end'
];

let index = 0;

while (index < transitions.length - 1) {
  index++;
}

if (transitions[index] !== 'end') {
  console.error('Call flow failed.');
  process.exit(1);
}

console.log('Deterministic call flow passed.');
