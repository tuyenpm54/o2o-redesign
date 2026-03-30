"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    ChevronLeft, Clock, CircleDashed, CheckCircle2, ChefHat, Utensils,
    History, Receipt, Bell
} from 'lucide-react';
import styles from './page.module.css';
import { ALL_ITEMS, MOCK_USERS, OrderItem } from '@/data/mock-order-history';

// Status Config
const STATUS_CONFIG = {
    PLACED: { label: 'Vừa gọi', icon: CircleDashed, style: styles.statusPlaced },
    CONFIRMED: { label: 'Đã xác nhận', icon: CheckCircle2, style: styles.statusConfirmed },
    COOKING: { label: 'Đang nấu', icon: ChefHat, style: styles.statusCooking },
    SERVED: { label: 'Đã phục vụ', icon: Utensils, style: styles.statusServed },
};

export default function OrderHistoryPage() {
    const [filterMode, setFilterMode] = useState<'ME' | 'ALL'>('ALL');
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const currentUser = MOCK_USERS['u1'];

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 10000); // update every 10 seconds
        return () => clearInterval(timer);
    }, []);

    // Filter Items Logic (same as before)
    const displayedItems = ALL_ITEMS.filter(item => {
        if (filterMode === 'ME') {
            return item.orderedBy.id === currentUser.id;
        }
        return true;
    }).sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());

    // Helper
    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.container}>
            {/* Header with Actions */}
            <header className={styles.header}>
                <Link href="/menu?style=single-order-page" style={{ textDecoration: 'none' }}>
                    <button className={styles.backButton}>
                        <ChevronLeft size={24} />
                    </button>
                </Link>
                <h1 className={styles.pageTitle}>Theo dõi món</h1>

                <div className={styles.headerActions}>
                    <Link href="/order-history/rounds">
                        <button className={styles.iconBtn}>
                            <History size={20} />
                        </button>
                    </Link>
                </div>
            </header>

            {/* Filter */}
            <div className={styles.filterContainer}>
                <div className={styles.segmentedControl}>
                    <button
                        className={`${styles.segmentBtn} ${filterMode === 'ME' ? styles.active : ''}`}
                        onClick={() => setFilterMode('ME')}
                    >
                        Của tôi
                    </button>
                    <button
                        className={`${styles.segmentBtn} ${filterMode === 'ALL' ? styles.active : ''}`}
                        onClick={() => setFilterMode('ALL')}
                    >
                        Cả bàn
                    </button>
                </div>
            </div>

            {/* List */}
            <div className={styles.itemList}>
                {displayedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <History size={48} strokeWidth={1} className="mb-4 opacity-50" />
                        <p>Chưa có món nào được gọi.</p>
                    </div>
                ) : (
                    displayedItems.map((item) => {
                        const StatusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.PLACED;

                        return (
                            <div key={item.id} className={styles.itemCard}>
                                {/* Quantity: Plain Text */}
                                <div className={styles.qtyBox}>
                                    <span className={styles.qtyValue}>{item.quantity}x</span>
                                </div>

                                {/* Info */}
                                <div className={styles.itemContent}>
                                    <div className={styles.itemName}>{item.name}</div>
                                    <div className={styles.metaRow}>
                                        <div className={styles.userMeta}>
                                            <span>{item.orderedBy.isCurrentUser ? 'Bạn' : item.orderedBy.name}</span>
                                        </div>
                                        <div className={styles.timeMeta}>
                                            <span>{formatTime(item.orderedAt)}</span>
                                        </div>
                                    </div>
                                    {/* Timer Logic */}
                                    {currentTime && item.prepTimeMinutes && ['PLACED', 'CONFIRMED', 'COOKING'].includes(item.status) && (() => {
                                        const orderedTime = new Date(item.orderedAt).getTime();
                                        const expectedTime = orderedTime + item.prepTimeMinutes * 60000;
                                        const diffMins = Math.round((expectedTime - currentTime.getTime()) / 60000);
                                        const isLate = diffMins < 0;

                                        return (
                                            <div className={styles.timerWrapper}>
                                                <div className={`${styles.timerBadge} ${isLate ? styles.timerLate : ''}`}>
                                                    <Clock size={12} />
                                                    <span>{isLate ? `Trễ ${Math.abs(diffMins)} phút` : `Còn ${diffMins} phút`}</span>
                                                </div>
                                                <button 
                                                    className={styles.remindBtn}
                                                    onClick={() => alert(`Đã gửi nhắc nhở nhân viên cho món: ${item.name}`)}
                                                >
                                                    <Bell size={12} />
                                                    <span>Nhắc nhân viên</span>
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Status Pill */}
                                <div className={styles.itemStatus}>
                                    <span className={`${styles.statusPill} ${StatusInfo.style}`}>
                                        {item.status === 'COOKING' && item.quantity >= 1 ? (
                                            `Đang nấu (${item.fulfilledQuantity}/${item.quantity})`
                                        ) : (
                                            StatusInfo.label
                                        )}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Fixed Bill Preview Section */}
            <div className={`${styles.billPreviewSection} ${ALL_ITEMS.length === 0 ? styles.disabled : ''}`}>
                <p className={styles.billNote}>
                    Bạn có thể xem hoá đơn của mình trước khi yêu cầu thanh toán tại đây
                </p>
                <Link
                    href={ALL_ITEMS.length > 0 ? "/bill" : "#"}
                    className={styles.billPreviewLink}
                    onClick={(e) => ALL_ITEMS.length === 0 && e.preventDefault()}
                >
                    <button
                        className={styles.billPreviewBtn}
                        disabled={ALL_ITEMS.length === 0}
                    >
                        <Receipt size={22} />
                        <span>Xem hoá đơn tạm tính</span>
                    </button>
                </Link>
            </div>
        </div>
    );
}
