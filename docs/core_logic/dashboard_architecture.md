# Core Logic: Dashboard Architecture — Thiết kế Hướng Quyết định

Tài liệu này định nghĩa triết lý, cấu trúc và quy tắc nghiệp vụ cho toàn bộ Dashboard quản trị cửa hàng. Mọi thành phần trên Dashboard phải tuân thủ một nguyên tắc duy nhất: **Mỗi khối hiển thị phải dẫn tới một Hành động cụ thể mà chủ quán có thể thực hiện ngay.**

---

## Tuyên ngôn Thiết kế

> **"Dashboard không phải bảng số để ngắm. Dashboard là Bản đồ Ra lệnh."**

Nếu một chỉ số nằm trên Dashboard mà chủ quán nhìn xong chỉ nói *"Ừ, biết rồi"* mà không biết phải làm gì → Chỉ số đó **không xứng đáng** có mặt.

Mọi thành phần trên Dashboard đều phải trả lời ĐÚNG 1 trong 3 câu hỏi:
1. **"Tôi cần can thiệp gì NGAY BÂY GIỜ?"** → Khối Thời gian thực
2. **"Bộ máy của tôi đang chạy tốt hay tệ?"** → Khối Vận hành
3. **"Tôi nên thay đổi gì để tốt hơn?"** → Khối Chiến lược

---

## Kiến trúc 5 Khối (Deck Architecture)

Dashboard được chia thành 5 Khối (Deck) xếp dọc từ trên xuống dưới, theo thứ tự **khẩn cấp giảm dần**. Chủ quán mở Dashboard lên, đọc từ trên xuống, và mỗi tầng cho một "tần số" quyết định khác nhau.

```
┌─────────────────────────────────────────────────────────┐
│  DECK 1: TRỰC CHIẾN (Realtime Nerve Center)             │ ← Nhìn mỗi 5 phút
│  "Có gì cần tôi xử lý NGAY không?"                     │
├─────────────────────────────────────────────────────────┤
│  DECK 2: VẬN HÀNH (Operational Performance)             │ ← Nhìn mỗi ngày
│  "Bộ máy bếp-phục vụ hôm nay chạy ra sao?"            │
├─────────────────────────────────────────────────────────┤
│  DECK 3: TĂNG TRƯỞNG (Growth Intelligence)              │ ← Nhìn mỗi tuần
│  "Doanh thu, khách, hiệu quả O2O đang đi lên hay xuống?"│
├─────────────────────────────────────────────────────────┤
│  DECK 4: TRẢI NGHIỆM (Customer Experience)              │ ← Nhìn mỗi tháng
│  "Khách hàng có hài lòng không? Vì sao không?"         │
├─────────────────────────────────────────────────────────┤
│  DECK 5: HIỆU QUẢ MENU (Menu Efficiency)                │ ← Xoay vòng sau đổi Menu
│  "Menu có bị rối không? Món nào khách đang lướt qua?"   │
└─────────────────────────────────────────────────────────┘
```

---

## DECK 1: TRỰC CHIẾN (Realtime Nerve Center)

### Mục đích
Cho chủ quán biết **NGAY LÚC NÀY** có sự cố nào cần xử lý không. Đây là thứ đầu tiên chủ quán nhìn thấy khi mở Dashboard — giống bảng đèn cảnh báo trên buồng lái.

### Tần suất cập nhật
Polling mỗi **15 giây**.

### Thành phần

| Component | Chỉ số | Hành động khi bất thường |
|-----------|--------|--------------------------|
| **Cảnh báo Bếp Tồn Đơn** | Số đơn quá 15p chưa ra món | → Gọi điện xuống bếp, điều phối chia lại trạm |
| **Cảnh báo Bàn Bỏ Quên** | Số bàn có khách ngồi quá lâu không được phục vụ | → Nhắc trưởng ca kiểm tra tại bàn |
| **Hết Món / Hủy Đơn** | Số lượt hết nguyên liệu hoặc huỷ trong ngày | → Kiểm tra kho, cập nhật menu tắt món |
| **Sức Chứa Hiện Tại** | Tỉ lệ bàn đang mở / tổng bàn + Số khách ước tính | → Quyết định mở thêm khu vực hoặc từ chối khách walk-in |
| **Báo Cáo Nóng (SLA Snapshot)** | Có bao nhiêu tác vụ đang vi phạm SLA | → Nhìn nhanh để biết tình hình ổn định hay cần can thiệp |

