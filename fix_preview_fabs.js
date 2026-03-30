const fs = require('fs');

const files = [
    'src/app/customer/page.tsx',
    'src/app/customer/preview/page.tsx',
    'src/app/mall/page.tsx',
    'src/app/mall/preview/page.tsx',
    'src/app/single-order-page/page.tsx',
    'src/modules/customer/components/Onboarding/OnboardingGuide.tsx'
];

let changedCount = 0;
for (const f of files) {
    if(!fs.existsSync(f)) continue;
    let text = fs.readFileSync(f, 'utf8');
    let original = text;
    
    if (text.includes('import {') && text.includes('lucide-react') && !text.includes('BellRing')) {
        text = text.replace(/import \{([^}]+)\}\s+from ("|')lucide-react("|');/, "import { $1, BellRing } from 'lucide-react';");
    }
    
    // replace the Staff Avatar with BellRing
    text = text.replace(/<div className=\{styles\.staffIconWrapper\}>[\s\S]*?<div className=\{styles\.onlineBadge\}\s*\/>\s*<\/div>/g, '<BellRing size={22} className={styles.staffIcon} />');
    text = text.replace(/<div className=\{styles\.staffIconWrapper\}>[\s\S]*?<img[\s\S]*?seed=Staff[\s\S]*?\/>\s*<\/div>/g, '<BellRing size={22} className={styles.staffIcon} />');

    if (text !== original) {
        fs.writeFileSync(f, text);
        changedCount++;
        console.log("Updated", f);
    }
}
console.log("Replaced avatars with BellRing in", changedCount, "files");
