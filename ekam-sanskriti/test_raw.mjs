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
  
  console.log(pData)
}
test()
