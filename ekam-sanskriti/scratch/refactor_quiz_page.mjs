import fs from 'fs';

const path = 'd:/HAC/ekam-sanskriti/app/(main)/quiz/play/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace imports
content = content.replace(
  /import quizBank from '@\/data\/quiz-questions.json';/,
  "import { getQuizQuestions, saveQuizAttempt } from '@/lib/quiz';"
);

// Replace loadQuizQuestions and fetchQuestions
const loadRegex = /const loadQuizQuestions = async[\s\S]*?const fetchQuestions = async \(uid: string\) => {[\s\S]*?setLoading\(false\);\s*};/;

const fetchReplacement = `  const fetchQuestions = async (uid: string) => {
    setLoading(true);
    try {
      const data = await getQuizQuestions(uid, category, itemSlug, 5);
      setQuestions(data.questions);
      setIsMastered(data.isMastered);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };`;

content = content.replace(loadRegex, fetchReplacement);

// Replace submit logic
const submitRegex = /const scorePayload = {[\s\S]*?setShowResults\(true\);\s*}/;

const submitReplacement = `try {
        await saveQuizAttempt(
          user.id,
          category,
          itemSlug,
          newAttemptLog,
          finalScore
        );
        console.log("Score and attempts saved successfully via server action");
      } catch (err) {
        console.error("Score save FAILED:", err);
        alert("Could not save score");
        return;
      }

      setShowResults(true);
    }`;

content = content.replace(submitRegex, submitReplacement);

fs.writeFileSync(path, content);
console.log('Refactored page.tsx');
