import { useEffect, useRef, useState } from "react";

const VIDEO_WS_URL = import.meta.env.VITE_VIDEO_WS_URL as string;

export default function ImageStream30() {
  const [wsStatus, setWsStatus] = useState<string>("disconnected");
  const [capturing, setCapturing] = useState<boolean>(false);
  const [cameraOn, setCameraOn] = useState<boolean>(true);
  const [typed, setTyped] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const readerRef = useRef<ReadableStreamDefaultReader<any> | null>(null);
  const pendingRef = useRef<string>("");
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const stopFlagRef = useRef<boolean>(false);

  const speak = (text: string) => {
    if (!text) return;
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-IN";
    speech.rate = 1.8;
    speech.pitch = 1;
    speechSynthesis.speak(speech);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const buf = pendingRef.current;
      if (!buf) return;

      const take = Math.min(3, buf.length);
      setTyped(t => t + buf.slice(0, take));
      pendingRef.current = buf.slice(take);
    }, 16);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = terminalRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [typed]);

  const connectWS = () =>
    new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(VIDEO_WS_URL);
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        setWsStatus("connected");
        resolve(ws);
      };
      ws.onclose = () => setWsStatus("disconnected");
      ws.onerror = e => {
        setWsStatus("error");
        reject(e);
      };
      ws.onmessage = e => {
        try {
          const raw = typeof e.data === "string"
            ? e.data
            : new TextDecoder().decode(e.data);

          const msg = JSON.parse(raw);
          if (msg.delta) {
            pendingRef.current += msg.delta;
            speak(msg.delta);
          }
        } catch {}
      };
    });

  async function startCapture() {
    if (capturing) return;

    setTyped("");
    stopFlagRef.current = false;

    const ws = await connectWS();
    wsRef.current = ws;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 1280, height: 720, frameRate: { ideal: 30, max: 30 } },
      audio: false
    });

    streamRef.current = stream;
    const track = stream.getVideoTracks()[0];
    track.enabled = cameraOn;

    const v = videoRef.current!;
    v.srcObject = stream;
    await v.play();

    const processor = new (window as any).MediaStreamTrackProcessor({ track });
    const reader = processor.readable.getReader();
    readerRef.current = reader;

    const canvas = new OffscreenCanvas(1280, 720);
    const ctx = canvas.getContext("2d");

    setCapturing(true);
    let seq = 0;

    (async function pump() {
      while (!stopFlagRef.current) {
        const { value: frame, done } = await reader.read();
        if (done || !frame) break;

        if (!cameraOn) {
          frame.close();
          continue;
        }

        if (!wsRef.current || wsRef.current.readyState !== 1) {
          frame.close();
          continue;
        }

        ctx?.drawImage(frame, 0, 0);
        const blob = await canvas.convertToBlob({ type: "image/webp", quality: 0.6 });
        const payload = new Uint8Array(await blob.arrayBuffer());

        const header = new ArrayBuffer(13);
        const dv = new DataView(header);
        dv.setUint8(0, 0x11);
        dv.setUint32(1, seq);
        dv.setBigUint64(5, BigInt(Date.now()));

        const out = new Uint8Array(13 + payload.length);
        out.set(new Uint8Array(header), 0);
        out.set(payload, 13);

        wsRef.current.send(out);
        frame.close();
        seq++;
      }

      setCapturing(false);
    })();
  }

  function stopCapture() {
    stopFlagRef.current = true;
    readerRef.current?.cancel().catch(() => {});
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    wsRef.current?.close();
    wsRef.current = null;
    setCapturing(false);
  }

  return (
    <div className="flex gap-4">
      <div>
        <div>WS(video): {wsStatus}</div>

        {!capturing ? (
          <button onClick={startCapture}>Start</button>
        ) : (
          <button onClick={stopCapture}>Stop</button>
        )}

        <button onClick={() => setCameraOn(v => !v)}>
          {cameraOn ? "Camera Off" : "Camera On"}
        </button>

        <video ref={videoRef} autoPlay muted playsInline width={320} height={180} />
      </div>

      <div ref={terminalRef} className="p-2 bg-black text-white w-72 h-48 overflow-auto rounded">
        {typed}
      </div>
    </div>
  );
}
