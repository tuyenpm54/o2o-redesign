import React, { useState, useEffect } from "react";
import { X, Star, Plus, Minus, Sparkles, Check } from "lucide-react";
import styles from "../page.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { useMenuContext } from "../hooks/useMenuContext";

interface ItemDetailModalProps {
    item: any;
    currentQty: number;
    initialSelections?: {
        size: string;
        toppings: string[];
        note: string;
    };
    onClose: () => void;
    onUpdateCart: (item: any, quantity: number, selections: any) => void;
    getItemQuantity: (id: number) => number;
}

export function ItemDetailModal({ item, currentQty, initialSelections, onClose, onUpdateCart, getItemQuantity }: ItemDetailModalProps) {
    const { t, language } = useLanguage();
    const { timeOfDay, theme } = useMenuContext();

    const [detailQty, setDetailQty] = useState(Number(currentQty) || 1);
    const [size, setSize] = useState(initialSelections?.size || "M");
    const [toppings, setToppings] = useState<string[]>(initialSelections?.toppings || []);
    const [note, setNote] = useState(initialSelections?.note || "");

    useEffect(() => {
        if (item) {
            const finalQty = Number(currentQty) > 0 ? Number(currentQty) : 1;
            setDetailQty(finalQty);
            setSize(initialSelections?.size || "M");
            setToppings(initialSelections?.toppings || []);
            setNote(initialSelections?.note || "");
        }
    }, [item, currentQty, initialSelections]);

    if (!item) return null;

    const handleToppingToggle = (topping: string) => {
        setToppings(prev =>
            prev.includes(topping)
                ? prev.filter(t => t !== topping)
                : [...prev, topping]
        );
    };

    const isEditMode = Number(currentQty) > 0;

    // ── Theme-derived tokens ──────────────────────────────────
    const isDark = timeOfDay === 'evening';

    // Card surface
    const cardBg = theme.cardBg;
    const surfaceBg = isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.6)';
    
    // Gradient that merges hero image into content
    const heroGradientColor = isDark ? '#0F172A' : theme.bg;

    // Text
    const textPrimary = theme.textPrimary;
    const textSecondary = theme.textSecondary;
    const textMuted = isDark ? 'rgba(148, 163, 184, 0.6)' : 'rgba(100, 116, 139, 0.6)';

    // Interactive surfaces
    const interactiveBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
    const interactiveBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const interactiveHoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';

    // Accent
    const accent = theme.accent;
    const accentLight = theme.accentLight;

    // Footer
    const footerBg = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.92)';

    // Close button  
    const closeBg = isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.3)';

    const toppingList = [
        "Thêm phô mai (+15k)",
        "Thêm trứng (+10k)",
        "Xốt đậm đà",
    ];

    return (
        <div className={styles.detailOverlay}>
            <div 
                className={styles.detailCard} 
                style={{ 
                    background: cardBg, 
                    color: textPrimary,
                    borderColor: interactiveBorder,
                }}
            >
                {/* Close Button — Glassmorphism circle on hero */}
                <button 
                    className={styles.closeDetailBtn} 
                    onClick={onClose} 
                    style={{ background: closeBg, borderColor: 'rgba(255,255,255,0.15)' }}
                >
                    <X size={18} color="#fff" strokeWidth={2.5} />
                </button>

                <div className={styles.detailScrollBody}>
                    
                    {/* ── 🔴 CRITICAL: Hero Image (40% viewport) ────── */}
                    <div className={styles.detailHero}>
                        <img
                            src={item.img}
                            alt={item.name}
                            onError={(e) => { e.currentTarget.src = '/food/default-food.jpg'; }}
                        />
                        <div 
                            className={styles.heroGradient} 
                            style={{ 
                                background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 30%, transparent 50%, ${heroGradientColor} 100%)` 
                            }} 
                        />
                    </div>

                    {/* ── Content Area ────── */}
                    <div 
                        className={styles.detailContent} 
                        style={{ 
                            background: cardBg, 
                            boxShadow: 'none',
                        }}
                    >
                        {/* ── 🟡 IMPORTANT: Item Info ────── */}
                        <div className={styles.detailHeader}>
                            
                            {/* 🔵 Supportive: Perfect Match Badge — inline prefix */}
                            {item.matchScore > 10 && (
                                <div style={{ 
                                    display: 'flex', alignItems: 'center', gap: '5px', 
                                    color: accent, fontSize: '0.75rem', fontWeight: 700, 
                                    marginBottom: '8px', letterSpacing: '0.02em'
                                }}>
                                    <Sparkles size={13} fill={accent} />
                                    <span>{t('Lựa chọn hoàn hảo')}</span>
                                </div>
                            )}

                            {/* Item Name (H1 level — text-xl, bold) */}
                            <h2 style={{ 
                                color: textPrimary, fontSize: '1.5rem', fontWeight: 800, 
                                lineHeight: 1.15, letterSpacing: '-0.02em', margin: '0 0 8px 0' 
                            }}>
                                {item.name}
                            </h2>

                            {/* Description (Body level) + Rating inline */}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
                                <p style={{ 
                                    color: textSecondary, fontSize: '0.875rem', lineHeight: 1.5, 
                                    margin: 0, flex: 1 
                                }}>
                                    {item.desc}
                                </p>
                                {/* 🔵 Supportive: Rating — caption level */}
                                <div style={{ 
                                    display: 'flex', alignItems: 'center', gap: '3px', 
                                    flexShrink: 0, fontSize: '0.8rem', color: textMuted 
                                }}>
                                    <Star size={12} fill="#f59e0b" stroke="none" />
                                    <span style={{ fontWeight: 700, color: textSecondary }}>4.8</span>
                                    <span>(128)</span>
                                </div>
                            </div>

                            {/* Tags — colorful semantic pills */}
                            {item.tags && item.tags.length > 0 && (
                                <div style={{ 
                                    display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px'
                                }}>
                                    {item.tags.map((tag: string, i: number) => {
                                        const tagColors = isDark ? [
                                            { bg: 'rgba(148, 163, 184, 0.15)', text: '#CBD5E1' }, // Slate
                                            { bg: 'rgba(56, 189, 248, 0.15)', text: '#7DD3FC' }, // Sky Blue
                                            { bg: 'rgba(52, 211, 153, 0.15)', text: '#6EE7B7' }, // Emerald
                                            { bg: 'rgba(251, 191, 36, 0.15)', text: '#FCD34D' }, // Amber
                                            { bg: 'rgba(129, 140, 248, 0.15)', text: '#A5B4FC' }, // Indigo
                                        ] : [
                                            { bg: '#F1F5F9', text: '#475569' }, // Slate
                                            { bg: '#E0F2FE', text: '#0284C7' }, // Sky Blue
                                            { bg: '#D1FAE5', text: '#059669' }, // Emerald
                                            { bg: '#FEF3C7', text: '#D97706' }, // Amber
                                            { bg: '#EEF2FF', text: '#4F46E5' }, // Indigo
                                        ];
                                        const color = tagColors[i % tagColors.length];
                                        return (
                                            <span key={tag} style={{
                                                fontSize: '0.7rem', fontWeight: 600,
                                                background: color.bg, color: color.text,
                                                padding: '3px 10px', borderRadius: '8px',
                                                letterSpacing: '0.02em',
                                            }}>
                                                {tag}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div style={{ 
                            height: '1px', 
                            background: interactiveBorder, 
                            margin: '20px 0' 
                        }} />

                        {/* ── 🟡 IMPORTANT: Size Selector (Required) ────── */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '8px', 
                                marginBottom: '12px' 
                            }}>
                                <span style={{ 
                                    fontSize: '0.8rem', fontWeight: 700, color: textPrimary, 
                                    textTransform: 'uppercase', letterSpacing: '0.08em' 
                                }}>
                                    {t('Lựa chọn kích cỡ')}
                                </span>
                                <span style={{ 
                                    fontSize: '0.6rem', fontWeight: 700, color: accent,
                                    background: accentLight, borderRadius: '4px', 
                                    padding: '2px 6px', textTransform: 'uppercase' 
                                }}>
                                    {t('Bắt buộc')}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {["S", "M", "L"].map((s) => (
                                    <button 
                                        key={s}
                                        onClick={() => setSize(s)} 
                                        style={{
                                            flex: 1,
                                            height: '48px',
                                            borderRadius: '14px',
                                            border: size === s ? `2px solid ${accent}` : `1.5px solid ${interactiveBorder}`,
                                            background: size === s ? accentLight : interactiveBg,
                                            color: size === s ? accent : textSecondary,
                                            fontSize: '0.95rem',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            transform: size === s ? 'translateY(-1px)' : 'none',
                                            boxShadow: size === s ? `0 4px 12px ${accentLight}` : 'none',
                                        }}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Topping Section (Always visible) ────── */}
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ 
                                fontSize: '0.8rem', fontWeight: 700, color: textPrimary, 
                                textTransform: 'uppercase', letterSpacing: '0.08em',
                                display: 'block', marginBottom: '12px',
                            }}>
                                {t('Thêm Topping')}
                            </span>
                            <div style={{ 
                                display: 'flex', flexDirection: 'column', gap: '2px',
                            }}>
                                {toppingList.map((topName) => (
                                    <label 
                                        key={topName} 
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '12px 4px', cursor: 'pointer',
                                            borderRadius: '10px',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={toppings.includes(topName)}
                                            onChange={() => handleToppingToggle(topName)}
                                            style={{ display: 'none' }}
                                        />
                                        <div style={{
                                            width: '22px', height: '22px', borderRadius: '6px',
                                            border: toppings.includes(topName) ? 'none' : `2px solid ${interactiveBorder}`,
                                            background: toppings.includes(topName) ? accent : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.2s ease', flexShrink: 0,
                                        }}>
                                            {toppings.includes(topName) && (
                                                <Check size={14} strokeWidth={3} color={theme.cartBarText} />
                                            )}
                                        </div>
                                        <span style={{ 
                                            fontSize: '0.875rem', fontWeight: 500, 
                                            color: toppings.includes(topName) ? textPrimary : textSecondary 
                                        }}>
                                            {topName}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: interactiveBorder, margin: '0 0 20px 0' }} />

                        {/* ── Kitchen Note Section (Always visible) ────── */}
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ 
                                fontSize: '0.8rem', fontWeight: 700, color: textPrimary, 
                                textTransform: 'uppercase', letterSpacing: '0.08em',
                                display: 'block', marginBottom: '12px',
                            }}>
                                {t('Ghi chú cho bếp')}
                            </span>
                            <textarea
                                style={{ 
                                    width: '100%', minHeight: '80px', resize: 'none',
                                    background: interactiveBg, border: `1.5px solid ${interactiveBorder}`,
                                    borderRadius: '12px', padding: '12px 14px',
                                    color: textPrimary, fontSize: '0.875rem',
                                    outline: 'none', transition: 'border-color 0.2s',
                                }}
                                placeholder={t("Ví dụ: Ít cay, không hành...")}
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                onFocus={(e) => { e.target.style.borderColor = accent; }}
                                onBlur={(e) => { e.target.style.borderColor = interactiveBorder; }}
                            />
                        </div>

                        <div className={styles.detailScrollSpacer}></div>
                    </div>
                </div>

                {/* ── 🔴 CRITICAL: Footer CTA (Sticky Bottom) ────── */}
                <div 
                    className={styles.detailFooter} 
                    style={{ 
                        background: footerBg, 
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderTop: `1px solid ${interactiveBorder}`,
                    }}
                >
                    {/* Quantity Selector — compact */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: interactiveBg, border: `1.5px solid ${interactiveBorder}`,
                        borderRadius: '14px', padding: '0 14px', height: '48px',
                    }}>
                        <button 
                            onClick={() => setDetailQty(prev => Math.max(0, prev - 1))}
                            style={{ 
                                background: 'none', border: 'none', cursor: 'pointer', 
                                color: textPrimary, display: 'flex', padding: '4px',
                            }}
                        >
                            <Minus size={18} strokeWidth={2.5} />
                        </button>
                        <span style={{ 
                            fontSize: '1rem', fontWeight: 800, color: textPrimary, 
                            minWidth: '20px', textAlign: 'center' 
                        }}>
                            {detailQty}
                        </span>
                        <button 
                            onClick={() => setDetailQty(prev => prev + 1)}
                            style={{ 
                                background: 'none', border: 'none', cursor: 'pointer', 
                                color: textPrimary, display: 'flex', padding: '4px',
                            }}
                        >
                            <Plus size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Primary CTA — Full accent, single primary action */}
                    <button
                        onClick={() => onUpdateCart(item, detailQty, { size, toppings, note })}
                        style={{
                            flex: 1, height: '48px', borderRadius: '14px',
                            background: theme.cartBarBg, color: theme.cartBarText,
                            border: 'none', cursor: 'pointer',
                            fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.01em',
                            transition: 'all 0.2s ease',
                            boxShadow: `0 4px 16px ${accentLight}`,
                        }}
                    >
                        {detailQty === 0
                            ? t("Xoá")
                            : (isEditMode ? t("Cập nhật") : t("Thêm vào giỏ"))
                        } — {(item.price * detailQty).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ
                    </button>
                </div>
            </div>
        </div>
    );
}