### Quy tắc thiết kế
- **Trạng thái bình thường = Tối giản.** Khi không có sự cố, các thẻ Alert hiển thị số 0 trên nền trắng/xám nhạt. Không gây nhiễu thị giác.
- **Trạng thái bất thường = Kích hoạt Red Alert.** Khi count > 0, thẻ Alert chuyển sang nền đỏ (`bg-rose-500`), text trắng, và có hiệu ứng đèn nhấp nháy (pulse dot). Mục đích: buộc mắt người nhìn dính vào.
- **Sức Chứa** là card trung tâm lớn nhất, vì đây là thông tin mà chủ quán bận rộn cần nhất khi đang đứng dưới sàn: *"Mình còn bao nhiêu bàn trống?"*

### Nguồn dữ liệu
- API: `/api/admin/dashboard/live-pulse`
- API: `/api/admin/dashboard/table-occupancy` (Model A/B)
- API: `/api/admin/dashboard/order-queue` (Model C)
- API: `/api/admin/dashboard/sla-metrics` (snapshot)

### Rẽ Nhánh Theo Mô Hình Kinh Doanh (Shop Model Branching)

DECK 1 có **2 phiên bản giao diện** tuỳ thuộc vào `shopConfig.model`:

#### Model A/B (Dine-in): "Sảnh Trực Chiến" — Spatial Floor Map
- **Cột 1:** Bản đồ bàn (Hiện trường Sàn) — hiển thị trạng thái bàn (Chờ món, Đang ăn, Sắp trống, Trống), filter theo khu vực, chiếm suất bàn.
- **Cột 2:** SLA Pipeline 4 bước (Tiếp nhận → Chuẩn bị → Chế biến → Phục vụ).
- **Cột 3:** Thùng Thư Cấp Cứu (Urgent Inbox).

#### Model C (Counter — Trả trước tại quầy): "Trạm Điều Phối Quầy" — Counter Dispatch Center
Model C không có concept "bàn" (chỉ có 1 QR duy nhất, khách tự lấy đồ tại quầy). Toàn bộ Cột 1 được thay thế:

- **Cột 1:** Hàng Chờ Quầy (Order Queue Board):
  - **Revenue + Throughput Metrics:** Đơn Đang Xử Lý, Khách Hôm Nay, TB Thời Gian Ra Đơn (thay vì Bàn Đang Mở, Khách Ước Tính, Lưu Trú).
  - **Ready Board (Bảng Gọi Tên):** Danh sách đơn đã nấu xong chờ khách lấy. Cảnh báo theo thời gian chờ: xanh (<5p), vàng (5-10p), đỏ (>10p). Có nút "Đã lấy" để mark as picked up.
  - **Active Queue (Đang Trong Ống):** Danh sách đơn đang nấu/chờ xác nhận.
- **Cột 2:** SLA Pipeline **3 bước** (bỏ `ready_to_served` vì khách tự lấy, không có phục vụ mang ra bàn).
- **Cột 3:** Giữ nguyên.

| Metric (Model A/B) | → Thay bằng (Model C) |
|---------------------|------------------------|
| Bàn Đang Mở: 18/25 | Đơn Đang Xử Lý: 12 |
| Khách Ước Tính: 65 | Khách Hôm Nay: 87 |
| Lưu Trú: 45 ph | TB Ra Đơn: 8.5 ph |

---

## DECK 2: VẬN HÀNH (Operational Performance)

### Mục đích
Trả lời câu hỏi: **"Bộ máy bếp và phục vụ hôm nay chạy như thế nào?"**. Nếu DECK 1 là đèn báo *"có cháy không?"*, thì DECK 2 là bảng đo *"máy chạy bao nhiêu vòng/phút?"*.

### Tần suất xem
Cuối mỗi ca, hoặc mỗi ngày.

### Thành phần

