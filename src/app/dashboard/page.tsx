import { createClient } from '@/lib/supabase/server'
import StatsGrid from '@/components/dashboard/StatsGrid'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userEmail = user?.email || ''

  return (
    <div className="space-y-6 text-right">
      <div className="bg-gradient-to-l from-indigo-600 to-violet-600 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-black">مرحباً بك في لوحة تحكم BELLA FEMME</h1>
        <p className="text-indigo-100 text-sm mt-2">إدارة متجرك بكل سهولة واحترافية</p>
        <div className="mt-4 inline-flex items-center bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-medium">
          <span>الحساب المسجل: {userEmail}</span>
        </div>
      </div>

      <StatsGrid />

      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">نشاط المتجر</h3>
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-gray-400 text-sm">
          لا توجد أي بيانات متاحة حالياً
        </div>
      </div>
    </div>
  )
}
