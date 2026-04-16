"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Info, User as UserIcon, X, ChevronDown, Search, CheckCircle2, ShoppingBag, Globe } from "lucide-react";
import styles from "../page.module.css";
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { RestaurantInfoModal } from './RestaurantInfoModal';

interface MenuHeaderProps {
    restaurant: any;
    tableid: string | null;
    categories?: string[];
    activeCategory?: string;
    onCategorySelect?: (cat: string) => void;
    searchQuery?: string;
    onSearchChange?: (val: string) => void;
    isScrolled?: boolean;
    isHidden?: boolean;
    theme?: any;
}

export function MenuHeader({ 
    restaurant, 
    tableid, 
    categories = [], 
    activeCategory = "", 
    onCategorySelect,
    searchQuery = "",
    onSearchChange,
    isScrolled = false,
    isHidden = false,
    theme
}: MenuHeaderProps) {
    const { isLoggedIn, isGuest, user, login } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const [showLogin, setShowLogin] = useState(false);
    const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [showCategoryMenu, setShowCategoryMenu] = useState(false);
    const [showLanguageMenu, setShowLanguageMenu] = useState(false);
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);

    const [isSubBarSearchActive, setIsSubBarSearchActive] = useState(false);

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.trim().length >= 9) {
            setStep('OTP');
        }
    };

    const handleVerifyOtp = (e: React.FormEvent) => {
        e.preventDefault();
        if (otp === '123456') {
            login(phone);
            setShowLogin(false);
            setStep('PHONE');
            setOtp('');
        } else {
            alert(t('OTP không đúng (thử 123456)'));
        }
    };

    return (
        <div className={styles.menuHeaderContainer}>
            {/* 1. Static Store Info (Scrolls away naturally) */}
            <header className={styles.staticStoreInfoComponent}>
                <div className={styles.storeInfoCompact}>
                    <div className={styles.titleRow} onClick={() => setShowInfoModal(true)} style={{ cursor: 'pointer' }}>
                        <h1 className={styles.storeNameCompact}>{restaurant?.name || t("Đang tải...")}</h1>
                        <Info size={16} className={styles.infoIconStore} />
                    </div>
                    
                    <div className={styles.tableTitleRow}>
                        <div className={styles.tableBadge} style={{ color: tableid === 'COUNTER' ? 'transparent' : (theme?.accent || '#ea580c') }}>
                            {tableid === 'COUNTER' ? (
                                <span style={{ 
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    background: theme?.accent || '#ea580c', color: '#fff',
                                    padding: '6px 12px', borderRadius: '100px',
                                    fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.02em',
                                    boxShadow: `0 4px 12px ${theme?.accent || '#ea580c'}40`
                                }}>
                                    <ShoppingBag size={14} strokeWidth={2.5} />
                                    {t('Nhận tại quầy')}
                                </span>
                            ) : (
                                <span>{t('Bàn')} {tableid || restaurant?.table || "--"}</span>
                            )}
                        </div>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <button 
                                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    background: 'rgba(0,0,0,0.05)', border: 'none', borderRadius: '100px',
                                    padding: '6px 10px', fontSize: '0.8rem', fontWeight: 600,
                                    color: 'inherit', cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <Globe size={14} />
                                {language.toUpperCase()}
                                <ChevronDown size={14} style={{ opacity: 0.5, transform: showLanguageMenu ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                            
                            {showLanguageMenu && (
                                <>
                                    <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowLanguageMenu(false)} />
                                    <div style={{
                                        position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 100,
                                        background: theme?.bg || '#ffffff', borderRadius: '16px',
                                        boxShadow: '0 10px 40px rgba(0,0,0,0.12)', border: '1px solid rgba(0,0,0,0.05)',
                                        display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: '160px',
                                        animation: 'fadeIn 0.2s ease-out'
                                    }}>
                                        {[
                                            { code: 'vi', label: 'Tiếng Việt' },
                                            { code: 'en', label: 'English (US)' },
                                            { code: 'ko', label: '한국어 (Korean)' },
                                            { code: 'ja', label: '日本語 (Japanese)' },
                                            { code: 'zh', label: '中文 (Chinese)' },
                                        ].map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setLanguage(lang.code);
                                                    setShowLanguageMenu(false);
                                                }}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px 16px', background: language === lang.code ? 'rgba(0,0,0,0.03)' : 'transparent',
                                                    border: 'none', cursor: 'pointer', textAlign: 'left',
                                                    fontSize: '0.9rem', fontWeight: language === lang.code ? 700 : 500,
                                                    color: language === lang.code ? (theme?.accent || '#ea580c') : 'inherit',
                                                    borderBottom: '1px solid rgba(0,0,0,0.03)', transition: 'background 0.2s'
                                                }}
                                            >
                                                {lang.label}
                                                {language === lang.code && <CheckCircle2 size={16} />}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className={styles.userStatsCompact}>
                    {isLoggedIn && user ? (
                        <button
                            className={styles.profileBadge}
                            onClick={() => {
                                const fullPath = typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : pathname;
                                router.push(`/account?from=${encodeURIComponent(fullPath)}`);
                            }}
                        >
                            <div className={styles.avatarWrapperBadge}>
                                {user.avatar ? (
                                    <img
                                        src={user.avatar}
                                        className={styles.badgeAvatarImg}
                                        alt="Avatar"
                                    />
                                ) : (
                                    <div className={styles.badgeAvatarFallback}>
                                        {user.name?.charAt(0) || 'U'}
                                    </div>
                                )}
                            </div>

                            {user.name && user.name !== 'Khách hàng mới' ? (
                                <span className={styles.profileBadgeName}>
                                    {user.name}
                                </span>
                            ) : null}
                        </button>
                    ) : (
                        <button
                            className={styles.loginLink}
                            onClick={() => {
                                const fullPath = typeof window !== 'undefined' ? (window.location.pathname + window.location.search) : pathname;
                                router.push(`/account?from=${encodeURIComponent(fullPath)}`);
                            }}
                        >
                            <div className={styles.loginIconCircle}>
                                <UserIcon size={20} />
                            </div>
                            <span className={styles.loginText}>{t('Đăng nhập')}</span>
                        </button>
                    )}
                </div>
            </header>

            {/* 2. Fixed Overlay Category Bar (Slides in when scrolled past top) */}
            <div className={`${styles.fixedOverlayCategoryBar} ${isHidden ? styles.overlayHidden : styles.overlayVisible}`}>
                {isSearchActive ? (
                    <div className={styles.searchBarActive}>
                        <Search size={18} className={styles.searchIconInside} />
                        <input 
                            type="text" 
                            className={styles.searchInputCompact}
                            placeholder={t("Tìm món hoặc tag...")}
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            autoFocus
                        />
                        <button className={styles.closeSearchBtn} onClick={() => { setIsSearchActive(false); onSearchChange?.(""); }}>
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <div className={styles.categorySubBarContent}>
                        {!isSubBarSearchActive ? (
                            <>
                                <button 
                                  className={styles.catDropdownTrigger}
                                  onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                                >
                                    <span className={styles.catTriggerLabel}>{activeCategory || t("Tất cả nhóm")}</span>
                                    <ChevronDown size={14} className={`${styles.dropdownChevron} ${showCategoryMenu ? styles.chevronRotated : ''}`} />
                                </button>
                                <button className={styles.subBarSearchBtn} onClick={() => setIsSubBarSearchActive(true)}>
                                    <Search size={20} />
                                </button>
                            </>
                        ) : (
                            <div className={styles.subBarSearchWrapper}>
                                <Search size={18} className={styles.subSearchIcon} />
                                <input 
                                    type="text"
                                    className={styles.subSearchInput}
                                    placeholder={t("Tìm món...")}
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange?.(e.target.value)}
                                    autoFocus
                                />
                                <button className={styles.subSearchClose} onClick={() => { setIsSubBarSearchActive(false); onSearchChange?.(""); }}>
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showCategoryMenu && (
                <>
                    <div className={styles.dropdownBackdrop} onClick={() => setShowCategoryMenu(false)} />
                    <div className={styles.categoryDropdownSheet}>
                        {categories.map(cat => (
                            <button 
                                key={cat}
                                className={`${styles.dropdownItem} ${activeCategory === cat ? styles.itemActive : ''}`}
                                onClick={() => {
                                    onCategorySelect?.(cat);
                                    setShowCategoryMenu(false);
                                }}
                            >
                                <span className={styles.itemLabel}>{cat}</span>
                                {activeCategory === cat && <CheckCircle2 size={16} className={styles.activeCheck} />}
                            </button>
                        ))}
                    </div>
                </>
            )}

            {showLogin && (
                <div className={styles.chatModalOverlay} onClick={() => setShowLogin(false)} style={{ zIndex: 10000 }}>
                    <div className={styles.chatModalContainer} style={{ height: 'auto', bottom: 0, paddingBottom: 24 }} onClick={e => e.stopPropagation()}>
                        <div className={styles.chatHeader}>
                            <div className={styles.chatHeaderTitleGroup}>
                                <h3 className={styles.chatTitle}>{step === 'PHONE' ? t('Đăng nhập để nhận ưu đãi') : t('Nhập mã xác thực')}</h3>
                            </div>
                            <button className={styles.chatCloseBtn} onClick={() => setShowLogin(false)}>
                                <X size={24} />
                            </button>
                        </div>
                        <div style={{ padding: '20px' }}>
                            {step === 'PHONE' ? (
                                <>
                                    <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '16px' }}>{t('Vui lòng nhập số điện thoại để nhà hàng lưu thói quen ăn uống của bạn nhé.')}</p>
                                    <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <input
                                            type="tel"
                                            placeholder={t("Nhập số điện thoại...")}
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem' }}
                                            autoFocus
                                        />
                                        <button type="submit" disabled={phone.trim().length < 9} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: phone.trim().length >= 9 ? '#F59E0B' : '#E2E8F0', color: phone.trim().length >= 9 ? '#fff' : '#94A3B8', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                            {t('Tiếp tục')}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '16px' }}>{t('Mã OTP đã được gửi đến')} {phone}</p>
                                    <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <input
                                            type="text"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            maxLength={6}
                                            style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', outline: 'none', fontSize: '1rem', textAlign: 'center', letterSpacing: '4px' }}
                                            autoFocus
                                        />
                                        <button type="submit" disabled={otp.length < 6} style={{ width: '100%', padding: '14px', borderRadius: '12px', background: otp.length === 6 ? '#F59E0B' : '#E2E8F0', color: otp.length === 6 ? '#fff' : '#94A3B8', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                                            {t('Xác nhận')}
                                        </button>
                                        <button type="button" onClick={() => setStep('PHONE')} style={{ background: 'none', border: 'none', color: '#F59E0B', fontWeight: 500, marginTop: '8px', cursor: 'pointer' }}>
                                            {t('Gửi lại mã')}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <RestaurantInfoModal 
                isOpen={showInfoModal} 
                onClose={() => setShowInfoModal(false)}
                restaurant={restaurant}
                theme={theme}
                t={t}
            />
        </div>
    );
}

