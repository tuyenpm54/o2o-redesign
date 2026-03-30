# Order & Support Status State Machines

Mô tả luồng trạng thái (State Flow) được giả lập bên phía Client (`src/app/customer/page.tsx` và `src/app/customer/preview/page.tsx`) thông qua `setTimeout`.

## 1. Vòng đời Đặt món (Order Flow)

```mermaid
stateDiagram-v2
    [*] --> PENDING : Khách hàng bấm "Xác nhận Đặt"
    
    PENDING --> CONFIRMED : Delay 5 giây\n(Nhà hàng xác nhận)
    CONFIRMED --> COOKING : Delay 5 giây\n(Bếp bắt đầu nấu)
    COOKING --> READY : Delay 5 giây\n(Món đã xong)
    READY --> SERVED : Delay 5 giây\n(Nhân viên mang ra)
    
    SERVED --> [*]
    
    note right of PENDING
        Hệ thống tự động sử dụng vòng lặp
        forEach kết hợp setTimeout 
        để tịnh tiến trạng thái mỗi 5 giây
        cho mục đích Demo (Mock).
    end note
```

## 2. Vòng đời Yêu cầu Hỗ trợ (Support Request Flow)

Lưu ý: Luồng này chạy độc lập cho từng loại yêu cầu (Bát đũa, Khăn giấy, Dọn bàn, Thanh toán).

```mermaid
stateDiagram-v2
    [*] --> IDLE
    
    IDLE --> SENDING : Khách bấm gửi yêu cầu
    SENDING --> PENDING : Delay 1.5 giây\n(Giả lập độ trễ mạng)
    
    note right of PENDING : Chờ nhân viên tiếp nhận
    
    PENDING --> IN_PROGRESS : Delay 5 giây\n(Nhân viên đã nhận)
    
    note left of IN_PROGRESS : Nhân viên đang di chuyển
    
    IN_PROGRESS --> IDLE : Delay 10 giây\n(Hoàn thành, reset)
```

## ⚠️ Lưu ý Kiến trúc (Architecture Note)

Toàn bộ logic chuyển trạng thái này (State Progression) hiện đang được code "cứng" (Hard-coded) ở tầng Client Component thay vì chạy ngầm (Background Job) bên phía Server API (`/api/orders`). Điều này có nghĩa là nếu khách hàng F5 (Refresh) trang web ngay sau khi đặt hàng, chuỗi `setTimeout` này sẽ bị huỷ (clear) và đơn hàng/yêu cầu có thể kẹt mãi mãi ở trạng thái ban đầu của database.

Đối với môi trường Production, logic này cần được dời xuống Server, kết hợp cùng Database Triggers hoặc Message Queue để đảm bảo tính toàn vẹn dữ liệu.
