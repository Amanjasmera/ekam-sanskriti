'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    placeOfBirth: '',
    occupation: '',
    role: 'user',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    const cleanEmail = formData.email.trim().toLowerCase()

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: cleanEmail,
        password: formData.password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      if (authData?.user) {
        // Insert profile into profiles table
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            full_name: formData.fullName,
            dob: formData.dob,
            place_of_birth: formData.placeOfBirth,
            occupation: formData.occupation,
            role: formData.role,
          },
        ])

        if (profileError) {
          console.error('Error inserting profile:', profileError)
        }

        setSuccess(true)
        router.refresh()

        // Redirect based on role and session
        if (authData.session) {
          setTimeout(() => {
            if (formData.role === 'artist') {
              router.push('/artist/dashboard')
            } else {
              router.push('/language-select')
            }
          }, 1000)
        } else {
          setTimeout(() => {
            router.push('/login?message=registered')
          }, 1500)
        }
      }
    } catch (err: any) {
      console.error('Signup error:', err)
      setError(err?.message || 'An error occurred during account creation.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-500">Join Ekam Sanskriti today</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg shadow-sm text-sm">
            <p className="font-semibold">{error}</p>
            {error.toLowerCase().includes('rate limit') && (
              <p className="mt-2 text-xs text-red-600">
                Supabase email rate limit reached. If you already created an account, please try{' '}
                <Link href="/login" className="underline font-bold text-red-800">
                  Signing in here
                </Link>
                .
              </p>
            )}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg shadow-sm text-sm space-y-1">
            <p className="font-bold">Account created successfully! 🎉</p>
            <p className="text-xs">
              Redirecting you to complete your setup...
            </p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Role Selection */}
          <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200">
            <label className="block text-sm font-bold text-gray-800 mb-2">I am joining as a:</label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`p-3 rounded-lg border flex flex-col items-center cursor-pointer transition-all ${formData.role === 'user' ? 'bg-white border-orange-500 shadow-sm text-orange-700 font-bold' : 'bg-white/50 border-gray-200 text-gray-600'}`}>
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={formData.role === 'user'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-base">👤 User</span>
                <span className="text-[11px] font-normal text-gray-500 mt-0.5">Browse & Learn</span>
              </label>
              <label className={`p-3 rounded-lg border flex flex-col items-center cursor-pointer transition-all ${formData.role === 'artist' ? 'bg-white border-orange-500 shadow-sm text-orange-700 font-bold' : 'bg-white/50 border-gray-200 text-gray-600'}`}>
                <input
                  type="radio"
                  name="role"
                  value="artist"
                  checked={formData.role === 'artist'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-base">🎨 Artist</span>
                <span className="text-[11px] font-normal text-gray-500 mt-0.5">Upload & Sell</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" name="dob" required value={formData.dob} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
              <input type="text" name="placeOfBirth" required value={formData.placeOfBirth} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
            <input type="text" name="occupation" required value={formData.occupation} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" name="confirmPassword" required value={formData.confirmPassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-6 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all disabled:opacity-50 flex justify-center items-center text-lg cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Submitting...
              </span>
            ) : (
              'Submit'
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-saffron-600 hover:text-saffron-700 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
