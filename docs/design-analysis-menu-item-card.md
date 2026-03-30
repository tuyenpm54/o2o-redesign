# UI Review: Menu Item Card — Context-Aware Priority Analysis

> **Skill**: context-aware-ui-design (Workflow 2: Review UI)
> **Target**: Menu grid item card (`menuCard` / `cardBody`)
> **Date**: 2026-03-22

---

## Context Detection

| Vector | Value |
|---|---|
| **Page type** | List/Browse (menu catalog) |
| **Device** | Mobile (primary), 430px viewport |
| **User role** | End User (restaurant customer, đang chọn món) |
| **Data state** | Populated |
| **User intent** | **Browse → Select** — lướt nhanh để tìm món muốn gọi |
| **Flow stage** | Regular use (đã qua onboarding/wizard) |
| **Runtime context** | Sáng (10:54 AM), dine-in tại bàn |

---

## Observations

Hiện tại 1 menu item card có **6 thành phần visible** trong area nhỏ (~200x300px):

1. **Ảnh món** — 50% card, object-fit cover
2. **Tên món** — 15px, font-weight 600, 2 dòng max, color đen đậm
3. **Filter tags** — 3 tags đầy màu sắc (yellow, blue, green, pink)
4. **Giá** — 15px, font-weight 700, color đen
5. **Nút +** — 32x32px, amber/gold background
6. **Badges trên ảnh** — pairing badge, quantity badge, drafting badge

> **Vấn đề chính**: Tên món và giá có **visual weight quá gần bằng nhau** và **gần bằng ảnh** — tạo flat hierarchy. User không biết mắt nên dừng ở đâu.

---

## Priority Analysis

### 🔴 Critical — Nút Thêm vào giỏ (`+` button)

**Lý do**: Đây là hành động chính duy nhất (Single Primary Action). Thiếu nút này, card mất lý do tồn tại. User scan menu để **thêm món**, không chỉ để xem.

**Hiện trạng**: ⚠️ Nút 32x32px, nhỏ và không nổi bật bằng tên/giá. Amber color bị lẫn với tags vàng.

### 🔴 Critical — Ảnh món (food image)

**Lý do**: Trong ngữ cảnh restaurant ordering, **ảnh là yếu tố quyết định chính** (Visual Hierarchy). Nghiên cứu UX cho thấy 67% quyết định gọi món dựa vào ảnh. User scan ảnh trước → quyết định → tap card hoặc nút +.

**Hiện trạng**: ✅ Chiếm ~50% card, nhưng bị **cạnh tranh visual weight** bởi tên và giá quá to.

### 🟡 Important — Tên món

**Lý do**: Hỗ trợ xác nhận sau khi ảnh thu hút. User nhìn ảnh → đọc tên để confirm "đây là gì".

**Hiện trạng**: ⚠️ 15px, weight 600, color đen đậm — **quá nổi bật**, gần như tranh chỗ với ảnh. Nên là phụ trợ, không phải focal point.

### 🟡 Important — Giá

**Lý do**: Yếu tố quyết định thứ 2 sau ảnh. Nhưng giá chỉ cần **nhìn vừa đủ**, không cần nổi bật bằng ảnh.

**Hiện trạng**: ⚠️ 15px, weight 700 — **nặng hơn cả tên món**. Đen đậm tạo visual anchor sai chỗ. Giá nên muted hơn.

### 🔵 Supportive — Filter tags

**Lý do**: Bổ sung context (Giải khát, Bán chạy, Trẻ em) nhưng user không quyết định gọi món chỉ vì tag. Tags hỗ trợ lọc/scan nhanh.

**Hiện trạng**: ⚠️ Multi-color tags (4 palette colors) **gây noise visual** quá nhiều. Chiếm không gian đáng kể. Nên compact hơn hoặc chuyển thành 1 dòng nhỏ.

### ⚪ On-demand — Badges (pairing, drafting, confirmed)

**Hiện trạng**: ✅ Đã overlay trên ảnh, chỉ xuất hiện khi có context. Đúng pattern On-demand.

---

## Context Breaches

| # | Vi phạm | Nguyên tắc bị phạm |
|---|---|---|
| 1 | **Tên món và giá visual weight ≈ ảnh** — flat hierarchy, user không biết nhìn đâu trước | Visual Hierarchy |
| 2 | **Giá đen đậm 700 weight** — nặng hơn tên món, tạo focal point sai | Visual Hierarchy |
| 3 | **Tags multi-color** chiếm 22px height, gây noise — 4 màu khác nhau cạnh tranh attention | Cognitive Load Theory |
| 4 | **Nút + quá nhỏ** (32px) so với font tên/giá — hành động chính bé hơn text phụ | Fitts's Law, Single Primary Action |
| 5 | **Tất cả text đều đen đậm** — tên, giá, cả 2 đều #0f172a → không phân biệt được hierarchy | Visual Hierarchy |

---

## Design Insights & Philosophy

### Vấn đề gốc: Flat Hierarchy

Card hiện tại vi phạm **Visual Hierarchy** nghiêm trọng: ảnh, tên, giá đều "la to" cùng lúc. Trên mobile 430px, khi 2 card cạnh nhau với 6 elements mỗi card = **12 focal points** cạnh tranh. Per **Cognitive Load Theory** (Miller's Law), quá ngưỡng 7±2.

### Giải pháp: Image-First Hierarchy

Trong food ordering context, hierarchy đúng là:

```
Ảnh (80% attention) → Nút + (action) → Tên (confirm) → Giá (secondary confirm)
```

Mọi thứ không phải ảnh nên **muted** — nhỏ hơn, nhạt hơn, nhẹ hơn. Tags nên minimal.

---

## Actionable Fixes

### 1. Giảm font-size tên món
- `cardName`: 15px → **13px**, weight 600 → **500**
- Color: `#0f172a` → `var(--menu-text-secondary, #44403c)` (muted brown)

### 2. Giảm font-size giá
- `cardPrice`: 15px → **13px**, weight 700 → **600**
- Color: `#0f172a` → `#78716c` (stone-500, muted)

### 3. Thu gọn tags
- Font-size: 10px → **9px**
- Padding: `2px 7px` → `2px 6px`
- Bỏ border colors — dùng 1 tone duy nhất (monochrome muted)
- Height: 22px → **18px**

### 4. Tăng tỷ lệ ảnh
- Image height hiện tại chiếm ~50% → giữ nguyên hoặc tăng lên ~55-60%
- Giảm `cardBody` padding: 12px 14px → **10px 12px**

### 5. Giá dùng accent color nhẹ (không đen)
- Dùng `#F97316` (orange) nhạt hoặc `#78716c` (stone) — phù hợp combo card style

### 6. Nút + nổi bật hơn
- Size: 32px → **36px**
- Giữ amber background nhưng thêm shadow nhẹ
