import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

async function check() {
  const { data: pData, error: pErr } = await supabase.from('products').select('id').limit(1)
  console.log('products:', pErr ? pErr.message : 'exists')

  const { data: lData, error: lErr } = await supabase.from('lessons').select('id').limit(1)
  console.log('lessons:', lErr ? lErr.message : 'exists')
}

check()
