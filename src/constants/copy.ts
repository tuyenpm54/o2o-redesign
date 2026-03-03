import { ShopModel } from '../config/shopConfig';

interface SecondaryAction {
    id: string;
    label: string;
    icon: 'clock' | 'message' | 'gift' | 'user' | 'bell' | 'bill' | 'ice' | 'water' | 'napkin' | 'star' | 'cutlery' | 'staff';
    color: 'blue' | 'orange' | 'rose' | 'amber' | 'indigo';
}

interface ModelCopy {
    contextMessage: (tableId?: string) => string;
    instruction: string;
    cta: string;
    level2?: {
        id: string;
        label: string;
        icon: string;
        count?: number;
    };
    level3?: {
        title: string;
        actions: SecondaryAction[];
    };
    secondaryActions: SecondaryAction[];
}

export const MODEL_COPY: Record<ShopModel, ModelCopy> = {
    A: {
        // Trả sau - Dine-in
        contextMessage: (tableId = '___') => `🪑 Bàn ${tableId} – Vui lòng xem menu và gọi món. Nhân viên sẽ mang món ra bàn cho bạn`,
        instruction: 'Vui lòng xem menu và gọi món. Nhân viên sẽ mang món ra bàn cho bạn',
        cta: 'Xem menu – Gọi món',
        level2: {
            id: 'view_order',
            label: 'Xem món đã gọi',
            icon: 'clock',
            count: 3
        },
        level3: {
            title: 'Hỗ trợ nhanh',
            actions: [
                { id: 'ice', label: 'Lấy thêm đá', icon: 'ice', color: 'blue' },
                { id: 'payment', label: 'Gọi thanh toán', icon: 'bill', color: 'indigo' },
                { id: 'water', label: 'Thêm nước lọc', icon: 'water', color: 'blue' },
                { id: 'napkin', label: 'Thêm khăn giấy', icon: 'napkin', color: 'orange' },
                { id: 'cutlery', label: 'Xin thêm bát đũa', icon: 'cutlery', color: 'orange' },
                // { id: 'staff', label: 'Gặp nhân viên', icon: 'staff', color: 'rose' }, // Example 6th option
            ]
        },
        secondaryActions: [] // We'll move these into levels
    },
    B: {
        // Trả trước tại bàn
        contextMessage: (tableId = '___') => `Bàn ${tableId} – Thanh toán ngay`,
        instruction: 'Vui lòng gọi món & thanh toán. Nhân viên sẽ mang đồ ra bàn.',
        cta: 'Xem Menu – Gọi món',
        secondaryActions: [
            { id: 'history', label: 'Lịch sử đơn', icon: 'clock', color: 'blue' },
            { id: 'feedback', label: 'Góp ý', icon: 'message', color: 'orange' },
            { id: 'loyalty', label: 'Ưu đãi', icon: 'gift', color: 'rose' },
        ]
    },
    C: {
        // Trả trước tại quầy
        contextMessage: () => 'Tự lấy đồ - Thanh toán ngay',
        instruction: 'Vui lòng gọi món & thanh toán. Nhận thông báo ra quầy lấy đồ.',
        cta: 'Xem Menu – Gọi món',
        secondaryActions: [
            { id: 'history', label: 'Lịch sử đơn', icon: 'clock', color: 'blue' },
            { id: 'feedback', label: 'Góp ý', icon: 'message', color: 'orange' },
            { id: 'loyalty', label: 'Ưu đãi', icon: 'gift', color: 'rose' },
        ]
    },
};
