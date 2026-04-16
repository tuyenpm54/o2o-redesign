"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeft, Download, Search, X, RefreshCcw, CheckCircle, Maximize2, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useMenuContext } from "../../menu/hooks/useMenuContext";

interface BankTransferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const TOP_BANKS = [
    { code: 'VCB', name: 'Vietcombank', color: '#74B843' },
    { code: 'MBB', name: 'MB Bank', color: '#131E50' },
    { code: 'TCB', name: 'Techcombank', color: '#E51B23' },
    { code: 'TPB', name: 'TPBank', color: '#7A206A' },
    { code: 'BIDV', name: 'BIDV', color: '#00548E' },
    { code: 'CTG', name: 'Vietinbank', color: '#005C99' },
];

const ALL_BANKS = [
    ...TOP_BANKS,
    { code: 'VPB', name: 'VPBank', color: '#00A652' },
    { code: 'VIB', name: 'VIB', color: '#00478F' },
    { code: 'OCB', name: 'OCB', color: '#008443' },
    { code: 'ACB', name: 'ACB Á Châu', color: '#0066B3' },
];

export function BankTransferModal({ isOpen, onClose, onSuccess }: BankTransferModalProps) {
    const { t } = useLanguage();
    const { theme, timeOfDay } = useMenuContext();
    const isDark = timeOfDay === 'evening';

    const [isAllBanksVisible, setIsAllBanksVisible] = useState(false);
    const [timeLeft, setTimeLeft] = useState(900); // 15 mins
    const [isChecking, setIsChecking] = useState(false);
    
    // Popup state
    const [selectedBank, setSelectedBank] = useState<{code: string, name: string, color: string} | null>(null);

    const onCloseRef = React.useRef(onClose);
    const onSuccessRef = React.useRef(onSuccess);

    // Keep refs up-to-date
    useEffect(() => {
        onCloseRef.current = onClose;
        onSuccessRef.current = onSuccess;
    }, [onClose, onSuccess]);

    useEffect(() => {
        if (!isOpen) return;
        setTimeLeft(900);
        setIsChecking(false);

        // Listen for cross-tab mock payment success
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'mock_bank_payment') {
                if (onSuccessRef.current) onSuccessRef.current();
            }
        };
        window.addEventListener('storage', handleStorage);

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                const nextVal = prev - 1;
                if (nextVal <= 0) {
                    clearInterval(timer);
                    if (onCloseRef.current) onCloseRef.current(); 
                    return 0;
                }
                
                // Trigger handleCheck every 10 seconds asynchronously to not freeze state updates
                if (nextVal % 10 === 0 && nextVal < 900) {
                    setTimeout(() => handleCheck(), 0);
                }
                
                return nextVal;
            });
        }, 1000);
        
        return () => {
            clearInterval(timer);
            window.removeEventListener('storage', handleStorage);
        };
        // Using a dummy variable to keep the array size 2, preventing Next.js Fast Refresh from crashing 
        // because we previously had 2 dependencies [isOpen, onClose]
    }, [isOpen, "HMR_FIX"]); 

    const handleCheck = () => {
        setIsChecking(true);
        setTimeout(() => {
            setIsChecking(false);
            // Removing Math.random poll success since we have a dedicated mock button and tab
        }, 1500);
    };

    if (!isOpen) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const handleBankClick = (bank: {code: string, name: string, color: string}) => {
        setSelectedBank(bank);
    };

    const confirmDeeplink = () => {
        if (!selectedBank) return;
        // In production, this would be a deep link like 'vietcombank://...'
        // For simulation, we open our local mock bank page in a new tab
        window.open(`/mock-bank/${selectedBank.code}`, '_blank');
        setSelectedBank(null);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 100000,
            background: theme.bg,
            color: theme.textPrimary,
            display: 'flex', flexDirection: 'column',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', padding: '16px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                background: isDark ? 'rgba(5, 5, 16, 0.8)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 10
            }}>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textPrimary, display: 'flex', alignItems: 'center', cursor: 'pointer', padding: '8px -8px' }}>
                    <ChevronLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0 4px', flex: 1, textAlign: 'center', paddingRight: '24px' }}>
                    {t('Chọn ngân hàng')}
                </h2>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '140px' }}>
                
                {/* Bank Grid */}
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', color: theme.textPrimary }}>
                        {t('Chuyển khoản trực tiếp')}
                    </h3>
                    <div style={{
                        background: theme.cardBg, borderRadius: '20px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                        padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                    }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {TOP_BANKS.map((b) => (
                                <button key={b.code} onClick={() => handleBankClick(b)} style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                                    padding: '12px 8px', background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'}`, 
                                    borderRadius: '16px', cursor: 'pointer', transition: 'transform 0.1s'
                                }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>
                                        {b.code}
                                    </div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textPrimary, whiteSpace: 'nowrap' }}>{b.name}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsAllBanksVisible(true)} style={{
                            width: '100%', background: isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9', border: 'none',
                            color: theme.textPrimary, fontWeight: 600, fontSize: '0.9rem', borderRadius: '12px',
                            padding: '12px', cursor: 'pointer', marginTop: '4px'
                        }}>
                            {t('Xem tất cả ngân hàng')}
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.6 }}>
                    <div style={{ flex: 1, height: '1px', background: theme.textSecondary }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>HOẶC</span>
                    <div style={{ flex: 1, height: '1px', background: theme.textSecondary }} />
                </div>

                {/* Small QR Code Section */}
                <div style={{
                    background: theme.cardBg,
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                    borderRadius: '20px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '16px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                }}>
                    {/* Tiny QR box */}
                    <div style={{
                        width: '72px', height: '72px', background: '#fff', borderRadius: '12px', padding: '6px',
                        border: '1px solid #E2E8F0', flexShrink: 0, position: 'relative', cursor: 'pointer'
                    }} onClick={() => alert('Phóng to QR')}>
                        <div style={{
                            width: '100%', height: '100%', background: 'white',
                            backgroundImage: 'radial-gradient(black 15%, transparent 16%), radial-gradient(black 15%, transparent 16%)',
                            backgroundSize: '8px 8px', backgroundPosition: '0 0, 4px 4px'
                        }} />
                        <div style={{ position: 'absolute', bottom: -6, right: -6, background: theme.accent, color: '#fff', borderRadius: '50%', padding: '4px' }}>
                            <Maximize2 size={12} />
                        </div>
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 4px 0', color: theme.textPrimary }}>
                            {t('Quét mã QR')}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: theme.textSecondary, margin: '0 0 10px 0', lineHeight: 1.4 }}>
                            {t('Dùng thiết bị khác để quét hoặc tải ảnh về')}
                        </p>
                        <button style={{
                            background: 'transparent', color: theme.accent, border: 'none', padding: 0,
                            fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                        }}>
                            <Download size={14} />
                            {t('Tải QR về máy')}
                        </button>
                    </div>
                </div>
                
            </div>

            {/* Sticky Bottom Footer: Status & Timer */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 50,
                background: isDark ? 'rgba(5,5,16,0.95)' : 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(20px)',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: '12px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: theme.textSecondary, fontWeight: 500 }}>
                        {t('Giao dịch hết hạn sau:')}
                    </span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: timeLeft < 60 ? '#EF4444' : theme.textPrimary }}>
                        {formattedTime}
                    </span>
                </div>
                
                <button 
                    onClick={handleCheck}
                    disabled={isChecking}
                    style={{
                        width: '100%', padding: '16px', borderRadius: '14px',
                        background: theme.accent, color: '#fff', border: 'none',
                        fontWeight: 700, fontSize: '1rem', cursor: isChecking ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        opacity: isChecking ? 0.8 : 1, transition: 'all 0.2s',
                        boxShadow: `0 8px 20px ${theme.accent}40`
                    }}
                >
                    {isChecking ? (
                        <>
                            <RefreshCcw size={20} style={{ animation: 'spinFast 1s linear infinite' }} />
                            {t('Đang kiểm tra...')}
                        </>
                    ) : (
                        <>
                            <CheckCircle size={20} />
                            {t('Kiểm tra giao dịch')}
                        </>
                    )}
                    <style>{`@keyframes spinFast { 100% { transform: rotate(360deg); } }`}</style>
                </button>
            </div>

            {/* Deeplink Confirmation Popup */}
            {selectedBank && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200000,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{
                        background: theme.bg, borderRadius: '24px', width: '100%', maxWidth: '340px',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{ width: 64, height: 64, borderRadius: '16px', background: selectedBank.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            {selectedBank.code}
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 8px 0', textAlign: 'center', color: theme.textPrimary }}>
                            {t('Mở ứng dụng')} {selectedBank.name}?
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: theme.textSecondary, textAlign: 'center', margin: '0 0 24px 0', lineHeight: 1.4 }}>
                            {t(`Hệ thống sẽ chuyển hướng bạn đến ứng dụng ${selectedBank.name} để hoàn tất thanh toán.`)}
                        </p>
                        
                        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                            <button onClick={() => setSelectedBank(null)} style={{
                                flex: 1, padding: '14px', borderRadius: '12px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'}`,
                                background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', color: theme.textPrimary,
                                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer'
                            }}>
                                {t('Thoát')}
                            </button>
                            <button onClick={confirmDeeplink} style={{
                                flex: 1, padding: '14px', borderRadius: '12px', border: 'none',
                                background: theme.accent, color: '#fff',
                                fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                boxShadow: `0 4px 12px ${theme.accent}40`
                            }}>
                                {t('Mở App')} <ExternalLink size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Selection Drawer (Bottom Sheet) */}
            {isAllBanksVisible && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100001,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <div style={{ flex: 1 }} onClick={() => setIsAllBanksVisible(false)} />
                    <div style={{
                        background: theme.bg, borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
                        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
                        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}>
                        <div style={{ padding: '16px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
                            <div style={{ width: '40px', height: '4px', background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', borderRadius: '2px', margin: '0 auto 16px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: theme.textPrimary }}>{t('Chọn ngân hàng')}</h3>
                                <button onClick={() => setIsAllBanksVisible(false)} style={{ background: 'none', border: 'none', color: theme.textSecondary, cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>
                            
                            {/* Search bar inside drawer */}
                            <div style={{ marginTop: '16px', position: 'relative' }}>
                                <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                                <input 
                                    type="text" 
                                    placeholder={t('Tìm kiếm ngân hàng')}
                                    style={{
                                        width: '100%', padding: '14px 16px 14px 44px',
                                        borderRadius: '12px', border: '1px solid #E2E8F0',
                                        background: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                                        color: theme.textPrimary, fontSize: '0.95rem'
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{ padding: '20px', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                                {ALL_BANKS.map((b) => (
                                    <button key={b.code} onClick={() => { setIsAllBanksVisible(false); handleBankClick(b); }} style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
                                        padding: '16px 8px', background: isDark ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
                                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : '#E2E8F0'}`,
                                        borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s'
                                    }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '12px', background: b.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '0.85rem' }}>
                                            {b.code}
                                        </div>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: theme.textPrimary, textAlign: 'center' }}>{b.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
