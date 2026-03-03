
export const USER_RANK_INFO = {
    name: "Minh Tuyền",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
    currentRank: "Gold",
    points: 1250,
    nextRank: "Platinum",
    pointsToNextRank: 750,
    totalPointsNextRank: 2000,
    progress: 62.5 // (1250 / 2000) * 100
};

export const MY_VOUCHERS = [
    {
        id: 'v1',
        title: 'Giảm 50K cho đơn từ 200K',
        desc: 'Áp dụng cho đơn hàng ăn tại bàn.',
        expiry: '30/12/2026',
        status: 'active', // active, used, expired
        code: 'SAVE50'
    },
    {
        id: 'v2',
        title: 'Tặng 1 món tráng miệng',
        desc: 'Áp dụng khi gọi combo bất kỳ.',
        expiry: '15/11/2026',
        status: 'active',
        code: 'SWEET'
    },
    {
        id: 'v3',
        title: 'Giảm 15%',
        desc: 'Tối đa 100K.',
        expiry: '01/01/2025',
        status: 'expired',
        code: 'OFF15'
    }
];

export const REDEEMABLE_VOUCHERS = [
    {
        id: 'r1',
        title: 'Voucher 100K',
        points: 500,
        image: '/food/voucher-100k.png' // Placeholder or use a generic icon
    },
    {
        id: 'r2',
        title: 'Voucher 200K',
        points: 900,
        image: '/food/voucher-200k.png'
    },
    {
        id: 'r3',
        title: 'Buffet vé đi 4 tính 3',
        points: 1500,
        image: '/food/buffet-ticket.png'
    }
];
