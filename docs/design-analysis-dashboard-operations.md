# Design Analysis: Dashboard Vận Hành Real-time (Phase 1)

> **Phase 1 Output** — Analysis chỉ, chưa code. User review trước khi Phase 2.

---

## 📋 Screen Overview

- **Screen name**: Admin Dashboard — Tab "Gọi Món Live" (Real-time Operations)
- **Date**: 2026-03-31
- **Target user**: Chủ nhà hàng / Quản lý ca — cần giám sát vận hành real-time
- **Primary intent**: Nhìn 1 lần biết ngay nhà hàng đang hoạt động tốt hay có vấn đề
- **Target device**: Desktop (primary), Tablet (secondary)
- **Flow stage**: Regular use — mở dashboard hàng ngày khi mở quán

### Context Vectors Summary

| Vector | Value | Impact |
|---|---|---|
| Page type | **Dashboard (monitoring)** | Cần hiển thị metrics ở dạng glanceable — scan nhanh 3 giây |
| Device | **Desktop** (primary) | Nhiều screen space → tận dụng grid layout, data-dense |
| User role | **Admin / Manager** | Compact density — quen đọc số, cần eficiency |
| Data state | **Populated** (always running) | Cần handle: empty (nhà hàng chưa mở), degraded (API chậm) |
| Intent | **Monitor / Review** | Passive scanning → Active alert khi có vấn đề |
| Flow stage | **Regular use** | Không cần explain metrics, cần fast glance |
| Runtime context | **Time-aware** | Metrics reset hàng ngày, pattern khác giữa buổi sáng vs tối |

---

## 🎯 Content Priority Matrix

### 🔴 Critical (2/2)

| # | Thành phần | Lý do Critical | Nguyên tắc |
|---|---|---|---|
| 1 | **Health Index** (Score 0-100 + Emoji) | Đây là single number summary. Không có nó, chủ nhà hàng phải scan toàn bộ dashboard → quá chậm. Score tổng hợp là câu trả lời đầu tiên cho "nhà hàng có ổn không?" | **Single Primary Action** — 1 con số, 1 emoji, biết ngay |
| 2 | **SLA Violation Alerts** (4 cards hiện tại) | Khi score thấp, chủ nhà hàng cần biết NGAY vấn đề ở đâu. 4 alert cards (bếp mắc, khách bị quên, bàn active, hủy/trả) là action triggers | **Context Congruency** — alert chỉ nổi bật khi có vấn đề |

### 🟡 Important (4/5)

| # | Thành phần | Lý do Important | Nguyên tắc |
|---|---|---|---|
| 1 | **SLA Tracker Breakdown** | Chi tiết vi phạm từng transition (đặt→xác nhận→nấu→sẵn sàng→phục vụ) — support diagnosis khi Health Index thấp | **Progressive Disclosure** — chỉ cần đọc khi score thấp |
| 2 | **Table Occupancy Gauge** | Tỉ lệ bàn đang dùng + số khách → quản lý capacity | **Visual Hierarchy** — gauge trực quan hơn số |
| 3 | **AOV (Giá trị TB đơn)** | Key business metric, luôn cần monitor | Giữ nguyên từ dashboard hiện tại |
| 4 | **Mức Độ Tự Phục Vụ (O2O Adoption)** | Track mức độ khách dùng O2O — core value proposition | Giữ nguyên |

### 🔵 Supportive

| # | Thành phần | Lý do Supportive | Hiển thị |
|---|---|---|---|
| 1 | **Health Score Breakdown** (5 factors) | Chi tiết cách tính score — chỉ cần khi debug score thấp | Collapsible section dưới Health widget |
| 2 | **Tốc Cộ Xoay Bàn** | Useful nhưng không actionable real-time | Card nhỏ, compact |
| 3 | **Cross-sell Hit Rate / Drop-off** | Supporting metrics cho O2O value | Compact stats bên trong O2O card |

### ⚪ On-demand

