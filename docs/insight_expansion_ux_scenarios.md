# Deep Dive Analysis & Advanced Insights: O2O UX Scenarios

**Status**: Proposal / Brainstorming Output
**Date**: 2026-01-28
**Reference**: `docs/prd_ux_scenarios.md`
**Objective**: Expand on the foundational PRD with behavioral economics, advanced personalization, and operational efficiency levers.

## 1. Behavioral Economics & Psychological Triggers
*Leveraging cognitive biases to improve user experience and AOV.*

### 1.1 The "Anchoring" Effect in Combo Display
*   **Insight**: Users struggle to value a "Combo" unless they see the "Anchor" (individual prices).
*   **Implementation**:
    *   Do not just show "Combo 199k".
    *   **Display**: "Combo 199k (~~250k~~ if ordered separately)".
    *   **Visual**: Place the "Premium/Expensive" option first in the list to make the standard options seem reasonably priced.

### 1.2 Reducing "Choice Overload" (Hick’s Law)
*   **Insight**: Too many options lead to "Analysis Paralysis" and lower conversion.
*   **Implementation**:
    *   **The "Best for You" Badge**: Algorithmic highlighting of ONE recommended item per category based on time of day/popularity.
    *   **Collapse Variations**: Don't list "Coke", "Diet Coke", "Sprite" as top-level items. List "Soft Drinks" and let users select flavor inside.

### 1.3 The "Endowment Effect" (Customization)
*   **Insight**: Users value products more when they put effort into creating them.
*   **Implementation**:
    *   **Interactive Hotpot Builder**: Instead of just ticking boxes, use a visual builder where users "drag" ingredients into the pot.
    *   **Language**: "Build **your** perfect bowl" instead of "Select ingredients".

## 2. Advanced User Scenarios (Edge Cases & Niche Contexts)

### 2.1 The "Power Business Lunch" (Monday - Friday Noon)
*   **Psyche**: Stressed, time-poor, needs receipts, needs to impress clients but stay on budget.
*   **Feature**:
    *   **"Express Business Set"**: Guaranteed served in 15 mins.
    *   **"Discreet Bill"**: Option to pay silently via phone without a physical bill coming to the table.
    *   **VAT Invoice Automation**: One-tap input for company tax info during checkout.

### 2.2 The "Shared Cart" (Group Coordination)
*   **Problem**: Phone passing is annoying. One person shouting orders is chaotic.
*   **Solution**: **"Party Mode" (QR Sync)**.
    *   Allow multiple phones to scan the SAME table QR code.
    *   **Real-time Sync**: User A adds beer -> User B sees beer appear in cart.
    *   **"Who ordered what?"**: Avatar bubbles next to items (e.g., "Tuyen added Beef").
    *   **Master Lock**: Only the "Host" can hit "Place Order" to prevent double ordering.

### 2.3 The "Date Night" (Premium/Evening)
*   **Psyche**: Wants atmosphere, privacy, high quality.
*   **Feature**:
    *   **"Sommelier Mode"**: If a steak is ordered, suggest wine pairings with tasting notes, not just "Red Wine".
    *   **Ambient UI**: Dark mode activates automatically after 6 PM.

## 3. Operational Efficiency Levers (Backend-Driven UX)

### 3.1 "Kitchen Load" Dynamic Sorting
*   **Scenario**: Kitchen is overwhelmed with "Grilled" items (20 min wait), but the "Fryer" station is empty.
*   **Strategy**:
    *   **Algorithm**: Detect `Kitchen_Load > 80%`.
    *   **Action**: Demote "Grilled Ribs" to position #10. Promote "Fried Chicken" to position #1.
    *   **Copy**: Label easier items as "Served Fast (5 mins)" to nudge hungry users.

### 3.2 Inventory Clearing
*   **Scenario**: Surplus "Avocados" that will spoil tomorrow.
*   **Strategy**:
    *   **Flash Discount**: "Add Avocado Smoothie for only 15k? (Limited stock)".
    *   **Bundle**: "Free Avocado Salad upgrade with any Steak".

## 4. Micro-Interactions & "Delight" Factors

*   **Haptic Feedback**: Subtle vibration when tapping "Add to Cart" confirms action without looking.
*   **Sensory Visuals**:
    *   Steam rising animation on "Hot Soup" photos.
    *   Condensation droplets on "Iced Beer" photos.
*   **Conversational Feedback**:
    *   *Standard*: "Added to cart."
    *   *Delight*: "Great choice! That's our Chef's favorite." (Randomized responses).

## 5. Gamification (Retention Loop)

*   **The "Foodie Passport"**:
    *   "You've tried 4/10 Special Dishes. Try 'Bun Cha' to unlock 'Foodie Expert' badge & 10% voucher."
*   **Live Order Tracker**:
    *   Instead of text "Cooking", show a pixel-art Chef chopping vegetables.
    *   Reduces perceived wait time by providing entertainment.

## 6. Implementation Strategy for "Brainstormed" Features

| Feature | Complexity | Impact | Priority |
| :--- | :--- | :--- | :--- |
| **Anchoring Pricing** | Low | High | **Immediate** |
| **Express Business Set** | Low (Menu config) | Med | **Phase 1** |
| **Shared Cart (Party Mode)** | High (Websocket) | High (Viral) | **Phase 3** |
| **Kitchen Load Sorting** | High (Backend) | High (Ops) | **Phase 3** |
| **Visual Delight (Steam/Ice)** | Med (Asset work) | Med (Brand) | **Phase 2** |
