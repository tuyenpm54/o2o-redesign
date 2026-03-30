"use client";
import React from "react";
import { ChevronRight, History, Heart, Star, Sparkles } from "lucide-react";
import styles from "./SmartWelcomeScreen.module.css";
import { useLanguage } from "@/context/LanguageContext";

interface SmartWelcomeScreenProps {
    user: any;
    onStartOrdering: () => void;
    onViewHistory: () => void;
    activeOrders?: any[];
}

export function SmartWelcomeScreen({ user, onStartOrdering, onViewHistory, activeOrders = [] }: SmartWelcomeScreenProps) {
    const { t } = useLanguage();

    const hasActiveOrders = activeOrders.length > 0;

    return (
        <div className={styles.container}>
            <div className={styles.overlay} />

            <div className={styles.content}>
                {/* Header Section */}
                <div className={styles.header}>
                    <div className={styles.avatarWrapper}>
                        <img src={user?.avatar} alt={user?.name} className={styles.avatar} />
                        <div className={styles.badge}><Sparkles size={12} fill="currentColor" /></div>
                    </div>
                    <div className={styles.greeting}>
                        <h1 className={styles.title}>
                            {t('Chào mừng sếp trở lại,')} <span className={styles.userName}>{user?.name?.split(' ')[0]}</span>! 👋
                        </h1>
                        <p className={styles.subtitle}>
                            {hasActiveOrders
                                ? t('Món của sếp đang được chuẩn bị. Sếp có muốn dùng thêm gì không?')
                                : t('Lần thứ') + ` ${user?.visitCount || 2} ` + t('sếp ghé thăm nhà hàng. Rất vui được gặp lại sếp!')}
                        </p>
                    </div>
                </div>

                {/* Active Order Summary (if exists) */}
                {hasActiveOrders && (
                    <div className={styles.statusSection}>
                        <div className={styles.statusCard}>
                            <div className={styles.statusLine}>
                                <div className={styles.pulseDot} />
                                <span>{t('Đang chuẩn bị')} {activeOrders.length} {t('món')}</span>
                            </div>
                            <div className={styles.miniList}>
                                {activeOrders.slice(0, 2).map((o, i) => (
                                    <span key={i} className={styles.miniItem}>{o.name}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Re-order / History Section */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.sectionTitle}>
                            <History size={18} className={styles.sectionIcon} />
                            <span>{t('Gợi ý cho sếp')}</span>
                        </div>
                    </div>

                    <div className={styles.quickGrid}>
                        <div className={styles.quickCard} onClick={onStartOrdering}>
                            <div className={styles.cardIcon}><Star fill="#f59e0b" color="#f59e0b" /></div>
                            <div className={styles.cardInfo}>
                                <h4>{hasActiveOrders ? t('Gọi thêm món mới') : t('Món sếp hay gọi')}</h4>
                                <p>{hasActiveOrders ? t('Xem menu để chọn thêm') : t('Lẩu Thái, Gỏi xoài...')}</p>
                            </div>
                            <ChevronRight size={16} />
                        </div>

                        <div className={styles.quickCard} onClick={onViewHistory}>
                            <div className={styles.cardIcon}><Heart fill="#ef4444" color="#ef4444" /></div>
                            <div className={styles.cardInfo}>
                                <h4>{t('Lịch sử gọi món')}</h4>
                                <p>{t('Xem lại các đơn trước')}</p>
                            </div>
                            <ChevronRight size={16} />
                        </div>
                    </div>
                </div>

                {/* Main Action */}
                <button className={styles.mainBtn} onClick={onStartOrdering}>
                    {hasActiveOrders ? t('Tiếp tục gọi món') : t('Xem Menu & Gọi món ngay')}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
