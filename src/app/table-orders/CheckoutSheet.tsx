"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    SmilePlus, Frown, Ticket, ChevronRight, ReceiptText,
    Loader2, CheckCircle2
} from "lucide-react";
import styles from "./CheckoutSheet.module.css";
import { useLanguage } from "@/context/LanguageContext";

interface Voucher {
    id: string;
    code: string;
    title: string;
    discount_type: string;
    discount_value: number;
    min_order: number;
    expiry: string;
    status: string;
    qr_value: string;
}

interface CheckoutSheetProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    resid: string;
    tableid: string;
    userId?: string;
    tableSessionId?: string;
    onPaymentSent?: () => void;
}

const NEGATIVE_TAGS = [
    "Món ra chậm",
    "Món chưa ngon",
    "Phục vụ kém",
    "Giá hơi cao",
    "Không gian chưa ổn",
];

export default function CheckoutSheet({
    isOpen,
    onClose,
    totalAmount,
    resid,
    tableid,
    userId,
    tableSessionId,
    onPaymentSent,
}: CheckoutSheetProps) {
    const { t } = useLanguage();
    const router = useRouter();

    const [rating, setRating] = useState<"positive" | "negative" | null>(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [bestVoucher, setBestVoucher] = useState<Voucher | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Fetch vouchers when sheet opens
    useEffect(() => {
        if (!isOpen) return;
        // Reset state on open
        setRating(null);
        setSelectedTags([]);
        setIsSubmitting(false);
        setIsSuccess(false);

        const fetchVouchers = async () => {
            try {
                const res = await fetch(`/api/vouchers${userId ? `?userId=${userId}` : ""}`);
                if (res.ok) {
                    const data = await res.json();
                    const activeVouchers: Voucher[] = data.vouchers || [];
                    setVouchers(activeVouchers);

                    // Find best match: active, meets min_order, highest discount value
                    const eligible = activeVouchers.filter(
                        (v) => v.min_order <= totalAmount
                    );
                    if (eligible.length > 0) {
                        // Sort: FIXED by value desc, PERCENT by value desc
                        eligible.sort((a, b) => {
                            const aVal = a.discount_type === "PERCENT"
                                ? (totalAmount * a.discount_value) / 100
                                : a.discount_value;
                            const bVal = b.discount_type === "PERCENT"
                                ? (totalAmount * b.discount_value) / 100
                                : b.discount_value;
                            return bVal - aVal;
                        });
                        setBestVoucher(eligible[0]);
                    } else {
                        setBestVoucher(null);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch vouchers:", err);
            }
        };
        fetchVouchers();
    }, [isOpen, userId, totalAmount]);

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // 1. Submit feedback if rating was given
            if (rating) {
                await fetch("/api/feedback", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        resid,
                        tableid,
                        table_session_id: tableSessionId,
                        rating,
                        tags: rating === "negative" ? selectedTags : [],
                    }),
                });
            }

            // 2. Send payment request via chat
            await fetch("/api/chat/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resid,
                    tableid,
                    user_id: userId,
                    content: "Yêu cầu thanh toán",
                    type: "SUPPORT",
                }),
            });

            setIsSuccess(true);
            onPaymentSent?.();

            // Auto-close after 2.5s
            setTimeout(() => {
                onClose();
            }, 2500);
        } catch (err) {
            console.error("Checkout submit error:", err);
            setIsSubmitting(false);
        }
    };

    const handleViewAllVouchers = () => {
        router.push(
            `/account/vouchers?from=checkout&resid=${resid}&tableid=${tableid}`
        );
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.dragHandle} />

                {isSuccess ? (
                    <div className={styles.successState}>
                        <div className={styles.successIcon}>
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 className={styles.successTitle}>
                            {t("Yêu cầu đã gửi!")}
                        </h3>
                        <p className={styles.successSub}>
                            {t("Vui lòng đợi nhân viên mang máy POS tới bàn nhé.")}
                        </p>
                    </div>
                ) : (
                    <div className={styles.sheetContent}>
                        {/* Feedback Section */}
                        <div className={styles.feedbackSection}>
                            <span className={styles.feedbackLabel}>
                                {t("Bữa ăn hôm nay thế nào?")}
                            </span>

                            <div className={styles.feedbackOptions}>
                                <button
                                    className={`${styles.feedbackBtn} ${styles.feedbackBtnPositive} ${rating === "positive" ? styles.selected : ""}`}
                                    onClick={() => {
                                        setRating("positive");
                                        setSelectedTags([]);
                                    }}
                                >
                                    <SmilePlus
                                        size={28}
                                        className={styles.feedbackIcon}
                                    />
                                    <span className={styles.feedbackBtnLabel}>
                                        {t("Hài lòng")}
                                    </span>
                                </button>

                                <button
                                    className={`${styles.feedbackBtn} ${styles.feedbackBtnNegative} ${rating === "negative" ? styles.selected : ""}`}
                                    onClick={() => setRating("negative")}
                                >
                                    <Frown
                                        size={28}
                                        className={styles.feedbackIcon}
                                    />
                                    <span className={styles.feedbackBtnLabel}>
                                        {t("Chưa hài lòng")}
                                    </span>
                                </button>
                            </div>

                            {/* Negative tags — progressive disclosure */}
                            {rating === "negative" && (
                                <div className={styles.negativeTags}>
                                    {NEGATIVE_TAGS.map((tag) => (
                                        <button
                                            key={tag}
                                            className={`${styles.negativeTag} ${selectedTags.includes(tag) ? styles.selected : ""}`}
                                            onClick={() => toggleTag(tag)}
                                        >
                                            {t(tag)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.divider} />

                        {/* Voucher Section */}
                        <div className={styles.voucherSection}>
                            <span className={styles.voucherLabel}>
                                <Ticket size={16} color="#D97706" />
                                {t("Voucher dành cho bạn")}
                            </span>

                            {bestVoucher ? (
                                <>
                                    <div
                                        className={styles.voucherCard}
                                        onClick={handleViewAllVouchers}
                                    >
                                        <div className={styles.voucherCardIcon}>
                                            <Ticket size={20} />
                                        </div>
                                        <div className={styles.voucherCardInfo}>
                                            <div className={styles.voucherCardTitle}>
                                                {bestVoucher.title}
                                            </div>
                                            <div className={styles.voucherCardCode}>
                                                {bestVoucher.code}
                                            </div>
                                        </div>
                                        <ChevronRight size={18} color="#B45309" />
                                    </div>
                                    <button
                                        className={styles.voucherViewAll}
                                        onClick={handleViewAllVouchers}
                                    >
                                        {t("Xem tất cả voucher")}
                                        <ChevronRight size={14} />
                                    </button>
                                </>
                            ) : vouchers.length > 0 ? (
                                <button
                                    className={styles.voucherViewAll}
                                    onClick={handleViewAllVouchers}
                                >
                                    {t(`Bạn có ${vouchers.length} voucher`)} →
                                </button>
                            ) : (
                                <span className={styles.noVoucher}>
                                    {t("Bạn chưa có voucher nào")}
                                </span>
                            )}
                        </div>

                        <div className={styles.divider} />

                        {/* Total + CTA */}
                        <div className={styles.totalRow}>
                            <span className={styles.totalLabel}>
                                {t("Tổng tạm tính")}
                            </span>
                            <span className={styles.totalValue}>
                                {new Intl.NumberFormat("vi-VN").format(totalAmount)}đ
                            </span>
                        </div>

                        <button
                            className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <Loader2 size={20} className={styles.spinner} />
                            ) : (
                                <ReceiptText size={20} />
                            )}
                            {isSubmitting
                                ? t("Đang gửi...")
                                : t("Gửi yêu cầu thanh toán")}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
