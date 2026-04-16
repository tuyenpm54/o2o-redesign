"use client";
import React, { useState } from "react";
import { X, Ticket, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useMenuContext } from "../../menu/hooks/useMenuContext";

interface VoucherDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectVoucher: (code: string | null) => void;
    selectedVoucher: string | null;
}

export function VoucherDrawer({ isOpen, onClose, onSelectVoucher, selectedVoucher }: VoucherDrawerProps) {
    const { t, language } = useLanguage();
    const { theme, timeOfDay } = useMenuContext();
    const isDark = timeOfDay === 'evening';
    
    const [activeTab, setActiveTab] = useState<'RESTAURANT' | 'USER'>('RESTAURANT');

    if (!isOpen) return null;

    const interactiveBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const interactiveBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';

    const mockRestaurantVouchers = [
        { code: 'GIAM10K', title: 'Giảm 10K', desc: 'Cho đơn từ 100K', maxSale: 10000, condition: 100000, exp: 'Hết hạn lúc 23:59 hôm nay' },
        { code: 'FREESHIP', title: 'Miễn phí giao hàng', desc: 'Cho đơn từ 150K', maxSale: 15000, condition: 150000, exp: 'Không giới hạn' },
    ];

    const mockUserVouchers = [
        { code: 'SINHNHAT', title: 'Quà sinh nhật của bạn', desc: 'Giảm 20% tối đa 50K', maxSale: 50000, condition: 0, exp: 'Hết hạn sau 3 ngày' },
        { code: 'THANTHIET', title: 'Mã khách quen', desc: 'Tặng 1 nước miễn phí', maxSale: 30000, condition: 0, exp: 'Áp dụng mọi đơn' },
    ];

    const activeVouchers = activeTab === 'RESTAURANT' ? mockRestaurantVouchers : mockUserVouchers;

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
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: theme.textPrimary }}>
                            {t('Chọn Voucher')}
                        </h3>
                        <button onClick={onClose} style={{ background: interactiveBg, border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.textSecondary, cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', padding: '0 16px', borderBottom: `1px solid ${interactiveBorder}` }}>
                    <button 
                        onClick={() => setActiveTab('RESTAURANT')}
                        style={{ 
                            flex: 1, padding: '16px 0', border: 'none', background: 'transparent',
                            color: activeTab === 'RESTAURANT' ? theme.accent : theme.textSecondary,
                            fontWeight: activeTab === 'RESTAURANT' ? 700 : 500,
                            position: 'relative', cursor: 'pointer', fontSize: '0.95rem'
                        }}
                    >
                        {t('Nhà hàng')}
                        {activeTab === 'RESTAURANT' && (
                            <div style={{ position: 'absolute', bottom: 0, left: '10%', width: '80%', height: '3px', background: theme.accent, borderTopLeftRadius: '3px', borderTopRightRadius: '3px' }} />
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('USER')}
                        style={{ 
                            flex: 1, padding: '16px 0', border: 'none', background: 'transparent',
                            color: activeTab === 'USER' ? theme.accent : theme.textSecondary,
                            fontWeight: activeTab === 'USER' ? 700 : 500,
                            position: 'relative', cursor: 'pointer', fontSize: '0.95rem'
                        }}
                    >
                        {t('Của bạn')}
                        {activeTab === 'USER' && (
                            <div style={{ position: 'absolute', bottom: 0, left: '10%', width: '80%', height: '3px', background: theme.accent, borderTopLeftRadius: '3px', borderTopRightRadius: '3px' }} />
                        )}
                    </button>
                </div>

                {/* Voucher List */}
                <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Clear selection option */}
                    {selectedVoucher && (
                        <button 
                            onClick={() => { onSelectVoucher(null); onClose(); }}
                            style={{ 
                                padding: '12px', borderRadius: '12px', border: `1px dashed #EF4444`, 
                                color: '#EF4444', background: 'transparent', fontWeight: 600, 
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' 
                            }}
                        >
                            <X size={18} /> {t('Bỏ chọn Voucher hiện tại')}
                        </button>
                    )}

                    {activeVouchers.length > 0 ? (
                        activeVouchers.map((v) => (
                            <div 
                                key={v.code} 
                                onClick={() => { onSelectVoucher(v.code); onClose(); }}
                                style={{ 
                                    display: 'flex', border: `1px solid ${selectedVoucher === v.code ? theme.accent : interactiveBorder}`,
                                    borderRadius: '16px', overflow: 'hidden', cursor: 'pointer',
                                    background: selectedVoucher === v.code ? theme.accentLight : theme.bg,
                                    height: '100px'
                                }}
                            >
                                {/* Left stub */}
                                <div style={{ 
                                    width: '100px', background: selectedVoucher === v.code ? theme.accent : interactiveBg,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    color: selectedVoucher === v.code ? '#fff' : theme.accent, pading: 12
                                }}>
                                    <Ticket size={28} strokeWidth={2} style={{ marginBottom: 4 }} />
                                    <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{v.code}</span>
                                </div>
                                {/* Divider line inside border */}
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderLeft: `1px dashed ${selectedVoucher === v.code ? '#fff' : interactiveBorder}` }}>
                                    {/* Semi circles cutouts could go here if we want absolute perfection, avoiding for simplicity */}
                                </div>
                                {/* Content */}
                                <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: theme.textPrimary, marginBottom: '4px' }}>{t(v.title)}</div>
                                    <div style={{ fontSize: '0.8rem', color: theme.textSecondary, marginBottom: '8px' }}>{t(v.desc)}</div>
                                    <div style={{ fontSize: '0.7rem', color: theme.textSecondary }}>{t(v.exp)}</div>
                                </div>
                                {/* Checkmark */}
                                {selectedVoucher === v.code && (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: '16px', color: theme.accent }}>
                                        <div style={{ width: 24, height: 24, borderRadius: '50%', background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                                            ✓
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.textSecondary }}>
                            <Ticket size={48} opacity={0.2} style={{ margin: '0 auto 12px' }} />
                            <p>{t('Bạn chưa có voucher nào ở đây')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
