"use client";

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, User, Utensils, ChefHat } from 'lucide-react';
import styles from './page.module.css';

const ORDER_FLOW = [
    'Chờ xác nhận',
    'Đã xác nhận',
    'Đang chế biến',
    'Chờ phục vụ',
    'Đã phục vụ'
];

export default function PosPage() {
    const [tables, setTables] = useState<any[]>([]);
    const [activeTableId, setActiveTableId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [activeRoundId, setActiveRoundId] = useState<string | null>(null);

    const parseDate = (ts: any) => {
        if (!ts) return null;
        const n = Number(ts);
        const d = new Date(isNaN(n) ? ts : n);
        return isNaN(d.getTime()) ? null : d;
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();
                setTables(data.tables || []);
            }
        } catch (e) {
            console.error("Failed to fetch admin orders", e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 3000); // Poll every 3 seconds for new orders
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = async (userId: string, orderId: string, currentStatus: string) => {
        const currentIndex = ORDER_FLOW.indexOf(currentStatus);
        if (currentIndex === -1 || currentIndex === ORDER_FLOW.length - 1) return; // Unknown or already final

        const newStatus = ORDER_FLOW[currentIndex + 1];

        try {
            // Optimistic update
            setTables(prev => prev.map(t => {
                if (t.id === activeTableId) {
                    return {
                        ...t,
                        users: t.users.map((u: any) => {
                            if (u.userId === userId) {
                                return {
                                    ...u,
                                    orders: u.orders.map((o: any) =>
                                        o.id === orderId ? { ...o, status: newStatus } : o
                                    )
                                }
                            }
                            return u;
                        })
                    }
                }
                return t;
            }));

            const res = await fetch('/api/admin/orders/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    resid: '100', // Hardcoded demo resid
                    tableid: activeTableId,
                    orderId,
                    newStatus
                })
            });

            if (!res.ok) {
                // Revert optimistic update on failure by refetching
                fetchOrders();
            }

        } catch (e) {
            console.error("Failed to update status", e);
            fetchOrders();
        }
    };

    const handleUpdateRound = async (roundItems: any[]) => {
        if (!roundItems.length) return;

        // Find the lowest status in the round
        let lowestStatusIndex = ORDER_FLOW.length;
        roundItems.forEach(item => {
            const idx = ORDER_FLOW.indexOf(item.status);
            if (idx !== -1 && idx < lowestStatusIndex) lowestStatusIndex = idx;
        });

        if (lowestStatusIndex >= ORDER_FLOW.length - 1) return;

        const newStatus = ORDER_FLOW[lowestStatusIndex + 1];

        // Filter items that need updating
        const itemsToUpdate = roundItems.filter(item => ORDER_FLOW.indexOf(item.status) < ORDER_FLOW.indexOf(newStatus));
        if (!itemsToUpdate.length) return;

        const itemsByUser = new Map<string, string[]>();
        itemsToUpdate.forEach(item => {
            if (!itemsByUser.has(item.userId)) {
                itemsByUser.set(item.userId, []);
            }
            itemsByUser.get(item.userId)!.push(item.id);
        });

        try {
            // Optimistic update
            setTables(prev => prev.map(t => {
                if (t.id === activeTableId) {
                    return {
                        ...t,
                        users: t.users.map((u: any) => {
                            if (itemsByUser.has(u.userId)) {
                                const targetOrderIds = itemsByUser.get(u.userId)!;
                                return {
                                    ...u,
                                    orders: u.orders.map((o: any) =>
                                        targetOrderIds.includes(o.id) ? { ...o, status: newStatus } : o
                                    )
                                };
                            }
                            return u;
                        })
                    }
                }
                return t;
            }));

            const promises = Array.from(itemsByUser.entries()).map(([uId, targetOrderIds]) => {
                return fetch('/api/admin/orders/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: uId,
                        resid: '100', // Hardcoded demo resid
                        tableid: activeTableId,
                        orderIds: targetOrderIds,
                        newStatus
                    })
                });
            });

            await Promise.all(promises);
            fetchOrders();
        } catch (e) {
            console.error("Bulk update failed", e);
            fetchOrders();
        }
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Chờ xác nhận': return styles.status_choxacnhan;
            case 'Đã xác nhận': return styles.status_daxacnhan;
            case 'Đang chế biến': return styles.status_dangchebien;
            case 'Chờ phục vụ': return styles.status_chopucvu;
            case 'Đã phục vụ': return styles.status_daphucvu;
            default: return '';
        }
    };

    const getActionButtonLabel = (status: string) => {
        switch (status) {
            case 'Chờ xác nhận': return 'Xác nhận món';
            case 'Đã xác nhận': return 'Bắt đầu nấu';
            case 'Đang chế biến': return 'Báo xong, chờ lên món';
            case 'Chờ phục vụ': return 'Đã đem cho khách';
            default: return '';
        }
    };

    const activeTable = tables.find(t => t.id === activeTableId);

    // Get total active orders for a table
    const getActiveOrderCount = (table: any) => {
        let count = 0;
        table.users.forEach((u: any) => {
            u.orders.forEach((o: any) => {
                if (o.status !== 'Đã phục vụ') count++;
            });
        });
        return count;
    };


    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.title}>KDS (Màn Hình Nhà Bếp)</div>
            </header>

            <div className={styles.content}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <div className={styles.sidebarTitle}>Bàn Đang Hoạt Động</div>
                    </div>
                    <div className={styles.tableList}>
                        {isLoading && tables.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Đang tải...</div>
                        ) : tables.length === 0 ? (
                            <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Chưa có bàn nào mở</div>
                        ) : (
                            tables.map(table => {
                                const activeOrders = getActiveOrderCount(table);
                                return (
                                    <div
                                        key={table.id}
                                        className={`${styles.tableCard} ${activeTableId === table.id ? styles.active : ''}`}
                                        onClick={() => setActiveTableId(table.id)}
                                    >
                                        <div>
                                            <div className={styles.tableName}>{table.name}</div>
                                            <div className={styles.tableMeta}>{table.users.length} khách</div>
                                        </div>
                                        <div className={`${styles.badge} ${activeOrders > 0 ? styles.active : ''}`}>
                                            {activeOrders} món
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                </aside>

                <main className={styles.main}>
                    {activeTable ? (
                        <>
                            <div className={styles.mainHeader}>
                                <div className={styles.mainTitle}>Chi Tiết {activeTable.name === 'Bàn Unknown Table' ? 'Bàn Trống/Chưa Rõ' : activeTable.name}</div>
                                <div className={styles.filterGroup}>
                                    <button
                                        className={`${styles.filterBtn} ${filterStatus === 'All' ? styles.activeFilter : ''}`}
                                        onClick={() => setFilterStatus('All')}
                                    >Tất cả</button>
                                    {ORDER_FLOW.map(status => (
                                        <button
                                            key={status}
                                            className={`${styles.filterBtn} ${filterStatus === status ? styles.activeFilter : ''}`}
                                            onClick={() => setFilterStatus(status)}
                                        >{status}</button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.tableContent}>
                                {(() => {
                                    const allItems = activeTable.users.flatMap((u: any) =>
                                        u.orders.map((o: any) => ({ ...o, userId: u.userId, userName: u.userName }))
                                    );

                                    const filteredItems = filterStatus === 'All' ? allItems : allItems.filter((i: any) => i.status === filterStatus);

                                    if (filteredItems.length === 0) {
                                        return <div className={styles.emptyState}>Không có món nào theo trạng thái này</div>;
                                    }

                                    const roundsMap = new Map();
                                    filteredItems.forEach((item: any) => {
                                        const roundId = item.timestamp ? item.timestamp.toString() : 'unknown';
                                        if (!roundsMap.has(roundId)) {
                                            roundsMap.set(roundId, { id: roundId, timestamp: item.timestamp, items: [] });
                                        }
                                        roundsMap.get(roundId).items.push(item);
                                    });

                                    const rounds = Array.from(roundsMap.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

                                    return (
                                        <div className={styles.roundsContainer}>
                                            <div className={styles.roundTabs}>
                                                <button
                                                    className={`${styles.roundTabBtn} ${activeRoundId === null ? styles.activeRoundTab : ''}`}
                                                    onClick={() => setActiveRoundId(null)}
                                                >
                                                    Tất cả các lượt ({rounds.length})
                                                </button>
                                                {rounds.map((r, i) => {
                                                    const d = parseDate(r.timestamp);
                                                    const timeStr = d ? d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
                                                    return (
                                                        <button
                                                            key={r.id}
                                                            className={`${styles.roundTabBtn} ${activeRoundId === r.id ? styles.activeRoundTab : ''}`}
                                                            onClick={() => setActiveRoundId(r.id)}
                                                        >
                                                            Lượt {i + 1} ({timeStr})
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className={styles.roundPanels}>
                                                {rounds.filter(r => activeRoundId === null || r.id === activeRoundId).map((round, idx) => (
                                                    <div key={round.id} className={styles.roundSection}>
                                                        {activeRoundId === null && (
                                                            <div className={styles.roundSectionHeader}>
                                                                <div className={styles.roundTitle}>
                                                                    Lượt {rounds.indexOf(round) + 1}
                                                                    {round.timestamp && (() => {
                                                                        const d = parseDate(round.timestamp);
                                                                        return d ? (
                                                                            <div className={styles.timeTag}>
                                                                                <Clock size={14} />
                                                                                {d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                                            </div>
                                                                        ) : null;
                                                                    })()}
                                                                </div>
                                                                <button onClick={() => handleUpdateRound(round.items)} className={styles.roundActionBtn}>
                                                                    <CheckCircle2 size={16} /> Báo cập nhật cả lượt này
                                                                </button>
                                                            </div>
                                                        )}
                                                        {activeRoundId !== null && (
                                                            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                                                                <button onClick={() => handleUpdateRound(round.items)} className={`${styles.actionBtn} ${styles.primary}`}>
                                                                    Cập nhật toàn bộ lượt này
                                                                </button>
                                                            </div>
                                                        )}
                                                        <div className={styles.orderGrid}>
                                                            {round.items.map((order: any) => (
                                                                <div key={order.id} className={styles.orderItemCard}>
                                                                    <div className={styles.orderItemHeader}>
                                                                        <div>
                                                                            <div className={styles.orderItemName}>{order.name}</div>
                                                                            <div className={styles.orderItemMeta}>
                                                                                <User size={13} strokeWidth={2.5} /> {order.userName}
                                                                            </div>
                                                                        </div>
                                                                        <div className={styles.qtyBadge}>x{order.qty}</div>
                                                                    </div>

                                                                    <div className={styles.itemActions}>
                                                                        <div className={`${styles.statusIndicator} ${getStatusClass(order.status)}`}>
                                                                            {order.status}
                                                                        </div>
                                                                        {ORDER_FLOW.indexOf(order.status) < ORDER_FLOW.length - 1 ? (
                                                                            <button
                                                                                className={`${styles.actionBtn} ${styles.primary}`}
                                                                                onClick={() => handleUpdateStatus(order.userId, order.id, order.status)}
                                                                            >
                                                                                {getActionButtonLabel(order.status)}
                                                                            </button>
                                                                        ) : (
                                                                            <div className={styles.doneText}>Hoàn tất</div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </>
                    ) : (
                        <div className={styles.emptyState}>
                            Chọn một bàn bên trái để xem tiến độ phục vụ
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
