import { useState, useEffect, useMemo } from 'react';

export type TimeOfDay = 'morning' | 'noon' | 'afternoon' | 'evening';

export interface TimeTheme {
    bg: string;
    bgGradient: string;
    pageBgSecondary: string;
    textPrimary: string;
    textSecondary: string;
    cardBg: string;
    cardBorder: string;
    cardShadow: string;
    accent: string;
    accentLight: string;
    sectionDivider: string;
    greeting: string;
    headerBg: string;
    navBg: string;
    navActiveText: string;
    cartBarBg: string;
    cartBarText: string;
}

const TIME_THEMES: Record<TimeOfDay, TimeTheme> = {
    morning: {
        bg: '#FFF7ED',
        bgGradient: 'linear-gradient(180deg, #FFF7ED 0%, #FEF3C7 100%)',
        pageBgSecondary: '#FFF3E0',
        textPrimary: '#78350F',
        textSecondary: 'rgba(146, 64, 14, 0.7)',
        cardBg: 'rgba(255, 255, 255, 0.85)',
        cardBorder: 'rgba(251, 191, 36, 0.15)',
        cardShadow: '0 2px 12px rgba(251, 191, 36, 0.08)',
        accent: '#F59E0B',
        accentLight: 'rgba(245, 158, 11, 0.12)',
        sectionDivider: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent)',
        greeting: 'Chào buổi sáng! ☀️ Bắt đầu ngày mới thật ngon nhé',
        headerBg: 'rgba(255, 247, 237, 0.95)',
        navBg: '#FFF7ED',
        navActiveText: '#FFFFFF',
        cartBarBg: '#F59E0B',
        cartBarText: '#FFFFFF',
    },
    noon: {
        bg: '#F8FAFC',
        bgGradient: 'linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
        pageBgSecondary: '#F1F5F9',
        textPrimary: '#0F172A',
        textSecondary: '#475569',
        cardBg: '#FFFFFF',
        cardBorder: 'rgba(226, 232, 240, 0.8)',
        cardShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
        accent: '#DF1B41',
        accentLight: 'rgba(223, 27, 65, 0.08)',
        sectionDivider: 'linear-gradient(90deg, transparent, rgba(226, 232, 240, 0.6), transparent)',
        greeting: 'Bữa trưa nhanh gọn 🍜 Chọn món ngay nào!',
        headerBg: 'rgba(248, 250, 252, 0.95)',
        navBg: '#F8FAFC',
        navActiveText: '#FFFFFF',
        cartBarBg: '#DF1B41',
        cartBarText: '#FFFFFF',
    },
    afternoon: {
        bg: '#F6F8F6', // Soft Sage/Matcha tint
        bgGradient: 'linear-gradient(180deg, #F6F8F6 0%, #ECF2ED 100%)',
        pageBgSecondary: '#EAEFEA',
        textPrimary: '#1E293B',
        textSecondary: '#475569',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        cardBorder: 'rgba(16, 185, 129, 0.15)',
        cardShadow: '0 4px 16px rgba(16, 185, 129, 0.06)',
        accent: '#059669', // Emerald 600 - elegant Matcha Green
        accentLight: 'rgba(5, 150, 105, 0.1)',
        sectionDivider: 'linear-gradient(90deg, transparent, rgba(5, 150, 105, 0.2), transparent)',
        greeting: 'Giờ trà chiều 🍵 Thưởng thức một chút nhẹ nhàng',
        headerBg: 'rgba(246, 248, 246, 0.95)',
        navBg: '#F6F8F6',
        navActiveText: '#FFFFFF',
        cartBarBg: '#059669',
        cartBarText: '#FFFFFF',
    },
    evening: {
        bg: '#0F172A',
        bgGradient: 'linear-gradient(180deg, #0F172A 0%, #020617 100%)',
        pageBgSecondary: '#1E293B',
        textPrimary: '#F1F5F9',
        textSecondary: '#94A3B8',
        cardBg: '#1E293B',
        cardBorder: 'rgba(148, 163, 184, 0.15)',
        cardShadow: '0 2px 16px rgba(0, 0, 0, 0.3)',
        accent: '#FBBF24',
        accentLight: 'rgba(251, 191, 36, 0.12)',
        sectionDivider: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.25), transparent)',
        greeting: 'Tối nay ăn gì? 🌙 Khám phá thực đơn thượng hạng',
        headerBg: 'rgba(15, 23, 42, 0.95)',
        navBg: '#0F172A',
        navActiveText: '#0F172A',
        cartBarBg: '#FBBF24',
        cartBarText: '#0F172A',
    },
};

