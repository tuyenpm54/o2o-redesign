"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    SmilePlus, Frown, Ticket, ChevronRight, CheckCircle2, X
} from "lucide-react";
import styles from "./FeedbackSheet.module.css";
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

interface FeedbackSheetProps {
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

export default function FeedbackSheet({
    isOpen,
    onClose,
    totalAmount,
    resid,
    tableid,
    userId,
    tableSessionId,
    onPaymentSent,
}: FeedbackSheetProps) {
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

                <div className={styles.sheetContent} style={{ gap: '16px', background: '#F8FAFC', padding: '16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
                    
                    {/* Success Header Card */}
                    <div style={{ 
                        background: '#ffffff', 
                        borderRadius: '24px', 
                        padding: '32px 20px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ 
                            width: 64, height: 64, 
                            borderRadius: '20px', 
                            background: '#ECFDF5', 
                            color: '#10B981', 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            marginBottom: '16px',
                            boxShadow: '0 8px 16px rgba(16,185,129,0.12)' 
                        }}>
                            <CheckCircle2 size={36} strokeWidth={2.5} />
                        </div>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1E293B', textAlign: 'center', letterSpacing: '-0.5px' }}>
                            {t("Đã gọi nhân viên thanh toán")}
                        </h3>
                        <p style={{ fontSize: '0.95rem', color: '#64748B', textAlign: 'center', marginTop: '8px', fontWeight: 500 }}>
                            {t("Vui lòng đợi nhân viên mang Bill đến bàn nhé.")}
                        </p>
                    </div>

                    {/* Feedback Grouped Card */}
                    <div style={{ 
                        background: '#ffffff', 
                        borderRadius: '24px', 
                        overflow: 'hidden',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                    }}>
                        <div style={{ padding: '16px 20px', background: '#FAFAF9', borderBottom: '1px solid #F1F5F9' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <SmilePlus size={20} color="#6366F1" />
                                {t("Bữa ăn hôm nay thế nào?")}
                            </span>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <div className={styles.feedbackOptions}>
                                <button
                                    style={{ 
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', 
                                        padding: '16px', borderRadius: '16px', border: `2px solid ${rating === 'positive' ? '#10B981' : '#F1F5F9'}`, 
                                        background: rating === 'positive' ? '#ECFDF5' : '#ffffff',
                                        transition: 'all 0.2s ease', cursor: 'pointer'
                                    }}
                                    onClick={() => {
                                        setRating("positive");
                                        setSelectedTags([]);
                                    }}
                                >
                                    <SmilePlus size={32} color={rating === 'positive' ? '#10B981' : '#94A3B8'} />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: rating === 'positive' ? '#047857' : '#475569' }}>
                                        {t("Hài lòng")}
                                    </span>
                                </button>

                                <button
                                    style={{ 
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', 
                                        padding: '16px', borderRadius: '16px', border: `2px solid ${rating === 'negative' ? '#EF4444' : '#F1F5F9'}`, 
                                        background: rating === 'negative' ? '#FEF2F2' : '#ffffff',
                                        transition: 'all 0.2s ease', cursor: 'pointer'
                                    }}
                                    onClick={() => setRating("negative")}
                                >
                                    <Frown size={32} color={rating === 'negative' ? '#EF4444' : '#94A3B8'} />
                                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: rating === 'negative' ? '#B91C1C' : '#475569' }}>
                                        {t("Chưa hài lòng")}
                                    </span>
                                </button>
                            </div>

                            {rating === "negative" && (
                                <div className={styles.negativeTags} style={{ marginTop: '20px' }}>
                                    {NEGATIVE_TAGS.map((tag) => (
                                        <button
                                            key={tag}
                                            className={`${styles.negativeTag} ${selectedTags.includes(tag) ? styles.selected : ""}`}
                                            onClick={() => toggleTag(tag)}
                                            style={{ padding: '10px 16px', fontSize: '0.9rem' }}
                                        >
                                            {t(tag)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Voucher Grouped Card (Only if available) */}
                    {vouchers.length > 0 && (
                        <div style={{ 
                            background: '#ffffff', 
                            borderRadius: '24px', 
                            overflow: 'hidden',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                        }}>
                            <div style={{ padding: '16px 20px', background: '#FFFBEB', borderBottom: '1px solid #FEF3C7', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Ticket size={20} color="#D97706" />
                                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400E' }}>
                                    {t("Voucher của bạn")}
                                </span>
                            </div>
                            <div style={{ padding: '20px' }}>
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
                                            style={{ marginTop: '12px', width: '100%', justifyContent: 'center', padding: '12px', background: '#FFFBEB', borderRadius: '12px' }}
                                        >
                                            {t("Xem tất cả voucher")}
                                            <ChevronRight size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={handleViewAllVouchers}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 16px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #F1F5F9', cursor: 'pointer' }}
                                    >
                                        <span style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>{t(`Bạn có ${vouchers.length} voucher`)}</span>
                                        <ChevronRight size={18} color="#94A3B8" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Action Button */}
                    <button
                        style={{
                            width: '100%',
                            padding: '18px',
                            borderRadius: '20px',
                            border: 'none',
                            background: rating ? '#DF1B41' : '#E2E8F0',
                            color: rating ? '#ffffff' : '#475569',
                            fontSize: '1.1rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            marginTop: '4px',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: rating ? '0 8px 20px rgba(223, 27, 65, 0.25)' : 'none'
                        }}
                        onClick={handleClose}
                    >
                        {rating ? t("Gửi đánh giá") : t("Đóng (Không đánh giá)")}
                    </button>
                </div>
            </div>
        </div>
    );
}
