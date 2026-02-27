const crypto = require("crypto");

function acceptKey(secWebSocketKey) {
  return crypto
    .createHash("sha1")
    .update(`${secWebSocketKey}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`, "utf8")
    .digest("base64");
}

function encodeTextFrame(text) {
  const payload = Buffer.from(String(text), "utf8");
  if (payload.length > 125) {
    throw new Error("Payload too large for basic frame encoder");
  }
  const header = Buffer.from([0x81, payload.length]);
  return Buffer.concat([header, payload]);
}

function decodeFrame(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 2) return null;

  const first = buffer[0];
  const second = buffer[1];
  const opcode = first & 0x0f;
  const masked = (second & 0x80) !== 0;
  let length = second & 0x7f;
  let offset = 2;

  if (length === 126) {
    if (buffer.length < 4) return null;
    length = buffer.readUInt16BE(2);
    offset = 4;
  } else if (length === 127) {
    throw new Error("Unsupported websocket frame length");
  }

  const maskBytes = masked ? 4 : 0;
  if (buffer.length < offset + maskBytes + length) return null;

  let payload = buffer.subarray(offset + maskBytes, offset + maskBytes + length);
  if (masked) {
    const mask = buffer.subarray(offset, offset + 4);
    payload = Buffer.from(payload);
    for (let i = 0; i < payload.length; i += 1) {
      payload[i] ^= mask[i % 4];
    }
  }

  return {
    opcode,
    payload,
    consumed: offset + maskBytes + length
  };
}

module.exports = { acceptKey, encodeTextFrame, decodeFrame };
