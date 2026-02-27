const assert = require("assert");
const { acceptKey, encodeTextFrame, decodeFrame } = require("../src/websocket");

const expected = "s3pPLMBiTxaQ9kYGzzhZRbK+xOo=";
assert.strictEqual(acceptKey("dGhlIHNhbXBsZSBub25jZQ=="), expected);

const frame = encodeTextFrame("hello");
const decoded = decodeFrame(frame);
assert.strictEqual(decoded.opcode, 0x1);
assert.strictEqual(decoded.payload.toString("utf8"), "hello");

console.log("WebSocket helper tests passed.");
