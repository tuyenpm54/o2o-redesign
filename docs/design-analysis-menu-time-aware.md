# 🕐 Design Analysis: Menu Page — Time-of-Day Adaptive UI

## 📋 Screen Overview

- **Screen name**: Menu Page — Mobile-first (responsive)
- **Date**: 2026-03-21
- **Target user**: Khách hàng quét QR tại bàn nhà hàng
- **Primary intent**: Chọn món và đặt hàng nhanh, trong ngữ cảnh thời gian khác nhau (sáng / trưa / chiều / tối)
- **Target device**: Mobile (primary), Tablet, Desktop (responsive)

### Context Vectors Summary

| Vector | Value | Impact |
|---|---|---|
| Page type | List/Browse (menu items) | Hiển thị grid items, filter, scroll ngang/dọc |
| Device | Mobile-first | Single column, bottom-heavy CTA, touch targets ≥ 44px |
| User role | End User (khách hàng) | UI đơn giản, focus vào chọn món, không cần admin features |
| Data state | Cả 5: loading, empty, error, degraded, populated | Loading skeleton, error retry, degraded khi bếp bận |
| Intent | Browse → Add to cart → Place order | Scan nhanh → chọn món → xác nhận |
| Flow stage | First visit + Returning user | Wizard cho first visit, personalized picks cho returning |
| Runtime context | **Time of day** = Core focus: Sáng / Trưa / Chiều / Tối | Thay đổi atmosphere, greeting, category order, visual style |

---

## 🕐 Time Period Definitions

| Khoảng | Giờ | Tên tiếng Việt | Personality |
|---|---|---|---|
| 🌅 Morning | 6:00 – 10:59 | Buổi sáng | Tươi mới, nhẹ nhàng, ấm áp |
| ☀️ Noon | 11:00 – 13:59 | Buổi trưa | Năng động, nhanh, tập trung |
| 🌤️ Afternoon | 14:00 – 17:59 | Buổi chiều | Thư giãn, nhẹ nhàng, trà chiều |
| 🌙 Evening | 18:00 – 5:59 | Buổi tối | Ấm cúng, sang trọng, đêm |

> **Thay đổi so với hiện tại**: Tách từ 3 periods (morning/noon/evening) thành 4 periods, thêm **afternoon** — một ngữ cảnh quan trọng cho văn hóa ẩm thực Việt (trà chiều, snack, giải khát).

---

## 🎯 Content Priority Matrix (Áp dụng cho TẤT CẢ time periods)

### 🔴 Critical (Max 2)

| # | Thành phần | Lý do Critical | Nguyên tắc thiết kế |
|---|---|---|---|
| 1 | **Danh sách món ăn** (Menu Grid) | Không có danh sách món thì trang menu vô nghĩa. Là core content. | Visual Hierarchy — phải chiếm >50% không gian |
| 2 | **Nút Thêm vào giỏ** ( +/Quantity controls) | Hành động chính duy nhất trên mỗi menu card. | Single Primary Action + Fitts's Law — phải lớn, dễ chạm, rõ ràng |

### 🟡 Important (Max 5)

| # | Thành phần | Lý do Important | Nguyên tắc thiết kế |
|---|---|---|---|
| 1 | **Category Bar** (Bộ lọc nhóm món) | Giúp navigate nhanh trong danh sách dài. | Progressive Disclosure — hiện khi scroll |
| 2 | **Ảnh món + Giá tiền** | Hỗ trợ quyết định chọn món. Không có ảnh/giá = khó quyết định. | Visual Hierarchy — ảnh phải sắc nét, giá phải nổi bật |
| 3 | **Cart Bottom Bar** (Giỏ hàng + tổng tiền) | Feedback liên tục cho user biết đã chọn gì. | Cognitive Load — luôn nhìn thấy trạng thái giỏ hàng |
| 4 | **Header** (Tên nhà hàng + Mã bàn) | Xác nhận context — đúng nhà hàng, đúng bàn. | Context Congruency — user cần biết mình ở đâu |
| 5 | **Order Stepper** (Tiến trình gọi món) | Giúp user hiểu mình đang ở bước nào của flow. | Progressive Disclosure — guide user qua flow |

### 🔵 Supportive

| # | Thành phần | Lý do Supportive | Hiển thị như thế nào |
|---|---|---|---|
| 1 | Returning user card ("Khách quen quay lại") | Tiện lợi nhưng không bắt buộc | Compact banner, collapsible |
| 2 | "Lựa chọn dành cho bạn" (Personalized picks) | Gợi ý hay nhưng có thể scroll qua | Horizontal scroll section |
| 3 | "Siêu phẩm bán chạy" (Best sellers) | Social proof giúp quyết định | Horizontal scroll section |
| 4 | Combo section (Combo tiết kiệm) | Khuyến mãi nhưng không phải mục tiêu chính | Horizontal scroll, dưới fold |
| 5 | Tags trên menu card | Thông tin bổ sung (Bán chạy, Mới, Signature) | Nhỏ gọn, badge format |
| 6 | Member Lobby card | Biết ai đang ở bàn | Compact, clickable |

