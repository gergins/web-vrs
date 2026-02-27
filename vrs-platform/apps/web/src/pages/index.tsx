import { useEffect, useRef, useState } from "react";
import { login, getToken } from "../lib/auth";
import { connectSignaling } from "../lib/signaling";
import { sipClient } from "../lib/sipClient";

const DEAF_CAMERA_STORAGE_KEY = "vrs.deaf.selectedCameraId";
const DEAF_CAMERA_ENABLED_STORAGE_KEY = "vrs.deaf.cameraEnabled";
const SIP_WS_STORAGE_KEY = "vrs.sip.wsServer";
const SIP_AOR_STORAGE_KEY = "vrs.sip.aor";
const SIP_AUTH_USER_STORAGE_KEY = "vrs.sip.authUser";
const SIP_AUTH_PASSWORD_STORAGE_KEY = "vrs.sip.authPassword";
const DEAF_CHAT_STORAGE_KEY = "vrs.deaf.chatBySession";
type ChatEntry = { fromRole: string; text: string; sentAt: string };

export default function Home() {
  const [status, setStatus] = useState("idle");
  const [incomingSessionId, setIncomingSessionId] = useState<string | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState("");
  const [sipAddress, setSipAddress] = useState("gergin.simeonov@mymmx.se");
  const [sipWsServer, setSipWsServer] = useState("");
  const [sipAor, setSipAor] = useState("");
  const [sipAuthUser, setSipAuthUser] = useState("");
  const [sipAuthPassword, setSipAuthPassword] = useState("");
  const [lastCallMode, setLastCallMode] = useState<"interpreter" | "sip">("interpreter");
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [isVideoStageFullscreen, setIsVideoStageFullscreen] = useState(false);
  const [selfOverlayRect, setSelfOverlayRect] = useState({ x: 20, y: 20, w: 320, h: 200 });
  const [mediaError, setMediaError] = useState("");
  const [rttInput, setRttInput] = useState("");
  const [remoteRttText, setRemoteRttText] = useState("");
  const [isRemoteRttActive, setIsRemoteRttActive] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatBySession, setChatBySession] = useState<Record<string, ChatEntry[]>>({});
  const [isInterpreterTyping, setIsInterpreterTyping] = useState(false);
  const selectedCameraIdRef = useRef("");
  const lastCallModeRef = useRef<"interpreter" | "sip">("interpreter");
  const cameraEnabledRef = useRef(true);
  const wsRef = useRef<WebSocket | null>(null);
  const activeSessionIdRef = useRef<string | null>(null);
  const chatBySessionRef = useRef<Record<string, ChatEntry[]>>({});
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
  const sipActiveRef = useRef(false);
  const lastTypingSentAtRef = useRef(0);
  const lastRttSentAtRef = useRef(0);
  const rttSeqRef = useRef(0);
  const remoteRttSeqRef = useRef(0);
  const sipConfigRef = useRef({
    wsServer: "",
    aor: "",
    authUser: "",
    authPassword: ""
  });

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
    const rememberedCameraId = localStorage.getItem(DEAF_CAMERA_STORAGE_KEY) || "";
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
      chatBySessionRef.current = next;
      localStorage.setItem(DEAF_CHAT_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function formatChatTime(iso: string) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "--:--";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  async function ensurePeerConnection(sessionId: string) {
    if (!wsRef.current) return null;
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
          fromRole: "deaf-user",
          targetRole: "interpreter",
          candidate: event.candidate
        })
      );
    };

    pcRef.current = pc;
    return pc;
  }

  useEffect(() => {
    const rememberedCameraEnabled = localStorage.getItem(DEAF_CAMERA_ENABLED_STORAGE_KEY);
    if (rememberedCameraEnabled === "false") {
      setCameraEnabled(false);
    }
    setSipWsServer(localStorage.getItem(SIP_WS_STORAGE_KEY) || process.env.NEXT_PUBLIC_SIP_WS_SERVER || "");
    setSipAor(localStorage.getItem(SIP_AOR_STORAGE_KEY) || process.env.NEXT_PUBLIC_SIP_AOR || "");
    setSipAuthUser(localStorage.getItem(SIP_AUTH_USER_STORAGE_KEY) || process.env.NEXT_PUBLIC_SIP_AUTH_USER || "");
    setSipAuthPassword(localStorage.getItem(SIP_AUTH_PASSWORD_STORAGE_KEY) || process.env.NEXT_PUBLIC_SIP_AUTH_PASSWORD || "");
    try {
      const stored = localStorage.getItem(DEAF_CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          setChatBySession(parsed);
          chatBySessionRef.current = parsed;
        }
      }
    } catch {}

    const signalingUrl =
      process.env.NEXT_PUBLIC_SIGNALING_URL ||
      `${window.location.protocol === "https:" ? "wss" : "ws"}://${window.location.hostname}:4001`;
    const ws = connectSignaling(signalingUrl);
    wsRef.current = ws;

    ws.onmessage = async (msg) => {
      const payload = JSON.parse(msg.data as string);
      setEvents((prev) => [`${new Date().toLocaleTimeString()} ${payload.type}`, ...prev].slice(0, 20));
      if (payload.type === "welcome") {
        setStatus("connected");
      }
      if (payload.type === "call-request-ack") {
        if (payload.sessionId) setActiveSessionId(payload.sessionId);
        setStatus(`request-ack:${payload.status}:${payload.sessionId}`);
      }
      if (payload.type === "incoming-call") {
        setIncomingSessionId(payload.sessionId);
        setStatus(`ringing:${payload.sessionId}`);
      }
      if (payload.type === "call-accepted") {
        setActiveSessionId(payload.sessionId || activeSessionId);
        if (payload.sipAddress || lastCallModeRef.current === "sip") {
          setStatus(`interpreter-connected:sip-dialing:${payload.sessionId}`);
        } else {
          setStatus(`connected:${payload.sessionId}`);
        }
        if (callInitiatorRef.current && payload.sessionId) {
          const pc = await preparePeerForSession(payload.sessionId);
          if (pc && wsRef.current) {
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            wsRef.current.send(
              JSON.stringify({
                type: "webrtc-offer",
                sessionId: payload.sessionId,
                fromRole: "deaf-user",
                targetRole: "interpreter",
                sdp: offer
              })
            );
          }
        }
      }

      if (payload.type === "call-ended") {
        await exitVideoFullscreen();
        cleanupPeerConnection();
        setIncomingSessionId(null);
        setActiveSessionId(null);
        setIsInterpreterTyping(false);
        setRttInput("");
        setRemoteRttText("");
        setIsRemoteRttActive(false);
        remoteRttSeqRef.current = 0;
        setStatus(`call-ended:${payload.sessionId || ""}`);
      }

      if (payload.type === "sip-dial-status") {
        setStatus(`sip-${payload.status || "unknown"}:${payload.to || ""}`);
      }

      if (payload.type === "webrtc-offer" && payload.targetRole === "deaf-user" && payload.sessionId) {
        const pc = await preparePeerForSession(payload.sessionId);
        if (!pc || !wsRef.current) return;
        await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        wsRef.current.send(
          JSON.stringify({
            type: "webrtc-answer",
            sessionId: payload.sessionId,
            fromRole: "deaf-user",
            targetRole: "interpreter",
            sdp: answer
          })
        );
      }

      if (payload.type === "webrtc-answer" && payload.targetRole === "deaf-user" && payload.sdp && pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      }

      if (payload.type === "webrtc-ice" && payload.targetRole === "deaf-user" && payload.candidate && pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch {}
      }

      if (payload.type === "chat-message") {
        const visibleToDeafUser = payload.fromRole === "deaf-user" || payload.targetRole === "deaf-user";
        if (!visibleToDeafUser) return;
        if (!payload.sessionId) return;
        appendChatMessage(payload.sessionId, {
          fromRole: payload.fromRole || "unknown",
          text: payload.text || "",
          sentAt: payload.sentAt || new Date().toISOString()
        });
      }

      if (payload.type === "chat-typing" && payload.targetRole === "deaf-user" && payload.sessionId === activeSessionIdRef.current) {
        setIsInterpreterTyping(Boolean(payload.isTyping));
      }

      if (payload.type === "rtt-update" && payload.targetRole === "deaf-user" && payload.sessionId === activeSessionIdRef.current) {
        const seq = Number.isInteger(payload.seq) ? payload.seq : 0;
        if (seq <= remoteRttSeqRef.current) return;
        remoteRttSeqRef.current = seq;
        setRemoteRttText(payload.text || "");
        setIsRemoteRttActive(Boolean(payload.isActive));
      }
    };

    ws.onopen = () => {
      const token = getToken();
      ws.send(JSON.stringify({ type: "join", role: "deaf-user", token }));
    };

    const url = new URL(window.location.href);
    if (url.searchParams.get("mock_auth") === "1") {
      localStorage.setItem("id_token", "mock-id-token");
      setStatus("authenticated");
      url.searchParams.delete("mock_auth");
      window.history.replaceState({}, "", url.toString());
    }

    refreshCameraList().catch(() => {});
    const onDeviceChange = () => {
      loadCameras().catch(() => {});
    };
    navigator.mediaDevices?.addEventListener?.("devicechange", onDeviceChange);

    return () => {
      cleanupPeerConnection();
      ws.close();
      navigator.mediaDevices?.removeEventListener?.("devicechange", onDeviceChange);
    };
  }, []);

  useEffect(() => {
    selectedCameraIdRef.current = selectedCameraId;
    if (selectedCameraId) {
      localStorage.setItem(DEAF_CAMERA_STORAGE_KEY, selectedCameraId);
    }
  }, [selectedCameraId]);

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

  useEffect(() => {
    lastCallModeRef.current = lastCallMode;
  }, [lastCallMode]);

  useEffect(() => {
    sipConfigRef.current = {
      wsServer: sipWsServer.trim(),
      aor: sipAor.trim(),
      authUser: sipAuthUser.trim(),
      authPassword: sipAuthPassword
    };
    localStorage.setItem(SIP_WS_STORAGE_KEY, sipWsServer);
    localStorage.setItem(SIP_AOR_STORAGE_KEY, sipAor);
    localStorage.setItem(SIP_AUTH_USER_STORAGE_KEY, sipAuthUser);
    localStorage.setItem(SIP_AUTH_PASSWORD_STORAGE_KEY, sipAuthPassword);
  }, [sipWsServer, sipAor, sipAuthUser, sipAuthPassword]);

  useEffect(() => {
    cameraEnabledRef.current = cameraEnabled;
    localStorage.setItem(DEAF_CAMERA_ENABLED_STORAGE_KEY, String(cameraEnabled));
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach((track) => (track.enabled = cameraEnabled));
    }
  }, [cameraEnabled]);

  async function handleStartCall() {
    if (!wsRef.current) return;
    callInitiatorRef.current = true;
    setLastCallMode("interpreter");
    wsRef.current.send(JSON.stringify({ type: "call-request", caller: "deaf-user", target: "interpreter-queue" }));
    setStatus("call-requested:interpreter");
    setMediaError("");
  }

  async function handleStartSipCall() {
    if (!sipAddress.trim()) {
      setMediaError("SIP address is required for SIP ring.");
      return;
    }
    setMediaError("");
    setLastCallMode("sip");
    await sipClient.dial(sipAddress.trim(), (sipStatus, detail) => {
      setStatus(detail ? `${sipStatus}:${detail}` : sipStatus);
      if (sipStatus === "sip-answered") sipActiveRef.current = true;
      if (sipStatus === "sip-ended" || sipStatus === "sip-failed") sipActiveRef.current = false;
    }, sipConfigRef.current);
  }

  async function handleAcceptIncomingCall() {
    if (!wsRef.current || !incomingSessionId) return;
    const sessionId = incomingSessionId;
    wsRef.current.send(
      JSON.stringify({
        type: "call-accept",
        sessionId,
        acceptedBy: "deaf-user"
      })
    );
    await preparePeerForSession(sessionId);
    callInitiatorRef.current = false;
    setStatus(`connected:${sessionId}`);
    setActiveSessionId(sessionId);
    setIncomingSessionId(null);
  }

  function sendChatMessage() {
    if (!wsRef.current || !activeSessionId) return;
    const text = chatInput.trim();
    if (!text) return;

    wsRef.current.send(
      JSON.stringify({
        type: "chat-message",
        sessionId: activeSessionId,
        fromRole: "deaf-user",
        targetRole: "interpreter",
        text
      })
    );
    wsRef.current.send(
      JSON.stringify({
        type: "chat-typing",
        sessionId: activeSessionId,
        fromRole: "deaf-user",
        targetRole: "interpreter",
        isTyping: false
      })
    );
    setChatInput("");
    setIsInterpreterTyping(false);
  }

  function sendTypingSignal(nextText?: string) {
    if (!wsRef.current || !activeSessionId) return;
    const isTyping = Boolean((nextText ?? chatInput).trim());
    if (!isTyping) {
      wsRef.current.send(
        JSON.stringify({
          type: "chat-typing",
          sessionId: activeSessionId,
          fromRole: "deaf-user",
          targetRole: "interpreter",
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
        fromRole: "deaf-user",
        targetRole: "interpreter",
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
        fromRole: "deaf-user",
        targetRole: "interpreter",
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

  function handleEndCall() {
    if (lastCallMode === "sip") {
      void sipClient.end((sipStatus, detail) => {
        setStatus(detail ? `${sipStatus}:${detail}` : sipStatus);
      });
      sipActiveRef.current = false;
      return;
    }
    if (!wsRef.current || !activeSessionId) return;
    sendRttUpdate("", true);
    wsRef.current.send(JSON.stringify({ type: "call-end", sessionId: activeSessionId, endedBy: "deaf-user" }));
    void exitVideoFullscreen();
    cleanupPeerConnection();
    setIncomingSessionId(null);
    setActiveSessionId(null);
    setStatus("call-ended");
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
      <h1>Deaf User Layout</h1>
      <p>Status: {status}</p>
      {incomingSessionId ? (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            borderRadius: 10,
            border: "3px solid #b91c1c",
            background: "#fef2f2",
            color: "#7f1d1d",
            fontWeight: 700
          }}
        >
          Incoming Call: {incomingSessionId}
        </div>
      ) : null}
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
            {!isVideoStageFullscreen ? <h2 style={{ marginTop: 0, marginBottom: 0 }}>Interpreter Video</h2> : null}
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
      {activeSessionId ? (
        <div style={{ marginTop: 12, padding: 10, border: "2px solid #16a34a", borderRadius: 8, background: "#ecfdf5" }}>
          Active relay session: <strong>{activeSessionId}</strong> (signaling connected)
        </div>
      ) : null}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={() => login()}>Login</button>
        <button onClick={handleStartCall}>Ring Interpreter</button>
        <button onClick={handleStartSipCall}>Ring SIP Target</button>
        {incomingSessionId ? <button onClick={handleAcceptIncomingCall}>Accept Incoming Call</button> : null}
        <button onClick={handleEndCall} disabled={!activeSessionId && !sipActiveRef.current}>
          End Call
        </button>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <label htmlFor="deaf-sip-address">SIP Address:</label>
        <input
          id="deaf-sip-address"
          value={sipAddress}
          onChange={(e) => setSipAddress(e.target.value)}
          placeholder="name@domain"
          style={{ minWidth: 280 }}
        />
        <button onClick={handleStartSipCall}>Ring This SIP</button>
        <button onClick={handleEndCall} disabled={!activeSessionId && !sipActiveRef.current}>
          End Call
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: 8, marginTop: 8, alignItems: "center" }}>
        <label htmlFor="sip-ws-server">SIP WS Server:</label>
        <input
          id="sip-ws-server"
          value={sipWsServer}
          onChange={(e) => setSipWsServer(e.target.value)}
          placeholder="wss://your-sip-server:7443"
        />
        <label htmlFor="sip-aor">SIP AOR:</label>
        <input id="sip-aor" value={sipAor} onChange={(e) => setSipAor(e.target.value)} placeholder="sip:username@domain" />
        <label htmlFor="sip-auth-user">SIP Auth User:</label>
        <input id="sip-auth-user" value={sipAuthUser} onChange={(e) => setSipAuthUser(e.target.value)} placeholder="username" />
        <label htmlFor="sip-auth-password">SIP Auth Password:</label>
        <input
          id="sip-auth-password"
          type="password"
          value={sipAuthPassword}
          onChange={(e) => setSipAuthPassword(e.target.value)}
          placeholder="password"
        />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        <label htmlFor="deaf-camera">Camera:</label>
        <select id="deaf-camera" value={selectedCameraId} onChange={(e) => setSelectedCameraId(e.target.value)}>
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
          placeholder={activeSessionId ? "Type live RTT to interpreter..." : "Start a call to enable RTT"}
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
              <strong>Interpreter RTT:</strong> {remoteRttText || "..."}
            </div>
          ) : (
            <div>No live RTT from interpreter</div>
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
            placeholder={activeSessionId ? "Type message to interpreter" : "Start a call to enable chat"}
            disabled={!activeSessionId}
          />
          <button onClick={sendChatMessage} disabled={!activeSessionId || !chatInput.trim()}>
            Send
          </button>
        </div>
        {isInterpreterTyping ? <div style={{ marginBottom: 8, color: "#6b7280" }}>Interpreter is typing...</div> : null}
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 6, padding: 8, minHeight: 90, maxHeight: 170, overflowY: "auto" }}>
          {getChatMessagesForActiveSession().length === 0 ? (
            <div>No messages yet</div>
          ) : (
            getChatMessagesForActiveSession().map((entry, idx) => (
              <div key={idx}>
                <strong>{entry.fromRole === "deaf-user" ? "You" : "Interpreter"}:</strong> {entry.text}
                <span style={{ marginLeft: 8, color: "#6b7280", fontSize: 12 }}>{formatChatTime(entry.sentAt)}</span>
              </div>
            ))
          )}
        </div>
      </section>
      {mediaError ? <p style={{ color: "#b91c1c" }}>Media error: {mediaError}</p> : null}
      <section style={{ marginTop: 20 }}>
        <h2 style={{ marginBottom: 8 }}>Event Log</h2>
        <div style={{ border: "1px solid #374151", borderRadius: 8, padding: 10, minHeight: 120 }}>
          {events.length ? events.map((line, idx) => <div key={idx}>{line}</div>) : <div>No events yet</div>}
        </div>
      </section>
    </div>
  );
}
