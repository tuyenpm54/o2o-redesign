"use client";

import React, { useState } from "react";
import { Headphones, ShoppingBag, ChevronRight, Clock, CheckCircle2, AlertCircle, Utensils, Sparkles, User as UserIcon, Send, MessageSquare } from "lucide-react";
import styles from "../page.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { UserIntent } from "../hooks/useUserState";

interface SmartContextDockProps {
    isVisible: boolean;
    intent: UserIntent;
    onStaffCall: (customMessage?: string) => void;
    onCartOpen: () => void;
    cartCount: number;
    total: number;
    latestStatus: string | null;
    suggestions: any[];
    onAddSuggestion: (item: any) => void;
    activeOrdersCount?: number;
    onSendServiceRequests: (labels: string[], otherText?: string) => void;
    activeServiceRequests?: any[];
    minutesSinceLastOrder?: number;
    onStatusClick?: () => void;
}

export function SmartContextDock({
    isVisible,
    intent,
    onStaffCall,
    onCartOpen,
    cartCount,
    total,
    latestStatus,
    suggestions,
    onAddSuggestion,
    activeOrdersCount = 0,
    onSendServiceRequests,
    activeServiceRequests = [],
    minutesSinceLastOrder = 0,
    onStatusClick
}: SmartContextDockProps) {
    const { t } = useLanguage();
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
    const [otherText, setOtherText] = useState("");
    const [isOtherSelected, setIsOtherSelected] = useState(false);

    if (!isVisible) return null;

    return (
        <div className={styles.dockWrapper}>
            <div className={styles.premiumDock}>
                <div className={styles.dockSimpleCart} onClick={onCartOpen}>
                    <div className={styles.dockCartPromo}>
                        {total < 200000 ? (
                            <span>{t('Thêm')} <b className={styles.promoHighlight}>{(200000 - total).toLocaleString()}đ</b> {t('để được')} <span className={styles.promoHighlight}>{t('giảm 10%')}</span></span>
                        ) : (
                            <span className={styles.promoHighlight}>{t('Sếp đã được giảm giá 10% cho đơn hàng này!')}</span>
                        )}
                    </div>
                    <div className={styles.dockSimpleCartBar}>
                        <div className={styles.dockCartLabel}>
                            <ShoppingBag size={20} />
                            <span>{t('Giỏ hàng')} • {cartCount} {t('món')}</span>
                        </div>
                        <div className={styles.dockCartPrice}>
                            {total.toLocaleString()}đ
                            <ChevronRight size={18} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
