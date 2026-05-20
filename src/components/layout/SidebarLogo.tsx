export default function SidebarLogo() {
  return (
    <div className="flex flex-col items-center text-center py-6">
      {/* Logo Circle */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg mb-4">
        <span className="text-4xl font-extrabold text-white">
          RK
        </span>
      </div>

      {/* Company Name */}
      <h1 className="text-3xl font-extrabold text-white tracking-wide">
        Hardware ERP
      </h1>

      {/* Subtitle */}
      <p className="text-sm text-slate-300 mt-1">
        Management System
      </p>
    </div>
  )
}