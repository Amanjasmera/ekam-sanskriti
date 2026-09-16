import re

def fix_monument():
    with open('app/(main)/monument/[id]/page.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove unused lucide icon
    content = re.sub(r'Ticket,\s*', '', content)
    content = content.replace("import { Ticket } from 'lucide-react'", "")
    
    with open('app/(main)/monument/[id]/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)

fix_monument()
print("Fixed Ticket unused var")
