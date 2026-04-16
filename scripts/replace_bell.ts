import fs from 'fs';

function replaceInFile(filePath: string) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Auto import
    if (!content.includes('ServiceBellIcon')) {
        // Find last import
        const match = content.match(/import .* from ['"].*['"];\n?/g);
        if (match) {
            const lastImportPos = content.indexOf(match[match.length - 1]) + match[match.length - 1].length;
            content = content.substring(0, lastImportPos) + "import { ServiceBellIcon } from '@/components/Icons/ServiceBellIcon';\n" + content.substring(lastImportPos);
        } else {
             content = "import { ServiceBellIcon } from '@/components/Icons/ServiceBellIcon';\n" + content;
        }
    }
    
    // Replace component uses
    content = content.replace(/<BellRing/g, '<ServiceBellIcon');
    
    fs.writeFileSync(filePath, content);
}

replaceInFile('src/app/menu/MenuView.tsx');
replaceInFile('src/app/menu/components/SupportModal.tsx');
replaceInFile('src/app/mall/page.tsx');
replaceInFile('src/app/mall/preview/page.tsx');
replaceInFile('src/app/single-order-page/page.tsx');
replaceInFile('src/modules/customer/components/Onboarding/OnboardingGuide.tsx');

console.log('Replaced BellRing with ServiceBellIcon successfully!');
