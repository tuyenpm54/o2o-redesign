'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { VoucherSection, Voucher } from '@/components/Account/VoucherSection';
import styles from '../page.module.css'; // Reuse styles from parent

export default function VouchersPage() {
    const router = useRouter();

    const [vouchers] = useState<Voucher[]>([
        { id: '1', code: 'WELCOME50', title: 'Giảm 50% cho bạn mới', expiry: '31/12/2025', status: 'active', qrValue: 'WELCOME50_USER_123' },
        { id: '2', code: 'FREESHIP', title: 'Miễn phí vận chuyển', expiry: '15/10/2025', status: 'used', qrValue: 'FREESHIP_USER_123' }
    ]);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <button className={styles.backBtn} onClick={() => router.back()}>
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className={styles.pageTitle}>Ưu đãi của tôi</h1>
                </div>
            </header>
            <main className={styles.main}>
                <VoucherSection vouchers={vouchers} />
            </main>
        </div>
    );
}
