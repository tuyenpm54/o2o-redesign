"use client";

import React, { useState } from 'react';
import { MapPin, ChevronDown, User, LogIn, Star, LogOut, Info } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import { shopConfig } from '@/config/shopConfig';

import { useAuth } from '@/context/AuthContext';

interface HeaderProps {
    theme?: 'light' | 'dark' | 'transparent';
}

export const Header: React.FC<HeaderProps> = ({
    theme = 'light'
}) => {
    const { isLoggedIn, user, logout } = useAuth();
    const pathname = usePathname();

    return (
        <div className={`${styles.headerWrapperCompact} ${styles[theme]}`}>
            <header className={styles.headerCompact}>
                <div className={styles.storeInfoCompact}>
                    <div className={styles.titleRow}>
                        <h1 className={styles.storeNameCompact}>{shopConfig.storeInfo.name}</h1>
                        <Info size={16} className={styles.infoIconStore} />
                    </div>
                    <div className={styles.tableBadge}>
                        <span>Bàn A-12</span>
                    </div>
                </div>

                <div className={styles.userStatsCompact}>
                    {isLoggedIn && user ? (
                        <Link href={`/account?from=${pathname}`} className={styles.accountLinkCompact}>
                            <div className={styles.avatarWrapperCompact}>
                                <div className={styles.avatarCircle}>
                                    {user.avatar ? <img src={user.avatar} className={styles.avatarImg} /> : <User size={20} />}
                                </div>
                                {!pathname.includes('guest') && user.tier !== 'Khách' && (
                                    <div className={styles.crownBadge}>
                                        <Star size={8} fill="currentColor" stroke="none" />
                                    </div>
                                )}
                            </div>
                            <div className={styles.userInfoCol}>
                                {user.tier === 'Khách' ? (
                                    <span className={styles.guestLabel}>Guest</span>
                                ) : (
                                    <span className={styles.pointsTextCompact}>
                                        {user.points?.toLocaleString()} P
                                    </span>
                                )}
                            </div>
                        </Link>
                    ) : (
                        <Link href={`/account?from=${pathname}`} className={styles.loginLink}>
                            <div className={styles.loginIconCircle}>
                                <LogIn size={20} />
                            </div>
                            <span className={styles.loginText}>Đăng nhập</span>
                        </Link>
                    )}
                </div>
            </header>
        </div>
    );
};
