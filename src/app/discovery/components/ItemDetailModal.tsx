import React, { useState, useEffect } from "react";
import { X, Star, Plus, Minus, Sparkles, Check } from "lucide-react";
import styles from "../page.module.css";
import { useLanguage } from "@/context/LanguageContext";

interface ItemDetailModalProps {
    item: any;
    currentQty: number;
    onClose: () => void;
    onUpdateCart: (item: any, quantity: number) => void;
    getItemQuantity: (id: number) => number;
}

export function ItemDetailModal({ item, currentQty, onClose, onUpdateCart, getItemQuantity }: ItemDetailModalProps) {
    const [detailQty, setDetailQty] = useState(currentQty);
    const { t, language } = useLanguage();

    if (!item) return null;

    return (
        <div className={styles.detailOverlay}>
            <div className={styles.detailCard}>
                <button className={styles.closeDetailBtn} onClick={onClose}>
                    <X size={20} />
                </button>
                <div className={styles.detailScrollBody}>
                    <div className={styles.detailHero}>
                        <img src={item.img} alt={item.name} />
                        <div className={styles.heroGradient}></div>
                        {item.matchScore > 10 && (
                            <div className={styles.perfectMatchBadge} style={{ top: '24px', left: '24px' }}>
                                <Sparkles size={12} fill="currentColor" />
                                <span>{t('Lựa chọn hoàn hảo')}</span>
                            </div>
                        )}
                    </div>
                    <div className={styles.detailContent}>
                        <div className={styles.detailHeader}>
                            <div className={styles.detailTitleRow}>
                                <h2 className={styles.detailName}>{item.name}</h2>
                                <div className={styles.detailRating}>
                                    <Star size={14} fill="currentColor" stroke="none" />
                                    <span>4.8</span>
                                    <span className={styles.ratingCount}>(128)</span>
                                </div>
                            </div>
                            <p className={styles.detailDescFull}>{item.desc}</p>
                            <div className={styles.detailTags}>
                                {item.status && (
                                    <span className={styles.tagStatus}>
                                        {t(item.status)}
                                    </span>
                                )}
                                {item.tags?.map((t: string, tidx: number) => {
                                    const colors = ["Blue", "Green", "Amber", "Purple", "Rose", "Orange"];
                                    const colorCls = `tag${colors[tidx % colors.length]}Dark`;
                                    return (
                                        <span key={t} className={`${styles.tagSimple} ${styles[colorCls]}`}>
                                            {t}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                        <hr className={styles.divider} />
                        <div className={styles.detailOptions}>
                            <div className={styles.optionGroup}>
                                <h4 className={styles.optionTitle}>
                                    <span>{t('Lựa chọn kích cỡ')}</span>
                                    <span className={styles.requiredBadge}>{t('Bắt buộc')}</span>
                                </h4>
                                <div className={styles.sizeSelector}>
                                    {["S", "M", "L"].map((s) => (
                                        <label key={s} className={styles.sizeRadio}>
                                            <input type="radio" name="size" defaultChecked={s === "M"} />
                                            <span className={styles.sizeLabel}>{s}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.optionGroup}>
                                <h4 className={styles.optionTitle}>{t('Thêm Topping')}</h4>
                                <div className={styles.toppingList}>
                                    {[
                                        "Thêm phô mai (+15k)",
                                        "Thêm trứng (+10k)",
                                        "Xốt đậm đà",
                                    ].map((t) => (
                                        <label key={t} className={styles.toppingCheckbox}>
                                            <input type="checkbox" />
                                            <span className={styles.checkVisual}>
                                                <Check size={14} strokeWidth={3} />
                                            </span>
                                            <span className={styles.toppingText}>{t}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className={styles.optionGroup}>
                                <h4 className={styles.optionTitle}>{t('Ghi chú cho bếp')}</h4>
                                <textarea className={styles.noteInput} placeholder={t("Ví dụ: Ít cay, không hành...")} />
                            </div>
                            <div className={styles.detailScrollSpacer}></div>
                        </div>
                    </div>
                </div>
                <div className={styles.detailFooter}>
                    <div className={styles.quantityControl}>
                        <button className={styles.qtyBtn} onClick={() => setDetailQty(prev => Math.max(0, prev - 1))}>
                            <Minus size={20} strokeWidth={2.5} />
                        </button>
                        <span className={styles.qtyValue}>{detailQty}</span>
                        <button className={styles.qtyBtn} onClick={() => setDetailQty(prev => prev + 1)}>
                            <Plus size={20} strokeWidth={2.5} />
                        </button>
                    </div>
                    <button
                        className={styles.addToCartBtn}
                        onClick={() => {
                            onUpdateCart(item, detailQty);
                        }}
                    >
                        <span className={styles.btnText}>
                            {getItemQuantity(item.id) > 0 ? (detailQty === 0 ? t("Xoá") : t("Cập nhật")) : t("Thêm vào giỏ")} - {(item.price * detailQty).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
