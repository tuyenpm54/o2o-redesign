"use client";
import React from "react";
import { X, ChevronRight, Minus, Plus, Trash2, Edit2 } from "lucide-react";
import styles from "./CartDrawer.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useMenuContext } from "../hooks/useMenuContext";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: { id?: number; item: any; quantity: number; selections?: any }[];
    total: number;
    isCheckoutRequested?: boolean;
    onPlaceOrder: () => void;
    onEditItem: (cartEntry: any) => void;
    onRemoveItem: (cartEntry: any) => void;
    onIncrementItem: (cartEntry: any) => void;
    onDecrementItem: (cartEntry: any) => void;
}

export function CartDrawer({
    isOpen,
    onClose,
    cartItems,
    total,
    isCheckoutRequested,
    onPlaceOrder,
    onEditItem,
    onRemoveItem,
    onIncrementItem,
    onDecrementItem,
}: CartDrawerProps) {
    const { t, language } = useLanguage();
    const { theme, timeOfDay } = useMenuContext();
    const isDark = timeOfDay === 'evening';

    if (!isOpen) return null;

    const totalItems = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

    // Derived theme variables
    const interactiveBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const interactiveBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
    const mutedText = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
    const disabledBg = isDark ? '#334155' : '#94A3B8';
    const highlightBlue = isDark ? '#60A5FA' : '#3B82F6';
    const highlightRed = isDark ? '#F87171' : '#EF4444';

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div 
                className={styles.sheet} 
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: theme.bg,
                    boxShadow: theme.cardShadow,
                    border: `1px solid ${interactiveBorder}`,
                    color: theme.textPrimary
                }}
            >
                {/* Drag handle */}
                <div 
                    className={styles.dragHandle} 
                    style={{ background: theme.textSecondary }}
                />

                {/* Header */}
                <div 
                    className={styles.header}
                    style={{ borderBottom: `1px solid ${interactiveBorder}` }}
                >
                    <div className={styles.headerLeft}>
                        <h3 className={styles.title} style={{ color: theme.textPrimary }}>
                            {t('Giỏ hàng của bạn')}
                        </h3>
                        <span 
                            className={styles.countBadge}
                            style={{ background: theme.accent, color: theme.cartBarText }}
                        >
                            {totalItems}
                        </span>
                    </div>
                    <button 
                        className={styles.closeBtn} 
                        onClick={onClose}
                        style={{ background: interactiveBg, color: theme.textSecondary }}
                    >
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {/* Promo banner */}
                {total > 0 && (
                    <div 
                        className={styles.promoBanner}
                        style={{ background: theme.accentLight, color: theme.textSecondary }}
                    >
                        {total < 200000 ? (
                            <span>
                                {t('Thêm')} <b style={{ color: theme.accent }}>{(200000 - total).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</b> {t('nữa để được')} <b style={{ color: theme.accent }}>{t('giảm 10%')}</b>
                            </span>
                        ) : (
                            <span style={{ color: theme.accent }}><b>🎉 {t('Bạn đã được giảm 10% đơn hàng!')}</b></span>
                        )}
                    </div>
                )}

                {/* Item list */}
                <div className={styles.itemList}>
                    {cartItems.map((entry, idx) => (
                        <div 
                            key={`${entry.item.id}-${idx}`} 
                            className={styles.itemRow}
                            style={{ borderBottom: `1px solid ${interactiveBorder}` }}
                        >
                            <img
                                src={entry.item.img}
                                className={styles.itemImg}
                                alt={entry.item.name}
                                onError={(e) => { e.currentTarget.src = '/food/default-food.jpg'; }}
                                style={{ background: interactiveBg }}
                            />
                            <div className={styles.itemBody}>
                                <div className={styles.itemTopRow}>
                                    <span className={styles.itemName} style={{ color: theme.textPrimary }}>
                                        {entry.item.name}
                                    </span>
                                    <span className={styles.itemTotal} style={{ color: theme.textPrimary }}>
                                        {(entry.item.price * entry.quantity).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ
                                    </span>
                                </div>
                                {entry.selections?.size && (
                                    <span className={styles.itemSub} style={{ color: theme.textSecondary }}>
                                        {entry.selections.size}
                                        {entry.selections?.toppings?.length > 0 && ` · ${entry.selections.toppings.map((t: string) => t.split('(')[0].trim()).join(', ')}`}
                                    </span>
                                )}
                                <div className={styles.itemBottomRow}>
                                    {/* Qty stepper (harmonized with detail modal) */}
                                    <div 
                                        className={styles.stepper}
                                        style={{ 
                                            background: interactiveBg, 
                                            border: `1.5px solid ${interactiveBorder}` 
                                        }}
                                    >
                                        <button
                                            className={styles.stepperBtn}
                                            onClick={() => entry.quantity <= 1 ? onRemoveItem(entry) : onDecrementItem(entry)}
                                            style={{ color: theme.textPrimary }}
                                        >
                                            {entry.quantity <= 1 ? <Trash2 size={15} color={highlightRed} /> : <Minus size={15} strokeWidth={2.5} />}
                                        </button>
                                        <span className={styles.stepperCount} style={{ color: theme.textPrimary }}>
                                            {entry.quantity}
                                        </span>
                                        <button 
                                            className={styles.stepperBtn} 
                                            onClick={() => onIncrementItem(entry)}
                                            style={{ color: theme.textPrimary }}
                                        >
                                            <Plus size={15} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                    <div className={styles.itemActions} style={{ display: 'flex', gap: '8px' }}>
                                        <button 
                                            className={styles.editBtn} 
                                            onClick={() => onEditItem(entry)}
                                            style={{ 
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                background: interactiveBg, border: `1px solid ${interactiveBorder}`,
                                                borderRadius: '10px', padding: '6px 12px',
                                                color: theme.textSecondary, fontSize: '0.8rem', fontWeight: 600,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <Edit2 size={13} />
                                            {t('Sửa')}
                                        </button>
                                        <button 
                                            className={styles.deleteBtn} 
                                            onClick={() => onRemoveItem(entry)}
                                            style={{ 
                                                display: 'flex', alignItems: 'center', gap: '6px',
                                                background: interactiveBg, border: `1px solid ${interactiveBorder}`,
                                                borderRadius: '10px', padding: '6px 12px',
                                                color: highlightRed, fontSize: '0.8rem', fontWeight: 600,
                                                textDecoration: 'none'
                                            }}
                                        >
                                            {t('Xóa')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div 
                    className={styles.footer}
                    style={{ 
                        background: theme.bg, 
                        borderColor: interactiveBorder 
                    }}
                >
                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel} style={{ color: theme.textSecondary }}>{t('Tạm tính')}</span>
                        <span className={styles.totalValue} style={{ color: theme.textPrimary }}>{total.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                    </div>
                    <div className={styles.footerBtns}>
                        <button 
                            className={styles.secondaryBtn} 
                            onClick={onClose}
                            style={{ 
                                color: theme.textSecondary, 
                                borderColor: interactiveBorder,
                                background: 'transparent'
                            }}
                        >
                            {t('Chi tiết bàn')}
                        </button>
                        {isCheckoutRequested ? (
                            <button 
                                className={styles.primaryBtnDisabled} 
                                disabled
                                style={{ background: disabledBg, color: '#f8fafc' }}
                            >
                                {t('Đang Thanh Toán')}
                            </button>
                        ) : (
                            <button 
                                className={styles.primaryBtn} 
                                onClick={onPlaceOrder}
                                style={{ 
                                    background: theme.cartBarBg, 
                                    color: theme.cartBarText,
                                    boxShadow: `0 8px 24px ${theme.accentLight}`
                                }}
                            >
                                {t('Gửi gọi món')} <ChevronRight size={18} strokeWidth={2.5} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
