"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Receipt, CreditCard, Ticket, X, Check, Loader2, Sparkles, Smile, Frown } from 'lucide-react';
import styles from './page.module.css';


// Types (Shared with OrderHistory but kept here for isolation)
interface OrderItem {
    id: number;
    name: string;
    qty: number;
    price: number;
}

// Flattened Mock Data for Bill View
const BILL_ITEMS: OrderItem[] = [
    { id: 1, name: 'Sườn cây nướng tiêu', qty: 1, price: 159000 },
    { id: 2, name: 'Salad cá salmon sốt chanh leo', qty: 1, price: 89000 },
    { id: 3, name: 'Trà đào cam sả', qty: 2, price: 45000 },
];

const MOCK_VOUCHERS = [
    { id: 'v1', code: 'PROMAX20', label: 'Giảm 20.000đ', value: 20000, type: 'FIXED', minOrder: 100000 },
    { id: 'v2', code: 'FREESHIP', label: 'Miễn phí phục vụ', value: 15000, type: 'FIXED', minOrder: 50000 },
    { id: 'v3', code: 'WEEKEND', label: 'Ưu đãi cuối tuần 10%', value: 0.1, type: 'PERCENT', minOrder: 200000 },
];

export default function BillPage() {
    const [isVoucherSheetOpen, setIsVoucherSheetOpen] = React.useState(false);
    const [selectedVoucher, setSelectedVoucher] = React.useState<any>(null);
    const [paymentStatus, setPaymentStatus] = React.useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');
    const [isFeedbackSubmitted, setIsFeedbackSubmitted] = React.useState(false);
    const [countdown, setCountdown] = React.useState(3);
    const router = useRouter();

    // Feedback State
    const [rating, setRating] = React.useState<'HAPPY' | 'SAD' | null>(null);
    const [comment, setComment] = React.useState('');
    const [selectedTags, setSelectedTags] = React.useState<string[]>([]);

    const QUICK_TAGS = {
        HAPPY: ['Món ăn ngon', 'Phục vụ nhanh', 'Giá hợp lý', 'Không gian sạch'],
        SAD: ['Món ra chậm', 'Món chưa ngon', 'Phục vụ kém', 'Giá hơi cao']
    };

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const subtotal = BILL_ITEMS.reduce((acc, item) => acc + (item.price * item.qty), 0);

    let discount = 0;
    if (selectedVoucher) {
        discount = selectedVoucher.type === 'FIXED'
            ? selectedVoucher.value
            : subtotal * selectedVoucher.value;
    }

    const vat = (subtotal - discount) * 0.08;
    const total = subtotal - discount + vat;

    // Automatic redirect effect
    React.useEffect(() => {
        if (isFeedbackSubmitted) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        router.push('/single-order-page');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [isFeedbackSubmitted, router]);

    const handleRequestPayment = () => {
        setPaymentStatus('SENDING');

        // Simulate POS/Staff sync
        setTimeout(() => {
            setPaymentStatus('SUCCESS');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 2000);
    };

    const handleSendFeedback = () => {
        setIsFeedbackSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Link href="/order-history" style={{ textDecoration: 'none' }}>
                    <button className={styles.backButton}>
                        <ChevronLeft size={24} />
                    </button>
                </Link>
                <h1 className={styles.pageTitle}>Hóa đơn tạm tính</h1>
            </header>

            <main className={styles.content}>
                {/* 1. Receipt View (Hidden after successful payment request) */}
                {(paymentStatus === 'IDLE' || paymentStatus === 'SENDING') && (
                    <div className={styles.receiptCard}>
                        <div className={styles.receiptHeader}>
                            <div className={styles.storeName}>Biển Đông</div>
                            <div className={styles.storeAddress}>123 Đường Hải Sản, Quận 1</div>

                            <div className={styles.billInfo}>
                                <span>Bàn: A-12</span>
                                <span>#123456</span>
                            </div>
                        </div>

                        <div className={styles.itemList}>
                            {BILL_ITEMS.map((item) => (
                                <div key={item.id} className={styles.itemRow}>
                                    <div className={styles.itemNameGroup}>
                                        <span className={styles.itemName}>{item.name}</span>
                                        <span className={styles.itemQty}>{item.qty} x {item.price.toLocaleString('vi-VN')}</span>
                                    </div>
                                    <span className={styles.itemTotal}>
                                        {(item.qty * item.price).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.voucherSection}>
                            <div className={styles.voucherInvite}>
                                <Sparkles size={16} color="#F59E0B" />
                                <span>Bạn có muốn áp dụng Voucher không?</span>
                            </div>
                            <button
                                className={`${styles.voucherInput} ${selectedVoucher ? styles.hasVoucher : ''}`}
                                onClick={() => setIsVoucherSheetOpen(true)}
                            >
                                <Ticket size={18} />
                                <span className={styles.voucherCodeText}>
                                    {selectedVoucher ? `Đã chọn: ${selectedVoucher.code}` : 'Chọn voucher hoặc nhập mã...'}
                                </span>
                                {selectedVoucher ? <Check size={16} color="#10B981" /> : <ChevronLeft style={{ transform: 'rotate(-90deg)' }} size={16} />}
                            </button>
                        </div>

                        <div className={styles.summarySection}>
                            <div className={styles.summaryRow}>
                                <span>Tạm tính</span>
                                <span>{subtotal.toLocaleString('vi-VN')}đ</span>
                            </div>
                            {discount > 0 && (
                                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                                    <span>Giảm giá ({selectedVoucher.code})</span>
                                    <span>-{discount.toLocaleString('vi-VN')}đ</span>
                                </div>
                            )}
                            <div className={styles.summaryRow}>
                                <span>VAT (8%)</span>
                                <span>{vat.toLocaleString('vi-VN')}đ</span>
                            </div>
                            <div className={styles.summaryTotal}>
                                <span>Tổng cộng</span>
                                <span className={styles.totalPrice}>{total.toLocaleString('vi-VN')}đ</span>
                            </div>
                        </div>

                        <div className={styles.footerNote}>
                            Cảm ơn quý khách đã sử dụng dịch vụ!
                        </div>
                    </div>
                )}

                {/* 2. Success & Feedback States */}
                {paymentStatus === 'SUCCESS' ? (
                    <div className={styles.successState}>
                        <div className={styles.successHeader}>
                            <div className={styles.successIconWrapper}>
                                <Check size={32} color="white" />
                            </div>
                            <div className={styles.successText}>
                                <h3>{isFeedbackSubmitted ? 'Cảm ơn bạn!' : 'Yêu cầu đã gửi!'}</h3>
                                <p>
                                    {isFeedbackSubmitted
                                        ? 'Ý kiến của bạn giúp chúng mình hoàn thiện hơn mỗi ngày.'
                                        : 'Vui lòng đợi nhân viên mang máy POS tới bàn nhé.'}
                                </p>
                            </div>
                        </div>

                        {!isFeedbackSubmitted ? (
                            <div className={styles.feedbackSection}>
                                <div className={styles.feedbackDivider}></div>
                                <h4 className={styles.feedbackTitle}>Bạn thấy trải nghiệm hôm nay thế nào?</h4>

                                <div className={styles.ratingOptions}>
                                    <button
                                        className={`${styles.ratingBtn} ${rating === 'HAPPY' ? styles.ratingActiveHappy : ''}`}
                                        onClick={() => { setRating('HAPPY'); setSelectedTags([]); }}
                                    >
                                        <Smile size={32} />
                                        <span>Hài lòng</span>
                                    </button>
                                    <button
                                        className={`${styles.ratingBtn} ${rating === 'SAD' ? styles.ratingActiveSad : ''}`}
                                        onClick={() => { setRating('SAD'); setSelectedTags([]); }}
                                    >
                                        <Frown size={32} />
                                        <span>Chưa tốt</span>
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
                                            placeholder="Để lại lời nhắn nếu bạn muốn góp ý thêm..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                        />

                                        <button className={styles.sendFeedbackBtn} onClick={handleSendFeedback}>
                                            Gửi đánh giá để tiếp tục
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                className={styles.returnBtn}
                                onClick={() => router.push('/single-order-page')}
                            >
                                Quay lại Menu {countdown > 0 && `(${countdown}s)`}
                            </button>
                        )}
                    </div>
                ) : (
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
                        {paymentStatus === 'SENDING' ? 'Đang gửi yêu cầu...' : 'Yêu cầu thanh toán'}
                    </button>
                )}
            </main>

            {/* Voucher Bottom Sheet Modal */}
            {isVoucherSheetOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsVoucherSheetOpen(false)}>
                    <div className={styles.voucherSheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.sheetHeader}>
                            <h3>Chọn Voucher</h3>
                            <button onClick={() => setIsVoucherSheetOpen(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.voucherList}>
                            <div className={styles.voucherGroupLabel}>Voucher của bạn</div>
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
                                        <div className={styles.voucherMin}>Cho đơn từ {v.minOrder.toLocaleString('vi-VN')}đ</div>
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
