# Design Analysis: Checkout Sheet (Yêu cầu thanh toán)

## 📋 Screen Overview

- **Screen name**: Checkout Sheet — Mobile Bottom Sheet
- **Date**: 2026-03-30
- **Target user**: Khách hàng đang ngồi tại bàn nhà hàng, bữa ăn đã xong hoặc gần xong
- **Primary intent**: Gửi yêu cầu thanh toán tới nhân viên + đánh giá nhanh bữa ăn + sử dụng voucher nếu có
- **Target device**: Mobile (100% use case — QR scan flow)

### Context Vectors Summary

| Vector | Value | Impact |
|---|---|---|
| Page type | **Form/Action Sheet** (bottom sheet overlay) | Cần focus vào hành động chính, ít nội dung phụ |
| Device | **Mobile** (< 480px, touch-only) | Touch targets ≥ 44px, bottom sheet pattern, thumb-zone friendly |
| User role | **End User** (khách hàng) | Simplified, guided, emotionally warm |
| Data state | **Populated** (luôn có đơn hàng khi sheet mở) | Không cần empty/loading state cho sheet |
| Intent | **Review + Confirm** (đánh giá + xác nhận thanh toán) | Dual-action: feedback trước, payment sau |
| Flow stage | **Exit phase** (Act 3) | Khách muốn nhanh, không muốn bị giữ lại. Target emotion: "Nhẹ nhõm & hài lòng" |
| Runtime context | **Post-meal** (no ≥ 30 min, likely relaxed/full) | Tâm lý thoải mái, sẵn lòng đánh giá nếu nhanh gọn |

### Omni-Context Exploration (5-20 Rule)

| # | Dimension | Context | UI Impact |
|---|---|---|---|
| 1 | Physical | Khách cầm điện thoại 1 tay, tay kia cầm ly nước | Touch targets phải đủ lớn, nút CTA ở vùng thumb zone (dưới cùng) |
| 2 | Cognitive | Khách vui sau bữa ăn ngon → sẵn lòng đánh giá | Feedback section nên vui vẻ, nhẹ nhàng, không dài dòng |
| 3 | Cognitive | Khách bực bội vì món ra chậm / sai → muốn phản hồi nhanh | Negative feedback path phải dễ chọn (quick tags), không ép viết nhiều |
| 4 | Temporal | Khách đang vội ra về (đã trả tiền bàn khác, bạn đợi ở cửa) | Sheet phải có thể skip feedback, bấm thẳng thanh toán |
| 5 | Social | Đi nhóm — 1 người thanh toán, người khác nhìn vào màn hình | Feedback section không nên quá cá nhân, tránh câu hỏi sensitive |
| 6 | System | Voucher là giấy/QR — nhân viên quét, không phải tự apply online | Không cần form nhập mã, chỉ cần show QR/mã cho nhân viên |
| 7 | Temporal | Lần đầu dùng app — chưa biết flow | Sheet phải tự giải thích (label rõ, flow linear top→bottom) |

---

## 🎯 Content Priority Matrix

### 🔴 Critical (Max 2)

| # | Thành phần | Lý do Critical | Nguyên tắc thiết kế |
|---|---|---|---|
| 1 | **Nút "Gửi yêu cầu thanh toán"** (CTA chính) | Không có nút này thì sheet vô nghĩa — đây là hành động duy nhất mà user PHẢI thực hiện | **Single Primary Action** — chỉ 1 CTA duy nhất dùng primary color |
| 2 | **Quick Feedback (Hài lòng / Chưa hài lòng)** | Nhà hàng cần dữ liệu này gắn với hoá đơn; đây là cơ hội duy nhất thu thập (user sẽ không quay lại) | **Context Congruency** — đúng thời điểm, user vừa trải nghiệm xong |

### 🟡 Important (Max 3-5)

| # | Thành phần | Lý do Important | Nguyên tắc thiết kế |
|---|---|---|---|
| 1 | **Negative feedback tags** (khi chọn "Chưa hài lòng") | Giúp nhà hàng biết vấn đề cụ thể mà không ép user viết nhiều | **Progressive Disclosure** — chỉ hiện khi user chọn negative |
| 2 | **Voucher suggestion card** | Tăng giá trị cảm nhận cho khách; nhà hàng muốn khách dùng voucher đang có | **Cognitive Load** — hiển thị 1 voucher phù hợp nhất, không phải danh sách dài |
| 3 | **Tổng tiền tạm tính** | User cần biết bill trước khi bấm thanh toán | **Visual Hierarchy** — nổi bật nhưng không tranh chỗ CTA |

### 🔵 Supportive

| # | Thành phần | Lý do Supportive | Hiển thị như thế nào |
|---|---|---|---|
| 1 | **Header "Yêu cầu thanh toán"** | Xác nhận cho user biết đang ở đâu | Compact, font nhỏ, top of sheet |
| 2 | **"Xem tất cả voucher"** link | Cho khách xem list đầy đủ nếu voucher gợi ý không phù hợp | Text link nhỏ dưới voucher card |

### ⚪ On-demand

