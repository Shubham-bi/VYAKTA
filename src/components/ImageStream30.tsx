import { useEffect, useRef, useState } from "react";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const VIDEO_WS_URL = import.meta.env.VITE_VIDEO_WS_URL as string;

type Props = {
  autoStart?: boolean;
  camOn?: boolean;
  onTextUpdate?: (text: string) => void;
  onSpeechInitChange?: (initialized: boolean, enabled: boolean) => void;
  onStatusChange?: (status: string) => void;
  hideControls?: boolean;
};

export default function ImageStream30({
  autoStart = false,
  camOn = true,
  onTextUpdate,
  onSpeechInitChange,
  onStatusChange,
  hideControls = false,
}: Props) {
  // UI state
  const [wsStatus, setWsStatus] = useState<string>("disconnected");
  const [capturing, setCapturing] = useState<boolean>(false);
  const [typed, setTyped] = useState<string>("");

  // refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<any> | null>(null);
  const stopFlagRef = useRef<boolean>(false);
  const terminalRef = useRef<HTMLDivElement | null>(null);

  // typing buffer
  const pendingRef = useRef<string>("");
  const typerRef = useRef<any>(null);

  // Speech state
  const [speechInitialized, setSpeechInitialized] = useState<boolean>(false);
  const [speakingEnabled, setSpeakingEnabled] = useState<boolean>(true);

  // init speech on user gesture
  const initSpeech = () => {
    try {
      if (!("speechSynthesis" in window)) {
        setSpeechInitialized(false);
        return;
      }
      // warm up
      const warm = new SpeechSynthesisUtterance("");
      window.speechSynthesis.speak(warm);
      setSpeechInitialized(true);
    } catch {
      setSpeechInitialized(false);
    }
  };

  // Notify parent of WS status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(wsStatus);
    }
  }, [wsStatus, onStatusChange]);


  // ElevenLabs
  // Speech handling with ElevenLabs (refs initialized below)
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const speechBufferRef = useRef<string>("");
  const ttsCacheRef = useRef<Map<string, string>>(new Map()); // Cache text -> blobUrl
  const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

  function cleanText(text: string) {
    return text
      .replace(/\b(um|uh|okay|so)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const playNextInQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) return;

    // Peek first, don't shift yet (in case of error we might want to retry or just skip)
    const rawText = audioQueueRef.current[0];
    if (!rawText) {
      audioQueueRef.current.shift();
      return;
    }

    // Clean text before using
    const text = cleanText(rawText);
    if (!text || text.length === 0) {
      audioQueueRef.current.shift();
      playNextInQueue();
      return;
    }

    isPlayingRef.current = true;
    audioQueueRef.current.shift(); // consume

    try {
      // Check Cache
      if (ttsCacheRef.current.has(text)) {
        const url = ttsCacheRef.current.get(text)!;
        const audio = new Audio(url);
        audio.onended = () => {
          isPlayingRef.current = false;
          playNextInQueue();
        };
        audio.onerror = () => {
          isPlayingRef.current = false;
          playNextInQueue();
        };
        await audio.play();
        return;
      }

      if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.includes("YOUR_")) {
        console.warn("ElevenLabs API Key missing in .env");
        isPlayingRef.current = false;
        return;
      }

      const client = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });

      const audioStream = await client.textToSpeech.convert("JBFqnCBsd6RMkjVDRZzb", {
        text,
        modelId: "eleven_turbo_v2",
        outputFormat: "mp3_44100_128",
        voiceSettings: {
          stability: 0.45,
          similarityBoost: 0.75,
          style: 0.4,
          useSpeakerBoost: true,
        }
      });

      // Browser playback from stream
      const chunks: Uint8Array[] = [];
      const reader = audioStream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      const blob = new Blob(chunks as any[], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);

      // Cache it
      ttsCacheRef.current.set(text, url);

      const audio = new Audio(url);
      audio.onended = () => {
        // We do NOT revoke url here because we cached it.
        // We will revoke on component unmount or map clear.
        isPlayingRef.current = false;
        playNextInQueue();
      };
      audio.onerror = (e) => {
        console.error("Audio playback error", e);
        isPlayingRef.current = false;
        playNextInQueue();
      };

      await audio.play();

    } catch (err) {
      console.error("ElevenLabs TTS Error:", err);
      isPlayingRef.current = false;
      playNextInQueue();
    }
  };

  const speakNow = (text: string) => {
    if (!speakingEnabled) return;
    if (!text || text.trim().length === 0) return;
    speechBufferRef.current += text;
  };

  // Buffer process loop (Smart Buffering)
  useEffect(() => {
    const interval = setInterval(() => {
      const buf = speechBufferRef.current;
      if (!buf || buf.trim().length === 0) return;

      // Optimization: Only send if sentence is complete OR buffer is large enough
      const isSentenceEnd = /[.!?]$/.test(buf.trim());
      const isLongEnough = buf.length >= 120; // ~ 20-30 words

      if (isSentenceEnd || isLongEnough) {
        audioQueueRef.current.push(buf);
        speechBufferRef.current = "";
        playNextInQueue();
      }
    }, 1000); // Check every 1s

    return () => clearInterval(interval);
  }, []);

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      ttsCacheRef.current.forEach(url => URL.revokeObjectURL(url));
      ttsCacheRef.current.clear();
    };
  }, []);

  const toggleSpeech = () => {
    setSpeakingEnabled(!speakingEnabled);
  };



  useEffect(() => {
    // Notify parent about speech capability
    if (onSpeechInitChange) {
      // Assuming speech is always "ready" in this simplified version
      onSpeechInitChange(true, true);
    }

    // typewriter at ~60Hz
    typerRef.current = setInterval(() => {
      const buf = pendingRef.current;
      if (!buf) return;
      const take = Math.min(3, buf.length);
      const chunk = buf.slice(0, take);

      setTyped((t) => t + chunk);
      pendingRef.current = buf.slice(take);

      // Notify parent of text update
      if (onTextUpdate) {
        // We need to pass the *full* updated text.
        // Since setTyped is async, we can't just use 'typed' here easily without an effect.
        // But the reference code does local typing.
        // Let's rely on the effect below to sync with parent.
      }
    }, 16);

    // Auto-start if requested
    if (autoStart) {
      startCapture();
    }

    const onUserGesture = () => initSpeech();
    const onToggleSpeech = () => setSpeakingEnabled(prev => !prev);

    window.addEventListener("userGestureEnableSpeech", onUserGesture);
    window.addEventListener("toggleSpeech", onToggleSpeech);

    return () => {
      clearInterval(typerRef.current);
      stopCapture();
      window.removeEventListener("userGestureEnableSpeech", onUserGesture);
      window.removeEventListener("toggleSpeech", onToggleSpeech);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Notify parent of speech state
  useEffect(() => {
    if (onSpeechInitChange) {
      onSpeechInitChange(speechInitialized, speakingEnabled);
    }
  }, [speechInitialized, speakingEnabled, onSpeechInitChange]);

  // Sync typed text with parent
  useEffect(() => {
    if (onTextUpdate) {
      onTextUpdate(typed);
    }

    // Auto-scroll local terminal
    const el = terminalRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typed, onTextUpdate]);

  const connectWS = () =>
    new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(VIDEO_WS_URL);
      ws.binaryType = "arraybuffer";
      ws.onopen = () => {
        setWsStatus("connected");
        resolve(ws);
      };

      // Persistent close handler
      ws.onclose = () => setWsStatus("disconnected");

      // Handshake error handler (overridden on success in some patterns, but here we keep simple)
      ws.onerror = (e) => {
        setWsStatus("error");
        reject(e);
      };

      ws.onmessage = (e) => {
        try {
          const raw = typeof e.data === "string" ? e.data : new TextDecoder().decode(e.data);
          const msg = JSON.parse(raw);
          if (msg.delta) {
            pendingRef.current += msg.delta;
            speakNow(msg.delta);
          }
        } catch {
          /* ignore */
        }
      };
    });

  async function startCapture() {
    if (capturing) return;
    setTyped("");
    pendingRef.current = ""; // Clear pending text buffer
    speechBufferRef.current = ""; // Clear speech buffer
    stopFlagRef.current = false;

    try {
      // 1) get camera stream FIRST (so user sees themselves immediately)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, frameRate: { ideal: 30, max: 30 } },
        audio: false,
      });

      if (stopFlagRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;

      // honor cameraOn prop logic
      const track = stream.getVideoTracks()[0];
      track.enabled = !!camOn;

      // bind preview
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        await v.play().catch(() => { });
        // Set capturing true so UI shows "Stop Stream" and video is visible
        setCapturing(true);
      }

      // 2) open WS (non-blocking for camera preview)
      try {
        const ws = await connectWS();
        wsRef.current = ws;
      } catch (wsErr) {
        console.warn("WS connection failed, but camera is running", wsErr);
      }

      // 3) setup encoder pipeline
      const w = 1280, h = 720, quality = 0.6;
      // Polyfill check or assume modern browser
      // @ts-ignore
      const processor = new window.MediaStreamTrackProcessor({ track });
      const reader = processor.readable.getReader();
      readerRef.current = reader;

      const offscreen = new OffscreenCanvas(w, h); // standard in modern browsers
      const ctx = offscreen.getContext("2d", { desynchronized: true, alpha: false }) as OffscreenCanvasRenderingContext2D;
      // @ts-ignore
      const hasImageEncoder = "ImageEncoder" in window;

      async function encodeWebP(frame: VideoFrame) {
        // @ts-ignore
        if (hasImageEncoder) {
          // @ts-ignore
          const enc = new ImageEncoder({ type: "image/webp", quality, width: w, height: h });
          const { encoded } = await enc.encode(frame);
          const size = encoded.allocationSize();
          const buf = new ArrayBuffer(size);
          await encoded.copyTo(buf);
          return new Uint8Array(buf);
        }

        ctx.drawImage(frame, 0, 0, w, h);
        const blob = await offscreen.convertToBlob({ type: "image/webp", quality });
        return new Uint8Array(await blob.arrayBuffer());
      }

      let seq = 0;

      // 4) pumping loop
      (async function pump() {
        while (!stopFlagRef.current) {
          const result = await reader.read();
          if (result.done || !result.value) break;
          const frame = result.value;

          // if camera is toggled off (via prop sync), just drop frames until it's back on
          // We check the track enabled state or the prop
          if (!track.enabled) { // or !camOn
            frame.close();
            continue;
          }

          // backpressure: drop frames if WS congested or not connected
          const ok =
            wsRef.current &&
            wsRef.current.readyState === WebSocket.OPEN &&
            wsRef.current.bufferedAmount < 2_000_000;

          // If WS is not OK, we still consume frames (to keep reader draining) but don't send
          if (!ok) {
            frame.close();
            continue;
          }

          const payload = await encodeWebP(frame);
          frame.close();

          // Build header: [1 byte type][4 bytes seq][8 bytes timestamp]
          const header = new ArrayBuffer(13);
          const dv = new DataView(header);
          dv.setUint8(0, 0x11);
          dv.setUint32(1, seq >>> 0);
          // try setBigUint64
          try {
            dv.setBigUint64(5, BigInt(Date.now()));
          } catch {
            dv.setUint32(5, Math.floor(Date.now() / 1000));
          }

          const out = new Uint8Array(header.byteLength + payload.byteLength);
          out.set(new Uint8Array(header), 0);
          out.set(payload, header.byteLength);

          wsRef.current?.send(out.buffer);
          seq++;
        }
        // finished
        setCapturing(false);
      })().catch((e) => {
        console.error("pump error", e);
        setCapturing(false);
      });

    } catch (err) {
      console.error("Start capture error", err);
      // cleanup if failed
      stopCapture();
    }
  }

  function stopCapture() {
    stopFlagRef.current = true;

    // 1. Stop all tracks immediately (robust global cleanup)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = null;

    // 2. Clear video source
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    try {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    } catch { }

    try {
      if (wsRef.current) {
        try {
          if (wsRef.current.readyState === WebSocket.OPEN) {
            try {
              wsRef.current.send(JSON.stringify({ type: "client_disconnect" }));
            } catch { }
          }
        } finally {
          try {
            wsRef.current.close();
          } catch { }
          wsRef.current = null;
        }
      }
    } catch { }

    setCapturing(false);
  }

  // auto start when MeetingRoom loads
  useEffect(() => {
    if (autoStart && !capturing) startCapture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // apply camera toggle from MeetingRoom
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = camOn;
      });
    }
  }, [camOn]);

  // cleanup on unmount
  useEffect(() => {
    const onEndMeeting = () => stopCapture();
    window.addEventListener("endMeeting", onEndMeeting);

    return () => {
      window.removeEventListener("endMeeting", onEndMeeting);
      stopCapture();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden group">
      {/* Video fills the container */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
      />

      {/* Internal controls overlay (only if hideControls is false) */}
      {!hideControls && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4 pointer-events-none">
          <div className="pointer-events-auto flex items-start justify-between">
            <div className="bg-black/60 px-3 py-1 rounded-full text-white text-xs backdrop-blur-md border border-white/10">
              WS: {wsStatus}
            </div>
          </div>

          <div className="pointer-events-auto flex items-center justify-center gap-4">
            {!capturing && !autoStart && (
              <button
                onClick={startCapture}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition"
              >
                Start Stream
              </button>
            )}
            {capturing && (
              <button
                onClick={stopCapture}
                className="px-4 py-2 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition"
              >
                Stop Stream
              </button>
            )}
          </div>

          <div className="pointer-events-auto flex items-center justify-center gap-4">
            {/* Speaker Toggle */}
            <button
              onClick={toggleSpeech}
              className={`p-2 rounded-full shadow-lg transition ${speakingEnabled ? "bg-white text-indigo-600" : "bg-gray-800 text-gray-400"
                }`}
              title={speakingEnabled ? "Mute Speech" : "Enable Speech"}
            >
              {speakingEnabled ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
              )}
            </button>

            <div className="pointer-events-auto text-white/80 text-xs">
              {/* Other debug toggles could go here */}
            </div>
          </div>
        </div>
      )}

      {/* Debug terminal: Show ONLY if onTextUpdate is NOT provided (standalone mode) */}
      {!onTextUpdate && (
        <div
          ref={terminalRef}
          className="absolute bottom-4 left-4 right-4 h-32 bg-black/80 backdrop-blur-sm border border-white/10 rounded-lg p-3 text-green-400 font-mono text-xs overflow-y-auto shadow-2xl"
        >
          <div className="sticky top-0 bg-black/80 border-b border-white/10 pb-1 mb-2 text-white font-bold uppercase tracking-wider text-[10px]">
            Incoming Live Text
          </div>
          {typed}
          <span className="animate-pulse">_</span>
        </div>
      )}
    </div>
  );
}
