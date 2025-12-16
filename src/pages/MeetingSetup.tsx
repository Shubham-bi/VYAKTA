import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
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
        console.log("Attempting Login...");
        const loginRes = await apiClient.callApi(
          "Main",
          "login",
          "POST",
          { email: formData.email }
        );
        console.log("Login Res:", loginRes);

        userId = loginRes?.data?.responseData?.id;
      }

      // ----------------------
      // REGISTER → THEN LOGIN
      // ----------------------
      if (authMode === "register") {
        console.log("Attempting Register...");
        await apiClient.callApi("Main", "register", "POST", {
          salutation: "",
          fullNameIntLang: formData.fullNameIntLang,
          email: formData.email,
          mobileNumber: formData.mobileNumber,
        });
        console.log("Register Success. Attempting Login...");

        const loginRes = await apiClient.callApi(
          "Main",
          "login",
          "POST",
          { email: formData.email }
        );
        console.log("Login Res:", loginRes);

        userId = loginRes?.data?.responseData?.id;
      }

      // Validate UserID
      if (!userId) {
        // Fallback: If registration was successful but login failed (no userId)
        if (authMode === "register") {
          console.warn("Registration success, but auto-login failed. Prompting manual login.");
          setAuthMode("login");
          setErrors({ email: "Registration successful! Please click Login." }); // Use email error field for feedback for now, or alert
          // clear submission state
          setIsSubmitting(false);
          return;
        }

        throw new Error("Unable to retrieve User ID. Login may have failed.");
      }

      // Store User
      if (userId) {
        localStorage.setItem("userId", userId);
      }

      // ----------------------------------------------
      // CREATE MEETING → BACKEND NEEDS userId + title
      // ----------------------------------------------
      console.log("Creating Meeting for User:", userId);
      const meetingRes = await dispatch(
        createMeeting({
          userId,
          meetingTitle: `Meeting - ${formData.fullNameIntLang || "User"}`,
          scheduledTime: new Date().toISOString(),
        })
      ).unwrap();

      console.log("Meeting Created:", meetingRes);

      // Redirect to Meeting page
      navigate(`/meeting/${meetingRes.meetingId}`);

    } catch (err: any) {
      console.error("Setup Error:", err);
      let msg = "Something went wrong. Try again.";
      if (err instanceof Error) msg = err.message;
      if (typeof err === 'string') msg = err;
      // axios error
      if (err?.response?.data?.message) msg = err.response.data.message;

      setErrors({ email: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------------
  // UI START
  // ------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center">
      {/* Top nav */}
      <header className="w-full backdrop-blur-sm bg-white/60 border-b border-gray-100 z-40 mb-8">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                V
              </div>
              <div className="hidden sm:block">
                <div className="text-lg font-semibold">VYAKTA</div>
                <div className="text-xs text-gray-500">One platform. Every voice.</div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link to="/features" className="text-sm text-gray-600 hover:text-gray-900">Features</Link>
              <Link to="/about" className="text-sm text-gray-600 hover:text-gray-900">About</Link>
              <Link to="/contact" className="text-sm text-gray-600 hover:text-gray-900">Contact</Link>
            </nav>

            <div className="flex items-center gap-3">
              {/* Optional: Add user profile or something else here if logged in */}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md w-full px-4 mb-12">
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
              className={`px-5 py-2 rounded-xl font-semibold transition ${authMode === "login"
                ? "bg-indigo-600 text-white shadow-lg"
                : "bg-gray-200 text-gray-700"
                }`}
            >
              Login
            </button>

            <button
              onClick={() => setAuthMode("register")}
              className={`px-5 py-2 rounded-xl font-semibold transition ${authMode === "register"
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
                  <label className="block text-sm text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.fullNameIntLang}
                    onChange={(e) =>
                      setFormData({ ...formData, fullNameIntLang: e.target.value })
                    }
                    className={`w-full p-3 border rounded-lg bg-gray-50 ${errors.fullNameIntLang ? "border-red-500" : "border-gray-300"
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
                    className={`w-full p-3 border rounded-lg bg-gray-50 ${errors.mobileNumber ? "border-red-500" : "border-gray-300"
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
                className={`w-full p-3 border rounded-lg ${errors.email
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
