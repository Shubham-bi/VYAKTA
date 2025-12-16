import { useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import ToggleMode from "./ToggleMode";
import apiClient from "../api/apiClient";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MeetingModal = ({ isOpen, onClose }: MeetingModalProps) => {
  const navigate = useNavigate();

  // UPDATED: full register payload included
  const [formData, setFormData] = useState({
    salutation: "",
    fullNameIntLang: "",
    email: "",
    mobileNumber: "",
    mode: "speech-to-sign" as "sign-to-speech" | "speech-to-sign",
  });

  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validate = () => {
    const newErrors: { email?: string } = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      newErrors.email = "Please enter a valid email address";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============================================================
  // 🔥 MAIN SUBMIT HANDLER
  // ============================================================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // user gesture: set a short-lived flag so ImageStream can pick it up on mount
    try {
      sessionStorage.setItem("unlockSpeech", "1");
      // also dispatch immediate event (covers the case ImageStream already mounted)
      window.dispatchEvent(new Event("userGestureEnableSpeech"));
    } catch {
      // ignore storage errors
    }

    // stop any existing meeting streams if component still mounted elsewhere
    try {
      window.dispatchEvent(new Event("endMeeting"));
    } catch {
      // ignore
    }

    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      let loginRes: any = null;

      // ---------------------- LOGIN ----------------------
      if (authMode === "login") {
        try {
          loginRes = await apiClient.callApi("Main", "login", "POST", {
            email: formData.email,
          });
        } catch (loginErr: any) {
          const msg = loginErr?.response?.data?.message?.toLowerCase() || "";

          if (msg.includes("not found")) {
            const regPayload = {
              salutation: "",
              fullNameIntLang: "",
              email: formData.email,
              mobileNumber: "",
            };

            await apiClient.callApi("Main", "register", "POST", regPayload);

            loginRes = await apiClient.callApi("Main", "login", "POST", {
              email: formData.email,
            });
          } else {
            throw loginErr;
          }
        }
      }

      // ---------------------- REGISTER ----------------------
      if (authMode === "register") {
        const regPayload = {
          salutation: formData.salutation,
          fullNameIntLang: formData.fullNameIntLang,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
        };

        await apiClient.callApi("Main", "register", "POST", regPayload);

        loginRes = await apiClient.callApi("Main", "login", "POST", {
          email: formData.email,
        });
      }

      // ---------------------- LOGIN VALIDATION ----------------------
      const userId = loginRes.data.responseData.id;
      const token = loginRes.data?.token || "";

      localStorage.setItem("userId", userId);
      localStorage.setItem("tk_9xf1BzX", token);

      // ---------------------- CREATE MEETING ----------------------
      const createRes = await apiClient.callApi(
        "Main",
        "create-meeting",
        "POST",
        {
          title: "Meeting",
          userId: Number(userId),
          scheduledTime: new Date().toISOString(),
          durationMinutes: 60,
        }
      );

      const meetingId = createRes.data?.responseData;
      if (!meetingId) throw new Error("Meeting creation failed");

      // ---------------------- REDIRECT ----------------------
      navigate(`/meeting/${meetingId}`, {
        state: { mode: formData.mode },
      });

      onClose();
    } catch (err: any) {
      console.error("MeetingModal error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to start meeting.";
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Autofocus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.getElementById("modal-name")?.focus();
      }, 120);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Start Meeting">
      <div className="max-w-md w-full mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-100 space-y-6"
        >
          {/* Header */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Start a meeting</h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter your details to join the meeting instantly.
            </p>
          </div>

          {/* Error */}
          {formError && (
            <div className="rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-700">
              {formError}
            </div>
          )}

          {/* ---------------------------------------------------
                 REGISTER FIELDS (Only for Register)
          --------------------------------------------------- */}
          {authMode === "register" && (
            <>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullNameIntLang}
                  onChange={(e) =>
                    setFormData({ ...formData, fullNameIntLang: e.target.value })
                  }
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200"
                />
              </div>
            </>
          )}

          {/* Email Field (common) */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className={`w-full px-4 py-3 rounded-lg bg-gray-50 border ${errors.email ? "border-red-300 bg-red-50" : "border-gray-200"
                }`}
              placeholder="you@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Mobile Number (Register Only) */}
          {authMode === "register" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
                Mobile Number
              </label>
              <input
                type="text"
                value={formData.mobileNumber}
                onChange={(e) =>
                  setFormData({ ...formData, mobileNumber: e.target.value })
                }
                placeholder="Enter mobile number"
                className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200"
              />
            </div>
          )}

          {/* Mode Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-3 uppercase tracking-wider">
              Translation Mode
            </label>
            <ToggleMode
              mode={formData.mode}
              onChange={(mode) => setFormData({ ...formData, mode })}
            />
          </div>

          {/* Login / Register Toggle */}
          <div className="flex justify-center gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-lg ${authMode === "login"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
                }`}
              onClick={() => setAuthMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={`px-4 py-2 rounded-lg ${authMode === "register"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
                }`}
              onClick={() => setAuthMode("register")}
            >
              Register
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-5 py-3 bg-indigo-600 text-white rounded-lg shadow disabled:opacity-60"
          >
            {isSubmitting
              ? authMode === "login"
                ? "Logging in..."
                : "Registering..."
              : authMode === "login"
                ? "Login & Start Meeting"
                : "Register & Start Meeting"}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default MeetingModal;
