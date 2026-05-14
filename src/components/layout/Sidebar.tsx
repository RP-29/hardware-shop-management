import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Receipt,
  FileText,
  Settings,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const menuItems = [
  {
    name: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    name: 'Inventory',
    icon: Package,
    path: '/inventory',
  },
  {
    name: 'Purchases',
    icon: ShoppingCart,
    path: '/purchases',
  },
  {
    name: 'Sales',
    icon: Receipt,
    path: '/sales',
  },
  {
    name: 'Customers',
    icon: Users,
    path: '/customers',
  },
  {
    name: 'Suppliers',
    icon: Truck,
    path: '/suppliers',
  },
  {
    name: 'Reports',
    icon: FileText,
    path: '/reports',
  },
  {
    name: 'Settings',
    icon: Settings,
    path: '/settings',
  },
]

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-slate-900 text-white
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hardware ERP</h1>
          <p className="text-xs text-slate-400 mt-1">
            Management System
          </p>
        </div>

        <button
          onClick={onClose}
          className="lg:hidden p-1 hover:bg-slate-800 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}