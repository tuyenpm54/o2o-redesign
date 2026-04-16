"use client";

import React, { useState } from "react";
import { X, Ticket, ChevronDown, CheckCircle2, Wallet, CreditCard, ChevronLeft, Plus, Minus, Clock, MapPin, ChevronRight, Banknote, Trash2, MessageSquare, Pencil, Edit2 } from "lucide-react";
import styles from "./CartDrawer.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useMenuContext } from "../hooks/useMenuContext";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { OrderAuthBlock } from "./OrderAuthBlock";
import { VoucherDrawer } from "./VoucherDrawer";
import { PaymentMethodDrawer, PAYMENT_METHODS } from "./PaymentMethodDrawer";
import { AwaitingPaymentModal } from "./AwaitingPaymentModal";
import { BankTransferModal } from "./BankTransferModal";

interface CheckoutSheetProps {
    isOpen: boolean;
    onClose: () => void;
    total: number;
    cartItems?: { id?: number; item: any; quantity: number; selections?: any; note?: string }[];
    onIncrementItem?: (cartEntry: any) => void;
    onDecrementItem?: (cartEntry: any) => void;
    onRemoveItem?: (cartEntry: any) => void;
    onEditItem?: (cartEntry: any) => void;
    onConfirmPayment: (paymentMethod: string, voucherCode?: string) => void;
    isProcessing: boolean;
    suggestedItems?: any[];
    onAddSuggestedItem?: (item: any) => void;
    allowOtpSkip?: boolean;
}

