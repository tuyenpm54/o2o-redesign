# Product Requirements Document (PRD): Scenario-Based UX & Smart Ordering Experience

**Status**: Draft
**Date**: 2026-01-28
**Based on**: `docs/insight_kich_ban_ban_hang.md`
**Role**: Product Manager & UX Lead

## 1. Executive Summary
This PRD outlines the product strategy to transform the O2O ordering webview from a static menu into a **dynamic, "consultant-like" sales assistant**. By recognizing diverse user intents (Fast Order vs. Recommendation Seeking vs. Re-ordering), we aim to increase Average Order Value (AOV) via smart upsells and improve customer satisfaction through reduced cognitive load.

**Core Value Proposition**: "An ordering interface that understands your context—whether you're in a rush, dining with a group, or lingering for a conversation."

## 2. User Scenarios & UX Solutions

### Scenario A: The "Fast Order" Customer (40-50%)
* **Context**: Peak hours, solo diners, or return customers (know what they want).
* **Goal**: Speed. Minimize clicks to checkout.
* **UX Strategy**: "Frictionless Utility"
    *   **Default View**: Vertical Grid Layout (High density).
    *   **Primary Action**: "Fast Add" buttons on card corners.
    *   **Search/Filter**: Sticky, prominent search bar with quick tags (Vegetarian, Drinks).
    *   **Cart**: Real-time floating confirmation (toast) rather than full modal interrupt.
    *   **Checkout**: "Pay Now" button is prominent and always accessible.

### Scenario B: The "Recommendation Seeker" (30-40%)
* **Context**: Groups, new customers, tourists, or indecisive diners.
* **Goal**: Discovery & Confidence. Needs validation ("Is this good?").
* **UX Strategy**: "Digital Concierge"
    *   **Onboarding**: Multi-step wizard or "Quick Filter" chips on entry (e.g., "Đi mấy người?", "Ăn cay không?").
    *   **Smart Sections**:
        *   "Món bán chạy hôm nay" (Social Proof).
        *   "Combo nhóm 4 người" (Solution bundling).
        *   "Món nhậu lai rai" (Contextual).
    *   **Visuals**: Larger images, badges ("Bếp trưởng khuyên dùng", "Top 1 Trending").
    *   **Interaction**: "Suggest for me" button in the FAB menu.

### Scenario C: The "Long-Stay" Diner (Re-ordering Model)
* **Context**: Coffee shops, Hotpot/BBQ, Pubs. Customer sits for hours.
* **Goal**: Convenience & Upsell.
* **UX Strategy**: "Proactive Assistant"
    *   **Post-Order View**: After the first round, the UI changes.
    *   **Smart Upsell**:
        *   *If Hotpot ordered* -> Suggest "Thêm nấm/thịt".
        *   *If Beer ordered* -> Suggest "Món nhậu khô/Đậu phộng".
    *   **Re-order FAB**: A dedicated floating button "Gọi thêm món" that pulses gently after 20 mins.
    *   **Bill Splitting**: Easy "Split Bill" tools in the payment view.

## 3. Product Features & Functional Requirements

### 3.1 Smart Welcome Board (The "Hook")
*   **Requirement**: Replace generic banner with a Contextual Greeting.
*   **Logic**:
    *   *Morning (7-10am)*: "Chào ngày mới! Bún bò hay Phở nóng hổi đây ạ?"
    *   *Lunch (11-2pm)*: "Trưa nay ăn gì cho chắc bụng?"
    *   *Empty State*: "Chào anh/chị! Quán hôm nay có [Dish Name] ngon lắm."
*   **UX**: Typography should be friendly (Round sans-serif), conversational.

### 3.2 Contextual Menu Organization
*   **Requirement**: Dynamic sorting based on intent.
*   **Prioritization Logic (Miller's Law)**:
    *   Limit initial "Top Suggestions" to 6-8 items max to prevent choice paralysis.
    *   Group items logically: "Khai vị" -> "Món chính" -> "Tinh bột" -> "Tráng miệng".

### 3.3 The "Digital Consultant" Interaction
*   **Feature**: "Gợi ý cho tôi" (Wizard Mode).
*   **Flow**:
    1.  User clicks "Cần gợi ý?" icon.
    2.  System asks: "Bạn đi mấy người?" (1, 2, 4, 6+).
    3.  System asks: "Khẩu vị hôm nay?" (Thanh đạm, Đậm đà, Ăn nhậu).
    4.  Result: Shows 1 curated Combo or a set of 3 dishes.
*   **Tone of Voice**: Friendly, empathetic (e.g., "Tuyệt vời, Set này siêu hợp cho nhóm mình!").

### 3.4 Smart Cross-selling (Upsell Engine)
*   **Trigger**: When user adds item X to cart.
*   **Action**: Show "Thường được gọi cùng" (Frequently bought together).
*   **Rule Engine**:
    *   *Category Pairing*: Main Dish -> Suggest Drink.
    *   *Flavor Pairing*: Spicy Dish -> Suggest Sweet/Iced Drink.

## 4. UI/UX Specifications (Design directives)

| Component | Fast Order Mode | Consultant Mode |
| :--- | :--- | :--- |
| **Grid Layout** | Dense (2-column), small image, clear price. | Airy (1.5 column or large cards), rich description. |
| **Call to Action** | "Thêm" (+), "Thanh toán". | "Xem chi tiết", "Gợi ý", "Dùng thử". |
| **Navigation** | Sticky Categories bar. | Story-like scroll, discovery sections. |
| **Feedback** | Toast notification (top/bottom). | Interactive dialogue bubble ("Đã thêm món ngon!"). |

## 5. Implementation Phases (MVP Roadmap)

*   **Phase 1 (Foundation)**:
    *   Implement Vertical Grid (2-column) for Main Menu.
    *   Implement "Smart Context Banner" (Time-based greeting).
    *   Group "Fast Order" categories at the top.

*   **Phase 2 (Intelligence)**:
    *   Add "Best Seller" dynamic sorting.
    *   Implement "Suggest for me" simple filter (Spicy/Non-spicy).
    *   Upsell modal "Ordering Drink with this?".

*   **Phase 3 (Full Experience)**:
    *   Personalized History ("Order again?").
    *   Bill Splitting & Complex Re-order flows.

## 6. Success Metrics (KPIs)
*   **Conversion Rate**: % of sessions resulting in an order.
*   **AOV (Average Order Value)**: Increase in upsell item attach rate.
*   **Time to Order**: Reduction in time for "Fast Order" paths.
*   **Engagement**: % of users clicking "Suggestions" or "Top Bestsellers".
