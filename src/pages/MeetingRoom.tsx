import { useParams, useNavigate } from "react-router-dom";
import ImageStream30 from "../components/ImageStream30";
import AudioToImage from "../components/AudioToImage";
import EndMeetingModal from "../components/EndMeetingModal";
import { useEffect, useState, useRef } from "react";

export default function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [transcription, setTranscription] = useState("");
  const transcriptionRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Speech state
  const [speechInitialized, setSpeechInitialized] = useState(false);
  const [speakingEnabled, setSpeakingEnabled] = useState(false);

  // Host WS Status
  const [hostWsStatus, setHostWsStatus] = useState("disconnected");
  // Audio WS Status
  const [audioWsStatus, setAudioWsStatus] = useState("disconnected");
  const [showEndModal, setShowEndModal] = useState(false);

  // Highlighting
  const [highlightRange, setHighlightRange] = useState<{ start: number, length: number } | null>(null);

  // ✅ auto start both streams on load
  useEffect(() => {
    setMounted(true);
    window.dispatchEvent(new Event("start-video"));
    window.dispatchEvent(new Event("start-audio"));
  }, []);

  // Auto-scroll transcription to bottom
  useEffect(() => {
    const el = transcriptionRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [transcription]);

  const handleEndMeeting = () => {
    setShowEndModal(true);
  };

  const confirmEndMeeting = () => {
    // Force cleanup of streams before navigation
    window.dispatchEvent(new Event("endMeeting"));

    setShowEndModal(false);
    navigate("/");
  };

  const handleSpeechInit = () => {
    // If not initialized, user gesture enables it
    if (!speechInitialized) {
      window.dispatchEvent(new Event("userGestureEnableSpeech"));
    } else {
      // If already initialized, just toggle state
      window.dispatchEvent(new Event("toggleSpeech"));
    }
  };

  const handleSpeechStateChange = (initialized: boolean, enabled: boolean) => {
    setSpeechInitialized(initialized);
    setSpeakingEnabled(enabled);
  };

  return (
    <div className="min-h-screen bg-[conic-gradient(at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 text-white pb-32 overflow-hidden selection:bg-purple-500 selection:text-white">

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
      </div>

      {/* Meeting Header */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl shadow-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Strategy Meeting</h1>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                <p className="text-xs text-slate-300 font-medium tracking-wide font-mono">ID: {id}</p>
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 backdrop-blur-md">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } transition-all duration-700 ease-out`}
      >

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-12rem)] min-h-[600px]">

          {/* Host Video Section - 60% Width (7/12 cols) */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="relative flex-grow bg-black/40 backdrop-blur-sm rounded-[32px] border border-white/10 shadow-2xl overflow-hidden group">

              {/* Host Label & Status Overlay */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
                <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 flex items-center gap-2 shadow-lg">
                  <div className={`w-2 h-2 rounded-full ${hostWsStatus === "connected" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-red-500"}`}></div>
                  <span className="text-sm font-semibold text-white tracking-wide">Host Stream</span>
                </div>
              </div>

              {/* Video Container */}
              <div className="w-full h-full">
                <ImageStream30
                  autoStart={true}
                  camOn={camOn}
                  onTextUpdate={setTranscription}
                  onSpeechInitChange={handleSpeechStateChange}
                  onStatusChange={setHostWsStatus}
                  onSpeechHighlight={(start, length) => setHighlightRange({ start, length })}
                  hideControls={true}
                />
              </div>

              {/* Gradient Overlay for Vignette Effect */}
              <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40 pointer-events-none"></div>
            </div>
          </div>

          {/* Right Column: Transcription/Chat - 40% Width (5/12 cols) */}
          <div className="lg:col-span-5 flex flex-col h-full gap-4">

            <div className="flex-grow bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-xl overflow-hidden flex flex-col">

              {/* Panel Header */}
              <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <span>💬</span> Transcription
                  </h2>
                  <div className="px-3 py-1.5 rounded bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
                    Live
                  </div>
                </div>
              </div>

              {/* Transcription Content */}
              <div
                ref={transcriptionRef}
                className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
              >
                {transcription ? (
                  <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl rounded-tl-sm p-6 text-xl md:text-2xl leading-relaxed text-indigo-50 shadow-sm relative group hover:bg-indigo-600/20 transition-colors break-words whitespace-pre-wrap">
                    {(() => {
                      if (!highlightRange) return transcription;
                      const { start, length } = highlightRange;
                      if (start >= transcription.length) return transcription;

                      const prefix = transcription.slice(0, start);
                      const active = transcription.slice(start, start + length);
                      const suffix = transcription.slice(start + length);

                      return (
                        <>
                          <span className="brightness-90 opacity-80">{prefix}</span>
                          <span className="bg-yellow-400/90 text-black px-1 rounded-sm font-semibold shadow-[0_0_10px_rgba(250,204,21,0.4)] mx-0.5">{active}</span>
                          <span className="brightness-90 opacity-80">{suffix}</span>
                        </>
                      );
                    })()}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-indigo-300 font-mono">NOW</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">Waiting for speech...</p>
                  </div>
                )}
              </div>

              {/* Speech Toggle Area */}
              <div className="p-4 bg-black/20 border-t border-white/5">
                {!speechInitialized ? (
                  <button
                    onClick={handleSpeechInit}
                    className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                    Enable Audio Output
                  </button>
                ) : (
                  <button
                    onClick={handleSpeechInit}
                    className={`w-full py-3.5 rounded-xl font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 text-sm ${speakingEnabled
                      ? "bg-white/10 hover:bg-white/20 text-white border border-white/10"
                      : "bg-red-500/20 text-red-200 border border-red-500/30 hover:bg-red-500/30"
                      }`}
                  >
                    {speakingEnabled ? (
                      <>
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        Audio Active
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                        Audio Muted
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>


          </div>
        </div>

        {/* Hidden Guest Frame (Technical functionality maintained) */}
        <div className="hidden">
          <AudioToImage
            autoStart={true}
            micOn={micOn}
            onStatusChange={setAudioWsStatus}
          />
        </div>
      </main>

      {/* Floating Glass Dock */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 px-3 py-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-300 ease-out">

          {/* Cam Toggle */}
          <button
            onClick={() => setCamOn(v => !v)}
            className={`p-4 rounded-full transition-all duration-300 group ${camOn
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-red-500/20 hover:bg-red-500/30 text-red-400 ring-1 ring-red-500/30"}`}
            title={camOn ? "Turn Camera Off" : "Turn Camera On"}
          >
            {camOn ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
            )}
          </button>

          {/* Mic Toggle */}
          <button
            onClick={() => setMicOn(v => !v)}
            className={`p-4 rounded-full transition-all duration-300 group ${micOn
              ? "bg-white/10 hover:bg-white/20 text-white"
              : "bg-red-500/20 hover:bg-red-500/30 text-red-400 ring-1 ring-red-500/30"}`}
            title={micOn ? "Turn Mic Off" : "Turn Mic On"}
          >
            {micOn ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
            )}
          </button>

          <div className="w-px h-8 bg-white/10 mx-1"></div>

          {/* End Meeting */}
          <button
            onClick={handleEndMeeting}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-110 active:scale-95"
            title="End Meeting"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      <EndMeetingModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        onConfirm={confirmEndMeeting}
      />
    </div>
  );
}
