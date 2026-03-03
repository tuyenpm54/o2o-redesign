"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Info, User as UserIcon, X } from "lucide-react";
import styles from "../page.module.css";
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface DiscoveryHeaderProps {
    restaurant: any;
    tableid: string | null;
}

export function DiscoveryHeader({ restaurant, tableid }: DiscoveryHeaderProps) {
    const { isLoggedIn, isGuest, user, login } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const [showLogin, setShowLogin] = useState(false);
    const [phone, setPhone] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.trim()) {
            login(phone);
            setShowLogin(false);
        }
    };

    return (
        <div className={styles.headerWrapperCompact}>
            <header className={styles.headerCompact}>
                <div className={styles.storeInfoCompact}>
                    <div className={styles.titleRow}>
                        <h1 className={styles.storeNameCompact}>{restaurant?.name || t("Đang tải...")}</h1>
                        <Info size={16} className={styles.infoIconStore} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className={styles.tableBadge}>
                            <span>{t('Bàn')} {tableid || restaurant?.table || "--"}</span>
                        </div>
                        <div className={styles.langSwitcher}>
                            <button
                                className={`${styles.langBtn} ${language === 'vi' ? styles.langActive : ''}`}
                                onClick={() => setLanguage('vi')}
                            >
                                VN
                            </button>
                            <button
                                className={`${styles.langBtn} ${language === 'en' ? styles.langActive : ''}`}
                                onClick={() => setLanguage('en')}
                            >
                                EN
                            </button>
                        </div>
                    </div>
                </div>
                <div className={styles.userStatsCompact}>
                    {isLoggedIn && user ? (
                        <div className={styles.userInfoCompactWrapper}>
                            <button
                                className={styles.userInfoCompact}
                                onClick={() => {
                                    if (isGuest) {
                                        setShowLogin(true);
                                    } else {
                                        router.push(`/account?from=${pathname}`);
                                    }
                                }}
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        className={isGuest ? styles.userAvatarGuest : styles.userAvatarCompact}
                                        alt="Avatar"
                                    />
                                ) : (
                                    <div className={isGuest ? styles.avatarPlaceholderGuest : styles.avatarPlaceholderCompact}>
                                        {user.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </button>
                            <span className={styles.userNameCompact}>{user.name || t('Khách')}</span>
                        </div>
                    ) : (
                        <button className={styles.loginLink} onClick={() => setShowLogin(true)}>
                            <div className={styles.loginIconCircle}>
                                <UserIcon size={20} />
                            </div>
                            <span className={styles.loginText}>{t('Đăng nhập')}</span>
                        </button>
                    )}
                </div>
            </header>

            {showLogin && (
                <div className={styles.chatModalOverlay} onClick={() => setShowLogin(false)} style={{ zIndex: 10000 }}>
                    <div className={styles.chatModalContainer} style={{ height: 'auto', bottom: 0, paddingBottom: 24 }} onClick={e => e.stopPropagation()}>
                        <div className={styles.chatHeader}>
                            <div className={styles.chatHeaderTitleGroup}>
                                <h3 className={styles.chatTitle}>{t('Đăng nhập để nhận ưu đãi')}</h3>
                            </div>
                            <button className={styles.chatCloseBtn} onClick={() => setShowLogin(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '16px' }}>{t('Vui lòng nhập số điện thoại để nhà hàng lưu thói quen ăn uống của bạn nhé.')}</p>
                            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <input
                                    type="tel"
                                    placeholder={t("Nhập số điện thoại...")}
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem' }}
                                    autoFocus
                                />
                                <button type="submit" disabled={!phone.trim()} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: phone.trim() ? '#F59E0B' : '#E2E8F0', color: phone.trim() ? '#fff' : '#94A3B8', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                    {t('Xác nhận')}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
