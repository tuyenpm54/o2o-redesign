import React from 'react';
import { Check, Users, Sparkles } from "lucide-react";
import styles from "../page.module.css";

interface MenuCardProps {
    item: any;
    theme: any;
    t: (key: string) => string;
    language: string;
    confirmedQty: number;
    draftingUser: any;
    itemQuantity: number;
    pairingMessage: string;
    onSelect: (item: any) => void;
    onAdd: (item: any) => void;
    onRemove: (item: any) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
    item, theme, t, language, confirmedQty, draftingUser, itemQuantity, pairingMessage, onSelect, onAdd, onRemove
}) => {
    const isConfirmed = confirmedQty > 0;

    return (
        <div className={`${styles.menuCard} ${isConfirmed ? styles.menuCardConfirmed : ""}`} onClick={() => onSelect(item)}>
            <div className={styles.cardHero}>
                <img src={item.img} className={styles.cardImg} alt={item.name} />
                {isConfirmed && (
                    <div className={styles.confirmedBadgeOver}>
                        <Check size={10} /> x{confirmedQty} {t('Đã gọi')}
                    </div>
                )}
                {!isConfirmed && draftingUser && (
                    <div className={styles.draftingBadgeOver}>
                        {draftingUser.avatar ? (
                            <img src={draftingUser.avatar} alt={draftingUser.name} style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: draftingUser.color || '#ccc', objectFit: 'cover' }} />
                        ) : (
                            <Users size={10} />
                        )}
                        <span style={{ maxWidth: '60px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{draftingUser.name}</span> {t('đang chọn')}
                    </div>
                )}
                {itemQuantity > 0 && (
                    <div className={`${styles.itemQuantityBadge} ${isConfirmed ? styles.withConfirmed : ""}`}>
                        {itemQuantity}
                    </div>
                )}
            </div>
            <div className={styles.cardBody}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {pairingMessage && (
                        <div className={styles.pairingBadgeInline}>
                            <Sparkles size={10} fill="#CA8A04" color="#CA8A04" />
                            {pairingMessage}
                        </div>
                    )}
                </div>
                <h4 className={styles.cardName}>{item.name}</h4>
                
                {/* Inline Tags Layout — Soft pastel pills (Ít đường style) */}
                {item.tags && item.tags.length > 0 && (
                    <div className={styles.cardInlineTags} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', marginBottom: '8px' }}>
                        {item.tags.map((tag: string) => {
                            // Subtle text colors — muted tones that hint at category
                            const tagTextColors: Record<string, string> = {
                                'Cơm': '#B45309', 'Phở': '#B45309', 'Bún': '#B45309',
                                'Nhậu': '#C2410C', 'Nướng': '#C2410C', 'Cồn': '#C2410C',
                                'Hải sản': '#0369A1', 'Canh': '#047857', 'Rau': '#047857',
                                'Chay': '#047857', 'Healthy': '#059669', 'Ít đường': '#059669',
                                'Thanh đạm': '#047857',
                                'Tráng miệng': '#9D174D', 'Kem': '#9D174D', 'Chè': '#9D174D',
                                'Ngọt': '#BE185D',
                                'Đồ uống': '#6D28D9', 'Nước': '#6D28D9', 'Giải khát': '#0369A1',
                                'Trà': '#047857', 'Cà phê': '#92400E', 'Coffee': '#92400E',
                                'Beer': '#A16207', 'Bia': '#A16207', 'Craft Beer': '#A16207',
                                'Cocktail': '#7C3AED',
                                'Bán chạy': '#B45309', 'Signature': '#BE185D',
                                'Mới': '#2563EB', 'Cay': '#DC2626',
                                'Hẹn hò': '#BE185D', 'Trẻ em': '#2563EB',
                                'Đặc biệt': '#B45309', 'Cao cấp': '#7C3AED',
                                'Gia đình': '#6D28D9', 'Nhóm': '#6D28D9', 'Tiệc': '#7C3AED',
                                'Béo': '#92400E', 'Thơm': '#C2410C',
                            };
                            const textColor = tagTextColors[tag] || Object.entries(tagTextColors).find(([k]) => tag.toLowerCase().includes(k.toLowerCase()))?.[1] || '#64748B';
                            // Convert hex to transparent background by appending alpha (e.g. Hex + 20 for 12% opacity)
                            const bgColor = `${textColor}1A`; // ~10% opacity 

                            return (
                                <span key={tag} style={{
                                    fontSize: '0.65rem',
                                    fontWeight: 500,
                                    color: textColor,
                                    background: bgColor,
                                    padding: '3px 8px',
                                    borderRadius: '6px', // match "Ít đường" pill shape
                                    letterSpacing: '0.01em',
                                    lineHeight: 1.4,
                                    whiteSpace: 'nowrap',
                                }}>
                                    {tag}
                                </span>
                            );
                        })}
                    </div>
                )}

                <div className={styles.cardFooter}>
                    <span className={styles.cardPrice} style={{ color: theme.accent }}>{item.price.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                    {itemQuantity > 0 ? (
                        <div className={styles.qtySelectorMini}>
                            <button className={styles.miniQtyBtn} onClick={(e) => { e.stopPropagation(); onRemove(item); }}>-</button>
                            <span className={styles.miniQtyValue}>{itemQuantity}</span>
                            <button className={styles.miniQtyBtn} onClick={(e) => { e.stopPropagation(); onAdd(item); }}>+</button>
                        </div>
                    ) : (
                        isConfirmed ? (
                            <button className={styles.addBtnSmallOutline} onClick={(e) => { e.stopPropagation(); onAdd(item); }}>{t('Gọi thêm')}</button>
                        ) : (
                            <button className={styles.addBtnSmall} onClick={(e) => { e.stopPropagation(); onAdd(item); }}>+</button>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
