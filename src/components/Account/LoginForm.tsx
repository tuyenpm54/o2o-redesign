'use client';

import React, { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import styles from './LoginForm.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export const LoginForm = () => {
    const { login, loginAsGuest } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    const handleSendOtp = () => {
        if (phone.length >= 9) {
            setStep('OTP');
        }
    };

    const handleVerifyParams = () => {
        if (otp === '123456') {
            login(phone);
        } else {
            alert('OTP không đúng (thử 123456)');
        }
    };

    const handleGuestLogin = () => {
        loginAsGuest();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.back()}>
                    <ArrowLeft size={24} color="#1F2937" />
                </button>
                <h1 className={styles.title}>Đăng nhập</h1>
            </div>

            <div className={styles.content}>
                <div className={styles.logoPlace}>
                    {/* Placeholder for Logo */}
                    <div className={styles.logoCircle}>O2O</div>
                </div>

                <div className={styles.formSection}>
                    {step === 'PHONE' ? (
                        <>
                            <h2 className={styles.stepTitle}>Xin chào! 👋</h2>
                            <p className={styles.stepSub}>Nhập số điện thoại để tiếp tục tích điểm & nhận ưu đãi.</p>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Số điện thoại</label>
                                <input
                                    type="tel"
                                    className={styles.input}
                                    placeholder="09xx xxx xxx"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>

                            <button className={styles.primaryBtn} onClick={handleSendOtp} disabled={phone.length < 9}>
                                Tiếp tục
                            </button>

                            <div className={styles.divider}>
                                <span>Hoặc</span>
                            </div>

                            <button className={styles.guestBtn} onClick={handleGuestLogin}>
                                Tiếp tục với vai trò Khách
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className={styles.stepTitle}>Nhập mã xác thực</h2>
                            <p className={styles.stepSub}>Mã OTP đã được gửi đến {phone}</p>

                            <div className={styles.inputGroup}>
                                <label className={styles.label}>Mã OTP</label>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                            </div>

                            <button className={styles.primaryBtn} onClick={handleVerifyParams} disabled={otp.length < 6}>
                                Xác thực
                            </button>

                            <button className={styles.resendBtn} onClick={() => setStep('PHONE')}>
                                Gửi lại mã
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
