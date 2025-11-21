import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MeetingModal from "../components/MeetingModal";

const Home = () => {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger mount animation
    setMounted(true);
  }, []);

  const handleStartMeeting = () => setIsModalOpen(true);

  const handleJoinMeeting = () => {
    const code = meetingCode.trim();
    if (!code) return;
    navigate(`/meeting/${code}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 antialiased">
      {/* Top nav */}
      <header className="backdrop-blur-sm bg-white/60 border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">S</div>
              <div className="hidden sm:block">
                <div className="text-lg font-semibold">SignFlow</div>
                <div className="text-xs text-gray-500">One platform. Every voice.</div>
              </div>
            </a>

            <nav className="hidden md:flex items-center gap-6">
              <a href="/features" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
              <a href="/about" className="text-sm text-gray-600 hover:text-gray-900">About</a>
              <a href="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact</a>
            </nav>

            <div className="flex items-center gap-3">
              <button onClick={handleStartMeeting} className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 text-sm font-semibold">Start Meeting</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <section className={`grid grid-cols-1 lg:grid-cols-12 gap-10 items-center ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} transition-all duration-500`}>
          <div className="lg:col-span-7">
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">Communicate naturally — across languages & abilities</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl">A minimal, reliable meeting experience that combines live translation and sign/speech workflows. Start instantly or join with a code.</p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button onClick={handleStartMeeting} className="inline-flex items-center gap-3 px-5 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition">Start a Meeting</button>

              <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-lg p-1 shadow-sm">
                <input value={meetingCode} onChange={(e) => setMeetingCode(e.target.value)} placeholder="Enter meeting code" className="px-4 py-2 w-56 text-sm bg-transparent focus:outline-none" onKeyDown={(e) => e.key === 'Enter' && handleJoinMeeting()} />
                <button onClick={handleJoinMeeting} className="px-4 py-2 bg-gray-800 text-white rounded-md text-sm">Join</button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src="https://images.pexels.com/photos/6248972/pexels-photo-6248972.jpeg" alt="hero" className="w-full h-64 object-cover sm:h-80 md:h-96" />
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h4 className="font-semibold mb-2">Real-time translation</h4>
            <p className="text-sm text-gray-600">Speech and sign translation working together for inclusive conversations.</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h4 className="font-semibold mb-2">Low-latency media</h4>
            <p className="text-sm text-gray-600">Optimized streams and reconnection logic for stable calls.</p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
            <h4 className="font-semibold mb-2">Privacy-first</h4>
            <p className="text-sm text-gray-600">You control who joins and how content is shared.</p>
          </div>
        </section>
      </main>

      <MeetingModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Home;
