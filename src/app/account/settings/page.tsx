'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { AccountSettings } from '@/components/Account/AccountSettings';
import { useAuth } from '@/context/AuthContext';
import { UserData } from '@/components/Account/PersonalInfoSection';
import styles from '../page.module.css'; // Reuse styles from parent

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const [userData, setUserData] = useState<UserData>({
        name: "",
        phone: "",
        email: "",
        gender: "",
        dob: ""
    });

    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name,
                phone: user.phone,
                email: user.email || "",
                gender: "Nam",
                dob: "01/01/2000"
            });
        }
    }, [user]);

    const handleUpdateProfile = (newData: UserData) => {
        setUserData(prev => ({ ...prev, ...newData }));
    };

    const handleLogout = () => {
        logout();
        router.push('/account');
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <button className={styles.backBtn} onClick={() => router.back()}>
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className={styles.pageTitle}>Cài đặt</h1>
                </div>
            </header>
            <main className={styles.main}>
                <AccountSettings
                    userData={userData}
                    onUpdateUserData={handleUpdateProfile}
                    onLogout={handleLogout}
                    onVerify={() => { }}
                />
            </main>
        </div>
    );
}
