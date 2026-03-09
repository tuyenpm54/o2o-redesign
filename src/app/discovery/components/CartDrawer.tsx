import React from "react";
import { X, ChevronRight } from "lucide-react";
import styles from "../page.module.css";
import { useLanguage } from "@/context/LanguageContext";

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: { id?: number; item: any; quantity: number; selections?: any }[];
    total: number;
    onPlaceOrder: () => void;
    onEditItem: (cartEntry: any) => void;
}

export function CartDrawer({
    isOpen,
    onClose,
    cartItems,
    total,
    onPlaceOrder,
    onEditItem
}: CartDrawerProps) {
    const { t, language } = useLanguage();
    if (!isOpen) return null;

    return (
        <div className={styles.cartDrawerOverlay} onClick={onClose}>
            <div className={styles.cartDrawerContent} onClick={e => e.stopPropagation()}>
                <div className={styles.cartDrawerHeader}>
                    <h3 className={styles.cartDrawerTitle}>
                        {t('Giỏ hàng của bạn')} <span className={styles.cartCountBadge}>({cartItems.reduce((acc, curr) => acc + curr.quantity, 0)})</span>
                    </h3>
                    <button className={styles.closeDrawerBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.cartDrawerBody}>
                    <div className={styles.promoBanner}>
                        <span className={styles.promoIcon}>🎁</span>
                        <p className={styles.promoBannerText}>
                            {total < 200000 ? (
                                <>{t('Thêm')} <b>{(200000 - total).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</b> {t('để giảm')} <b>{t('giảm 10%')}</b></>
                            ) : (
                                <b>{t('Bạn đã nhận được ưu đãi giảm 10%!')}</b>
                            )}
                        </p>
                    </div>

                    <div className={styles.cartItemList}>
                        {cartItems.map((itemObj, idx) => (
                            <div key={`${itemObj.item.id}-${idx}`} className={styles.cartDrawerItem}>
                                <img
                                    src={itemObj.item.img}
                                    className={styles.cartItemImg}
                                    alt={itemObj.item.name}
                                    onError={(e) => { e.currentTarget.src = '/food/default-food.jpg'; }}
                                />
                                <div className={styles.cartItemInfo}>
                                    <h4 className={styles.cartItemName}>{itemObj.item.name}</h4>
                                    {itemObj.selections && (
                                        <div className={styles.cartItemSelections}>
                                            <span className={styles.selectionPill}>{itemObj.selections.size}</span>
                                            {itemObj.selections.toppings?.map((t: string) => (
                                                <span key={t} className={styles.selectionTopping}>+ {t.split('(')[0].trim()}</span>
                                            ))}
                                            {itemObj.selections.note && <p className={styles.selectionNote}>"{itemObj.selections.note}"</p>}
                                        </div>
                                    )}
                                    <span className={styles.cartItemEdit} onClick={() => onEditItem(itemObj)}>{t('Chỉnh sửa')}</span>
                                </div>
                                <div className={styles.cartItemPriceInfo}>
                                    <span className={styles.cartItemPrice}>{(itemObj.item.price * itemObj.quantity).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                                    <div className={styles.cartItemQtyBadge}>
                                        {itemObj.quantity}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.cartDrawerFooter}>
                    <div className={styles.drawerTotalRow}>
                        <span className={styles.drawerTotalLabel}>{t('Tạm tính')}</span>
                        <span className={styles.drawerTotalValue}>{total.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                    </div>
                    <div className={styles.drawerActionButtons}>
                        <button className={styles.drawerSecondaryBtn} onClick={onClose}>
                            {t('Xem chi tiết bàn')}
                        </button>
                        <button className={styles.drawerPrimaryBtn} onClick={onPlaceOrder}>
                            {t('Gửi gọi món')} <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
