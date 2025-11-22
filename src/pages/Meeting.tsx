import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../api/apiClient";

const Meeting = () => {
  const navigate = useNavigate();

  // Load stored user ID
  const userId = Number(localStorage.getItem("userId") || 0);

  const [title, setTitle] = useState("My Meeting");
  const [scheduledTime, setScheduledTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [durationMinutes, setDurationMinutes] = useState(30);

  const [meetingId, setMeetingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ------------------------------------------------------------
  // ⭐ Create Meeting API (BACKEND RETURNS: { "meetingId": 2 })
  // ------------------------------------------------------------
  const createMeeting = async () => {
    if (!userId) {
      setError("User ID not found. Please login again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        title,
        userId,
        scheduledTime: new Date(scheduledTime).toISOString(),
        durationMinutes,
      };

      const res = await apiClient.callApi(
        "Main",
        "create-meeting",
        "POST",
        payload
      );
      console.log("Full API Response:", res);

      // const createdId = res?.data?.meetingId; // <-- CORRECT
      const createdId = res?.data?.responseData;


      if (!createdId) {
        throw new Error("Invalid meeting response");
      }

      setMeetingId(createdId);
      console.log("Meeting created:", createdId);

    } catch (err: any) {
      console.error("Meeting creation failed:", err);
      setError(err.message || "Failed to create meeting");
    } finally {
      setLoading(false);
    }
  };

  // ------------------------------------------------------------
  // ⭐ PAGE UI
  // ------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-xl mx-auto bg-white shadow-md p-6 rounded-xl border">

        <h2 className="text-xl font-bold mb-4">Create Meeting</h2>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">

          {/* Title */}
          <div>
            <label className="text-sm font-semibold">Meeting Title</label>
            <input
              type="text"
              className="w-full mt-1 p-2 border rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Time */}
          <div>
            <label className="text-sm font-semibold">Scheduled Time</label>
            <input
              type="datetime-local"
              className="w-full mt-1 p-2 border rounded"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </div>

          {/* Duration */}
          <div>
            <label className="text-sm font-semibold">Duration (minutes)</label>
            <input
              type="number"
              className="w-full mt-1 p-2 border rounded"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            />
          </div>

          {/* Create Button */}
          <button
            onClick={createMeeting}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Meeting"}
          </button>

          {/* Meeting Created Popup */}
          {meetingId && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded">
              <div className="font-semibold">Meeting Created Successfully!</div>
              <div className="text-sm mt-1">Meeting ID: {meetingId}</div>

              <button
                onClick={() => navigate(`/meeting/${meetingId}`)}
                className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                Go to Meeting Room
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Meeting;
