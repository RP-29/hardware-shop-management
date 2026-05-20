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
  FolderTree,
  Tag,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'
import SidebarLogo from './SidebarLogo'

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
    name: 'Receive Payments',
    icon: Receipt,
    path: '/receive-payments',
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
    name: 'Categories',
    icon: FolderTree,
    path: '/categories',
  },
  {
    name: 'Brands',
    icon: Tag,
    path: '/brands',
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
        fixed top-0 left-0 z-50
        h-screen w-64
        bg-slate-900 text-white
        overflow-y-auto overflow-x-hidden
        transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      {/* Logo */}
      <div className="p-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10 relative">
        <SidebarLogo />

        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 p-1 hover:bg-slate-800 rounded"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2 pb-6">
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