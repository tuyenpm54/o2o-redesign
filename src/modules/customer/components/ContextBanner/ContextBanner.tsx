"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Info, ClipboardList, CheckCircle2, ChefHat,
    Sparkles, UtensilsCrossed, ChevronRight, Clock, Bell,
    Utensils, StickyNote, Eraser, CreditCard, MessageSquare
} from 'lucide-react';
import styles from './ContextBanner.module.css';
import { ShopModel } from '@/config/shopConfig';
import Link from 'next/link';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'COOKING' | 'READY' | 'SERVED' | 'IDLE';

export interface Order {
    id: string;
    status: OrderStatus;
    timestamp: number;
}

export interface SupportRequest {
    id: string;
    items: string[];
    otherText?: string;
    status: 'PENDING' | 'CONFIRMED';
    createdAt: number;
    confirmedAt?: number;
}

const SUPPORT_LABELS: Record<string, string> = {
    'cutlery': 'Lấy thêm bát đũa',
    'napkin': 'Lấy giấy ăn',
    'clean': 'Dọn bàn',
    'payment': 'Yêu cầu thanh toán',
    'other': 'Yêu cầu khác',
};

const SUPPORT_ICONS: Record<string, any> = {
    'cutlery': Utensils,
    'napkin': StickyNote,
    'clean': Eraser,
    'payment': CreditCard,
    'other': MessageSquare,
};

export const STATUS_CONFIG: Record<OrderStatus, { text: string, icon: any, color: string, className: string, priority: number }> = {
    'IDLE': {
        text: "", // Handled by Onboarding Overlay
        icon: Bell,
        color: "#64748B",
        className: styles.idle,
        priority: 99
    },
    'PENDING': {
        text: "Yêu cầu đã được gửi, đợi chút để nhân viên xác nhận nhé",
        icon: Clock,
        color: "#F97316",
        className: styles.pending,
        priority: 2
    },
    'CONFIRMED': {
        text: "Nhân viên đã xác nhận và chuyển yêu cầu tới bếp",
        icon: CheckCircle2,
        color: "#10B981",
        className: styles.confirmed,
        priority: 4
    },
    'COOKING': {
        text: "Bếp đang chuẩn bị đồ cho bạn",
        icon: ChefHat,
        color: "#3B82F6",
        className: styles.cooking,
        priority: 3
    },
    'READY': {
        text: "Đồ của bạn đã xong rồi, đợi chút nhân viên sẽ mang ra bàn cho bạn nhé",
        icon: Sparkles,
        color: "#F59E0B",
        className: styles.ready,
        priority: 1
    },
    'SERVED': {
        text: "Đồ của bạn đã được phục vụ. Chúc bạn ngon miệng!",
        icon: UtensilsCrossed,
        color: "#10B981",
        className: styles.served,
        priority: 5
    },
};

interface ContextBannerProps {
    tableId?: string;
    model: ShopModel;
    activeOrders?: Order[];
    supportRequests?: SupportRequest[];
}

