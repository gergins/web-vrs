export async function createPeerConnection(ws: WebSocket) {
  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  const turnUsername = process.env.NEXT_PUBLIC_TURN_USERNAME;
  const turnPassword = process.env.NEXT_PUBLIC_TURN_PASSWORD;

  const iceServers: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];
  if (turnUrl && turnUsername && turnPassword) {
    iceServers.push({
      urls: turnUrl,
      username: turnUsername,
      credential: turnPassword
    });
  }

  const pc = new RTCPeerConnection({ iceServers });

  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
  });

  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      ws.send(JSON.stringify({ type: "ice", candidate: e.candidate }));
    }
  };

  return { pc, stream };
}
