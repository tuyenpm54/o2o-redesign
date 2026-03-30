export type OrderStatus = 'PLACED' | 'CONFIRMED' | 'COOKING' | 'SERVED';

export interface User {
    id: string;
    name: string;
    avatar?: string;
    isCurrentUser?: boolean;
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    fulfilledQuantity: number;
    status: OrderStatus;
    orderedBy: User;
    orderedAt: string; // ISO string
    roundId: string;
    note?: string;
    imageUrl?: string;
    prepTimeMinutes?: number;
}

export interface OrderRound {
    id: string;
    roundNumber: number;
    status: 'PENDING' | 'CONFIRMED';
    orderedAt: string;
    items: OrderItem[];
    orderedByUsers: User[];
}

export const MOCK_USERS: Record<string, User> = {
    'u1': { id: 'u1', name: 'Tôi', isCurrentUser: true, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    'u2': { id: 'u2', name: 'Bố', isCurrentUser: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' },
    'u3': { id: 'u3', name: 'Mẹ', isCurrentUser: false, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
};

export const MOCK_ROUNDS: OrderRound[] = [
    {
        id: 'r3',
        roundNumber: 3,
        status: 'PENDING',
        orderedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
        orderedByUsers: [MOCK_USERS['u1']],
        items: [
            {
                id: 'i5', name: 'Ba chỉ bò Mỹ', quantity: 2, fulfilledQuantity: 0, status: 'PLACED',
                orderedBy: MOCK_USERS['u1'], orderedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), roundId: 'r3',
                imageUrl: 'https://images.unsplash.com/photo-1555126634-323283e090fa', prepTimeMinutes: 15
            }
        ]
    },
    {
        id: 'r2',
        roundNumber: 2,
        status: 'CONFIRMED',
        orderedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
        orderedByUsers: [MOCK_USERS['u1'], MOCK_USERS['u2']],
        items: [
            {
                id: 'i3', name: 'Sườn nướng tảng', quantity: 1, fulfilledQuantity: 0, status: 'COOKING',
                orderedBy: MOCK_USERS['u2'], orderedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), roundId: 'r2',
                imageUrl: 'https://images.unsplash.com/photo-1544025162-d76690b68011', prepTimeMinutes: 10
            },
            {
                id: 'i4', name: 'Salad rong nho', quantity: 1, fulfilledQuantity: 1, status: 'SERVED',
                orderedBy: MOCK_USERS['u1'], orderedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), roundId: 'r2',
                imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
            }
        ]
    },
    {
        id: 'r1',
        roundNumber: 1,
        status: 'CONFIRMED',
        orderedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
        orderedByUsers: [MOCK_USERS['u2'], MOCK_USERS['u3']],
        items: [
            {
                id: 'i1', name: 'Nước lẩu Thái', quantity: 1, fulfilledQuantity: 1, status: 'SERVED',
                orderedBy: MOCK_USERS['u3'], orderedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), roundId: 'r1',
                imageUrl: 'https://images.unsplash.com/photo-1551024506-0bccd828d307'
            },
            {
                id: 'i2', name: 'Combo rau nấm', quantity: 1, fulfilledQuantity: 1, status: 'SERVED',
                orderedBy: MOCK_USERS['u3'], orderedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), roundId: 'r1',
                imageUrl: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443'
            }
        ]
    }
];

export const ALL_ITEMS = MOCK_ROUNDS.flatMap(r => r.items);
