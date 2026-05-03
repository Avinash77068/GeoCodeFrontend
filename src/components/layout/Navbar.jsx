import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { MapPin, Menu, X, LogOut, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          <button
            className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2 md:hidden">
            <div className="p-1 bg-brand-600 rounded">
              <MapPin size={14} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-sm">GeoOutreach</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600">
                <User size={15} />
                <span>{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <LogOut size={15} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-3 py-2 space-y-0.5">
          {[
            { to: '/dashboard', label: 'Dashboard' },
            { to: '/search', label: 'Search' },
            { to: '/messages', label: 'Messages' },
            { to: '/export', label: 'Export' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium
                ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}
