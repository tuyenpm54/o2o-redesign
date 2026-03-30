"use client";

import React from "react";
import { Sparkles, ArrowRight, Settings, ChefHat, ShoppingBag, Send, ChevronLeft, ChevronRight, Users, Heart, UsersRound, Star, Plus } from "lucide-react";
import oldStyles from "../page.module.css";
import v2Styles from "./MenuWizardV2.module.css";
import { useLanguage } from "@/context/LanguageContext";

interface MenuWizardProps {
    isOpen: boolean;
    onClose: () => void;
    surveyConfig?: any;
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

export function MenuWizardV2({
    isOpen,
    onClose,
    surveyConfig,
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
}: MenuWizardProps) {
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

    const CRAVING_OPTIONS_DEFAULT = [
        { id: 'craving_grill', label: t('Nướng / BBQ'), tags: ['Đậm đà'] },
        { id: 'craving_hotpot', label: t('Lẩu / Canh nóng'), tags: ['Hải sản'] },
        { id: 'craving_light', label: t('Thanh đạm'), tags: ['Thanh đạm', 'Healthy', 'Ít cay'] },
    ];
    const CRAVING_OPTIONS: { id: string; label: string; tags: string[] }[] = surveyConfig?.cravings
        ? surveyConfig.cravings.map((c: any) => ({ ...c, tags: typeof c.tags === 'string' ? c.tags.split(',').map((t: string) => t.trim()) : c.tags }))
        : CRAVING_OPTIONS_DEFAULT;

    const GROUP_OPTIONS_DEFAULT = [
        { id: "Nhóm 2", label: t("Hẹn hò"), sub: t("1-2 người"), icon: <Heart size={20} /> },
        { id: "Nhóm 4-6", label: t("Gia đình"), sub: t("Có trẻ em"), icon: <Users size={20} /> },
        { id: "Nhóm bạn", label: t("Bạn bè"), sub: t("3-6 người"), icon: <UsersRound size={20} /> },
        { id: "Nhóm 8-10", label: t("Tiệc lớn"), sub: t("7+ người"), icon: <Star size={20} /> },
    ];
    const ICON_MAP = [<Heart size={20} />, <Users size={20} />, <UsersRound size={20} />, <Star size={20} />];
    const GROUP_OPTIONS: { id: string; label: string; sub: string; icon: React.ReactNode }[] = surveyConfig?.groups
        ? surveyConfig.groups.map((g: any, i: number) => ({ ...g, icon: ICON_MAP[i % ICON_MAP.length] }))
        : GROUP_OPTIONS_DEFAULT;

    return (
        <div className={v2Styles.cinematicOverlay}>
            <div className={v2Styles.videoContainer}>
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className={v2Styles.bgVideo}
                    poster="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000"
                >
                    <source
                        src="https://videos.pexels.com/video-files/3196236/3196236-uhd_2560_1440_25fps.mp4"
                        type="video/mp4"
                    />
                </video>
                <div className={v2Styles.videoOverlay}></div>
            </div>
            
            <div className={v2Styles.globalTopBar}>
                <button className={v2Styles.cinematicSkip} onClick={onClose}>
                    {t('Bỏ qua')}
                </button>
            </div>

            <div className={v2Styles.bottomSheetContainer}>
                <div className={v2Styles.bottomSheet} style={{ minHeight: onboardingStep === 0 ? 'auto' : '85vh' }}>
                    {onboardingStep === 0 ? (
                        <>
                            <div className={v2Styles.scrollableContent}>
                                <div className={v2Styles.headerText}>
                                    <div className={`${v2Styles.greeting} ${v2Styles.stagger1}`}>
                                        <Sparkles size={14} fill="#FBBF24" />
                                        <span>{t('Mời bạn chọn')}</span>
                                    </div>
                                    <h1 className={`${v2Styles.mainTitle} ${v2Styles.stagger1}`}>
                                        {t('Hôm nay bạn muốn ăn thế nào?')}
                                    </h1>
                                </div>

                                {/* Primary Question: Bento Grid */}
                                <div className={`${v2Styles.sectionContainer} ${v2Styles.stagger2}`}>
                                    <h3 className={v2Styles.sectionHeader}>{t('Đi cùng ai?')} <span>({t('Bắt buộc')})</span></h3>
                                    <div className={v2Styles.bentoGrid}>
                                        {GROUP_OPTIONS.map((o) => (
                                            <button
                                                key={o.id}
                                                className={`${v2Styles.bentoCard} ${form.groupSize === o.id ? v2Styles.active : ""}`}
                                                onClick={() => setForm({ ...form, groupSize: o.id })}
                                            >
                                                <div className={v2Styles.bentoIconWrap}>
                                                    {o.icon}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                                    <span className={v2Styles.bentoLabel}>{o.label}</span>
                                                    <span className={v2Styles.bentoSub}>{o.sub}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Secondary Multi-Select: Cloud Tags */}
                                <div className={`${v2Styles.sectionContainer} ${v2Styles.stagger3}`}>
                                    <h3 className={v2Styles.sectionHeader}>{t('Sở thích & Yêu cầu')} <span>({t('Nhiều tuỳ chọn')})</span></h3>
                                    <div className={v2Styles.tagCloud}>
                                        {CRAVING_OPTIONS.map((c) => (
                                            <button
                                                key={c.id}
                                                className={`${v2Styles.cloudPill} ${form.cravingMood === c.id ? v2Styles.active : ''}`}
                                                onClick={() => setForm({ ...form, cravingMood: form.cravingMood === c.id ? '' : c.id })}
                                            >
                                                {form.cravingMood === c.id ? '✓ ' : ''}{c.label}
                                            </button>
                                        ))}
                                        {preferencesList.filter(p => !p.id.toLowerCase().includes('kids')).map((p) => (
                                            <button
                                                key={p.id}
                                                className={`${v2Styles.cloudPill} ${form.preferences.includes(p.id) ? v2Styles.active : ""}`}
                                                onClick={() => togglePreference(p.id)}
                                            >
                                                {form.preferences.includes(p.id) ? '✓ ' : ''}{p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className={v2Styles.fixedBottomBtnWrap}>
                                <button
                                    className={v2Styles.mainActionBtn}
                                    onClick={handleStartOnboarding}
                                    disabled={!form.groupSize}
                                >
                                    <span>{t('Khám phá ngay')}</span>
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div className={v2Styles.v3ScrollBox}>
                                {/* Screen 2 Minimal Ribbon Header */}
                                {onboardingStep <= categories.length && (
                                    <div className={v2Styles.contextRibbon}>
                                        <span className={v2Styles.contextRibbonLabel}>{t('Dành riêng cho:')}</span>
                                        <span className={v2Styles.contextRibbonPill}>
                                            <Users size={12} style={{ display: 'inline', marginRight: 4 }} /> 
                                            {form.groupSize}
                                        </span>
                                        {form.preferences.map((p: string) => (
                                            <span key={p} className={v2Styles.contextRibbonPill}>
                                                {preferencesList.find((x) => x.id === p)?.label} 
                                            </span>
                                        ))}
                                        <button style={{background:'white', color:'black', border:'none', borderRadius:'50%', width:24, height:24, display:'flex', alignItems:'center', justifyContent:'center', marginLeft:'auto'}} onClick={() => setOnboardingStep(0)}>
                                            <Settings size={14} />
                                        </button>
                                    </div>
                                )}
                                {onboardingStep <= categories.length ? (
                                    (() => {
                                        // V4 COURSE-BASED CONCIERGE LOGIC
                                        // We map over sequential categories to maintain logical meal flow
                                        return (
                                            <div className={v2Styles.courseFeedContainer}>
                                                {categories.map((catName) => {
                                                    // Filter items by category and score them
                                                    let catItems = menuItems.filter((i: any) => i.category === catName).map((item: any) => {
                                                        let score = 0;
                                                        if (form.groupSize && item.tags?.some((t: string) => t.includes(form.groupSize))) score += 10;
                                                        if (form.preferences.includes("kids") && item.kidsFriendly) score += 2;
                                                        if (form.preferences.includes("noOnion") && item.onionFree) score += 1;
                                                        if (form.preferences.includes("healthy") && item.tags?.includes("Thanh đạm")) score += 1;
                                                        if (form.preferences.includes("noSeafood") && item.seafood) score -= 100;
                                                        if (form.cravingMood) {
                                                            const cravingOpt = CRAVING_OPTIONS.find(c => c.id === form.cravingMood);
                                                            if (cravingOpt && item.tags?.some((t: string) => cravingOpt.tags.includes(t))) score += 5;
                                                        }
                                                        return { ...item, matchScore: score };
                                                    }).filter((item: any) => item.matchScore > -50).sort((a: any, b: any) => b.matchScore - a.matchScore);

                                                    if (catItems.length === 0) return null;

                                                    const primaryItem = catItems[0];
                                                    const altItems = catItems.slice(1, 6);

                                                    return (
                                                        <div key={catName} className={v2Styles.courseSection}>
                                                            <div className={v2Styles.courseHeader}>
                                                                <div className={v2Styles.courseHeaderDot} />
                                                                <h3 className={v2Styles.courseTitle}>{catName}</h3>
                                                            </div>
                                                            
                                                            {/* Primary Category Recommendation (16:9) */}
                                                            <div className={v2Styles.primaryCourseCard} onClick={() => openDetails(primaryItem)}>
                                                                <img src={primaryItem.img} className={v2Styles.magazineCardImg} alt={primaryItem.name} />
                                                                <div className={v2Styles.magazineCardOverlay} />
                                                                <div className={v2Styles.magazineCardContent}>
                                                                    <h4 className={v2Styles.magazineCardTitle}>{primaryItem.name}</h4>
                                                                    <p className={v2Styles.magazineCardDesc}>{primaryItem.desc}</p>
                                                                    <div className={v2Styles.magazineCardFooter}>
                                                                        <span className={v2Styles.magazineCardPrice}>{primaryItem.price.toLocaleString("vi-VN")}đ</span>
                                                                        {getItemQuantity(primaryItem.id) > 0 ? (
                                                                            <div className={v2Styles.magazineQtySelector} onClick={e => e.stopPropagation()}>
                                                                                <button className={v2Styles.magazineQtyBtn} onClick={() => removeFromTotal(primaryItem)}>-</button>
                                                                                <span className={v2Styles.magazineQtyValue}>{getItemQuantity(primaryItem.id)}</span>
                                                                                <button className={v2Styles.magazineQtyBtn} onClick={() => addToTotal(primaryItem)}>+</button>
                                                                            </div>
                                                                        ) : (
                                                                            <button className={v2Styles.liquidAddBtn} onClick={(e) => { e.stopPropagation(); addToTotal(primaryItem); }}>
                                                                                <Plus size={20} strokeWidth={3} />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Alternatives / Secondary Options Row */}
                                                            {altItems.length > 0 && (
                                                                <div className={v2Styles.alternativesRow}>
                                                                    {altItems.map((alt: any) => (
                                                                        <div key={alt.id} className={v2Styles.altCard} onClick={() => openDetails(alt)}>
                                                                            <div className={v2Styles.altCardThumbBox}>
                                                                                <img src={alt.img} className={v2Styles.altCardImg} alt={alt.name} />
                                                                                {alt.tags?.[0] && <span className={v2Styles.altBadge}>{alt.tags[0]}</span>}
                                                                            </div>
                                                                            <div className={v2Styles.altCardInfo}>
                                                                                <h5 className={v2Styles.altCardTitle}>{alt.name}</h5>
                                                                                <div className={v2Styles.altCardPriceRow}>
                                                                                    <span className={v2Styles.altCardPrice}>{alt.price.toLocaleString("vi-VN")}đ</span>
                                                                                    {getItemQuantity(alt.id) > 0 ? (
                                                                                        <span style={{color: 'white', fontSize: 12, fontWeight: 700}}>x{getItemQuantity(alt.id)}</span>
                                                                                    ) : (
                                                                                        <button className={v2Styles.liquidAddBtnSmall} onClick={(e) => { e.stopPropagation(); addToTotal(alt); }}>
                                                                                            <Plus size={14} strokeWidth={3} />
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                                {/* Pad the bottom for nav */}
                                                <div style={{height: 100}}></div>
                                            </div>
                                        );
                                    })()
                                ) : (
                                    <div className={v2Styles.glassCartSection}>
                                        <h2 className={v2Styles.magazineSectionTitle} style={{margin: '0 0 20px 0'}}>{t('Giỏ hàng của bạn')}</h2>
                                        {cartItems.length === 0 ? (
                                            <div className={v2Styles.glassEmptyCart}>
                                                <ShoppingBag size={48} opacity={0.3} color="white" />
                                                <p>{t('Giỏ hàng đang trống')}</p>
                                            </div>
                                        ) : (
                                            <div className={v2Styles.glassCartList}>
                                                {cartItems.map((entry) => (
                                                    <div key={entry.item.id} className={v2Styles.glassCartRow}>
                                                        <div className={v2Styles.glassCartThumb}><img src={entry.item.img} alt={entry.item.name} /></div>
                                                        <div className={v2Styles.glassCartMeta}>
                                                            <h4>{entry.item.name}</h4>
                                                            <p>{entry.item.price.toLocaleString("vi-VN")}đ</p>
                                                        </div>
                                                        <div className={v2Styles.glassCartQty}><span>x{entry.quantity}</span></div>
                                                    </div>
                                                ))}
                                                <div className={v2Styles.glassCartTotal}>
                                                    <span>{t('Tổng cộng')}</span>
                                                    <span className={v2Styles.glassCartTotalPrice}>{total.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Floating Nav using old styles mapping */}
                            <div className={v2Styles.floatingNav}>
                                <div style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderRadius: '99px', padding: '8px 8px 8px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <button
                                        onClick={() => setOnboardingStep((prev) => Math.max(0, prev > categories.length ? categories.length : 0))}
                                        style={{ opacity: onboardingStep > 0 ? 1 : 0, pointerEvents: onboardingStep > 0 ? 'auto' : 'none', background: 'transparent', color: 'white', border: 'none', display: 'flex', alignItems: 'center', padding: 0 }}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <button
                                        className={`${cartPulse ? oldStyles.shaking : ""}`}
                                        onClick={() => {
                                            if (onboardingStep > categories.length) handleNextOnboarding(); // actually handles order
                                            else setOnboardingStep(categories.length + 1); // jump straight to cart
                                        }}
                                        style={{ background: '#DF1B41', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '48px', borderRadius: '99px', border: 'none', color: 'white', fontWeight: 700, fontSize: '1.05rem', position: 'relative' }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {onboardingStep > categories.length ? <Send size={20} /> : <ShoppingBag size={20} />}
                                            <span>
                                                {onboardingStep <= categories.length ? t('Xem Giỏ hàng') : t('Gửi yêu cầu')}
                                            </span>
                                        </div>
                                        {total > 0 && onboardingStep <= categories.length && (
                                            <span style={{ position: 'absolute', top: '0px', right: '0px', background: 'white', color: '#DF1B41', fontSize: '0.75rem', fontWeight: 800, minWidth: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transform: 'translate(-8px, -4px)', border: '2px solid #DF1B41' }}>
                                                {cartItems.reduce((acc, curr) => acc + curr.quantity, 0)}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
