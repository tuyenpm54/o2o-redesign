'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap, Ticket, Users, Crown, Calendar, Info, Clock, CheckCircle2, MapPin, X, ChevronLeft } from 'lucide-react';
import styles from './PromotionStrip.module.css';

interface PromoItem {
    id: string;
    type: 'flash' | 'discount' | 'group' | 'loyalty';
    title: string;
    subtitle: string;
    badgeText?: string;
    endTime?: Date;
}

const PROMO_ITEMS: PromoItem[] = [
    {
        id: 'discount-100k',
        type: 'discount',
        title: 'Giảm 100K',
        subtitle: 'Đơn từ 1 triệu',
    },
    {
        id: 'discount-200k',
        type: 'discount',
        title: 'Giảm 200K',
        subtitle: 'Đơn từ 2 triệu',
    },

    {
        id: 'group-10',
        type: 'group',
        title: 'Nhóm -10%',
        subtitle: '4+ người',
    },
    {
        id: 'loyalty-gold',
        type: 'loyalty',
        title: 'Thăng hạng',
        subtitle: 'Còn 150 điểm',
    },
];

const getIcon = (type: PromoItem['type'], size = 14) => {
    switch (type) {
        case 'flash':
            return <Zap size={size} />;
        case 'discount':
            return <Ticket size={size} />;
        case 'group':
            return <Users size={size} />;
        case 'loyalty':
            return <Crown size={size} />;
    }
};

const getTypeClass = (type: PromoItem['type']) => {
    switch (type) {
        case 'flash':
            return styles.chipFlash;
        case 'discount':
            return styles.chipDiscount;
        case 'group':
            return styles.chipGroup;
        case 'loyalty':
            return styles.chipLoyalty;
    }
};

const getCardStyle = (type: PromoItem['type']) => {
    switch (type) {
        case 'flash':
            return styles.cardFlash;
        case 'discount':
            return styles.cardDiscount;
        case 'group':
            return styles.cardGroup;
        case 'loyalty':
            return styles.cardLoyalty;
    }
}

export const PromotionStrip: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState('');
    const [selectedPromo, setSelectedPromo] = useState<PromoItem | null>(null);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (selectedPromo) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('antigravity-scroll-lock');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('antigravity-scroll-lock');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('antigravity-scroll-lock');
        };
    }, [selectedPromo]);

    useEffect(() => {
        const flashPromo = PROMO_ITEMS.find(p => p.endTime);
        if (!flashPromo?.endTime) return;

        const timer = setInterval(() => {
            const now = Date.now();
            const end = flashPromo.endTime!.getTime();
            const distance = end - now;

            if (distance < 0) {
                setTimeLeft('00:00');
                clearInterval(timer);
                return;
            }

            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className={styles.wrapper}>
            <h2 className={styles.sectionTitle}>Ưu đãi tại cửa hàng</h2>
            <div className={styles.stripContainer}>
                <div className={styles.scrollArea}>
                    {PROMO_ITEMS.map((promo) => (
                        <button
                            key={promo.id}
                            className={`${styles.promoChip} ${getTypeClass(promo.type)}`}
                            onClick={() => setSelectedPromo(promo)}
                        >
                            <span className={styles.chipIcon}>
                                {getIcon(promo.type)}
                            </span>
                            <span className={styles.chipText}>
                                <span className={styles.chipTitle}>{promo.title}</span>
                                {promo.endTime ? (
                                    <span className={styles.chipTimer}>{timeLeft}</span>
                                ) : promo.subtitle ? (
                                    <span className={styles.chipSubtitle}>{promo.subtitle}</span>
                                ) : null}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Full Screen Details Modal - Portal */}
            {selectedPromo && typeof document !== 'undefined' && createPortal(
                <div className={styles.modalOverlay}>
                    <div className={styles.modalHeader}>
                        <button className={styles.closeBtn} onClick={() => setSelectedPromo(null)}>
                            <ChevronLeft size={24} />
                        </button>
                        <h3 className={styles.modalTitle}>Chi tiết ưu đãi</h3>
                        <div style={{ width: 40 }} /> {/* Spacer for balance */}
                    </div>

                    <div className={styles.modalBody}>
                        {/* Coupon Ticket Card */}
                        <div className={`${styles.couponCard} ${getCardStyle(selectedPromo.type)}`}>
                            <div className={styles.couponMain}>
                                <div className={styles.couponIcon}>
                                    {getIcon(selectedPromo.type, 32)}
                                </div>
                                <div className={styles.couponContent}>
                                    <span className={styles.couponLabel}>MÃ ƯU ĐÃI</span>
                                    <h2 className={styles.couponValue}>{selectedPromo.title}</h2>
                                    {selectedPromo.subtitle && (
                                        <p className={styles.couponSubtitle}>{selectedPromo.subtitle}</p>
                                    )}
                                </div>
                            </div>
                            <div className={styles.couponDivider}>
                                <div className={styles.dividerLine} />
                                <div className={styles.notchLeft} />
                                <div className={styles.notchRight} />
                            </div>
                            <div className={styles.couponFooterInfo}>
                                <div className={styles.couponCode}>
                                    <span>MÃ: {selectedPromo.id.toUpperCase().replace('-', '')}</span>
                                </div>
                                {selectedPromo.endTime && (
                                    <div className={styles.couponTimer}>
                                        <Clock size={12} />
                                        <span>Kết thúc trong {timeLeft}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details List */}
                        <div className={styles.detailsContainer}>
                            <h4 className={styles.detailsHeader}>Thông tin chi tiết</h4>

                            <div className={styles.detailRow}>
                                <div className={styles.detailIcon}><CheckCircle2 size={20} /></div>
                                <div className={styles.detailContent}>
                                    <h5>Điều kiện áp dụng</h5>
                                    <p>Áp dụng cho đơn hàng thỏa mãn điều kiện tối thiểu. {selectedPromo.subtitle}.</p>
                                    <p>• Không áp dụng đồng thời với các chương trình khuyến mãi khác.</p>
                                </div>
                            </div>

                            <div className={styles.detailRow}>
                                <div className={styles.detailIcon}><Calendar size={20} /></div>
                                <div className={styles.detailContent}>
                                    <h5>Thời gian hiệu lực</h5>
                                    <p>
                                        {selectedPromo.endTime
                                            ? `Hết hạn sau: ${timeLeft}`
                                            : 'Có hiệu lực đến 31/12/2025'}
                                    </p>
                                    <p className={styles.subText}>Áp dụng tất cả các ngày trong tuần</p>
                                </div>
                            </div>

                            <div className={styles.detailRow}>
                                <div className={styles.detailIcon}><MapPin size={20} /></div>
                                <div className={styles.detailContent}>
                                    <h5>Phạm vi áp dụng</h5>
                                    <p>Chỉ áp dụng khi dùng bữa tại nhà hàng.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
