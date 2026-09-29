/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createClient } from '@/utils/supabase/server';
import quizBank from '@/data/quiz-questions.json';

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleQuestionOptions(q: any) {
  const originalCorrectOption = q.options[q.correctIndex];
  const shuffledOptions = shuffle([...q.options]);
  const newCorrectIndex = shuffledOptions.indexOf(originalCorrectOption);
  return {
    ...q,
    options: shuffledOptions,
    correctIndex: newCorrectIndex
  };
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

  // 2. Get all attempt records for this user and item
  const { data: attempted } = await supabase
    .from('user_quiz_attempts')
    .select('question_id')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('item_slug', itemSlug);
  
  // 3. Count attempts per question
  const attemptCounts: Record<string, number> = {};
  for (const a of (attempted || [])) {
    attemptCounts[a.question_id] = (attemptCounts[a.question_id] || 0) + 1;
  }
  
  // 4. Find the minimum attempt count across all available questions
  let minAttempts = 0;
  if (availableQuestions.length > 0) {
    minAttempts = Math.min(...availableQuestions.map((q: any) => attemptCounts[q.id] || 0));
  }
  
  // 5. Filter for questions that are at the minimum attempt count (the "unseen" ones for this lap)
  let unseen = availableQuestions.filter((q: any) => (attemptCounts[q.id] || 0) === minAttempts);
  
  let isMastered = minAttempts > 0; // If minAttempts > 0, they've seen everything at least once!
  
  // If we somehow don't have enough, we'll just fall back to all available
  if (unseen.length < count && availableQuestions.length >= count) {
     unseen = availableQuestions;
  }
  
  // 5. Pick the first `count` unseen questions sequentially and shuffle their options
  const selectedQuestions = unseen.slice(0, count).map(shuffleQuestionOptions);
  
  return { 
    questions: selectedQuestions, 
    isMastered 
  };
}

export async function saveQuizAttempt(userId: string, category: string, itemSlug: string, itemName: string, attempts: { question_id: string, user_answer_index: number, is_correct: boolean }[], finalScore: number) {
  const supabase = await createClient();
  
  // Save to user_quiz_attempts
  const records = attempts.map(a => ({
    user_id: userId,
    category,
    item_slug: itemSlug,
    question_id: a.question_id,
    is_correct: a.is_correct
  }));
  
  const { error: insertError } = await supabase.from('user_quiz_attempts').insert(records);
  if (insertError) {
    console.error("Failed to insert into user_quiz_attempts:", insertError);
    throw new Error(insertError.message);
  }
  
  // Try inserting into quiz_scores, ignoring errors if it doesn't exist
  try {
    await supabase.from('quiz_scores').insert({
      user_id: userId,
      category,
      item_slug: itemSlug,
      item_name: itemName,
      score: finalScore,
      total: attempts.length
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    // Ignore error if table doesn't exist
  }
}
