import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store";
import ToggleMode from "../components/ToggleMode";
import apiClient from "../api/apiClient";
import { createMeeting } from "../features/meeting/meetingThunks";

const MeetingSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [formData, setFormData] = useState({
    salutation: "",
    fullNameIntLang: "",
    email: searchParams.get("email") || "",
    mobileNumber: "",
    mode:
      (searchParams.get("mode") as "sign-to-speech" | "speech-to-sign") ||
      "speech-to-sign",
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // -----------------------------------
  const validate = () => {
    const err: any = {};

    if (!formData.email.trim()) err.email = "Email is required";
    else if (!emailRegex.test(formData.email))
      err.email = "Invalid email";

    if (authMode === "register") {
      if (!formData.fullNameIntLang.trim())
        err.fullNameIntLang = "Full name is required";

      if (!formData.mobileNumber.trim())
        err.mobileNumber = "Mobile number is required";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };
  // -----------------------------------

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      let userId: any = null;

      // ----------------------
      // LOGIN FLOW
      // ----------------------
      if (authMode === "login") {
        const loginRes = await apiClient.callApi(
          "Main",
          "login",
          "POST",
          { email: formData.email }
        );

        userId = loginRes?.data?.responseData?.id;
         localStorage.setItem("userId", userId);

        // Redirect immediately to your new screen
        // navigate("/video-stream");   // or "/audio-stream"
        navigate("/meeting");

        return;
      }

      // ----------------------
      // REGISTER → THEN LOGIN
      // ----------------------
      if (authMode === "register") {
        await apiClient.callApi("Main", "register", "POST", {
          salutation: formData.salutation,
          fullNameIntLang: formData.fullNameIntLang,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
        });

        const loginRes = await apiClient.callApi(
          "Main",
          "login",
          "POST",
          { email: formData.email }
        );

        userId = loginRes?.data?.responseData?.id;
        localStorage.setItem("userId", userId);

          // Direct redirect after registration
          // navigate("/video-stream");   // or "/audio-stream"
          navigate("/meeting");

          return;
      }

      // Store User
      if (userId) {
        localStorage.setItem("userId", userId);
      }

      // ----------------------------------------------
      // CREATE MEETING → BACKEND NEEDS userId + title
      // ----------------------------------------------
      const meetingRes = await dispatch(
        createMeeting({
          userId,
          meetingTitle: `Meeting - ${formData.fullNameIntLang || "User"}`,
          scheduledTime: new Date().toISOString(),
        })
      ).unwrap();

      // Redirect to Meeting page
      navigate(`/meeting/${meetingRes.meetingId}`);

    } catch (err) {
      console.error(err);
      setErrors({ email: "Something went wrong. Try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------------
  // UI START
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Start a Meeting</h2>
            <p className="text-gray-600 mt-1">
              Login or Register to continue
            </p>
          </div>

          {/* LOGIN / REGISTER TOGGLE */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              onClick={() => setAuthMode("login")}
              className={`px-5 py-2 rounded-xl font-semibold transition ${
                authMode === "login"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Login
            </button>

            <button
              onClick={() => setAuthMode("register")}
              className={`px-5 py-2 rounded-xl font-semibold transition ${
                authMode === "register"
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* REGISTER FIELDS */}
            {authMode === "register" && (
              <div className="space-y-5 animate-fadeIn">

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Salutation</label>
                  <input
                    type="text"
                    placeholder="Mr / Ms / Dr"
                    value={formData.salutation}
                    onChange={(e) =>
                      setFormData({ ...formData, salutation: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullNameIntLang}
                    onChange={(e) =>
                      setFormData({ ...formData, fullNameIntLang: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg bg-gray-50 ${
                      errors.fullNameIntLang ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, mobileNumber: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg bg-gray-50 ${
                      errors.mobileNumber ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* EMAIL FIELD */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full p-3 border rounded-lg ${
                  errors.email
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300 bg-white"
                }`}
              />
            </div>

            {/* MODE SWITCH */}
            <div>
              <label className="block text-sm text-gray-700 mb-3">
                Translation Mode
              </label>
              <ToggleMode
                mode={formData.mode}
                onChange={(mode) => setFormData({ ...formData, mode })}
              />
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg disabled:opacity-50"
            >
              {isSubmitting
                ? authMode === "login"
                  ? "Logging in…"
                  : "Registering…"
                : authMode === "login"
                ? "Login & Start Meeting"
                : "Register & Start Meeting"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;
