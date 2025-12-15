import { useEffect, useRef, useState } from "react";

const AUDIO_WS_URL = import.meta.env.VITE_AUDIO_WS_URL;

// convert float32 audio → int16 pcm
function floatTo16PCM(float32: Float32Array) {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return new Uint8Array(out.buffer);
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function AudioToImage({ autoStart = false, micOn = true, onStatusChange }: { autoStart?: boolean, micOn?: boolean, onStatusChange?: (status: string) => void }) {
  const [wsStatus, setWsStatus] = useState<string>("disconnected");
  const [streaming, setStreaming] = useState<boolean>(false);
  const [imgURL, setImgURL] = useState<string | null>(null);
  const [localMicOn, setLocalMicOn] = useState<boolean>(micOn); // local control to toggle tracks when needed

  const wsRef = useRef<WebSocket | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const procRef = useRef<ScriptProcessorNode | AudioWorkletNode | null>(null); // ScriptProcessorNode or worklet node
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const stopFlagRef = useRef<boolean>(false);
  const seqRef = useRef<number>(0);

  // cleanup imgURL when changed/unmount
  useEffect(() => {
    return () => {
      if (imgURL) {
        URL.revokeObjectURL(imgURL);
      }
    };
  }, [imgURL]);

  // release resources on unmount
  useEffect(() => {
    return () => {
      stopFlagRef.current = true;
      stopAudio(); // do not await
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // if parent flips micOn prop, apply to media tracks (keeps in sync)
  useEffect(() => {
    setLocalMicOn(micOn ?? true);
    const ms = mediaStreamRef.current;
    if (ms) {
      ms.getAudioTracks().forEach((t) => (t.enabled = !!micOn));
    }
  }, [micOn]);

  // autostart effect
  useEffect(() => {
    if (autoStart && !streaming) startAudio();
    // include streaming so we don't repeatedly try to start
  }, [autoStart, streaming]);

  // Notify parent of status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(wsStatus);
    }
  }, [wsStatus, onStatusChange]);

  // connect websocket with small retry/backoff
  async function connectWS(maxAttempts = 3) {
    let lastErr: any = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await new Promise<WebSocket>((resolve, reject) => {
          const ws = new WebSocket(AUDIO_WS_URL);
          ws.binaryType = "arraybuffer";

          const cleanup = () => {
            ws.onopen = null;
            ws.onclose = null;
            ws.onerror = null;
            ws.onmessage = null;
          };

          ws.onopen = () => {
            cleanup();
            setWsStatus("connected");
            resolve(ws);
          };

          ws.onclose = () => {
            setWsStatus("disconnected");
          };

          ws.onerror = (e) => {
            cleanup();
            setWsStatus("error");
            reject(e);
          };

          ws.onmessage = (e) => {
            try {
              const buf = new Uint8Array(e.data as ArrayBuffer);
              console.log("WS Received:", buf.length, "bytes", "Header:", buf[0]);

              if (buf.length < 13) {
                console.warn("WS Frame too small");
                return;
              }
              if (buf[0] !== 0x42) {
                console.warn("WS Unknown tag:", buf[0]);
                return;
              } // image tag
              const payload = buf.slice(13);
              const blob = new Blob([payload], { type: "image/webp" });
              const url = URL.createObjectURL(blob);
              // revoke previous
              setImgURL((old) => {
                if (old) URL.revokeObjectURL(old);
                return url;
              });
            } catch (err) {
              console.error("ws onmessage error", err);
            }
          };
        });
      } catch (err) {
        lastErr = err;
        if (attempt < maxAttempts) {
          await sleep(200 * attempt);
        }
      }
    }
    throw lastErr;
  }

  async function startAudio() {
    if (streaming) return;
    stopFlagRef.current = false;
    seqRef.current = 0;

    try {
      const ws = await connectWS();
      wsRef.current = ws;

      // request microphone
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      mediaStreamRef.current = mediaStream;

      // apply initial mic state
      mediaStream.getAudioTracks().forEach((t) => {
        t.enabled = !!localMicOn;
      });

      // create AudioContext at 16000Hz to match server expectation
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioCtxRef.current = audioCtx;

      const src = audioCtx.createMediaStreamSource(mediaStream);
      sourceRef.current = src;

      // use AudioWorklet if available and supported, otherwise fallback to ScriptProcessorNode
      const supportsWorklet = !!audioCtx.audioWorklet;
      if (supportsWorklet) {
        try {
          // register a minimal inline worklet processor that forwards raw float frames via port
          // this avoids needing separate file, we create a blob URL for the processor code
          const processorCode = `
            class PCMProcessor extends AudioWorkletProcessor {
              process(inputs) {
                const input = inputs[0];
                if (input && input[0]) {
                  // post Float32Array to main thread (transfer possible later)
                  this.port.postMessage(input[0]);
                }
                return true;
              }
            }
            registerProcessor('pcm-processor', PCMProcessor);
          `;
          const blob = new Blob([processorCode], { type: "application/javascript" });
          const moduleURL = URL.createObjectURL(blob);
          await audioCtx.audioWorklet.addModule(moduleURL);
          URL.revokeObjectURL(moduleURL);

          const workletNode = new AudioWorkletNode(audioCtx, "pcm-processor");
          procRef.current = workletNode;

          // receive float32 chunks from worklet and forward them as Int16 PCM
          workletNode.port.onmessage = (ev) => {
            if (stopFlagRef.current) return;
            if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
            if (!localMicOn) return;

            const float32 = ev.data;
            const pcm = floatTo16PCM(float32);
            sendPcmChunk(pcm);
          };

          src.connect(workletNode);
          // do not connect worklet node to destination to avoid echo
        } catch (err) {
          // worklet registration failed; fallback to ScriptProcessorNode
          // console.warn("worklet failed, falling back to ScriptProcessor", err);
          createScriptProcessorFallback(audioCtx, src);
        }
      } else {
        createScriptProcessorFallback(audioCtx, src);
      }

      setStreaming(true);
    } catch (err) {
      console.error("startAudio failed:", err);
      setWsStatus("error");
      // best-effort cleanup
      stopAudio();
    }
  }

  // fallback creation of ScriptProcessorNode
  function createScriptProcessorFallback(audioCtx: AudioContext, src: MediaStreamAudioSourceNode) {
    // script processor is deprecated but widely supported as fallback
    const proc = audioCtx.createScriptProcessor(1024, 1, 1);
    procRef.current = proc;

    proc.onaudioprocess = (ev) => {
      if (stopFlagRef.current) return;
      const wsNow = wsRef.current;
      if (!wsNow || wsNow.readyState !== WebSocket.OPEN) return;
      if (!localMicOn) return;

      try {
        const float32 = ev.inputBuffer.getChannelData(0);
        const pcm = floatTo16PCM(float32);
        sendPcmChunk(pcm);
      } catch (err) {
        // ignore processing errors
      }
    };

    src.connect(proc);
    // avoid connecting proc to destination to prevent feedback
  }

  // builds a 13-byte header and sends binary blob (tag 0x21 for audio)
  function sendPcmChunk(pcmUint8: Uint8Array) {
    try {
      const header = new ArrayBuffer(13);
      const dv = new DataView(header);
      dv.setUint8(0, 0x21);
      dv.setUint32(1, seqRef.current >>> 0);
      try {
        dv.setBigUint64(5, BigInt(Date.now()));
      } catch {
        // fallback if BigInt not supported
        dv.setUint32(5, Math.floor(Date.now() / 1000));
      }

      const out = new Uint8Array(header.byteLength + pcmUint8.byteLength);
      out.set(new Uint8Array(header), 0);
      out.set(pcmUint8, header.byteLength);

      const wsNow = wsRef.current;
      if (!wsNow || wsNow.readyState !== WebSocket.OPEN) return;

      // throttle sending if bufferedAmount high
      if (wsNow.bufferedAmount < 256 * 1024) {
        // safe send
        try {
          wsNow.send(out.buffer);
          seqRef.current++;
        } catch (err) {
          // ignore send errors (ws likely closing)
        }
      }
    } catch (err) {
      // ignore header/pack errors
    }
  }

  // stop audio streaming and cleanup resources
  async function stopAudio() {
    stopFlagRef.current = true;

    // disconnect processor and source
    try {
      if (procRef.current) {
        try {
          // if worklet node, disconnect port and node
          if (procRef.current instanceof AudioWorkletNode) {
            procRef.current.port.onmessage = null;
            procRef.current.disconnect?.();
          } else {
            procRef.current.onaudioprocess = null;
            procRef.current.disconnect?.();
          }
        } catch { }
        procRef.current = null;
      }
    } catch { }

    try {
      if (sourceRef.current) {
        sourceRef.current.disconnect?.();
        sourceRef.current = null;
      }
    } catch { }

    try {
      if (audioCtxRef.current) {
        await audioCtxRef.current.close();
      }
    } catch { }

    // stop tracks
    try {
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch { }
    mediaStreamRef.current = null;

    // close websocket
    try {
      wsRef.current?.close();
    } catch { }
    wsRef.current = null;

    setStreaming(false);
    setWsStatus("disconnected");
  }



  return (
    <div className="space-y-3">
      {/* Status Badge Removed - Handled by Parent */}
      <div className="flex items-center justify-between">
        {streaming && (
          <div className="text-xs text-gray-500 font-medium ml-auto">
            Streaming...
          </div>
        )}
      </div>

      {/* Image Display */}
      <div className="rounded-xl overflow-hidden bg-gray-900 shadow-inner">
        {imgURL ? (
          <img
            src={imgURL}
            alt="AI output"
            className="w-full h-auto object-contain"
            style={{ minHeight: "200px", maxHeight: "400px" }}
          />
        ) : (
          <div className="flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-gray-400 italic"
            style={{ minHeight: "200px" }}
          >
            <div className="text-center">
              {/* Image/Gallery Icon */}
              <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm">Waiting for generated images...</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons - Hidden when autoStart is true */}
      {!autoStart && (
        <div className="flex gap-2">
          {!streaming ? (
            <button
              onClick={startAudio}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-indigo-700 transition-all duration-200 transform hover:-translate-y-0.5 text-sm font-semibold"
            >
              Start Streaming
            </button>
          ) : (
            <button
              onClick={stopAudio}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg hover:bg-red-700 transition-all duration-200 transform hover:-translate-y-0.5 text-sm font-semibold"
            >
              Stop Streaming
            </button>
          )}
        </div>
      )}

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center italic">
        Audio streams to server → returns image frames
      </p>
    </div>
  );
}