export function useMenuContext(groupSize: number = 1) {
    const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('noon');
    const [userHistory, setUserHistory] = useState<any[]>([]);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 11) {
            setTimeOfDay('morning');
        } else if (hour >= 11 && hour < 14) {
            setTimeOfDay('noon');
        } else if (hour >= 14 && hour < 18) {
            setTimeOfDay('afternoon');
        } else {
            setTimeOfDay('evening');
        }

        // Mock User History for demo purposes
        const storedHistory = localStorage.getItem('user_order_history');
        if (storedHistory) {
            try {
                const parsed = JSON.parse(storedHistory);
                if (parsed.length >= 2) {
                    setUserHistory(parsed);
                    return;
                }
            } catch (e) {
                console.error(e);
            }
        }
        // Regenerate mock data if needed
        const mock = [
            {
                id: 1,
                name: "Combo Lẩu Bò",
                price: 350000,
                desc: "Lẩu bò tái, bò viên, rau, mì, bún — đủ 2-3 người",
                img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600",
                tags: ["Bán chạy", "Nhóm"],
                matchReason: "Đã gọi 3 lần"
            },
            {
                id: 2,
                name: "Gỏi Xoài Xanh Tai Heo",
                price: 89000,
                desc: "Giòn sần sật với tai heo ngâm mắm ngọt chua cay",
                img: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600",
                tags: ["Signature", "Chua cay"],
                matchReason: "Bạn thích chua cay"
            },
            {
                id: 3,
                name: "Sườn Nướng Texas",
                price: 159000,
                desc: "Sườn heo nhập khẩu ướp 24h, nướng sốt BBQ phong cách Mỹ",
                img: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600",
                tags: ["Bán chạy", "Nướng"],
                matchReason: "Đã gọi 2 lần"
            },
            {
                id: 4,
                name: "Trà Đào Cam Sả",
                price: 45000,
                desc: "Trà xanh thơm mát kết hợp đào tươi và cam sả",
                img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600",
                tags: ["Đồ uống", "Mát lạnh"],
                matchReason: "Luôn gọi kèm"
            },
            {
                id: 5,
                name: "Panna Cotta Xoài",
                price: 55000,
                desc: "Panna cotta Ý mềm mịn phủ sốt xoài tươi",
                img: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
                tags: ["Tráng miệng", "Ngọt"],
                matchReason: "Phù hợp sở thích"
            },
            {
                id: 6,
                name: "Cánh Gà Chiên Mắm",
                price: 79000,
                desc: "Cánh gà chiên giòn rim nước mắm tỏi ớt",
                img: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600",
                tags: ["Bán chạy", "Chiên giòn"],
                matchReason: "Đã gọi 1 lần"
            }
        ];
        setUserHistory(mock);
        localStorage.setItem('user_order_history', JSON.stringify(mock));
    }, []);

    const theme = TIME_THEMES[timeOfDay];

    const themeClass = `theme-${timeOfDay}`;

    const cssVars: Record<string, string> = useMemo(() => ({
        '--menu-bg': theme.bg,
        '--menu-bg-gradient': theme.bgGradient,
        '--menu-bg-secondary': theme.pageBgSecondary,
        '--menu-text': theme.textPrimary,
        '--menu-text-secondary': theme.textSecondary,
        '--menu-card-bg': theme.cardBg,
        '--menu-card-border': theme.cardBorder,
        '--menu-card-shadow': theme.cardShadow,
        '--menu-accent': theme.accent,
        '--menu-accent-light': theme.accentLight,
        '--menu-section-divider': theme.sectionDivider,
        '--menu-header-bg': theme.headerBg,
        '--menu-nav-bg': theme.navBg,
        '--menu-nav-active-text': theme.navActiveText,
        '--menu-cart-bar-bg': theme.cartBarBg,
        '--menu-cart-bar-text': theme.cartBarText,
    }), [theme]);

    return {
        timeOfDay,
        theme,
        cssVars,
        greeting: theme.greeting,
        userHistory,
        groupSize,
        themeClass,
        isGroup: groupSize >= 4
    };
}
