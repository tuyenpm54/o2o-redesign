"use client";

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft, History, Users, CheckCircle2, Crown, ReceiptText, ChevronRight, Send, Filter, ListOrdered, List, ClockAlert, BellRing, AlertCircle
} from 'lucide-react';
import styles from './page.module.css';
import CheckoutSheet from './CheckoutSheet';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';

function TableOrdersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const resid = searchParams.get('resid') || '100'; // Fallback if missing, though it should be there
    const tableid = searchParams.get('tableid') || 'A-12';
    const fromPath = searchParams.get('from');
    const { user, logout } = useAuth();
    const { t, language } = useLanguage();

    const MOCK_COLORS = ["#3B82F6", "#EF4444", "#EC4899", "#F59E0B", "#8B5CF6", "#10B981"];

    const [selectedMemberId, setSelectedMemberId] = useState<'me' | 'all' | string>('all');
    const [members, setMembers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [unreadChatCount, setUnreadChatCount] = useState(0);
    const [lastUnreadMsg, setLastUnreadMsg] = useState<string | null>(null);
    // Demo mode is now disabled, we use real real-time tracking

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    const [isTableClosed, setIsTableClosed] = useState(false);
    const [viewMode, setViewMode] = useState<'summary' | 'timeline'>('timeline');
    const [isCheckoutSheetOpen, setIsCheckoutSheetOpen] = useState(false);
    const [isRequestingPayment, setIsRequestingPayment] = useState(false);
    const [hasRequestedPayment, setHasRequestedPayment] = useState(false);
    const [now, setNow] = useState(Date.now());
    const mountTimeRef = React.useRef(Date.now()); // treat mount time as order placement time
    const lastChatCheckRef = React.useRef<number>(Date.now() - 5000);

    // 1-second clock for countdowns
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Poll for unread chat messages
    useEffect(() => {
        const checkUnread = async () => {
            try {
                const res = await fetch(`/api/chat?resid=${resid}&tableid=${tableid}`);
                if (res.status === 401) {
                    logout(`/menu?resid=${resid}&tableid=${tableid}`);
                    return;
                }
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

        checkUnread(); // Initial check only
    }, []);

    const localVersionRef = useRef<number>(0);

    useEffect(() => {
        const fetchData = async (force=false) => {
            try {
                if (!force) {
                    const syncRes = await fetch(`/api/restaurants/${resid}/sync?tableid=${tableid}`);
                    if (syncRes.ok) {
                        const { version } = await syncRes.json();
                        if (typeof version === 'number' && version <= localVersionRef.current) return;
                        if (typeof version === 'number') localVersionRef.current = version;
                    }
                }

                const res = await fetch(`/api/restaurants/${resid}/live?tableid=${tableid}`);
                if (!res.ok) return;
                const data = await res.json();
                if (!localVersionRef.current) localVersionRef.current = Date.now();

                if (data.members) {
                    setMembers(data.members);
                }
                if (data.tableClosedTimestamp && data.tableClosedTimestamp > mountTimeRef.current && !isTableClosed) {
                    setIsTableClosed(true);
                }

                // Sync payment request status from backend
                if (data.supportRequests) {
                    const hasPendingPayment = data.supportRequests.some((req: any) => 
                        (req.text === "Thanh toán" || req.text === "Yêu cầu thanh toán") && 
                        req.status !== 'Xong' && req.status !== 'Hoàn thành'
                    );
                    if (hasPendingPayment) setHasRequestedPayment(true);
                }
            } catch (err) {
                console.error("Failed to fetch table orders:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData(true);
        const interval = setInterval(fetchData, 5000); // Poll every 5s for snappy updates
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
    const totalQty = [...pendingOrders, ...confirmedOrders].reduce((acc, o) => acc + (o.qty || 1), 0);
    const pendingTotalAmount = pendingOrders.reduce((acc: number, o: any) => acc + (o.price * (o.qty || 1)), 0);
    const pendingTotalQty = pendingOrders.reduce((acc: number, o: any) => acc + (o.qty || 1), 0);

    const groupedRounds = React.useMemo(() => {
        if (viewMode !== 'timeline') return [];
        const roundsMap: Record<string, { time: number, items: any[] }> = {};
        
        confirmedOrders.forEach((o: any) => {
            const tsStr = o.timestamp || o.time;
            const tsNum = Number(tsStr);
            const time = !isNaN(tsNum) ? tsNum : (tsStr ? new Date(tsStr).getTime() : 0);
            
            // Group by strict roundId from order or a 1-minute bucket if missing
            const key = o.roundId || o.round || (Math.floor(time / 60000).toString());
            
            if (!roundsMap[key]) {
                roundsMap[key] = { time, items: [] };
            }
            roundsMap[key].items.push(o);
        });
        
        return Object.entries(roundsMap)
            .sort(([, a], [, b]) => b.time - a.time) // Newest rounds block first
            .map(([id, data]) => ({ id, time: data.time || mountTimeRef.current, items: data.items }));
    }, [confirmedOrders, viewMode]);

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

    const handleRemind = async (orderName: string) => {
        try {
            await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resid,
                    tableid,
                    user_id: user?.id,
                    content: `Khách hối làm món: ${orderName}`,
                    type: 'SUPPORT'
                })
            });
            alert(t('Đã gửi yêu cầu tới nhân viên'));
        } catch (err) {
            console.error("Gửi nhắc nhở thất bại", err);
        }
    };


    // Time-aware status info
    const getStatusInfo = (order: any) => {
        const status = (order.status || '').toLowerCase();

        // Terminal states: no time tracking needed
        if (status.includes('đã phục vụ') || status === 'served') {
            return { colorStyle: {} as React.CSSProperties, timeLabel: null, isLate: false };
        }

        // Fix: Use order.status_updated_at for accurate state tracking, fallback to timestamp
        const tsStr = order.status_updated_at || order.timestamp || order.time;
        const tsNum = Number(tsStr);
        const orderTime = !isNaN(tsNum) && tsNum > 0 ? tsNum : (tsStr ? new Date(tsStr).getTime() : 0);
        const baseTime = orderTime || mountTimeRef.current;
        
        // Real elapsed time
        const elapsedMs = now - baseTime;

        // SLA thresholds per status (minutes)
        const SLA: Record<string, { warn: number; danger: number }> = {
            'xác nhận': { warn: 3, danger: 5 },
            'chờ chế biến': { warn: 4, danger: 7 },
            'đang chế biến': { warn: 10, danger: 15 },
            'chờ phục vụ': { warn: 5, danger: 10 },
            'mang ra': { warn: 3, danger: 5 },
            'pending': { warn: 3, danger: 15 },
            'cooking': { warn: 10, danger: 15 },
        };

        const matchedKey = Object.keys(SLA).find(k => status.includes(k));
        const sla = matchedKey ? SLA[matchedKey] : SLA['pending'];

        let colorStyle: React.CSSProperties = {};
        let isLate = false;
        let contextualTimeLabel = "";

        if (sla) {
            const prepTimeMs = sla.danger * 60000;
            const diffMs = prepTimeMs - elapsedMs;

            const formatTime = (ms: number) => {
                const absMs = Math.abs(ms);
                const m = Math.floor(absMs / 60000);
                const s = Math.floor((absMs % 60000) / 1000);
                return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            };

            if (diffMs < 0) {
                colorStyle = { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' };
                isLate = true;
                contextualTimeLabel = `${t('Trễ')} ${formatTime(diffMs)}`;
            } else {
                if (diffMs <= (sla.danger - sla.warn) * 60000) {
                    colorStyle = { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' };
                }
                
                const timeStr = formatTime(diffMs);
                contextualTimeLabel = `${t('Chờ')} ${timeStr}`;
            }
        }

        if (status.includes('chờ phục vụ') || status.includes('mang ra') || status === 'ready') {
            contextualTimeLabel = t("Đang mang ra bàn...");
            isLate = false;
        }

        return { colorStyle, timeLabel: contextualTimeLabel, isLate };
    };

    const renderOrderItem = (order: any, idx: number, isPending: boolean) => {
        const member = order.member;
        const { colorStyle, timeLabel, isLate } = getStatusInfo(order);

        let engStatus = 'Pending';
        const s = (order.status || '').toLowerCase();
        
        if (s === 'đã phục vụ' || s === 'served') {
            engStatus = 'Served';
        } else if (s === 'chờ phục vụ' || s.includes('mang ra') || s === 'ready') {
            engStatus = 'Ready';
        } else if (s.includes('chế biến') || s.includes('nấu') || s === 'cooking') {
            engStatus = 'Cooking';
        } else if (s === 'đã xác nhận' || s === 'confirmed') {
            engStatus = 'Confirmed';
        } else {
            engStatus = 'Pending';
        }

        let pillClass = styles.pillDefault;
        if (engStatus === 'Pending' || engStatus === 'Confirmed') pillClass = styles.pillPending;
        else if (engStatus === 'Cooking' || engStatus === 'Ready') pillClass = styles.pillCooking;
        else if (engStatus === 'Served') pillClass = styles.pillServed;
        else pillClass = styles.pillPending; // Default to pending

        return (
            <div key={`${isPending ? 'sel' : 'conf'}-${order.id}-${idx}`} className={styles.compactItem}>
                {/* LEFT: Item info */}
                <div className={styles.compactLeft}>
                    <div className={styles.compactTitleRow}>
                        <div className={styles.compactQtyBadge}>{order.qty || 1}x</div>
                        <div className={styles.compactItemDetails}>
                            <span className={styles.compactName}>{order.name}</span>
                            <span className={styles.compactPrice}>{new Intl.NumberFormat('vi-VN').format(order.price || 0)}đ</span>
                        </div>
                    </div>
                    {selectedMemberId === 'all' && viewMode !== 'timeline' && member && (
                        <div className={styles.compactMember}>
                            {member.avatar ? (
                                <img src={member.avatar} alt={member.name} className={styles.compactMemberAvatar} style={{ backgroundColor: member.color || '#E2E8F0' }} />
                            ) : (
                                <div className={styles.compactMemberInitials} style={{ backgroundColor: member.color || '#E2E8F0' }}>
                                    {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                            )}
                            <span className={styles.compactMemberName}>{member.name}</span>
                        </div>
                    )}
                </div>

                {/* RIGHT: Status stack */}
                <div className={styles.compactRight}>
                    <div className={`${styles.statusPill} ${pillClass}`}>
                        <span className={styles.pillText}>{isPending ? t('Đang chọn món') : t(engStatus.toUpperCase() === 'PENDING' ? 'Chờ xác nhận' : engStatus.toUpperCase())}</span>
                    </div>
                    {(!isPending && timeLabel && engStatus !== 'served') && (
                        isLate ? (
                            <button 
                                className={styles.lateActionBadge}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemind(order.name);
                                }}
                            >
                                <BellRing size={13} strokeWidth={2.5} className={styles.shakeAnimation} />
                                <span style={{ marginLeft: 2 }}>{t('Nhắc bếp')} • {timeLabel}</span>
                            </button>
                        ) : (
                            <span className={styles.compactTimer}>
                                <ClockAlert size={11} />
                                {timeLabel}
                            </span>
                        )
                    )}
                </div>
            </div>
        );
    };

    const isAllOrdering = selectedMemberId === 'all' &&
        members.some(m => (m.confirmedOrders || []).some((o: any) => ["CONFIRMED", "COOKING", "READY", "SERVED", "Chờ xác nhận", "Chờ chế biến", "Đang chế biến", "Chờ phục vụ", "Đang mang ra", "Đã phục vụ"].includes(o.status)));

    // Show checkout button when any order has been confirmed or beyond
    const showCheckoutButton = confirmedOrders.some((o: any) => {
        const s = (o.status || '').toLowerCase();
        return s.includes('xác nhận') || s.includes('chế biến') || s.includes('phục vụ')
            || s.includes('mang ra') || ['confirmed', 'cooking', 'ready', 'served'].includes(s);
    });


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
                    if (window.history.length > 2) {
                        router.back();
                    } else if (fromPath) {
                        if (fromPath.includes('resid=')) {
                            router.push(fromPath);
                        } else {
                            const separator = fromPath.includes('?') ? '&' : '?';
                            router.push(`${fromPath}${separator}resid=${resid}&tableid=${tableid}`);
                        }
                    } else {
                        router.push(`/menu?resid=${resid}&tableid=${tableid}`);
                    }
                }}>
                    <ArrowLeft size={24} />
                </button>
                <div className={styles.headerTitle}>
                    <h1>{t('Chi tiết gọi món')}</h1>
                    <div className={styles.headerAvatars}>
                       <span className={styles.headerSubtitleText}>{t('Bàn')} {tableid}</span>
                    </div>
                </div>
                <div className={styles.headerRight}>
                    <button className={styles.historyBtn} onClick={() => setIsFilterModalOpen(true)} style={{ marginRight: '8px', color: selectedMemberId !== 'all' ? '#DF1B41' : 'inherit' }}>
                        <Filter size={20} />
                    </button>
                    <button className={styles.historyBtn} onClick={() => setIsSortModalOpen(true)} title={t('Sắp xếp')}>
                        <ListOrdered size={20} />
                    </button>
                </div>
            </header>



            <main className={styles.orderArea}>
                <div className={styles.orderList}>
                    {confirmedOrders.length === 0 ? (
                        <div className={styles.emptyState}>
                            <p>{t('Chưa có món nào')}</p>
                        </div>
                    ) : (
                        <>

                            {confirmedOrders.length > 0 && viewMode === 'summary' && (
                                <div className={styles.groupSection}>
                                    <h3 className={styles.groupTitle}>{t('Món đã gọi')} ({confirmedOrders.reduce((acc: number, o: any) => acc + (o.qty || 1), 0)})</h3>
                                    {confirmedOrders.map((o: any, i: number) => renderOrderItem(o, i, false))}
                                </div>
                            )}

                            {confirmedOrders.length > 0 && viewMode === 'timeline' && (
                                <div className={styles.timelineSection}>
                                    {groupedRounds.map((round: any, rIndex: number) => (
                                        <div key={round.id} className={styles.roundGroup}>
                                            <div className={styles.roundHeader}>
                                                <div className={styles.roundDot}></div>
                                                <div style={{ flex: 1, paddingBottom: 6 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                                        {(() => {
                                                            const publisher = round.items[0]?.member;
                                                            const itemCount = round.items.reduce((acc: number, o: any) => acc + (o.qty || 1), 0);
                                                            const hm = Number.isNaN(round.time) ? '' : new Date(round.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                            return <>
                                                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748B' }}>{hm}</span>
                                                                <span style={{ color: '#CBD5E1', fontSize: '0.8rem' }}>•</span>
                                                                {publisher?.avatar ? (
                                                                    <img src={publisher.avatar} alt={publisher.name} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
                                                                ) : publisher ? (
                                                                    <div style={{ width: 18, height: 18, borderRadius: '50%', backgroundColor: publisher.color || '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px', fontWeight: 'bold', color: 'white' }}>
                                                                        {publisher.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                                                                    </div>
                                                                ) : null}
                                                                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#1E293B' }}>{publisher ? publisher.name : t('Khách')}</h4>
                                                                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#64748B' }}>{t('gọi')} {itemCount} {t('món')}</span>
                                                            </>;
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={styles.roundItems}>
                                                {round.items.map((o: any, i: number) => renderOrderItem(o, i, false))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>



            {confirmedOrders.length > 0 && (
                <div className={styles.invoiceStickyFooter}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showCheckoutButton ? '12px' : '0', width: '100%' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 600, color: '#334155' }}>{t('Tổng tiền tạm tính')}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#DF1B41' }}>{new Intl.NumberFormat('vi-VN').format(totalAmount)}đ</span>
                    </div>
                    {showCheckoutButton && (
                        <button 
                            className="btn-footer-primary" 
                            style={{ 
                                backgroundColor: hasRequestedPayment ? '#94A3B8' : '#10B981', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                gap: '8px', 
                                opacity: (isRequestingPayment || hasRequestedPayment) ? 0.7 : 1 
                            }} 
                            disabled={isRequestingPayment || hasRequestedPayment}
                            onClick={async () => {
                                setIsRequestingPayment(true);
                                try {
                                    const res = await fetch("/api/chat", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({
                                            resid,
                                            tableid,
                                            user_id: user?.id,
                                            content: "Yêu cầu thanh toán",
                                            type: "SUPPORT",
                                        }),
                                    });
                                    if (res.ok) {
                                        setHasRequestedPayment(true);
                                        setIsCheckoutSheetOpen(true);
                                    } else {
                                        alert(t('Có lỗi xảy ra khi gửi yêu cầu'));
                                    }
                                } catch (err) {
                                    alert(t('Có lỗi xảy ra khi gửi yêu cầu'));
                                } finally {
                                    setIsRequestingPayment(false);
                                }
                            }}
                        >
                            {isRequestingPayment ? <Loader2 size={20} className={styles.spinner} /> : <ReceiptText size={20} />}
                            {isRequestingPayment ? t('Đang gửi...') : (hasRequestedPayment ? t('Đã gửi yêu cầu thanh toán..') : t('Yêu cầu thanh toán'))}
                        </button>
                    )}
                </div>
            )}

            <CheckoutSheet
                isOpen={isCheckoutSheetOpen}
                onClose={() => setIsCheckoutSheetOpen(false)}
                totalAmount={totalAmount}
                resid={resid}
                tableid={tableid}
                userId={user?.id}
                onPaymentSent={() => {}}
            />



            {/* Filter Modal for Compact Mode */}
            {isFilterModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsFilterModalOpen(false)}>
                    <div className={styles.filterModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{t('Lọc theo người gọi')}</h3>
                            <button onClick={() => setIsFilterModalOpen(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <div className={styles.filterOptions}>
                            <button
                                className={`${styles.filterOption} ${selectedMemberId === 'all' ? styles.filterActive : ''}`}
                                onClick={() => { setSelectedMemberId('all'); setIsFilterModalOpen(false); }}
                            >
                                <div className={styles.filterIconBox}><Users size={18} /></div>
                                <span>{t('Cả bàn')}</span>
                            </button>
                            {members.map(m => {
                                const isMe = m.id === user?.id;
                                const isActive = selectedMemberId === 'me' ? isMe : selectedMemberId === m.id;
                                return (
                                    <button
                                        key={m.id}
                                        className={`${styles.filterOption} ${isActive ? styles.filterActive : ''}`}
                                        onClick={() => { setSelectedMemberId(isMe ? 'me' : m.id); setIsFilterModalOpen(false); }}
                                    >
                                        <div className={styles.filterAvatarBox}>
                                            {m.avatar ? (
                                                <img src={m.avatar} alt={m.name} />
                                            ) : (
                                                <div className={styles.initialsSmall} style={{ backgroundColor: m.color || '#64748B' }}>
                                                    {m.name[0].toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span>{isMe ? t('Tôi') : m.name}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
            {/* Sort Modal */}
            {isSortModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsSortModalOpen(false)}>
                    <div className={styles.filterModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <h3>{t('Chế độ xem')}</h3>
                            <button onClick={() => setIsSortModalOpen(false)} className={styles.closeBtn}>×</button>
                        </div>
                        <div className={styles.filterOptions}>
                            <button
                                className={`${styles.filterOption} ${viewMode === 'summary' ? styles.filterActive : ''}`}
                                onClick={() => { setViewMode('summary'); setIsSortModalOpen(false); }}
                            >
                                <div className={styles.filterIconBox}><List size={18} /></div>
                                <span>{t('Tổng hợp (Mặc định)')}</span>
                            </button>
                            <button
                                className={`${styles.filterOption} ${viewMode === 'timeline' ? styles.filterActive : ''}`}
                                onClick={() => { setViewMode('timeline'); setIsSortModalOpen(false); }}
                            >
                                <div className={styles.filterIconBox}><History size={18} /></div>
                                <span>{t('Theo thời gian (Lượt gọi)')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Table Closed Modal */}
        {isTableClosed && (
            <div className={styles.modalOverlay} style={{ zIndex: 9999, padding: '20px', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ 
                    background: 'white', 
                    borderRadius: '24px', 
                    textAlign: 'center', 
                    padding: '32px 24px', 
                    maxWidth: '340px',
                    width: '100%',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                }}>
                    <div style={{ background: '#FEF2F2', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <AlertCircle size={32} color="#DC2626" />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '12px', color: '#111827' }}>
                        {t("Bàn đã đóng")}
                    </h3>
                    <p style={{ color: '#4B5563', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '24px' }}>
                        {t("Lượt sử dụng bàn này đã kết thúc. Vui lòng quét lại mã QR tại bàn để có thể gọi món.")}
                    </p>
                    <button
                        onClick={() => {
                            logout(`/menu?resid=${resid}&tableid=${tableid}`);
                        }}
                        style={{
                            background: '#DC2626',
                            color: 'white',
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            fontWeight: 700,
                            fontSize: '1.1rem',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        {t("OK, Đã hiểu")}
                    </button>
                </div>
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
