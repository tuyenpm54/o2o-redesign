'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useMenuContext } from '../hooks/useMenuContext';
import { useAuth } from '@/context/AuthContext';

interface OrderAuthBlockProps {
    onSuccess: (user: any) => void;
    onSkip: () => void;
    allowOtpSkip: boolean;
}

export function OrderAuthBlock({ onSuccess, onSkip, allowOtpSkip }: OrderAuthBlockProps) {
    const { t } = useLanguage();
    const { theme, timeOfDay } = useMenuContext();
    const isDark = timeOfDay === 'evening';
    const disabledBg = isDark ? '#334155' : '#94A3B8';
    const interactiveBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : '#E2E8F0';
    
    const { login } = useAuth();
    
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [otpCountdown, setOtpCountdown] = useState(0);
    const [isLoginProcessing, setIsLoginProcessing] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (otpCountdown > 0) {
            timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [otpCountdown]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                <style dangerouslySetInnerHTML={{__html: `
                    @keyframes popIn {
                        0% { transform: scale(0.5); opacity: 0; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}} />
            </div>

            {/* Sticky Actions Footer */}
            <div style={{ 
                padding: '16px 20px 24px', 
                background: isDark ? 'rgba(5, 5, 16, 0.8)' : 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTop: `1px solid ${interactiveBorder}`,
                boxShadow: isDark ? '0 -10px 30px rgba(0,0,0,0.5)' : '0 -10px 30px rgba(0,0,0,0.05)'
            }}>
                <button 
                    disabled={otp.length < 6 || isLoginProcessing}
                    onClick={async () => {
                        if (otp === '123456') {
                            setIsLoginProcessing(true);
                            const user = await login(phone);
                            setIsLoginProcessing(false);
                            if (user) {
                                onSuccess(user);
                            } else {
                                alert(t('Đăng nhập thất bại'));
                            }
                        } else {
                            alert(t('OTP không đúng (thử 123456)'));
                        }
                    }}
                    style={{ 
                        width: '100%', padding: '16px', borderRadius: '16px', 
                        fontWeight: 800, fontSize: '1.05rem', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                        border: 'none',
                        background: (otp.length < 6 || isLoginProcessing) ? disabledBg : theme.accent, 
                        color: (otp.length < 6 || isLoginProcessing) ? 'rgba(255,255,255,0.7)' : '#fff',
                        cursor: (otp.length < 6 || isLoginProcessing) ? 'not-allowed' : 'pointer',
                        boxShadow: (otp.length < 6 || isLoginProcessing) ? 'none' : `0 8px 24px ${theme.accent}40`,
                        transition: 'all 0.2s'
                    }}
                >
                    {isLoginProcessing ? t('Đang xử lý...') : t('Xác thực & Gọi món')}
                </button>

                {allowOtpSkip && (
                    <button 
                        onClick={onSkip}
                        style={{
                            width: '100%', padding: '16px', marginTop: 12, borderRadius: '16px',
                            fontWeight: 700, fontSize: '1rem',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            border: `1.5px solid ${interactiveBorder}`,
                            background: 'transparent',
                            color: theme.textSecondary,
                            cursor: 'pointer'
                        }}
                    >
                        {t('Bỏ qua đăng nhập')}
                    </button>
                )}
            </div>
        </div>
    );
}
