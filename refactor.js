const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'src/app/menu/MenuView.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Insert Import
if (!content.includes('OrderHubCard')) {
  content = content.replace(
    'import { OrderStepper } from "@/modules/customer/components/OrderStepper/OrderStepper";',
    'import { OrderStepper } from "@/modules/customer/components/OrderStepper/OrderStepper";\nimport { OrderHubCard } from "./components/OrderHubCard";'
  );
}

// 2. Replace the massive block
const startMarker = '{/* Table Hub Card (Dual-State, 9 Contexts) */}';
const endMarker = '          );\n        })()}';

const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
  // Find the exact end of the block
  // The block ends around line 1366 with "})()}"
  const exactEndMarkerStr = '        })()}';
  const endIndex = content.indexOf(exactEndMarkerStr, startIndex) + exactEndMarkerStr.length;

  if (endIndex > startIndex) {
    const replacement = `{/* Table Hub Card */}
        <OrderHubCard
          tableMembers={tableMembers}
          user={user}
          resid={resid}
          tableid={tableid}
          pathname={pathname}
          searchParams={searchParams}
          activeOrders={activeOrders}
          cartItems={cartItems}
          t={t}
          activeRoundIndex={activeRoundIndex}
          setActiveRoundIndex={setActiveRoundIndex}
          setIsCartDrawerOpen={setIsCartDrawerOpen}
          setIsStaffModalOpen={setIsStaffModalOpen}
          OrderStepper={OrderStepper}
          greeting={greeting}
        />`;
    
    content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync(targetFile, content, 'utf8');
    console.log("Refactoring applied successfully!");
  } else {
    console.log("Error: End index not found or invalid.");
  }
} else {
  console.log("Error: Start marker not found.");
}
