# Phân Tích Thiết Kế Giao Diện (Phase 1): Admin Dashboard

**Screen Name:** `/admin/dashboard`
**Goal:** Trực quan hóa dữ liệu Vận hành (Operations) & Kinh doanh (Business) theo chuẩn O2O cho 2 nhóm quyền (Brand vs Store).

---

## 1. Phát hiện Bối cảnh (Context Vectors)

- **Page type:** Dashboard / Analytics.
- **Device:** Đa nền tảng. Tuy nhiên Store Manager thao tác (nhìn màn hình Alert) chủ yếu trên Tablet/Desktop tại quầy. Brand Manager dùng Desktop.
- **User role:** 
  - *Store Manager*: Nhìn cục bộ 1 cửa hàng.
  - *Brand Manager*: Nhìn toàn Chuỗi (All stores).
- **Data state:** Cần xử lý cả 5 trạng thái: Đang load, Trống (Chưa có đơn), Báo lỗi (Mất kết nối live), Chế độ Giảm tải (Data lag), và Đầy đủ.
- **User intent:** Giám sát (Monitor), Phát hiện lỗi (Troubleshoot), và Báo cáo (Review).
- **Flow stage:** Sử dụng hàng ngày, tần suất nhìn màn hình liên tục để giám sát nhịp điệu quán (Dành cho Store).
- **Runtime context:** Áp lực thời gian cao (Rush hour) $\rightarrow$ Yêu cầu sự chú ý tức thì khi có biến cố (Màu sắc phải mang tín hiệu).

---

## 2. Chiến lược Nội dung (Content Priority Analysis)

Dựa theo Role, màn hình này tự động thay đổi ma trận phân bổ sự chú ý, nhưng tổng quát:

### 🔴 Critical (Quan trọng Tối cao - Bắt buộc phải nhìn thấy)
1. **Live Pulse Alerts (Cảnh báo nháy đỏ)**: Bếp trễ > 15ph, Bàn đợi dọn dẹp, Bàn gọi hỗ trợ quá giờ.
2. **Bộ Lọc Branch Selector (Dành cho Brand Manager)**: Trình chuyển đổi góc nhìn (Từ 1 chi nhánh thành Toàn hệ thống).

### 🟡 Important (Rất quan trọng - Cột trụ của nội dung)
1. **Today's Metric Summary (Cards)**: AOV Uplift, O2O Adoption Rate, Số đơn bán ra.
2. **Vấn đề hủy món (Stock-out / Cancel Rate)**: Báo động sớm sai sót vận hành.

### 🔵 Supportive (Bổ trợ - Phục vụ phân tích sâu)
1. **Biểu đồ GMV / Nhịp độ bán (Sparklines)**: Trực quan hóa lưu lượng theo thời gian (Timeline).
2. **Table Turn-around Time**: Tốc độ xoay lấp bàn trung bình.

### ⚪ On-demand (Hiển thị khi cần - Ẩn mặc định)
1. **Lịch sử cảnh báo / Log chi tiết**: Click vào thẻ "Bếp trễ" mới mở ra modal coi chính xác Bàn nào / Món nào bị kẹt.
2. **Bộ lọc Ngày tháng nâng cao (Date Picker)**: Mặc định là Khung `Hôm nay (Today)`, các mốc `Tuần / Tháng` chỉ bung ra khi click.

---

## 3. Lý Luận Thiết Kế (Design Philosophy Justification)

- **Visual Hierarchy (Phân cấp thị giác):** Critical (Cảnh báo KDS) sẽ chiếm diện tích lớn nhất (hoặc nổi bật nhất về màu sắc - đỏ/cam) trong layout nếu có lõi. Nếu hệ thống bình thường, chúng sẽ nhường lại 1/3 màn hình cho Metric Cards.
- **Context Congruency (Tương thích ngữ cảnh):** Khi Brand Admin chọn "Tất cả chi nhánh", Layout sẽ ưu tiên (phóng to) các chỉ số AOV, O2O Adoption. Ngược lại, khi View 1 nhà hàng cụ thể, các Widget tĩnh (Metrics) bị ép nhỏ xuống, nhường chỗ bự nhất cho **Bảng Live Pulse Alert**.
- **Cognitive Load Theory (Giảm tải nhận thức):** Dùng UI Sparklines (đường cong tối giản không mang trục nhãn phức tạp) thay vì Biểu đồ nặng để user đọc được *Trend* tăng/giảm trong nháy mắt mà không bị mỏi mắt giữa giờ làm hối hả.
