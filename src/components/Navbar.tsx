import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <NavLink
              to="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Logo
            </NavLink>
          </div>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex flex-1 justify-center items-center space-x-8">
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive ? 'text-blue-600 font-semibold bg-blue-50' : ''
                }`
              }
            >
              About Us
            </NavLink>
            <NavLink
              to="/features"
              className={({ isActive }) =>
                `text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive ? 'text-blue-600 font-semibold bg-blue-50' : ''
                }`
              }
            >
              Feature
            </NavLink>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                `text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive ? 'text-blue-600 font-semibold bg-blue-50' : ''
                }`
              }
            >
              Contact
            </NavLink>
            <NavLink
              to="/team"
              className={({ isActive }) =>
                `text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive ? 'text-blue-600 font-semibold bg-blue-50' : ''
                }`
              }
            >
              Our Team
            </NavLink>
          </div>

          {/* Auth Buttons - Right */}
          
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
