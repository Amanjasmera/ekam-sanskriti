'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('message') === 'registered') {
      setInfoMessage('Account created successfully, please sign in.')
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const cleanEmail = email.trim().toLowerCase()

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (!data?.user) {
        setError('Sign in failed. Please check your credentials.')
        setLoading(false)
        return
      }

      // Fetch user profile safely
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('chosen_language, role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profileError) {
        console.error('Profile fetch warning:', profileError)
      }

      router.refresh()

      if (profile?.role === 'artist') {
        router.push('/artist/dashboard')
      } else if (!profile?.chosen_language) {
        router.push('/language-select')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.message || 'An unexpected error occurred during sign in.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your Ekam Sanskriti account</p>
        </div>

        {infoMessage && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm text-sm font-semibold">
            {infoMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm text-sm space-y-2">
            <p className="font-bold text-red-800">{error}</p>
            {error.toLowerCase().includes('email not confirmed') && (
              <div className="mt-2 text-xs text-red-700 space-y-2 pt-2 border-t border-red-200">
                <p>
                  Supabase requires email confirmation before signing in. Please check your inbox (or Spam folder) for the verification link sent by Supabase.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!email) return alert('Please enter your email address first.')
                      const { error: resendErr } = await supabase.auth.resend({
                        type: 'signup',
                        email: email.trim().toLowerCase(),
                      })
                      if (resendErr) {
                        alert('Resend error: ' + resendErr.message)
                      } else {
                        alert('Verification email resent! Please check your inbox.')
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded text-xs transition-colors cursor-pointer"
                  >
                    📩 Resend Confirmation Email
                  </button>
                </div>
                <p className="text-[11px] text-gray-600 italic bg-white/60 p-2 rounded border border-red-100">
                  💡 <strong>Tip to disable email verification in Supabase:</strong> In your Supabase Dashboard, go to <strong>Authentication &gt; Providers &gt; Email</strong> and turn OFF <strong>"Confirm email"</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center text-lg cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}
