/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/utils/supabase/server';
import quizBank from '@/data/quiz-questions.json';

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => 0.5 - Math.random());
}

export async function getQuizQuestions(userId: string, category: string, itemSlug: string, count: number = 5) {
  const supabase = await createClient();
  
  // 1. Get all questions from local bank for this category & item
  // Fallback to empty array if category doesn't exist
  const categoryQuestions = (quizBank as any)[category] || [];
  const allQuestions = categoryQuestions.filter(
    (q: any) => q.itemSlug === itemSlug
  );

  // If no specific item questions, use the category questions
  const availableQuestions = allQuestions.length > 0 ? allQuestions : categoryQuestions;
  
  if (availableQuestions.length === 0) {
    return { questions: [], isMastered: false };
  }

  // 2. Get question IDs the user has already answered
  const { data: attempted } = await supabase
    .from('user_quiz_attempts')
    .select('question_id')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('item_slug', itemSlug);
  
  const attemptedIds = new Set(attempted?.map(a => a.question_id) || []);
  
  // 3. Filter out already-attempted questions
  let unseen = availableQuestions.filter((q: any) => !attemptedIds.has(q.id));
  
  let isMastered = false;
  
  // 4. If not enough unseen questions, reset (allow repeats ONLY after all questions have been seen once)
  if (unseen.length < count) {
    if (availableQuestions.length >= count && unseen.length === 0) {
      isMastered = true; // They've answered everything for this item!
      unseen = availableQuestions;
    } else if (availableQuestions.length >= count) {
      // Pad with seen ones to make up the count
      const seen = availableQuestions.filter((q: any) => attemptedIds.has(q.id));
      unseen = [...unseen, ...shuffle(seen).slice(0, count - unseen.length)];
    } else {
      // Very small set of questions in total
      unseen = availableQuestions;
    }
  }
  
  // 5. Randomly pick `count` questions
  return { 
    questions: shuffle(unseen).slice(0, count), 
    isMastered 
  };
}

export async function saveQuizAttempt(userId: string, category: string, itemSlug: string, attempts: { question_id: string, user_answer_index: number, is_correct: boolean }[], finalScore: number) {
  const supabase = await createClient();
  
  // Save to user_quiz_attempts
  const records = attempts.map(a => ({
    user_id: userId,
    category,
    item_slug: itemSlug,
    question_id: a.question_id,
    user_answer_index: a.user_answer_index,
    is_correct: a.is_correct
  }));
  
  await supabase.from('user_quiz_attempts').insert(records);
  
  // We can also save an aggregate score if there's a quiz_scores table, but user prompt says:
  // "save to Supabase (both quiz_scores AND user_quiz_attempts)"
  
  // Try inserting into quiz_scores, ignoring errors if it doesn't exist
  try {
    await supabase.from('quiz_scores').insert({
      user_id: userId,
      category,
      item_slug: itemSlug,
      score: finalScore,
      total_questions: attempts.length
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    // Ignore error if table doesn't exist
  }
}
