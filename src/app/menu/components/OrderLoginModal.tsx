'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import styles from './OrderLoginModal.module.css';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useMenuContext } from '../hooks/useMenuContext';

interface OrderLoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    onSkip: () => void;
}

export function OrderLoginModal({ isOpen, onClose, onSuccess, onSkip }: OrderLoginModalProps) {
    const { login } = useAuth();
    const { t } = useLanguage();
    const { theme, timeOfDay } = useMenuContext();
    const isDark = timeOfDay === 'evening';

    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSendOtp = () => {
        if (phone.length >= 9) {
            setStep('OTP');
        }
    };

    const handleVerify = async () => {
        if (otp === '123456') {
            setIsLoading(true);
            const user = await login(phone);
            setIsLoading(false);
            
            if (user) {
                onSuccess();
            } else {
                alert(t('Đăng nhập thất bại, vui lòng thử lại'));
            }
        } else {
            alert(t('OTP không đúng (thử 123456)'));
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div 
                className={`${styles.modal} ${isDark ? styles.darkModal : ''}`} 
                onClick={e => e.stopPropagation()}
                style={{
                    background: theme.bg,
                    color: theme.textPrimary,
                    boxShadow: theme.cardShadow
                }}
            >
                <div className={styles.header}>
                    <h3 className={styles.title} style={{ color: theme.textPrimary }}>
                        {t('Đăng nhập để tích điểm')}
                    </h3>
                    <button 
                        className={styles.closeBtn} 
                        onClick={onClose}
                        style={{ color: theme.textSecondary }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {step === 'PHONE' ? (
                    <>
                        <h4 className={styles.stepTitle}>{t('Xin chào! 👋')}</h4>
                        <p className={styles.stepSub}>
                            {t('Nhập số điện thoại để lưu lịch sử gọi món & nhận ưu đãi.')}
                        </p>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>{t('Số điện thoại')}</label>
                            <input
                                type="tel"
                                className={styles.input}
                                placeholder="09xx xxx xxx"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                                    color: theme.textPrimary
                                }}
                            />
                        </div>

                        <button 
                            className={styles.primaryBtn} 
                            onClick={handleSendOtp} 
                            disabled={phone.length < 9}
                        >
                            {t('Tiếp tục')}
                        </button>
                        <button 
                            className={styles.skipBtn} 
                            onClick={onSkip}
                        >
                            {t('Bỏ qua & Yêu cầu gọi món')}
                        </button>
                    </>
                ) : (
                    <>
                        <h4 className={styles.stepTitle}>{t('Nhập mã xác thực')}</h4>
                        <p className={styles.stepSub}>
                            {t('Mã OTP đã được gửi đến')} {phone}
                        </p>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>{t('Mã OTP')}</label>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                                style={{
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1',
                                    color: theme.textPrimary
                                }}
                            />
                        </div>

                        <button 
                            className={styles.primaryBtn} 
                            onClick={handleVerify} 
                            disabled={otp.length < 6 || isLoading}
                        >
                            {isLoading ? t('Đang xử lý...') : t('Xác thực & Gọi món')}
                        </button>

                        <button className={styles.resendBtn} onClick={() => setStep('PHONE')}>
                            {t('Gửi lại mã')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
