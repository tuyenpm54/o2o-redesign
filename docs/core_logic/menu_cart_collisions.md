# Logic Menu: Giỏ hàng, Xung đột & Bán chéo

Logic giỏ hàng được thiết kế để tối ưu hóa việc ăn uống theo nhóm bằng cách ngăn chặn các đơn hàng trùng lặp và gợi ý các món ăn bổ trợ.

## 1. Hệ thống Nhận diện Xung đột

Hệ thống phân biệt giữa hai loại xung đột để đưa ra các cảnh báo phù hợp theo ngữ cảnh.

### A. Xung đột khi đang chọn (Drafting Collision - Đang thực hiện)
- **Kích hoạt**: Mở modal chi tiết món ăn.
- **Cơ chế**: Client gửi một tín hiệu "đang chọn" (drafting) tới server.
- **Ngăn chặn**: Nếu **Người dùng A** cố gắng thêm "Phở Bò" trong khi **Người dùng B** đã mở modal "Phở Bò", hệ thống sẽ hiển thị một thông báo toast: *"[Người dùng B] đang chọn món này, vui lòng đợi."*
- **Mục đích**: Ngăn chặn việc hai người vô tình đặt cùng một món ăn cụ thể vào cùng một thời điểm.

### B. Xung đột khi đơn hàng đã xác nhận
- **Kích hoạt**: Nhấn "Thêm vào giỏ" hoặc "Đặt món ngay".
- **Kiểm tra**: Client quét danh sách `tableMembers.confirmedOrders` để tìm tên món tương ứng.
- **Cảnh báo**: Nếu tìm thấy, một modal (`collisionData`) sẽ xuất hiện hiển thị ai khác đã đặt món đó và số lượng bao nhiêu: *"X đã đặt món này rồi, bạn có chắc muốn gọi thêm không?"*
- **Lựa chọn**: Người dùng có thể chọn "Xác nhận thêm" hoặc "Hủy".

## 2. Bán chéo thông minh (Smart Cross-Selling)
Hệ thống sử dụng một logic gợi ý đơn giản nhưng hiệu quả:
- **Điều kiện**: Người dùng thêm "Món chính" (`category: 'Món Chính'` hoặc `'Lẩu & Nướng'`).
- **Kiểm tra**: Hệ thống kiểm tra xem đã có "Đồ uống" nào trong giỏ hàng chưa.
- **Hành động**: Nếu không tìm thấy đồ uống, một ngăn kéo gợi ý (`crossSellData`) sẽ đề xuất 3 loại đồ uống phổ biến nhất.
- **Giới hạn**: Thông báo này chỉ hiển thị một lần duy nhất trong mỗi phiên làm việc (`sessionStorage: 'cross_sell_shown'`).

## 3. Đồng bộ Số lượng
- Giao diện giỏ hàng sử dụng `getItemQuantity(id)` để hiển thị tổng số lượng của một món trong giỏ hàng trên tất cả các biến thể của nó (ví dụ: "Phở - Không hành" và "Phở - Thêm cay" đều góp phần vào tổng số lượng "Phở" trong danh sách).
- Việc xử lý biến thể rất nghiêm ngặt: nếu người dùng chỉnh sửa một món và thay đổi các lựa chọn, biến thể cũ sẽ bị xóa và biến thể mới sẽ được thêm vào để đảm bảo việc tính hóa đơn chính xác.
