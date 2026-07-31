// ==========================================
// 1. lib/supabase/server.ts
// ==========================================
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

// ==========================================
// 2. utils/supabase/middleware.ts
// ==========================================
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user && !request.nextUrl.pathname.startsWith('/login') && !request.nextUrl.pathname.startsWith('/auth')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && request.nextUrl.pathname.startsWith('/login')) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// ==========================================
// 3. src/middleware.ts
// ==========================================
import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}

// ==========================================
// 4. src/components/dashboard/LogoutButton.tsx
// ==========================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.replace('/login')
    router.refresh()
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center space-x-2 space-x-reverse w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
        <span>تسجيل الخروج</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl text-right">
            <h3 className="text-lg font-bold text-gray-900 mb-2">تأكيد تسجيل الخروج</h3>
            <p className="text-sm text-gray-500 mb-6">هل أنت متأكد من رغبتك في الخروج من نظام BELLA FEMME؟</p>
            <div className="flex space-x-3 space-x-reverse">
              <button disabled={loading} onClick={handleLogout} className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50">{loading ? 'جاري الخروج...' : 'تأكيد'}</button>
              <button disabled={loading} onClick={() => setIsOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ==========================================
// 5. src/components/dashboard/Sidebar.tsx
// ==========================================
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-l border-gray-200 min-h-screen">
      <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-black text-indigo-600 tracking-wider">BELLA FEMME</h1>
        <p className="text-xs text-gray-400 mt-1">نظام الإدارة الشامل</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        <Link href="/dashboard" className="flex items-center space-x-3 space-x-reverse px-4 py-2.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg">
          <span>لوحة التحكم</span>
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-100"><LogoutButton /></div>
    </aside>
  )
}

// ==========================================
// 6. src/components/dashboard/Header.tsx
// ==========================================
import { createClient } from '@/lib/supabase/server'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userMetadata = user?.user_metadata
  const displayName = userMetadata?.full_name || userMetadata?.name || 'مدير النظام'
  const userEmail = user?.email || ''

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="md:hidden"><span className="font-bold text-indigo-600 text-lg">BELLA FEMME</span></div>
      <div className="hidden md:block"><h2 className="text-sm font-medium text-gray-500">نظرة عامة على الأداء</h2></div>
      <div className="flex items-center space-x-3 space-x-reverse">
        <div className="text-left md:text-right">
          <p className="text-sm font-bold text-gray-800">{displayName}</p>
          <p className="text-xs text-gray-500">{userEmail}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
          {displayName.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  )
}

// ==========================================
// 7. src/components/dashboard/StatsGrid.tsx
// ==========================================
export default function StatsGrid() {
  const stats = [
    { title: 'إجمالي المبيعات', value: '24,500 د.ج', change: '+12%' },
    { title: 'الطلبات الجديدة', value: '142', change: '+5%' },
    { title: 'العملاء', value: '1,204', change: '+18%' },
    { title: 'المنتجات النشطة', value: '86', change: '0%' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
          <div className="flex items-baseline justify-between">
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{stat.change}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

// ==========================================
// 8. src/app/dashboard/layout.tsx
// ==========================================
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row-reverse">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

// ==========================================
// 9. src/app/dashboard/loading.tsx
// ==========================================
export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-28 bg-gray-200 rounded-xl w-full"></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (<div key={i} className="h-32 bg-gray-200 rounded-xl"></div>))}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl w-full"></div>
    </div>
  )
}

// ==========================================
// 10. src/app/dashboard/page.tsx
// ==========================================
import { createClient } from '@/lib/supabase/server'
import StatsGrid from '@/components/dashboard/StatsGrid'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userMetadata = user?.user_metadata
  const displayName = userMetadata?.full_name || userMetadata?.name || 'مدير النظام'
  const userEmail = user?.email || ''

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-l from-indigo-600 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-lg">
        <h1 className="text-2xl md:text-3xl font-black mb-2">أهلاً بك مجدداً، {displayName} 👋</h1>
        <p className="text-indigo-100 text-sm md:text-base max-w-xl">إليك ملخص سريع لأداء متجر BELLA FEMME اليوم.</p>
        <div className="mt-4 inline-flex items-center bg-indigo-500/40 px-3 py-1.5 rounded-lg text-xs font-medium">
          <span>البريد المسجل: {userEmail}</span>
        </div>
      </div>
      <StatsGrid />
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4">النشاطات الأخيرة</h3>
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-lg text-gray-400 text-sm">
          لا توجد نشاطات حديثة لعرضها حالياً
        </div>
      </div>
    </div>
  )
}
