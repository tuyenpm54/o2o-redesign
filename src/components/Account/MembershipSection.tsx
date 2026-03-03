import React from 'react';
import { Award, ChevronRight, Gift } from 'lucide-react';
import styles from './MembershipSection.module.css';

export interface Reward {
    id: string;
    name: string;
    pointsRequired: number;
    image: string;
}

interface MembershipSectionProps {
    tier: string;
    points: number;
    nextTierPoints: number;
    rewards: Reward[];
}

export const MembershipSection: React.FC<MembershipSectionProps> = ({
    tier,
    points,
    nextTierPoints,
    rewards
}) => {
    const progress = Math.min((points / nextTierPoints) * 100, 100);

    return (
        <section className={styles.section}>
            {/* Header / Tier Card */}
            <div className={styles.cardHeader}>
                <div className={styles.tierInfo}>
                    <div className={styles.iconWrapper}>
                        <Award size={24} color="#F59E0B" />
                    </div>
                    <div>
                        <h3 className={styles.tierName}>{tier}</h3>
                        <div className={styles.pointsDisplay}>
                            <span className={styles.currentPoints}>{points}</span>
                            <span className={styles.pointsLabel}>điểm tích lũy</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                </div>
                <p className={styles.progressText}>
                    Còn <strong>{nextTierPoints - points} điểm</strong> để lên hạng tiếp theo
                </p>
            </div>

            {/* Rewards */}
            <div className={styles.rewardsContainer}>
                <div className={styles.rewardsHeader}>
                    <div className={styles.rewardsTitleGroup}>
                        <Gift size={18} className={styles.giftIcon} />
                        <h4 className={styles.rewardsTitle}>Đổi quà</h4>
                    </div>
                    <button className={styles.viewAllBtn}>
                        Xem tất cả <ChevronRight size={14} />
                    </button>
                </div>

                <div className={styles.rewardsList}>
                    {rewards.map(reward => (
                        <div key={reward.id} className={styles.rewardItem}>
                            <div className={styles.rewardImageWrapper}>
                                <img src={reward.image} alt={reward.name} className={styles.rewardImage} />
                            </div>
                            <div className={styles.rewardContent}>
                                <p className={styles.rewardName}>{reward.name}</p>
                                <span className={styles.rewardPoints}>{reward.pointsRequired} điểm</span>
                                <button
                                    className={styles.redeemBtn}
                                    disabled={points < reward.pointsRequired}
                                >
                                    Đổi
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
