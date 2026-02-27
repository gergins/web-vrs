import { useEffect, useRef, useState } from "react";

type IncomingCall = {
  sessionId: string;
  caller: string;
  sipAddress?: string | null;
};
type ChatEntry = { fromRole: string; text: string; sentAt: string };

const INTERPRETER_CAMERA_STORAGE_KEY = "vrs.interpreter.selectedCameraId";
const INTERPRETER_CAMERA_ENABLED_STORAGE_KEY = "vrs.interpreter.cameraEnabled";
const INTERPRETER_CHAT_STORAGE_KEY = "vrs.interpreter.chatBySession";

export default function InterpreterDashboard() {
  const [call, setCall] = useState<IncomingCall | null>(null);
  const [status, setStatus] = useState("idle");
  const [events, setEvents] = useState<string[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isVideoStageFullscreen, setIsVideoStageFullscreen] = useState(false);
  const [selfOverlayRect, setSelfOverlayRect] = useState({ x: 20, y: 20, w: 320, h: 200 });
  const [mediaError, setMediaError] = useState("");
  const [rttInput, setRttInput] = useState("");
  const [remoteRttText, setRemoteRttText] = useState("");
  const [isRemoteRttActive, setIsRemoteRttActive] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatBySession, setChatBySession] = useState<Record<string, ChatEntry[]>>({});
  const [isDeafUserTyping, setIsDeafUserTyping] = useState(false);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const videoStageRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{ active: boolean; offsetX: number; offsetY: number }>({ active: false, offsetX: 0, offsetY: 0 });
  const resizeStateRef = useRef<{ active: boolean; startX: number; startY: number; startW: number; startH: number }>({
    active: false,
    startX: 0,
    startY: 0,
    startW: 0,
    startH: 0
  });
  const callInitiatorRef = useRef(false);
  const selectedCameraIdRef = useRef("");
  const cameraEnabledRef = useRef(true);
  const wsRef = useRef<WebSocket | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const lastTypingSentAtRef = useRef(0);
  const lastRttSentAtRef = useRef(0);
  const rttSeqRef = useRef(0);
  const remoteRttSeqRef = useRef(0);

  async function preparePeerForSession(sessionId: string) {
    try {
      return await ensurePeerConnection(sessionId);
    } catch (err: any) {
      setMediaError(err?.message || "Unable to start camera/microphone for this call.");
      return null;
    }
  }

  function cleanupPeerConnection() {
    if (pcRef.current) {
      pcRef.current.getSenders().forEach((sender) => sender.track?.stop());
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    remoteStreamRef.current = null;
  }

  async function loadCameras() {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setCameras([]);
      setSelectedCameraId("");
      setMediaError("Camera listing is not supported in this browser context.");
      return;
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter((d) => d.kind === "videoinput");
    setCameras(videoInputs);
    const rememberedCameraId = localStorage.getItem(INTERPRETER_CAMERA_STORAGE_KEY) || "";
    const preferredCameraId = selectedCameraIdRef.current || rememberedCameraId;
    const preferredExists = preferredCameraId && videoInputs.some((cam) => cam.deviceId === preferredCameraId);
    const fallbackCameraId = videoInputs[0]?.deviceId || "";
    setSelectedCameraId(preferredExists ? preferredCameraId : fallbackCameraId);
  }

  async function primeCameraAccess() {
    if (!navigator.mediaDevices?.getUserMedia) {
      const hint = window.isSecureContext ? "" : " Open over HTTPS or localhost for camera/mic.";
      setMediaError("Camera/microphone API is unavailable in this browser context." + hint);
      return;
    }
    try {
      const probeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      probeStream.getTracks().forEach((track) => track.stop());
    } catch (err: any) {
      setMediaError(err?.message || "Unable to access camera devices.");
    }
  }

  async function refreshCameraList() {
    await primeCameraAccess();
    await loadCameras();
  }

  function getChatMessagesForActiveSession() {
    if (!activeSessionId) return [];
    return chatBySession[activeSessionId] || [];
  }

  function appendChatMessage(sessionId: string, entry: ChatEntry) {
    setChatBySession((prev) => {
      const current = prev[sessionId] || [];
      const nextForSession = [...current, entry].slice(-100);
      const next = { ...prev, [sessionId]: nextForSession };
      localStorage.setItem(INTERPRETER_CHAT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function formatChatTime(iso: string) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "--:--";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  async function ensurePeerConnection(sessionId: string) {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
    });

    const cameraId = selectedCameraIdRef.current;
    const videoConstraint = cameraId ? { deviceId: { exact: cameraId } } : true;
    let stream: MediaStream | null = null;
    if (!navigator.mediaDevices?.getUserMedia) {
      const hint = window.isSecureContext ? "" : " Open over HTTPS or localhost for camera/mic.";
      setMediaError("Camera/microphone API is unavailable in this browser context." + hint);
    } else {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: true });
      } catch (err: any) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraint, audio: false });
          setMediaError("Microphone unavailable; continuing with video only.");
        } catch {
          const hint = window.isSecureContext ? "" : " Open over HTTPS or localhost for camera/mic.";
          setMediaError((err?.message || "Unable to access camera/microphone.") + hint);
        }
      }
    }

    if (stream) {
      stream.getVideoTracks().forEach((track) => (track.enabled = cameraEnabledRef.current));
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } else {
      // Keep call/media negotiation alive even when local capture is unavailable.
      pc.addTransceiver("video", { direction: "recvonly" });
      pc.addTransceiver("audio", { direction: "recvonly" });
      localStreamRef.current = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    }

    const remoteStream = new MediaStream();
    remoteStreamRef.current = remoteStream;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.muted = true;
      remoteVideoRef.current.onloadedmetadata = () => {
        void remoteVideoRef.current?.play?.().catch(() => {});
      };
    }

    pc.ontrack = (event) => {
      if (event.streams?.[0]) {
        event.streams[0].getTracks().forEach((track) => remoteStream.addTrack(track));
      } else if (event.track) {
        remoteStream.addTrack(event.track);
      }
      void remoteVideoRef.current?.play?.().catch(() => {});
    };

    pc.onicecandidate = (event) => {
      if (!event.candidate || !wsRef.current) return;
      wsRef.current.send(
        JSON.stringify({
          type: "webrtc-ice",
          sessionId,
          fromRole: "interpreter",
          targetRole: "deaf-user",
          candidate: event.candidate
        })
      );
    };

    pcRef.current = pc;
    return pc;
  }

  useEffect(() => {
    const rememberedCameraEnabled = localStorage.getItem(INTERPRETER_CAMERA_ENABLED_STORAGE_KEY);
    if (rememberedCameraEnabled === "false") {
      setCameraEnabled(false);
    }
    try {
      const stored = localStorage.getItem(INTERPRETER_CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setChatBySession(parsed);
        }
      }
    } catch {}

    const signalingUrl =
      process.env.NEXT_PUBLIC_SIGNALING_URL ||
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:4001`;
    const ws = new WebSocket(signalingUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      ws.send(JSON.stringify({ type: "join", role: "interpreter" }));
    };

    ws.onmessage = async (msg) => {
      const data = JSON.parse(msg.data as string);
      setEvents((prev) => [`${new Date().toLocaleTimeString()} ${data.type}`, ...prev].slice(0, 20));

      if (data.type === "incoming-call") setCall(data);

      if (data.type === "call-accepted") {
        setStatus(`connected:${data.sessionId}`);
        setActiveSessionId(data.sessionId);
        setCall(null);
        if (callInitiatorRef.current && data.sessionId) {
          const pc = await preparePeerForSession(data.sessionId);
          if (pc && ws) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            ws.send(
              JSON.stringify({
                type: "webrtc-offer",
                sessionId: data.sessionId,
                fromRole: "interpreter",
                targetRole: "deaf-user",
                sdp: offer
              })
            );
          }
        }
      }

      if (data.type === "call-ended") {
        await exitVideoFullscreen();
        cleanupPeerConnection();
        setCall(null);
        setActiveSessionId(null);
        setIsDeafUserTyping(false);
        setRttInput("");
        setRemoteRttText("");
        setIsRemoteRttActive(false);
        remoteRttSeqRef.current = 0;
        setStatus(`call-ended:${data.sessionId || ""}`);
      }

      if (data.type === "webrtc-offer" && data.targetRole === "interpreter" && data.sessionId) {
        const pc = await preparePeerForSession(data.sessionId);
        if (!pc || !ws) return;
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.send(
          JSON.stringify({
            type: "webrtc-answer",
            sessionId: data.sessionId,
            fromRole: "interpreter",
            targetRole: "deaf-user",
            sdp: answer
          })
        );
      }

      if (data.type === "webrtc-answer" && data.targetRole === "interpreter" && data.sdp && pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
      }

      if (data.type === "webrtc-ice" && data.targetRole === "interpreter" && data.candidate && pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch {}
      }

      if (data.type === "chat-message") {
        const visibleToInterpreter = data.fromRole === "interpreter" || data.targetRole === "interpreter";
        if (!visibleToInterpreter) return;
        if (!data.sessionId) return;
        appendChatMessage(data.sessionId, {
          fromRole: data.fromRole || "unknown",
          text: data.text || "",
          sentAt: data.sentAt || new Date().toISOString()
        });
      }

      if (data.type === "chat-typing" && data.targetRole === "interpreter" && data.sessionId === activeSessionIdRef.current) {
        setIsDeafUserTyping(Boolean(data.isTyping));
      }

      if (data.type === "rtt-update" && data.targetRole === "interpreter" && data.sessionId === activeSessionIdRef.current) {
        const seq = Number.isInteger(data.seq) ? data.seq : 0;
        if (seq <= remoteRttSeqRef.current) return;
        remoteRttSeqRef.current = seq;
        setRemoteRttText(data.text || "");
        setIsRemoteRttActive(Boolean(data.isActive));
      }
    };

    refreshCameraList().catch(() => {});
    const onDeviceChange = () => {
      loadCameras().catch(() => {});
    };
    navigator.mediaDevices?.addEventListener?.("devicechange", onDeviceChange);

    return () => {
      cleanupPeerConnection();
      ws.close();
      wsRef.current = null;
      navigator.mediaDevices?.removeEventListener?.("devicechange", onDeviceChange);
    };
  }, []);

  useEffect(() => {
    selectedCameraIdRef.current = selectedCameraId;
    if (selectedCameraId) {
      localStorage.setItem(INTERPRETER_CAMERA_STORAGE_KEY, selectedCameraId);
    }
  }, [selectedCameraId]);

  useEffect(() => {
    cameraEnabledRef.current = cameraEnabled;
    localStorage.setItem(INTERPRETER_CAMERA_ENABLED_STORAGE_KEY, String(cameraEnabled));
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => (track.enabled = cameraEnabled));
    }
  }, [cameraEnabled]);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
    if (!activeSessionId) {
      setRttInput("");
      setRemoteRttText("");
      setIsRemoteRttActive(false);
      remoteRttSeqRef.current = 0;
    }
  }, [activeSessionId]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsVideoStageFullscreen(document.fullscreenElement === videoStageRef.current);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (dragStateRef.current.active) {
        setSelfOverlayRect((prev) => {
          const nextX = Math.min(Math.max(0, event.clientX - dragStateRef.current.offsetX), Math.max(0, window.innerWidth - prev.w));
          const nextY = Math.min(Math.max(0, event.clientY - dragStateRef.current.offsetY), Math.max(0, window.innerHeight - prev.h));
          return { ...prev, x: nextX, y: nextY };
        });
      }
      if (resizeStateRef.current.active) {
        const dx = event.clientX - resizeStateRef.current.startX;
        const dy = event.clientY - resizeStateRef.current.startY;
        const nextW = Math.min(Math.max(220, resizeStateRef.current.startW + dx), Math.max(220, window.innerWidth - selfOverlayRect.x));
        const nextH = Math.min(Math.max(140, resizeStateRef.current.startH + dy), Math.max(140, window.innerHeight - selfOverlayRect.y));
        setSelfOverlayRect((prev) => ({ ...prev, w: nextW, h: nextH }));
      }
    };
    const onMouseUp = () => {
      dragStateRef.current.active = false;
      resizeStateRef.current.active = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [selfOverlayRect.x, selfOverlayRect.y]);

  function acceptCall() {
    if (!wsRef.current || !call) return;
    const sessionId = call.sessionId;
    callInitiatorRef.current = false;
    wsRef.current.send(JSON.stringify({ type: "call-accept", sessionId, acceptedBy: "interpreter" }));
    void preparePeerForSession(sessionId);
    setStatus(`connected:${sessionId}`);
    setActiveSessionId(sessionId);
    setCall(null);
  }

  function ringDeafUser() {
    if (!wsRef.current) return;
    callInitiatorRef.current = true;
    wsRef.current.send(JSON.stringify({ type: "call-request", caller: "interpreter", target: "deaf-user" }));
    setStatus("outgoing-ring");
  }

  function endCall() {
    if (!wsRef.current || !activeSessionId) return;
    sendRttUpdate("", true);
    wsRef.current.send(JSON.stringify({ type: "call-end", sessionId: activeSessionId, endedBy: "interpreter" }));
    void exitVideoFullscreen();
    cleanupPeerConnection();
    setCall(null);
    setActiveSessionId(null);
    setStatus("call-ended");
  }

  function sendChatMessage() {
    if (!wsRef.current || !activeSessionId) return;
    const text = chatInput.trim();
    if (!text) return;

    wsRef.current.send(
      JSON.stringify({
        type: "chat-message",
        sessionId: activeSessionId,
        fromRole: "interpreter",
        targetRole: "deaf-user",
        text
      })
    );
    wsRef.current.send(
      JSON.stringify({
        type: "chat-typing",
        sessionId: activeSessionId,
        fromRole: "interpreter",
        targetRole: "deaf-user",
        isTyping: false
      })
    );
    setChatInput("");
    setIsDeafUserTyping(false);
  }

  function sendTypingSignal(nextText?: string) {
    if (!wsRef.current || !activeSessionId) return;
    const isTyping = Boolean((nextText ?? chatInput).trim());
    if (!isTyping) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat-typing",
          sessionId: activeSessionId,
          fromRole: "interpreter",
          targetRole: "deaf-user",
          isTyping: false
        })
      );
      return;
    }

    const now = Date.now();
    if (now - lastTypingSentAtRef.current < 600) return;
    lastTypingSentAtRef.current = now;

    wsRef.current.send(
      JSON.stringify({
        type: "chat-typing",
        sessionId: activeSessionId,
        fromRole: "interpreter",
        targetRole: "deaf-user",
        isTyping: true
      })
    );
  }

  function sendRttUpdate(nextText: string, force = false) {
    if (!wsRef.current || !activeSessionId) return;
    const now = Date.now();
    if (!force && now - lastRttSentAtRef.current < 120) return;
    lastRttSentAtRef.current = now;
    rttSeqRef.current += 1;
    wsRef.current.send(
      JSON.stringify({
        type: "rtt-update",
        sessionId: activeSessionId,
        fromRole: "interpreter",
        targetRole: "deaf-user",
        text: nextText,
        isActive: nextText.length > 0,
        seq: rttSeqRef.current
      })
    );
  }

  function clearRttField() {
    setRttInput("");
    sendRttUpdate("", true);
  }

  async function handleSwitchCamera() {
    try {
      if (!selectedCameraId) return;
      if (!navigator.mediaDevices?.getUserMedia) {
        const hint = window.isSecureContext ? "" : " Open over HTTPS or localhost for camera/mic.";
        setMediaError("Camera/microphone API is unavailable in this browser context." + hint);
        return;
      }
      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedCameraId } },
          audio: true
        });
      } catch {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: selectedCameraId } },
          audio: false
        });
        setMediaError("Microphone unavailable; switched camera with video only.");
      }
      newStream.getVideoTracks().forEach((track) => (track.enabled = cameraEnabledRef.current));

      if (localVideoRef.current) localVideoRef.current.srcObject = newStream;

      if (pcRef.current) {
        const senders = pcRef.current.getSenders();
        const newVideo = newStream.getVideoTracks()[0];
        const newAudio = newStream.getAudioTracks()[0];
        if (newVideo) {
          const sender = senders.find((s) => s.track?.kind === "video");
          if (sender) await sender.replaceTrack(newVideo);
        }
        if (newAudio) {
          const sender = senders.find((s) => s.track?.kind === "audio");
          if (sender) await sender.replaceTrack(newAudio);
        }
      }

      if (localStreamRef.current) localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = newStream;
      setMediaError("");
    } catch (err: any) {
      setMediaError(err?.message || "Unable to switch camera");
    }
  }

  async function handleFullscreen() {
    const stage = videoStageRef.current;
    if (!stage) return;
    try {
      if (document.fullscreenElement !== stage) {
        await stage.requestFullscreen();
      }
    } catch (err: any) {
      setMediaError(err?.message || "Unable to enter fullscreen.");
    }
  }

  async function exitVideoFullscreen() {
    try {
      if (document.fullscreenElement === videoStageRef.current) {
        await document.exitFullscreen();
      }
    } catch {}
  }

  function startOverlayDrag(event: React.MouseEvent<HTMLDivElement>) {
    dragStateRef.current = {
      active: true,
      offsetX: event.clientX - selfOverlayRect.x,
      offsetY: event.clientY - selfOverlayRect.y
    };
  }

  function startOverlayResize(event: React.MouseEvent<HTMLDivElement>) {
    event.stopPropagation();
    resizeStateRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      startW: selfOverlayRect.w,
      startH: selfOverlayRect.h
    };
  }

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <h1>Interpreter Layout</h1>
      <p>Status: {status}</p>
      <div
        ref={videoStageRef}
        style={{ display: "grid", gridTemplateColumns: isVideoStageFullscreen ? "1fr" : "1fr 1fr", gap: 16, position: "relative", background: isVideoStageFullscreen ? "#000" : "transparent" }}
      >
        <section
          style={{
            border: isVideoStageFullscreen ? "none" : "2px solid #1f2937",
            borderRadius: isVideoStageFullscreen ? 0 : 10,
            padding: isVideoStageFullscreen ? 0 : 12,
            position: isVideoStageFullscreen ? "absolute" : "relative",
            inset: isVideoStageFullscreen ? 0 : "auto",
            zIndex: 1
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isVideoStageFullscreen ? 0 : 8 }}>
            {!isVideoStageFullscreen ? <h2 style={{ marginTop: 0, marginBottom: 0 }}>Deaf User Video</h2> : null}
            {!isVideoStageFullscreen ? <button onClick={handleFullscreen}>Fullscreen</button> : null}
          </div>
          <video ref={remoteVideoRef} autoPlay muted playsInline style={{ width: "100%", height: isVideoStageFullscreen ? "100vh" : "38vh", objectFit: "cover", border: isVideoStageFullscreen ? "none" : "1px solid #333" }} />
        </section>

        <section
          style={{
            border: "2px solid #1f2937",
            borderRadius: 10,
            padding: 12,
            position: isVideoStageFullscreen ? "absolute" : "relative",
            left: isVideoStageFullscreen ? selfOverlayRect.x : "auto",
            top: isVideoStageFullscreen ? selfOverlayRect.y : "auto",
            width: isVideoStageFullscreen ? selfOverlayRect.w : "auto",
            height: isVideoStageFullscreen ? selfOverlayRect.h : "auto",
            zIndex: isVideoStageFullscreen ? 10 : 1,
            background: "#0b1220"
          }}
        >
          <div
            onMouseDown={isVideoStageFullscreen ? startOverlayDrag : undefined}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, cursor: isVideoStageFullscreen ? "move" : "default", color: isVideoStageFullscreen ? "#fff" : "inherit" }}
          >
            <h2 style={{ marginTop: 0, marginBottom: 0, fontSize: isVideoStageFullscreen ? 16 : undefined }}>My Video</h2>
            {isVideoStageFullscreen ? <button onClick={exitVideoFullscreen}>Exit</button> : <button onClick={handleFullscreen}>Fullscreen</button>}
          </div>
          <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", height: isVideoStageFullscreen ? "calc(100% - 34px)" : "38vh", objectFit: "cover", border: "1px solid #333" }} />
          {isVideoStageFullscreen ? (
            <div
              onMouseDown={startOverlayResize}
              style={{ position: "absolute", right: 6, bottom: 6, width: 14, height: 14, background: "#fff", borderRadius: 2, cursor: "nwse-resize" }}
            />
          ) : null}
        </section>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={ringDeafUser}>Ring Deaf User</button>
        <button onClick={acceptCall} disabled={!call}>
          Accept
        </button>
        <button onClick={endCall} disabled={!activeSessionId}>
          End Call
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <label htmlFor="interpreter-camera">Camera:</label>
        <select id="interpreter-camera" value={selectedCameraId} onChange={(e) => setSelectedCameraId(e.target.value)}>
          {cameras.length === 0 ? <option value="">No camera detected</option> : null}
          {cameras.map((cam, i) => {
            const label = cam.label?.trim() || `Camera ${i + 1}`;
            return (
              <option key={cam.deviceId || i} value={cam.deviceId}>
                {label}
              </option>
            );
          })}
        </select>
        <button onClick={() => refreshCameraList()}>Refresh Cameras</button>
        <button onClick={handleSwitchCamera}>Use Selected Camera</button>
        <button onClick={() => setCameraEnabled((v) => !v)}>{cameraEnabled ? "Camera Off" : "Camera On"}</button>
      </div>
      <section style={{ marginTop: 16, border: "1px solid #374151", borderRadius: 8, padding: 10 }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Real-Time Text (RTT)</h2>
        <textarea
          value={rttInput}
          onChange={(e) => {
            const nextValue = e.target.value;
            setRttInput(nextValue);
            sendRttUpdate(nextValue);
          }}
          placeholder={activeSessionId ? "Type live RTT to deaf user..." : "Start a call to enable RTT"}
          disabled={!activeSessionId}
          rows={3}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <button onClick={clearRttField} disabled={!activeSessionId || !rttInput.length}>
            Clear RTT
          </button>
        </div>
        <div aria-live="polite" style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 8, minHeight: 56 }}>
          {isRemoteRttActive ? (
            <div>
              <strong>Deaf User RTT:</strong> {remoteRttText || "..."}
            </div>
          ) : (
            <div>No live RTT from deaf user</div>
          )}
        </div>
      </section>
      <section style={{ marginTop: 16, border: "1px solid #374151", borderRadius: 8, padding: 10 }}>
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>Text Chat</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <input
            value={chatInput}
            onChange={(e) => {
              const nextValue = e.target.value;
              setChatInput(nextValue);
              sendTypingSignal(nextValue);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendChatMessage();
            }}
            placeholder={activeSessionId ? "Type message to deaf user" : "Start a call to enable chat"}
            disabled={!activeSessionId}
          />
          <button onClick={sendChatMessage} disabled={!activeSessionId || !chatInput.trim()}>
            Send
          </button>
        </div>
        {isDeafUserTyping ? <div style={{ marginBottom: 8, color: "#6b7280" }}>Deaf user is typing...</div> : null}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 8, minHeight: 90, maxHeight: 170, overflowY: "auto" }}>
          {getChatMessagesForActiveSession().length === 0 ? (
            <div>No messages yet</div>
          ) : (
            getChatMessagesForActiveSession().map((entry, idx) => (
              <div key={idx}>
                <strong>{entry.fromRole === "interpreter" ? "You" : "Deaf User"}:</strong> {entry.text}
                <span style={{ marginLeft: 8, color: "#6b7280", fontSize: 12 }}>{formatChatTime(entry.sentAt)}</span>
              </div>
            ))
          )}
        </div>
      </section>
      {mediaError ? <p style={{ color: "#b91c1c" }}>Media error: {mediaError}</p> : null}
      {activeSessionId ? (
        <div style={{ marginTop: 12, padding: 10, border: "2px solid #16a34a", borderRadius: 8, background: "#ecfdf5" }}>
          Active relay session: <strong>{activeSessionId}</strong>
        </div>
      ) : null}
      {call ? (
        <div style={{ marginTop: 16, border: "2px solid #f59e0b", borderRadius: 8, padding: 12 }}>
          <p>Incoming call from {call.caller}</p>
          {call.sipAddress ? <p>SIP target: {call.sipAddress}</p> : null}
        </div>
      ) : (
        <p style={{ marginTop: 16 }}>No incoming calls</p>
      )}
      <section style={{ marginTop: 20 }}>
        <h2 style={{ marginBottom: 8 }}>Event Log</h2>
        <div style={{ border: "1px solid #374151", borderRadius: 8, padding: 10, minHeight: 120 }}>
          {events.length ? events.map((line, idx) => <div key={idx}>{line}</div>) : <div>No events yet</div>}
        </div>
      </section>
    </div>
  );
}
