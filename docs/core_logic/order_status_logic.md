# Order Lifecycle & SLA Status Logic

Tài liệu này định nghĩa cách hệ thống suy diễn trạng thái chung của một "Lượt gọi món" (Order Round) dựa trên trạng thái của các "Món ăn" (Order Items) bên trong nó.

## 1. Cấu trúc Hierarchy Trạng thái

Tiến trình của một đơn hàng luôn đi một chiều từ `1 -> 5`. Trạng thái của "Lượt gọi món" sẽ ưu tiên lấy trạng thái cao nhất mà bất kỳ món ăn nào trong lượt đó đạt được.

1. **Chờ xác nhận (Pending)**
2. **Đã xác nhận, chờ bếp (Confirmed)** 
3. **Bếp đang chế biến (Cooking)**
4. **Đã chế biến xong, chờ phục vụ (Ready)**
5. **Đã lên món (Served)**

---

## 2. Quy tắc Nội suy Trạng thái Lượt gọi (Round Status)

### a. Chờ xác nhận (Pending)
- **Bản chất:** Trạng thái khi User vừa gửi Order lên hệ thống. Chưa có nhân viên hay thu ngân nào duyệt.
- **Quy tắc:** Đây là trạng thái gốc của *cả lượt gọi*. Lúc này toàn bộ các món bên trong đều đang ở trạng thái `Pending`. Không có sự phân hóa.
- **Giao diện:** Hiển thị "Chờ xác nhận", icon cam.

### b. Đã xác nhận, chờ bếp nấu (Confirmed)
- **Bản chất:** Nhân viên đã xác nhận đơn nhưng bếp *chưa bắt tay vào làm bất kỳ món nào*.
- **Quy tắc:** Trạng thái này áp dụng cho *cả lượt gọi* (khi toàn bộ món đã được duyệt nhưng chưa mảy may đổi trạng thái sang "Cooking").
- **Giao diện:** Hiển thị "Đã chốt đơn", icon xanh lục.

### c. Bếp đang chế biến (Cooking)
- **Bản chất:** Bắt đầu có sự phân hóa trạng thái từng món. Bếp có thể đang nấu món A, nhưng chưa động tới món B.
- **Quy tắc (Trọng số ưu tiên):** Chỉ cần **CÓ ÍT NHẤT 1 MÓN** trong lượt gọi chuyển sang trạng thái "Đang chế biến", thì **TOÀN BỘ LƯỢT GỌI** được xem là "Đang được chế biến".
- **Giao diện:** Hiển thị "Đang chế biến 🔥 [Số món đang nấu]/[Tổng số món]". Bỏ qua cảnh báo trễ của các món "Đã xác nhận" chưa làm.

### d. Chờ mang ra phục vụ (Ready)
- **Bản chất:** Bếp đã làm xong món, đặt ra quầy pass, chờ chạy bàn mang ra.
- **Quy tắc:** Tương tự như Cooking. Chỉ cần **CÓ ÍT NHẤT 1 MÓN** trong lượt gọi "Đã chế biến xong", trạng thái của lượt gọi sẽ là "Chờ phục vụ" (ngay cả khi bếp vẫn đang nấu các món khác cùng lượt).
- **Giao diện:** Hiển thị "Sắp mang ra bàn", icon xanh biển.

---

## 3. SLA & Quy tắc Báo Trễ (Delay Warnings)

- Trạng thái chung (General Status) của Lượt gọi sẽ quyết định nó được áp dụng logic tính Trễ (Delay SLA) của giai đoạn nào.
- **Thời gian bắt đầu tính trễ (Base Time):** Thời gian để tính độ trễ của một trạng thái X phải luôn luôn là **thời điểm món ăn đó được chuyển sang trạng thái X** (tức là `status_updated_at`), CHỨ KHÔNG ĐƯỢC dùng thời điểm ban đầu order (`timestamp`).
  - *Ví dụ:* Món ăn Order lúc 10:37. Bếp bấm Nhận lúc 11:27. Độ trễ của quá trình nấu phải tính từ 11:27. Nếu giới hạn nấu là 15 phút, thì tới 11:42 mới bị coi là quá hạn. 
- **Nguyên tắc ngắt cảnh báo:** Nếu Lượt gọi đã tiến sang Phase 3 (Đang nấu), thì cảnh báo trễ của Phase 2 (Đã xác nhận quá 5p) sẽ KHÔNG ĐƯỢC PHÉP ghi đè lên UI của Phase 3. Lượt gọi đó sẽ chỉ hiện "Trễ" nếu chính quy trình "Đang nấu" bị quá hạn SLA.

*File này được tạo tự động nhằm ghi nhớ quy tắc nghiệp vụ hệ thống. Hãy đối chiếu file này mỗi khi sửa chữa logic của `OrderHubCard` và `table-orders`.*

---

## 4. Trạng thái Bàn Trống (Empty Table State)
- **Quy tắc hiển thị Khối trạng thái (`OrderHubCard`):** Khối lượng thông tin của `OrderHubCard` chỉ có giá trị khi bàn **đã bắt đầu ghi nhận gọi món** (đã tồn tại ít nhất 1 Lượt gọi - `hasOrders`).
- **Trạng thái Trống (Empty):** Khi khách mới ngồi vào bàn và chưa gọi bất kỳ món nào (`activeOrders.length === 0`), hệ thống sẽ **ẨN HOÀN TOÀN** `OrderHubCard` để giải phóng không gian màn hình, nhường chỗ cho công cụ Tìm kiếm Món ăn (Search Bar) - giúp định hướng ngay lập tức hành động tham khảo và order của người dùng.
