# Design Analysis: Menu Header Account Section

## Phase 1: Context Detection & Priority Analysis

### 1. Detect Context
- **Page type**: Menu View / Ordering Interface (`MenuView.tsx`).
- **Device**: Mobile-first Web App.
- **User role**: End User (Diner).
- **Data state**: Populated (User logged in with Name and Avatar).
- **User intent**: Navigating the menu to order food. The account section serves as a secondary gateway to profile, vouchers, and invoice history.
- **Runtime context**: At a restaurant table looking at a digital menu.

### 2. Content Inventory & Priority Classification
Inventory of the Menu Header:
1. **Restaurant Name & Table Info**: 🔴 **Critical** (Anchors user to their physical context).
2. **Language Toggle & Search/Categories**: 🟡 **Important** (Core utility for the primary intent: ordering).
3. **Account Identity (Name + Avatar)**: 🔵 **Supportive** (Confirms logged-in state, but is not the primary focus).

### 3. Design Philosophy Justification
Currently, the raw text "Tuyến Phạm" floated next to the avatar appears unanchored and competes visually.
Based on **Visual Hierarchy** and **Cognitive Load Theory**:
- **Supportive** elements should not float aimlessly. They should be grouped to form a single semantic block (e.g., a "Profile Badge").
- The name text must be constrained (truncation) to respect the limited horizontal space on mobile devices, ensuring it doesn't break layout or push Critical elements out of view.
- Contrast should be lowered intentionally (using neutral-dark shades and smaller typography) so the eye flows naturally to the Menu/Categories rather than getting stuck on the user's own name.

## Phase 2: Proposed Visual Design Strategy

To fix the "tệ quá" (poor appearance) and make it "đúng chuẩn thiết kế" (standardized):

1. **Layout Strategy**: 
   - Group the Name and Avatar into a single interactive **Pill/Badge**.
   - Use a subtle surface color (e.g., `#F1F5F9` in light mode, `#1E293B` in dark mode) with rounded corners (`rounded-full`) to enclose both the text and the avatar.
   
2. **Typography & Truncation**:
   - Limit the text width (e.g., `max-width: 80px` or `100px`) and apply `text-overflow: ellipsis`, `white-space: nowrap`, and `overflow: hidden`.
   - Font size: `0.85rem` (13px/14px), Weight: `600` (Semi-bold), Color: Neutral-Dark (`#475569` or theme text).

3. **Alignment**:
   - Strictly center-align (`align-items: center`) both elements vertically on the flex-axis.
   - The avatar sits on the right, the name sits on the left of the badge.

### Summary of Change
Transforming the currently disjointed text + icon into a cohesive, clickable **Profile Badge Pill**.

---

> ⛔ **User Review Required**: Do you approve this strategy? Should I proceed with implementing this redesigned "Profile Badge" (with truncation) into `MenuHeader.tsx` and `page.module.css`?
