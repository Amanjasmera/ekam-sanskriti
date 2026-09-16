import fs from 'fs';

const filePath = 'app/(main)/quiz/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace any in map
content = content.replace(/getOptions\(\)\.map\(\(item: any\)/g, 'getOptions().map((item: {slug: string, name: string})');
// Replace any in `item: any` on line 46
content = content.replace(/const options = Object\.values\(quizData\)\.map\(\(item: any\)/g, 'const options = Object.values(quizData).map((item: {slug: string, name: string})');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed quiz page');
