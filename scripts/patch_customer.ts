import fs from 'fs';
let content = fs.readFileSync('src/app/customer/page.tsx', 'utf-8');

// Add import
if (!content.includes('SmartSuggestionCarousel')) {
   content = content.replace("import { PromotionStrip } from '@/modules/customer/components/PromotionStrip/PromotionStrip';", "import { PromotionStrip } from '@/modules/customer/components/PromotionStrip/PromotionStrip';\nimport { SmartSuggestionCarousel } from '@/modules/customer/components/SmartSuggestionCarousel/SmartSuggestionCarousel';");
}
fs.writeFileSync('src/app/customer/page.tsx', content);
