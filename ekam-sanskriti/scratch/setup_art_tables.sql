-- 1. Add 'role' column to 'profiles' if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- 2. Create 'products' table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  state TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product Policies
CREATE POLICY "Products are viewable by everyone" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Artists can insert their own products" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own products" ON public.products
  FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own products" ON public.products
  FOR DELETE USING (auth.uid() = artist_id);


-- 3. Create 'lessons' table
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for lessons
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Lesson Policies
CREATE POLICY "Lessons are viewable by everyone" ON public.lessons
  FOR SELECT USING (true);

CREATE POLICY "Artists can insert their own lessons" ON public.lessons
  FOR INSERT WITH CHECK (auth.uid() = artist_id);

CREATE POLICY "Artists can update their own lessons" ON public.lessons
  FOR UPDATE USING (auth.uid() = artist_id);

CREATE POLICY "Artists can delete their own lessons" ON public.lessons
  FOR DELETE USING (auth.uid() = artist_id);

-- Optional: You can insert mock data using the SQL Editor to test the UI.
-- Since inserting mock data requires valid artist profile IDs, we skip it here 
-- to avoid foreign key constraint errors.

-- 4. New Migrations (Course Launch System & Cleanup)
ALTER TABLE public.lessons 
  ADD COLUMN IF NOT EXISTS course_status TEXT DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS launch_date TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_lessons INT DEFAULT 1;

-- Clear dummy data (if any):
DELETE FROM public.products WHERE artist_id IN 
  (SELECT id FROM public.profiles WHERE full_name IN 
   ('Sita Devi', 'Rajesh Kumar'));
DELETE FROM public.lessons WHERE artist_id IN 
  (SELECT id FROM public.profiles WHERE full_name IN 
   ('Sita Devi', 'Rajesh Kumar'));
