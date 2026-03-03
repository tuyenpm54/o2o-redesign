"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronLeft,
} from 'lucide-react';
import { MOCK_ROUNDS } from '@/data/mock-order-history';
import styles from './page.module.css';
import { UserData } from '@/components/Account/PersonalInfoSection';
import { AccountOverview } from '@/components/Account/AccountOverview';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/Account/LoginForm';

// Helper for date
const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
};

// Recent Orders Transformation
const recentOrders = MOCK_ROUNDS.slice(0, 2).map(round => ({
    id: round.id,
    items: round.items.map(i => i.name).slice(0, 2),
    totalItems: round.items.length,
    status: round.status === 'PENDING' ? 'Đang chọn' : 'Hoàn thành', // Simple Mapping
    time: formatDate(round.orderedAt)
}));

const UserAccountContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/';
    const { isLoggedIn, user, logout } = useAuth();

    // Mapped Data from Context
    const [userData, setUserData] = useState<UserData & { points: number, tier: string }>({
        name: "",
        phone: "",
        email: "",
        gender: "",
        dob: "",
        points: 0,
        tier: ""
    });

    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name,
                phone: user.phone,
                email: user.email || "",
                gender: "Nam", // Mock
                dob: "01/01/2000", // Mock
                points: user.points || 0,
                tier: user.tier || "Khách"
            });
        }
    }, [user]);

    const [membershipData] = useState({
        nextTierPoints: 1000,
        rewards: [
            { id: '1', name: 'Voucher giảm 50k', pointsRequired: 500, image: 'https://images.unsplash.com/photo-1549488344-c70595af8dce?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
            { id: '2', name: 'Free Tiramisu', pointsRequired: 800, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' },
            { id: '3', name: 'Giảm 10% Bill', pointsRequired: 1500, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' }
        ]
    });

    const handleNavigateToHistory = () => {
        router.push('/order-history/rounds');
    };

    if (!isLoggedIn) {
        return <LoginForm />;
    }

    // Define TOP_REWARDS_MOCK based on existing membershipData for consistency
    const TOP_REWARDS_MOCK = membershipData.rewards.slice(0, 2);

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <button className={styles.backBtn} onClick={() => router.push(from)}>
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className={styles.pageTitle}>Tài khoản</h1>
                </div>
            </header>

            <main className={styles.main}>
                <AccountOverview
                    userData={userData}
                    nextTierPoints={2000} // Mock
                    topRewards={TOP_REWARDS_MOCK}
                    recentOrders={recentOrders}
                    onNavigateToVouchers={() => router.push('/account/vouchers')}
                    onNavigateToSettings={() => router.push('/account/settings')}
                    onNavigateToHistory={handleNavigateToHistory}
                />
            </main>
        </div>
    );
};

const UserAccountPage = () => {
    return (
        <Suspense fallback={<div className={styles.container}><div className={styles.header}>Loading...</div></div>}>
            <UserAccountContent />
        </Suspense>
    );
};

export default UserAccountPage;
