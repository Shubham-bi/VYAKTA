import { useState, useEffect } from "react";
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal';
import ToggleMode from './ToggleMode';
import apiClient from '../api/apiClient';  // ✅ use universal API

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MeetingModal = ({ isOpen, onClose }: MeetingModalProps) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mode: 'speech-to-sign' as 'sign-to-speech' | 'speech-to-sign',
  });

  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------------------------------------------------
  // ⭐ UPDATED — replaced startMeeting() with correct backend API calls
  // -------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 1️⃣ LOGIN API
      const loginRes = await apiClient.callApi(
        "Auth",
        "login",
        "POST",
        {
          email: formData.email,
          password: "123456"
        }
      );

      const userId = loginRes.data?.userId;

      if (!userId) throw new Error("Login failed: User ID missing");

      localStorage.setItem("userId", userId);
      localStorage.setItem("tk_9xf1BzX", loginRes.data?.token || "");

      // 2️⃣ CREATE MEETING
      const createRes = await apiClient.callApi(
        "Meetings",
        "create",
        "POST",
        {
          title: `Meeting - ${formData.name}`,
          userId: Number(userId),
          scheduledTime: new Date().toISOString(),
          durationMinutes: 60
        }
      );

      const meetingId = createRes.data?.meetingId;

      if (!meetingId) throw new Error("Meeting creation failed");

      // 3️⃣ Navigate to meeting room
      navigate(`/meeting/${meetingId}`, {
        state: { mode: formData.mode }
      });

      onClose();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to start meeting.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const el = document.getElementById("modal-name");
        el?.focus();
      }, 120);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start Meeting">
      <div className="max-w-md w-full mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-100 space-y-6 transition-all duration-300 ease-out"
        >
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Start a meeting</h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter your details to join the meeting instantly.
            </p>
          </div>

          {formError && (
            <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* Name Field */}
          <div>
            <label
              htmlFor="modal-name"
              className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider"
            >
              Your name
            </label>
            <input
              id="modal-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg text-sm bg-gray-50 border ${
                errors.name ? "border-red-300 bg-red-50" : "border-transparent"
              } focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow duration-150 shadow-sm`}
              placeholder="Jane Doe"
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label
              htmlFor="modal-email"
              className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider"
            >
              Email
            </label>
            <input
              id="modal-email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg text-sm bg-gray-50 border ${
                errors.email ? "border-red-300 bg-red-50" : "border-transparent"
              } focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow duration-150 shadow-sm`}
              placeholder="you@company.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 font-medium">
                {errors.email}
              </p>
            )}
          </div>

          {/* Mode */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-3 uppercase tracking-wider">
              Translation Mode
            </label>
            <div className="flex items-center justify-center">
              <ToggleMode
                mode={formData.mode}
                onChange={(mode) => setFormData({ ...formData, mode })}
              />
            </div>
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              <span className={isSubmitting ? "animate-pulse" : ""}>
                {isSubmitting ? "Starting..." : "Start meeting"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default MeetingModal;
