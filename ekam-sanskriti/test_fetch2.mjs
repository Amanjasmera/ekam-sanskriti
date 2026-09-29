import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const envPath = path.resolve('d:/HAC/ekam-sanskriti/.env.local')
const envData = fs.readFileSync(envPath, 'utf8')
let url = ''
let key = ''

envData.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim()
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim()
})

const supabase = createClient(url, key)

async function test() {
  const { data: pData, error: pErr } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (!pErr && pData) {
    const artistIds = [...new Set(pData.map(p => p.artist_id).filter(Boolean))];
    let productsWithArtists = pData;
    if (artistIds.length > 0) {
      const { data: profilesData } = await supabase.from('profiles').select('id, full_name').in('id', artistIds);
      if (profilesData) {
        const profilesMap = Object.fromEntries(profilesData.map(p => [p.id, p]));
        productsWithArtists = pData.map(p => ({ ...p, artist: profilesMap[p.artist_id] || null }));
      }
    }
    console.log('Products count:', productsWithArtists.length)
    if (productsWithArtists.length > 0) {
      console.log('Sample product:', productsWithArtists[0].name, 'by', productsWithArtists[0].artist?.full_name)
    }
  } else {
    console.error('Error fetching products:', pErr)
  }
}
test()
