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
    const fromPath = searchParams.get('from') || '/menu?style=single-order-page';
    const { user } = useAuth();
    const { t, language } = useLanguage();

    const MOCK_COLORS = ["#3B82F6", "#EF4444", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981"];

    const [selectedMemberId, setSelectedMemberId] = useState<'me' | 'all' | string>('me');
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [lastUnreadMsg, setLastUnreadMsg] = useState<string | null>(null);
    // Demo mode: each real 5s = 2 simulated minutes
    const [demoOffset, setDemoOffset] = useState(0); // simulated extra ms
    const mountTimeRef = React.useRef(Date.now()); // treat mount time as order placement time
    const lastChatCheckRef = React.useRef<number>(Date.now() - 5000);

    // Poll for unread chat messages
    useEffect(() => {
        const checkUnread = async () => {
            try {
                const res = await fetch('/api/chat');
                if (res.ok) {
                    const msgs = await res.json();
                    const restaurantMsgs = msgs.filter((m: any) =>
                        m.sender === 'restaurant' &&
                        m.timestamp &&
                        m.timestamp > lastChatCheckRef.current
                    );
                    if (restaurantMsgs.length > 0) {
                        setUnreadChatCount(prev => prev + restaurantMsgs.length);
                        setLastUnreadMsg(restaurantMsgs[restaurantMsgs.length - 1].content);
                        lastChatCheckRef.current = Date.now();
                    }
                }
            } catch (err) {
                console.error("Failed to check unread chat:", err);
            }
        };

        const interval = setInterval(checkUnread, 5000);
        checkUnread(); // Initial check
        return () => clearInterval(interval);
    }, []);

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

    // Demo tick: every 5 real seconds = +2 simulated minutes
    useEffect(() => {
        const SIMULATED_PER_TICK = 2 * 60 * 1000; // 2 minutes in ms
        const timer = setInterval(() => setDemoOffset(prev => prev + SIMULATED_PER_TICK), 5000);
        return () => clearInterval(timer);
    }, []);

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

    const handleCancelOrder = async (orderId: number) => {
        if (!confirm(t('Bạn muốn huỷ món này?'))) return;
        try {
            const res = await fetch('/api/orders/cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, resid })
            });
            if (res.ok) {
                // Refresh data
                const liveRes = await fetch(`/api/restaurants/${resid}/live?tableid=${tableid}`);
                const data = await liveRes.json();
                if (data.members) {
                    setMembers(data.members);
                }
            } else {
                const data = await res.json();
                alert(data.error || t("Huỷ món thất bại"));
            }
        } catch (err) {
            console.error("Cancel order failed:", err);
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

    // Time-aware status info (demo mode: demoOffset advances 2min per 5s tick)
    const getStatusInfo = (order: any) => {
        const status = (order.status || '').toLowerCase();

        // Terminal states: no time tracking needed
        if (status.includes('đã phục vụ') || status === 'served') {
            return { colorStyle: {} as React.CSSProperties, timeLabel: null, isLate: false };
        }

        // Use confirmedAt if available, otherwise treat mount time as baseline
        const baseTime = order.confirmedAt
            ? new Date(order.confirmedAt).getTime()
            : mountTimeRef.current;
        // Simulated elapsed = real elapsed + demo offset
        const realElapsed = Date.now() - baseTime;
        const elapsedMs = realElapsed + demoOffset;
        const elapsedMin = Math.floor(elapsedMs / 60000);

        // SLA thresholds per status (minutes)
        const SLA: Record<string, { warn: number; danger: number }> = {
            'xác nhận': { warn: 3, danger: 5 },
            'chờ chế biến': { warn: 4, danger: 7 },
            'đang chế biến': { warn: 10, danger: 15 },
            'chờ phục vụ': { warn: 5, danger: 10 },
            'mang ra': { warn: 3, danger: 5 },
        };

        const matchedKey = Object.keys(SLA).find(k => status.includes(k));
        const sla = matchedKey ? SLA[matchedKey] : null;

        let colorStyle: React.CSSProperties = {};
        let isLate = false;
        if (sla) {
            if (elapsedMin >= sla.danger) {
                colorStyle = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' };
                isLate = true;
            } else if (elapsedMin >= sla.warn) {
                colorStyle = { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' };
            }
        }

        const timeLabel = elapsedMin > 0 ? `${elapsedMin}p` : null;
        return { colorStyle, timeLabel, isLate };
    };



    const renderOrderItem = (order: any, idx: number, isPending: boolean) => {
        const member = order.member;
        const { colorStyle, timeLabel, isLate } = getStatusInfo(order);
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
                            {!isPending && order.status === 'Chờ xác nhận' && (
                                <button style={{ marginLeft: '12px', fontSize: '11px', color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0', textDecoration: 'underline' }} onClick={() => handleCancelOrder(order.id)}>
                                    {t('Huỷ món')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div
                    className={`${styles.statusBadge} ${isPending ? styles.pending : getStatusClass(order.status)}`}
                    style={!isPending ? colorStyle : {}}
                >
                    <span>{isPending ? t('Đang chọn') : t(order.status)}</span>
                    {!isPending && timeLabel && (
                        <span style={{
                            fontSize: '10px',
                            marginTop: '2px',
                            opacity: 0.85,
                            display: 'block',
                            fontWeight: isLate ? 700 : 500
                        }}>{timeLabel} {isLate ? '⚠️' : ''}</span>
                    )}
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
                <button className={styles.backBtn} onClick={() => {
                    if (fromPath.includes('resid=')) {
                        router.push(fromPath);
                    } else {
                        const separator = fromPath.includes('?') ? '&' : '?';
                        router.push(`${fromPath}${separator}resid=${resid}&tableid=${tableid}`);
                    }
                }}>
                    <ArrowLeft size={24} />
                </button>
                <div className={styles.headerTitle}>
                    <h1>{t('Chi tiết gọi món')}</h1>
                    <span>{t('Bàn')} {tableid} • {members.length} {t('người')}</span>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.historyBtn} onClick={() => router.push(`/order-history/rounds?resid=${resid}&tableid=${tableid}&from=${encodeURIComponent(`/table-orders?resid=${resid}&tableid=${tableid}&from=${encodeURIComponent(fromPath)}`)}`)}>
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
                                {(!hasItems && (mem.confirmedOrders?.length || 0) > 0) && (
                                    <div className={styles.doneBadge}>
                                        <CheckCircle2 size={12} fill="white" />
                                    </div>
                                )}
                                <div className={styles.speechBubble}>
                                    {isMe
                                        ? (hasItems ? t('đang chọn món...') : t('Chào bạn!'))
                                        : (hasItems ? '...' : ((mem.confirmedOrders?.length || 0) > 0 ? t('Đã gọi') : t('Đang xem')))
                                    }
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
                    <button className="btn-footer-primary" onClick={() => router.push(`/bill?resid=${resid}&tableid=${tableid}&from=${encodeURIComponent(`/table-orders?resid=${resid}&tableid=${tableid}&from=${encodeURIComponent(fromPath)}`)}`)}>
                        <ReceiptText size={20} />
                        {t('Hoá đơn tạm tính')}
                        <ChevronRight size={20} style={{ marginLeft: 'auto' }} />
                    </button>
                </div>
            )}

            <div className={styles.fabSupportWrapper}>
                {unreadChatCount > 0 && lastUnreadMsg && (
                    <div className={styles.supportBubble}>
                        {lastUnreadMsg}
                    </div>
                )}
                <button className={styles.fabSupportPill} onClick={() => { setUnreadChatCount(0); setLastUnreadMsg(null); lastChatCheckRef.current = Date.now(); router.push(`/chat?from=${encodeURIComponent(`/table-orders?resid=${resid}&tableid=${tableid}&from=${encodeURIComponent(fromPath)}`)}`); }}>
                    <div className={styles.staffAvatarWrapper}>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Staff&backgroundColor=ffdfbf" className={styles.staffAvatarMini} alt="Staff" />
                        <div className={styles.onlineDot}></div>
                    </div>
                    <span className={styles.supportText}>{t('Hỗ trợ')}</span>
                    {unreadChatCount > 0 && (
                        <span className={styles.chatUnreadBadge}>{unreadChatCount}</span>
                    )}
                </button>
            </div>
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
