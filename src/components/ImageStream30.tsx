import { useEffect, useRef, useState } from "react";

const VIDEO_WS_URL = import.meta.env.VITE_VIDEO_WS_URL as string;

type Props = {
  autoStart?: boolean;
  camOn?: boolean;
  onTextUpdate?: (text: string) => void;
  onSpeechInitChange?: (initialized: boolean, enabled: boolean) => void;
  onStatusChange?: (status: string) => void;
  onSpeechHighlight?: (startIndex: number, length: number) => void;
  hideControls?: boolean;
};

export default function ImageStream30({
  autoStart = false,
  camOn = true,
  onTextUpdate,
  onSpeechInitChange,
  onStatusChange,
  onSpeechHighlight,
  hideControls = false,

}: Props) {
  // UI state
  const [wsStatus, setWsStatus] = useState<string>("disconnected");
  const [capturing, setCapturing] = useState<boolean>(false);
  const [typed, setTyped] = useState<string>("");
  const [sourceMode, setSourceMode] = useState<"camera" | "video">("camera");

  // refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<any> | null>(null);
  const stopFlagRef = useRef<boolean>(false);
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  // Speech handling
  // We use a Set to hold *multiple* active utterances to prevent GC of queued items
  const activeUtterancesRef = useRef<Set<SpeechSynthesisUtterance>>(new Set());
  const speechBufferRef = useRef<string>("");
  const speechIntervalRef = useRef<any>(null);
  const totalSpokenLengthRef = useRef<number>(0);

  const speakNow = (text: string) => {
    if (!speakingEnabled) return;
    // content check log
    // console.log("Received delta:", text); 
    speechBufferRef.current += text;
  };

  const toggleSpeech = () => {
    if (!speechInitialized) initSpeech();
    setSpeakingEnabled(!speakingEnabled);
  };

  // Dedicated loop to process speech buffer periodically
  useEffect(() => {
    speechIntervalRef.current = setInterval(() => {
      const text = speechBufferRef.current;
      if (!text || text.trim().length === 0) return;

      try {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = "en-IN";
        speech.rate = 1.2;
        speech.pitch = 1.0;

        // Capture current start offset for this utterance
        const startOffset = totalSpokenLengthRef.current;
        totalSpokenLengthRef.current += text.length;

        // Highlight tracking
        speech.onboundary = (e) => {
          if (e.name === 'word' && onSpeechHighlight) {
            // e.charIndex is relative to THIS utterance
            // Global index = startOffset + e.charIndex
            onSpeechHighlight(startOffset + e.charIndex, e.charLength || 0);
          }
        };

        // Add to Set
        activeUtterancesRef.current.add(speech);

        speech.onend = () => {
          activeUtterancesRef.current.delete(speech);
        };
        speech.onerror = (e) => {
          console.error("Speech error", e);
          activeUtterancesRef.current.delete(speech);
        };

        window.speechSynthesis.speak(speech);
        speechBufferRef.current = ""; // Clear buffer
      } catch (e) {
        console.error("Speech creation error", e);
      }
    }, 500); // Check every 500ms

    return () => {
      clearInterval(speechIntervalRef.current);
      // Cancel all
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      activeUtterancesRef.current.clear();
    };
  }, [speakingEnabled]);


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
          // if (msg.delta) {
          //   pendingRef.current += msg.delta;
          //   speakNow(msg.delta);
          // }

          if (msg.delta) {
            const chunkWithSpace = msg.delta + " ";

            pendingRef.current += chunkWithSpace;
            speakNow(chunkWithSpace);
          }

        } catch {
          /* ignore */
        }
      };
    });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCapture(); // Stop current stream if any
      setSourceMode("video");

      const videoUrl = URL.createObjectURL(file);
      if (videoRef.current) {
        // Reset source
        videoRef.current.srcObject = null;
        videoRef.current.src = videoUrl;
        videoRef.current.loop = true;

        // When metadata loads, start capture automatically
        videoRef.current.onloadedmetadata = () => {
          // Small delay to ensure readyState is sufficient or just call start
          startCapture();
        }
      }
    }
  };

  async function startCapture() {
    if (capturing) return;
    setTyped("");
    pendingRef.current = ""; // Clear pending text buffer
    speechBufferRef.current = ""; // Clear speech buffer
    totalSpokenLengthRef.current = 0; // Reset spoken length
    stopFlagRef.current = false;

    try {
      let stream: MediaStream;

      if (sourceMode === "camera") {
        // 1) get camera stream
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, frameRate: { ideal: 30, max: 30 } },
          audio: false,
        });

        if (stopFlagRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        // honor cameraOn prop logic
        const track = stream.getVideoTracks()[0];
        track.enabled = !!camOn;

        // bind preview logic for camera
        if (videoRef.current) {
          videoRef.current.src = ""; // clear possible file src
          videoRef.current.srcObject = stream;
        }
      } else {
        // Video Mode
        const v = videoRef.current;
        if (!v || !v.src) {
          console.error("No video source loaded");
          setSourceMode("camera"); // fallback to camera if no video
          return;
        }
        // ensure playing
        await v.play().catch(console.error);

        // specific captureStream handling
        // @ts-ignore
        stream = (v.mozCaptureStream || v.captureStream).call(v);
      }

      streamRef.current = stream;

      // Ensure video is playing for visibility
      if (videoRef.current) {
        await videoRef.current.play().catch(() => { });
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
      const track = stream.getVideoTracks()[0];
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
          // In video mode, we ignore camOn usually, but for consistency we might keep it or ignore.
          if (sourceMode === "camera" && !track.enabled) {
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
      // In firefox, stopping tracks from captureStream might affect video element?
      // Usually fine.
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    streamRef.current = null;

    // 2. Clear video source if needed
    if (videoRef.current) {
      videoRef.current.pause();
      // We don't clear src if it's a video file, so we can restart easily.
      if (sourceMode === "camera") {
        videoRef.current.srcObject = null;
      }
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
    if (streamRef.current && sourceMode === "camera") {
      streamRef.current.getVideoTracks().forEach((t) => {
        t.enabled = camOn;
      });
    }
  }, [camOn, sourceMode]);

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
        className={`w-full h-full object-cover ${sourceMode === "camera" ? "transform scale-x-[-1]" : ""}`} // No mirror for video file
      />

      {/* Invisible file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Always-available hidden controls overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-between">
        <div className="pointer-events-auto flex items-start justify-between">
          <div className="bg-black/60 px-3 py-1 rounded-full text-white text-xs backdrop-blur-md border border-white/10 flex items-center gap-2">
            <span>WS: {wsStatus}</span>
            {sourceMode === "video" && <span className="text-indigo-400 font-semibold">• Video Mode</span>}
          </div>

          {/* Hidden upload trigger - disguised as a small icon */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="pointer-events-auto opacity-70 hover:opacity-100 p-2 rounded-full text-white bg-white/10 hover:bg-white/20 transition backdrop-blur-md"
            title="Upload Video (Secret)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Internal controls overlay (only if hideControls is false) */}
      {!hideControls && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
          {/* Note: Removed top socket badge from here as it is now in the always-available overlay above */}

          <div className="pointer-events-auto flex items-center justify-center gap-4 mb-4">
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
