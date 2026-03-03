import React, { useState } from 'react';
import { Ticket, QrCode, X, Clock } from 'lucide-react';
import styles from './VoucherSection.module.css';

export interface Voucher {
    id: string;
    code: string;
    title: string;
    expiry: string;
    status: 'active' | 'used' | 'expired';
    qrValue: string;
}

interface VoucherSectionProps {
    vouchers: Voucher[];
}

export const VoucherSection: React.FC<VoucherSectionProps> = ({ vouchers }) => {
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

    return (
        <section className={styles.section}>
            <div className={styles.header}>
                <h3 className={styles.title}>Voucher của tôi</h3>
                <div className={styles.badge}>{vouchers.length}</div>
            </div>

            <div className={styles.list}>
                {vouchers.map(voucher => (
                    <div
                        key={voucher.id}
                        className={styles.voucherCard}
                        onClick={() => setSelectedVoucher(voucher)}
                    >
                        <div className={styles.cardLeft}>
                            <div className={styles.iconBox}>
                                <Ticket size={20} color="#fff" />
                            </div>
                        </div>
                        <div className={styles.cardRight}>
                            <h4 className={styles.voucherTitle}>{voucher.title}</h4>
                            <div className={styles.voucherMeta}>
                                <Clock size={12} />
                                <span>HSD: {voucher.expiry}</span>
                            </div>
                            <span className={`${styles.statusBadge} ${styles[voucher.status]}`}>
                                {voucher.status === 'active' ? 'Chưa dùng' : 'Đã dùng'}
                            </span>
                        </div>
                        <div className={styles.qrCorner}>
                            <QrCode size={16} color="#6b7280" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Detail Modal */}
            {selectedVoucher && (
                <div className={styles.modalOverlay} onClick={() => setSelectedVoucher(null)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <button className={styles.closeBtn} onClick={() => setSelectedVoucher(null)}>
                            <X size={20} />
                        </button>

                        <div className={styles.modalHeader}>
                            <h3 className={styles.modalTitle}>Chi tiết Voucher</h3>
                        </div>

                        <div className={styles.modalBody}>
                            <div className={styles.qrContainer}>
                                {/* Placeholder for QR Code */}
                                <div className={styles.qrPlaceholder}>
                                    <QrCode size={120} color="#1f2937" />
                                </div>
                                <p className={styles.qrInstruction}>Đưa mã này cho nhân viên để áp dụng</p>
                            </div>

                            <div className={styles.codeDisplay}>
                                <span className={styles.codeLabel}>Mã voucher</span>
                                <span className={styles.codeValue}>{selectedVoucher.code}</span>
                            </div>

                            <div className={styles.voucherInfo}>
                                <h4 className={styles.infoTitle}>{selectedVoucher.title}</h4>
                                <p className={styles.infoExpiry}>Hết hạn: {selectedVoucher.expiry}</p>
                            </div>

                            <button className={styles.useBtn}>Dùng ngay</button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
