# Product Requirements Document (PRD): AI Gastronomer Consultant

**Status**: Draft
**Date**: 2026-01-29
**Project**: O2O-Redesign / Biển Đông Kitchen
**Feature**: Interactive AI Onboarding & Smart Recommendations

## 1. Mục tiêu (Objectives)
Chuyển đổi trải nghiệm gọi món từ việc tự tra cứu menu sang một hành trình được "tư vấn cá nhân hóa" bởi hệ thống Chuyên gia ẩm thực ảo (AI Gastronomer). Mục tiêu là nâng tầm dịch vụ, giảm thời gian lựa chọn và tăng khả năng up-sell các món Specialty/Signature của nhà hàng Biển Đông.

## 2. Luồng trải nghiệm người dùng (The Experience Flow)

### Bước 1: Kích hoạt tư vấn
Màn hình chào đón: "Chào bạn! Tôi là chuyên gia tư vấn món của Biển Đông. Để bữa tiệc trọn vẹn nhất, bạn hãy dành 20 giây để tôi hiểu hơn về nhu cầu của bàn mình nhé."

### Bước 2: Bộ câu hỏi chuyên sâu (The Expert Consult)
1.  **Quy mô bàn tiệc**: Chọn các gói combo định sẵn:
    *   `1 - 2 người` (Hẹn hò/Solo)
    *   `4 - 6 người` (Gia đình/Nhóm bạn)
    *   `8 - 10 người` (Liên hoan/Đại tiệc)
2.  **Nhu cầu & Lưu ý đặc biệt (Multi-select)**:
    *   [ ] `Có trẻ em` -> Kích hoạt gợi ý món Kids-friendly.
    *   [ ] `Không ăn hành/tỏi` -> Đánh dấu các món có thể điều chỉnh.
    *   [ ] `Dị ứng Hải sản` -> Cảnh báo các món Seafood.
    *   [ ] `Dị ứng Hạt` -> Cảnh báo các món có lạc, vừng.
    *   [ ] `Đồ uống lạnh sẵn` -> Ưu tiên beer/soft drink.

### Bước 3: Trình diễn thực đơn cá nhân hóa (Expert Showcase)
Hệ thống hiển thị menu phân cấp theo chiều ngang (Horizontal Scroll):
*   **"Dành riêng cho nhóm bạn"**: Các món/Combo khớp với số người và lưu ý (ví dụ: Món không hành nếu chọn "Không ăn hành").
*   **"Gợi ý từ nhà hàng"**: Các tag `[Món mới]`, `[Bán chạy]`, `[Signature]`.
*   **"Yên tâm cho bé táo"**: Chỉ xuất hiện nếu tick vào "Có trẻ em".

## 3. Các yêu cầu chức năng (Functional Requirements)

### 3.1 Giao diện Wizard (Onboarding UI)
*   **Step 1**: Grid card chọn số người với icon trực quan.
*   **Step 2**: List checkbox/chips cho các lưu ý đặc biệt, sắp xếp khoa học.
*   **Interaction**: Hiệu ứng chuyển động slide-left khi hoàn thành mỗi bước.

### 3.2 Logic gợi ý & Hiển thị (Display Engine)
*   **Smart Tagging**: Mỗi món ăn hiển thị lý do được chọn (ví dụ: "Phù hợp trẻ em", "Đang là xu hướng").
*   **Horizontal Sections**: Sử dụng Carousel để duy trì sự gọn gàng nhưng vẫn giới thiệu được nhiều món.
*   **VIP Card Summary**: Hiển thị text summary sinh động về lựa chọn của khách.

## 3. Các yêu cầu chức năng (Functional Requirements)

### 3.1 Giao diện Wizard (Onboarding UI)
*   Sử dụng phong cách thiết kế **Pearl & Saffron** (nền kem ngọc trai, điểm nhấn vàng nghệ tây).
*   Mỗi bước chọn có Progress Bar hiển thị tiến độ.
*   Nút "Bỏ qua" (Skip) dành cho khách đã quen thuộc hoặc không muốn tư vấn.

### 3.2 Logic gợi ý (Recommendation Engine)
*   **Logic lọc cứng (Hard Filter)**: Nếu chọn "Dị ứng hải sản", tất cả món có tag "Seafood" sẽ bị làm mờ hoặc ẩn cảnh báo.
*   **Logic ưu tiên (Soft Prioritization)**: Nếu chọn "Tiếp khách", các món có tag "Signature" hoặc giá trị cao sẽ được ưu tiên lên trước.
*   **Logic ghép cặp (Pairing)**: Nếu có Trẻ em, ưu tiên các món "Nons-picy" và "Kids-friendly".

### 3.3 Hệ thống Tag món ăn (Smart Tags)
Danh sách các Tag cần quản lý:
*   `Occasion`: Dating, Business, Family, Party.
*   `Diet`: Vegetarian, Nut-free, Seafood-free, Spicy.
*   `Style`: Fresh, Bold, Traditional.

## 4. UI/UX Design Directives
*   **Typography**: Poppins cho tiêu đề (sang trọng), Open Sans cho nội dung (dễ đọc).
*   **Animation**: Chuyển cảnh mềm mại giữa các bước thu thập thông tin (slide hoặc fade-in).
*   **Status**: Menu hiển thị rõ thông báo "Menu đã được cá nhân hóa cho bàn [X] người".

## 5. Chỉ số đo lường hiệu quả (Success Metrics - KPIs)
*   **Engagement Rate**: Tỷ lệ người dùng hoàn thành 4 bước tư vấn.
*   **Order Success**: Tỷ lệ đặt đúng món được AI gợi ý trong phần "Top Picks".
*   **Average Order Value (AOV)**: Tăng giá trị đơn hàng nhờ các món Specialty được đẩy ra đúng đối tượng.
