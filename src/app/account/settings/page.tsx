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
        <div className={styles.container} style={{ backgroundColor: '#fdfcfe' }}>
            <header className={styles.header} style={{ borderBottom: 'none', boxShadow: 'none', backgroundColor: 'transparent' }}>
                <div className={styles.headerTop} style={{ padding: '20px 16px 10px' }}>
                    <button className={styles.backBtn} onClick={() => router.push('/account')} style={{ backgroundColor: 'white', border: '1px solid #f1f5f9', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className={styles.pageTitle} style={{ fontSize: '24px', fontWeight: 800 }}>
                        Cài đặt
                    </h1>
                </div>
            </header>
            <main className={styles.main} style={{ padding: '10px 16px' }}>
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
