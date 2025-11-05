import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-black text-white border-b border-gray-800">
      <div className="px-6 py-3 flex items-center gap-8">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <span className="font-semibold text-lg">Planning</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/entries"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-900 text-green-400 transition-colors ${
                isActive ? 'bg-gray-900' : ''
              }`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <span className="font-medium">Entries</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-900 text-green-400 transition-colors ${
                isActive ? 'bg-gray-900' : ''
              }`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="font-medium">Reports</span>
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-900 text-green-400 transition-colors ${
                isActive ? 'bg-gray-900' : ''
              }`
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2.994 1.994 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
              />
            </svg>
            <span className="font-medium">Categories</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
