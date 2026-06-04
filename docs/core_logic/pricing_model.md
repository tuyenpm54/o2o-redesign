# O2O Pricing Strategy & Business Model

*Tài liệu này định nghĩa mô hình kinh doanh và chiến lược định giá của hệ thống O2O, phục vụ làm kim chỉ nam cho việc thiết kế trang Landing Page (Pricing Section) và định hướng đội ngũ Sales.*

## 1. Tư duy Định vị Sản phẩm (Core Philosophy)

### Không bán "Giải pháp cắt giảm nhân sự"
- Ở Việt Nam, chi phí nhân sự F&B khá rẻ. Việc hứa hẹn cắt giảm 1 nhân viên không thực tế vì phần mềm không thể thay con người bưng bê thức ăn hay dọn bàn.
- Việc tính giá theo thao tác (Usage-based/Action-based) tạo ra tâm lý "sợ phát sinh chi phí", đi ngược lại thói quen "thích trọn gói" của doanh nghiệp F&B Việt Nam.
- Quán vắng thì O2O bị lỗ cơ hội, quán đông thì nhà hàng phản đối vì chi phí phần mềm tăng vọt.

### Bán "Bộ nhân năng suất" (Productivity Multiplier)
- **Tối ưu Vận hành:** Giải quyết điểm nghẽn giờ cao điểm (Peak-hour overload), xóa bỏ "thời gian chết" của nhân viên khi phải đứng đợi khách chọn món, và giảm triệt để tỷ lệ sai sót order (do khách note phức tạp).
- **Cỗ máy in tiền (Sales Machine):** Tăng giá trị trung bình đơn hàng (AOV) thông qua các tính năng UI tự động Upsell (Smart Suggestions, Flash Sales) — công cụ tư vấn không biết mệt mỏi và không e ngại như nhân viên người thật.

## 2. Bảng Giá Đề Xuất (Subscription Tiers)

Mô hình định giá áp dụng theo hướng **Tính năng & Chi nhánh (Feature & Branch-based Pricing)**. Cách này giúp bao phủ toàn bộ 3 mô hình kinh doanh (Dine-in, Trả trước tại bàn, Nhận tại quầy) mà không bị phụ thuộc vào số lượng bàn (đặc biệt giải quyết được cho quán Takeaway/Foodcourt).

### 🌱 Gói ESSENTIAL (Vận hành Cốt lõi)
*Định vị: Dành cho quán nhỏ lẻ (1 chi nhánh), muốn giải quyết bài toán sai sót order và quá tải giờ cao điểm.*
- **Chi phí:** **299.000 VNĐ / tháng** (~10.000đ/ngày)
- **Quy mô:** Tối đa 1 Chi nhánh.
- **Tính năng được bật:**
  - Menu điện tử quét mã QR (cho cả bàn và quầy).
  - Khách tự order thẳng vào màn hình bếp (Order Hub).
  - Khách tự nhấn "Gọi nhân viên" & "Gọi thanh toán".
  - Báo cáo chốt ca (Doanh thu cuối ngày cơ bản).
- **Pain point giải quyết:** Số hóa quy trình order, chống nhầm lẫn món.

### 🚀 Gói GROWTH (Tăng Doanh Thu) - 👑 BEST SELLER
*Định vị: Dành cho nhà hàng / quán Cafe đầu tư bài bản, mong muốn tăng doanh thu tự động.*
- **Chi phí:** **599.000 VNĐ / tháng**
- **Quy mô:** Tối đa 1 Chi nhánh.
- **Tính năng được bật (Bao gồm Gói Essential + Các Module Sinh Lời):**
  - **Smart Suggestions:** Trí tuệ nhân tạo gợi ý món ăn kèm để Upsell.
  - **Flash Sales & Promotion:** Hiển thị dải băng khuyến mãi giờ vàng.
  - **Bill Discount Progress:** Thanh tiến trình khuyến khích mua thêm để nhận thưởng.
  - **ProMax Analytics Dashboard:** Báo cáo phân tích chuyên sâu (Hiệu suất bếp, Tỷ lệ chốt đơn từ menu, Phân tích điểm chạm khách hàng).
- **Pain point giải quyết:** Tăng kích thước giỏ hàng (AOV), soi điểm nghẽn vận hành qua Dashboard trực quan.

### 🏢 Gói ENTERPRISE (Giải Pháp Chuỗi)
*Định vị: Dành cho chuỗi F&B lớn, cần may đo tính năng và tích hợp hệ thống nội bộ.*
- **Chi phí:** **Liên hệ / Thỏa thuận (Custom Pricing)**
- **Quy mô:** Không giới hạn số lượng chi nhánh.
- **Đặc quyền & Tính năng cao cấp:**
  - **Tất cả tính năng của gói GROWTH.**
  - **Custom Integration:** Tích hợp API qua phần mềm Kế toán (MISA), phần mềm ERP hiện hữu, hóa đơn điện tử.
  - **Quản trị đa chi nhánh tập trung:** Đồng bộ Menu, giá bán, chương trình khuyến mãi một chạm cho toàn chuỗi.
  - **Hệ thống Loyalty Xuyên suốt:** Tích điểm, đổi điểm liên thông giữa các chi nhánh.
  - **White-label UI:** Giao diện đặt món tùy biến riêng 100% theo nhận diện thương hiệu.
  - **Dịch vụ SLA:** Cam kết uptime 99.9%, có chuyên viên hỗ trợ (Account Manager) riêng.

## 3. Chiến lược Thanh Toán & Chốt Sale (Billing Tactics)

- **Chu kỳ thanh toán:** Chỉ áp dụng hợp đồng trả trước 6 tháng hoặc 12 tháng (tránh rủi ro hủy ngang và tiết kiệm chi phí thu tiền lẻ).
- **Ưu đãi chốt Sale (Yearly Billing):**
  - Đóng 12 tháng: **Tặng thêm 2 tháng sử dụng**.
  - Tặng kèm chi phí in ấn Mã QR Acrylic (Standee để bàn) chất lượng cao miễn phí cho gói 12 tháng. Đây là chi phí phần cứng rẻ nhưng có giá trị chốt sale về mặt cảm xúc rất lớn (Turn-key solution - Khách hàng không cần làm gì thêm).