#### 2A. Pipeline SLA Bếp & Phục vụ
Phân tích thời gian trung bình một đơn hàng lưu lại tại **từng trạm** trong chuỗi phục vụ:

```
[Tiếp nhận] → [Chuẩn bị] → [Chế biến] → [Phục vụ]
   1.5p          4.0p         16.5p         2.2p
   SLA 2p        SLA 5p       SLA 15p       SLA 3p
```

| Metric | Ý nghĩa kinh doanh | Hành động |
|--------|---------------------|-----------|
| Thời gian trung bình mỗi trạm | Trạm nào đang là nút thắt? | → Điều phối nhân lực, tăng ca cho trạm chậm |
| Tỉ lệ vi phạm SLA mỗi trạm | Mức độ nghiêm trọng của tắc nghẽn | → Xem xét lại quy trình, đào tạo nhân viên |
| End-to-end trung bình | Tổng thời gian hoàn thành 1 đơn | → Benchmark với mục tiêu, đánh giá năng lực tổng thể |
| Worst case | Ca làm có đơn nào bị "thối" quá lâu? | → Điều tra nguyên nhân cụ thể (thiếu nguyên liệu? nhân viên vắng?) |

**Hành động dẫn tới:**
- *Nếu Chế biến > SLA*: Kiểm tra Bếp có đủ người không, có món nào quá phức tạp không.
- *Nếu Phục vụ > SLA*: Nhân viên phục vụ đang bận hoặc không biết món đã sẵn sàng.

#### 2B. Cực Đại Vận Hành (Peak Analysis)
Biểu đồ thanh ngang hiển thị doanh thu theo **Giờ** hoặc **Ngày trong tuần**, giúp chủ quán nắm được khung thời gian nào là cao điểm.

| Chế độ | Hành động |
|--------|-----------|
| **Giờ Vàng** (Peak Hours) | → Sắp xếp ca trực dày hơn vào khung giờ cao điểm, đặt sẵn nguyên liệu |
| **Ngày Cao Điểm** (Peak Days) | → Lên kế hoạch nhập hàng, dự trù nhân sự theo ngày trong tuần |

**Quy tắc đo:** Các cột cao hơn mức trung bình (`summary.doanhThu / số khung`) được tô đậm (`#0f172a`), còn lại tô nhạt (`#e2e8f0`) để chủ quán nhận diện bằng mắt ngay lập tức *"đâu là đỉnh"*.

**Quy tắc đo:** Các cột cao hơn mức trung bình (`summary.doanhThu / số khung`) được tô đậm (`#0f172a`), còn lại tô nhạt (`#e2e8f0`) để chủ quán nhận diện bằng mắt ngay lập tức *"đâu là đỉnh"*.

### Nguồn dữ liệu
- API: `/api/admin/dashboard/sla-metrics` (chi tiết)
- API: `/api/admin/dashboard/analytics` → `peakHours`, `peakDays`

---

## DECK 2.5: KẾT LUẬN TỰ ĐỘNG (Auto-Insights Heuristics)

### Mục đích & Nguyên tắc Kỹ thuật
Xóa bỏ tình trạng "Data Dumping" (chỉ show số liệu) bằng cách đặt các Lời Tuyên Bố Hành Động lên ngay phần Tổng quan Hiệu suất.
**Nguyên tắc Tuyệt đối:** KHÔNG SỬ DỤNG Machine Learning hay các lệnh SQL hạng nặng ở Backend. Toàn bộ logic Auto-Insights được xử lý bằng các hàm Heuristics (rẽ nhánh IF/ELSE) ngay trên **Frontend**, tận dụng 100% dữ liệu đã fetch từ API `analytics` và `sla-metrics`.

### Các Nhãn Trạng Thái
Bản tin vận hành luôn đưa ra 3 đầu mục phân tích:
1. 🟢 **Tăng trưởng (Positive):** Khen ngợi điểm sáng (Dựa vào Tỉ lệ O2O hoặc AOV).
2. 🔴 **Thắt cổ chai (Critical):** Cảnh báo nghẽn mạch (Dựa vào SLA Bếp/Phục vụ).
3. 💡 **Hành động (Action/Warning):** Gợi ý ra lệnh (Dựa vào Tỉ lệ Hủy món hoặc Thời gian lưu trú trung bình).

