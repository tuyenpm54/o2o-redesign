# Bảng Core Logic Dashboard Hệ thống O2O (Vận hành & Tối Ưu)

Tài liệu này định nghĩa chi tiết công thức toán học (metrics math), thuật toán (algorithms) và phân bổ quyền (RBAC) của trang Dashboard trên giao diện Admin (`/admin/dashboard`).

---

## 1. Role-Based Access Control (RBAC)
- **Brand Admin (Chủ chuỗi):** Được xem 100% các cửa hàng. Giao diện mặc định là "Tất cả chi nhánh" (Overall). Ưu tiên xem Section (2) - Hiệu quả mang lại. Có bộ lọc dropdown rẽ nhánh sang xem cụ thể từng cửa hàng.
- **Store Admin (Quản lý cửa hàng):** Chỉ xem được dữ liệu cố định của nhà hàng mình quản lý (`res_id`). Khi load trang, hệ thống ẩn Section 2 (hoặc thu nhỏ tùy mức độ quyền), phóng to Section (3) - Cảnh báo vận hành. Không có thanh lọc chi nhánh.

---

## 2. Định nghĩa Core Logic Các Chỉ Số (Metrics Definition)

### 2.1 Mức độ Sử dụng (Adoption & Usage Metrics)
| Tên hiển thị | Ý nghĩa | Công thức Dataset Postgres (`db.ts`) |
| --- | --- | --- |
| **O2O Adoption Rate** | Tỷ lệ người dùng tự quét mã gọi món thành công thay vì gọi nhân viên | `Count(Đơn hàng qua hệ thống O2O)` / `Tổng số Invoices` * 100 |
| **Drop-off Rate (Tỷ lệ bỏ giỏ)** | Phát hiện UI/UX quét mã bị lỗi/rắc rối | Tính từ Session: `Count(KH có mở giỏ hàng nhưng không có Order Round nào)` / `Count(Tổng số Active Sessions)` * 100 |

### 2.2 Hiệu quả Đem Lại (Effectiveness)
| Tên hiển thị | Ý nghĩa | Công thức Dataset Postgres (`db.ts`) |
| --- | --- | --- |
| **AOV Uplift (Tăng trưởng Bill)** | Chênh lệch giá trị Bill O2O vs Gọi chay | (So sánh AOV của Hóa đơn O2O với Baseline hoặc kỳ trước). AOV = `Sum(invoices.total) / Count(invoices.id)` |
| **Cross-sell Hit Rate** | Hệ thống Smart Suggestion có "Lùa" được khách không? | `Count(Các item_id nằm trong thuật toán Suggestion được mua)` / `Tổng số Order Items` * 100 |
| **Table Turn-around Time** | Bàn trống nhanh hơn (Tăng năng suất) | Mức trung bình của `(table_sessions.ended_at - table_sessions.started_at)` |

### 2.3 Cảnh Báo Vận Hành - Realtime Alerts (Operation Bottlenecks)
> Cụm Logic này yêu cầu query Real-Time hoặc Polling rất ngắn (vd 10s/lần). Dành cho Store Admin.

| Tên hiển thị (Widget) | Thuật toán Trigger | Hành động (Actionable fix) |
| --- | --- | --- |
| **🔴 Bếp Trễ (Kitchen Lag)** | Quét bảng `order_items` (kết hợp `order_rounds`). Bất kỳ `item` nào có `status` là `Đang nấu/Chờ xác nhận` quá **15 phút**. | Hiện pop-up Ping Bếp. Quản lý trực tiếp xin lỗi khách. |
| **🔴 Yêu Cầu Bị Bỏ Quên** | Quét bảng `chat_messages` (Type `support`). Bất kỳ Request nào trạng thái `<> Đã Xong` quá **5 phút**. | Alert âm thanh trên màn hình Quản lý đỏ rực. |
| **🔴 Tỷ Lệ Đứt Gãy (Hủy món)** | `Count(order_items có status = 'Hủy/Hết món')` / `Count(Tổng items)`. Vượt mức **5%** trong ca. | Quản lý phải vào kho / App tắt món ngay lập tức. |

---

## 3. Cấu trúc Database Fetching Strategy

Trang Dashboard bản chất là đọc dữ liệu từ DB thay vì Mutate. Ta thiết kế 2 Service APIs:

1. **`GET /api/admin/dashboard/summary`**: Fetch số liệu tổng quát trong khoảng DateRange. (Tần suất cache: 5 phút).
2. **`GET /api/admin/dashboard/live-pulse`**: Endpoint độc lập siêu nhẹ chuyên trả về số lượng cảnh báo đỏ cho Store Level. (Tần suất polling: 10 giây/lần). Không Query JOIN sâu, chỉ chạy COUNT() nhanh.
