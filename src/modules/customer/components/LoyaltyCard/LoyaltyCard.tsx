
import React from 'react';
import { ChevronRight, ShoppingBag } from 'lucide-react';
import styles from './LoyaltyCard.module.css';

interface LoyaltyCardProps {
    points?: number;
}

export const LoyaltyCard: React.FC<LoyaltyCardProps> = () => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.content}>
                    <div className={styles.iconBox}>
                        <ShoppingBag size={24} color="#3b82f6" />
                        <span className={styles.percentText}>%</span>
                    </div>
                    <p className={styles.text}>
                        Đăng nhập số điện thoại để tích điểm và sử dụng ưu đãi
                    </p>
                    <ChevronRight size={20} color="#3b82f6" className={styles.chevron} />
                </div>
            </div>
        </div>
    );
};