### ⚪ On-demand

| # | Thành phần | Lý do ẩn đi | Cách truy cập | Trigger action |
|---|---|---|---|---|
| 1 | Item Detail Modal | Chi tiết món chỉ cần khi user muốn xem thêm | Tap vào menu card | Bottom sheet slide up |
| 2 | Cart Drawer | Xem chi tiết giỏ hàng khi cần | Tap vào Cart Bottom Bar | Drawer slide from bottom |
| 3 | Staff Support Modal | Gọi nhân viên khi cần hỗ trợ | FAB button góc phải | Modal overlay |
| 4 | Login Modal | Đăng nhập chỉ khi muốn lưu lịch sử | Tap avatar/login button | Bottom sheet |
| 5 | Menu Wizard (Onboarding) | Chỉ hiện lần đầu ghé thăm | Tự động lần đầu, skip | Full-screen overlay |
| 6 | Search | Tìm kiếm khi menu dài | Tap icon Search trên header | Expand input |

---

## 🌈 Time-of-Day Visual Strategy

Đây là phần cốt lõi: **mỗi khung giờ sẽ có atmosphere riêng** — không chỉ đổi màu nền mà thay đổi toàn bộ visual language.

### 🌅 Morning (6:00 – 10:59) — "Bình minh ấm áp"

| Aspect | Value | Rationale |
|---|---|---|
| **Background** | Gradient warm: `#FFF7ED` → `#FEF3C7` (cream → pale gold) | Mô phỏng ánh sáng bình minh, warm tone |
| **Text primary** | `#78350F` (amber-900) | Warm brown, dễ đọc trên nền sáng ấm |
| **Text secondary** | `#92400E` (amber-800 @ 70% opacity) | Muted warm |
| **Card background** | `rgba(255, 255, 255, 0.85)` + subtle warm shadow | Sạch, sáng, nhẹ nhàng |
| **Card border** | `rgba(251, 191, 36, 0.15)` (amber tint) | Viền nhẹ, ấm |
| **Accent color** | `#F59E0B` (amber-500) | Nút CTA, category active, badge |
| **Section divider** | Subtle warm gradient line | Tách biệt nhẹ nhàng |
| **Greeting** | "Chào buổi sáng! ☀️ Bắt đầu ngày mới thật ngon nhé" | Friendly, bright |
| **Category priority** | Đồ uống → Điểm tâm → Khai vị → Món Chính | Sáng ưu tiên cafe, nước, đồ nhẹ |
| **Atmosphere** | Nhẹ nhàng, tĩnh lặng, ấm áp | Không quá flashy, morning calm |

### ☀️ Noon (11:00 – 13:59) — "Năng lượng buổi trưa"

| Aspect | Value | Rationale |
|---|---|---|
| **Background** | Clean white: `#F8FAFC` → `#FFFFFF` | Sáng, sạch, professional — bữa trưa nhanh |
| **Text primary** | `#0F172A` (slate-900) | High contrast, dễ scan nhanh |
| **Text secondary** | `#475569` (slate-600) | Standard muted |
| **Card background** | `#FFFFFF` + crisp shadow | Sắc nét, clear |
| **Card border** | `rgba(226, 232, 240, 0.8)` (slate border) | Clean, neutral |
| **Accent color** | `#EF4444` (red-500) hoặc `#DF1B41` (brand red) | Kích thích food appetite, urgency |
| **Section divider** | Clean horizontal line | Minimal |
| **Greeting** | "Bữa trưa nhanh gọn 🍜 Chọn món ngay nào!" | Energetic, direct |
| **Category priority** | Món Chính → Cơm → Combo tiết kiệm → Đồ uống | Trưa ưu tiên main course, combo văn phòng |
| **Atmosphere** | Năng động, nhanh, hiệu quả | Tối ưu cho browsing nhanh |

### 🌤️ Afternoon (14:00 – 17:59) — "Thư giãn buổi chiều"

| Aspect | Value | Rationale |
|---|---|---|
| **Background** | Soft gradient: `#FFF1F2` → `#FDF2F8` (rose → pink tint) | Mềm mại, thư giãn — vibe trà chiều |
| **Text primary** | `#1E293B` (slate-800) | Đủ contrast nhưng không quá harsh |
| **Text secondary** | `#64748B` (slate-500) | Muted, relaxed |
| **Card background** | `rgba(255, 255, 255, 0.9)` + soft pink shadow | Mềm, elegant |
| **Card border** | `rgba(244, 63, 94, 0.1)` (rose tint) | Nhẹ nhàng |
| **Accent color** | `#EC4899` (pink-500) hoặc `#F472B6` (softer) | Sweet, inviting — snack & dessert feel |
| **Section divider** | Soft rose gradient | Mềm mại |
| **Greeting** | "Nghỉ ngơi buổi chiều 🍰 Thưởng thức gì nhẹ nhàng nào" | Relaxed, sweet |
| **Category priority** | Tráng miệng → Đồ uống → Khai vị → Thức ăn nhanh | Chiều ưu tiên dessert, trà, snack |
| **Atmosphere** | Elegant, mềm mại, chill | Pastel tones, relaxed vibe |

