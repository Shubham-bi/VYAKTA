import { useParams, useNavigate } from "react-router-dom";
import ImageStream30 from "../components/ImageStream30";
import AudioToImage from "../components/AudioToImage";
import { useEffect, useState } from "react";

export default function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // ✅ auto start both streams on load
  useEffect(() => {
    window.dispatchEvent(new Event("start-video"));
    window.dispatchEvent(new Event("start-audio"));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">

      <h1 className="text-2xl font-bold">Meeting room — {id}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Host video</h2>
          <ImageStream30 autoStart={true} camOn={camOn} />
        </div>

        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Guest audio → image</h2>
          <AudioToImage autoStart={true} micOn={micOn} />
        </div>

      </div>

      <div className="bg-white shadow p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Realtime text output</h2>
        <div className="bg-black text-white p-4 rounded h-48 overflow-y-auto">
          Waiting for transcription...
        </div>
      </div>

      <div className="flex gap-4 pt-4">

        <button
          onClick={() => setCamOn(v => !v)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {camOn ? "Camera off" : "Camera on"}
        </button>

        <button
          onClick={() => setMicOn(v => !v)}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          {micOn ? "Mic off" : "Mic on"}
        </button>

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          End meeting
        </button>

      </div>
    </div>
  );
}
