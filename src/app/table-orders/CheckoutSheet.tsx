"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    SmilePlus, Frown, Ticket, ChevronRight, CheckCircle2, X
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

    // Track if feedback has been sent to avoid duplicate sends
    const feedbackSentRef = useRef(false);

    useEffect(() => {
        if (!isOpen) return;
        setRating(null);
        setSelectedTags([]);
        feedbackSentRef.current = false;

        const fetchVouchers = async () => {
            try {
                const res = await fetch(`/api/vouchers${userId ? `?userId=${userId}` : ""}`);
                if (res.ok) {
                    const data = await res.json();
                    const activeVouchers: Voucher[] = data.vouchers || [];
                    setVouchers(activeVouchers);

                    const eligible = activeVouchers.filter(
                        (v) => v.min_order <= totalAmount
                    );
                    if (eligible.length > 0) {
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

    // Send feedback automatically when closing if rating exists
    const handleClose = () => {
        if (rating && !feedbackSentRef.current) {
            feedbackSentRef.current = true;
            fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resid,
                    tableid,
                    table_session_id: tableSessionId,
                    rating,
                    tags: rating === "negative" ? selectedTags : [],
                }),
            }).catch(console.error);
        }
        onClose();
    };

    const toggleTag = (tag: string) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const handleViewAllVouchers = () => {
        router.push(
            `/account/vouchers?from=checkout&resid=${resid}&tableid=${tableid}`
        );
    };

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={handleClose}>
            <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
                <div className={styles.dragHandle} />

                <div className={styles.sheetContent}>
                    {/* Success Header (Replaced standard title) */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ECFDF5', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                            <CheckCircle2 size={32} />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E293B', textAlign: 'center' }}>
                            {t("Gửi yêu cầu thanh toán thành công")}
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#64748B', textAlign: 'center', marginTop: '6px' }}>
                            {t("Vui lòng đợi nhân viên mang máy POS tới bàn nhé.")}
                        </p>
                    </div>

                    <div className={styles.divider} />

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

                    {/* Voucher Section - ONLY render if there are any vouchers */}
                    {vouchers.length > 0 && (
                        <>
                            <div className={styles.divider} />
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
                                ) : (
                                    <button
                                        className={styles.voucherViewAll}
                                        onClick={handleViewAllVouchers}
                                        style={{ alignSelf: 'flex-start', background: '#F8FAFC', padding: '12px 16px', borderRadius: '12px', width: '100%', justifyContent: 'space-between', marginTop: '4px' }}
                                    >
                                        <span style={{ color: '#475569' }}>{t(`Bạn có ${vouchers.length} voucher (Chưa đủ điền kiện cho hoá đơn này)`)}</span>
                                        <ChevronRight size={16} color="#94A3B8" />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                    
                    {/* Replaced submit button with simple close button as requested */}
                    <button
                        style={{
                            width: '100%',
                            padding: '16px',
                            borderRadius: '16px',
                            border: 'none',
                            background: '#F1F5F9',
                            color: '#475569',
                            fontSize: '1rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            marginTop: '8px'
                        }}
                        onClick={handleClose}
                    >
                        {t("Đóng")}
                    </button>
                </div>
            </div>
        </div>
    );
}
