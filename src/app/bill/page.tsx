"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, CreditCard, Ticket, X, Check, Loader2, Sparkles, Smile, Frown, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './page.module.css';

const MOCK_VOUCHERS = [
    { id: 'v1', code: 'PROMAX20', label: 'Giảm 20.000đ', value: 20000, type: 'FIXED', minOrder: 100000 },
    { id: 'v2', code: 'FREESHIP', label: 'Miễn phí phục vụ', value: 15000, type: 'FIXED', minOrder: 50000 },
    { id: 'v3', code: 'WEEKEND', label: 'Ưu đãi cuối tuần 10%', value: 0.1, type: 'PERCENT', minOrder: 200000 },
];

const MOCK_VAT_PROFILES = [
    { id: 'vat1', companyName: 'Công ty Cổ phần O2O Việt Nam', taxCode: '0123456789', address: '123 Đường Hải Sản, Quận 1, TP.HCM', email: 'ketoan@o2o.vn' },
    { id: 'vat2', companyName: 'Công ty TNHH Giải Pháp Phần Mềm A', taxCode: '9876543210', address: '456 Mai Chí Thọ, TP. Thủ Đức, TP.HCM', email: 'admin@softwarea.com' }
];

import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

function BillContent() {
    const searchParams = useSearchParams();
    const { t, language } = useLanguage();
    const resid = searchParams.get('resid') || '100';
    const tableid = searchParams.get('tableid') || 'A-12';
    const from = searchParams.get('from') || `/menu?resid=${resid}&tableid=${tableid}`;

    const [billItems, setBillItems] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isVoucherSheetOpen, setIsVoucherSheetOpen] = React.useState(false);
    const [selectedVoucher, setSelectedVoucher] = React.useState<any>(null);
    const [paymentStatus, setPaymentStatus] = React.useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');
    const [isFeedbackSubmitted, setIsFeedbackSubmitted] = React.useState(false);
    const [showToast, setShowToast] = React.useState(false);
    const [isBillCollapsed, setIsBillCollapsed] = React.useState(false);
    const [wantsVat, setWantsVat] = React.useState(false);
    const [selectedVatId, setSelectedVatId] = React.useState<string | 'new'>('vat1');
    const [vatCompanyName, setVatCompanyName] = React.useState('');
    const [vatTaxCode, setVatTaxCode] = React.useState('');
    const [vatEmail, setVatEmail] = React.useState('');
    const [vatAddress, setVatAddress] = React.useState('');

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

                    // Sync payment status from support requests
                    if (data.supportRequests) {
                        const hasActivePaymentReq = data.supportRequests.some((req: any) => 
                            (req.text === "Thanh toán" || req.text === "Yêu cầu thanh toán") && 
                            req.status !== 'Xong' && req.status !== 'Hoàn thành'
                        );
                        if (hasActivePaymentReq) {
                            setPaymentStatus('SUCCESS');
                            setIsBillCollapsed(true);
                        }
                    }
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
        let vatInfo = null;
        if (wantsVat) {
            if (selectedVatId === 'new') {
                if (!vatCompanyName || !vatTaxCode || !vatEmail) {
                    alert(t('Vui lòng nhập đầy đủ Tên, MST và Email nhận hoá đơn!'));
                    return;
                }
                vatInfo = { companyName: vatCompanyName, taxCode: vatTaxCode, email: vatEmail, address: vatAddress };
            } else {
                vatInfo = MOCK_VAT_PROFILES.find(p => p.id === selectedVatId);
            }
        }

        setPaymentStatus('SENDING');
        try {
            const res = await fetch('/api/payment/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lang: language, vatInfo })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setPaymentStatus('SUCCESS');
                setIsBillCollapsed(true);
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

    const handleSendFeedback = async () => {
        if (!rating) return;
        setIsFeedbackSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });

        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    rating: rating === 'HAPPY' ? 5 : 3, // basic mapping
                    comment, 
                    tags: selectedTags, 
                    resid, 
                    tableid 
                })
            });
        } catch (error) {
            console.error('Feedback Error:', error);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button className={styles.backButton} onClick={() => router.push(from)}>
                    <ChevronLeft size={24} />
                </button>
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
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-[20vh] text-slate-400">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm mb-4 animate-pulse">
                            <Loader2 className="animate-spin text-red-500" size={32} />
                        </div>
                        <p className="font-semibold text-sm tracking-tight text-slate-500 dark:text-slate-400">{t('Đang lấy dữ liệu hoá đơn...')}</p>
                    </div>
                ) : (
                    <>
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

                    {(!isBillCollapsed || paymentStatus !== 'SUCCESS') && (
                        <>
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
                            </div>
                        </>
                    )}

                    <div className={styles.summaryTotal} style={isBillCollapsed && paymentStatus === 'SUCCESS' ? { borderTop: 'none', marginTop: 0, paddingTop: 0 } : {}}>
                        <span>{t('Tổng cộng')}</span>
                        <div style={{ textAlign: 'right' }}>
                            <div className={styles.totalPrice}>{total.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US')}đ</div>
                            {isBillCollapsed && paymentStatus === 'SUCCESS' && (
                                <button
                                    className={styles.collapsedExpandBtn}
                                    onClick={() => setIsBillCollapsed(false)}
                                >
                                    {t('Xem chi tiết')} <ChevronDown size={14} />
                                </button>
                            )}
                        </div>
                    </div>

                    {!isBillCollapsed && paymentStatus === 'SUCCESS' && (
                        <button
                            className={styles.expandedCollapseBtn}
                            onClick={() => setIsBillCollapsed(true)}
                        >
                            <ChevronUp size={16} /> {t('Thu gọn')}
                        </button>
                    )}

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

                {/* VAT Section (Outside receipt paper) */}
                {paymentStatus === 'IDLE' && (
                    <div className="mb-6 p-5 bg-white dark:bg-slate-900 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-500 mx-1">
                        <label className="flex items-start gap-4 cursor-pointer group select-none">
                            <div className={`relative flex items-center justify-center w-[22px] h-[22px] mt-0.5 shrink-0 rounded-[6px] border-[2px] transition-colors ${wantsVat ? 'border-red-500 bg-red-500' : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 group-hover:border-red-500'}`}>
                                <input 
                                    type="checkbox" 
                                    checked={wantsVat} 
                                    onChange={(e) => setWantsVat(e.target.checked)}
                                    className="absolute opacity-0 w-full h-full cursor-pointer"
                                />
                                {wantsVat && <Check size={14} className="text-white absolute" strokeWidth={3} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-[0.95rem] tracking-tight text-slate-800 dark:text-slate-200">{t('Yêu cầu xuất hoá đơn đỏ (VAT)')}</span>
                                <span className="text-[0.8rem] text-slate-500 dark:text-slate-400 mt-[2px] leading-snug">{t('Phiếu e-invoice sẽ được chuyển qua email')}</span>
                            </div>
                        </label>
                        
                        {wantsVat && (
                            <div className="mt-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 animate-in slide-in-from-top-2 fade-in duration-300">
                                <div className="flex flex-col gap-3">
                                    <div className="font-bold text-[0.85rem] text-slate-700 dark:text-slate-300 mb-1 tracking-tight">{t('CHỌN THÔNG TIN CÔNG TY')}</div>
                                    
                                    {MOCK_VAT_PROFILES.map(profile => (
                                        <label key={profile.id} className={`flex items-start gap-4 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedVatId === profile.id ? 'border-red-500 bg-white dark:bg-slate-800 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500/50 bg-white dark:bg-slate-800'}`}>
                                            <div className="relative flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0 mt-[2px]">
                                                <input 
                                                    type="radio" 
                                                    name="vatProfile" 
                                                    value={profile.id} 
                                                    checked={selectedVatId === profile.id}
                                                    onChange={() => setSelectedVatId(profile.id)}
                                                    className="absolute opacity-0 w-full h-full cursor-pointer"
                                                />
                                                {selectedVatId === profile.id && <div className="w-[8px] h-[8px] rounded-full bg-red-500" />}
                                            </div>
                                            <div className="flex flex-col overflow-hidden w-full">
                                                <span className="font-bold text-[0.9rem] text-slate-800 dark:text-slate-200 truncate leading-tight">{profile.companyName}</span>
                                                <span className="text-[0.75rem] font-medium text-slate-500 dark:text-slate-400 mt-1">MST: {profile.taxCode}</span>
                                            </div>
                                        </label>
                                    ))}

                                    <label className={`flex items-center gap-4 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${selectedVatId === 'new' ? 'border-red-500 bg-white dark:bg-slate-800 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-500/50 bg-white dark:bg-slate-800'}`}>
                                        <div className="relative flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 border-slate-300 dark:border-slate-600 shrink-0">
                                            <input 
                                                type="radio" 
                                                name="vatProfile" 
                                                value="new" 
                                                checked={selectedVatId === 'new'}
                                                onChange={() => setSelectedVatId('new')}
                                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                            />
                                            {selectedVatId === 'new' && <div className="w-[8px] h-[8px] rounded-full bg-red-500" />}
                                        </div>
                                        <span className="font-bold text-[0.9rem] text-slate-800 dark:text-slate-200 leading-tight">{t('Nhập thông tin mới')}</span>
                                    </label>

                                    {selectedVatId === 'new' && (
                                        <div className="flex flex-col gap-3 mt-3 animate-in slide-in-from-top-2 fade-in duration-300">
                                            <input type="text" value={vatCompanyName} onChange={e => setVatCompanyName(e.target.value)} placeholder={t('Tên công ty (*)')} className="w-full text-[0.9rem] font-medium p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                                            <input type="text" value={vatTaxCode} onChange={e => setVatTaxCode(e.target.value)} placeholder={t('Mã số thuế (*)')} className="w-full text-[0.9rem] font-medium p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                                            <input type="email" value={vatEmail} onChange={e => setVatEmail(e.target.value)} placeholder={t('Email nhận hoá đơn (*)')} className="w-full text-[0.9rem] font-medium p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                                            <input type="text" value={vatAddress} onChange={e => setVatAddress(e.target.value)} placeholder={t('Địa chỉ xuất HĐ (nếu có)')} className="w-full text-[0.9rem] font-medium p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder-slate-400 dark:placeholder-slate-500" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

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
                    </>
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

export default function BillPage() {
    return (
        <React.Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}><Loader2 className="animate-spin" /></div>}>
            <BillContent />
        </React.Suspense>
    );
}

