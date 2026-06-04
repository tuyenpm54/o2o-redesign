# Logic Menu: Cá nhân hóa & Nhận diện Ngữ cảnh

Trang Menu điều chỉnh giao diện và nội dung dựa trên thời gian, lịch sử người dùng và quy mô nhóm để tạo ra trải nghiệm "Pro Max" cao cấp.

## 1. Chủ đề theo Thời điểm trong ngày (Time-of-Day Themes)
Hook `useMenuContext` xác định `TimeOfDay` (`morning`, `noon`, `afternoon`, `evening`) và áp dụng một chủ đề tương ứng:
- **Buổi sáng (Morning)**: Tông màu cam ấm áp, tập trung vào bữa sáng/cà phê.
- **Buổi trưa (Noon)**: Tông màu trắng/xanh sạch sẽ, tập trung vào bữa trưa nhanh/combo.
- **Buổi chiều (Afternoon)**: Tông màu xanh lá/xám mềm mại, tập trung vào đồ ăn nhẹ/trà.
- **Buổi tối (Evening)**: Chế độ tối (Dark mode), tập trung vào nướng/lẩu/đồ uống.

Chủ đề ảnh hưởng đến:
- Màu nền và gradient.
- Sắp xếp danh mục (ví dụ: Đồ uống được ưu tiên vào buổi sáng).
- Màu sắc điểm nhấn (Accent colors).
- Thông điệp chào hỏi.

## 2. Trợ lý Khám phá (Discovery Wizard - Onboarding)
Được kích hoạt trong lần đầu tiên truy cập vào một phiên làm việc của bàn:
1. **Quy mô nhóm**: Hỏi số lượng người để xác định xem có nên bật "Chế độ nhóm" hay không.
2. **Sở thích**: Thu thập sở thích hương vị (Cay, Chay, v.v.) để làm nổi bật các thẻ món ăn phù hợp trong thực đơn.
3. **Ghi nhớ phiên**: Sau khi đóng, trợ lý sẽ không hiển thị lại trong suốt thời gian của phiên làm việc đó (`sessionStorage`).

## 3. Thanh tìm kiếm Sinh động (Animated Search Placeholder)
Thanh tìm kiếm có hiệu ứng máy đánh chữ chạy qua các cụm từ:
- **Dựa trên lịch sử**: *"Bạn vẫn muốn dùng [Món yêu thích của người dùng] chứ?"* (nếu có lịch sử).
- **Dựa trên thời gian**: *"Trưa nay bạn muốn ăn gì?"*.
- **Dựa trên khám phá**: *"Thử thực đơn Pizza mới của chúng tôi..."*.

## 4. Chế độ Nhóm (Group Mode)
Nếu `groupSize >= 4`:
- Giao diện người dùng sẽ thêm phần "Combo Nhóm Ngon Nhất" ở trên cùng của danh sách danh mục.
- Logic gợi ý ưu tiên các món ăn có số lượng lớn.

## 5. Trạng thái Nghỉ (Inactivity State - Trạng thái Trống)
- Nếu người dùng không tương tác với màn hình trong **10 giây** VÀ không có đơn hàng đang hoạt động, thanh tìm kiếm sẽ chuyển sang trạng thái "Tìm kiếm Trống" lớn, nằm ở giữa màn hình để khuyến khích người dùng bắt đầu duyệt món.
- Bất kỳ thao tác chạm/cuộn nào sẽ ngay lập tức đặt lại bộ đếm thời gian và khôi phục bố cục chuẩn.
