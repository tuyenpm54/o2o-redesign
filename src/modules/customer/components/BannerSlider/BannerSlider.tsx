import React from 'react';
import styles from './BannerSlider.module.css';

interface Banner {
    id: string;
    title: string;
    topText?: string;
    icon?: string;
}

interface BannerSliderProps {
    banners?: Banner[];
}

export const BannerSlider: React.FC<BannerSliderProps> = ({
    banners = [
        { id: '1', title: 'NGÀY QUỐC KHÁNH 2-9', topText: 'Chào mừng', icon: '🇻🇳' }
    ]
}) => {
    if (!banners || banners.length === 0) return null;

    return (
        <div className={styles.container}>
            <div className={styles.slide}>
                <div className={styles.content}>
                    <p className={styles.topText}>{banners[0].topText}</p>
                    <h2 className={styles.title}>{banners[0].title}</h2>
                </div>
                <div className={styles.imgBox}>
                    <div className={styles.placeholderImg}>{banners[0].icon}</div>
                </div>
            </div>
            {banners.length > 1 && (
                <div className={styles.dots}>
                    {banners.map((_, index) => (
                        <span
                            key={index}
                            className={`${styles.dot} ${index === 0 ? styles.active : ''}`}
                        ></span>
                    ))}
                </div>
            )}
        </div>
    );
};
