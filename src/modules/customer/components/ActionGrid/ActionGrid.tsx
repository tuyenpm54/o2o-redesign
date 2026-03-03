"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    Clock, MessageSquare, ReceiptText, ChevronRight, Menu,
    Snowflake, Droplets, StickyNote, Star, X, Check,
    Utensils, User
} from 'lucide-react';
import styles from './ActionGrid.module.css';
import { MODEL_COPY } from '@/constants/copy';
import { ShopModel } from '@/config/shopConfig';

interface ActionGridProps {
    model: ShopModel;
}

const IconMap: Record<string, typeof Clock> = {
    clock: Clock,
    message: MessageSquare,
    bill: ReceiptText,
    ice: Snowflake,
    water: Droplets,
    napkin: StickyNote,
    star: Star,
    cutlery: Utensils,
    staff: User
};

export const ActionGrid: React.FC<ActionGridProps> = ({ model }) => {
    const content = MODEL_COPY[model];
    const [showFeedback, setShowFeedback] = useState(false);

    // Status types: IDLE -> SENDING -> PENDING -> IN_PROGRESS -> IDLE
    type RequestStatus = 'IDLE' | 'SENDING' | 'PENDING' | 'IN_PROGRESS';

    // Map actionId -> Status
    const [requestStatuses, setRequestStatuses] = useState<Record<string, RequestStatus>>({});

    const handleSupportAction = (actionId: string) => {
        // Prevent action if not IDLE
        if (requestStatuses[actionId] && requestStatuses[actionId] !== 'IDLE') return;

        // 1. Set to SENDING
        setRequestStatuses(prev => ({ ...prev, [actionId]: 'SENDING' }));

        // Mock API call to server
        setTimeout(() => {

            // If payment, show feedback flow and reset immediately (or keep pending if real flow)
            if (actionId === 'payment') {
                setRequestStatuses(prev => ({ ...prev, [actionId]: 'IDLE' }));
                setShowFeedback(true);
                return;
            }

            // 2. Set to PENDING (Đang chờ - Request sent)
            setRequestStatuses(prev => ({ ...prev, [actionId]: 'PENDING' }));

            // Simulate Staff Confirmation after 5 seconds
            setTimeout(() => {
                // 3. Set to IN_PROGRESS (Đang nhận - Staff received)
                setRequestStatuses(prev => ({ ...prev, [actionId]: 'IN_PROGRESS' }));

                // Simulate Completion after another 10 seconds
                setTimeout(() => {
                    // 4. Back to IDLE
                    setRequestStatuses(prev => ({ ...prev, [actionId]: 'IDLE' }));
                }, 10000);

            }, 5000);

        }, 1500);
    };

    const getStatusText = (status: RequestStatus) => {
        switch (status) {
            case 'SENDING': return 'Đang gửi...';
            case 'PENDING': return 'Đang chờ';
            case 'IN_PROGRESS': return 'Đang nhận';
            default: return 'Nhấn để gọi';
        }
    };

    return (
        <div className={styles.container}>
            {/* Top Section: Bento Grid for Main Actions */}
            <div className={styles.heroGrid}>
                {/* LEVEL 1: Primary CTA (Large Block) */}
                <Link href="/order" className={styles.primaryLink}>
                    <button className={styles.primaryCard}>
                        <div className={styles.primaryContent}>
                            <div className={styles.primaryIconBox}>
                                <Menu size={28} color="white" />
                            </div>
                            <div className={styles.primaryTextBox}>
                                <span className={styles.primaryLabel}>Gọi món</span>
                                <span className={styles.primarySub}>Xem thực đơn</span>
                            </div>
                            <div className={styles.primaryAction}>
                                <ChevronRight size={20} />
                            </div>
                        </div>
                    </button>
                </Link>

                {/* LEVEL 2: Order Status (Side Block) */}
                {content.level2 && (
                    <Link href="/order-history" className={styles.secondaryLink}>
                        <button className={styles.secondaryCard}>
                            <div className={styles.secondaryContent}>
                                <div className={styles.secondaryHeader}>
                                    <div className={styles.statusGroup}>
                                        <Clock size={16} className={styles.secondaryIcon} />
                                        <span className={styles.statusText}>Đang chuẩn bị</span>
                                    </div>
                                    <span className={styles.secondaryBadge}>{content.level2.count} món</span>
                                </div>
                                <div className={styles.secondaryLabelGroup}>
                                    <span className={styles.secondaryLabel}>Đã gọi</span>
                                    <ChevronRight size={16} className={styles.chevronIcon} />
                                </div>
                            </div>
                        </button>
                    </Link>
                )}
            </div>

            {/* LEVEL 3: Support Selection */}
            {content.level3 && (
                <div className={styles.level3Container}>
                    <h3 className={styles.level3Title}>{content.level3.title}</h3>

                    {/* Action Grid */}
                    <div className={styles.level3Grid}>
                        {content.level3.actions.map((action) => {
                            const status = requestStatuses[action.id] || 'IDLE';
                            const isIdle = status === 'IDLE';

                            // Determine class based on status
                            let statusClass = '';
                            if (status === 'PENDING') statusClass = styles.pending;
                            if (status === 'IN_PROGRESS') statusClass = styles.inProgress;
                            if (status === 'SENDING') statusClass = styles.processing;

                            return (
                                <button
                                    key={action.id}
                                    className={`${styles.supportCard} ${statusClass}`}
                                    onClick={() => handleSupportAction(action.id)}
                                    disabled={!isIdle}
                                >
                                    <div className={styles.supportTextContent}>
                                        <span className={styles.supportLabel}>
                                            {action.label}
                                        </span>
                                        <span className={styles.supportStatus}>
                                            {getStatusText(status)}
                                        </span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Legacy secondary actions if any */}
            {!content.level3 && content.secondaryActions.length > 0 && (
                <div className={styles.secondaryGrid}>
                    {content.secondaryActions.map((action) => {
                        const Icon = IconMap[action.icon];
                        return (
                            <button key={action.id} className={styles.secondaryCard}>
                                <div className={styles.iconWrapper}>
                                    <div className={`${styles.iconCircle} ${styles[action.color]}`}>
                                        <Icon size={20} />
                                    </div>
                                </div>
                                <span className={styles.cardLabel}>{action.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Feedback Invitation Overlay */}
            {showFeedback && (
                <div className={styles.feedbackOverlay}>
                    <div className={`${styles.feedbackCard} glass`}>
                        <button className={styles.closeBtn} onClick={() => setShowFeedback(false)}>
                            <X size={20} />
                        </button>
                        <div className={styles.feedbackIcon}>
                            <Star size={40} fill="hsl(var(--primary))" color="hsl(var(--primary))" />
                        </div>
                        <h2 className={styles.feedbackTitle}>Cảm ơn quý khách!</h2>
                        <p className={styles.feedbackText}>
                            Yêu cầu thanh toán đã được gửi. Quý khách vui lòng dành chút thời gian đánh giá dịch vụ nhé!
                        </p>
                        <button className={styles.feedbackActionBtn}>
                            Đánh giá ngay
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