export const ContextBanner: React.FC<ContextBannerProps> = ({
    tableId = 'A-01',
    model,
    activeOrders = [],
    supportRequests = []
}) => {
    const [cycleIndex, setCycleIndex] = useState(0);
    const [tick, setTick] = useState(0);

    // Countdown effect for confirmed support requests
    useEffect(() => {
        const hasConfirmedRequest = supportRequests.some(req => req.status === 'CONFIRMED');
        if (!hasConfirmedRequest) return;
        const interval = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [supportRequests]);

    // 1. Extract and prioritize active statuses
    const activeDisplayItems = useMemo(() => {
        const items: { text: string; icon: any; color: string; status: string; priority: number }[] = [];

        // Order mapping
        const ongoingOrders = activeOrders.filter(o => o.status !== 'SERVED');
        if (ongoingOrders.length > 0) {
            // Sort by priority and timestamp
            const sortedOrders = [...ongoingOrders].sort((a, b) => {
                const pA = STATUS_CONFIG[a.status]?.priority || 99;
                const pB = STATUS_CONFIG[b.status]?.priority || 99;
                if (pA !== pB) return pA - pB;
                return b.timestamp - a.timestamp;
            });

            const topOrder = sortedOrders[0];
            const config = STATUS_CONFIG[topOrder.status];

            // Generate smart message for orders
            const counts = activeOrders.reduce((acc, o) => {
                acc[o.status] = (acc[o.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            let smartMsg = config.text;
            if (topOrder.status === 'READY' && (counts['COOKING'] || counts['CONFIRMED'])) {
                smartMsg = "Món mới đã sẵn sàng! (Các món còn lại vẫn đang nấu)";
            } else if (topOrder.status === 'PENDING' && (counts['COOKING'] || counts['CONFIRMED'])) {
                const totalOthers = (counts['COOKING'] || 0) + (counts['CONFIRMED'] || 0);
                smartMsg = `Đã gửi yêu cầu mới & ${totalOthers} món khác đang chuẩn bị...`;
            } else if (counts['PENDING'] > 1) {
                smartMsg = `Đang chờ nhà hàng xác nhận ${counts['PENDING']} lượt gọi món của bạn`;
            }

            items.push({
                text: smartMsg,
                icon: config.icon,
                color: config.color,
                status: topOrder.status,
                priority: config.priority
            });
        } else if (activeOrders.length > 0) {
            // All served
            const config = STATUS_CONFIG['SERVED'];
            items.push({
                text: config.text,
                icon: config.icon,
                color: config.color,
                status: 'SERVED',
                priority: config.priority
            });
        }

        // Support mapping
        supportRequests.forEach((req) => {
            let text = '';
            let color = '#F97316'; // Default orange
            let priority = 10;

            if (req.status === 'PENDING') {
                text = `Có 1 yêu cầu đang chờ xác nhận`;
                priority = 2.5; // High priority, similar to order PENDING
            } else if (req.status === 'CONFIRMED') {
                const elapsedSeconds = req.confirmedAt ? Math.floor((Date.now() - req.confirmedAt) / 1000) : 0;
                const remaining = Math.max(0, 30 - elapsedSeconds);
                text = `Nhân viên đã xác nhận và đang ra hỗ trợ (${remaining}s)`;
                color = '#3B82F6';
                priority = 3.5;
            }

            items.push({ text, icon: MessageSquare, color, status: req.status, priority });
        });

        // Final sort of display items by priority
        return items.sort((a, b) => a.priority - b.priority);
    }, [activeOrders, supportRequests, tick]);

    // 2. Auto-Cycling Effect
    useEffect(() => {
        if (activeDisplayItems.length <= 1) {
            setCycleIndex(0);
            return;
        }

        // If cycleIndex is somehow out of bounds after list update, reset it
        if (cycleIndex >= activeDisplayItems.length) {
            setCycleIndex(0);
        }

        const timer = setInterval(() => {
            setCycleIndex(prev => {
                const next = prev + 1;
                return next >= activeDisplayItems.length ? 0 : next;
            });
        }, 5000); // Cycle every 5 seconds

        return () => clearInterval(timer);
    }, [activeDisplayItems.length, cycleIndex]);

    const [isVisible, setIsVisible] = useState(true);

    const activeItem = useMemo(() => {
        return (activeDisplayItems.length > 0 && activeDisplayItems[cycleIndex])
            ? activeDisplayItems[cycleIndex]
            : {
                ...STATUS_CONFIG['IDLE'],
                status: 'IDLE' as OrderStatus
            };
    }, [activeDisplayItems, cycleIndex]);

    useEffect(() => {
        if (activeItem.status === 'IDLE') {
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(true);
        }
    }, [activeItem.status]);

    if (activeItem.status === 'IDLE') return null;

    // 3. Status Distribution for Progress Line
    const getDistribution = () => {
        if (activeOrders.length === 0) return null;
        const total = activeOrders.length;
        const served = activeOrders.filter(o => o.status === 'SERVED').length;
        const processing = activeOrders.filter(o => ['COOKING', 'CONFIRMED', 'READY'].includes(o.status)).length;
        const pending = activeOrders.filter(o => o.status === 'PENDING').length;

        return {
            served: (served / total) * 100,
            processing: (processing / total) * 100,
            pending: (pending / total) * 100
        };
    };

    const dist = getDistribution();

    const bannerContent = (
        <div className={`${styles.statusWidget} ${styles[activeItem.status.toLowerCase()] || ''}`}>
            {activeDisplayItems.length > 1 && (
                <div className={styles.cycleIndicator}>
                    {activeDisplayItems.map((_, i) => (
                        <div key={i} className={`${styles.dot} ${i === cycleIndex ? styles.activeDot : ''}`} />
                    ))}
                </div>
            )}

            <div className={styles.statusIconWrapper} style={{ '--status-color': activeItem.color } as any}>
                <activeItem.icon size={24} color={activeItem.color} className={styles.statusIconAnim} />
                {activeItem.status !== 'SERVED' && activeItem.status !== 'IDLE' && (
                    <span className={styles.statusPulse} style={{ '--status-color': activeItem.color } as any}></span>
                )}
            </div>

            <div className={styles.statusContent}>
                {activeItem.status !== 'IDLE' && <div className={styles.tableRef}>Bàn {tableId}</div>}
                <p className={styles.statusMessage}>{activeItem.text}</p>
            </div>

            {activeItem.status !== 'IDLE' && (
                <div className={styles.statusAction}>
                    <ChevronRight size={20} color={activeItem.color} />
                </div>
            )}

            {dist && activeItem.status !== 'IDLE' && (
                <div className={styles.progressLine}>
                    <div className={styles.progressPart} style={{ width: `${dist.served}%`, background: '#10B981' }} />
                    <div className={styles.progressPart} style={{ width: `${dist.processing}%`, background: '#3B82F6' }} />
                    <div className={styles.progressPart} style={{ width: `${dist.pending}%`, background: '#F97316' }} />
                </div>
            )}
        </div>
    );

    if (activeItem.status === 'IDLE') {
        return <div className={styles.statusLink}>{bannerContent}</div>;
    }

    return (
        <Link href="/order-history" className={styles.statusLink}>
            {bannerContent}
        </Link>
    );
};
