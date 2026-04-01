"use client";

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { InvoiceListSection } from '@/components/Account/InvoiceListSection';
import { useAuth } from '@/context/AuthContext';
import { LoginForm } from '@/components/Account/LoginForm';
import styles from '../page.module.css';

const InvoiceListContent = () => {
    const router = useRouter();
    const { isLoggedIn, isGuest, isLoadingAuth } = useAuth();

    if (isLoadingAuth) {
        return (
            <div className={styles.container} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ width: 32, height: 32, border: '3px solid #f3f3f3', borderTop: '3px solid #DF1B41', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isLoggedIn || isGuest) {
        return <LoginForm from="/account/invoices" />;
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <button className={styles.backBtn} onClick={() => router.back()}>
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className={styles.pageTitle}>Hoá đơn</h1>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.personalInfoView}>
                    <InvoiceListSection showTitle={false} />
                </div>
            </main>
        </div>
    );
};

const InvoiceListPage = () => {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>Đang tải...</div>}>
            <InvoiceListContent />
        </Suspense>
    );
};

export default InvoiceListPage;
