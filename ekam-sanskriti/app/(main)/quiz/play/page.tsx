'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import quizBank from '@/data/quiz-questions.json';
import { getDictionary } from '@/lib/i18n';
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia';

function QuizPlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const category = searchParams.get('category') || 'monuments';
  const itemSlug = searchParams.get('item') || 'taj-mahal';
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMastered, setIsMastered] = useState(false);
  const [langCode, setLangCode] = useState<string>('en');
  const [attemptLog, setAttemptLog] = useState<any[]>([]);

  const loadQuizQuestions = async (uid: string, categoryName: string, slug: string) => {
    // 1. Load all questions for this item
    const allQuestions = (quizBank as any)[categoryName]?.filter(
      (q: any) => q.itemSlug === slug
    ) || [];
    
    console.log("Total questions in bank:", allQuestions.length);
    
    const supabase = createClient();
    
    // 2. Fetch user's already-attempted questions
    const { data: attempted, error } = await supabase
      .from('user_quiz_attempts')
      .select('question_id')
      .eq('user_id', uid)
      .eq('category', categoryName)
      .eq('item_slug', slug);
    
    console.log("Previous attempts:", attempted?.length || 0);
    console.log("Attempts error:", error);
    
    const attemptedIds = new Set(
      (attempted || []).map((a: any) => a.question_id)
    );
    
    // 3. Filter out already-seen questions
    let unseen = allQuestions.filter((q: any) => !attemptedIds.has(q.id));
    
    console.log("Unseen questions:", unseen.length);
    
    let isCurrentlyMastered = false;
    
    // 4. If not enough unseen, reset and use all
    if (unseen.length < 5) {
      console.log("Reset — user has seen all questions");
      unseen = allQuestions;
      if (allQuestions.length >= 5) {
        isCurrentlyMastered = true;
      }
    }
    
    // 5. Shuffle and pick 5
    const shuffled = unseen.sort(() => Math.random() - 0.5);
    return { questions: shuffled.slice(0, 5), isMastered: isCurrentlyMastered };
  };

  const fetchQuestions = async (uid: string) => {
    setLoading(true);
    try {
      const data = await loadQuizQuestions(uid, category, itemSlug);
      setQuestions(data.questions);
      setIsMastered(data.isMastered);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      // Load language preference
      if (typeof window !== 'undefined') {
        const localLang = localStorage.getItem('chosen_language');
        if (localLang) {
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === localLang.toLowerCase().trim()
          );
          if (matched) setLangCode(matched.code);
        }
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      if (user) {
        const { data } = await supabase.from('profiles').select('chosen_language').eq('id', user.id).maybeSingle();
        if (data?.chosen_language) {
          const matched = SUPPORTED_LANGUAGES.find(
            l => l.code.toLowerCase() === data.chosen_language.toLowerCase().trim()
          );
          if (matched) setLangCode(matched.code);
        }
      }
      setUserId(user.id);
      await fetchQuestions(user.id);
    };
    init();
  }, [category, itemSlug]);

  const handleAnswer = async (optIdx: number, isCorrect: boolean, qId: string) => {
    const newAttemptLog = [...attemptLog, {
      question_id: qId,
      user_answer_index: optIdx,
      is_correct: isCorrect
    }];
    setAttemptLog(newAttemptLog);

    if (isCorrect) setScore(prev => prev + 1);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Finished
      const finalScore = isCorrect ? score + 1 : score;
      
      console.log("=== QUIZ SUBMIT STARTED ===");
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("No user:", userError);
        alert("Please sign in again.");
        return;
      }
      
      console.log("User:", user);
      console.log("User ID:", user.id);
      console.log("Category:", category);
      console.log("Item slug:", itemSlug);
      const itemName = itemSlug.replace(/-/g, ' ');
      console.log("Item name:", itemName);
      console.log("Score:", finalScore, "/", questions.length);

      const scorePayload = {
        user_id: user.id,
        category: category,
        item_slug: itemSlug,
        item_name: itemName,
        score: finalScore,
        total: questions.length,
      };
      
      console.log("Saving score:", scorePayload);
      
      const { data: scoreData, error: scoreError } = await supabase
        .from('quiz_scores')
        .insert(scorePayload)
        .select();
      
      if (scoreError) {
        console.error("Score save FAILED:", scoreError);
        alert("Could not save score: " + scoreError.message);
        return; // Don't show results yet if it completely failed
      }
      
      console.log("Score saved successfully:", scoreData);

      const attemptRows = newAttemptLog.map(a => ({
        user_id: user.id,
        category: category,
        item_slug: itemSlug,
        question_id: a.question_id,
        is_correct: a.is_correct,
      }));
      
      console.log("Saving attempts:", attemptRows);
      
      const { data: attemptData, error: attemptError } = await supabase
        .from('user_quiz_attempts')
        .insert(attemptRows)
        .select();
      
      console.log("Attempts saved:", attemptData);
      console.log("Attempts error:", attemptError);

      setShowResults(true);
    }
  };

  const handleTryAgain = () => {
    if (userId) {
      setCurrentIdx(0);
      setScore(0);
      setShowResults(false);
      setAttemptLog([]);
      fetchQuestions(userId);
    }
  };

  const dict = getDictionary(langCode);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-gray-600 animate-pulse">{dict.quiz.loading}</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-xl font-bold text-gray-800 mb-4">{dict.quiz.noQuestions}</div>
        <button onClick={() => router.push('/quiz')} className="bg-saffron-600 text-white px-6 py-2 rounded-lg font-bold">{dict.quiz.backToQuiz}</button>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center">
        <div className="max-w-xl w-full p-8 bg-white rounded-3xl shadow-xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">{dict.quiz.quizComplete}</h2>
          <p className="text-gray-500 mb-8">{dict.quiz.youAnswered.replace('{total}', String(questions.length)).replace('{topic}', itemSlug.replace(/-/g, ' '))}</p>
          
          <div className="bg-gray-50 p-6 rounded-2xl mb-8 border border-gray-100">
            <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">{dict.quiz.yourScore}</p>
            <p className="text-5xl font-black text-saffron-600">{score} <span className="text-2xl text-gray-400">/ {questions.length}</span></p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleTryAgain} className="bg-saffron-600 hover:bg-saffron-700 text-white px-6 py-3.5 rounded-xl font-bold shadow-md transition-all">
              {dict.quiz.tryAgain}
            </button>
            <button onClick={() => router.push('/quiz')} className="bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-xl font-bold shadow-md transition-all">
              {dict.quiz.backToQuiz}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentIdx];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-2xl mx-auto">
        
        {isMastered && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-5 py-3 rounded-xl font-semibold text-center flex items-center justify-center gap-2">
            {dict.quiz.masteredTopic}
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 capitalize drop-shadow-sm">
              {itemSlug.replace(/-/g, ' ')}
            </h1>
            <p className="text-saffron-600 font-bold text-sm uppercase tracking-widest mt-1">{category} {dict.quiz.categoryQuiz}</p>
          </div>
          <div className="bg-white border border-gray-200 px-5 py-2 rounded-full shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse"></div>
            <span className="font-bold text-gray-700 text-sm">{dict.quiz.question} {currentIdx + 1} {dict.quiz.of} {questions.length}</span>
          </div>
        </div>

        <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 leading-tight">{q.question}</h2>
          
          <div className="space-y-4">
            {q.options.map((opt: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => handleAnswer(idx, idx === q.correctIndex, q.id)}
                className="w-full text-left p-5 rounded-2xl border-2 border-gray-100 hover:bg-saffron-50 hover:border-saffron-400 transition-all font-semibold text-gray-700 hover:text-saffron-800 hover:shadow-md cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}

export default function QuizPlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-xl font-bold text-gray-600 animate-pulse">Loading...</div></div>}>
      <QuizPlayContent />
    </Suspense>
  );
}
