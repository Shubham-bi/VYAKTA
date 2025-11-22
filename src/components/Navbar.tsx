import { NavLink } from 'react-router-dom';


const LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg";

const Navbar = () => {
  return (
    <nav className="bg-white/90 shadow-md border-b border-gray-200 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <NavLink to="/" className="flex items-center gap-2 group">
              <img
                src={LOGO_URL}
                alt="App Logo"
                className="h-9 w-9 rounded-full shadow-md border border-blue-100 group-hover:scale-105 transition-transform duration-200"
                style={{ background: 'white' }}
              />
              <span className="text-2xl font-extrabold text-blue-700 group-hover:text-blue-800 tracking-tight select-none">
                SignBridge
              </span>
            </NavLink>
          </div>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-2 lg:space-x-6">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`
              }
            >
              About Us
            </NavLink>
            <NavLink
              to="/features"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`
              }
            >
              Features
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`
              }
            >
              Contact
            </NavLink>
            <NavLink
              to="/team"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-base font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`
              }
            >
              Our Team
            </NavLink>
          </div>

          {/* Auth Buttons - Right */}
          <div className="flex items-center gap-2 md:gap-4">
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-base font-semibold border border-blue-600 text-blue-600 bg-white hover:bg-blue-50 transition-all duration-200 shadow-sm ${
                  isActive ? 'bg-blue-600 text-white' : ''
                }`
              }
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg text-base font-semibold border border-blue-600 text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-md ${
                  isActive ? 'ring-2 ring-blue-300' : ''
                }`
              }
            >
              Register
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
