'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import quizBank from '@/data/quiz-questions.json';
import { getDictionary } from '@/lib/i18n';
import { SUPPORTED_LANGUAGES } from '@/lib/wikipedia';
import PageTransition from '@/components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, Brain } from 'lucide-react';

function QuizPlayContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const category = searchParams.get('category') || 'monuments';
  const itemSlug = searchParams.get('item') || 'taj-mahal';
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isMastered, setIsMastered] = useState(false);
  const [langCode, setLangCode] = useState<string>('en');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [attemptLog, setAttemptLog] = useState<any[]>([]);

  const loadQuizQuestions = async (uid: string, categoryName: string, slug: string) => {
    // 1. Load all questions for this item
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allQuestions = (quizBank as any)[categoryName]?.filter(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (attempted || []).map((a: any) => a.question_id)
    );
    
    // 3. Filter out already-seen questions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center">
          <Brain size={48} className="text-saffron animate-bounce mb-4" />
          <div className="text-xl font-bold font-heading text-gray-600 animate-pulse">{dict.quiz.loading}</div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream p-6">
        <div className="glass-card p-10 max-w-md text-center rounded-3xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">😕</span>
          </div>
          <div className="text-xl font-bold font-heading text-gray-800 mb-6">{dict.quiz.noQuestions}</div>
          <button onClick={() => router.push('/quiz')} className="bg-saffron text-white px-6 py-3 rounded-xl font-bold hover:bg-saffron-600 transition-colors w-full">{dict.quiz.backToQuiz}</button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <PageTransition className="min-h-screen bg-cream p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Background Ornaments */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-64 h-64 bg-saffron/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[10%] left-[10%] w-64 h-64 bg-indiaGreen/20 rounded-full blur-3xl"></div>
        </div>

        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="glass-card max-w-xl w-full p-10 rounded-3xl shadow-2xl border border-white/40 text-center relative z-10"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30 transform rotate-12">
            <Award size={48} className="text-white" />
          </div>
          
          <h2 className="text-4xl font-black font-heading text-gray-900 mb-3">{dict.quiz.quizComplete}</h2>
          <p className="text-gray-700 mb-8 font-medium text-lg">{dict.quiz.youAnswered.replace('{total}', String(questions.length)).replace('{topic}', itemSlug.replace(/-/g, ' '))}</p>
          
          <div className="bg-white/60 backdrop-blur-md p-8 rounded-2xl mb-10 border border-white/60 shadow-inner">
            <p className="text-sm text-gray-700 font-bold uppercase tracking-widest mb-2">{dict.quiz.yourScore}</p>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-7xl font-black bg-gradient-to-r from-saffron to-maroon text-transparent bg-clip-text">{score}</span>
              <span className="text-3xl font-bold text-gray-600">/ {questions.length}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={handleTryAgain} className="bg-gradient-to-r from-saffron to-maroon hover:from-saffron-600 hover:to-maroon-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-saffron/30 transition-all active:scale-95 text-lg w-full sm:w-auto">
              {dict.quiz.tryAgain}
            </button>
            <button onClick={() => router.push('/quiz')} className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 px-8 py-4 rounded-xl font-bold shadow-sm hover:shadow-md transition-all active:scale-95 text-lg w-full sm:w-auto">
              {dict.quiz.backToQuiz}
            </button>
          </div>
        </motion.div>
      </PageTransition>
    );
  }

  const q = questions[currentIdx];

  return (
    <PageTransition className="min-h-screen bg-cream p-6 md:p-12">
      <div className="max-w-3xl mx-auto">
        
        {isMastered && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 glass-card border border-green-200/50 bg-green-50/80 px-6 py-4 rounded-2xl font-bold text-center flex items-center justify-center gap-3 shadow-sm text-green-800"
          >
            <Award size={20} className="text-green-600" />
            {dict.quiz.masteredTopic}
          </motion.div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black font-heading text-gray-900 capitalize drop-shadow-sm mb-2">
              {itemSlug.replace(/-/g, ' ')}
            </h1>
            <p className="text-saffron font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={14} /> {category} {dict.quiz.categoryQuiz}
            </p>
          </div>
          
          <div className="glass-card px-6 py-3 rounded-full shadow-sm flex items-center gap-3 border border-white/50">
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentIdx ? 'bg-saffron scale-125' : i < currentIdx ? 'bg-saffron/40' : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <span className="font-bold text-gray-700 text-sm border-l border-gray-200 pl-3">
              {currentIdx + 1} / {questions.length}
            </span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 md:p-12 rounded-3xl shadow-xl border border-white/40"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 leading-relaxed font-heading">
              {q.question}
            </h2>
            
            <div className="space-y-4">
              {q.options.map((opt: string, idx: number) => (
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  key={idx}
                  onClick={() => handleAnswer(idx, idx === q.correctIndex, q.id)}
                  className="w-full text-left p-6 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-transparent hover:border-saffron hover:bg-saffron/5 hover:shadow-md transition-all font-semibold text-gray-800 text-lg flex items-center gap-4 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-bold group-hover:bg-saffron group-hover:text-white transition-colors">
                    {String.fromCharCode(65 + idx)}
                  </div>
                  {opt}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
        
      </div>
    </PageTransition>
  );
}

export default function QuizPlayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="flex flex-col items-center">
          <Brain size={48} className="text-saffron animate-bounce mb-4" />
          <div className="text-xl font-bold font-heading text-gray-600 animate-pulse">Loading...</div>
        </div>
      </div>
    }>
      <QuizPlayContent />
    </Suspense>
  );
}
