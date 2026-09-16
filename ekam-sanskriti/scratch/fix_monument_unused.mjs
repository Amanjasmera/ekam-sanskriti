import fs from 'fs';

const filePath = 'app/(main)/monument/[id]/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace any in `item: any`
content = content.replace(/item: any/g, 'item: {slug: string, name?: string, image?: string, date?: string}');

// Remove unused imports/vars
content = content.replace(/import {([^}]*)Clock, Maximize, Globe, ShieldCheck, Ticket([^}]*)} from 'lucide-react'/, "import {$1$2} from 'lucide-react'");
content = content.replace(/, useRef /g, ' ');
content = content.replace(/const \[isMuted, setIsMuted\] = useState\(false\)/, '');
content = content.replace(/} catch \(err\) {/g, '} catch {');
content = content.replace(/} catch\(e\) {/g, '} catch {');
content = content.replace(/console\.log\(err\)/g, ''); // just in case

// Fix missing dependency in useEffect
// line 100: missing 'supabase'
content = content.replace(/}, \[langCode, monument\]\)/, '}, [langCode, monument, supabase])');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed monument page unused vars');