| # | Thành phần | Lý do ẩn | Cách truy cập | Trigger |
|---|---|---|---|---|
| 1 | **SLA History** (trend 7 ngày) | Quá chi tiết cho real-time monitoring | "Xem lịch sử" link | Inline expand hoặc navigate to Analytics |
| 2 | **Individual order delays** | Quá granular — KDS page đã handle | Link "Xem chi tiết tại KDS" | Navigate |
| 3 | **Health Score Config** (trọng số) | Admin-only, hiếm khi cần sửa | Settings gear icon | Modal |

---

## 🧠 Design Philosophy Justification

### Tại sao Health Index là Critical?
> Chủ nhà hàng không có thời gian scan 10+ metrics. Trong nghiên cứu dashboard design, **"one metric to rule them all"** pattern cho phép user nhìn 1 lần (< 3 giây) biết tình trạng tổng thể. Health Index tổng hợp 5 yếu tố thành 1 số + 1 emoji — giảm cognitive load từ ~15 data points xuống 2 (số + emoji).
> 
> **Emoji mapping**: Emoji là universal language — 😊 biết ngay là tốt, 😡 biết ngay là tệ. Không cần đọc chữ.

### Tại sao SLA Tracker Breakdown chỉ là Important, không phải Critical?
> Theo **Progressive Disclosure**: SLA breakdown chỉ cần thiết KHI Health Index thấp. Nếu score 90+, chẳng ai cần đọc chi tiết. Đặt Important = hiển thị nhưng không chiếm visual weight bằng Health Index.

### Trade-offs
> - **Cân nhắc**: Có nên hiển thị Health Index dạng full-width banner? → Quyết định: KHÔNG, vì Dashboard desktop cần grid density. Health Index chiếm 1/3 width, vẫn lớn nhất nhờ typography scale.
> - **Cân nhắc**: SLA Tracker nên ở bên trái hay bên dưới Health? → Quyết định: Bên dưới (row mới), vì nó là drill-down từ Health → đọc từ trên xuống theo F-pattern.

---

## 📐 Proposed Layout (Desktop)

```
┌────────────────────────────────────────────────────────────────────┐
│ HEADER: "Điều Phối Vận Hành" + Tab Controls + Store Filter        │
├──────────────────┬──────────────────┬──────────────────────────────┤
│                  │                  │                              │
│  🔴 HEALTH       │  🟡 TABLE        │  🟡 AOV + O2O ADOPTION      │
│  INDEX           │  OCCUPANCY       │                              │
│  (Score + Emoji) │  (Gauge + stats) │  (Existing cards,            │
│  (Large ring)    │                  │   restructured)              │
│                  │                  │                              │
├──────────────────┴──────────────────┴──────────────────────────────┤
│ 🟡 SLA VIOLATION ALERTS (4 cards — existing, redesigned)           │
│ Bếp Mắc | Khách Bị Quên | Bàn Active | Hủy/Trả                   │
├────────────────────────────────────────────────────────────────────┤
│ 🟡 SLA TRACKER BREAKDOWN                                          │
│ Horizontal bars: Đặt→XN | XN→Nấu | Nấu→Sẵn | Sẵn→Phục vụ       │
│ + E2E summary + Worst case                                         │
└────────────────────────────────────────────────────────────────────┘
```

---

## ❓ Open Questions

1. **Health Index vị trí**: Đặt trên cùng bên trái (như proposed) hay full-width banner?
2. **Table Occupancy**: Cần hiển thị heatmap theo giờ realtime không, hay chỉ cần con số hiện tại?
3. **SLA Config**: Cho phép chỉnh SLA values ở đâu? Trong Settings page riêng hay modal?

---

## ✅ Checklist trước khi sang Phase 2

```
☑ Critical elements ≤ 2? → Yes (Health Index + Alert Cards)
☑ Mỗi Critical element có justification rõ ràng? → Yes
☑ Important elements ≤ 5? → Yes (4)
☑ On-demand elements đều có trigger? → Yes
☑ Supportive content ≤ 30% screen? → Yes
☑ Critical + Important ≤ 7? → Yes (6)
☑ Primary CTA chỉ có 1? → Yes (Health Score = focal point)
□ User đã review và approve? → WAITING
```

> **⛔ MANDATORY STOP**: Chờ user review analysis này trước khi sang Phase 2 (build code).
