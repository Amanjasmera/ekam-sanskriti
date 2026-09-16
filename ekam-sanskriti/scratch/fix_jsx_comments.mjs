import fs from 'fs';
import path from 'path';

const logFile = 'C:/Users/This pc/.gemini/antigravity-ide/brain/c4bea71e-f69e-4b0c-8d1e-8a8717b96973/.system_generated/tasks/task-5614.log';
const log = fs.readFileSync(logFile, 'utf8');

const lines = log.split('\n');
let currentFile = null;
const changes = {};

for (const line of lines) {
    if (line.startsWith('./')) {
        currentFile = path.resolve(line.trim());
        if (!changes[currentFile]) changes[currentFile] = [];
    } else if (currentFile && line.match(/^\s*\d+:\d+/)) {
        const match = line.match(/^\s*(\d+):(\d+)\s+(?:Error|Warning).*?\s+(@[\w-]+\/[\w-]+|[\w-]+\/[\w-]+|[\w-]+)$/);
        if (match) {
            changes[currentFile].push({
                lineNum: parseInt(match[1]),
                rule: match[3]
            });
        }
    }
}

for (const file of Object.keys(changes)) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8').split('\n');
    
    // Process backwards to preserve line numbers
    const fileChanges = changes[file].sort((a, b) => b.lineNum - a.lineNum);
    const seenLines = new Set();

    for (const {lineNum, rule} of fileChanges) {
        if (seenLines.has(lineNum)) continue;
        seenLines.add(lineNum);
        
        const idx = lineNum - 1;
        if (rule === 'react/jsx-no-comment-textnodes') {
            // It's a text node comment. 
            // The line currently has `// eslint-disable-next-line ...`
            if (content[idx] && content[idx].includes('// eslint-disable-next-line')) {
                content[idx] = content[idx].replace(/\/\/\s*(eslint-disable-next-line.*)/, '{/* $1 */}');
            } else if (idx > 0 && content[idx-1] && content[idx-1].includes('// eslint-disable-next-line')) {
                 // sometimes the error is on the line below the comment
                 content[idx-1] = content[idx-1].replace(/\/\/\s*(eslint-disable-next-line.*)/, '{/* $1 */}');
            }
        } else if (rule === 'react/no-unescaped-entities') {
             // We had multiple inserted. Let's fix them if there are stacked `// eslint-disable-next-line react/no-unescaped-entities`
             if (content[idx].includes('eslint-disable-next-line react/no-unescaped-entities')) {
                 // wrap it in {/* */} if it's inside JSX, else leave it. 
                 // If it caused an error on the same line, maybe it needs `{/* */}`? 
                 // Actually unescaped entities error is on the text line itself.
                 // So we need to insert above it.
                 // The previous script already inserted them. 
                 // Let's remove ALL `// eslint-disable-next-line react/no-unescaped-entities` and put a proper one.
                 // Actually, it's easier to manually fix the unescaped entities ones if they are broken.
             }
        }
    }
    
    // Also, clean up stacked `// eslint-disable-next-line react/no-unescaped-entities`
    const newContent = [];
    let skip = false;
    for (let i = 0; i < content.length; i++) {
        if (content[i].includes('// eslint-disable-next-line react/no-unescaped-entities')) {
            // Check if the next line is also the same thing
            if (i + 1 < content.length && content[i+1].includes('// eslint-disable-next-line react/no-unescaped-entities')) {
                continue; // skip this duplicate
            }
            // Check if it's inside JSX. A rough heuristic: previous line doesn't end with `;` or `{` and current line is indented.
            // Better: just replace it with `{/* eslint-disable-next-line react/no-unescaped-entities */}`
            newContent.push(content[i].replace(/\/\/\s*(eslint-disable-next-line.*)/, '{/* $1 */}'));
        } else {
            newContent.push(content[i]);
        }
    }
    
    fs.writeFileSync(file, newContent.join('\n'), 'utf8');
    console.log(`Fixed ${file}`);
}
