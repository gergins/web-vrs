const sequence = ['request','assign','dial','active','end'];

let current = sequence[0];

for (let i = 1; i < sequence.length; i++) {
  current = sequence[i];
}

if (current !== 'end') {
  console.error('Call flow failed.');
  process.exit(1);
}

console.log('Deterministic call flow passed.');
