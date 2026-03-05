import React from 'react';
import { Award, ChevronRight, Gift, History, Ticket, Settings, UserCircle2 } from 'lucide-react';
import styles from './AccountOverview.module.css';
import { UserData } from './PersonalInfoSection';

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
    userData: UserData & {
        points: number;
        tier: string;
    };
    nextTierPoints: number;
    topRewards: Reward[];
    recentOrders?: RecentOrder[];
    onNavigateToVouchers: () => void;
    onNavigateToSettings: () => void;
    onNavigateToHistory: () => void;
    onNavigateToPersonalInfo: () => void;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
    userData,
    nextTierPoints,
    topRewards,
    recentOrders = [],
    onNavigateToVouchers,
    onNavigateToSettings,
    onNavigateToHistory,
    onNavigateToPersonalInfo
}) => {
    const progress = Math.min((userData.points / nextTierPoints) * 100, 100);

    return (
        <div className={styles.container}>
            {/* 0. Profile Header (New - Moved from Settings) */}
            <div className={styles.profileHeader} onClick={onNavigateToPersonalInfo}>
                <div className={styles.avatar}>
                    <div className={styles.avatarInner}>
                        <UserCircle2 size={36} />
                    </div>
                </div>
                <div className={styles.profileInfo}>
                    <h3 className={styles.userName}>{userData.name || 'Khách hàng mới'}</h3>
                    <p className={styles.userPhone}>{userData.phone || 'Chưa cập nhật SĐT'}</p>
                </div>
                <ChevronRight size={20} className={styles.chevron} />
            </div>

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

            {/* 3. Account Group */}
            <div className={styles.groupSection}>
                <h4 className={styles.groupTitle}>TÀI KHOẢN</h4>
                <div className={styles.groupCard}>
                    <div className={styles.menuItem} onClick={onNavigateToPersonalInfo}>
                        <div className={`${styles.iconBox} ${styles.blue}`}>
                            <Award size={20} />
                        </div>
                        <span className={styles.menuLabel}>Thông tin cá nhân</span>
                        <ChevronRight size={16} className={styles.menuChevron} />
                    </div>
                    <div className={styles.menuItem} onClick={onNavigateToSettings}>
                        <div className={`${styles.iconBox} ${styles.gray}`}>
                            <Settings size={20} />
                        </div>
                        <span className={styles.menuLabel}>Cài đặt tài khoản & Ứng dụng</span>
                        <ChevronRight size={16} className={styles.menuChevron} />
                    </div>
                </div>
            </div>

            {/* 4. Quick Actions */}
            <div className={styles.quickActions}>
                <button className={styles.actionBtn} onClick={onNavigateToVouchers}>
                    <div className={`${styles.actionIcon} ${styles.pink}`}>
                        <Ticket size={24} />
                    </div>
                    <span>Voucher của tôi</span>
                </button>
                <button className={styles.actionBtn} onClick={onNavigateToHistory}>
                    <div className={`${styles.actionIcon} ${styles.teal}`}>
                        <History size={24} />
                    </div>
                    <span>Lịch sử đặt món</span>
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
