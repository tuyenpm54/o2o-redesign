# Design Analysis — Account Page (Phase 1)

## 📋 Screen Overview

- **Screen name**: Account Hub — Mobile
- **Date**: 2026-03-25
- **Target user**: Khách hàng đã đăng nhập (registered hoặc đã login qua SĐT)
- **Primary intent**: Xem tổng quan tài khoản, quản lý thông tin cá nhân, theo dõi hạng thành viên & điểm tích lũy, tra cứu hoá đơn
- **Target device**: Mobile (QR scan at table → phone browser)

### Context Vectors Summary

| Vector | Value | Impact |
|---|---|---|
| Page type | **Settings / Profile Hub** | Grouped sections, navigation menu, edit modes |
| Device | **Mobile** | Single column, bottom sheets for edit, touch targets ≥ 44px |
| User role | **End User** (khách hàng) | Simplified, task-focused, không cần bulk actions |
| Data state | Populated (logged in) / Empty (mới tạo TK chưa có order) | Cần empty state cho lịch sử hoá đơn |
| Intent | **Review & Configure** | Xem thông tin → sửa nếu cần → quay lại menu |
| Flow stage | Regular use (đã login) | Clean workspace, không cần onboarding |
| Runtime context | Đang ngồi tại bàn nhà hàng, thường mở nhanh rồi quay lại menu | Tối ưu scan nhanh, không nên dàn trải |

---

## 🎯 Content Priority Matrix

### 🔴 Critical (Max 2)

| # | Thành phần | Lý do Critical | Nguyên tắc thiết kế |
|---|---|---|---|
| 1 | **Profile Summary Card** (Tên + hạng + điểm + ảnh) | Xác nhận danh tính — user mở trang Account trước hết để thấy "đây là tôi, tôi đang ở hạng gì, tôi có bao nhiêu điểm". Thiếu thể thì trang mất lai do tồn tại. | **Visual Hierarchy** — kích thước lớn nhất, vị trí đầu tiên |
| 2 | **Quick Navigation Menu** (Thông tin cá nhân, VAT, Hoá đơn, Sở thích, Cài đặt) | Hành động chính: điều hướng đến sub-page cần quản lý. Phải scan nhanh trong ≤ 3s. | **Fitts's Law** — các item đủ lớn, khoảng cách đều, dễ chạm |

### 🟡 Important (Max 3-5)

| # | Thành phần | Lý do Important | Nguyên tắc thiết kế |
|---|---|---|---|
| 1 | **Thanh tiến độ thăng hạng** (Progress bar + "Còn X điểm lên hạng Y") | Gamification — thúc đẩy quay lại, nhưng không phải mục đích chính khi mở Account | **Progressive Disclosure** — hiển thị inline dưới Profile Card, không phải CTA |
| 2 | **Lịch sử hoá đơn gần đây** (2-3 hoá đơn mới nhất, collapsible) | Giúp user tra cứu nhanh hoá đơn gần nhất — nhưng đa số vào Account không phải để xem bill | **Cognitive Load** — chỉ hiện 2-3 dòng, có nút "Xem tất cả" |
| 3 | **Thẻ sở thích / Filter Tags** (tags khẩu vị, allergen, nhóm ăn) | User quay lại nhà hàng muốn xem/sửa sở thích đã lưu để cải thiện gợi ý lần sau | **Context Congruency** — phục vụ trực tiếp trải nghiệm gọi món |

### 🔵 Supportive

| # | Thành phần | Lý do Supportive | Hiển thị như thế nào |
|---|---|---|---|
| 1 | **Đổi quà / Rewards** (danh sách voucher có thể đổi) | Bổ sung giá trị cho hệ thống điểm, nhưng không phải lý do chính vào Account | Compact horizontal scroll, dưới fold |
| 2 | **Barcode / Mã thành viên** | Dùng khi quét tại POS nhưng hiếm khi cần trên mobile | Hiện nhỏ, bên trong Profile Card hoặc On-demand |
| 3 | **Nút đăng xuất** | Hành vi hiếm khi cần, nhưng phải có | Cuối trang, style ghost/outline |

