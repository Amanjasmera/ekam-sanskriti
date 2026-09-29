const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('d:/HAC/ekam-sanskriti/.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY']; // Need service role to create bucket

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupBucket() {
  console.log('Checking if artist-uploads bucket exists...')
  const { data: buckets, error: getError } = await supabase.storage.getBuckets()
  if (getError) {
    console.error('Error fetching buckets:', getError)
    return
  }

  const bucketExists = buckets.some(b => b.name === 'artist-uploads')

  if (!bucketExists) {
    console.log('Creating artist-uploads bucket...')
    const { error: createError } = await supabase.storage.createBucket('artist-uploads', {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*'],
      fileSizeLimit: 52428800 // 50MB
    })
    
    if (createError) {
      console.error('Failed to create bucket:', createError)
    } else {
      console.log('Bucket created successfully!')
    }
  } else {
    console.log('Bucket already exists.')
    
    // Ensure it's public
    await supabase.storage.updateBucket('artist-uploads', {
      public: true,
      allowedMimeTypes: ['image/*', 'video/*'],
      fileSizeLimit: 52428800 // 50MB
    })
    console.log('Bucket updated to public.')
  }
}

setupBucket()
