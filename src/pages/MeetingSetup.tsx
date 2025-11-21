import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../app/store';
import { createMeeting } from '../features/meeting/meetingThunks';
import ToggleMode from '../components/ToggleMode';

const MeetingSetup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    mode:
      (searchParams.get('mode') as 'sign-to-speech' | 'speech-to-sign') ||
      'speech-to-sign',
  });

  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Get userId from auth state or localStorage
  const getUserId = () => {
    return (
      authState.user?.id ||
      localStorage.getItem('userId') ||
      'default-user-id'
    );
  };

  const validate = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Create meeting using thunk with backend format
      const result = await dispatch(
        createMeeting({
          userId: getUserId(),
          meetingTitle: `Meeting - ${formData.name}`,
          scheduledTime: new Date().toISOString(),
        })
      ).unwrap();

      // Navigate using :id route + pass mode as state
      navigate(`/meeting/${result.meetingId}`, {
        state: { mode: formData.mode },
      });

    } catch (error: any) {
      setErrors({
        email:
          error || 'Failed to create meeting. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 border border-gray-200">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Meeting Setup
            </h2>
            <p className="text-gray-600 text-base">
              Configure your meeting preferences
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="setup-name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Name
              </label>
              <input
                id="setup-name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={`w-full p-3 border rounded-lg ${
                  errors.name
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter your name"
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
                htmlFor="setup-email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email
              </label>
              <input
                id="setup-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className={`w-full p-3 border rounded-lg ${
                  errors.email
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mode Toggle */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Translation Mode
              </label>
              <div className="flex justify-center">
                <ToggleMode
                  mode={formData.mode}
                  onChange={(mode) => setFormData({ ...formData, mode })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl text-lg font-bold hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Starting...
                </span>
              ) : (
                'Start'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingSetup;
