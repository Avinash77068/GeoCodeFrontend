import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, MessageSquare, Download, MapPin, ShieldCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const userNav = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/export', label: 'Export', icon: Download },
]

const adminNav = [
  { to: '/admin', label: 'Admin Panel', icon: ShieldCheck },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/export', label: 'Export', icon: Download },
]

export default function Sidebar() {
  const { user } = useAuth()
  const nav = user?.role === 'admin' ? adminNav : userNav

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white border-r border-gray-200 min-h-screen">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
        <div className="p-1.5 bg-brand-600 rounded-lg">
          <MapPin size={18} className="text-white" />
        </div>
        <span className="font-semibold text-gray-900 text-sm">GeoOutreach</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-brand-50 text-brand-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
