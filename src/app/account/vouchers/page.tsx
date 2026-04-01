'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ChevronLeft, Ticket, QrCode, X, Clock, Loader2,
    Copy, Check, Gift, AlertCircle, Lock, Star, ArrowRight, CheckCircle2, Zap
} from 'lucide-react';
import QRCode from 'qrcode';
import styles from '../page.module.css';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Voucher {
    id: string;
    code: string;
    title: string;
    discount_type: string;
    discount_value: number;
    min_order: number;
    expiry: string;
    status: 'active' | 'upcoming' | 'expired' | 'used';
    qr_value: string;
    description?: string;
}

interface RewardCatalogItem {
    id: string;
    title: string;
    description: string;
    pointsRequired: number;
    discountType: 'fixed' | 'percent' | 'bogo';
    discountValue: number;
    badge?: string;        // e.g. "Phổ biến", "Mới"
    minOrder?: number;
    isAvailable: boolean;  // based on user's current points
}

// ─── Mock reward catalog (in production: fetch from /api/rewards/catalog) ─────
const REWARD_CATALOG: Omit<RewardCatalogItem, 'isAvailable'>[] = [
    { id: 'r1', title: 'Giảm 30.000đ',  description: 'Áp dụng cho mọi đơn',          pointsRequired: 300,  discountType: 'fixed',   discountValue: 30000,  minOrder: 0,      badge: 'Phổ biến' },
    { id: 'r2', title: 'Giảm 70.000đ',  description: 'Đơn từ 200.000đ trở lên',      pointsRequired: 700,  discountType: 'fixed',   discountValue: 70000,  minOrder: 200000 },
    { id: 'r3', title: 'Giảm 10%',       description: 'Tối đa 50.000đ',               pointsRequired: 500,  discountType: 'percent', discountValue: 10,     minOrder: 100000, badge: 'Hot' },
    { id: 'r4', title: 'Giảm 20%',       description: 'Đơn từ 300.000đ, tối đa 100k', pointsRequired: 1000, discountType: 'percent', discountValue: 20,     minOrder: 300000 },
    { id: 'r5', title: 'Mua 1 tặng 1',   description: 'Áp dụng cho 1 món bất kỳ',    pointsRequired: 800,  discountType: 'bogo',    discountValue: 0,      minOrder: 0,      badge: 'Giới hạn' },
    { id: 'r6', title: 'Giảm 150.000đ', description: 'Đơn từ 500.000đ trở lên',      pointsRequired: 1500, discountType: 'fixed',   discountValue: 150000, minOrder: 500000 },
];

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    active:   { label: 'Có thể sử dụng',      color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', iconBg: '#10B981', gradient: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' },
    upcoming: { label: 'Chưa tới thời gian',  color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', iconBg: '#F59E0B', gradient: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)' },
    expired:  { label: 'Đã hết hạn',          color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', iconBg: '#EF4444', gradient: 'linear-gradient(135deg, #FFF5F5, #FEE2E2)' },
    used:     { label: 'Đã sử dụng',          color: '#94A3B8', bg: '#F8FAFC', border: '#E2E8F0', iconBg: '#CBD5E1', gradient: 'linear-gradient(135deg, #F8FAFC, #F1F5F9)' },
};

const STATUS_ORDER: Voucher['status'][] = ['active', 'upcoming', 'expired', 'used'];
const STATUS_SECTION_LABELS: Record<string, string> = {
    active: 'Có thể sử dụng', upcoming: 'Chưa tới thời gian',
    expired: 'Đã hết hạn', used: 'Đã sử dụng',
};

// ─── Points → Cash Voucher ────────────────────────────────────────────────────
const CASH_PRESETS = [10, 20, 50];
const POINT_RATE = 1000; // 1 điểm = 1.000đ

function PointsToCashSection({
    userPoints, onRedeemedCash,
}: { userPoints: number; onRedeemedCash: (code: string) => void }) {
    const [customInput, setCustomInput] = useState('');
    const [selected, setSelected] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const pts = selected !== null ? selected : (parseInt(customInput) || 0);
    const value = pts * POINT_RATE;
    const canRedeem = pts > 0 && pts <= userPoints;

    const handlePreset = (p: number) => { setSelected(p); setCustomInput(''); setErrorMsg(''); };
    const handleCustom = (v: string) => { setCustomInput(v.replace(/\D/g, '')); setSelected(null); setErrorMsg(''); };

    const handleRedeem = async () => {
        if (!canRedeem) {
            setErrorMsg(pts > userPoints
                ? `Bạn chỉ có ${userPoints} điểm, không đủ để đổi ${pts} điểm`
                : 'Vui lòng chọn hoặc nhập số điểm muốn đổi');
            return;
        }
        setIsLoading(true); setErrorMsg('');
        try {
            await new Promise(r => setTimeout(r, 900));
            const code = `CASH${pts}K${Date.now().toString().slice(-4)}`;
            setSelected(null); setCustomInput('');
            onRedeemedCash(code);
        } catch { setErrorMsg('Có lỗi xảy ra, vui lòng thử lại'); }
        finally { setIsLoading(false); }
    };

    return (
        <div style={{ background: 'white', border: '1.5px solid #E2E8F0', borderRadius: 18, overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, #0F172A, #1E293B)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Zap size={16} color="#F59E0B" fill="#F59E0B" />
                <div>
                    <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>Quy đổi điểm thành tiền</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>1 điểm = 1.000đ — không giới hạn mức đổi</p>
                </div>
            </div>
            <div style={{ padding: '16px' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px' }}>Chọn nhanh</p>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {CASH_PRESETS.map(p => {
                        const enough = userPoints >= p;
                        const active = selected === p;
                        return (
                            <button key={p} onClick={() => enough && handlePreset(p)} disabled={!enough}
                                style={{ flex: 1, padding: '10px 4px', borderRadius: 12, border: active ? '2px solid #0F172A' : '1.5px solid #E2E8F0', background: active ? '#0F172A' : enough ? '#F8FAFC' : '#F1F5F9', cursor: enough ? 'pointer' : 'not-allowed', textAlign: 'center', transition: 'all 0.15s' }}>
                                <div style={{ fontSize: '1.05rem', fontWeight: 900, color: active ? 'white' : enough ? '#0F172A' : '#CBD5E1' }}>{p}</div>
                                <div style={{ fontSize: '0.6rem', fontWeight: 700, color: active ? '#94A3B8' : enough ? '#64748B' : '#CBD5E1' }}>điểm</div>
                                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: active ? '#F59E0B' : enough ? '#F97316' : '#CBD5E1', marginTop: 2 }}>{(p * POINT_RATE).toLocaleString()}đ</div>
                            </button>
                        );
                    })}
                </div>

                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>Hoặc nhập số điểm</p>
                <div style={{ position: 'relative' }}>
                    <input type="number" min="1" max={userPoints} value={customInput}
                        onChange={e => handleCustom(e.target.value)}
                        placeholder={`Tối đa ${userPoints} điểm`}
                        style={{ width: '100%', padding: '11px 90px 11px 14px', borderRadius: 12, fontSize: '0.9rem', fontWeight: 700, border: `1.5px solid ${errorMsg ? '#FECACA' : (selected === null && customInput) ? '#0F172A' : '#E2E8F0'}`, background: '#F8FAFC', color: '#0F172A', outline: 'none', boxSizing: 'border-box' }}
                    />
                    {pts > 0 && (
                        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', fontWeight: 800, color: '#F97316', pointerEvents: 'none' }}>
                            = {value.toLocaleString()}đ
                        </span>
                    )}
                </div>

                {errorMsg && <p style={{ fontSize: '0.75rem', color: '#EF4444', fontWeight: 600, margin: '6px 0 0' }}>{errorMsg}</p>}

                {pts > 0 && canRedeem && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F0FDF4', border: '1.5px solid #A7F3D0', borderRadius: 12, padding: '12px 14px', marginTop: 12 }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#059669', fontWeight: 700 }}>Đổi {pts} điểm nhận</p>
                            <p style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0F172A' }}>Voucher giảm {value.toLocaleString()}đ</p>
                        </div>
                        <button onClick={handleRedeem} disabled={isLoading}
                            style={{ padding: '10px 18px', background: isLoading ? '#94A3B8' : 'linear-gradient(135deg, #059669, #10B981)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: '0.85rem', cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                            {isLoading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <><Zap size={14} /> Đổi ngay</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Voucher Details / QR Modal ───────────────────────────────────────────────
function VoucherQRModal({ voucher, initialTab = 'use', onClose }: { voucher: Voucher; initialTab?: 'use' | 'details'; onClose: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [copied, setCopied] = useState(false);
    const [tab, setTab] = useState<'use' | 'details'>(initialTab);

    useEffect(() => {
        if (tab === 'use' && canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, voucher.qr_value || voucher.code, {
                width: 200, margin: 2, color: { dark: '#0F172A', light: '#FFFFFF' },
            });
        }
    }, [voucher, tab]);

    const handleCopy = async () => {
        try { await navigator.clipboard.writeText(voucher.code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
    };

    const cfg = STATUS_CONFIG[voucher.status];

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(6px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'vFadeIn 0.2s ease' }} onClick={onClose}>
            <style>{`@keyframes vFadeIn{from{opacity:0}to{opacity:1}} @keyframes vZoomIn{from{transform:scale(0.95);opacity:0}to{transform:scale(1);opacity:1}}`}</style>
            <div style={{ background: 'white', borderRadius: 28, padding: '24px', maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(15,23,42,0.15)', position: 'relative', animation: 'vZoomIn 0.2s cubic-bezier(0.32,0.72,0,1)' }} onClick={e => e.stopPropagation()}>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 6, background: '#F8FAFC', padding: 4, borderRadius: 14, marginBottom: 24 }}>
                    <button onClick={() => setTab('use')} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: tab === 'use' ? 'white' : 'transparent', color: tab === 'use' ? '#0F172A' : '#64748B', fontWeight: 800, fontSize: '0.88rem', border: 'none', boxShadow: tab === 'use' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Sử dụng
                    </button>
                    <button onClick={() => setTab('details')} style={{ flex: 1, padding: '10px 0', borderRadius: 10, background: tab === 'details' ? 'white' : 'transparent', color: tab === 'details' ? '#0F172A' : '#64748B', fontWeight: 800, fontSize: '0.88rem', border: 'none', boxShadow: tab === 'details' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none', cursor: 'pointer', transition: 'all 0.2s' }}>
                        Chi tiết
                    </button>
                    {/* Close x */}
                    <button onClick={onClose} style={{ width: 40, background: 'transparent', border: 'none', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={18} /></button>
                </div>

                {tab === 'use' ? (
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>{voucher.title}</h3>
                        <div style={{ display: 'inline-block', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 99, padding: '3px 10px', fontSize: '0.72rem', fontWeight: 700, marginBottom: 20 }}>{cfg.label}</div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                            <div style={{ padding: 12, borderRadius: 20, border: '2px solid #F1F5F9', background: '#FAFAFA', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
                                <canvas ref={canvasRef} style={{ borderRadius: 8, display: 'block' }} />
                            </div>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: 16 }}>Đưa mã này cho nhân viên để áp dụng</p>
                        <div style={{ background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: 14, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '0.68rem', color: '#94A3B8', fontWeight: 600, marginBottom: 3 }}>MÃ VOUCHER</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', letterSpacing: '0.12em' }}>{voucher.code}</div>
                            </div>
                            <button onClick={handleCopy} style={{ background: copied ? '#059669' : '#0F172A', color: 'white', border: 'none', cursor: 'pointer', borderRadius: 10, padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, transition: 'background 0.2s', flexShrink: 0 }}>
                                {copied ? <><Check size={14} /> Đã copy</> : <><Copy size={14} /> Copy</>}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', marginBottom: 16 }}>Chi tiết chương trình</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <h4 style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Thời hạn</h4>
                                <p style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 600, margin: 0 }}>Có giá trị đến hết {voucher.expiry}</p>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Điều kiện áp dụng</h4>
                                <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.9rem', color: '#0F172A', fontWeight: 500, lineHeight: 1.5 }}>
                                    {voucher.min_order > 0 && <li>Áp dụng cho đơn hàng từ {new Intl.NumberFormat('vi-VN').format(voucher.min_order)}đ.</li>}
                                    <li>Chưa bao gồm phụ phí giao hàng (nếu có).</li>
                                    <li>Mỗi đơn hàng chỉ áp dụng 1 mã duy nhất.</li>
                                    {voucher.description && <li>{voucher.description}</li>}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ fontSize: '0.8rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Cửa hàng áp dụng</h4>
                                <p style={{ fontSize: '0.9rem', color: '#0F172A', fontWeight: 500, margin: 0 }}>Toàn hệ thống nhà hàng</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Redeem Confirm Modal ──────────────────────────────────────────────────────
function RedeemConfirmModal({
    reward, userPoints, onConfirm, onClose, isRedeeming
}: {
    reward: RewardCatalogItem;
    userPoints: number;
    onConfirm: () => void;
    onClose: () => void;
    isRedeeming: boolean;
}) {
    const remaining = userPoints - reward.pointsRequired;
    const discountLabel = reward.discountType === 'fixed'
        ? `-${new Intl.NumberFormat('vi-VN').format(reward.discountValue)}đ`
        : reward.discountType === 'percent' ? `-${reward.discountValue}%` : 'Mua 1 tặng 1';

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', animation: 'vFadeIn 0.2s ease' }} onClick={onClose}>
            <style>{`@keyframes vFadeIn{from{opacity:0}to{opacity:1}} @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
            <div style={{ background: 'white', borderRadius: '28px 28px 0 0', padding: '28px 24px 40px', width: '100%', maxWidth: 480, boxShadow: '0 -20px 60px rgba(15,23,42,0.15)', animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)' }} onClick={e => e.stopPropagation()}>
                {/* Handle */}
                <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E2E8F0', margin: '0 auto 24px' }} />

                {/* Reward summary */}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '2px solid #A7F3D0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                        <Gift size={28} color="#059669" />
                    </div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px' }}>{reward.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', margin: 0 }}>{reward.description}</p>
                    <div style={{ display: 'inline-block', marginTop: 10, background: '#ECFDF5', color: '#059669', border: '1px solid #A7F3D0', borderRadius: 99, padding: '4px 14px', fontSize: '1rem', fontWeight: 900 }}>{discountLabel}</div>
                </div>

                {/* Point transaction */}
                <div style={{ background: '#F8FAFC', borderRadius: 16, padding: '16px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Điểm hiện tại</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F97316' }}>{userPoints.toLocaleString()} điểm</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Điểm cần dùng</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#DC2626' }}>−{reward.pointsRequired.toLocaleString()} điểm</span>
                    </div>
                    <div style={{ height: 1, background: '#E2E8F0', margin: '0 0 12px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Điểm còn lại</span>
                        <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#059669' }}>{remaining.toLocaleString()} điểm</span>
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={onConfirm}
                    disabled={isRedeeming}
                    style={{ width: '100%', padding: '15px', background: isRedeeming ? '#94A3B8' : 'linear-gradient(135deg, #059669, #10B981)', color: 'white', border: 'none', borderRadius: 16, fontWeight: 800, fontSize: '1rem', cursor: isRedeeming ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12, transition: 'all 0.2s' }}>
                    {isRedeeming ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Đang xử lý...</> : <><CheckCircle2 size={18} /> Xác nhận đổi {reward.pointsRequired.toLocaleString()} điểm</>}
                </button>
                <button onClick={onClose} style={{ width: '100%', padding: '13px', background: 'none', border: '1.5px solid #E2E8F0', borderRadius: 16, fontWeight: 700, fontSize: '0.9rem', color: '#64748B', cursor: 'pointer' }}>Huỷ</button>
            </div>
        </div>
    );
}

// ─── Redeem Success Modal ──────────────────────────────────────────────────────
function RedeemSuccessModal({ voucherCode, onGoToVouchers }: { voucherCode: string; onGoToVouchers: () => void }) {
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <div style={{ background: 'white', borderRadius: '28px 28px 0 0', padding: '32px 24px 48px', width: '100%', maxWidth: 480, textAlign: 'center' }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: '#E2E8F0', margin: '0 auto 28px' }} />
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #059669, #10B981)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 12px 32px rgba(16,185,129,0.35)' }}>
                    <CheckCircle2 size={36} color="white" />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>Đổi điểm thành công!</h3>
                <p style={{ color: '#64748B', fontSize: '0.88rem', margin: '0 0 6px' }}>Voucher đã được thêm vào ví của bạn.</p>
                <div style={{ background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: 12, padding: '10px 16px', display: 'inline-block', margin: '4px 0 28px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0F172A', letterSpacing: '0.1em' }}>{voucherCode}</span>
                </div>
                <button
                    onClick={onGoToVouchers}
                    style={{ width: '100%', padding: '15px', background: 'linear-gradient(135deg, #059669, #10B981)', color: 'white', border: 'none', borderRadius: 16, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    Xem voucher của tôi <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}

// ─── Reward Catalog Card ───────────────────────────────────────────────────────
function RewardCard({ reward, onRedeem }: { reward: RewardCatalogItem; onRedeem: (r: RewardCatalogItem) => void }) {
    const discountLabel = reward.discountType === 'fixed'
        ? `−${new Intl.NumberFormat('vi-VN').format(reward.discountValue)}đ`
        : reward.discountType === 'percent' ? `−${reward.discountValue}%` : 'Mua 1 tặng 1';

    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            background: reward.isAvailable ? 'white' : '#F8FAFC',
            border: reward.isAvailable ? '1.5px solid #A7F3D0' : '1.5px solid #E2E8F0',
            borderRadius: 16, padding: '14px',
            opacity: reward.isAvailable ? 1 : 0.7,
            boxShadow: reward.isAvailable ? '0 2px 10px rgba(16,185,129,0.08)' : 'none',
            transition: 'all 0.15s',
        }}>
            {/* Discount badge */}
            <div style={{
                width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                background: reward.isAvailable ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)' : '#F1F5F9',
                border: reward.isAvailable ? '1.5px solid #A7F3D0' : '1.5px solid #E2E8F0',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
            }}>
                <Gift size={18} color={reward.isAvailable ? '#059669' : '#94A3B8'} />
                <span style={{ fontSize: '0.6rem', fontWeight: 900, color: reward.isAvailable ? '#059669' : '#94A3B8', lineHeight: 1, textAlign: 'center' }}>{discountLabel}</span>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: reward.isAvailable ? '#0F172A' : '#64748B' }}>{reward.title}</span>
                    {reward.badge && (
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, background: reward.isAvailable ? '#059669' : '#94A3B8', color: 'white', borderRadius: 99, padding: '1px 6px' }}>{reward.badge}</span>
                    )}
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '0 0 6px', fontWeight: 600 }}>{reward.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} fill={reward.isAvailable ? '#F59E0B' : '#CBD5E1'} color={reward.isAvailable ? '#F59E0B' : '#CBD5E1'} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: reward.isAvailable ? '#F59E0B' : '#94A3B8' }}>{reward.pointsRequired.toLocaleString()} điểm</span>
                </div>
            </div>

            {/* CTA */}
            <button
                onClick={() => reward.isAvailable && onRedeem(reward)}
                disabled={!reward.isAvailable}
                style={{
                    padding: '9px 14px', flexShrink: 0,
                    background: reward.isAvailable ? '#059669' : '#F1F5F9',
                    color: reward.isAvailable ? 'white' : '#94A3B8',
                    border: 'none', borderRadius: 12, fontWeight: 800,
                    fontSize: '0.78rem', cursor: reward.isAvailable ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap', transition: 'all 0.15s',
                }}>
                {reward.isAvailable ? 'Đổi ngay' : <Lock size={14} />}
            </button>
        </div>
    );
}

// ─── Voucher Card ──────────────────────────────────────────────────────────────
function VoucherCard({ voucher, onUse }: { voucher: Voucher; onUse: (v: Voucher, tab: 'use' | 'details') => void }) {
    const cfg = STATUS_CONFIG[voucher.status];
    const isActive = voucher.status === 'active';
    const isUpcoming = voucher.status === 'upcoming';
    const isDisabled = !isActive;

    const discountLabel = voucher.discount_type === 'fixed'
        ? `-${new Intl.NumberFormat('vi-VN').format(voucher.discount_value)}đ`
        : voucher.discount_type === 'percent' ? `-${voucher.discount_value}%` : '1+1';

    return (
        <div onClick={() => onUse(voucher, 'details')} style={{ position: 'relative', display: 'flex', borderRadius: 18, border: `1.5px solid ${cfg.border}`, background: isDisabled ? cfg.bg : 'white', overflow: 'hidden', opacity: voucher.status === 'used' ? 0.65 : 1, boxShadow: isActive ? '0 2px 14px rgba(16,185,129,0.06)' : 'none', cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
            {/* Left Box (Value + Icon) */}
            <div style={{ width: 88, flexShrink: 0, background: cfg.gradient, borderRight: `2.5px dashed ${cfg.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '16px 0' }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: cfg.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {voucher.discount_type === 'bogo' ? <Gift size={22} color="white" /> : <Ticket size={22} color="white" />}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 900, color: cfg.iconBg, textAlign: 'center', lineHeight: 1.1, padding: '0 6px' }}>{discountLabel}</span>
            </div>

            {/* Right Box (Details) */}
            <div style={{ flex: 1, padding: '16px', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 4 }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: isDisabled ? '#64748B' : '#0F172A', lineHeight: 1.3 }}>{voucher.title}</div>
                    <div style={{ flexShrink: 0 }}>
                        {isActive ? (
                            <button onClick={(e) => { e.stopPropagation(); onUse(voucher, 'use'); }} style={{ padding: '8px 12px', background: '#059669', color: 'white', border: 'none', borderRadius: 10, fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(5,150,105,0.2)' }}>
                                <QrCode size={14} /> Sử dụng
                            </button>
                        ) : isUpcoming ? (
                            <div style={{ padding: '6px 10px', background: '#FEF3C7', color: '#D97706', borderRadius: 10, fontWeight: 700, fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}><Lock size={12} /> Sắp mở</div>
                        ) : (
                            <div style={{ padding: '6px 10px', background: '#F1F5F9', color: '#94A3B8', borderRadius: 10, fontWeight: 700, fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}><AlertCircle size={12} /> {voucher.status === 'used' ? 'Đã dùng' : 'Hết hạn'}</div>
                        )}
                    </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.02em', marginBottom: 8 }}>Mã: {voucher.code}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 8px', borderRadius: 99 }}>{cfg.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, marginBottom: 4 }}>
                    <Clock size={12} /> HSD: {voucher.expiry}
                </div>
                {voucher.min_order > 0 && <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>Đơn tối thiểu: {new Intl.NumberFormat('vi-VN').format(voucher.min_order)}đ</div>}
            </div>
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
function VouchersContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const from = searchParams.get('from');
    const resid = searchParams.get('resid');
    const tableid = searchParams.get('tableid');
    const { user } = useAuth();
    const { t } = useLanguage();

    // Tab: 'mine' = Voucher của tôi, 'redeem' = Đổi điểm
    const [activeTab, setActiveTab] = useState<'mine' | 'redeem'>(
        searchParams.get('tab') === 'redeem' ? 'redeem' : 'mine'
    );
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeVoucher, setActiveVoucher] = useState<{ data: Voucher, tab: 'use' | 'details' } | null>(null);

    // Redeem flow state
    const [selectedReward, setSelectedReward] = useState<RewardCatalogItem | null>(null);
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemedVoucherCode, setRedeemedVoucherCode] = useState<string | null>(null);

    const userPoints = user?.points || 0;

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const res = await fetch(`/api/vouchers${user?.id ? `?userId=${user.id}` : ''}`);
                if (res.ok) { const data = await res.json(); setVouchers(data.vouchers || []); }
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        fetchVouchers();
    }, [user?.id]);

    const handleBack = () => {
        if (from === 'checkout' && resid && tableid) router.push(`/table-orders?resid=${resid}&tableid=${tableid}`);
        else router.back();
    };

    // Compute catalog with availability
    const catalog: RewardCatalogItem[] = REWARD_CATALOG.map(r => ({
        ...r, isAvailable: userPoints >= r.pointsRequired
    })).sort((a, b) => a.pointsRequired - b.pointsRequired);

    // Redeem flow
    const handleConfirmRedeem = async () => {
        if (!selectedReward) return;
        setIsRedeeming(true);
        try {
            // TODO: real API call — POST /api/rewards/redeem { rewardId, userId }
            await new Promise(r => setTimeout(r, 1200)); // simulate
            const mockCode = `RDM${Date.now().toString().slice(-6)}`;
            setRedeemedVoucherCode(mockCode);
            setSelectedReward(null);
        } catch (e) { console.error(e); }
        finally { setIsRedeeming(false); }
    };

    const handleGoToMyVouchers = async () => {
        setRedeemedVoucherCode(null);
        setActiveTab('mine');
        // Re-fetch to show new voucher
        setIsLoading(true);
        try {
            const res = await fetch(`/api/vouchers${user?.id ? `?userId=${user.id}` : ''}`);
            if (res.ok) { const data = await res.json(); setVouchers(data.vouchers || []); }
        } catch (e) { console.error(e); }
        finally { setIsLoading(false); }
    };

    const grouped = STATUS_ORDER.reduce((acc, status) => {
        const group = vouchers.filter(v => v.status === status);
        if (group.length > 0) acc[status] = group;
        return acc;
    }, {} as Record<string, Voucher[]>);

    const activeCount = vouchers.filter(v => v.status === 'active').length;
    const availableRewardCount = catalog.filter(r => r.isAvailable).length;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <button className={styles.backBtn} onClick={handleBack}><ChevronLeft size={24} /></button>
                    <h1 className={styles.pageTitle}>Voucher & Quà</h1>
                </div>
            </header>

            {/* Tab bar */}
            <div style={{ display: 'flex', padding: '0 16px 0', gap: 8, borderBottom: '1px solid #F1F5F9' }}>
                <button
                    onClick={() => setActiveTab('mine')}
                    style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: activeTab === 'mine' ? '#059669' : '#94A3B8', borderBottom: `2px solid ${activeTab === 'mine' ? '#059669' : 'transparent'}`, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Ticket size={15} /> Voucher của tôi
                    {activeCount > 0 && <span style={{ background: '#059669', color: 'white', borderRadius: 99, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 800 }}>{activeCount}</span>}
                </button>
                <button
                    onClick={() => setActiveTab('redeem')}
                    style={{ flex: 1, padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, color: activeTab === 'redeem' ? '#F59E0B' : '#94A3B8', borderBottom: `2px solid ${activeTab === 'redeem' ? '#F59E0B' : 'transparent'}`, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Star size={15} /> Đổi điểm
                    {availableRewardCount > 0 && <span style={{ background: '#F59E0B', color: 'white', borderRadius: 99, padding: '1px 7px', fontSize: '0.68rem', fontWeight: 800 }}>{availableRewardCount}</span>}
                </button>
            </div>

            <main className={styles.main} style={{ padding: '16px' }}>
                {/* ── TAB 1: Voucher của tôi ── */}
                {activeTab === 'mine' && (
                    <>
                        {isLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} color="#059669" />
                                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
                            </div>
                        ) : vouchers.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94A3B8' }}>
                                <Ticket size={52} style={{ marginBottom: 16, opacity: 0.3 }} />
                                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8 }}>{t('Bạn chưa có voucher nào')}</p>
                                <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: 20 }}>Voucher sẽ xuất hiện sau khi thanh toán hoặc đổi điểm</p>
                                <button onClick={() => setActiveTab('redeem')} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #F59E0B, #F97316)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                                    <Star size={15} /> Đổi điểm ngay
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                {STATUS_ORDER.map(status => {
                                    const group = grouped[status];
                                    if (!group) return null;
                                    const cfg = STATUS_CONFIG[status];
                                    return (
                                        <div key={status}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                                <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: cfg.color, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{STATUS_SECTION_LABELS[status]}</h3>
                                                <span style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, borderRadius: 99, padding: '1px 8px', fontSize: '0.72rem', fontWeight: 800 }}>{group.length}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                {group.map(v => <VoucherCard key={v.id} voucher={v} onUse={(v, tab) => setActiveVoucher({ data: v, tab })} />)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {/* ── TAB 2: Đổi điểm ── */}
                {activeTab === 'redeem' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Points balance banner */}
                        <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)', border: '1.5px solid #FDE68A', borderRadius: 16, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div>
                                <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 2px' }}>Điểm của tôi</p>
                                <p style={{ fontSize: '1.6rem', fontWeight: 900, color: '#F97316', margin: 0, lineHeight: 1 }}>{userPoints.toLocaleString()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.72rem', color: '#B45309', fontWeight: 600, margin: '0 0 2px' }}>Hệ số quy đổi</p>
                                <p style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>1 điểm = 1.000đ</p>
                            </div>
                        </div>

                        {/* ── Cash conversion section ── */}
                        <PointsToCashSection
                            userPoints={userPoints}
                            onRedeemedCash={code => setRedeemedVoucherCode(code)}
                        />

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Hoặc đổi lấy quà</span>
                            <div style={{ flex: 1, height: 1, background: '#F1F5F9' }} />
                        </div>

                        {/* Gift catalog */}
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                {catalog.map(r => <RewardCard key={r.id} reward={r} onRedeem={setSelectedReward} />)}
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* Modals */}
            {activeVoucher && <VoucherQRModal voucher={activeVoucher.data} initialTab={activeVoucher.tab} onClose={() => setActiveVoucher(null)} />}
            {selectedReward && !redeemedVoucherCode && (
                <RedeemConfirmModal
                    reward={selectedReward}
                    userPoints={userPoints}
                    onConfirm={handleConfirmRedeem}
                    onClose={() => setSelectedReward(null)}
                    isRedeeming={isRedeeming}
                />
            )}
            {redeemedVoucherCode && <RedeemSuccessModal voucherCode={redeemedVoucherCode} onGoToVouchers={handleGoToMyVouchers} />}
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
