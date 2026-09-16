'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ArtistPolling({ userId, initialStatus }: { userId: string, initialStatus: string }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (initialStatus !== 'pending') return

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('artist_status')
        .eq('id', userId)
        .maybeSingle()

      if (data && data.artist_status !== 'pending') {
        // Status changed, refresh the page to update server components and sidebar
        router.refresh()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [userId, initialStatus, router, supabase])

  if (initialStatus !== 'pending') return null

  return (
    <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-3 rounded-xl mb-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
        <span className="font-semibold text-sm">Your artist verification is currently pending. Checking for updates automatically...</span>
      </div>
    </div>
  )
}
