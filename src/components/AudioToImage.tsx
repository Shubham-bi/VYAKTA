import { useEffect, useRef, useState } from "react";

const AUDIO_WS_URL: string = import.meta.env.VITE_AUDIO_WS_URL!;

// Convert Float32 audio → Int16 PCM
function floatTo16PCM(float32: Float32Array): Uint8Array {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return new Uint8Array(out.buffer);
}

export default function AudioToImage() {
  const [wsStatus, setWsStatus] = useState<string>("disconnected");
  const [streaming, setStreaming] = useState<boolean>(false);
  const [micOn, setMicOn] = useState<boolean>(true);
  const [imgURL, setImgURL] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const stopFlagRef = useRef<boolean>(false);

  useEffect(() => {
    return () => stopAudio();
  }, []);

  // ---------------- WebSocket Connect ----------------
  const connectWS = () =>
    new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(AUDIO_WS_URL);
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        setWsStatus("connected");
        resolve(ws);
      };

      ws.onclose = () => setWsStatus("disconnected");
      ws.onerror = (e) => {
        setWsStatus("error");
        reject(e);
      };

      ws.onmessage = (e) => {
        const buf = new Uint8Array(e.data);
        if (buf.length < 13) return;
        if (buf[0] !== 0x42) return;

        const payload = buf.slice(13);
        const blob = new Blob([payload], { type: "image/webp" });
        const url = URL.createObjectURL(blob);

        setImgURL((old) => {
          if (old) URL.revokeObjectURL(old);
          return url;
        });
      };
    });

  // ---------------- Start Audio Streaming ----------------
  async function startAudio() {
    if (streaming) return;
    stopFlagRef.current = false;

    const ws = await connectWS();
    wsRef.current = ws;

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    mediaStreamRef.current = mediaStream;

    const ctx = new AudioContext({ sampleRate: 16000 });
    audioCtxRef.current = ctx;

    const src = ctx.createMediaStreamSource(mediaStream);
    sourceRef.current = src;

    const proc = ctx.createScriptProcessor(1024, 1, 1);
    procRef.current = proc;

    src.connect(proc);
    proc.connect(ctx.destination);

    let seq = 0;
    proc.onaudioprocess = (ev) => {
      if (stopFlagRef.current) return;
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

      if (!micOn) return;

      const float32 = ev.inputBuffer.getChannelData(0);
      const pcm = floatTo16PCM(float32);

      const header = new ArrayBuffer(13);
      const dv = new DataView(header);

      dv.setUint8(0, 0x21);
      dv.setUint32(1, seq >>> 0);
      dv.setBigUint64(5, BigInt(Date.now()));

      const out = new Uint8Array(header.byteLength + pcm.byteLength);
      out.set(new Uint8Array(header), 0);
      out.set(pcm, header.byteLength);

      if (wsRef.current.bufferedAmount < 256000) {
        wsRef.current.send(out.buffer);
        seq++;
      }
    };

    setStreaming(true);
  }

  // ---------------- Stop Audio ----------------
  function stopAudio() {
    stopFlagRef.current = true;

    procRef.current?.disconnect();
    sourceRef.current?.disconnect();
    audioCtxRef.current?.close();

    const ms = mediaStreamRef.current;
    ms?.getTracks().forEach((t) => t.stop());

    wsRef.current?.close();

    wsRef.current = null;
    mediaStreamRef.current = null;
    audioCtxRef.current = null;

    setStreaming(false);
  }

  // ---------------- Toggle Mic ----------------
  function toggleMic() {
    setMicOn((prev) => {
      const now = !prev;
      const ms = mediaStreamRef.current;
      ms?.getAudioTracks().forEach((t) => (t.enabled = now));
      return now;
    });
  }

  return (
    <div className="row">
      <div style={{ minWidth: 280 }}>
        <div className="badge">WS(audio): {wsStatus}</div>

        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          {!streaming ? (
            <button onClick={startAudio}>Start Streaming</button>
          ) : (
            <button onClick={stopAudio}>Stop Streaming</button>
          )}

          <button onClick={toggleMic}>{micOn ? "Mic Off" : "Mic On"}</button>
        </div>

        <p className="muted" style={{ marginTop: 8 }}>
          Streams audio → server → returns image frames
        </p>
      </div>

      <div>
        {imgURL ? (
          <img className="img" src={imgURL} alt="AI Output" />
        ) : (
          <div
            className="terminal"
            style={{ width: 340, height: 200, background: "#eee" }}
          >
            Waiting for image…
          </div>
        )}
      </div>
    </div>
  );
}
