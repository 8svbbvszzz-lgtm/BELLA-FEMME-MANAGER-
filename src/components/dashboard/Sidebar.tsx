import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-l border-gray-200 hidden md:flex flex-col justify-between min-h-screen">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-gray-100">
          <h1 className="text-xl font-black text-indigo-600">BELLA FEMME</h1>
        </div>
        <nav className="p-4 space-y-1">
          <Link href="/dashboard" className="flex items-center space-x-3 space-x-reverse px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg">
            <span>الرئيسية</span>
          </Link>
        </nav>
      </div>
      <div className="p-4 border-t border-gray-100">
        <LogoutButton />
      </div>
    </aside>
  )
}