export function CheckoutSheet({ 
    isOpen, 
    onClose, 
    total, 
    cartItems = [], 
    onIncrementItem, 
    onDecrementItem, 
    onRemoveItem, 
    onEditItem, 
    onConfirmPayment, 
    isProcessing, 
    suggestedItems = [], 
    onAddSuggestedItem, 
    allowOtpSkip = true 
}: CheckoutSheetProps) {
    const { t, language } = useLanguage();
    const { theme, timeOfDay, interactiveBg, interactiveBorder } = useMenuContext(); 
    const isDark = timeOfDay === 'evening';
    const searchParams = useSearchParams();
    const tableid = searchParams?.get('tableid');
    const { isGuest, login } = useAuth();

    const [selectedMethod, setSelectedMethod] = useState<string>("BANK");
    const [voucherCode, setVoucherCode] = useState<string>("");
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    
    // Auth & Flow State
    const [isLoginView, setIsLoginView] = useState(false);
    const [hasSkipped, setHasSkipped] = useState(false);

    const [isVoucherDrawerOpen, setIsVoucherDrawerOpen] = useState(false);
    const [isPaymentDrawerOpen, setIsPaymentDrawerOpen] = useState(false);
    const [isAwaitingPayment, setIsAwaitingPayment] = useState(false);
    const [isBankTransferOpen, setIsBankTransferOpen] = useState(false);
    const [loginReason, setLoginReason] = useState<'PAYMENT' | 'VOUCHER'>('VOUCHER');

    const baseMethod = selectedMethod.startsWith('BANK:') ? 'BANK' : selectedMethod;
    const activePaymentMethod = PAYMENT_METHODS.find(m => m.id === baseMethod) || PAYMENT_METHODS[0];

    const handleVoucherClick = () => {
        if (isGuest && !hasSkipped) {
            setLoginReason('VOUCHER');
            setIsLoginView(true);
        } else {
            setIsVoucherDrawerOpen(true);
        }
    };



    if (!isOpen) return null;

    return (
        <div style={{ 
            position: 'fixed', inset: 0, zIndex: 1100, 
            background: theme.bg, color: theme.textPrimary,
            display: 'flex', flexDirection: 'column',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
            `}} />

            {/* Premium Header */}
            <div style={{ 
                display: 'flex', alignItems: 'center', padding: '16px 20px', 
                borderBottom: `1px solid ${interactiveBorder}`, flexShrink: 0,
                background: theme.bg, zIndex: 10
            }}>
                <button 
                    onClick={onClose} 
                    style={{ 
                        background: 'transparent', border: 'none', padding: '4px 0', 
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', 
                        color: theme.textSecondary 
                    }}
                >
                    <ChevronLeft size={24} strokeWidth={2.5} />
                </button>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingRight: '28px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: theme.textPrimary, letterSpacing: '-0.02em' }}>
                        {tableid === 'COUNTER' ? t('Thanh toán mang đi') : t('Thanh toán')}
                    </h3>
                </div>
            </div>

            <div className={styles.itemList} style={{ padding: 0, flex: 1, overflowY: 'auto' }}>
                        {tableid === 'COUNTER' && (
                        <div style={{ padding: '0 20px', marginTop: '20px' }}>
                            <div style={{
                                background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
                                borderRadius: '16px',
                                padding: '16px',
                                border: `1px solid ${interactiveBorder}`,
                                display: 'flex', gap: '12px', alignItems: 'flex-start'
                            }}>
                                <div style={{ width: 40, height: 40, borderRadius: '20px', background: `${theme.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.accent, flexShrink: 0 }}>
                                    <Clock size={20} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: theme.textPrimary }}>
                                        {t('Nhận đồ tại quầy')}
                                    </span>
                                    <span style={{ fontSize: '0.85rem', color: theme.textSecondary, lineHeight: 1.4 }}>
                                        {t('Dự kiến chuẩn bị xong trong ~ 10-15 phút sau khi thanh toán.')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {cartItems.length > 0 && (
                        <div style={{ padding: '0 20px', marginBottom: '20px', marginTop: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: theme.textPrimary }}>
                                    {t('Tóm tắt đơn hàng')}
                                </span>
                                <button onClick={onClose} style={{ background: 'none', border: 'none', padding: 0, color: '#3B82F6', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer' }}>
                                    {t('Thêm món')}
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {cartItems.slice(0, isExpanded ? undefined : 2).map((cartEntry, index) => {
                                    const item = cartEntry.item;
                                    
                                    return (
                                        <div key={index} style={{ 
                                            display: 'flex', flexDirection: 'column', gap: '12px',
                                            paddingBottom: '16px',
                                            borderBottom: `1px solid ${interactiveBorder}`
                                        }}>
                                            <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                                                {/* Left: Image */}
                                                <div style={{ 
                                                    width: 64, height: 64, borderRadius: '16px', 
                                                    background: isDark ? 'rgba(255,255,255,0.05)' : '#FDF8F5', 
                                                    flexShrink: 0, overflow: 'hidden' 
                                                }}>
                                                    {item.imageUrl || item.img ? (
                                                        <img src={item.imageUrl || item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🍔</div>
                                                    )}
                                                </div>

                                                {/* Right: Content */}
                                                <div style={{ display: 'flex', flex: 1, justifyContent: 'space-between' }}>
                                                    {/* Middle: Name & Edit */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '12px' }}>
                                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: theme.textPrimary, lineHeight: 1.3 }}>
                                                            {item.name}
                                                        </span>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (onEditItem) onEditItem(cartEntry);
                                                            }}
                                                            style={{ 
                                                                background: 'none', border: 'none', padding: 0, 
                                                                color: '#3B82F6', fontWeight: 600, fontSize: '0.9rem', 
                                                                textAlign: 'left', cursor: 'pointer', marginTop: '2px' 
                                                            }}
                                                        >
                                                            {t('Chỉnh sửa')}
                                                        </button>
                                                        {cartEntry.note && (
                                                            <span style={{ display: 'block', fontSize: '0.85rem', color: theme.textSecondary, fontStyle: 'italic', marginTop: 2 }}>
                                                                "{cartEntry.note}"
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Right: Price & Qty */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', flexShrink: 0 }}>
                                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                            <span style={{ fontWeight: 700, fontSize: '1rem', color: theme.textPrimary }}>
                                                                {item.price.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                                            </span>
                                                            {item.originalPrice && item.originalPrice > item.price && (
                                                                <span style={{ fontSize: '0.85rem', color: theme.textSecondary, textDecoration: 'line-through' }}>
                                                                    {item.originalPrice.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        <div style={{ 
                                                            minWidth: 28, height: 28, borderRadius: '14px', padding: '0 8px',
                                                            border: `1.5px solid #10B981`, color: theme.textPrimary,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontWeight: 700, fontSize: '0.9rem', marginTop: 'auto'
                                                        }}>
                                                            {cartEntry.quantity}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {cartItems.length > 2 && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    style={{
                                        width: '100%', padding: '12px', marginTop: '12px', borderRadius: '12px',
                                        background: interactiveBg, border: `1px solid ${interactiveBorder}`,
                                        color: theme.textSecondary, fontWeight: 600, fontSize: '0.9rem',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer'
                                    }}
                                >
                                    {isExpanded ? t('Thu gọn') : `${t('Xem thêm')} ${cartItems.length - 2} ${t('món')}`}
                                    <ChevronDown size={16} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                </button>
                            )}
                        </div>
                    )}

                    {/* Suggested Items Component */}
                    {suggestedItems && suggestedItems.length > 0 && cartItems.length > 0 && (
                        <div style={{ marginTop: '8px', paddingBottom: '24px' }}>
                            <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: theme.textPrimary, padding: '0 20px', marginBottom: '16px' }}>
                                {t('Gợi ý thêm cho bạn')}
                            </h4>
                            <div style={{ 
                                display: 'flex', gap: '16px', overflowX: 'auto', 
                                padding: '0 20px 8px', scrollSnapType: 'x mandatory'
                            }} className="hide-scrollbar">
                                <style dangerouslySetInnerHTML={{__html: `
                                    .hide-scrollbar::-webkit-scrollbar { display: none; }
                                    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                                `}} />
                                {suggestedItems.map((sItem, idx) => (
                                    <div key={idx} style={{ 
                                        display: 'flex', flexDirection: 'column', gap: '8px',
                                        width: 120, flexShrink: 0, scrollSnapAlign: 'start'
                                    }}>
                                        <div style={{ 
                                            width: 120, height: 120, borderRadius: '20px', 
                                            background: isDark ? '#1E293B' : '#FDF8F5',
                                            position: 'relative', overflow: 'hidden'
                                        }}>
                                            {sItem.img || sItem.imageUrl ? (
                                                <img src={sItem.img || sItem.imageUrl} alt={sItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : null}
                                            
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddSuggestedItem && onAddSuggestedItem(sItem);
                                                }}
                                                style={{ 
                                                    position: 'absolute', bottom: 8, right: 8,
                                                    width: 32, height: 32, borderRadius: '16px',
                                                    background: '#10B981', color: '#fff', border: 'none',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    cursor: 'pointer', boxShadow: '0 4px 8px rgba(16,185,129,0.3)'
                                                }}
                                            >
                                                <Plus size={20} strokeWidth={3} />
                                            </button>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ 
                                                fontSize: '0.9rem', fontWeight: 700, color: theme.textPrimary, 
                                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                                                overflow: 'hidden', lineHeight: 1.3 
                                            }}>
                                                {sItem.name}
                                            </span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                                                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: theme.textPrimary }}>
                                                    {sItem.price.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                                </span>
                                                {sItem.originalPrice && sItem.originalPrice > sItem.price && (
                                                    <span style={{ fontSize: '0.75rem', color: theme.textSecondary, textDecoration: 'line-through' }}>
                                                        {sItem.originalPrice.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Totals Section */}
                    {cartItems.length > 0 && (
                        <div style={{ padding: '0 20px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 600, color: theme.textSecondary, fontSize: '1rem' }}>{t('Tổng tạm tính')}</span>
                                <span style={{ fontWeight: 800, color: theme.textPrimary, fontSize: '1.15rem' }}>{total.toLocaleString()}đ</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 500, color: theme.textSecondary, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    {t('Phí dịch vụ & VAT')} 
                                    <span style={{ width: 14, height: 14, borderRadius: 7, border: `1px solid ${theme.textSecondary}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>i</span>
                                </span>
                                <span style={{ fontWeight: 600, color: theme.textSecondary, fontSize: '0.95rem' }}>{t('Miễn phí')}</span>
                            </div>
                        </div>
                    )}

                    {/* Voucher & Payment Settings */}
                    <div style={{ padding: '0 20px 24px' }}>
                        <div style={{ 
                            background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                            borderRadius: '24px', overflow: 'hidden',
                            border: `1px solid ${interactiveBorder}`
                        }}>
                            {/* Voucher Row */}
                            <div 
                                onClick={handleVoucherClick}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                                    padding: '20px', borderBottom: `1px solid ${interactiveBorder}`,
                                    background: voucherCode ? `${theme.accent}10` : 'transparent',
                                    cursor: 'pointer', transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ 
                                    width: 44, height: 44, borderRadius: '14px', 
                                    background: voucherCode ? theme.accent : (isDark ? 'rgba(255,255,255,0.08)' : '#FEF3C7'),
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: voucherCode ? '#fff' : '#D97706', flexShrink: 0
                                }}>
                                    <Ticket size={24} strokeWidth={2.5} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingRight: '8px' }}>
                                    <span style={{ 
                                        fontWeight: 700, fontSize: '0.95rem', color: voucherCode ? theme.accent : theme.textPrimary, marginBottom: 4,
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {t('Ưu đãi & Mã giảm giá')}
                                    </span>
                                    <span style={{ 
                                        fontSize: '0.85rem', color: theme.textSecondary, fontWeight: 500,
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {voucherCode || t('Nhấn để áp dụng')}
                                    </span>
                                </div>
                                <div style={{ color: voucherCode ? theme.accent : theme.textSecondary, flexShrink: 0 }}>
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                            
                            {/* Payment Row */}
                            <div 
                                onClick={() => setIsPaymentDrawerOpen(true)}
                                style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
                                    padding: '20px', background: 'transparent',
                                    cursor: 'pointer', transition: 'background 0.2s'
                                }}
                            >
                                <div style={{ 
                                    width: 44, height: 44, borderRadius: '14px', 
                                    background: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0
                                }}>
                                    <activePaymentMethod.icon size={24} strokeWidth={2.5} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingRight: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 4 }}>
                                        <span style={{ 
                                            fontWeight: 700, fontSize: '0.95rem', color: theme.textPrimary,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                        }}>
                                            {t(activePaymentMethod.label)}
                                        </span>
                                        {baseMethod === 'BANK' && (
                                            <span style={{ 
                                                fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', 
                                                borderRadius: '6px', background: theme.accent, color: '#fff', 
                                                letterSpacing: '0.02em', whiteSpace: 'nowrap', flexShrink: 0,
                                                transform: 'translateY(-1px)'
                                            }}>
                                                {t('HAY DÙNG')}
                                            </span>
                                        )}
                                    </div>
                                    <span style={{ 
                                        fontSize: '0.85rem', color: theme.textSecondary, fontWeight: 500,
                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                                    }}>
                                        {selectedMethod.startsWith('BANK:') ? selectedMethod.split(':')[1] : t('Nhấn để đổi phương thức...')}
                                    </span>
                                </div>
                                <div style={{ color: theme.textSecondary, flexShrink: 0 }}>
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>

                    <div style={{ 
                        padding: '16px 20px 24px', 
                        background: isDark ? 'rgba(5, 5, 16, 0.8)' : 'rgba(255, 255, 255, 0.85)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderTop: `1px solid ${interactiveBorder}`,
                        position: 'sticky', bottom: 0, zIndex: 10,
                        boxShadow: isDark ? '0 -10px 30px rgba(0,0,0,0.5)' : '0 -10px 30px rgba(0,0,0,0.05)'
                    }}>
                        <button 
                            disabled={isProcessing}
                            onClick={() => {
                                if (isGuest && (!allowOtpSkip || !hasSkipped)) {
                                    setLoginReason('PAYMENT');
                                    setIsLoginView(true);
                                    return;
                                }

                                if (selectedMethod === 'CASH') {
                                    onConfirmPayment(selectedMethod, voucherCode);
                                } else if (selectedMethod.startsWith('BANK')) {
                                    setIsBankTransferOpen(true);
                                } else {
                                    setIsAwaitingPayment(true);
                                }
                            }}
                            style={{ 
                                width: '100%', padding: '16px', borderRadius: '16px', 
                                fontWeight: 800, fontSize: '1.05rem', 
                                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                                border: 'none',
                                background: isProcessing ? interactiveBg : theme.accent, 
                                color: isProcessing ? theme.textSecondary : '#fff',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                boxShadow: isProcessing ? 'none' : `0 4px 14px ${theme.accent}50`,
                                transition: 'all 0.2s'
                            }}
                        >
                            {isProcessing ? t('Đang xử lý...') : `${t('Xác nhận thanh toán')} (${total.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ)`}
                        </button>
                    </div>

                {isLoginView && (
                    <div className={styles.overlay} onClick={() => setIsLoginView(false)} style={{ zIndex: 1200 }}>
                        <div 
                            className={styles.sheet} 
                            onClick={e => e.stopPropagation()} 
                            style={{ 
                                background: theme.bg, 
                                display: 'flex', flexDirection: 'column',
                                position: 'relative'
                            }}
                        >
                            <button 
                                onClick={() => setIsLoginView(false)} 
                                style={{ position: 'absolute', top: 16, right: 20, zIndex: 10, background: isDark ? 'rgba(255,255,255,0.08)' : '#F3F4F6', color: theme.textSecondary, border: 'none', padding: '8px', borderRadius: '50%', display: 'flex', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                            <OrderAuthBlock 
                                allowOtpSkip={allowOtpSkip}
                                onSuccess={() => {
                                    setIsLoginView(false);
                                    if (loginReason === 'VOUCHER') setIsVoucherDrawerOpen(true);
                                    else {
                                        if (selectedMethod === 'CASH') onConfirmPayment(selectedMethod, voucherCode);
                                        else if (selectedMethod.startsWith('BANK')) setIsBankTransferOpen(true);
                                        else setIsAwaitingPayment(true);
                                    }
                                }}
                                onSkip={() => {
                                    setIsLoginView(false);
                                    setHasSkipped(true);
                                    if (loginReason === 'PAYMENT') {
                                        if (selectedMethod === 'CASH') onConfirmPayment(selectedMethod, voucherCode);
                                        else if (selectedMethod.startsWith('BANK')) setIsBankTransferOpen(true);
                                        else setIsAwaitingPayment(true);
                                    }
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Modals placed outside flow */}
                <VoucherDrawer 
                    isOpen={isVoucherDrawerOpen}
                    onClose={() => setIsVoucherDrawerOpen(false)}
                    totalAmount={total}
                    onApplyVoucher={(code) => {
                        setVoucherCode(code);
                        setIsVoucherDrawerOpen(false);
                    }}
                    appliedVoucher={voucherCode}
                />

                <PaymentMethodDrawer
                    isOpen={isPaymentDrawerOpen}
                    onClose={() => setIsPaymentDrawerOpen(false)}
                    selectedMethod={baseMethod}
                    onSelectMethod={(method) => {
                        setSelectedMethod(method);
                        setIsPaymentDrawerOpen(false);
                    }}
                />

                {isBankTransferOpen && (
                    <BankTransferModal
                        isOpen={isBankTransferOpen}
                        onClose={() => setIsBankTransferOpen(false)}
                        onSuccess={() => {
                            setIsBankTransferOpen(false);
                            onConfirmPayment(selectedMethod, voucherCode);
                        }}
                    />
                )}

                <AwaitingPaymentModal
                    isOpen={isAwaitingPayment}
                    method={baseMethod}
                    amount={total}
                    bank={selectedMethod.includes(':') ? selectedMethod.split(':')[1] : undefined}
                    onCancel={() => setIsAwaitingPayment(false)}
                    onSuccess={() => {
                        setIsAwaitingPayment(false);
                        onConfirmPayment(selectedMethod, voucherCode);
                    }}
                />
        </div>
    );
}
