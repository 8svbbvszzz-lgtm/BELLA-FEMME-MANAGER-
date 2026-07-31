export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center space-x-4 space-x-reverse">
        <span className="text-sm font-medium text-gray-600">لوحة التحكم الإدارية</span>
      </div>
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
          BF
        </div>
      </div>
    </header>
  )
}
