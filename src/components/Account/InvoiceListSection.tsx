'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ChevronRight, Calendar, MapPin, ShoppingBag, X } from 'lucide-react';
import styles from './InvoiceListSection.module.css';

interface Invoice {
    id: string;
    resid: string;
    tableid: string;
    startedAt: number;
    endedAt: number;
    total: number;
    itemCount: number;
}

interface InvoiceListSectionProps {
    limit?: number;
    showViewAll?: boolean;
    onViewAll?: () => void;
}

const formatDateTime = (timestamp: number) => {
    const d = new Date(timestamp);
    const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    const date = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    return { time, date };
};

const formatDuration = (start: number, end: number) => {
    const mins = Math.round((end - start) / 60000);
    if (mins < 60) return `${mins} phút`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h${remainMins > 0 ? remainMins : ''}`;
};

export const InvoiceListSection: React.FC<InvoiceListSectionProps> = ({
    limit,
    showViewAll = false,
    onViewAll,
}) => {
    const router = useRouter();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await fetch('/api/account/invoices');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setInvoices(data.data?.invoices || []);
            } catch (err) {
                setError('Không thể tải hoá đơn');
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, []);

    const displayInvoices = limit ? invoices.slice(0, limit) : invoices;

    if (loading) {
        return (
            <section className={styles.section}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Hoá đơn</h3>
                </div>
                <div className={styles.skeletonList}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className={styles.skeletonRow}>
                            <div className={styles.skeletonIcon} />
                            <div className={styles.skeletonContent}>
                                <div className={styles.skeletonLine} />
                                <div className={styles.skeletonLineShort} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className={styles.section}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Hoá đơn</h3>
                </div>
                <div className={styles.errorState}>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()}>Thử lại</button>
                </div>
            </section>
        );
    }

    if (invoices.length === 0) {
        return (
            <section className={styles.section}>
                <div className={styles.header}>
                    <h3 className={styles.title}>Hoá đơn</h3>
                </div>
                <div className={styles.emptyState}>
                    <FileText size={40} strokeWidth={1.5} />
                    <p>Chưa có hoá đơn nào</p>
                    <span>Hoá đơn sẽ xuất hiện sau khi bạn thanh toán bữa ăn</span>
                    <button className={styles.orderNowBtn} onClick={() => router.push('/customer')}>
                        Gọi món ngay
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h3 className={styles.title}>Hoá đơn</h3>
                {showViewAll && invoices.length > (limit || 0) && (
                    <button className={styles.viewAllBtn} onClick={onViewAll}>
                        Xem tất cả <ChevronRight size={14} />
                    </button>
                )}
            </div>

            <div className={styles.list}>
                {displayInvoices.map((inv) => {
                    const end = formatDateTime(inv.endedAt);
                    const duration = formatDuration(inv.startedAt, inv.endedAt);
                    return (
                        <button
                            key={inv.id}
                            className={styles.invoiceRow}
                            onClick={() => setSelectedInvoice(inv)}
                        >
                            <div className={styles.invoiceIcon}>
                                <FileText size={18} />
                            </div>
                            <div className={styles.invoiceContent}>
                                <div className={styles.invoiceMain}>
                                    <span className={styles.invoiceDate}>{end.date}</span>
                                    <span className={styles.invoiceTotal}>
                                        {inv.total.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                                <div className={styles.invoiceMeta}>
                                    <span><MapPin size={12} /> Bàn {inv.tableid}</span>
                                    <span><ShoppingBag size={12} /> {inv.itemCount} món</span>
                                    <span><Calendar size={12} /> {duration}</span>
                                </div>
                            </div>
                            <ChevronRight size={16} className={styles.chevron} />
                        </button>
                    );
                })}
            </div>

            {/* Invoice Detail Bottom Sheet */}
            {selectedInvoice && (
                <div className={styles.sheetOverlay} onClick={() => setSelectedInvoice(null)}>
                    <div className={styles.sheet} onClick={e => e.stopPropagation()}>
                        <div className={styles.sheetHeader}>
                            <h3>Chi tiết hoá đơn</h3>
                            <button className={styles.sheetClose} onClick={() => setSelectedInvoice(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className={styles.sheetBody}>
                            <div className={styles.sheetInfo}>
                                <div className={styles.sheetInfoRow}>
                                    <span>Ngày</span>
                                    <strong>{formatDateTime(selectedInvoice.endedAt).date}</strong>
                                </div>
                                <div className={styles.sheetInfoRow}>
                                    <span>Giờ vào</span>
                                    <strong>{formatDateTime(selectedInvoice.startedAt).time}</strong>
                                </div>
                                <div className={styles.sheetInfoRow}>
                                    <span>Giờ thanh toán</span>
                                    <strong>{formatDateTime(selectedInvoice.endedAt).time}</strong>
                                </div>
                                <div className={styles.sheetInfoRow}>
                                    <span>Bàn</span>
                                    <strong>{selectedInvoice.tableid}</strong>
                                </div>
                                <div className={styles.sheetInfoRow}>
                                    <span>Số món</span>
                                    <strong>{selectedInvoice.itemCount}</strong>
                                </div>
                                <div className={`${styles.sheetInfoRow} ${styles.totalRow}`}>
                                    <span>Tổng tiền</span>
                                    <strong>{selectedInvoice.total.toLocaleString('vi-VN')}đ</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
