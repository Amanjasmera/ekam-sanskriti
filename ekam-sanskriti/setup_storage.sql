-- Run this SQL in your Supabase SQL Editor to create the artist-uploads bucket and set up policies

-- 1. Create the bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artist-uploads', 'artist-uploads', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'])
on conflict (id) do update set public = true;

-- 2. Create Storage Policies
-- Allow anyone to read
create policy "Public Access" 
on storage.objects for select 
using ( bucket_id = 'artist-uploads' );

-- Allow authenticated users to insert
create policy "Authenticated Users can upload" 
on storage.objects for insert 
with check ( bucket_id = 'artist-uploads' and auth.role() = 'authenticated' );

-- Allow users to update their own uploads
create policy "Users can update own uploads"
on storage.objects for update
using ( bucket_id = 'artist-uploads' and auth.uid() = owner )
with check ( bucket_id = 'artist-uploads' and auth.uid() = owner );

-- Allow users to delete their own uploads
create policy "Users can delete own uploads"
on storage.objects for delete
using ( bucket_id = 'artist-uploads' and auth.uid() = owner );
