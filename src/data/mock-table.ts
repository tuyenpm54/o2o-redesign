export interface Member {
    id: string;
    name: string;
    avatar?: string;
    color?: string;
    status: 'ordering' | 'done';
    hasTrophy?: boolean;
}

export interface OrderItem {
    id: string;
    name: string;
    price: number;
    qty: number;
    status: string;
}

export const TABLE_MEMBERS: Member[] = [
    { id: 'm1', name: 'Felix', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix', status: 'ordering', hasTrophy: true },
    { id: 'm2', name: 'Aneka', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka', status: 'ordering' },
    { id: 'm3', name: 'Bob', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', status: 'done' },
    { id: 'm4', name: 'Zoe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe', status: 'ordering' },
    { id: 'm5', name: 'Minh Tuyền', status: 'ordering', color: '#EC4899' },
    { id: 'm6', name: 'Anh Quân', status: 'ordering', color: '#3B82F6' },
];

export const MEMBER_ORDERS: Record<string, OrderItem[]> = {
    'm1': [
        { id: 'o1', name: 'Sườn Nướng Tảng BBQ', price: 259000, qty: 1, status: 'COOKING' },
        { id: 'o2', name: 'Ba Chỉ Bò Mỹ Cuộn', price: 129000, qty: 1, status: 'SERVED' },
        { id: 'o8', name: 'Salad Rong Nho', price: 89000, qty: 1, status: 'PENDING' },
    ],
    'm2': [
        { id: 'o3', name: 'Mì Ý Sốt Kem Nấm', price: 99000, qty: 1, status: 'READY' },
        { id: 'o4', name: 'Coca Cola Tươi', price: 15000, qty: 2, status: 'SERVED' },
    ],
    'm3': [
        { id: 'o5', name: 'Cơm Rang Hải Sản', price: 115000, qty: 1, status: 'SERVED' },
    ],
    'm4': [
        { id: 'o6', name: 'Bò Beefsteak Sốt Tiêu', price: 189000, qty: 1, status: 'PENDING' },
    ],
    'm5': [],
    'm6': [
        { id: 'o7', name: 'Trà Đào Cam Sả', price: 45000, qty: 1, status: 'SERVED' },
    ]
};

export const MEMBER_DRAFTS: Record<string, { id: number, qty: number }[]> = {
    'm2': [{ id: 101, qty: 1 }, { id: 502, qty: 2 }],
    'm4': [{ id: 202, qty: 1 }],
    'm6': [{ id: 401, qty: 1 }]
};
