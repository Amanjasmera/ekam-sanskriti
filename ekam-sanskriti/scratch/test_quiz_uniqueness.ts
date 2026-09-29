import { getQuizQuestions } from '../lib/quiz';

async function main() {
  const r1 = await getQuizQuestions('test-user-123', 'monuments', 'taj-mahal', 5);
  console.log("Run 1:");
  console.log(r1.questions.map(q => q.id));

  const r2 = await getQuizQuestions('test-user-123', 'monuments', 'taj-mahal', 5);
  console.log("\nRun 2:");
  console.log(r2.questions.map(q => q.id));
}

main();
