import React, { useState } from 'react';
import {
    Award, ChevronRight, Gift, History, Ticket, Settings,
    UserCircle2, FileText, ClipboardList, QrCode
} from 'lucide-react';
import styles from './AccountOverview.module.css';
import { UserData } from './PersonalInfoSection';
import { PreferenceTagsSection } from './PreferenceTagsSection';

interface Reward {
    id: string;
    name: string;
    pointsRequired: number;
    image: string;
}

interface AccountOverviewProps {
    userData: UserData & {
        points: number;
        tier: string;
        preferences?: string[];
    };
    nextTierPoints: number;
    topRewards: Reward[];
    onNavigateToVouchers: () => void;
    onNavigateToSettings: () => void;
    onNavigateToHistory: () => void;
    onNavigateToPersonalInfo: () => void;
    onNavigateToVATInfo: () => void;
    onNavigateToInvoices: () => void;
    onLogout?: () => void;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
    userData,
    nextTierPoints,
    topRewards,
    onNavigateToVouchers,
    onNavigateToSettings,
    onNavigateToHistory,
    onNavigateToPersonalInfo,
    onNavigateToVATInfo,
    onNavigateToInvoices,
    onLogout,
}) => {
    const progress = Math.min((userData.points / nextTierPoints) * 100, 100);
    const [showBarcode, setShowBarcode] = useState(false);

    return (
        <div className={styles.container}>
            {/* ═══ CRITICAL #1: Profile Summary Card ═══ */}
            <div className={styles.profileCard}>
                <div className={styles.profileTop} onClick={onNavigateToPersonalInfo}>
                    <div className={styles.avatar}>
                        <UserCircle2 size={40} strokeWidth={1.5} />
                    </div>
                    <div className={styles.profileInfo}>
                        <h2 className={styles.userName}>{userData.name || 'Khách hàng mới'}</h2>
                        <p className={styles.userPhone}>{userData.phone || 'Chưa cập nhật SĐT'}</p>
                    </div>
                    <ChevronRight size={20} className={styles.profileChevron} />
                </div>

                {/* Tier + Points */}
                <div className={styles.tierRow}>
                    <div className={styles.tierBadge}>
                        <Award size={14} />
                        <span>{userData.tier || 'Khách'}</span>
                    </div>
                    <span className={styles.pointsDisplay}>
                        {userData.points.toLocaleString()} <small>điểm</small>
                    </span>
                </div>

                {/* Progress bar */}
                <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <p className={styles.progressNote}>
                        Còn <strong>{(nextTierPoints - userData.points).toLocaleString()}</strong> điểm để lên hạng Vàng
                    </p>
                </div>

                {/* Barcode — On-demand (tap to reveal) */}
                <button
                    className={`${styles.barcodeToggle} ${showBarcode ? styles.barcodeActive : ''}`}
                    onClick={() => setShowBarcode(!showBarcode)}
                >
                    <QrCode size={14} />
                    <span>{showBarcode ? 'Ẩn mã thành viên' : 'Hiện mã thành viên'}</span>
                </button>
                {showBarcode && (
                    <div className={styles.barcodeSection}>
                        <div className={styles.barcodeLines} />
                        <span className={styles.memberCode}>8592 1234 5678</span>
                    </div>
                )}
            </div>

            {/* ═══ CRITICAL #2: Quick Navigation ═══ */}
            <div className={styles.navSection}>
                <div className={styles.navCard}>
                    <button className={styles.navItem} onClick={onNavigateToPersonalInfo}>
                        <div className={`${styles.navIcon} ${styles.blue}`}>
                            <UserCircle2 size={20} />
                        </div>
                        <span className={styles.navLabel}>Thông tin cá nhân</span>
                        <ChevronRight size={16} className={styles.navChevron} />
                    </button>
                    <button className={styles.navItem} onClick={onNavigateToVATInfo}>
                        <div className={`${styles.navIcon} ${styles.purple}`}>
                            <FileText size={20} />
                        </div>
                        <span className={styles.navLabel}>Thông tin VAT</span>
                        <ChevronRight size={16} className={styles.navChevron} />
                    </button>
                    <button className={styles.navItem} onClick={onNavigateToInvoices}>
                        <div className={`${styles.navIcon} ${styles.orange}`}>
                            <ClipboardList size={20} />
                        </div>
                        <span className={styles.navLabel}>Hoá đơn</span>
                        <ChevronRight size={16} className={styles.navChevron} />
                    </button>

                    <button className={styles.navItem} onClick={onNavigateToVouchers}>
                        <div className={`${styles.navIcon} ${styles.pink}`}>
                            <Ticket size={20} />
                        </div>
                        <span className={styles.navLabel}>Voucher</span>
                        <ChevronRight size={16} className={styles.navChevron} />
                    </button>
                    <button className={styles.navItem} onClick={onNavigateToSettings}>
                        <div className={`${styles.navIcon} ${styles.gray}`}>
                            <Settings size={20} />
                        </div>
                        <span className={styles.navLabel}>Cài đặt</span>
                        <ChevronRight size={16} className={styles.navChevron} />
                    </button>
                </div>
            </div>

            {/* ═══ IMPORTANT: Preference Tags ═══ */}
            <PreferenceTagsSection onboardingPreferences={userData.preferences} />

            {/* ═══ SUPPORTIVE: Rewards ═══ */}
            {topRewards.length > 0 && (
                <div className={styles.rewardsSection}>
                    <div className={styles.sectionHeader}>
                        <h3>Đổi quà</h3>
                        <button className={styles.viewAllBtn} onClick={onNavigateToVouchers}>
                            Xem tất cả <ChevronRight size={14} />
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
            )}

            {/* ═══ SUPPORTIVE: Logout ═══ */}
            {onLogout && (
                <button className={styles.logoutBtn} onClick={onLogout}>
                    Đăng xuất
                </button>
            )}
        </div>
    );
};
