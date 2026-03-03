import React from 'react';
import { Award, ChevronRight, Gift, History, Ticket, Settings } from 'lucide-react';
import styles from './AccountOverview.module.css';

// Reusing types from other components for consistency
interface Reward {
    id: string;
    name: string;
    pointsRequired: number;
    image: string;
}

// Minimal structure for recent order display
interface RecentOrder {
    id: string;
    items: string[];
    totalItems: number;
    status: string;
    time: string;
}

interface AccountOverviewProps {
    userData: {
        name: string;
        points: number;
        tier: string;
    };
    nextTierPoints: number;
    topRewards: Reward[];
    recentOrders?: RecentOrder[];
    onNavigateToVouchers: () => void;
    onNavigateToSettings: () => void;
    onNavigateToHistory: () => void; // Keep for internal history list if needed, or remove? Keeping for backwards compat inside list if needed, but not used in header button anymore.
    // Actually, checking usage I see it's also used in recentOrder. But user wants specific change.
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
    userData,
    nextTierPoints,
    topRewards,
    recentOrders = [],
    onNavigateToVouchers,
    onNavigateToSettings,
    onNavigateToHistory
}) => {
    const progress = Math.min((userData.points / nextTierPoints) * 100, 100);

    return (
        <div className={styles.container}>
            {/* 1. Member Card */}
            <div className={styles.memberCard}>
                <div className={styles.cardBg} />
                <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                        <div className={styles.tierBadge}>
                            <Award size={16} />
                            <span>{userData.tier}</span>
                        </div>
                        <span className={styles.points}>{userData.points.toLocaleString()} pts</span>
                    </div>
                    <div className={styles.cardFooter}>
                        <div className={styles.barcodePlaceholder}>
                            {/* Simulated Barcode */}
                            <div className={styles.barcodeLines} />
                            <span className={styles.memberCode}>8592 1234 5678</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. Progress */}
            <div className={styles.progressSection}>
                <div className={styles.progressInfo}>
                    <span>Tiến độ thăng hạng</span>
                    <span>{userData.points}/{nextTierPoints}</span>
                </div>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <p className={styles.progressNote}>Còn <strong>{nextTierPoints - userData.points} điểm</strong> để lên hạng Vàng</p>
            </div>

            {/* 3. Quick Actions */}
            <div className={styles.quickActions}>
                <button className={styles.actionBtn} onClick={onNavigateToVouchers}>
                    <div className={`${styles.actionIcon} ${styles.blue}`}>
                        <Ticket size={24} />
                    </div>
                    <span>Voucher của tôi</span>

                </button>
                <button className={styles.actionBtn} onClick={onNavigateToSettings}>
                    <div className={`${styles.actionIcon} ${styles.orange}`}>
                        <Settings size={24} />
                    </div>
                    <span>Cài đặt</span>
                </button>
            </div>

            {/* 3.5 Recent History (New) */}
            {
                recentOrders && recentOrders.length > 0 && (
                    <div className={styles.historySection}>
                        <div className={styles.sectionHeader}>
                            <h3>Lịch sử gần đây</h3>
                        </div>
                        <div className={styles.historyList}>
                            {recentOrders.map(order => (
                                <div key={order.id} className={styles.historyItem}>
                                    <div className={styles.historyIcon}>
                                        <History size={16} color="#64748B" />
                                    </div>
                                    <div className={styles.historyContent}>
                                        <div className={styles.historyRow}>
                                            <span className={styles.historyItemsText}>
                                                {order.items.join(', ')}
                                                {order.totalItems > order.items.length && ` +${order.totalItems - order.items.length}`}
                                            </span>
                                            <span className={styles.historyStatus}>{order.status}</span>
                                        </div>
                                        <span className={styles.historyTime}>{order.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }

            {/* 4. Top Rewards */}
            <div className={styles.rewardsSection}>
                <div className={styles.sectionHeader}>
                    <h3>Đổi quà hấp dẫn</h3>
                    <button className={styles.viewAllBtn} onClick={onNavigateToVouchers}>
                        Xem tất cả <ChevronRight size={16} />
                    </button>
                </div>
                <div className={styles.rewardsList}>
                    {topRewards.map(reward => (
                        <div key={reward.id} className={styles.rewardCard}>
                            <div className={styles.rewardImgWrapper}>
                                <img src={reward.image} alt={reward.name} className={styles.rewardImg} />
                            </div>
                            <div className={styles.rewardInfo}>
                                <span className={styles.rewardName}>{reward.name}</span>
                                <span className={styles.rewardPoints}>{reward.pointsRequired} điểm</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div >
    );
};
