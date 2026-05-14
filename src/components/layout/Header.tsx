import { Menu } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const { user, signOut } = useAuthStore()

  return (
    <header className="bg-white border-b px-4 sm:px-6 py-4 flex items-center justify-between">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Dashboard
        </h2>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="hidden md:block text-gray-600 text-sm">
          {user?.email}
        </span>

        <button
          onClick={signOut}
          className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
        >
          Logout
        </button>
      </div>
    </header>
  )
}