### ⚪ On-demand

| # | Thành phần | Lý do ẩn đi | Cách truy cập | Trigger |
|---|---|---|---|---|
| 1 | **Chi tiết hoá đơn** (từng item, giá, ngày giờ) | Dữ liệu chi tiết chỉ cần khi user chủ động tap vào 1 hoá đơn cụ thể | Tap vào dòng hoá đơn | Bottom sheet slide up |
| 2 | **Form chỉnh sửa thông tin cá nhân** | Chỉ cần khi user bấm "Sửa" | Tap nút Edit trên section Personal Info | Inline form hoặc sub-view |
| 3 | **Form thêm/sửa VAT** | Tần suất rất thấp | Tap vào menu item "Thông tin VAT" | Sub-view slide |
| 4 | **Lịch sử lượt gọi chi tiết** (rounds) | Dữ liệu granular, chỉ cần khi điều tra | Tap "Xem lịch sử lượt gọi" trong Personal Info | Full page /order-history |
| 5 | **Cài đặt bảo mật, thông báo** | Hành vi cấu hình hệ thống, hiếm cần | Tap "Cài đặt" trong menu | Sub-page |

---

## 🧠 Design Philosophy Justification

### Tại sao Profile Summary Card là Critical?
> User mở `/account` với intent đầu tiên: **xác nhận danh tính** ("Tôi đang đăng nhập đúng tài khoản chưa?") và **kiểm tra trạng thái** ("Tôi hạng gì? Còn bao nhiêu điểm?"). Nếu bỏ card này, trang trở thành 1 danh sách menu items vô hồn — user không biết trang này thuộc về ai. Theo **Single Primary Action**, card profile là "anchor" duy nhất của trang.

### Tại sao Quick Navigation Menu là Critical?
> Trang Account là 1 **hub trung chuyển** (Settings page type) — giá trị cốt lõi là giúp user đến đúng sub-page nhanh nhất trong dưới 3 giây. Theo **Fitts's Law**, menu phải lớn, rõ, dễ chạm (44-48px mỗi item). Mất menu = mất toàn bộ mục đích điều hướng.

### Tại sao Rewards/Voucher bị đẩy xuống Supportive?
> Người vào Account không phải để "đổi quà". Đó là hành vi phát sinh **sau** khi biết mình có bao nhiêu điểm. Theo **Cognitive Load Theory**, đẩy rewards lên cao sẽ tạo ra 2 focal points tranh nhau, khiến user bối rối "nên bấm đâu trước?". Đặt rewards dưới fold, dạng compact, vẫn accessible nhưng không giành spotlight.

### Tại sao Lịch sử hoá đơn chỉ là Important (không phải Critical)?
> Theo yêu cầu, user muốn tra cứu hoá đơn (invoice) nhưng đây là **1 trong nhiều** chức năng của trang, không phải chức năng duy nhất. Hiển thị 2-3 hoá đơn gần đây inline là đủ, kèm "Xem tất cả" dẫn đến full list. Theo **Progressive Disclosure**, chi tiết từng hoá đơn chỉ hiện khi tap vào.

### Trade-offs đã cân nhắc
> 1. **Lịch sử lượt gọi (Rounds) vs. Lịch sử hoá đơn (Invoices):** User yêu cầu rõ "danh sách hoá đơn, không phải lượt gọi". Vì vậy, trên trang Account chính, chỉ hiện Invoices (table_sessions đã PAID). Lịch sử lượt gọi chi tiết (rounds) nằm On-demand trong sub-page.
> 2. **Sở thích Tags:** Đặt ở Important vì nó ảnh hưởng trực tiếp đến trải nghiệm gọi món (wizard gợi ý dựa trên preferences). User chỉ cần thấy + toggle nhanh, không cần form phức tạp.
> 3. **Barcode thành viên:** Hiện tại hiển thị to trong Member Card. Sẽ thu nhỏ hoặc đưa vào On-demand vì user quét QR tại bàn, rất ít khi cần show barcode thành viên cho POS.

