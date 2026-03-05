"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CreditCard, Ticket, X, Check, Loader2, Sparkles, Smile, Frown } from 'lucide-react';
import styles from './page.module.css';

const MOCK_VOUCHERS = [
    { id: 'v1', code: 'PROMAX20', label: 'Giảm 20.000đ', value: 20000, type: 'FIXED', minOrder: 100000 },
    { id: 'v2', code: 'FREESHIP', label: 'Miễn phí phục vụ', value: 15000, type: 'FIXED', minOrder: 50000 },
    { id: 'v3', code: 'WEEKEND', label: 'Ưu đãi cuối tuần 10%', value: 0.1, type: 'PERCENT', minOrder: 200000 },
];

import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function BillPage() {
    const searchParams = useSearchParams();
    const { t, language } = useLanguage();
    const resid = searchParams.get('resid') || '100';
    const tableid = searchParams.get('tableid') || 'A-12';

    const [billItems, setBillItems] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isVoucherSheetOpen, setIsVoucherSheetOpen] = React.useState(false);
    const [selectedVoucher, setSelectedVoucher] = React.useState<any>(null);
    const [paymentStatus, setPaymentStatus] = React.useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');
    const [isFeedbackSubmitted, setIsFeedbackSubmitted] = React.useState(false);
    const [showToast, setShowToast] = React.useState(false);
    const router = useRouter();
    const feedbackRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const fetchBill = async () => {
            try {
                const res = await fetch(`/api/restaurants/${resid}/live?tableid=${tableid}`);
                const data = await res.json();
                if (data.members) {
                    const allConfirmed: any[] = [];
                    data.members.forEach((m: any) => {
                        (m.confirmedOrders || []).forEach((o: any) => allConfirmed.push(o));
                    });

                    const grouped: any[] = [];
                    allConfirmed.forEach(item => {
                        const existing = grouped.find(g => g.name === item.name && g.price === item.price);
                        if (existing) {
                            existing.qty += (item.qty || 1);
                        } else {
                            grouped.push({ ...item, qty: item.qty || 1 });
                        }
                    });
                    setBillItems(grouped);
                }
            } catch (err) {
                console.error("Failed to fetch bill data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBill();
    }, [resid, tableid]);

    // Feedback State
    const [rating, setRating] = React.useState<'HAPPY' | 'SAD' | null>(null);
    const [comment, setComment] = React.useState('');
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

    const QUICK_TAGS = {
        HAPPY: [t('Món ăn ngon'), t('Phục vụ nhanh'), t('Giá hợp lý'), t('Không gian sạch')],
        SAD: [t('Món ra chậm'), t('Món chưa ngon'), t('Phục vụ kém'), t('Giá hơi cao')]
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const subtotal = billItems.reduce((acc: number, item: any) => acc + (item.price * item.qty), 0);

    let discount = 0;
    if (selectedVoucher) {
        discount = selectedVoucher.type === 'FIXED'
            ? selectedVoucher.value
            : subtotal * selectedVoucher.value;
    }

    const vat = (subtotal - discount) * 0.08;
    const total = subtotal - discount + vat;

    const handleRequestPayment = async () => {
        setPaymentStatus('SENDING');
        try {
            const res = await fetch('/api/payment/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lang: language })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setPaymentStatus('SUCCESS');
                setShowToast(true);
                setTimeout(() => setShowToast(false), 4000);
                setTimeout(() => {
                    feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            } else {
                setPaymentStatus('IDLE');
                alert(data.error || t('Gửi yêu cầu thất bại'));
            }
        } catch (err) {
            console.error('Payment request failed:', err);
            setPaymentStatus('IDLE');
            alert(t('Không thể gửi yêu cầu thanh toán'));
        }
    };

    const handleSendFeedback = () => {
        setIsFeedbackSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href={`/table-orders?resid=${resid}&tableid=${tableid}`} style={{ textDecoration: 'none' }}>
                    <button className={styles.backButton}>
                        <ChevronLeft size={24} />
                    </button>
                </Link>
                <h1 className={styles.pageTitle}>{t('Hoá đơn tạm tính')}</h1>
            </header>

            {/* Toast Popup */}
            {showToast && (
                <div className={styles.toastPopup}>
                    <div className={styles.toastContent}>
                        <div className={styles.toastIcon}>
                            <Check size={20} color="white" />
                        </div>
                        <div className={styles.toastText}>
                            <strong>{t('Yêu cầu đã gửi!')}</strong>
                            <span>{t('Vui lòng đợi nhân viên mang máy POS tới bàn nhé.')}</span>
                        </div>
                        <button className={styles.toastClose} onClick={() => setShowToast(false)}>
                            <X size={16} />
                        </button>
                    </div>
                </div>
            )}

            <main className={styles.content}>
                {/* Receipt - Always visible */}
                <div className={styles.receiptCard}>
                    <div className={styles.receiptHeader}>
                        <div className={styles.storeName}>Biển Đông</div>
                        <div className={styles.storeAddress}>123 Đường Hải Sản, Quận 1</div>
                        <div className={styles.billInfo}>
                            <span>{t('Bàn')}: {tableid}</span>
                            <span>#123456</span>
                        </div>
                    </div>

                    <div className={styles.itemList}>
                        {billItems.map((item: any) => (
                            <div key={item.id} className={styles.itemRow}>
                                <div className={styles.itemNameGroup}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    <span className={styles.itemQty}>{item.qty} x {item.price.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}</span>
                                </div>
                                <span className={styles.itemTotal}>
                                    {(item.qty * item.price).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                </span>
                            </div>
                        ))}
                    </div>

                    {paymentStatus === 'IDLE' && (
                        <div className={styles.voucherSection}>
                            <div className={styles.voucherInvite}>
                                <Sparkles size={16} color="#F59E0B" />
                                <span>{t('Bạn có muốn áp dụng Voucher không?')}</span>
                            </div>
                            <button
                                className={`${styles.voucherInput} ${selectedVoucher ? styles.hasVoucher : ''}`}
                                onClick={() => setIsVoucherSheetOpen(true)}
                            >
                                <Ticket size={18} />
                                <span className={styles.voucherCodeText}>
                                    {selectedVoucher ? `${t('Đã chọn')}: ${selectedVoucher.code}` : t('Chọn voucher hoặc nhập mã...')}
                                </span>
                                {selectedVoucher ? <Check size={16} color="#10B981" /> : <ChevronLeft style={{ transform: 'rotate(-90deg)' }} size={16} />}
                            </button>
                        </div>
                    )}

                    <div className={styles.summarySection}>
                        <div className={styles.summaryRow}>
                            <span>{t('Tạm tính')}</span>
                            <span>{subtotal.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                        </div>
                        {discount > 0 && (
                            <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                                <span>{t('Giảm giá')} ({selectedVoucher.code})</span>
                                <span>-{discount.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                            </div>
                        )}
                        <div className={styles.summaryRow}>
                            <span>VAT (8%)</span>
                            <span>{vat.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                        </div>
                        <div className={styles.summaryTotal}>
                            <span>{t('Tổng cộng')}</span>
                            <span className={styles.totalPrice}>{total.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</span>
                        </div>
                    </div>

                    {paymentStatus === 'SUCCESS' && (
                        <div className={styles.paymentConfirmedBadge}>
                            <Check size={16} />
                            <span>{t('Đã gửi yêu cầu thanh toán')}</span>
                        </div>
                    )}

                    {paymentStatus === 'SUCCESS' && (
                        <div className={styles.staffNote}>
                            {t('Nhân viên sẽ ra kiểm đồ và thanh toán tại bàn')}
                        </div>
                    )}

                    <div className={styles.footerNote}>
                        {t('Cảm ơn quý khách đã sử dụng dịch vụ!')}
                    </div>
                </div>

                {/* Payment Button - only when IDLE or SENDING */}
                {paymentStatus !== 'SUCCESS' && (
                    <button
                        className={`${styles.paymentBtn} ${paymentStatus === 'SENDING' ? styles.btnLoading : ''}`}
                        onClick={handleRequestPayment}
                        disabled={paymentStatus !== 'IDLE'}
                    >
                        {paymentStatus === 'SENDING' ? (
                            <Loader2 className={styles.spinner} size={20} />
                        ) : (
                            <CreditCard size={20} />
                        )}
                        {paymentStatus === 'SENDING' ? t('Đang gửi yêu cầu...') : t('Yêu cầu thanh toán')}
                    </button>
                )}

                {/* Feedback Section - shown after payment request success, at bottom */}
                {paymentStatus === 'SUCCESS' && (
                    <div className={styles.feedbackCard} ref={feedbackRef}>
                        {!isFeedbackSubmitted ? (
                            <>
                                <h4 className={styles.feedbackTitle}>{t('Bạn thấy trải nghiệm hôm nay thế nào?')}</h4>

                                <div className={styles.ratingOptions}>
                                    <button
                                        className={`${styles.ratingBtn} ${rating === 'HAPPY' ? styles.ratingActiveHappy : ''}`}
                                        onClick={() => { setRating('HAPPY'); setSelectedTags([]); }}
                                    >
                                        <Smile size={32} />
                                        <span>{t('Hài lòng')}</span>
                                    </button>
                                    <button
                                        className={`${styles.ratingBtn} ${rating === 'SAD' ? styles.ratingActiveSad : ''}`}
                                        onClick={() => { setRating('SAD'); setSelectedTags([]); }}
                                    >
                                        <Frown size={32} />
                                        <span>{t('Chưa tốt')}</span>
                                    </button>
                                </div>

                                {rating && (
                                    <div className={styles.feedbackDetailAnim}>
                                        <div className={styles.tagGrid}>
                                            {QUICK_TAGS[rating].map(tag => (
                                                <button
                                                    key={tag}
                                                    className={`${styles.tagItem} ${selectedTags.includes(tag) ? styles.tagActive : ''}`}
                                                    onClick={() => toggleTag(tag)}
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>

                                        <textarea
                                            className={styles.commentInput}
                                            placeholder={t("Để lại lời nhắn nếu bạn muốn góp ý thêm...")}
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />

                                        <button className={styles.sendFeedbackBtn} onClick={handleSendFeedback}>
                                            {t('Gửi đánh giá')}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className={styles.thankYouSection}>
                                <div className={styles.thankYouIcon}>
                                    <Check size={28} color="white" />
                                </div>
                                <h4>{t('Cảm ơn bạn!')}</h4>
                                <p>{t('Ý kiến của bạn giúp chúng mình hoàn thiện hơn mỗi ngày.')}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Voucher Bottom Sheet Modal */}
            {isVoucherSheetOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsVoucherSheetOpen(false)}>
                    <div className={styles.voucherSheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.sheetHeader}>
                            <h3>{t('Chọn Voucher')}</h3>
                            <button onClick={() => setIsVoucherSheetOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.voucherList}>
                            <div className={styles.voucherGroupLabel}>{t('Voucher của bạn')}</div>
                            {MOCK_VOUCHERS.map((v) => (
                                <div
                                    key={v.id}
                                    className={`${styles.voucherItem} ${selectedVoucher?.id === v.id ? styles.voucherActive : ''}`}
                                    onClick={() => {
                                        setSelectedVoucher(v);
                                        setIsVoucherSheetOpen(false);
                                    }}
                                >
                                    <div className={styles.voucherIcon}>
                                        <Ticket size={24} />
                                    </div>
                                    <div className={styles.voucherInfo}>
                                        <div className={styles.voucherCode}>{v.code}</div>
                                        <div className={styles.voucherLabel}>{v.label}</div>
                                        <div className={styles.voucherMin}>{t('Cho đơn từ')} {v.minOrder.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</div>
                                    </div>
                                    <div className={styles.voucherRadio}>
                                        {selectedVoucher?.id === v.id && <Check size={18} color="#F97316" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

