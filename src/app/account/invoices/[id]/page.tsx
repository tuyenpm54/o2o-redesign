"use client";

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Receipt, Phone, MapPin, Smile, Frown, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import styles from './page.module.css';

interface InvoiceDetail {
    invoice: {
        id: string;
        resid: string;
        tableid: string;
        startedAt: number;
        endedAt: number;
        total: number;
        subtotal: number;
        vatAmount: number;
        rating_type?: 'happy' | 'unhappy';
    };
    restaurant: {
        name: string;
        address: string;
        phone: string;
    };
    user: {
        name: string;
        phone: string;
    };
    items: any[];
    vat?: any;
}

interface VATProfile {
    id: string;
    companyName: string;
    taxCode: string;
}

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<InvoiceDetail | null>(null);
    const [vatProfiles, setVatProfiles] = useState<VATProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [showVatModal, setShowVatModal] = useState(false);
    const [localRating, setLocalRating] = useState<'happy' | 'unhappy' | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/account/invoices/${id}`);
                const result = await res.json();
                if (result.success) {
                    setData(result.data);
                    // Mock local rating from data if it exists
                    if (result.data.invoice.rating_type) {
                        setLocalRating(result.data.invoice.rating_type);
                    }
                }

                // Fetch VAT profiles for the modal
                const vatRes = await fetch('/api/account/vat');
                const vatData = await vatRes.json();
                if (vatData.success) {
                    setVatProfiles(vatData.data.profiles);
                }
            } catch (err) {
                console.error("Fetch detail error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleRate = (type: 'happy' | 'unhappy') => {
        setLocalRating(type);
        // In real app, call PATCH /api/account/invoices/[id] to save rating
    };

    const handleSelectVAT = (profileId: string) => {
        if (!data) return;
        setData({
            ...data,
            vat: { id: profileId, status: 'CONNECTED' }
        });
        setShowVatModal(false);
        // In real app, call POST /api/account/invoices/[id]/vat to save
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.skeletonReceipt} />
            </div>
        );
    }

    if (!data) return null;

    const { invoice, restaurant, items, user, vat } = data;
    const dateStr = new Date(invoice.endedAt).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
    const timeStr = new Date(invoice.endedAt).toLocaleTimeString('vi-VN', {
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className={styles.container}>
            <button className={styles.backButton} onClick={() => router.back()}>
                <ChevronLeft size={20} /> Quay lại lịch sử
            </button>

            {/* 📜 DIGITAL RECEIPT */}
            <div className={styles.receipt}>
                {/* 1. Header */}
                <div className={styles.receiptHeader}>
                    <h1 className={styles.restaurantName}>{restaurant.name}</h1>
                    <div className={styles.restaurantMeta}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                            <MapPin size={10} /> {restaurant.address}
                        </div>
                    </div>
                </div>

                {/* 2. Info Grid */}
                <div className={styles.receiptInfo}>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Ngày tháng</span>
                        <span className={styles.infoValue}>{dateStr} {timeStr}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Số bàn</span>
                        <span className={styles.infoValue}>{invoice.tableid}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Khách hàng</span>
                        <span className={styles.infoValue}>{user.name}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.infoLabel}>Mã số đơn</span>
                        <span className={styles.infoValue}>#{invoice.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                </div>

                {/* 3. Items List */}
                <div style={{ marginBottom: '1.5rem' }}>
                    {items.map((item, idx) => (
                        <div key={idx} className={styles.itemRow}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8' }}>{item.qty}x</span>
                                <div className={styles.itemNameCol}>
                                    <span className={styles.itemName}>{item.name}</span>
                                    {item.selections?.length > 0 && (
                                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                            {item.selections.map((s: any) => s.name).join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={styles.itemPriceCol}>
                                {(item.price * item.qty).toLocaleString('vi-VN')}đ
                            </div>
                        </div>
                    ))}
                </div>

                {/* 4. Totals */}
                <div className={styles.totalsSection}>
                    <div className={styles.totalRow}>
                        <span className={styles.totalLabel}>Tạm tính</span>
                        <span className={styles.totalValue}>{invoice.subtotal.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className={`${styles.totalRow} ${styles.grandTotalRow}`}>
                        <span className={styles.grandTotalLabel}>TỔNG CỘNG</span>
                        <span className={styles.grandTotalValue}>{invoice.total.toLocaleString('vi-VN')}đ</span>
                    </div>
                </div>

                {/* 🧠 5. NEW ACTIONS: FEEDBACK & VAT */}
                <div className={styles.receiptActions}>
                    <div className={styles.actionHeading}>Trải nghiệm của quý khách?</div>
                    
                    <div className={styles.feedbackRow}>
                        <button 
                            className={`${styles.feedbackBtn} ${localRating === 'happy' ? styles.activeSmile : ''}`}
                            onClick={() => handleRate('happy')}
                        >
                            <Smile size={36} strokeWidth={localRating === 'happy' ? 2.5 : 1.5} />
                            <span className={styles.feedbackLabel}>Hài lòng</span>
                        </button>
                        
                        <button 
                            className={`${styles.feedbackBtn} ${localRating === 'unhappy' ? styles.activeFrown : ''}`}
                            onClick={() => handleRate('unhappy')}
                        >
                            <Frown size={36} strokeWidth={localRating === 'unhappy' ? 2.5 : 1.5} />
                            <span className={styles.feedbackLabel}>Chưa tốt</span>
                        </button>
                    </div>

                    <div className={styles.vatSection}>
                        {vat ? (
                            <div className={styles.vatBadge}>
                                <CheckCircle2 size={14} /> Hoá đơn VAT đã được yêu cầu
                            </div>
                        ) : (
                            <button className={styles.vatTrigger} onClick={() => setShowVatModal(true)}>
                                <div className={styles.vatIcon}><FileText size={16} /></div>
                                <div className={styles.vatInfo}>
                                    <span className={styles.vatTitle}>Lấy hoá đơn VAT</span>
                                    <span className={styles.vatDesc}>Yêu cầu ghi nhận thông tin thuế</span>
                                </div>
                                <ChevronRight size={14} color="#94a3b8" />
                            </button>
                        )}
                    </div>
                </div>

                {/* 6. Footer */}
                <div className={styles.receiptFooter}>
                    <p className={styles.thankYou}>HẸN GẶP LẠI QUÝ KHÁCH</p>
                    <p className={styles.footerNote}>Hoá đơn điện tử được cung cấp bởi O2O Việt Nam</p>
                    <p className={styles.footerNote}>{new Date().toLocaleString()}</p>
                </div>
            </div>

            {/* VAT SELECTION SHEET */}
            {showVatModal && (
                <div className={styles.overlay} onClick={() => setShowVatModal(false)}>
                    <div className={styles.bottomSheet} onClick={e => e.stopPropagation()}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '1rem', fontWeight: 800 }}>Chọn thông tin VAT</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {vatProfiles.length > 0 ? (
                                vatProfiles.map(profile => (
                                    <button 
                                        key={profile.id} 
                                        style={{ padding: '14px', border: '1px solid #f1f5f9', borderRadius: '12px', background: 'white', textAlign: 'left' }}
                                        onClick={() => handleSelectVAT(profile.id)}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{profile.companyName}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>MST: {profile.taxCode}</div>
                                    </button>
                                ))
                            ) : (
                                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '1.5rem' }}>
                                    Bạn chưa có thông tin VAT nào.
                                </p>
                            )}
                            <button 
                                onClick={() => setShowVatModal(false)}
                                style={{ marginTop: '10px', padding: '14px', borderRadius: '12px', background: '#f1f5f9', fontWeight: 800, color: '#111827' }}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
