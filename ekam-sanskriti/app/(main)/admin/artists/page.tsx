'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { CheckCircle, XCircle, Search, ShieldAlert } from 'lucide-react'

// Allow any emails that are considered admins
const ADMIN_EMAILS = ['admin@ekamsanskriti.com', 'test@example.com']

export default function AdminArtistsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [artists, setArtists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [rejectionNotes, setRejectionNotes] = useState<{ [key: string]: string }>({})
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter()

  useEffect(() => {
    checkAdminAndFetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkAdminAndFetch() {
    const { data: { user } } = await supabase.auth.getUser()
    
    // Check if user is logged in and is an admin
    if (!user || (!ADMIN_EMAILS.includes(user.email || '') && !user.email?.includes('admin'))) {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    setIsAdmin(true)
    fetchArtists()
  }

  async function fetchArtists() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'artist')
      .order('created_at', { ascending: false })

    if (data) {
      setArtists(data)
    }
    setLoading(false)
  }

  async function updateStatus(id: string, status: 'verified' | 'rejected') {
    const notes = status === 'rejected' ? rejectionNotes[id] || '' : null

    const { error } = await supabase
      .from('profiles')
      .update({
        artist_status: status,
        artist_verified_at: status === 'verified' ? new Date().toISOString() : null,
        artist_notes: notes
      })
      .eq('id', id)

    if (!error) {
      setArtists(artists.map(a => a.id === id ? { ...a, artist_status: status, artist_notes: notes } : a))
    } else {
      console.error('Error updating status:', error)
      alert('Failed to update status. Check console.')
    }
  }

  if (loading) {
    return <div className="p-8">Loading admin dashboard...</div>
  }

  if (!isAdmin) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center mt-20">
        <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600">You do not have permission to view the admin dashboard.</p>
      </div>
    )
  }

  const pendingArtists = artists.filter(a => a.artist_status === 'pending')
  const otherArtists = artists.filter(a => a.artist_status !== 'pending')

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Artist Verification</h1>
        <p className="text-gray-700 mt-2">Approve or reject new artist signups.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="bg-orange-100 text-orange-700 w-8 h-8 rounded-full flex items-center justify-center text-sm">
            {pendingArtists.length}
          </span>
          Pending Verification
        </h2>
        
        {pendingArtists.length === 0 ? (
          <p className="text-gray-700 italic">No pending artists to review.</p>
        ) : (
          <div className="space-y-4">
            {pendingArtists.map(artist => (
              <div key={artist.id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-lg">{artist.full_name}</h3>
                  <div className="mt-2 text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Occupation:</span> {artist.occupation}</p>
                    <p><span className="font-medium">Place of Birth:</span> {artist.place_of_birth}</p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <button
                    onClick={() => updateStatus(artist.id, 'verified')}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={18} /> Approve
                  </button>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Rejection reason..."
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-0"
                      value={rejectionNotes[artist.id] || ''}
                      onChange={e => setRejectionNotes({...rejectionNotes, [artist.id]: e.target.value})}
                    />
                    <button
                      onClick={() => updateStatus(artist.id, 'rejected')}
                      className="bg-red-100 hover:bg-red-200 text-red-700 font-bold py-2 px-3 rounded-lg flex-shrink-0"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 opacity-75">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Past Decisions</h2>
        {otherArtists.length === 0 ? (
          <p className="text-gray-700 italic">No past decisions.</p>
        ) : (
          <div className="space-y-3">
            {otherArtists.map(artist => (
              <div key={artist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <span className="font-medium">{artist.full_name}</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className={`text-sm font-bold ${artist.artist_status === 'verified' ? 'text-green-600' : 'text-red-600'}`}>
                    {artist.artist_status?.toUpperCase()}
                  </span>
                  {artist.artist_notes && (
                    <p className="text-xs text-gray-700 mt-1">Note: {artist.artist_notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
