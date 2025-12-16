import { useState } from "react";
import type { FormEvent } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  mode: "login" | "register";
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    fullNameIntLang: "",
    mobileNumber: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    fullNameIntLang?: string;
    mobileNumber?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // -----------------------------
  // MAIN SUBMIT HANDLER
  // -----------------------------

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage("");
    try {
      // -------------------
      // LOGIN
      // -------------------
      if (mode === "login") {
        const payload = {
          email: formData.email,
        };

        const response = await apiClient.callApi(
          "Main",
          "login",
          "POST",
          payload
        );
        const data = response.data;

        if (data.token) localStorage.setItem("tk_9xf1BzX", data.token);
        if (data.userId) localStorage.setItem("userId", data.userId);

        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 800);
      }

      // REGISTER
      // -------------------
      if (mode === "register") {
        const payload = {
          email: formData.email,
          fullNameIntLang: formData.fullNameIntLang,
          mobileNumber: formData.mobileNumber,
          salutation: "", // Optional, can be added if needed
        };

        const response = await apiClient.callApi(
          "Main",
          "register",
          "POST",
          payload
        );

        // After register, we might need to login or redirect
        // For now, let's treat it as success and redirect to login or home
        setSuccessMessage("Registration successful! Redirecting to login...");
        setTimeout(() => navigate(0), 1000); // Reload to switch to login mode cleanly or navigate to login
        return;
      }
    } catch (err: any) {
      setErrors({
        email: err?.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // -----------------------------
  // JSX RETURN
  // -----------------------------
  return (
    <div className="max-w-md w-full mx-auto">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-100">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Sign In
          </h2>
          <p className="text-gray-600 text-base">
            Access your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg text-sm bg-gray-50 border ${errors.email ? "border-red-300 bg-red-50" : "border-transparent"} focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow duration-150 shadow-sm`}
              placeholder="you@company.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Registration Fields */}
          {mode === "register" && (
            <>
              <div>
                <label htmlFor="fullName" className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullNameIntLang}
                  onChange={(e) => setFormData({ ...formData, fullNameIntLang: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg text-sm bg-gray-50 border ${errors.fullNameIntLang ? "border-red-300 bg-red-50" : "border-transparent"} focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow duration-150 shadow-sm`}
                  placeholder="John Doe"
                  required
                />
                {errors.fullNameIntLang && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.fullNameIntLang}</p>
                )}
              </div>

              <div>
                <label htmlFor="mobile" className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
                  Mobile Number
                </label>
                <input
                  id="mobile"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg text-sm bg-gray-50 border ${errors.mobileNumber ? "border-red-300 bg-red-50" : "border-transparent"} focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow duration-150 shadow-sm`}
                  placeholder="9876543210"
                  required
                />
                {errors.mobileNumber && (
                  <p className="mt-2 text-sm text-red-600 font-medium">{errors.mobileNumber}</p>
                )}
              </div>
            </>
          )}


          {/* Success Message */}
          {successMessage && (
            <div className="rounded-md bg-green-50 border border-green-100 p-3 text-sm text-green-700 text-center">
              {successMessage}
            </div>
          )}
          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-3 px-5 py-3 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-60"
            >
              <span className={isSubmitting ? "animate-pulse" : ""}>
                {isSubmitting ? (mode === 'login' ? 'Signing in...' : 'Registering...') : (mode === 'login' ? 'Login' : 'Register')}
              </span>
            </button>
          </div>
        </form>
      </div >
    </div >
  );
};

export default AuthForm;
