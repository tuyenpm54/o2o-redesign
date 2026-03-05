# PRD: Smart Context Banner Redesign

## 1. Overview
Redesign the current static/simple order status banner into a dynamic **Smart Context Banner** that guides the user through the entire dining journey, from sitting down to finishing the meal.

## 2. Dynamic States & Messaging Strategy

| State | Condition | Messaging (Vietnamese) | Visual Cue (Icon/Color) |
|-------|-----------|-------------------------|-------------------------|
| **Initial / Empty** | No orders placed | "Vui lòng ngồi tại bàn và gọi món, nhân viên sẽ mang đồ ra cho bạn" | Bell Icon / Soft Gray/Blue |
| **Request Sent** | Orders submitted, waiting for staff | "Yêu cầu đã được gửi, đợi chút để nhân viên xác nhận nhé" | Clock Icon / Orange Pulsing |
| **Confirmed** | Staff confirmed order | "Nhân viên đã xác nhận và chuyển yêu cầu tới bếp" | Check Circle / Soft Green |
| **Processing** | Kitchen is cooking | "Bếp đang chuẩn bị đồ cho bạn" | Chef Hat / Blue Animated |
| **Ready for Service**| Food prepared, waiting to serve | "Đồ của bạn đã xong rồi, đợi chút nhân viên sẽ mang ra bàn cho bạn nhé" | Sparkles / Gold Highlight |
| **Served** | All items served | "Đồ của bạn đã được phục vụ. Chúc bạn ngon miệng!" | Heart or Fork/Knife / Green Solid |

## 3. UI/UX Requirements
- **Prominence**: Must be clearly visible but not intrusive. Position at the top of the menu area.
- **Glassmorphism**: Use a premium, sleek design with subtle blurs and gradients.
- **Micro-animations**: Transition between states should be smooth (fade/slide).
- **Interactivity**: Clicking the card should reveal the "Order Details" or "Order History".
- **Progressive Disclosure**: Only show the most relevant action/info.

## 4. Design Intelligence (UI/UX Pro Max)
- **Style**: Modern, clean, professional but friendly.
- **Typography**: Clear hierarchy (Bold for main status if applicable, Medium for guide text).
- **Color Palette**:
  - Primary: #F97316 (Orange for alerts/pending)
  - Success: #10B981 (Green for confirmed/ready)
  - Info: #3B82F6 (Blue for processing)
  - Muted: #64748B (Gray for initial)

## 6. Handling Mixed Order States (Brainstorming)

When multiple orders exist in different states, the banner should be "smarter" than just picking one.

### 6.1 Priority Matrix (Urgency-based)
1. **Critical Progress**: `READY` (Food is sitting there!)
2. **Action Required**: `PENDING` (User just ordered, needs to know it's sent)
3. **Background Progress**: `COOKING` / `CONFIRMED`
4. **Finality**: `SERVED`

### 6.2 Smart Messaging Templates
- **New + Processing**: "Đã gửi yêu cầu mới & 3 món khác đang chuẩn bị..."
- **Ready + Processing**: "Món mới đã sẵn sàng! (Các món còn lại vẫn đang nấu)"
- **Multiple Pending**: "Đang chờ nhà hàng xác nhận 2 lượt gọi món của bạn"

### 6.3 Visual Enhancement Ideas
- **Status Badge**: If multiple statuses exist, show a small numeric badge next to the icon.
- **Progress Line**: A thin, multi-colored line at the bottom of the card representing the distribution of order states (e.g., 20% served, 50% cooking, 30% pending).
- **Auto-Cycling**: Gradually fade between messages if more than 2 distinct active states exist.
## 5. Technical Implementation
- Integrate with `supportStatuses` and `RECENT_ORDERS` logic in `page.tsx`.
- Add a new `ContextBanner` component or enhance the existing banner div.
- Implement smooth state transitions using CSS animations.