### Ví dụ Logic IF/ELSE trên Frontend:
- `IF (O2O_Rate > 70%)` → In ra: *"Tỉ lệ dùng app rất cao (X%), tiết kiệm nhân sự chạy bàn."*
- `IF (SLA_Worst_Stage_Violated_Rate > 15%)` → In ra: *"Cảnh báo: Khâu [Tên khâu] đang trễ hẹn nghiêm trọng, ảnh hưởng trải nghiệm."*
- `IF (Cancel_Rate > 5%)` → In ra: *"Tỉ lệ hủy/hết món lớn (X%). Nhắc quản lý kiểm kê kho."*

---

## DECK 3: TĂNG TRƯỞNG (Growth Intelligence)

### Mục đích
Trả lời câu hỏi: **"Kinh doanh của tôi đang đi lên hay đi xuống? Vì sao?"**. Đây là tầng chiến lược ngắn hạn (tuần-tháng), đòi hỏi nhìn qua lens thời gian.

### Tần suất xem
Mỗi tuần, hoặc sau mỗi đợt thay đổi menu/chiến dịch.

### Thành phần

#### 3A. KPI Tổng Quan (4 Thẻ Chỉ Số)

| Thẻ | Metric | Hành động khi giảm |
|-----|--------|---------------------|
| **Doanh thu tổng** | Tổng GMV từ invoices | → Kiểm tra lại pricing, khuyến mãi, hoặc lượng khách |
| **Số lượt khách** | Distinct users có đơn hàng | → Xem xét marketing, thay đổi vị trí QR, cải thiện khả năng tiếp cận |
| **Số lượt gọi món** | Tổng qty trên order_items | → Chỉ số này giảm khi khách giảm, hoặc khi menu khó chọn |
| **Tỉ lệ O2O** | % khách dùng QR so với tổng lượt gọi | → Tăng → chứng minh ROI hệ thống. Giảm → Kiểm tra QR code, UX |

**Quy tắc hiển thị trend:**
- Mỗi thẻ hiển thị `% thay đổi so với kỳ trước`. Xanh lá = tốt, Đỏ = xấu.
- Trend được tính: `((giá_trị_kỳ_này - giá_trị_kỳ_trước) / giá_trị_kỳ_trước) * 100`.

#### 3B. Biểu Đồ Tăng Trưởng (Growth Report)
Biểu đồ ComposedChart theo ngày với 4 lớp dữ liệu:

| Lớp | Loại | Trục | Mục đích |
|-----|------|------|----------|
| Lượt khách | Bar (cột xanh lá mờ) | Trục ẩn `count` | Nền tảng cho biết traffic |
| Doanh thu | Line (đen đậm, chấm tròn) | Trục trái `VNĐ` | Chỉ số kinh doanh chính |
| Lượt gọi món | Line (tím, nét đứt) | Trục ẩn `count` | Đo mức tiêu thụ trung bình / khách |
| Tỉ lệ O2O | Line (vàng) | Trục phải `%` | Đo mức áp dụng công nghệ |

**Hành động:**
- *Doanh thu tăng + Khách tăng*: Kinh doanh thuận lợi.
- *Doanh thu tăng + Khách giảm*: AOV tăng (tốt), nhưng cần lưu ý nguồn khách đang cạn.
- *Doanh thu giảm + Khách tăng*: AOV giảm → Kiểm tra xem khách có đang chuyển sang món rẻ hơn không, hoặc khuyến mãi quá tay.
- *O2O giảm*: Cảnh báo đỏ — UX đang có vấn đề hoặc QR code bị hỏng/đặt sai vị trí.

### Nguồn dữ liệu
- API: `/api/admin/dashboard/analytics` → `summary`, `trend`

---

## DECK 4: TRẢI NGHIỆM KHÁCH HÀNG (Customer Experience)

### Mục đích
Trả lời câu hỏi: **"Khách hàng có hài lòng không? Nếu không, vì nguyên nhân gì?"**. Đây là phần duy nhất đo **Cảm xúc** thay vì Số — và nó là leading indicator cho mọi chỉ số ở DECK 3.

