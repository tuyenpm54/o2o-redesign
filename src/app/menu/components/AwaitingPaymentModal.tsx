"use client";
import React, { useState, useEffect } from "react";
import { X, RefreshCcw, ExternalLink, ShieldCheck, HelpCircle, RotateCw } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useMenuContext } from "../../menu/hooks/useMenuContext";

interface AwaitingPaymentModalProps {
    isOpen: boolean;
    amount?: number;
    method: string;
    bank?: string;
    onCancel: () => void;
    onSuccess: () => void;
}

const WALLET_CONFIG: Record<string, {name: string, bg: string, text: string, scheme: string}> = {
    'MOMO': { name: 'MoMo', bg: '#A50064', text: '#FFFFFF', scheme: 'momo://' },
    'ZALOPAY': { name: 'ZaloPay', bg: '#0068FF', text: '#FFFFFF', scheme: 'zalopay://' },
    'CASH': { name: 'Tiền mặt', bg: '#10B981', text: '#FFFFFF', scheme: '' },
    'BANK': { name: 'Ngân hàng', bg: '#3B82F6', text: '#FFFFFF', scheme: 'banking://' }
};

export function AwaitingPaymentModal({ isOpen, method, amount = 0, bank, onCancel, onSuccess }: AwaitingPaymentModalProps) {
    const { t } = useLanguage();
    const { theme, timeOfDay } = useMenuContext();
    const isDark = timeOfDay === 'evening';

    const [timeLeft, setTimeLeft] = useState(900); // 15 mins
    const [isChecking, setIsChecking] = useState(false);
    
    const walletInfo = WALLET_CONFIG[method] || WALLET_CONFIG['BANK'];
    
    // Simulate initial deeplink popup
    useEffect(() => {
        if (!isOpen) return;
        setTimeLeft(900);
        
        let appName = walletInfo.name;
        if (method === 'BANK') appName = bank ? `${bank} App` : 'Ngân hàng';
        
        if (walletInfo.scheme) {
            console.log(`[DeepLink Sim] Auto-opening ${appName}...`);
            // Using timeout just to simulate native execution delay
            const timer = setTimeout(() => {
                const proceed = window.confirm(t('Hệ thống đang mở ứng dụng {{appName}} để bạn xác nhận thanh toán. Thao tác tiếp tục?').replace('{{appName}}', appName));
                if (!proceed) {
                    console.log("[DeepLink Sim] Auto-launch cancelled by user.");
                }
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [isOpen, method, bank, t, walletInfo]);

    // Timer logic
    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    onCancel(); 
                    return 0;
                }
                
                // Polling simulation every 10 seconds
                if (prev % 10 === 0 && prev < 900) {
                    setIsChecking(true);
                    setTimeout(() => setIsChecking(false), 2000);
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, onCancel]);

    if (!isOpen) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    const handleManualDeepLink = () => {
        let appName = walletInfo.name;
        if (method === 'BANK') appName = bank || 'Ngân hàng';
        const proceed = window.confirm(t('Mở ứng dụng {{appName}} để thanh toán ngay bây giờ?').replace('{{appName}}', appName));
        if (proceed) {
            console.log(`[DeepLink Sim] Manual trigger: ${walletInfo.scheme}`);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999,
            background: isDark ? 'rgba(5, 5, 16, 0.85)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            display: 'flex', flexDirection: 'column',
            animation: 'fadeIn 0.3s ease-out',
            overflow: 'hidden'
        }}>
            
            {/* Context-aware Brand Background Aura */}
            <div style={{
                position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
                width: '120vw', height: '50vh', borderRadius: '50%',
                background: `radial-gradient(ellipse at center, ${walletInfo.bg}30 0%, transparent 70%)`,
                filter: 'blur(40px)', zIndex: 0, opacity: isDark ? 0.6 : 0.8,
                animation: 'pulseAura 4s ease-in-out infinite alternate'
            }} />
            
            <style>{`
                @keyframes pulseAura { 0% { opacity: 0.5; transform: translateX(-50%) scale(0.95); } 100% { opacity: 1; transform: translateX(-50%) scale(1.05); } }
                @keyframes spinFast { 100% { transform: rotate(360deg); } }
                @keyframes slideUpFade { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
            `}</style>
            
            {/* Header / Dismiss */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', zIndex: 10, position: 'relative' }}>
                <button 
                    onClick={onCancel}
                    style={{ 
                        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                        border: 'none', borderRadius: '14px', width: 44, height: 44,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: theme.textSecondary, cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.6 }}>
                    <ShieldCheck size={18} color={theme.textSecondary} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: theme.textSecondary }}>Secure Payment</span>
                </div>
            </div>

            {/* Core Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', zIndex: 10, animation: 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                
                {/* Visual Countdown & Brand Identity */}
                <div style={{ position: 'relative', marginBottom: '40px' }}>
                    {/* Circle Progress Timer (SVG) */}
                    <svg width="160" height="160" viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="80" cy="80" r="74" fill="none" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} strokeWidth="6" />
                        <circle 
                            cx="80" cy="80" r="74" fill="none" 
                            stroke={timeLeft < 60 ? '#EF4444' : walletInfo.bg} 
                            strokeWidth="8" 
                            strokeDasharray={2 * Math.PI * 74}
                            strokeDashoffset={(2 * Math.PI * 74) * (1 - timeLeft / 900)}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                        />
                    </svg>
                    
                    {/* Brand Icon floating inside */}
                    <div style={{ 
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        width: 72, height: 72, borderRadius: '20px', 
                        background: walletInfo.bg, color: walletInfo.text,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 8px 24px ${walletInfo.bg}40`,
                    }}>
                        <span style={{ fontWeight: 900, fontSize: '1rem', letterSpacing: '-0.02em', textAlign: 'center', lineHeight: 1 }}>
                            {walletInfo.name === 'MoMo' ? <>mo<br/>mo</> : walletInfo.name}
                        </span>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ 
                        fontSize: '3rem', fontWeight: 900, color: timeLeft < 60 ? '#EF4444' : theme.textPrimary,
                        letterSpacing: '-0.04em', lineHeight: 1, marginBottom: '8px'
                    }}>
                        {formattedTime}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: theme.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        {t('Giao dịch hết hạn sau')}
                    </div>
                </div>

                {/* Amount Glass Badge */}
                <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 24px',
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    borderRadius: '100px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}`
                }}>
                    <span style={{ fontSize: '0.9rem', color: theme.textSecondary, fontWeight: 600 }}>
                        {t('Thanh toán')}
                    </span>
                    <div style={{ height: '16px', width: '1px', background: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }} />
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.textPrimary }}>
                        {amount.toLocaleString('vi-VN')}đ
                    </div>
                </div>

            </div>

            {/* Action & Polling Footer */}
            <div style={{ padding: '32px 24px 48px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Polling Health bar */}
                <div style={{ 
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                    padding: '16px', borderRadius: '24px',
                    display: 'flex', flexDirection: 'column', gap: '12px',
                    border: `1px solid ${isChecking ? `${walletInfo.bg}40` : 'transparent'}`,
                    transition: 'all 0.3s'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isChecking ? walletInfo.bg : theme.textPrimary }}>
                            {isChecking ? <RotateCw size={18} style={{ animation: 'spinFast 1s linear infinite' }} /> : <RefreshCcw size={18} style={{ opacity: 0.5 }} />}
                            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                                {isChecking ? t('Đang kiểm tra kết quả...') : t('Hệ thống kiểm tra mỗi 10 giây')}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: isChecking ? walletInfo.bg : theme.textSecondary }}>
                            {isChecking ? 'Checking...' : 'Active'}
                        </div>
                    </div>
                    {/* Activity Indicator Dots */}
                    <div style={{ display: 'flex', gap: '6px' }}>
                        {[...Array(5)].map((_, i) => (
                            <div key={i} style={{ 
                                flex: 1, height: '4px', borderRadius: '2px', 
                                background: isChecking ? walletInfo.bg : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
                                opacity: isChecking ? (1 - i*0.15) : 1,
                                animation: isChecking ? `pulseAura 0.8s infinite alternate ${i * 0.1}s` : 'none',
                                transition: 'all 0.3s'
                            }} />
                        ))}
                    </div>
                </div>

                <button 
                    onClick={handleManualDeepLink}
                    style={{
                        width: '100%', padding: '20px', borderRadius: '24px',
                        background: walletInfo.bg, color: walletInfo.text, border: 'none',
                        fontWeight: 800, fontSize: '1.2rem', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        boxShadow: `0 12px 32px ${walletInfo.bg}40`,
                        transition: 'all 0.2s',
                    }}
                >
                    {t('Mở ứng dụng')} {bank || walletInfo.name} <ExternalLink size={22} />
                </button>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                    <button 
                        onClick={onSuccess}
                        style={{
                            background: 'transparent', border: 'none', color: theme.textSecondary,
                            fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', opacity: 0.5,
                            textDecoration: 'underline'
                        }}
                    >
                        [DEV] Bỏ qua chờ & Giả lập thành công
                    </button>
                </div>
            </div>

        </div>
    );
}
