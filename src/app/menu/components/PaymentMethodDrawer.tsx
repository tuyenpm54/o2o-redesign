"use client";
import React, { useState } from "react";
import { X, Wallet, CreditCard, Banknote, CheckCircle2, Building, ChevronRight, ChevronLeft } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useMenuContext } from "../../menu/hooks/useMenuContext";

interface PaymentMethodDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectMethod: (method: string) => void;
    selectedMethod: string;
}

export const PAYMENT_METHODS = [
    { id: 'ZALOPAY', label: 'ZaloPay', icon: Wallet, group: 'Ví điện tử' },
    { id: 'MOMO', label: 'MoMo', icon: Wallet, group: 'Ví điện tử' },
    { id: 'BANK', label: 'Chuyển khoản ngân hàng', icon: Building, group: 'Mobile Banking' },
    { id: 'CASH', label: 'Tiền mặt tại quầy', icon: Banknote, group: 'Khác' }
];

const BANK_LIST = [
    { code: 'VIETCOMBANK', name: 'Vietcombank', color: '#74B843' },
    { code: 'MBBANK', name: 'MB Bank', color: '#131E50' },
    { code: 'TECHCOMBANK', name: 'Techcombank', color: '#E51B23' },
    { code: 'TPBANK', name: 'TPBank', color: '#7A206A' },
];

export function PaymentMethodDrawer({ isOpen, onClose, onSelectMethod, selectedMethod }: PaymentMethodDrawerProps) {
    const { t } = useLanguage();
    const { theme, timeOfDay } = useMenuContext();
    const isDark = timeOfDay === 'evening';

    const [view, setView] = useState<'methods' | 'banks'>('methods');

    if (!isOpen) return null;

    const interactiveBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const interactiveBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';

    return (
        <div style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0, top: 0,
            zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            justifyContent: 'flex-end',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(2px)',
            animation: 'fadeIn 0.2s ease-out'
        }}>
            {/* Click to close */}
            <div style={{ flex: 1 }} onClick={onClose} />

            {/* Sheet Content */}
            <div style={{
                background: theme.bg,
                borderTopLeftRadius: '24px',
                borderTopRightRadius: '24px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Drag Handle & Header */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderBottom: `1px solid ${interactiveBorder}` }}>
                    <div style={{ width: '40px', height: '4px', background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', borderRadius: '2px', marginBottom: '16px' }} />
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ width: 36 }} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: theme.textPrimary, textAlign: 'center', flex: 1 }}>
                            {t('Chọn Phương thức')}
                        </h3>
                        <button onClick={onClose} style={{ background: interactiveBg, border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary, cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {PAYMENT_METHODS.map((opt) => {
                        const isSelected = selectedMethod === opt.id || (opt.id === 'BANK' && selectedMethod.startsWith('BANK:'));
                        
                        return (
                            <div 
                                key={opt.id}
                                onClick={() => { 
                                    onSelectMethod(opt.id); 
                                    onClose(); 
                                }}
                                style={{
                                    padding: '18px 16px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: isSelected ? theme.accentLight : interactiveBg,
                                    border: `1px solid ${isSelected ? theme.accent : interactiveBorder}`,
                                    cursor: 'pointer',
                                    borderRadius: '16px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', opacity: isSelected ? 1 : 0.8 }}>
                                    <div style={{ 
                                        width: 44, height: 44, borderRadius: '12px', 
                                        background: isSelected ? theme.accent : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'),
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: isSelected ? '#fff' : theme.textPrimary 
                                    }}>
                                        <opt.icon size={22} />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 2 }}>
                                            <span style={{ fontWeight: isSelected ? 700 : 600, fontSize: '1rem', color: isSelected ? theme.accent : theme.textPrimary }}>
                                                {t(opt.label)}
                                            </span>
                                            {opt.id === 'BANK' && (
                                                <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '6px', background: theme.accent, color: '#fff', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                                                    {t('HAY DÙNG')}
                                                </span>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: theme.textSecondary }}>
                                            {t(opt.group)}
                                        </span>
                                    </div>
                                </div>
                                {isSelected && <CheckCircle2 size={24} color={theme.accent} />}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