### Tần suất xem
Mỗi tuần hoặc mỗi tháng.

### Thành phần

#### 4A. Tỉ Lệ Hài lòng vs Phàn nàn

| Metric | Ý nghĩa |
|--------|---------|
| % Hài lòng (4-5 sao) | Tổng thể trải nghiệm tích cực |
| % Phàn nàn (1-2 sao) | Tỉ lệ trải nghiệm xấu cần chú ý |
| Tổng khảo sát | Sample size — nếu quá ít, số liệu không đáng tin |

**Quy tắc:**
- % Phàn nàn > 15% → Cảnh báo đỏ nặng. Cần hành động ngay.
- Tổng khảo sát < 50 / tuần → Khuyến khích khách khảo sát nhiều hơn (đổi voucher?).

#### 4B. Phân Tích Gốc Rễ (Root Cause Analysis — RCA)
Biểu đồ thanh ngang phân loại **LÝ DO** khiến khách đánh giá xấu.

| Lý do | Hành động |
|-------|-----------|
| Thời gian chờ lâu | → Quay lại DECK 2, kiểm tra SLA Pipeline |
| Nhân viên chậm/thái độ kém | → Vấn đề đào tạo, không liên quan đến hệ thống |
| Món ăn không ngon | → Vấn đề bếp/thực đơn — xem xét thay đổi công thức hoặc nhà cung cấp |
| Vệ sinh kém | → Vấn đề vận hành mặt bằng |

**AI Insight:** Hệ thống tự động tổng hợp một câu nhận xét dựa trên tỉ lệ phàn nàn. Nếu "Chờ lâu" chiếm > 40% → Gợi ý chủ quán kiểm tra SLA bếp ở DECK 2.

**Luồng Liên kết Xuyên Deck (Cross-Deck Linkage):**
```
Phàn nàn "Chờ lâu" (DECK 4) 
   → Kiểm tra Pipeline SLA (DECK 2) 
   → Phát hiện Trạm Chế biến > SLA 
   → Kiểm tra Peak Hours (DECK 2B) 
   → Kết luận: Thiếu nhân lực bếp vào khung 12h–13h
```

### Nguồn dữ liệu
- API: `/api/admin/dashboard/analytics` → `reviews` (planned)
- Hiện tại: Mock data tĩnh từ `src/data/mock-dashboard.ts`

---

## DECK 5: HIỆU QUẢ MENU (Menu Efficiency) — *Đã triển khai (UI Mock)*

### Mục đích
Trả lời câu hỏi: **"Menu của tôi có dễ chọn không? Khi tôi thay đổi menu, khách đặt nhanh hơn hay chậm đi?"**

Đây là Deck đo **ma sát trước khi đơn hàng tồn tại** — một khoảng trống mà hầu hết hệ thống ordering không chạm tới. Nếu DECK 2 đo hiệu suất *sau khi khách gọi*, thì DECK 5 đo hiệu suất *trước khi khách gọi*.

### Phễu Hành vi Gọi Món (Ordering Funnel)

```
T0 ─── Quét QR / Vào bàn ──────────────────── "Tôi đến rồi"
│
├── T_browse ── Thời gian duyệt menu ────── Metric Vàng ⭐
│
T1 ─── Thêm món đầu tiên vào giỏ ──────────── "Tôi biết mình muốn gì"
│
├── T_decide ── Thời gian cân nhắc ────────
│
T2 ─── Bấm "Gọi món" (lượt đầu tiên) ─────── "Tôi chắc chắn rồi"
```

### Metrics Cốt Lõi (ROW 1 - Global Health)

| Metric | Công thức | Hành động khi tăng |
|--------|-----------|---------------------|
| **T_browse** | T1 − T0 | ⭐ Menu khó chọn, cấu trúc category gây bối rối → Xem xét lại sắp layout |
| **T_decide** | T2 − T1 | Luồng giỏ hàng có ma sát (giá không rõ? thiếu mô tả?) → Cải thiện UX checkout |
| **T_total** | T2 − T0 | Benchmark tổng thể → So sánh trước/sau khi thay đổi menu |
| **Drop-off Rate** | % Scan QR nhưng không bao giờ gọi | Cảnh báo lớn nhất: mất khách vì menu → Điều tra ngay |