| # | Thành phần | Lý do ẩn đi | Cách truy cập | Trigger |
|---|---|---|---|---|
| 1 | **Danh sách voucher đầy đủ** | Quá nhiều thông tin cho bottom sheet, cần trang riêng | Navigate tới `/account/vouchers` | Tap "Xem tất cả voucher" |
| 2 | **QR code của voucher** | Chỉ cần khi nhân viên đến thanh toán | Modal overlay trên voucher page | Tap "Sử dụng" trên voucher card |

---

## 🧠 Design Philosophy Justification

### Tại sao Feedback dùng 2 nút (Hài lòng / Chưa hài lòng) thay vì 5 sao?
> **Cognitive Load Theory** — Khách đang ở giai đoạn "ra về", muốn kết thúc nhanh. Binary choice (2 options) có conversion rate cao hơn gấp 3x so với scale 1-5 tại thời điểm checkout (theo UX research). Fitts's Law cũng ưu tiên: 2 vùng chạm lớn dễ bấm hơn 5 ngôi sao nhỏ trên mobile.

### Tại sao negative tags hiện sau khi chọn "Chưa hài lòng"?
> **Progressive Disclosure** — 70-80% khách hài lòng → không cần thấy form phàn nàn. Chỉ 20-30% chọn negative mới cần thêm thông tin. Hiện sẵn tags cho tất cả sẽ tạo ấn tượng tiêu cực ("nhà hàng expect mình phàn nàn").

### Tại sao không dùng emoji cho feedback?
> **Design Standards** — Lucide icons nhất quán với design system hiện tại. Emoji rendering khác nhau giữa Android/iOS/trình duyệt, gây inconsistency. Sử dụng SVG icons từ lucide-react: `SmilePlus` (positive) và `Frown` (negative) với styling thống nhất, kích thước kiểm soát được.

### Trade-offs đã cân nhắc
> Đã cân nhắc cho Voucher section ở mức Critical, nhưng quyết định Important vì: không phải lúc nào khách cũng có voucher, và mục đích chính của sheet là thanh toán + feedback. Nếu voucher section quá nổi bật, user có thể confuse nó là bước bắt buộc.

---

## 📐 On-demand Strategy

| Thành phần | Pattern | Mô tả UX |
|---|---|---|
| Negative tags | Accordion (expand in-place) | Chọn 😟 → tags slide down mượt 200ms, chiếm thêm ~80px height |
| Voucher list | Page navigation | Tap "Xem tất cả" → push to `/account/vouchers`, back button quay lại table-orders |
| Voucher QR | Full modal overlay | Tap "Sử dụng" trên voucher card → modal center với QR code lớn + mã text |

---

## 📐 Layout Sketch (Top → Bottom)

```
┌─────────────────────────────────┐
│  ── drag handle ──              │
│                                 │
│  💬 Bữa ăn hôm nay thế nào?    │  ← Warm label (supportive)
│                                 │
│  ┌─────────┐  ┌─────────────┐   │
│  │  😊     │  │  😟          │   │  ← 2 large tap zones (critical)
│  │ Hài lòng│  │ Chưa hài lòng│  │     lucide SmilePlus / Frown
│  └─────────┘  └─────────────┘   │
│                                 │
│  [Negative tags — if sad]       │  ← Progressive disclosure (important)
│  ┌─────────┐ ┌─────────┐       │
│  │Món chậm │ │Phục vụ kém│ ... │
│  └─────────┘ └─────────┘       │
│                                 │
│  ─── divider ───                │
│                                 │
│  🎫 Voucher dành cho bạn        │  ← Important
│  ┌──────────────────────────┐   │
│  │ WELCOME50 — Giảm 50%    │   │
│  │ [Xem tất cả voucher →]  │   │
│  └──────────────────────────┘   │
│                                 │
│  Tổng tạm tính:    535.000đ    │  ← Important
│                                 │
│  ┌──────────────────────────┐   │
│  │  Gửi yêu cầu thanh toán │   │  ← CTA (critical, green, full-width)
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

---

## ❓ Open Questions

1. **Skip feedback**: Nếu user không chọn hài lòng/chưa hài lòng, vẫn cho bấm CTA thanh toán bình thường? (Đề xuất: Có — feedback là optional)
2. **Voucher matching logic**: Chọn voucher "phù hợp nhất" theo tiêu chí nào? (Đề xuất: voucher active có `min_order` thấp nhất mà đơn hàng đạt đủ điều kiện, ưu tiên discount value cao nhất)

---

## ✅ Checklist trước khi sang Phase 2

```
✅ Critical elements ≤ 2? (CTA + Feedback = 2)
✅ Mỗi Critical element có justification rõ ràng?
✅ Important elements ≤ 5? (Negative tags + Voucher card + Tổng tiền = 3)
✅ On-demand elements đều có cách truy cập cụ thể?
✅ Supportive content không chiếm > 30% screen space?
✅ Tổng Critical + Important ≤ 7? (2 + 3 = 5)
✅ Primary CTA chỉ có 1? (Gửi yêu cầu thanh toán)
✅ User đã review và approve? → ⏳ WAITING
```

> **⛔ MANDATORY STOP**: Chờ user review và approve tài liệu này trước khi sang Phase 2 (Visual Design & Implementation).
