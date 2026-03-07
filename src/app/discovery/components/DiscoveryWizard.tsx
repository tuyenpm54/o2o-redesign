"use client";

import React from "react";
import { Sparkles, ArrowRight, Settings, ChefHat, ShoppingBag, Send, ChevronLeft, ChevronRight } from "lucide-react";
import styles from "../page.module.css";
import { useLanguage } from "@/context/LanguageContext";

interface DiscoveryWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onboardingStep: number;
    setOnboardingStep: (step: number | ((prev: number) => number)) => void;
    isLoggedIn: boolean;
    user: any;
    preferencesList: any[];
    form: any;
    setForm: (form: any) => void;
    menuItems: any[];
    categories: string[];
    total: number;
    cartItems: any[];
    handlePlaceOrder: () => void;
    handleStartOnboarding: () => void;
    handleNextOnboarding: () => void;
    openDetails: (item: any) => void;
    getItemQuantity: (id: number) => number;
    addToTotal: (item: any) => void;
    removeFromTotal: (item: any) => void;
    cartPulse: boolean;
}

export function DiscoveryWizard({
    isOpen,
    onClose,
    onboardingStep,
    setOnboardingStep,
    isLoggedIn,
    user,
    preferencesList,
    form,
    setForm,
    menuItems,
    categories,
    total,
    cartItems,
    handlePlaceOrder,
    handleStartOnboarding,
    handleNextOnboarding,
    openDetails,
    getItemQuantity,
    addToTotal,
    removeFromTotal,
    cartPulse
}: DiscoveryWizardProps) {
    const { t, language } = useLanguage();

    if (!isOpen) return null;

    const togglePreference = (id: string) => {
        setForm((prev: any) => ({
            ...prev,
            preferences: prev.preferences.includes(id)
                ? prev.preferences.filter((p: any) => p !== id)
                : [...prev.preferences, id],
        }));
    };

    return (
        <div className={styles.cinematicOverlay}>
            <div className={styles.videoContainer}>
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={styles.bgVideo}
                    poster="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000"
                >
                    <source
                        src="https://videos.pexels.com/video-files/3196236/3196236-uhd_2560_1440_25fps.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className={styles.videoOverlay}></div>
            </div>
            <div className={styles.globalTopBar}>
                <button className={styles.cinematicSkip} onClick={onClose}>
                    {t('Bỏ qua')}
                </button>
            </div>

            <div className={styles.bottomSheetContainer}>
                <div className={styles.bottomSheet}>
                    {onboardingStep === 0 && isLoggedIn && user && user.preferences && user.preferences.length > 0 && form.preferences.length === 0 && !form.groupSize ? (
                        <>
                            <div className={styles.sheetHeader} style={{ marginTop: '32px', marginBottom: '20px' }}>
                                <div className={styles.expertBadge} style={{ marginBottom: '10px', display: 'inline-flex', alignSelf: 'flex-start' }}>
                                    <Sparkles size={12} fill="currentColor" />
                                    <span>{t('XIN CHÀO')} {user.name?.toUpperCase()}</span>
                                </div>
                                <h1 className={styles.cinematicTitle} style={{ fontSize: '1.45rem', lineHeight: '1.3', marginBottom: '16px' }}>
                                    {t('Rất vui thấy bạn quay trở lại! 👋')}
                                </h1>
                                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', marginBottom: '16px', fontWeight: 500 }}>
                                    {t('Bạn vẫn giữ lựa chọn như lần trước chứ?')}
                                </p>
                                {/* Preference tags */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                                    {user.preferences?.map((p: string) => {
                                        const pref = preferencesList.find(xi => xi.id === p);
                                        if (!pref) return null;
                                        return (
                                            <span key={p} style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                background: 'rgba(245, 158, 11, 0.18)',
                                                border: '1.5px solid rgba(245, 158, 11, 0.5)',
                                                color: '#FDE68A', borderRadius: '100px',
                                                padding: '6px 14px', fontSize: '13px', fontWeight: 700,
                                            }}>
                                                ✓ {pref.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '0 20px' }}>
                                <button
                                    className={styles.cinematicActionBtn}
                                    onClick={() => {
                                        setForm({ groupSize: "Nhóm 2", preferences: user.preferences || [] });
                                        handleStartOnboarding();
                                    }}
                                    style={{ width: '100%', padding: '16px' }}
                                >
                                    <Sparkles size={20} />
                                    <span>{t('Ok, gợi ý ngay')}</span>
                                </button>
                                <button
                                    className={styles.cinematicActionBtn}
                                    onClick={() => setForm({ groupSize: "", preferences: [] })}
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        color: 'rgba(255,255,255,0.6)',
                                        boxShadow: 'none'
                                    }}
                                >
                                    <span>{t('Không, để tôi chọn lại')}</span>
                                </button>
                            </div>
                        </>
                    ) : onboardingStep === 0 ? (
                        <>
                            <div className={styles.sheetHeader} style={{ marginTop: '60px' }}>
                                <h1 className={styles.cinematicTitle} dangerouslySetInnerHTML={{ __html: t('Hôm nay mình đi mấy người?') }}></h1>
                                <p className={styles.cinematicSubtitle}>{t('Để chúng tôi chuẩn bị bàn chu đáo nhất')}</p>
                            </div>
                            <div className={styles.cinematicOptionsScroll}>
                                {[
                                    { id: "Nhóm 2", label: "1-2", sub: t("Hẹn hò") },
                                    { id: "Nhóm 4-6", label: "4-6", sub: t("Gia đình") },
                                    { id: "Nhóm 8-10", label: "8+", sub: t("Tiệc tùng") },
                                ].map((o) => (
                                    <button
                                        key={o.id}
                                        className={`${styles.cinematicCard} ${form.groupSize === o.id ? styles.active : ""}`}
                                        onClick={() => setForm({ ...form, groupSize: o.id })}
                                    >
                                        <div className={styles.cardInfo}>
                                            <span className={styles.cardMain}>{o.label}</span>
                                            <span className={styles.cardSub}>{o.sub}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className={styles.cinematicPrefs}>
                                <span className={styles.prefLabel}>{t('Lưu ý:')}</span>
                                {preferencesList.map((p) => (
                                    <button
                                        key={p.id}
                                        className={`${styles.cinematicChip} ${form.preferences.includes(p.id) ? styles.active : ""}`}
                                        onClick={() => togglePreference(p.id)}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                            <button
                                className={styles.cinematicActionBtn}
                                onClick={handleStartOnboarding}
                                disabled={!form.groupSize}
                            >
                                <span>{t('Khám phá ngay')}</span>
                                <ArrowRight size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className={styles.onboardingScrollBox} style={{ paddingTop: '0px' }}>
                                {onboardingStep <= categories.length ? (
                                    (() => {
                                        const catName = categories[onboardingStep - 1];
                                        let catItems = menuItems.filter((i) => i.category === catName);

                                        let scoredCatItems = catItems.map((item: any) => {
                                            let score = 0;
                                            if (form.groupSize && item.tags.some((t: string) => t.includes(form.groupSize))) score += 10;
                                            if (form.preferences.includes("kids") && item.kidsFriendly) score += 2;
                                            if (form.preferences.includes("noOnion") && item.onionFree) score += 1;
                                            if (form.preferences.includes("healthy") && item.tags.includes("Thanh đạm")) score += 1;
                                            if (form.preferences.includes("noSeafood") && item.seafood) score -= 100;
                                            return { ...item, matchScore: score };
                                        }).filter((item: any) => item.matchScore > -50).sort((a: any, b: any) => b.matchScore - a.matchScore);

                                        if (scoredCatItems.length < 3) {
                                            const existingIds = new Set(scoredCatItems.map(i => i.id));
                                            scoredCatItems.push(...catItems.filter(i => !existingIds.has(i.id)).map(i => ({ ...i, matchScore: 0 })).slice(0, 3 - scoredCatItems.length));
                                        }

                                        return (
                                            <div key={catName} className={styles.categorySection}>
                                                <div className={styles.expertSectionHeader}>
                                                    <div className={styles.expertHero}>
                                                        <div className={styles.expertBadge}>
                                                            <Sparkles size={12} fill="currentColor" />
                                                            <span>{t('Gợi ý thông minh').toUpperCase()}</span>
                                                        </div>
                                                        <h3 className={styles.expertTitle} style={{ color: '#fff' }}>{t('Dành riêng cho bạn')}</h3>
                                                    </div>
                                                    <div className={styles.consultantNote}>
                                                        <button className={styles.noteConfigBtn} onClick={() => setOnboardingStep(0)}>
                                                            <Settings size={16} />
                                                        </button>
                                                        <div className={styles.noteMainContent}>
                                                            <div className={styles.noteHeader}>
                                                                <ChefHat size={14} className={styles.noteIcon} />
                                                                <span className={styles.noteLabel}>{t('DỰA TRÊN YÊU CẦU:')}</span>
                                                            </div>
                                                            <div className={styles.noteTagsWrap}>
                                                                <span className={styles.noteTag}>{form.groupSize}</span>
                                                                {form.preferences.map((p: string) => (
                                                                    <span key={p} className={styles.noteTag}>
                                                                        {preferencesList.find((x) => x.id === p)?.label}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <h2 className={styles.categoryHeaderTitle}>{catName}</h2>
                                                <div className={styles.horizontalScroll}>
                                                    {scoredCatItems.slice(0, 10).map((item) => (
                                                        <div key={item.id} className={styles.slideCard} onClick={() => openDetails(item)}>
                                                            <div className={styles.slideCardHero}>
                                                                <img src={item.img} className={styles.slideCardImg} alt={item.name} />
                                                                {getItemQuantity(item.id) > 0 && <div className={styles.itemQuantityBadge}>{getItemQuantity(item.id)}</div>}
                                                                {item.matchScore > 10 && <div className={styles.slideCardTag}>{t('Tuyệt phẩm')}</div>}
                                                            </div>
                                                            <div className={styles.slideCardBody}>
                                                                <h3 className={styles.slideCardName}>{item.name}</h3>
                                                                <div className={styles.reasonTagsRow}>
                                                                    {item.tags?.slice(0, 2).map((t: string, tidx: number) => {
                                                                        const colors = ["Blue", "Green", "Amber", "Purple", "Rose", "Orange"];
                                                                        return <span key={t} className={`${styles.reasonPill} ${styles[`tag${colors[tidx % colors.length]}`]}`}>{t}</span>;
                                                                    })}
                                                                </div>
                                                                <p className={styles.slideCardDesc}>{item.desc}</p>
                                                                <div className={styles.slideCardFooter}>
                                                                    <span className={styles.slideCardPrice}>{item.price.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                                                                    {getItemQuantity(item.id) > 0 ? (
                                                                        <div className={styles.qtySelectorMini}>
                                                                            <button className={styles.miniQtyBtn} onClick={(e) => { e.stopPropagation(); removeFromTotal(item); }}>-</button>
                                                                            <span className={styles.miniQtyValue}>{getItemQuantity(item.id)}</span>
                                                                            <button className={styles.miniQtyBtn} onClick={(e) => { e.stopPropagation(); addToTotal(item); }}>+</button>
                                                                        </div>
                                                                    ) : (
                                                                        <button className={styles.addBtnSquare} onClick={(e) => { e.stopPropagation(); addToTotal(item); }}>+</button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className={styles.cartReviewSection}>
                                        <h2 className={styles.cartHeaderTitle}>{t('Giỏ hàng của bạn')}</h2>
                                        {cartItems.length === 0 ? (
                                            <div className={styles.emptyCartBox}>
                                                <ShoppingBag size={48} opacity={0.3} />
                                                <p>{t('Giỏ hàng đang trống')}</p>
                                            </div>
                                        ) : (
                                            <div className={styles.cartItemsList}>
                                                {cartItems.map((entry) => (
                                                    <div key={entry.item.id} className={styles.cartItemRow}>
                                                        <div className={styles.cartItemThumb}><img src={entry.item.img} alt={entry.item.name} /></div>
                                                        <div className={styles.cartItemMeta}><h4>{entry.item.name}</h4><p>{entry.item.price.toLocaleString("vi-VN")}đ</p></div>
                                                        <div className={styles.cartItemQty}><span>x{entry.quantity}</span></div>
                                                    </div>
                                                ))}
                                                <div className={styles.cartTotalRow}><span>{t('Tổng cộng')}</span><span className={styles.cartTotalPrice}>{total.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={styles.onboardingNavFooter}>
                                <div className={styles.navThreeCol}>
                                    <button
                                        className={styles.backBtnOnboarding}
                                        onClick={() => setOnboardingStep((prev) => Math.max(0, prev - 1))}
                                        style={{ opacity: onboardingStep > 0 ? 1 : 0, pointerEvents: onboardingStep > 0 ? 'auto' : 'none', minWidth: 'auto', padding: '0 12px' }}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <button
                                        className={`${styles.onboardingCartBtn} ${cartPulse ? styles.shaking : ""} ${onboardingStep === categories.length ? styles.expandedCart : ""} ${onboardingStep > categories.length ? styles.confirmOrderBtn : ""}`}
                                        onClick={() => {
                                            if (onboardingStep >= categories.length + 1) handleNextOnboarding();
                                            else setOnboardingStep(categories.length + 1);
                                        }}
                                    >
                                        <div className={styles.cartIconWrapper}>
                                            {onboardingStep > categories.length ? <Send size={20} /> : <ShoppingBag size={22} />}
                                            {total > 0 && onboardingStep < categories.length + 1 && (
                                                <span className={styles.cartBadgeStatic}>{cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
                                            )}
                                        </div>
                                        {onboardingStep === categories.length && <span className={styles.cartBtnText}>{t('Tới giỏ hàng')}</span>}
                                        {onboardingStep > categories.length && <span className={styles.cartBtnText}>{t('Gửi gọi món')}</span>}
                                    </button>

                                    {onboardingStep < categories.length && (
                                        <button className={styles.cartActionBtn} onClick={handleNextOnboarding}>
                                            <span className={styles.btnNextText}>{categories[onboardingStep].toUpperCase()}</span>
                                            <ChevronRight size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
