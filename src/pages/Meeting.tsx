import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useParams, useLocation } from 'react-router-dom';
import { socketClient } from '../utils/socketClient';
import apiClient from '../api/apiClient';

// import apiClient from '../api/apiClient';   // ✅ FIXED import (do not use { apiClient })

// Icons (UNCHANGED)
const IconMic = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 11v1a7 7 0 0 1-14 0v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconMicOff = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 2l20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 5v6a3 3 0 0 0 5 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconVideo = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M16 10l5-3v10l-5-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconVideoOff = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="13" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M21 15V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 2l20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconPhone = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12 1.02.37 2.02.72 2.97a2 2 0 0 1-.45 2.11L9.91 10.09a16 16 0 0 0 6 6l1.29-1.29a2 2 0 0 1 2.11-.45c.95.35 1.95.6 2.97.72A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconSettings = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Load user ID
const userId = localStorage.getItem("userId") || "";

const Meeting = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const location = useLocation();

  // Read mode from navigation
  // const { mode } = location.state || { mode: "speech-to-sign" };
  const { mode: _mode } = location.state || { mode: "speech-to-sign" };


  // Meeting ID from URL
  const meetingCode = params.id!;

  // Refs (UNCHANGED)
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const folderIntervalIdRef = useRef<any>(null);
  const isCapturingRef = useRef(false);
  const frameCountRef = useRef(0);
  const currentFolderNameRef = useRef('');

  // State (UNCHANGED)
  const initialRole = (searchParams.get('role') as string) || (location.state as any)?.role || 'guest';
  const [isHost] = useState<boolean>(initialRole === 'host');
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
  const [isMicOn, setIsMicOn] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  const [isCapturing, setIsCapturing] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [uploadCount, setUploadCount] = useState(0);
  const [failedUploads, setFailedUploads] = useState(0);
  const [remotePath, setRemotePath] = useState('C:\Users\Shree\Videos\New folder');  //CHANGE URL
  const [folderInterval, setFolderInterval] = useState(300);
  const [showSettings, setShowSettings] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | 'warning'>('success');
  const [statusVisible, setStatusVisible] = useState(false);

  const recordDurationMs = 5000;

  // Toast
  const showStatus = (msg: string, type: 'success' | 'error' | 'warning') => {
    setStatusMessage(msg);
    setStatusType(type);
    setStatusVisible(true);
    setTimeout(() => setStatusVisible(false), 3000);
  };

  // Generate Folder Name
  const generateFolderName = (): string => {
    const now = new Date();
    return `${now.getFullYear()}${(now.getMonth() + 1)
      .toString()
      .padStart(2, '0')}${now
      .getDate()
      .toString()
      .padStart(2, '0')}_${now
      .getHours()
      .toString()
      .padStart(2, '0')}${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  const concatBuffers = (...buffers: ArrayBuffer[]) => {
    let total = buffers.reduce((a, b) => a + b.byteLength, 0);
    let out = new Uint8Array(total);
    let offset = 0;
    for (let b of buffers) {
      out.set(new Uint8Array(b), offset);
      offset += b.byteLength;
    }
    return out.buffer;
  };

  // -----------------------------------------------
  // ⭐ REQUIRED CHANGE #1: JOIN MEETING API CALL
  // -----------------------------------------------

  const joinMeetingAPI = async () => {
  try {
    await apiClient.callApi("Meetings", "join", "POST", {
      meetingId: Number(meetingCode),
      userId: Number(userId),
    });

    console.log("Joined meeting successfully");
  } catch (err) {
    console.error("Join meeting failed:", err);
  }
};


  // -----------------------------------------------
  // Recorder / WebRTC logic (UNCHANGED)
  // -----------------------------------------------

  const connectWebSocket = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const wsUrl = `ws://${window.location.hostname}:5000/ws/frames`;
      const socket = new WebSocket(wsUrl);
      socket.binaryType = "arraybuffer";
      socketRef.current = socket;

      socket.onopen = () => {
        resolve();
      };

      socket.onerror = (err) => {
        reject(err);
      };
    });
  };

  const sendClip = async (blob: Blob, meta: any) => {
    if (!socketRef.current) return;

    const metaBytes = new TextEncoder().encode(JSON.stringify(meta));
    const metaLen = new Uint32Array([metaBytes.length]);
    const clipBytes = await blob.arrayBuffer();
    const packet = concatBuffers(metaLen.buffer, metaBytes.buffer, clipBytes);
    socketRef.current.send(packet);
  };

  const recordClip = async () => {
    if (!localStreamRef.current || !isCapturingRef.current) return;
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    chunksRef.current = [];
    const chosenMime = "video/webm";

    const mediaRecorder = new MediaRecorder(localStreamRef.current, {
      mimeType: chosenMime,
    });

    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.start();
    await delay(recordDurationMs);

    return new Promise<void>((resolve) => {
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: chosenMime });
        frameCountRef.current++;
        setFrameCount(frameCountRef.current);

        const meta = {
          folder: currentFolderNameRef.current,
          filename: `clip_${frameCountRef.current}.webm`,
          mimeType: chosenMime,
        };

        try {
          await sendClip(blob, meta);
        } catch (err) {
          setFailedUploads(prev => prev + 1);
        }

        resolve();
      };

      mediaRecorder.stop();
    });
  };

  const recordLoop = async () => {
    while (isCapturingRef.current) {
      await recordClip();
      await delay(300);
    }
  };

  const startCapturing = async () => {
    if (!localStreamRef.current) return;

    isCapturingRef.current = true;
    setIsCapturing(true);
    frameCountRef.current = 0;
    setFrameCount(0);

    currentFolderNameRef.current = generateFolderName();

    try {
      await connectWebSocket();
      recordLoop();
    } catch {
      isCapturingRef.current = false;
      setIsCapturing(false);
      return;
    }

    folderIntervalIdRef.current = setInterval(() => {
      currentFolderNameRef.current = generateFolderName();
    }, folderInterval * 1000);
  };

  const stopCapturing = () => {
    isCapturingRef.current = false;
    setIsCapturing(false);

    if (folderIntervalIdRef.current) clearInterval(folderIntervalIdRef.current);
    if (socketRef.current) socketRef.current.close();
  };

  const toggleCapturing = () => {
    if (isCapturing) stopCapturing();
    else startCapturing();
  };

  // ---------------------------------------------------
  // ⭐ REQUIRED CHANGE #2 — CALL joinMeetingAPI HERE
  // ---------------------------------------------------

  useEffect(() => {
    joinMeetingAPI();   // 🔥 IMPORTANT
    setMounted(true);

    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true }
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        peerConnectionRef.current = pc;

        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        pc.ontrack = (ev) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = ev.streams[0];
          }
        };

        pc.onicecandidate = (ev) => {
          if (ev.candidate) {
            socketClient.send({
              type: 'ice-candidate',
              room: meetingCode,
              candidate: ev.candidate
            });
          }
        };

        if (meetingCode) {
          socketClient.send({ type: 'join-room', room: meetingCode });
        }

      } catch (err: any) {
        setInitError(err.message || 'Failed to access media');
      }
    };

    initializeMedia();

    return () => {
      stopCapturing();
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      peerConnectionRef.current?.close();
    };
  }, [meetingCode]);

  // WebRTC socket listeners (UNCHANGED)
  useEffect(() => {
    const pc = peerConnectionRef.current;
    if (!pc) return;

    socketClient.on('offer', async (data) => {
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketClient.send({ type: 'answer', room: data.room, answer });
    });

    socketClient.on('answer', async (data) => {
      await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socketClient.on('ice-candidate', async (data) => {
      await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
    });

    socketClient.on('user-joined', async (data) => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketClient.send({ type: 'offer', room: data.room, offer });
    });

    return () => {
      socketClient.off('offer');
      socketClient.off('answer');
      socketClient.off('ice-candidate');
      socketClient.off('user-joined');
    };
  }, [peerConnectionRef.current]);

  // Mic & Camera controls
  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(t => t.enabled = !t.enabled);
    setIsMicOn(!isMicOn);
  };

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach(t => t.enabled = !t.enabled);
    setIsCameraOn(!isCameraOn);
  };

  const handleEndCall = () => {
    stopCapturing();
    navigate('/');
  };

  // -------------------------------------------------------------
  // UI — NOT MODIFIED (unchanged)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
        statusVisible ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
      } ${
        statusType === 'success' ? 'bg-green-500 text-white' : 
        statusType === 'error' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-white'
      }`}>
        {statusMessage}
      </div>

      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">S</div>
            <span className="font-semibold text-lg">Meeting</span>
            {meetingCode && <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">#{meetingCode}</span>}
          </div>
          
          <div className="flex items-center gap-4">
            {isCapturing && (
              <div className="flex items-center gap-2 text-red-600 animate-pulse">
                <div className="w-3 h-3 rounded-full bg-red-600"></div>
                <span className="text-sm font-medium">Recording</span>
              </div>
            )}
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              <IconSettings />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 bg-white rounded-xl border border-gray-200 p-6 shadow-sm animate-fade-in-down">
            <h3 className="text-lg font-semibold mb-4">Recording Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remote Storage Path</label>
                <input 
                  type="text" 
                  value={remotePath}
                  onChange={(e) => setRemotePath(e.target.value)}
                  disabled={isCapturing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="\\Server\Share"
                />
                <p className="mt-1 text-xs text-gray-500">Clips saved to: {remotePath}\YYYYMMDD_HHMMSS\clip_N.webm</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Folder Interval (sec)</label>
                <input 
                  type="number" 
                  value={folderInterval}
                  onChange={(e) => setFolderInterval(Number(e.target.value))}
                  disabled={isCapturing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden aspect-video relative group">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
                You {isHost ? '(Host)' : '(Guest)'}
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden aspect-video relative">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {!remoteVideoRef.current?.srcObject && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400">
                  Waiting for participant...
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg text-sm backdrop-blur-sm">
                Remote User
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Session Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Recorded</div>
                  <div className="text-2xl font-bold text-indigo-600">{frameCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Uploaded</div>
                  <div className="text-2xl font-bold text-green-600">{uploadCount}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Success Rate</div>
                  <div className="text-2xl font-bold text-gray-800">
                    {frameCount > 0 ? ((uploadCount / frameCount) * 100).toFixed(0) : 0}%
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Failed</div>
                  <div className="text-2xl font-bold text-red-500">{failedUploads}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Recording Controls</h3>
              <button
                onClick={toggleCapturing}
                className={`w-full py-3 px-4 rounded-xl font-medium transition-all transform active:scale-95 flex items-center justify-center gap-2 ${
                  isCapturing 
                    ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                }`}
              >
                {isCapturing ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"/>
                    Stop Recording
                  </>
                ) : (
                  <>Start Recording</>
                )}
              </button>
              <p className="mt-3 text-xs text-center text-gray-500">
                {isCapturing ? 'Recording clips every 5 seconds...' : 'Ready to record'}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
        <div className="max-w-screen-xl mx-auto flex justify-center gap-4">
          <button onClick={toggleMic} className={`p-4 rounded-full transition ${isMicOn ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
            {isMicOn ? <IconMic /> : <IconMicOff />}
          </button>
          <button onClick={toggleCamera} className={`p-4 rounded-full transition ${isCameraOn ? 'bg-gray-100 text-gray-900 hover:bg-gray-200' : 'bg-red-100 text-red-600 hover:bg-red-200'}`}>
            {isCameraOn ? <IconVideo /> : <IconVideoOff />}
          </button>
          <button onClick={handleEndCall} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-xl transition transform hover:-translate-y-1">
            <IconPhone />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Meeting;
