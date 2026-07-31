'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.replace('/dashboard')
      } else {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [router, supabase])

  const getArabicErrorMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase()
    if (lowerMessage.includes('invalid login credentials')) {
      return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'
    }
    if (lowerMessage.includes('email not confirmed')) {
      return 'البريد الإلكتروني غير مؤكد، يرجى التحقق من بريدك.'
    }
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch')) {
      return 'تعذر الاتصال بالخادم، يرجى التحقق من اتصال الإنترنت.'
    }
    return 'حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى لاحقاً.'
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError(getArabicErrorMessage(authError.message))
        return
      }

      router.replace('/dashboard')
      router.refresh()
    })
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-2 text-gray-800">BELLA FEMME</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">تسجيل الدخول للنظام</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm text-right">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-right">البريد الإلكتروني</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
              placeholder="example@domain.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-right">كلمة المرور</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200 font-medium flex items-center justify-center disabled:opacity-50"
          >
            {isPending ? (
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>جاري الدخول...</span>
              </div>
            ) : (
              'دخول'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
