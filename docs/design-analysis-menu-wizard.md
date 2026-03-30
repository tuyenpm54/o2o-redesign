# Design Analysis: Menu Wizard (Onboarding & Suggestion Views)

## Phase 1: Context & Content Priority

### Context Analysis
- **Page Type:** Onboarding Wizard (First touchpoint after QR scan)
- **Device Environment:** Mobile touch, in-restaurant dining (hungry, low patience, wants quick gratification)
- **User Role:** Diner (Guest or logged-in)
- **Primary Intent:** Find what to eat quickly without feeling like they are filling out a survey.

### Current Problem
- **Cognitive Overload (Screen 1):** The user is hit with 3 distinct questions immediately (Occasion, Dietary Restrictions, Cravings) along with 13 different clickable options. The text is too verbose ("Xin chào, chúc bạn ngon miệng! Hôm nay bạn đến để dịp gì? Chúng tôi sẽ gợi ý..."). It feels like an interrogation rather than a welcoming experience.
- **Vertical Bloat (Screen 2):** The active filters ("Dựa trên yêu cầu") take up too much premium vertical real estate. The bottom navigation bar feels disjointed from the actual content.

### Content Strategy (What matters most?)

**Screen 1 (Initial Onboarding):**
1. **Critical:** The Occasion / Group Size (This is the primary driver for recommendations).
2. **Important:** Dietary restrictions (Allergies are safety-critical).
3. **Supportive:** Cravings (Optional).
*Strategy:* Progressive Disclosure or extreme simplification. Don't ask everything at once. Keep the tone conversational but extremely concise.

**Screen 2 (Suggestions View):**
1. **Critical:** The Food Images and Prices (Appetite appeal).
2. **Important:** Why it was recommended (e.g., "Hợp với Nhóm 2 người").
3. **Supportive:** The active filter summary (should be collapsible or minimal).

---

## Phase 2: Visual Architecture & Strategy

### 1. Screen 1 Redesign (The Survey → The Concierge)
**Goal:** Reduce reading time from 10 seconds to 2 seconds.

*   **Header Simplification:**
    *   *Old:* "Xin chào, chúc bạn ngon miệng! / Hôm nay bạn đến để dịp gì? / Chúng tôi sẽ gợi ý món phù hợp nhất cho bạn"
    *   *New:* "Chào bạn 👋 / Bắt đầu chọn món nhé!" (Let the options speak for themselves).
*   **Bento/Grid Layout for Primary Choices:**
    *   Currently, they are stacked. We can make them larger, tap-friendly squares (2x2 grid) with icons to reduce reading (e.g., 👩‍❤️‍👨 Hẹn hò, 👨‍👩‍👧 Gia đình).
*   **Collapsible Secondary Filters (Progressive Disclosure):**
    *   Hide "Lưu ý dị ứng" and "Thèm gì" behind an accordion or an "Tùy chỉnh thêm" (Customize) button, or combine them into a tighter horizontal scrolling chips row below the main grid.
    *   *Alternatively*, split it into Step 1 (Group) -> Auto advance -> Step 2 (Quick Tags) -> Done. Let's use **Progressive Disclosure (Separate distinct views)** or **Horizontal Chips** so they don't look like a giant wall of text.

### 2. Screen 2 Redesign (The Menu Hub)
**Goal:** Maximize food visibility.

*   **Header Condensation:**
    *   Merge the "Gợi ý thông minh" title and the "Dựa trên yêu cầu" tags into a single, sleek sticky header. Instead of a large dark block, use an inline horizontal scroll of the active tags (e.g., `[Nhóm 2 ✕] [Không hành ✕] [+ Thêm]`).
*   **Card Enhancements:**
    *   Make the "Tuyệt phẩm" and Match Score tags feel more organic, perhaps as floating badges over the image rather than stacking text.
*   **Bottom Bar:**
    *   Integrate the Cart and Next Step directly into a floating glassmorphic pill at the very bottom, keeping it highly accessible to the thumb.

---

### Proposed Execution Plan
1. **Refactor `MenuWizard.tsx` (Step 0):**
    *   Rewrite the header copy to be ultra-short.
    *   Convert the 4-Group selection into a 2x2 grid with icons.
    *   Convert the "Lưu ý" and "Thèm gì" sections into a single horizontal scrollable "Quick Tags" section: `Nhãn: [Không cay] [Đồ chay] [Nướng] ...` rather than rigid categories.
2. **Refactor `MenuWizard.tsx` (Step 1+):**
    *   Collapse the `noteMainContent` (Dựa trên yêu cầu) into a single-line horizontal scroll.
    *   Elevate the food images.
