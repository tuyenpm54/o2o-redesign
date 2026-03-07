"use client";

import React, { Suspense } from 'react';
import { ChevronLeft, CheckCircle2, CircleDashed, Users } from 'lucide-react';
import styles from './page.module.css';
import { MOCK_ROUNDS } from '@/data/mock-order-history';
import { useRouter, useSearchParams } from 'next/navigation';

function RoundHistoryContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resid = searchParams.get('resid') || '100';
    const tableid = searchParams.get('tableid') || 'A-12';
    const from = searchParams.get('from') || `/table-orders?resid=${resid}&tableid=${tableid}`;

    // Sort rounds descending by time
    const sortedRounds = [...MOCK_ROUNDS].sort((a, b) =>
        new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
    );

    const formatTime = (isoString: string) => {
        return new Date(isoString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => router.push(from)}>
                    <ChevronLeft size={24} />
                </button>
                <h1 className={styles.pageTitle}>Lịch sử lượt gọi</h1>
            </header>

            <div className={styles.roundList}>
                {sortedRounds.map((round, index) => {
                    const primaryUser = round.orderedByUsers[0];
                    const isConfirmed = round.status === 'CONFIRMED';

                    return (
                        <div key={round.id} className={styles.timelineItem} style={{ animationDelay: `${index * 0.1}s` }}>
                            {/* Axis Element */}
                            <div className={styles.timeNode}>
                                <div className={`${styles.timelineKnob} ${isConfirmed ? styles.knobConfirmed : ''}`} />
                            </div>

                            {/* Content Bubble */}
                            <div className={styles.bubbleContainer}>
                                {/* Header: Time + User */}
                                <div className={styles.bubbleHeader}>
                                    <div className={styles.headerLeft}>
                                        <span className={styles.timeText}>{formatTime(round.orderedAt)}</span>
                                        <span className={`${styles.statusText} ${isConfirmed ? styles.confirmed : ''}`}>
                                            {isConfirmed ? 'Đã nhận đơn' : 'Đang gửi...'}
                                        </span>
                                    </div>

                                    <div className={styles.userBadge}>
                                        <img src={primaryUser?.avatar} alt="" className={styles.userAvatar} />
                                        <span className={styles.userName}>
                                            {primaryUser?.isCurrentUser ? 'Bạn' : primaryUser?.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Items */}
                                <div className={styles.bubbleItems}>
                                    {round.items.map(item => (
                                        <div key={item.id} className={styles.itemRow}>
                                            <div className={styles.qtyCircle}>{item.quantity}</div>
                                            <span className={styles.itemName}>{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default function RoundHistoryPage() {
    return (
        <Suspense>
            <RoundHistoryContent />
        </Suspense>
    );
}
