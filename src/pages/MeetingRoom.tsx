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
    setShowEndModal(false);
    navigate("/");
  };

  const handleSpeechInit = () => {
    // Trigger speech initialization via event
    window.dispatchEvent(new Event("userGestureEnableSpeech"));
  };

  const handleSpeechStateChange = (initialized: boolean, enabled: boolean) => {
    setSpeechInitialized(initialized);
    setSpeakingEnabled(enabled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 pb-32">

      {/* Meeting Header */}
      <header className="backdrop-blur-sm bg-white/60 border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meeting Room</h1>
              <p className="text-sm text-gray-600">ID: {id}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          } transition-all duration-500`}
      >

        {/* Video/Audio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Host Video Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Host</h2>
              <div className="flex items-center gap-2">
                {/* WS Status Chip */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${hostWsStatus === "connected"
                  ? "bg-green-100 text-green-700"
                  : hostWsStatus === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${hostWsStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}></span>
                  {hostWsStatus === "connected" ? "Connected" : hostWsStatus === "error" ? "Error" : "Disconnected"}
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${camOn
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
                  }`}>
                  {camOn ? "Camera On" : "Camera Off"}
                </div>
              </div>
            </div>

            {/* Video Container with Floating Controls */}
            <div className="relative rounded-xl overflow-hidden bg-gray-900">
              <ImageStream30
                autoStart={true}
                camOn={camOn}
                onTextUpdate={setTranscription}
                onSpeechInitChange={handleSpeechStateChange}
                onStatusChange={setHostWsStatus}
                hideControls={true}
              />

              {/* Floating Speech Controls Removed */}
            </div>
          </div>

          {/* Guest Audio - Simple Design */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Guest</h2>
              <div className="flex items-center gap-2">
                {/* Audio WS Status Chip */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${audioWsStatus === "connected"
                  ? "bg-green-100 text-green-700"
                  : audioWsStatus === "error"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                  }`}>
                  <span className={`w-2 h-2 rounded-full ${audioWsStatus === "connected" ? "bg-green-500 animate-pulse" : "bg-gray-400"
                    }`}></span>
                  {audioWsStatus === "connected" ? "Connected" : audioWsStatus === "error" ? "Error" : "Disconnected"}
                </div>

                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${micOn
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
                  }`}>
                  {micOn ? "Mic On" : "Mic Off"}
                </div>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden">
              <AudioToImage autoStart={true} micOn={micOn} onStatusChange={setAudioWsStatus} />
            </div>
          </div>

        </div>

        {/* Transcription Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Real-time Transcription</h2>
            <div className="flex items-center gap-3">
              {/* Speech Controls Moved Here */}
              {!speechInitialized ? (
                <button
                  onClick={handleSpeechInit}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 text-xs font-semibold"
                >
                  🔊 Enable Speech
                </button>
              ) : (
                <button
                  onClick={handleSpeechInit}
                  className={`px-3 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 text-xs font-semibold ${speakingEnabled
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700"
                    }`}
                >
                  {speakingEnabled ? "🔊 Speaking" : "🔇 Muted"}
                </button>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 animate-pulse text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" />
                </svg>
                <span className="hidden sm:inline">Processing...</span>
              </div>
            </div>
          </div>
          <div
            ref={transcriptionRef}
            className="bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 rounded-xl h-64 overflow-y-auto font-mono text-sm leading-relaxed shadow-inner"
          >
            {transcription || (
              <span className="text-gray-400 italic">Waiting for transcription...</span>
            )}
          </div>
        </div>

      </main>

      {/* Sticky Control Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md bg-white/90 border-t border-gray-200 shadow-2xl">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">

            {/* Camera Toggle */}
            <button
              onClick={() => setCamOn(v => !v)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl ${camOn
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {camOn ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                )}
              </svg>
              <span className="hidden sm:inline">{camOn ? "Camera On" : "Camera Off"}</span>
            </button>

            {/* Mic Toggle */}
            <button
              onClick={() => setMicOn(v => !v)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl ${micOn
                ? "bg-indigo-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {micOn ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                )}
              </svg>
              <span className="hidden sm:inline">{micOn ? "Mic On" : "Mic Off"}</span>
            </button>

            {/* Divider */}
            <div className="hidden sm:block w-px h-10 bg-gray-300"></div>

            {/* End Meeting */}
            <button
              onClick={handleEndMeeting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 hover:from-red-600 hover:to-red-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>End Meeting</span>
            </button>

          </div>
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
