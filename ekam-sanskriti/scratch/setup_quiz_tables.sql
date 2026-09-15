-- 1. Create the user_quiz_attempts table
CREATE TABLE IF NOT EXISTS public.user_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,           -- 'monuments' | 'food' | 'festivals' | 'arts'
    item_slug TEXT NOT NULL,          -- 'taj-mahal'
    question_id TEXT NOT NULL,        -- unique ID from quiz bank
    user_answer_index INT,
    is_correct BOOLEAN,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_quiz_lookup 
    ON public.user_quiz_attempts(user_id, category, item_slug);

-- 3. Enable RLS
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
CREATE POLICY "Users manage own attempts" 
    ON public.user_quiz_attempts FOR ALL 
    USING (auth.uid() = user_id);