### Hàng 2: Macro Analysis (Phân tích Phễu & Xu hướng 40/60)

**1. Phễu Gọi Món & Hành Vi Đặt Món (Left Col 40%)**
- **Phễu Gọi Món**: Quét QR → Mở Menu → Xem chi tiết → Thêm vào giỏ → Gửi đơn hàng. Giúp nhìn ra điểm Drop-off lớn nhất.
- **Hành Vi Gọi Order**: Query trực tiếp từ database (`order_items`, `order_rounds`, `table_sessions`):
  - **TB món / Đơn đầu tiên**: Thấp (< 2) → Khách mua thử. Cao (> 4) → Menu kích thích tốt.
  - **TB lượt gọi / Bàn**: Thấp = khách gọi 1 lần rồi thanh toán → xem xét gợi ý gọi thêm.
  - **% Gọi 1 lượt vs ≥3 lượt**: Đo độ lôi cuốn (addictiveness) của menu trong suốt bữa ăn.

**2. Biểu đồ Xu hướng & Tracking Sự kiện Đổi Menu (Right Col 60%)**
- Biểu đồ Area theo dõi T_browse và T_decide theo ngày (Mũi tên đi xuống là cải thiện hiệu quả).
- **So sánh TRƯỚC / SAU thay đổi menu**:
  - Không tạo một thẻ tách biệt gây hổng UI. Thay vào đó, nó là một **Marker Đính Kèm (Badge & Banner)** xuất hiện trực tiếp trong Biểu đồ Trend.
  - Chủ quán nhấn "Đánh dấu đổi menu", hệ thống đánh dấu Timestamp và tự sinh bảng so sánh hiệu suất chênh lệch 7 ngày Trước/Sau.

### Hàng 3: Micro Analysis - Kênh Nhặt Món & Bảng Xếp Hạng
Được tách rõ làm 2 khối phục vụ 2 tư duy hoàn toàn khác biệt nhưng bổ trợ cho nhau:

1. **Khối Trái (40%): Phễu Khám Phá Đầu Tiên**
   - Đo lường sức hút của từng Module (Best Seller, Combo, Menu chính...).
   - Hiển thị tỷ trọng (Lượt Chọn Món Đầu) giúp nhận diện rõ UI nào đập vào mắt khách hiệu quả nhất.

2. **Khối Phải (60%): Bảng Xếp Hạng Món Gợi Ý O2O**
   - Xếp hạng Top Doanh Thu của các món ăn.
   - Đối chiếu theo TÊN KÊNH CHỐT SALE.
   - Trả lời câu hỏi: Món nào đang hot? Và rốt cuộc nó hot là do tự ngon (lướt menu tự nhiên) hay nhờ chạy Flash Sale / Combo?

### Luồng Dữ Liệu (Data Pipeline)

| Mốc | Nguồn dữ liệu | Sẵn có? |
|-----|---------------|---------|
| T0 (Vào bàn) | `session_presences.joined_at` | ✅ Có sẵn |
| T1 (Thêm món đầu tiên) | MIN(`cart_items.created_at`) theo `user_id` + `table_session_id` | ⚠️ Cần bổ sung `created_at` vào `cart_items` |
| T2 (Gửi đơn đầu tiên) | MIN(`order_rounds.created_at`) theo `user_id` + `table_session_id` | ✅ Có sẵn |
| Source | `cart_items.source` (khi thêm vào giỏ) | ⚠️ Cần bổ sung cột `source VARCHAR` vào `cart_items` |
| Ordering Behavior | `order_rounds`, `order_items`, `table_sessions` | ✅ Có sẵn (chỉ cần aggregate query) |

**Kết luận kỹ thuật:** Cần bổ sung 2 cột vào `cart_items`: `created_at BIGINT` và `source VARCHAR`. Toàn bộ metric còn lại đều tính được từ dữ liệu hiện có.

---

## Nguyên tắc Thiết kế Xuyên suốt

### 1. Mỗi Deck = 1 Tần suất Quyết định

