# Design Analysis — Item Detail Modal (Phase 1)

## 📋 Screen Overview

- **Screen name**: Item Detail Modal — Mobile
- **Date**: 2026-03-24
- **Target user**: Khách hàng quét QR tại nhà hàng
- **Primary intent**: Xem chi tiết món → tùy chỉnh (size, topping) → thêm vào giỏ
- **Target device**: Mobile (100% use case)
- **Act**: Act 2: The Flow
- **Target emotion**: **Confident & In-control** — "tôi đang tùy chỉnh đúng món tôi muốn"

### Context Vectors

| Vector | Value | Impact |
|---|---|---|
| Page type | **Detail** (product detail) | Full-screen bottom sheet, hero image ưu tiên |
| Device | **Mobile** | Touch targets ≥ 44px, single-column, bottom CTA |
| User role | End User (dine-in customer) | Cần đơn giản, không technical |
| Data state | Populated (luôn có data khi mở modal) | Không cần empty/error state |
| Intent | **Configure & Add** | Tùy chỉnh rồi thêm giỏ = primary action |
| Flow stage | Regular use | Đã quen flow, cần nhanh gọn |
| Runtime | Time-aware (4 khung giờ) | Màu sắc + mood thay đổi theo sáng/trưa/chiều/tối |

---

## 🔍 Phân tích hiện trạng (Observations from Screenshot)

Từ screenshot hiện tại, có các vấn đề sau:

### Vấn đề 1: Hero Image bị "cắt cụt" — không tạo cảm giác appetizing
- Ảnh bị crop chật, không có gradient mềm mại chuyển từ ảnh sang nội dung
- Nút X nằm trên ảnh nhưng không có backdrop rõ ràng

### Vấn đề 2: Typography flat — Tên món không nổi bật
- Tên món ("Canh Rong Biển Ngao Tươi") dùng font dark trên nền trắng nhưng **cùng visual weight** với mô tả bên dưới → vi phạm Visual Hierarchy
- Rating (⭐ 4.8) cùng hàng nhưng visual weight gần bằng tên món → tranh chấp

### Vấn đề 3: Tags chiếm diện tích nhưng không có giá trị hành động
- 3 tags (`HEALTHY`, `HẢI SẢN`, `CANH`) nằm giữa tên và options → phá vỡ flow từ tên → customize → CTA
- Dùng border viền + uppercase → quá nặng visual weight cho Supportive content

### Vấn đề 4: Size Selector border cam — vi phạm Harmony
- Viền cam cho inactive states tạo cảm giác "chưa chọn cũng nổi bật" → mất phân biệt active/inactive
- 3 ô S/M/L chiếm quá nhiều vertical space

### Vấn đề 5: Topping list quá thưa — lãng phí không gian
- Mỗi topping chiếm 1 hàng dày ~56px → 3 items chiếm ~168px
- Checkbox trống trơn, không có visual feedback cho selected state

### Vấn đề 6: Footer CTA layout rời rạc
- Avatar user (N) nằm ở footer → không liên quan đến hành động "Thêm vào giỏ"
- Quantity selector (+/-) và CTA button cùng hàng → chật

---

## 🎯 Content Priority Matrix

### 🔴 Critical (Max 2)

| # | Thành phần | Lý do | Nguyên tắc |
|---|---|---|---|
| 1 | **Ảnh món ăn (Hero Image)** | Ảnh quyết định 80% hành vi gọi món. Không ảnh = không gọi | Visual Hierarchy — mắt đến ảnh trước tiên |
| 2 | **Nút "Thêm vào giỏ" + Giá** | Hành động duy nhất trên screen. Giá + CTA = quyết định cuối | Single Primary Action + Fitts's Law |

### 🟡 Important (Max 5)

| # | Thành phần | Lý do | Nguyên tắc |
|---|---|---|---|
| 1 | **Tên món ăn** | Xác nhận đúng món user muốn | Visual Hierarchy — H1 level |
| 2 | **Mô tả ngắn** | Giúp quyết định khi chưa biết món | Cognitive Load — 1-2 dòng đủ |
| 3 | **Size Selector (S/M/L)** | Tùy chỉnh bắt buộc trước khi thêm giỏ | Context Congruency — must-choose |
| 4 | **Quantity Selector** | Điều chỉnh số lượng | Fitts's Law — gần CTA |

### 🔵 Supportive

| # | Thành phần | Lý do | Hiển thị |
|---|---|---|---|
| 1 | **Rating (⭐ 4.8)** | Social proof nhưng không quyết định | Caption text, cùng dòng tên món, nhỏ hơn |
| 2 | **Tags (Healthy, Hải sản...)** | Thông tin phân loại, phụ | Inline text muted dưới mô tả, KHÔNG phải pills |
| 3 | **Badge "Lựa chọn hoàn hảo"** | Context matching, bonus info | Inline text nhỏ trên tên món |

### ⚪ On-demand

| # | Thành phần | Lý do ẩn | Cách truy cập |
|---|---|---|---|
| 1 | **Topping list** | Không bắt buộc, ~30% user dùng | Collapsed accordion, tap to expand |
| 2 | **Ghi chú cho bếp** | Hiếm dùng (~10% user) | Collapsed accordion hoặc text link |

---

## 📐 Proposed Visual Treatment (Phase 2 Preview)

### Hero Image (Critical - 38% screen)
- Full-width, `aspect-ratio: 4/3`, `object-cover`
- Gradient overlay from transparent → `theme.cardBg` at bottom
- Close button: glassmorphism circle `bg-black/20 backdrop-blur-sm`

### Item Info Zone (Important)
- **Tên món**: `text-xl font-bold`, color = `theme.textPrimary`
- **Mô tả**: `text-sm`, color = `theme.textSecondary`, max 2 lines
- **Rating**: `text-xs`, inline after name, color = `theme.textSecondary`
- **Tags**: Inline comma-separated `text-xs text-muted`, NOT pill badges

### Size Selector (Important)
- 3 pills in a row, `rounded-xl`, height 44px
- Active: `bg = theme.accent`, `text = theme.cartBarText`
- Inactive: `bg = transparent`, `border = theme.cardBorder`, `text = theme.textSecondary`
- NO colored borders on inactive — only neutral

### Topping & Notes (On-demand → Accordion)
- Default: collapsed with label + chevron
- Expanded: checkboxes with `theme.accent` fill when checked
- Compact: each row ~44px, not ~56px

### Footer CTA (Critical - Fixed)
- `position: fixed`, `bottom: 0`
- Background: `theme.bg` with `backdrop-blur`
- Quantity: compact inline `-  1  +`
- CTA Button: full-width, `bg = theme.cartBarBg`, `text = theme.cartBarText`, `rounded-xl`, `h-12`
- Price displayed inside CTA: `"Thêm vào giỏ — 80.000đ"`

---

## ✅ Checklist

```
[x] Critical elements ≤ 2? → ✅ (Hero Image + CTA)
[x] Important elements ≤ 5? → ✅ (Name, Desc, Size, Qty = 4)
[x] On-demand có trigger? → ✅ (Accordion expand)
[x] Supportive ≤ 30% screen? → ✅ (Rating + Tags = minimal)
[x] Critical + Important ≤ 7? → ✅ (6 total)
[x] Primary CTA chỉ có 1? → ✅ ("Thêm vào giỏ")
[x] Target Emotion check? → ✅ (Confident & In-control)
```

> **Khi user approve → Chuyển sang Phase 2 (Visual Implementation)**
