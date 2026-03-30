'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Ticket, QrCode, X, Clock, Loader2 } from 'lucide-react';
import styles from '../page.module.css';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

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

function VouchersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from');
    const resid = searchParams.get('resid');
    const tableid = searchParams.get('tableid');
    const { user } = useAuth();
    const { t } = useLanguage();

    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const res = await fetch(`/api/vouchers${user?.id ? `?userId=${user.id}` : ''}`);
                if (res.ok) {
                    const data = await res.json();
                    setVouchers(data.vouchers || []);
                }
            } catch (err) {
                console.error('Failed to fetch vouchers:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchVouchers();
    }, [user?.id]);

    const handleBack = () => {
        if (from === 'checkout' && resid && tableid) {
            router.push(`/table-orders?resid=${resid}&tableid=${tableid}`);
        } else {
            router.back();
        }
    };

    const handleUseVoucher = async (voucher: Voucher) => {
        setSelectedVoucher(voucher);
    };

    const activeVouchers = vouchers.filter(v => v.status === 'active');
    const usedVouchers = vouchers.filter(v => v.status === 'used');

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <button className={styles.backBtn} onClick={handleBack}>
                        <ChevronLeft size={24} />
                    </button>
                    <h1 className={styles.pageTitle}>{t('Ưu đãi của tôi')}</h1>
                </div>
            </header>
            <main className={styles.main} style={{ padding: '1rem' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} color="#F97316" />
                    </div>
                ) : vouchers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94A3B8' }}>
                        <Ticket size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
                        <p style={{ fontWeight: 600 }}>{t('Bạn chưa có voucher nào')}</p>
                    </div>
                ) : (
                    <>
                        {activeVouchers.length > 0 && (
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {t('Chưa sử dụng')}
                                    <span style={{ background: '#FEF3C7', color: '#D97706', padding: '2px 8px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700 }}>
                                        {activeVouchers.length}
                                    </span>
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {activeVouchers.map(v => (
                                        <div key={v.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '14px', borderRadius: '16px',
                                            border: '1px solid #FDE68A', background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                                            cursor: 'pointer', transition: 'transform 0.15s'
                                        }} onClick={() => handleUseVoucher(v)}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 14,
                                                background: '#F59E0B', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <Ticket size={22} color="white" />
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#92400E' }}>{v.title}</div>
                                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#B45309', marginTop: 2 }}>
                                                    Mã: {v.code}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#A16207', marginTop: 4 }}>
                                                    <Clock size={11} />
                                                    <span>HSD: {v.expiry}</span>
                                                    {v.min_order > 0 && (
                                                        <span style={{ marginLeft: 8 }}>• Đơn từ {new Intl.NumberFormat('vi-VN').format(v.min_order)}đ</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                style={{
                                                    padding: '8px 14px', borderRadius: 99,
                                                    background: '#F59E0B', color: 'white',
                                                    border: 'none', fontWeight: 700, fontSize: '0.8rem',
                                                    cursor: 'pointer', flexShrink: 0
                                                }}
                                                onClick={(e) => { e.stopPropagation(); handleUseVoucher(v); }}
                                            >
                                                {t('Sử dụng')}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {usedVouchers.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94A3B8', marginBottom: '12px' }}>
                                    {t('Đã sử dụng')}
                                </h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', opacity: 0.5 }}>
                                    {usedVouchers.map(v => (
                                        <div key={v.id} style={{
                                            display: 'flex', alignItems: 'center', gap: '12px',
                                            padding: '14px', borderRadius: '16px',
                                            border: '1px solid #E2E8F0', background: '#F8FAFC'
                                        }}>
                                            <div style={{
                                                width: 44, height: 44, borderRadius: 14,
                                                background: '#CBD5E1', display: 'flex',
                                                alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                            }}>
                                                <Ticket size={22} color="white" />
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#64748B' }}>{v.title}</div>
                                                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8', marginTop: 2 }}>
                                                    Mã: {v.code}
                                                </div>
                                            </div>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8' }}>{t('Đã dùng')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* QR Code Modal */}
            {selectedVoucher && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px', animation: 'fadeIn 0.2s ease'
                }} onClick={() => setSelectedVoucher(null)}>
                    <div style={{
                        background: 'white', borderRadius: 24, padding: '32px 24px',
                        maxWidth: 340, width: '100%', textAlign: 'center',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                            onClick={() => setSelectedVoucher(null)}
                        >
                            <X size={20} />
                        </button>

                        <div style={{
                            width: 140, height: 140, margin: '0 auto 20px',
                            background: '#F8FAFC', borderRadius: 20,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            border: '2px dashed #E2E8F0'
                        }}>
                            <QrCode size={80} color="#1E293B" />
                        </div>

                        <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: 16 }}>
                            {t('Đưa mã này cho nhân viên để áp dụng')}
                        </p>

                        <div style={{
                            background: '#F1F5F9', borderRadius: 12, padding: '12px',
                            marginBottom: 16
                        }}>
                            <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>
                                {t('Mã voucher')}
                            </div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0F172A', letterSpacing: '0.1em' }}>
                                {selectedVoucher.code}
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1E293B', marginBottom: 4 }}>
                                {selectedVoucher.title}
                            </h4>
                            <p style={{ fontSize: '0.82rem', color: '#94A3B8' }}>
                                HSD: {selectedVoucher.expiry}
                            </p>
                        </div>

                        <button
                            style={{
                                width: '100%', padding: '14px', borderRadius: 14,
                                background: '#F1F5F9', border: 'none',
                                fontWeight: 700, fontSize: '0.95rem', color: '#475569',
                                cursor: 'pointer'
                            }}
                            onClick={() => setSelectedVoucher(null)}
                        >
                            {t('Đóng')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function VouchersPage() {
    return (
        <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>}>
            <VouchersContent />
        </Suspense>
    );
}