| Deck | Tần suất | Đối tượng |
|------|---------|-----------|
| DECK 1 | Mỗi 5 phút | Quản lý ca, Trưởng bếp |
| DECK 2 | Cuối ca / Mỗi ngày | Quản lý ca, Chủ quán |
| DECK 3 | Mỗi tuần | Chủ quán, Giám đốc chuỗi |
| DECK 4 | Mỗi tháng | Chủ quán, Phòng CX |
| DECK 5 | Sau mỗi đổi menu | Chủ quán, Product Manager |

### 2. Hệ thống Liên kết Xuyên Deck (Cross-Deck Linkage)
Các Deck không tồn tại độc lập. Chúng tạo thành chuỗi **Nhân — Quả**:

```
DECK 5: Menu khó chọn (T_browse tăng)
  ↓ dẫn tới
DECK 3: Số lượt gọi giảm, O2O Rate giảm
  ↓ dẫn tới  
DECK 2: Bếp nhàn (ít đơn) nhưng doanh thu vẫn tệ
  ↓ dẫn tới
DECK 4: Khách phàn nàn "Menu khó tìm" hoặc bỏ đi không đánh giá (Low response rate)
```

```
DECK 2: Bếp tắc nghẽn (SLA Chế biến vượt ngưỡng)
  ↓ dẫn tới
DECK 1: Bếp Tồn Đơn nhấp nháy đỏ
  ↓ dẫn tới
DECK 4: Khách phàn nàn "Chờ lâu" (RCA: 43%)
  ↓ dẫn tới
DECK 3: Khách giảm (churn do trải nghiệm tệ)
```

### 3. Quy tắc "Không Có Số Xuông" (No Vanity Metrics)
Mỗi con số trên Dashboard phải kèm theo ít nhất 1 trong 3 yếu tố:

| Yếu tố | Ví dụ |
|---------|-------|
| **So sánh với mục tiêu** | SLA Chế biến: 16.5p / Mục tiêu: 15p |
| **So sánh với kỳ trước** | Doanh thu: +12% so với tuần trước |
| **Ngưỡng cảnh báo** | Drop-off > 10% → Đỏ. T_browse tăng > 15% → Đỏ |

### 4. Quy tắc Cảnh báo (Alert Escalation)

| Cấp | Biểu hiện UI | Điều kiện |
|-----|-------------|-----------|
| **Xanh / Xám** | Số tĩnh, nền trắng | Chỉ số trong ngưỡng bình thường |
| **Vàng** (Chú ý) | Badge vàng, text amber | Vi phạm nhẹ hoặc xu hướng giảm nhẹ |
| **Đỏ** (Can thiệp) | Nền đỏ, text trắng, pulse dot | Vi phạm nặng, cần hành động ngay |

### 5. Quy tắc Về Dữ liệu Mock
Khi `restaurant_id === 'demo-mock'`, toàn bộ 4 API Dashboard bypass database và trả về JSON tĩnh từ `src/data/mock-dashboard.ts`. Mục đích: cho phép review giao diện mà không cần dữ liệu thực.

---

## Bản đồ API Dashboard

| API Endpoint | Deck | Polling | Mô tả |
|-------------|------|---------|-------|
| `/api/admin/dashboard/live-pulse` | D1 | 15s | Cảnh báo tức thì (bếp tồn, bàn bỏ quên, hết món) |
| `/api/admin/dashboard/table-occupancy` | D1 | 15s | Mật độ bàn, khách, thời gian lưu trú |
| `/api/admin/dashboard/sla-metrics` | D1 + D2 | 15s (D1) / on-load (D2) | Pipeline SLA 4 trạm + End-to-end |
| `/api/admin/dashboard/analytics` | D2 + D3 | on-load | Trend, Peak Hours/Days, KPIs, Suggested Items |
| `/api/admin/dashboard/menu-efficiency` | D5 | on-load | *Kế hoạch — chưa triển khai* |

---

*File này là tài liệu gốc quy định kiến trúc Dashboard. Mọi thay đổi về thành phần, layout, hoặc metric trên Dashboard đều phải cập nhật tài liệu này trước khi triển khai code.*