---

## 📐 On-demand Strategy

| Thành phần | Pattern | Mô tả UX |
|---|---|---|
| Chi tiết hoá đơn | **Bottom Sheet** | Tap dòng hoá đơn → sheet trượt lên 70% screen, danh sách items + tổng tiền + trạng thái |
| Form sửa thông tin | **Sub-view (push)** | Tap "Thông tin cá nhân" → push sub-view vào stack, back button quay về Overview |
| Form VAT | **Sub-view (push)** | Tương tự Personal Info |
| Lịch sử lượt gọi | **Full page link** | Tap "Lịch sử lượt gọi" → navigate to /order-history/rounds |
| Cài đặt hệ thống | **Sub-page** | Navigate to /account/settings |

---

## 📐 Proposed Information Architecture (NEW)

```
/account (Account Hub)
├── Profile Summary Card (Critical)
│   ├── Avatar + Tên + SĐT
│   ├── Hạng thành viên badge
│   ├── Điểm tích luỹ
│   └── Progress bar thăng hạng
│
├── Quick Navigation (Critical)
│   ├── 👤 Thông tin cá nhân → Sub-view
│   │   ├── Họ tên, SĐT, Email, Giới tính, Ngày sinh
│   │   ├── 🏷️ Sở thích / Tags (filter preferences)
│   │   └── 📋 Lịch sử lượt gọi → Link to /order-history
│   ├── 🧾 Thông tin VAT → Sub-view
│   ├── 📄 Hoá đơn của tôi → Sub-view (invoice list)
│   ├── 🎫 Voucher của tôi → /account/vouchers
│   └── ⚙️ Cài đặt → /account/settings
│
├── Hoá đơn gần đây (Important, 2-3 items inline)
│   └── Tap → Bottom sheet chi tiết
│
├── Sở thích nhanh (Important, tag chips)
│   └── Tap → Bật/tắt toggle preference
│
├── Đổi quà (Supportive, compact cards)
│   └── "Xem tất cả" → /account/vouchers
│
└── Đăng xuất (Supportive, ghost button, cuối trang)
```

---

## ✅ User Decisions (Confirmed)

1. **Hoá đơn** → Dùng bảng `table_sessions` WHERE status = 'PAID'. Mỗi bữa ăn (mở bàn → thanh toán) = 1 hoá đơn.
2. **Sở thích Tags** → Tự động tổng hợp từ: (a) Onboarding wizard preferences, (b) tags của các món đã gọi trong lịch sử.
3. **Barcode thành viên** → Giữ lại nhưng **ẩn mặc định** (On-demand), bấm vào mới hiện ra.
4. **Lịch sử lượt gọi** → **Tách riêng** thành menu item độc lập trên hub, không nằm trong "Thông tin cá nhân".

---

## ✅ Checklist trước khi sang Phase 2

```
[x] Critical elements ≤ 2? (Profile Card + Quick Nav)
[x] Mỗi Critical element có justification rõ ràng?
[x] Important elements ≤ 5? (Progress bar, Hoá đơn gần đây, Sở thích tags)
[x] On-demand elements đều có cách truy cập cụ thể?
[x] Supportive content không chiếm > 30% screen space?
[x] Tổng Critical + Important ≤ 7? (2 + 3 = 5 ✓)
[x] Primary CTA chỉ có 1? (Quick Nav menu là hành động chính)
[x] User đã review và approve? ✅ (2026-03-25)
```

> **✅ APPROVED** — Chuyển sang Phase 2 (Visual Design & Implementation).
