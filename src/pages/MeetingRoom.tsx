import { useParams, useNavigate } from "react-router-dom";
import ImageStream30 from "../components/ImageStream30";
import AudioToImage from "../components/AudioToImage";
import { useState } from "react";

export default function MeetingRoom() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [camOn, setCamOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 p-6 space-y-6">

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-bold">Meeting Room — {id}</h1>

      {/* HOST + GUEST SIDE BY SIDE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* HOST */}
        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Host Video</h2>
          <ImageStream30 />
        </div>

        {/* GUEST */}
        <div className="bg-white shadow p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Guest Audio → Image</h2>
          <AudioToImage />
        </div>

      </div>

      {/* REALTIME TEXT TERMINAL */}
      <div className="bg-white shadow p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Realtime Text Output</h2>
        <div className="bg-black text-white p-4 rounded h-48 overflow-y-auto">
          Waiting for transcription...
        </div>
      </div>

      {/* CONTROL BUTTONS */}
      <div className="flex gap-4 pt-4">

        <button
          onClick={() => setCamOn(!camOn)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {camOn ? "Camera Off" : "Camera On"}
        </button>

        <button
          onClick={() => setMicOn(!micOn)}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          {micOn ? "Mic Off" : "Mic On"}
        </button>

        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          End Meeting
        </button>

      </div>

    </div>
  );
}
