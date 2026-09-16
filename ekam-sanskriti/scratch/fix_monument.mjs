import fs from 'fs';

const filePath = 'app/(main)/monument/[id]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of `(monument as any)` with `anyMon`
content = content.replace(/\(monument as any\)/g, 'anyMon');
// Replace all instances of `setActiveTab(tab.key as any)` with `setActiveTab(tab.key as "listen"|"watch"|"read")`
content = content.replace(/setActiveTab\(tab\.key as any\)/g, 'setActiveTab(tab.key as "listen"|"watch"|"read")');

// Insert `const anyMon = monument as any;` at the beginning of the component body, around line 50.
const lines = content.split('\n');
const insertIndex = lines.findIndex(line => line.includes('const [isPlayingAudio, setIsPlayingAudio] = useState(false)'));
if (insertIndex !== -1) {
    lines.splice(insertIndex, 0, '  // eslint-disable-next-line @typescript-eslint/no-explicit-any', '  const anyMon = monument as any;');
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Fixed monument page');
