"use client";
import React from "react";
import { X, ChevronRight, Minus, Plus, Trash2, Edit2, User as UserIcon } from "lucide-react";
import styles from "./CartDrawer.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useMenuContext } from "../hooks/useMenuContext";
import { useAuth } from "@/context/AuthContext";

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
    const { isGuest, login } = useAuth();
    const isDark = timeOfDay === 'evening';

    const [isLoginView, setIsLoginView] = React.useState(false);
    const [phone, setPhone] = React.useState('');
    const [otp, setOtp] = React.useState('');
    const [isOtpSent, setIsOtpSent] = React.useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = React.useState(false);
    const [otpCountdown, setOtpCountdown] = React.useState(0);

    React.useEffect(() => {
        if (!isOpen) {
            setIsLoginView(false);
            setPhone('');
            setOtp('');
            setIsOtpSent(false);
            setOtpCountdown(0);
        }
    }, [isOpen]);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (otpCountdown > 0) {
            timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [otpCountdown]);

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

                {/* Header for Cart */}
                {!isLoginView && (
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
                )}

                {/* Promo banner */}
                {!isLoginView && total > 0 && (
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

                {/* Body Content */}
                {isLoginView ? (
                    <div className={styles.itemList} style={{ position: 'relative', padding: '24px 20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Absolute Close Button */}
                        <button 
                            className={styles.closeBtn} 
                            onClick={onClose}
                            style={{ position: 'absolute', top: 16, right: 20, zIndex: 10, background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6', color: theme.textSecondary }}
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                        
                        {/* Artwork and Title */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                            <div style={{ width: 100, height: 100, marginBottom: 12, position: 'relative' }}>
                                <div style={{ position: 'absolute', inset: 10, background: `${theme.accent}30`, borderRadius: '30%', filter: 'blur(20px)', zIndex: 0 }}></div>
                                <img src="/images/loyalty_welcome_flat.png" alt="Loyalty VIP" style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1, borderRadius: '24px' }} />
                            </div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: theme.textPrimary, marginBottom: 8, letterSpacing: '-0.01em' }}>
                                {t('Trở thành khách hàng thân thiết')}
                            </h3>
                            <p style={{ fontSize: '0.9rem', color: theme.textSecondary, lineHeight: 1.5, padding: '0 10px', maxWidth: 280, opacity: 0.9 }}>
                                {t('Đăng nhập chỉ 5s, tích điểm và mở khoá ưu đãi')}
                            </p>
                        </div>

                        {/* Phone Input Row */}
                        <div style={{ display: 'flex', gap: 12 }}>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6', borderRadius: '16px', border: `1.5px solid ${interactiveBorder}`, padding: '0 8px 0 16px', position: 'relative' }}>
                                <span style={{ fontSize: '1.05rem', color: theme.textPrimary, fontWeight: 600, marginRight: 12 }}>+84</span>
                                <div style={{ width: 1, height: 24, background: interactiveBorder, marginRight: 12 }}></div>
                                <input 
                                    type="tel"
                                    placeholder={t('Nhập số điện thoại')}
                                    value={phone}
                                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setOtpCountdown(0); }}
                                    style={{ width: '100%', padding: '16px 0', background: 'transparent', border: 'none', color: theme.textPrimary, outline: 'none', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.5px', paddingRight: '100px' }}
                                />
                                <button
                                    disabled={phone.length < 9 || otpCountdown > 0}
                                    onClick={() => setOtpCountdown(60)}
                                    style={{
                                        position: 'absolute',
                                        right: 8,
                                        background: (phone.length < 9 || otpCountdown > 0) ? 'transparent' : `${theme.accent}15`,
                                        color: (phone.length < 9 || otpCountdown > 0) ? theme.textSecondary : theme.accent,
                                        border: 'none',
                                        padding: '8px 12px',
                                        borderRadius: '12px',
                                        fontSize: '0.85rem',
                                        fontWeight: 700,
                                        cursor: (phone.length < 9 || otpCountdown > 0) ? 'default' : 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {otpCountdown > 0 ? t(`Gửi lại (${otpCountdown}s)`) : t('Gửi OTP')}
                                </button>
                            </div>
                        </div>

                        {/* OTP Section ALWAYS VISIBLE */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: theme.textPrimary }}>
                                    {t('Nhập mã xác thực (OTP)')}
                                </span>
                            </div>
                            
                            <div style={{ position: 'relative', width: '100%', height: '56px', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                                <input 
                                    type="tel" 
                                    value={otp} 
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} 
                                    maxLength={6} 
                                    style={{ position: 'absolute', opacity: 0, inset: 0, width: '100%', height: '100%', cursor: 'text', zIndex: 10 }}
                                />
                                {[0, 1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} style={{ 
                                        flex: 1, 
                                        height: '100%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontSize: '1.5rem', 
                                        fontWeight: 800,
                                        background: isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6', 
                                        border: `2px solid ${otp.length === i ? theme.accent : interactiveBorder}`,
                                        borderRadius: '12px', 
                                        color: theme.textPrimary,
                                        transition: 'all 0.2s ease',
                                        boxShadow: otp.length === i ? `0 0 0 4px ${theme.accent}20` : 'none'
                                    }}>
                                        {otp[i] ? <span style={{ animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>{otp[i]}</span> : ''}
                                    </div>
                                ))}
                            </div>
                            <p style={{ fontSize: '0.85rem', color: theme.textSecondary, marginTop: 12, textAlign: 'center' }}>
                                {t('Mã OTP test mặc định: 123456')}
                            </p>
                        </div>
                        <style>{`
                            @keyframes popIn {
                                0% { transform: scale(0.5); opacity: 0; }
                                100% { transform: scale(1); opacity: 1; }
                            }
                        `}</style>
                    </div>
                ) : (
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
                )}

                {/* Footer */}
                {isLoginView ? (
                    <div 
                        className={styles.footer}
                        style={{ background: theme.bg, borderColor: interactiveBorder, padding: '16px 20px 24px' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                            <button 
                                disabled={phone.length < 9 || otp.length < 6}
                                onClick={async () => {
                                    if (otp === '123456') {
                                        setIsLoadingAuth(true);
                                        await login(phone);
                                        setIsLoadingAuth(false);
                                        setIsLoginView(false);
                                        onPlaceOrder();
                                    } else {
                                        alert(t('OTP không đúng (thử 123456)'));
                                    }
                                }}
                                style={{ 
                                    width: '100%', padding: '14px', borderRadius: '12px', 
                                    fontWeight: 700, fontSize: '1rem', 
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                                    border: 'none',
                                    background: (phone.length < 9 || otp.length < 6) ? disabledBg : theme.accent, 
                                    color: '#fff',
                                    cursor: (phone.length < 9 || otp.length < 6) ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    boxShadow: (phone.length < 9 || otp.length < 6) ? 'none' : `0 4px 14px ${theme.accent}50`
                                }}
                            >
                                {isLoadingAuth ? t('Đang xử lý...') : t('Đăng nhập')}
                            </button>
                            <button 
                                onClick={() => { 
                                    sessionStorage.setItem('skip_guest_login', 'true');
                                    setIsLoginView(false); 
                                    onPlaceOrder(); 
                                }}
                                style={{ 
                                    width: '100%', padding: '10px', background: 'transparent', 
                                    color: theme.textSecondary, border: 'none', 
                                    textDecoration: 'underline',
                                    fontWeight: 600, fontSize: '0.95rem', 
                                    display: 'flex', justifyContent: 'center', cursor: 'pointer'
                                }}
                            >
                                {t('Bỏ qua & tiếp tục gọi món')}
                            </button>
                        </div>
                    </div>
                ) : (
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
                                    onClick={() => {
                                        const hasSkipped = sessionStorage.getItem('skip_guest_login');
                                        if (isGuest && !hasSkipped) setIsLoginView(true);
                                        else onPlaceOrder();
                                    }}
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
                )}
            </div>
        </div>
    );
}
