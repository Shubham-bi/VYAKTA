import { Link, NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/meeting-setup");
  };

  return (
    <header className="backdrop-blur-sm bg-white/60 border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
              V
            </div>
            <div className="hidden sm:block">
              <div className="text-lg font-semibold">VYAKTA</div>
              <div className="text-xs text-gray-500">One platform. Every voice.</div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink
              to="/features"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"}`
              }
            >
              Features
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"}`
              }
            >
              About
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${isActive ? "text-indigo-600" : "text-gray-600 hover:text-gray-900"}`
              }
            >
              Contact
            </NavLink>
          </nav>

          {/* Login Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition transform hover:-translate-y-0.5 text-xs sm:text-sm font-semibold"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
