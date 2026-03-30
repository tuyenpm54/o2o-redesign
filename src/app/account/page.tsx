"use client";

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import styles from './page.module.css';
import { PersonalInfoSection, UserData } from '@/components/Account/PersonalInfoSection';
import { VATInfoSection } from '@/components/Account/VATInfoSection';
import { AccountOverview } from '@/components/Account/AccountOverview';
import { InvoiceListSection } from '@/components/Account/InvoiceListSection';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/Account/LoginForm';
import { OnboardingForm } from '@/components/Account/OnboardingForm';

type ViewState = 'OVERVIEW' | 'PERSONAL_INFO' | 'VAT_INFO' | 'INVOICE_LIST' | 'ONBOARDING';

const VIEW_TITLES: Record<ViewState, string> = {
    OVERVIEW: 'Tài khoản',
    PERSONAL_INFO: 'Thông tin cá nhân',
    VAT_INFO: 'Thông tin VAT',
    INVOICE_LIST: 'Hoá đơn',
    ONBOARDING: 'Cập nhật thông tin',
};

const UserAccountContent = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from') || '/';
    const isSetup = searchParams.get('setup') === '1';
    const { isLoggedIn, isGuest, user, logout, updateUser, isLoadingAuth } = useAuth();
    const [view, setView] = useState<ViewState>('OVERVIEW');

    // Mapped Data from Context
    const [userData, setUserData] = useState<UserData & { points: number; tier: string; preferences: string[] }>({
        name: "",
        phone: "",
        email: "",
        gender: "",
        dob: "",
        points: 0,
        tier: "",
        preferences: [],
    });

    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name,
                phone: user.phone,
                email: user.email || "",
                gender: "Nam", // From profile API when available
                dob: "01/01/2000",
                points: user.points || 0,
                tier: user.tier || "Khách",
                preferences: user.preferences || [],
            });
            
            // Check if we ACTUALLY need onboarding
            if (isSetup && (user.name === 'Khách hàng mới' || !user.name)) {
                setView('ONBOARDING');
            } else {
                setView('OVERVIEW');
            }
        }
    }, [user, isSetup]);

    const [membershipData] = useState({
        nextTierPoints: 2000,
        rewards: [
            { id: '1', name: 'Voucher giảm 50k', pointsRequired: 500, image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop' },
            { id: '2', name: 'Free Tiramisu', pointsRequired: 800, image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=300&h=200&fit=crop' },
            { id: '3', name: 'Giảm 10% Bill', pointsRequired: 1500, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&h=200&fit=crop' }
        ]
    });

    const handleUpdateProfile = async (newData: UserData) => {
        setUserData(prev => ({ ...prev, ...newData }));
        await updateUser({ name: newData.name, phone: newData.phone });
    };

    const handleBack = () => {
        if (view !== 'OVERVIEW') {
            setView('OVERVIEW');
        } else {
            if (from && from !== '/') {
                router.push(from);
            } else {
                router.back();
            }
        }
    };

    if (isLoadingAuth) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #f3f3f3', borderTop: '3px solid #DF1B41', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // If not logged in or is still a guest, show login form
    if (!isLoggedIn || isGuest) {
        return <LoginForm from={from} />;
    }

    const TOP_REWARDS_MOCK = membershipData.rewards.slice(0, 3);

    const renderView = () => {
        switch (view) {
            case 'ONBOARDING':
                return (
                    <div className={styles.personalInfoView}>
                        <OnboardingForm
                            userData={userData}
                            onComplete={async (data) => {
                                await handleUpdateProfile(data as UserData);
                                setView('OVERVIEW');
                            }}
                        />
                    </div>
                );
            case 'PERSONAL_INFO':
                return (
                    <div className={styles.personalInfoView}>
                        <PersonalInfoSection
                            userData={userData}
                            onUpdate={handleUpdateProfile}
                        />
                    </div>
                );
            case 'VAT_INFO':
                return (
                    <div className={styles.personalInfoView}>
                        <VATInfoSection />
                    </div>
                );
            case 'INVOICE_LIST':
                return (
                    <div className={styles.personalInfoView}>
                        <InvoiceListSection />
                    </div>
                );
            default:
                return (
                    <AccountOverview
                        userData={userData}
                        nextTierPoints={membershipData.nextTierPoints}
                        topRewards={TOP_REWARDS_MOCK}
                        onNavigateToVouchers={() => router.push('/account/vouchers')}
                        onNavigateToSettings={() => router.push(`/account/settings?from=${encodeURIComponent(from)}`)}
                        onNavigateToHistory={() => router.push('/table-orders')}
                        onNavigateToPersonalInfo={() => setView('PERSONAL_INFO')}
                        onNavigateToVATInfo={() => setView('VAT_INFO')}
                        onNavigateToInvoices={() => setView('INVOICE_LIST')}
                        onLogout={logout}
                    />
                );
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <button className={styles.backBtn} onClick={handleBack}>
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className={styles.pageTitle}>
                        {VIEW_TITLES[view]}
                    </h1>
                </div>
            </header>

            <main className={styles.main}>
                {renderView()}
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
