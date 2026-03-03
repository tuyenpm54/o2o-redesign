"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, History, Users, CheckCircle2, Crown, ReceiptText, ChevronRight, Send
} from 'lucide-react';
import styles from './page.module.css';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';

function TableOrdersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resid = searchParams.get('resid') || '100'; // Fallback if missing, though it should be there
    const tableid = searchParams.get('tableid') || 'A-12';
    const fromPath = searchParams.get('from') || '/single-order-page';
    const { user } = useAuth();
    const { t, language } = useLanguage();

    const MOCK_COLORS = ["#3B82F6", "#EF4444", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981"];

    const [selectedMemberId, setSelectedMemberId] = useState<'me' | 'all' | string>('me');
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/restaurants/${resid}/live?tableid=${tableid}`);
                const data = await res.json();
                if (data.members) {
                    setMembers(data.members);
                }
            } catch (err) {
                console.error("Failed to fetch table orders:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [resid, tableid]);

    // Aggregate orders based on selection
    const getDisplayData = () => {
        if (members.length === 0) return { pending: [], confirmed: [] };

        if (selectedMemberId === 'all') {
            const allPending: any[] = [];
            const allConfirmed: any[] = [];
            members.forEach(m => {
                const memberInfo = {
                    id: m.id,
                    name: m.name,
                    avatar: m.avatar,
                    color: m.color || MOCK_COLORS[m.name.length % MOCK_COLORS.length]
                };
                (m.draftItems || []).forEach((d: any) => allPending.push({
                    ...d.item,
                    qty: d.quantity,
                    status: 'DANG_CHON',
                    member: memberInfo
                }));
                (m.confirmedOrders || []).forEach((c: any) => allConfirmed.push({
                    ...c,
                    member: memberInfo
                }));
            });
            return { pending: allPending, confirmed: allConfirmed };
        }

        const targetId = selectedMemberId === 'me' ? user?.id : selectedMemberId;
        const member = members.find(m => m.id === targetId);

        if (!member) return { pending: [], confirmed: [] };

        const memberInfo = {
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            color: member.color || MOCK_COLORS[member.name.length % MOCK_COLORS.length]
        };

        return {
            pending: (member.draftItems || []).map((d: any) => ({
                ...d.item,
                qty: d.quantity,
                status: 'DANG_CHON',
                member: memberInfo
            })),
            confirmed: (member.confirmedOrders || []).map((c: any) => ({
                ...c,
                member: memberInfo
            }))
        };
    };

    const { pending: pendingOrders, confirmed: confirmedOrders } = getDisplayData();
    const totalAmount = [...pendingOrders, ...confirmedOrders].reduce((acc, o) => acc + (o.price * (o.qty || 1)), 0);

    const handlePlaceOrder = async () => {
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resId: resid })
            });

            if (res.ok) {
                // Refresh data
                const liveRes = await fetch(`/api/restaurants/${resid}/live?tableid=${tableid}`);
                const data = await liveRes.json();
                if (data.members) {
                    setMembers(data.members);
                }
                alert(t("Đã gửi yêu cầu gọi món thành công!"));
                // If it was from "Me" tab, maybe keep context or stay there
            } else {
                const data = await res.json();
                alert(data.error || t("Gửi yêu cầu gọi món thất bại"));
            }
        } catch (err) {
            console.error("Place order failed:", err);
        }
    };

    const getStatusClass = (status: string) => {
        if (!status) return styles.pending;
        const s = status.toLowerCase();
        if (s.includes('xác nhận')) return styles.pendingConfirm;
        if (s.includes('chờ chế biến')) return styles.waitingCook;
        if (s.includes('đang chế biến')) return styles.cooking;
        if (s.includes('chờ phục vụ')) return styles.waitingServe;
        if (s.includes('mang ra')) return styles.serving;
        if (s.includes('phục vụ')) return styles.served;
        return styles.pending;
    };

    const renderOrderItem = (order: any, idx: number, isPending: boolean) => {
        const member = order.member;
        return (
            <div key={`${isPending ? 'sel' : 'conf'}-${order.id}-${idx}`} className={styles.orderItem}>
                <div className={styles.itemInfoWrapper}>
                    {selectedMemberId === 'all' && member && (
                        member.avatar ? (
                            <img
                                src={member.avatar}
                                alt={member.name}
                                className={styles.memberAvatarTiny}
                                style={{ backgroundColor: member.color }}
                            />
                        ) : (
                            <div className={styles.memberAvatarInitialsTiny} style={{ backgroundColor: member.color }}>
                                {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                        )
                    )}
                    <div className={styles.itemMain}>
                        <h3>{order.name}</h3>
                        <div className={styles.itemMeta}>
                            <span className={styles.qty}>x{order.qty || 1}</span>
                            <span className={styles.dot}>•</span>
                            <span className={styles.price}>{(order.price || 0).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                        </div>
                    </div>
                </div>
                <div className={`${styles.statusBadge} ${isPending ? styles.pending : getStatusClass(order.status)}`}>
                    {isPending ? t('Đang chọn') : t(order.status)}
                </div>
            </div>
        );
    };

    const isAllOrdering = selectedMemberId === 'all' &&
        members.some(m => (m.confirmedOrders || []).some((o: any) => ["CONFIRMED", "COOKING", "READY", "SERVED", "Chờ xác nhận", "Chờ chế biến", "Đang chế biến", "Chờ phục vụ", "Đang mang ra", "Đã phục vụ"].includes(o.status)));

    if (isLoading) {
        return (
            <div className={styles.loadingWrapper}>
                <Loader2 className={styles.spinner} />
                <span>{t('Đang tải thông tin bàn...')}</span>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push(`${fromPath}?resid=${resid}&tableid=${tableid}`)}>
                    <ArrowLeft size={24} />
                </button>
                <div className={styles.headerTitle}>
                    <h1>{t('Chi tiết gọi món')}</h1>
                    <span>{t('Bàn')} {tableid} • {members.length} {t('người')}</span>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.historyBtn} onClick={() => router.push(`/order-history/rounds?resid=${resid}&tableid=${tableid}`)}>
                        <History size={20} />
                    </button>
                </div>
            </header>

            <div className={styles.memberSlider}>
                {/* All Option */}
                <button className={`${styles.memberItem} ${selectedMemberId === 'all' ? styles.active : ''}`} onClick={() => setSelectedMemberId('all')}>
                    <div className={styles.avatarWrapper} style={{ position: 'relative', overflow: 'visible' }}>
                        <div className={styles.allWrapper}>
                            <Users size={24} color={selectedMemberId === 'all' ? '#F97316' : '#64748B'} />
                        </div>
                        {/* Summary of items at table */}
                        <div className={styles.speechBubble}>
                            {members.reduce((acc, m) => acc + (m.draftItems?.length || 0) + (m.confirmedOrders?.length || 0), 0)} {t('món')}
                        </div>
                    </div>
                    <span className={styles.memberName}>{t('Cả bàn')}</span>
                </button>

                {/* current user (Me) logic moved into the list of members for better consistency */}
                {members.map((mem) => {
                    const isMe = mem.id === user?.id;
                    const isActive = selectedMemberId === 'me' ? isMe : selectedMemberId === mem.id;
                    const fallbackColor = mem.color || MOCK_COLORS[mem.name.length % MOCK_COLORS.length];
                    const hasItems = (mem.draftItems?.length || 0) > 0;

                    return (
                        <button
                            key={mem.id}
                            className={`${styles.memberItem} ${isActive ? styles.active : ''}`}
                            onClick={() => setSelectedMemberId(isMe ? 'me' : mem.id)}
                        >
                            <div className={styles.avatarWrapper} style={{ position: 'relative', overflow: 'visible' }}>
                                {mem.avatar ? (
                                    <img src={mem.avatar} alt={mem.name} className={styles.avatar} style={{ backgroundColor: fallbackColor }} />
                                ) : (
                                    <div className={styles.initials} style={{ backgroundColor: fallbackColor }}>
                                        {mem.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                )}
                                {isMe && (
                                    <div className={styles.meBadge}>
                                        <Crown size={10} fill="#F59E0B" color="#F59E0B" />
                                    </div>
                                )}
                                {mem.status === 'done' && (
                                    <div className={styles.doneBadge}>
                                        <CheckCircle2 size={12} fill="white" />
                                    </div>
                                )}
                                <div className={styles.speechBubble}>
                                    {isMe ? (hasItems ? t('đang chọn món...') : t('Chào bạn!')) : (mem.status === 'done' ? t('Đã xong') : '...')}
                                </div>
                            </div>
                            <span className={styles.memberName}>{isMe ? t('Tôi') : mem.name}</span>
                        </button>
                    );
                })}
            </div>

            <main className={styles.orderArea}>
                <div className={styles.orderList}>
                    {pendingOrders.length === 0 && confirmedOrders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>{t('Chưa có món nào')}</p>
                        </div>
                    ) : (
                        <>
                            {pendingOrders.length > 0 && (
                                <div className={styles.groupSection}>
                                    <h3 className={styles.groupTitle} style={{ color: '#F97316' }}>{t('Món đang chọn')} ({pendingOrders.length})</h3>
                                    {pendingOrders.map((o: any, i: number) => renderOrderItem(o, i, true))}
                                </div>
                            )}
                            {confirmedOrders.length > 0 && (
                                <div className={styles.groupSection}>
                                    <h3 className={styles.groupTitle}>{t('Món đã gọi')} ({confirmedOrders.length})</h3>
                                    {confirmedOrders.map((o: any, i: number) => renderOrderItem(o, i, false))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {pendingOrders.length > 0 && (selectedMemberId === 'me' || selectedMemberId === user?.id) && (
                <div className={styles.orderStickyFooter}>
                    <button className="btn-footer-primary" onClick={handlePlaceOrder}>
                        <Send size={20} />
                        {t('Gửi yêu cầu gọi món')} • {totalAmount.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ
                        <ChevronRight size={20} style={{ marginLeft: 'auto' }} />
                    </button>
                </div>
            )}

            {isAllOrdering && (
                <div className={styles.invoiceStickyFooter}>
                    <button className="btn-footer-primary" onClick={() => router.push(`/bill?resid=${resid}&tableid=${tableid}`)}>
                        <ReceiptText size={20} />
                        {t('Hoá đơn tạm tính')}
                        <ChevronRight size={20} style={{ marginLeft: 'auto' }} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default function TableOrdersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TableOrdersContent />
        </Suspense>
    );
}