### 🌙 Evening (18:00 – 5:59) — "Đêm vàng sang trọng"

| Aspect | Value | Rationale |
|---|---|---|
| **Background** | Deep gradient: `#0F172A` → `#020617` (slate-900 → slate-950) | Dark mode tự nhiên, sang trọng |
| **Text primary** | `#F1F5F9` (slate-100) | High contrast trên dark bg |
| **Text secondary** | `#94A3B8` (slate-400) | Muted light |
| **Card background** | `rgba(30, 41, 59, 0.8)` + subtle glow border | Glassmorphism nhẹ, premium feel |
| **Card border** | `rgba(251, 191, 36, 0.15)` (gold shimmer) | Vàng kim sang trọng |
| **Accent color** | `#FBBF24` (amber-400) golden | Vàng sang trọng, kích thích cảm giác premium |
| **Section divider** | Gold gradient line | Premium, elegant |
| **Greeting** | "Tối nay ăn gì? 🌙 Khám phá thực đơn thượng hạng" | Premium, inviting |
| **Category priority** | Lẩu & Nướng → Món Chính → Thức ăn kèm → Bia Tươi | Tối ưu tiên main dinner, nhậu |
| **Atmosphere** | Sang trọng, ấm cúng, premium | Dark + gold accents, candle-light feel |

---

## 🧠 Design Philosophy Justification

### Tại sao cần 4 periodo thay vì 3?
> **Context Congruency**: Buổi chiều (14:00-17:59) là một ngữ cảnh ẩm thực hoàn toàn khác biệt trong văn hóa Việt Nam — trà chiều, bánh ngọt, giải khát. Gộp chung với buổi trưa (hiện tại 11:00-17:00) là sai ngữ cảnh. User 2 giờ chiều không muốn thấy "Bữa trưa nhanh gọn" — họ muốn "Nghỉ ngơi, thưởng thức".

### Tại sao thay đổi card style theo thời gian?
> **Visual Hierarchy + Context Congruency**: Card background, border, shadow tạo nên "atmosphere" — cảm giác tổng thể khi dùng app. Buổi sáng warm & soft → user cảm thấy thoải mái. Buổi tối dark & gold → user cảm thấy premium, sẵn sàng chi nhiều hơn. Giữ nguyên card style (white card on all backgrounds) sẽ phá vỡ atmosphere.

### Tại sao thay đổi greeting?
> **Context Congruency + Progressive Disclosure**: Greeting là điểm chạm đầu tiên. Nó set expectation cho toàn bộ trải nghiệm. "Chào buổi sáng" vs "Tối nay ăn gì?" tạo mindset khác nhau, dẫn đến behavior khác nhau (browse nhẹ vs explore sâu).

### Tại sao category order thay đổi?
> **Progressive Disclosure**: Đưa category phù hợp nhất lên đầu giảm cognitive load. User sáng sớm không cần scroll qua 5 category Lẩu & Nướng để tìm Đồ uống. Theo nguyên tắc context-detection: "Promote relevant items, don't hide others."

---

## 📐 On-demand Strategy

| Thành phần | Pattern | Mô tả UX |
|---|---|---|
| Item Detail Modal | Bottom sheet | Tap card → sheet trượt lên 60% screen, swipe down đóng |
| Cart Drawer | Bottom drawer | Tap cart bar → drawer full-height, slide close |
| Staff Support | Bottom sheet | FAB → modal grid 2×2 actions |
| Search | Inline expand | Tap icon → input expand + category bar ẩn |

---

## ❓ Open Questions

1. **Có nên tạo background illustration/pattern riêng cho mỗi thời điểm không?** (ví dụ: subtle sun rays cho morning, stars cho evening) — sẽ cần dùng canvas-design skill.
2. **Greeting có nên personalized cho returning user không?** (ví dụ: "Chào buổi sáng, anh Tuyến! ☀️")
3. **Combo section có nên thay đổi nội dung theo thời gian không?** (ví dụ: Combo Sáng cho morning, Combo Trưa cho noon)
4. **Transition khi chuyển giữa các time periods** — smooth animation hay instant?

---

## ✅ Checklist trước khi sang Phase 2

```
[x] Critical elements ≤ 2? → Có: Menu Grid + Add-to-cart button
[x] Mỗi Critical element có justification rõ ràng? → Có
[x] Important elements ≤ 5? → Có: 5 elements
[x] On-demand elements đều có cách truy cập (trigger) cụ thể? → Có
[x] Supportive content không chiếm > 30% screen space? → Có
[x] Tổng Critical + Important ≤ 7? → 7 (2+5)
[x] Primary CTA chỉ có 1? → Nút + (Add to cart)
[ ] User đã review và approve?
```

> **Khi user approve → Chuyển sang Phase 2 (Visual Design & Implementation)**
