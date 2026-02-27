const crypto = require("crypto");

function newCorrelationId() {
  return crypto.randomUUID();
}

module.exports = { newCorrelationId };
