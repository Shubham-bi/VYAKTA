import { useState } from "react";
import type { FormEvent } from "react";
import apiClient from "../api/apiClient";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  mode: "login" | "register";
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const [formData, setFormData] = useState({
    fullNameIntLang: "",
    email: "",
  });

  const [errors, setErrors] = useState<{
    fullNameIntLang?: string;
    email?: string;
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
    setIsSubmitting(true);

    try {
      // -------------------
      // LOGIN
      // -------------------
      if (mode === "login") {
        const payload = {
          email: formData.email,
          password: "123456", // default password
        };

        const response = await apiClient.callApi(
          "Auth",
          "login",
          "POST",
          payload
        );

        localStorage.setItem("tk_9xf1BzX", response.data?.token || "");
        localStorage.setItem("userId", response.data?.userId || "");

        setSuccessMessage("Login successful! Redirecting...");
        setTimeout(() => navigate("/"), 800);
      }

      // -------------------
      // REGISTER + AUTO LOGIN
      // -------------------
      if (mode === "register") {
        const payload = {
          salutation: "",
          fullNameIntLang: formData.fullNameIntLang,
          email: formData.email,
          mobileNumber: "",
          password: "123456",
        };

        await apiClient.callApi("Auth", "register", "POST", payload);

        // Auto login
        const loginRes = await apiClient.callApi("Auth", "login", "POST", {
          email: payload.email,
          password: payload.password,
        });

        localStorage.setItem("tk_9xf1BzX", loginRes.data?.token || "");
        localStorage.setItem("userId", loginRes.data?.userId || "");

        setSuccessMessage("Registration successful! Redirecting...");
        setTimeout(() => navigate("/"), 800);
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* FULL NAME (ONLY FOR REGISTER) */}
      {mode === "register" && (
        <div>
          <label
            htmlFor="fullNameIntLang"
            className="block text-sm font-semibold text-gray-700 mb-2"
          >
            Name
          </label>
          <input
            id="fullNameIntLang"
            type="text"
            value={formData.fullNameIntLang}
            onChange={(e) =>
              setFormData({ ...formData, fullNameIntLang: e.target.value })
            }
            className={`w-full p-3 border rounded-lg ${
              errors.fullNameIntLang
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            placeholder="Enter your full name"
          />
          {errors.fullNameIntLang && (
            <p className="text-red-600 text-sm">{errors.fullNameIntLang}</p>
          )}
        </div>
      )}

      {/* EMAIL */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-semibold text-gray-700 mb-2"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          className={`w-full p-3 border rounded-lg ${
            errors.email ? "border-red-500 bg-red-50" : "border-gray-300"
          }`}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-600 text-sm">{errors.email}</p>
        )}
      </div>

      {/* SUCCESS MESSAGE */}
      {successMessage && (
        <div className="p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-3 rounded-xl"
      >
        {isSubmitting ? "Processing..." : mode === "login" ? "Login" : "Register"}
      </button>
    </form>
  );
};

export default AuthForm;
