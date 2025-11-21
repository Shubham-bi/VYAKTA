import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AuthForm from '../components/AuthForm';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>(
    (searchParams.get('mode') as 'login' | 'register') || 'login'
  );

  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'login' || urlMode === 'register') {
      setMode(urlMode);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        {/* Main Card Container */}
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Tabs Toggle - Desktop */}
          <div className="hidden md:flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-5 px-6 text-center font-semibold text-base transition-all duration-200 ${
                mode === 'register'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Register
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-5 px-6 text-center font-semibold text-base transition-all duration-200 ${
                mode === 'login'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Login
            </button>
          </div>

          {/* Content Area */}
          <div className="md:flex">
            {/* Left Panel - Register */}
            <div
              className={`md:w-1/2 p-8 md:p-12 transition-all duration-300 ${
                mode === 'register' ? 'block' : 'hidden md:block'
              }`}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Register</h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  Create a new account to get started with seamless communication.
                </p>
              </div>
              <AuthForm mode="register" />
              <div className="mt-6 md:hidden text-center">
                <button
                  onClick={() => setMode('login')}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Already have an account? Login
                </button>
              </div>
            </div>

            {/* Right Panel - Login */}
            <div
              className={`md:w-1/2 p-8 md:p-12 bg-blue-50 transition-all duration-300 border-l border-gray-200 ${
                mode === 'login' ? 'block' : 'hidden md:block'
              }`}
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Login</h2>
                <p className="text-gray-600 text-base leading-relaxed">
                  Welcome back! Sign in to continue your communication journey.
                </p>
              </div>
              <AuthForm mode="login" />
              <div className="mt-6 md:hidden text-center">
                <button
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                >
                  Don't have an account? Register
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
