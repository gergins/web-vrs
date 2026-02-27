export function connectSignaling(url: string): WebSocket {
  const ws = new WebSocket(url);
  return ws;
}
