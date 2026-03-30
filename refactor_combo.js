const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/app/menu/MenuView.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Insert Import
if (!content.includes('ComboSection')) {
  // Find where to insert
  content = content.replace(
    'import { OrderHubCard } from "./components/OrderHubCard";',
    'import { OrderHubCard } from "./components/OrderHubCard";\nimport { ComboSection } from "./components/ComboSection";'
  );
}

const startMarker = '{/* Horizontal Combo Section */}';
const targetStart = content.indexOf(startMarker);
if (targetStart !== -1) {
  // Find the exact end. The block ends with "          </section>\n        )}"
  // After it comes "{filteredCategories.filter"
  const endMarker = '{filteredCategories.filter((c: string) => c !== "Combo tiết kiệm"';
  let targetEnd = content.indexOf(endMarker, targetStart);
  
  if (targetEnd !== -1) {
    // Replace logic
    const replacement = `{/* Horizontal Combo Section */}
        <ComboSection 
          filteredCategories={filteredCategories}
          COMBOS={COMBOS}
          selectedPeopleCount={selectedPeopleCount}
          setSelectedPeopleCount={setSelectedPeopleCount}
          setSelectedItem={setSelectedItem}
          proceedAddToCart={proceedAddToCart}
          theme={theme}
          t={t}
          categoryRefs={categoryRefs}
        />\n\n        `;
        
    content = content.substring(0, targetStart) + replacement + content.substring(targetEnd);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log("Combo refactor applied successfully!");
  } else {
    console.log("Failed to find end marker");
  }
} else {
  console.log("Failed to find start marker");
}
