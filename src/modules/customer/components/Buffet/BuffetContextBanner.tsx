import React from 'react';
import styles from './BuffetContextBanner.module.css';
import { Users, Crown, ChevronDown } from 'lucide-react';

interface BuffetContextBannerProps {
    adults: number;
    children: number;
    tierName: string;
    onChangeSettings: () => void;
}

export const BuffetContextBanner: React.FC<BuffetContextBannerProps> = ({
    adults,
    children,
    tierName,
    onChangeSettings
}) => {
    return (
        <div className={styles.banner} onClick={onChangeSettings}>
            <div className={styles.left}>
                <div className={styles.infoPill}>
                    <Users size={14} />
                    <span>{adults + children} Khách</span>
                </div>
                {children > 0 && (
                    <div className={styles.kidBadge}>
                        +{children} Trẻ em
                    </div>
                )}
            </div>

            <div className={styles.right}>
                <Crown size={14} className={styles.crownIcon} />
                <span className={styles.tierName}>{tierName}</span>
                <ChevronDown size={14} className={styles.chevron} />
            </div>
        </div>
    );
};
