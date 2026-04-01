"use client";
import React from "react";
import { X, Clock, HelpCircle, Utensils, ReceiptText, ChevronRight, Droplets, UtensilsCrossed, Trash2, StickyNote, Plus } from "lucide-react";
import styles from "./IntentBottomSheet.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { UserIntent } from "../hooks/useUserState";

interface IntentBottomSheetProps {
    isOpen: boolean;
    intent: UserIntent;
    onClose: () => void;
    onAction: (action: string) => void;
    activeOrders: any[];
    latestStatus: string | null;
    suggestions: any[];
    onQuickAdd: (item: any) => void;
    isPaymentRequested?: boolean;
}

export function IntentBottomSheet({
    isOpen,
    intent,
    onClose,
    onAction,
    activeOrders,
    latestStatus,
    suggestions,
    onQuickAdd,
    isPaymentRequested = false
}: IntentBottomSheetProps) {
    const { t } = useLanguage();

    if (!isOpen || intent === 'NONE') return null;

    const getIntentConfig = () => {
        switch (intent) {
            case 'QUICK_ADD':
                return {
                    icon: <Utensils className={styles.topIcon} />,
                    title: t('Bạn muốn gọi thêm gì không?'),
                    subtitle: t('Món cũ đang được chuẩn bị, sếp có muốn thêm gì hỗ trợ cho bữa ăn không?'),
                    showSuggestions: true,
                    actions: []
                };
            case 'TRACK_ORDER':
                return {
                    icon: <Clock className={styles.topIcon} />,
                    title: t('Theo dõi trạng thái món'),
                    subtitle: t('Sếp chờ chút nhé, bếp đang chuẩn bị. Đây là trạng thái các món sếp đã gọi:'),
                    showStatus: true,
                    actions: [
                        { id: 'staff_check', label: t('Nhắc bếp làm nhanh'), primary: false }
                    ]
                };
            case 'MID_MEAL_PROMPT':
                return {
                    icon: <HelpCircle className={styles.topIcon} />,
                    title: t('Sếp cần hỗ trợ gì không?'),
                    subtitle: t('Vui lòng chọn yêu cầu sếp cần, nhân viên sẽ có mặt ngay:'),
                    showStaffGrid: true,
                    actions: []
                };
            case 'PAYMENT_SUGGESTION':
                return {
                    icon: <ReceiptText className={styles.topIcon} />,
                    title: t('Thanh toán & Góp ý'),
                    subtitle: t('Hy vọng sếp hài lòng với bữa ăn. Sếp có muốn xem hóa đơn hay yêu cầu thanh toán không?'),
                    showStatus: true,
                    actions: [
                        { id: 'pay', label: t('Yêu cầu thanh toán'), primary: true },
                        { id: 'feedback', label: t('Góp ý dịch vụ'), primary: false }
                    ]
                };
            default:
                return null;
        }
    };

    const config = getIntentConfig();
    if (!config) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                <div className={styles.dragHandle} />
                <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>

                <div className={styles.content}>
                    <div className={styles.iconContainer}>{config.icon}</div>
                    <h3 className={styles.title}>{config.title}</h3>
                    <p className={styles.subtitle}>{config.subtitle}</p>

                    {/* Order Status Section */}
                    {config.showStatus && activeOrders.length > 0 && (
                        <div className={styles.statusBox}>
                            <div className={styles.statusHeader}>
                                <span className={styles.statusBadge} data-status={latestStatus}>
                                    {latestStatus === 'cooking' ? t('Đang chế biến') :
                                        latestStatus === 'preparing' ? t('Đang chuẩn bị') : t('Đã phục vụ')}
                                </span>
                            </div>
                            <div className={styles.orderList}>
                                {activeOrders.slice(0, 3).map((order, idx) => (
                                    <div key={idx} className={styles.orderItem}>
                                        <span className={styles.orderName}>{order.name}</span>
                                        <span className={styles.orderQty}>x{order.qty}</span>
                                    </div>
                                ))}
                                {activeOrders.length > 3 && (
                                    <div className={styles.moreItems}>+ {activeOrders.length - 3} {t('món khác')}</div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Quick Add Suggestions */}
                    {config.showSuggestions && suggestions.length > 0 && (
                        <div className={styles.suggestionGrid}>
                            {suggestions.map((item, idx) => (
                                <div key={idx} className={styles.suggestCard}>
                                    <img src={item.img || '/food/default-food.jpg'} className={styles.suggestImg} alt={item.name} />
                                    <div className={styles.suggestInfo}>
                                        <h4 className={styles.suggestName}>{item.name}</h4>
                                        <span className={styles.suggestPrice}>{item.price.toLocaleString()}đ</span>
                                    </div>
                                    <button className={styles.addBtn} onClick={() => onQuickAdd(item)}>
                                        <Plus size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Staff Request Grid */}
                    {config.showStaffGrid && (
                        <div className={styles.staffGrid}>
                            {[
                                { id: 'staff_clear', label: t('Dọn bàn'), icon: <Trash2 size={20} /> },
                                { id: 'staff_cutlery', label: t('Lấy bát đũa'), icon: <UtensilsCrossed size={20} /> },
                                { id: 'staff_napkins', label: t('Lấy khăn giấy'), icon: <StickyNote size={20} /> },
                                { id: 'staff_water', label: t('Thêm nước'), icon: <Droplets size={20} /> }
                            ].map(item => (
                                <button key={item.id} className={styles.staffGridItem} onClick={() => { onAction(item.id); onClose(); }}>
                                    <div className={styles.gridIcon}>{item.icon}</div>
                                    <span className={styles.gridLabel}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={styles.actionList}>
                        {config.actions.map(action => {
                            const isPayAction = action.id === 'pay';
                            const isDisabled = isPayAction && isPaymentRequested;
                            
                            return (
                                <button
                                    key={action.id}
                                    className={action.primary ? styles.primaryBtn : styles.secondaryBtn}
                                    disabled={isDisabled}
                                    style={isDisabled ? { backgroundColor: '#F1F5F9', color: '#94A3B8', cursor: 'not-allowed', borderColor: '#E2E8F0' } : {}}
                                    onClick={() => {
                                        onAction(action.id);
                                        onClose();
                                    }}
                                >
                                    {isDisabled ? t('Đã gửi yêu cầu thanh toán..') : action.label}
                                    {!isDisabled && <ChevronRight size={18} />}
                                </button>
                            );
                        })}
                    </div>

                    <button className={styles.dismissBtn} onClick={onClose}>
                        {t('Không, cảm ơn')}
                    </button>
                </div>
            </div>
        </div>
    );
}
