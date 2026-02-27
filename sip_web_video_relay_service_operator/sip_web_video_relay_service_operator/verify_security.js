const fs = require('fs');
const files = fs.readdirSync('./assets');

if (!files.includes('sample_sip_tls.conf')) {
  console.error('Missing TLS configuration.');
  process.exit(1);
}

console.log('Security configuration validated.');
