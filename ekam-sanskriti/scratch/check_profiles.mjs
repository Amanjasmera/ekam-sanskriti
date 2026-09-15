import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1)
  console.log('profiles:', error ? error.message : Object.keys(data[0] || {}))
}

check()
