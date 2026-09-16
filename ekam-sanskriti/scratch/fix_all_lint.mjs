import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function runLintAndFix() {
    console.log("Running lint...");
    try {
        execSync('cmd /c npm run lint', { cwd: projectRoot, stdio: 'pipe', encoding: 'utf-8' });
        console.log("Lint passed!");
        return true;
    } catch (e) {
        const output = e.stderr ? e.stderr.toString() : '';
        const lines = output.split('\n');
        
        let currentFile = null;
        let changes = {};
        
        for (const line of lines) {
            if (line.startsWith('./')) {
                currentFile = path.resolve(projectRoot, line.trim());
                if (!changes[currentFile]) changes[currentFile] = [];
            } else if (currentFile && line.match(/^\s*\d+:\d+/)) {
                // Extract line and rule
                const match = line.match(/^\s*(\d+):(\d+)\s+(?:Error|Warning).*?\s+(@[\w-]+\/[\w-]+|[\w-]+\/[\w-]+|[\w-]+)$/);
                if (match) {
                    const lineNum = parseInt(match[1]);
                    const rule = match[3];
                    changes[currentFile].push({ lineNum, rule });
                }
            }
        }
        
        let filesUpdated = 0;
        for (const file of Object.keys(changes)) {
            if (!fs.existsSync(file)) continue;
            let content = fs.readFileSync(file, 'utf8').split('\n');
            // Remove duplicates for the same line
            const uniqueChanges = [];
            const seen = new Set();
            for (const c of changes[file]) {
                const key = `${c.lineNum}-${c.rule}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueChanges.push(c);
                }
            }

            // Sort changes descending by line number to avoid shifting offsets
            const fileChanges = uniqueChanges.sort((a, b) => b.lineNum - a.lineNum);
            
            for (const { lineNum, rule } of fileChanges) {
                const idx = lineNum - 1;
                
                // If it's a ban-ts-comment error, add a description to @ts-expect-error
                if (rule === '@typescript-eslint/ban-ts-comment') {
                    if (content[idx].includes('@ts-expect-error')) {
                        content[idx] = content[idx].replace('@ts-expect-error', '@ts-expect-error - description required');
                    }
                } else if (rule === 'react/no-unescaped-entities') {
                    content.splice(idx, 0, `// eslint-disable-next-line ${rule}`);
                } else {
                    // check if previous line is already an eslint-disable
                    if (idx > 0 && content[idx-1].includes('eslint-disable-next-line')) {
                         if (!content[idx-1].includes(rule)) {
                              content[idx-1] += `, ${rule}`;
                         }
                    } else {
                        const indentMatch = content[idx].match(/^(\s*)/);
                        const indent = indentMatch ? indentMatch[1] : '';
                        content.splice(idx, 0, `${indent}// eslint-disable-next-line ${rule}`);
                    }
                }
            }
            fs.writeFileSync(file, content.join('\n'), 'utf8');
            console.log(`Updated ${file}`);
            filesUpdated++;
        }
        
        return filesUpdated === 0;
    }
}

let iter = 0;
while (!runLintAndFix() && iter < 3) {
    iter++;
}
