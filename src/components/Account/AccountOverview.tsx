import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Award, ChevronRight, Ticket, Bell,
    UserCircle2, ClipboardList, QrCode, HelpCircle, ScrollText, LogOut, X, FileText, RefreshCw
} from 'lucide-react';
import QRCode from 'qrcode';
import styles from './AccountOverview.module.css';
import { UserData } from './PersonalInfoSection';

// ─── Milestone logic ──────────────────────────────────────────────────────────
const POINT_MILESTONES = [
    { points: 300,  label: 'đổi Voucher 30k',   type: 'voucher' },
    { points: 500,  label: 'lên hạng Bạc',       type: 'tier'    },
    { points: 700,  label: 'đổi Voucher 70k',   type: 'voucher' },
    { points: 1000, label: 'lên hạng Vàng',      type: 'tier'    },
    { points: 2000, label: 'lên hạng Kim cương', type: 'tier'    },
];

function getNextMilestone(pts: number) {
    const next = POINT_MILESTONES.find(m => m.points > pts);
    if (!next) return null;
    const prev = [...POINT_MILESTONES].reverse().find(m => m.points <= pts);
    const prevPts = prev ? prev.points : 0;
    const segmentProgress = Math.min(((pts - prevPts) / (next.points - prevPts)) * 100, 100);
    return { needed: next.points - pts, label: next.label, segmentProgress };
}

function getRedeemableVoucher(pts: number) {
    const eligible = POINT_MILESTONES.filter(m => m.type === 'voucher' && pts >= m.points);
    if (eligible.length === 0) return null;
    return eligible[eligible.length - 1];
}

// ─── Check-in code generation ─────────────────────────────────────────────────
const CHECKIN_TTL = 60; // seconds

function generateCheckinCode(userId: string): { pin: string; qrValue: string } {
    // Time slot changes every 60s — in real world this would be server-generated TOTP
    const timeSlot = Math.floor(Date.now() / (CHECKIN_TTL * 1000));
    const seed = `${userId}-${timeSlot}`;
    // Simple deterministic hash → 4-digit PIN
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
    }
    const pin = String(Math.abs(hash) % 10000).padStart(4, '0');
    const qrValue = `checkin:${userId}:${timeSlot}:${pin}`;
    return { pin, qrValue };
}

function getSecondsUntilNextSlot(): number {
    const now = Date.now();
    const slotMs = CHECKIN_TTL * 1000;
    return CHECKIN_TTL - Math.floor((now % slotMs) / 1000);
}

// ─── Check-in Modal ───────────────────────────────────────────────────────────
function CheckInModal({ userId, userName, onClose }: { userId: string; userName: string; onClose: () => void }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [code, setCode] = useState(() => generateCheckinCode(userId));
    const [secondsLeft, setSecondsLeft] = useState(getSecondsUntilNextSlot());
    const [isRefreshing, setIsRefreshing] = useState(false);

    const refresh = useCallback(() => {
        setIsRefreshing(true);
        const newCode = generateCheckinCode(userId);
        setCode(newCode);
        setSecondsLeft(getSecondsUntilNextSlot());
        setTimeout(() => setIsRefreshing(false), 400);
    }, [userId]);

    // Draw QR
    useEffect(() => {
        if (canvasRef.current) {
            QRCode.toCanvas(canvasRef.current, code.qrValue, {
                width: 200, margin: 2,
                color: { dark: '#0F172A', light: '#FFFFFF' },
            });
        }
    }, [code]);

    // Countdown + auto-refresh
    useEffect(() => {
        const iv = setInterval(() => {
            const s = getSecondsUntilNextSlot();
            setSecondsLeft(s);
            if (s === CHECKIN_TTL) refresh(); // new slot started
        }, 1000);
        return () => clearInterval(iv);
    }, [refresh]);

    // SVG ring constants
    const R = 22, STROKE = 3;
    const circ = 2 * Math.PI * R;
    const progress = secondsLeft / CHECKIN_TTL;
    const dashOffset = circ * (1 - progress);
    const ringColor = secondsLeft <= 10 ? '#EF4444' : secondsLeft <= 20 ? '#F59E0B' : '#10B981';

    return (
        <div
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(15,23,42,0.72)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                zIndex: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '20px',
            }}
            onClick={onClose}
        >
            <style>{`
                @keyframes ciModalIn { from { opacity:0; transform:scale(0.94) translateY(12px); } to { opacity:1; transform:scale(1) translateY(0); } }
                @keyframes spinOnce  { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
            `}</style>

            <div
                style={{
                    background: 'white',
                    borderRadius: 28,
                    padding: '28px 24px 24px',
                    width: '100%', maxWidth: 340,
                    textAlign: 'center',
                    position: 'relative',
                    boxShadow: '0 32px 80px rgba(15,23,42,0.25)',
                    animation: 'ciModalIn 0.25s cubic-bezier(0.32,0.72,0,1)',
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close */}
                <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: '#F1F5F9', border: 'none', cursor: 'pointer', width: 32, height: 32, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}>
                    <X size={16} />
                </button>

                {/* Header */}
                <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>Mã Check-in</p>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{userName}</h3>
                </div>

                {/* QR code */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <div style={{
                        padding: 14, borderRadius: 20,
                        border: '2px solid #F1F5F9',
                        background: '#FAFAFA',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                        opacity: isRefreshing ? 0.4 : 1,
                        transition: 'opacity 0.3s',
                    }}>
                        <canvas ref={canvasRef} style={{ borderRadius: 8, display: 'block' }} />
                    </div>
                </div>

                {/* PIN */}
                <div style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94A3B8', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Hoặc nhập mã</p>
                    <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                        {code.pin.split('').map((digit, i) => (
                            <div key={i} style={{
                                width: 52, height: 62,
                                background: '#F8FAFC',
                                border: '2px solid #E2E8F0',
                                borderRadius: 14,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.8rem', fontWeight: 900, color: '#0F172A',
                                fontVariantNumeric: 'tabular-nums',
                                letterSpacing: '-0.02em',
                                opacity: isRefreshing ? 0.3 : 1,
                                transition: 'opacity 0.3s',
                            }}>
                                {digit}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Countdown ring + text */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    {/* SVG ring timer */}
                    <svg width={52} height={52} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
                        <circle cx={26} cy={26} r={R} fill="none" stroke="#F1F5F9" strokeWidth={STROKE} />
                        <circle
                            cx={26} cy={26} r={R} fill="none"
                            stroke={ringColor} strokeWidth={STROKE}
                            strokeLinecap="round"
                            strokeDasharray={circ}
                            strokeDashoffset={dashOffset}
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
                        />
                        {/* Center text rotated back */}
                        <text x={26} y={26} textAnchor="middle" dominantBaseline="central"
                            style={{ transform: 'rotate(90deg)', transformOrigin: '26px 26px' }}
                            fill={ringColor} fontSize="13" fontWeight="900" fontFamily="system-ui">
                            {secondsLeft}
                        </text>
                    </svg>

                    <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.78rem', fontWeight: 700, color: '#475569', margin: '0 0 2px' }}>
                            {secondsLeft <= 10
                                ? <span style={{ color: '#EF4444' }}>Mã sắp hết hạn!</span>
                                : 'Tự động làm mới'}
                        </p>
                        <p style={{ fontSize: '0.68rem', color: '#94A3B8', margin: 0, fontWeight: 600 }}>sau {secondsLeft} giây</p>
                    </div>

                    {/* Manual refresh */}
                    <button
                        onClick={refresh}
                        style={{ marginLeft: 'auto', background: '#F1F5F9', border: 'none', borderRadius: 10, padding: '8px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
                        title="Làm mới mã"
                    >
                        <RefreshCw size={16} style={isRefreshing ? { animation: 'spinOnce 0.4s linear' } : {}} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface AccountOverviewProps {
    userData: UserData & { points: number; tier: string; preferences?: string[] };
    nextTierPoints: number;
    topRewards: any[];
    onNavigateToVouchers: () => void;
    onNavigateToRedeem: () => void;
    onNavigateToHistory: () => void;
    onNavigateToPersonalInfo: () => void;
    onNavigateToInvoices: () => void;
    onNavigateToVatInfo: () => void;
    onLogout?: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export const AccountOverview: React.FC<AccountOverviewProps> = ({
    userData,
    onNavigateToVouchers,
    onNavigateToRedeem,
    onNavigateToPersonalInfo,
    onNavigateToInvoices,
    onNavigateToVatInfo,
    onLogout,
}) => {
    const [showCheckin, setShowCheckin] = useState(false);
    const [notificationsOn, setNotificationsOn] = useState(true);

    const milestone = getNextMilestone(userData.points);
    const redeemableVoucher = getRedeemableVoucher(userData.points);

    const userId = (userData as any).id || userData.phone || 'guest';

    return (
        <div className={styles.container}>

            {/* ═══ BLOCK 1 — IDENTITY + STATUS ═══ */}
            <div className={styles.profileCard}>

                {/* Row: Avatar · Name · Phone · Check-in QR */}
                <div className={styles.profileTop}>
                    <div className={styles.avatar}>
                        {(userData as any).avatarUrl ? (
                            <img src={(userData as any).avatarUrl} alt={userData.name} className={styles.avatarImg} />
                        ) : (
                            <span className={styles.avatarInitial}>
                                {(userData.name || 'K').charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className={styles.profileInfo}>
                        <h2 className={styles.userName}>{userData.name || 'Khách hàng mới'}</h2>
                        <p className={styles.userPhone}>{userData.phone || 'Chưa cập nhật SĐT'}</p>
                    </div>
                    {/* Check-in QR button */}
                    <button
                        className={styles.qrIconBtn}
                        onClick={() => setShowCheckin(true)}
                        aria-label="Mã Check-in"
                    >
                        <QrCode size={16} />
                    </button>
                </div>

                <div className={styles.divider} />

                {/* Tier + Points */}
                <div className={styles.tierRow}>
                    <div className={styles.tierBadge}>
                        <Award size={14} />
                        <span>{userData.tier || 'Khách'}</span>
                    </div>
                    <span className={styles.pointsDisplay}>
                        {userData.points.toLocaleString()} <small>điểm</small>
                    </span>
                </div>

                {/* Progress toward nearest milestone */}
                <div className={styles.progressSection}>
                    <div className={styles.progressBar}>
                        <div
                            className={styles.progressFill}
                            style={{ width: `${milestone ? milestone.segmentProgress : 100}%` }}
                        />
                    </div>
                    {redeemableVoucher ? (
                        <p className={styles.progressNote}>
                            Bạn đủ điểm {redeemableVoucher.label}.&nbsp;
                            <button onClick={onNavigateToRedeem} className={styles.redeemInlineBtn}>Đổi ngay</button>
                        </p>
                    ) : (
                        <p className={styles.progressNote}>
                            {milestone
                                ? <>Còn <strong>{milestone.needed.toLocaleString()}</strong> điểm để {milestone.label}</>
                                : 'Bạn đã đạt hạng cao nhất!'}
                        </p>
                    )}
                </div>
            </div>

            {/* ═══ BLOCK 2 — QUICK NAV ═══ */}
            <div className={styles.quickActionsGrid}>
                <button className={styles.quickAction} onClick={onNavigateToInvoices}>
                    <div className={`${styles.quickActionIcon} ${styles.orange}`}><ClipboardList size={22} /></div>
                    <span className={styles.quickActionLabel}>Hoá đơn</span>
                </button>
                <button className={styles.quickAction} onClick={onNavigateToVouchers}>
                    <div className={`${styles.quickActionIcon} ${styles.pink}`}><Ticket size={22} /></div>
                    <span className={styles.quickActionLabel}>Voucher & Quà</span>
                </button>
                <button className={styles.quickAction} onClick={onNavigateToPersonalInfo}>
                    <div className={`${styles.quickActionIcon} ${styles.blue}`}><UserCircle2 size={22} /></div>
                    <span className={styles.quickActionLabel}>Cá nhân</span>
                </button>
            </div>

            {/* ═══ BLOCK 3 — SECONDARY SETTINGS ═══ */}
            <div className={styles.navSection}>
                <div className={styles.navCard}>
                    <button className={styles.navItem} onClick={onNavigateToVatInfo}>
                        <div className={`${styles.navIcon} ${styles.purple}`}><FileText size={18} /></div>
                        <span className={styles.navLabel}>Thông tin VAT</span>
                        <ChevronRight size={16} className={styles.navChevron} />
                    </button>
                    <button className={styles.navItem} onClick={() => setNotificationsOn(v => !v)}>
                        <div className={`${styles.navIcon} ${styles.red}`}><Bell size={18} /></div>
                        <span className={styles.navLabel}>Thông báo</span>
                        <div className={`${styles.toggleSwitch} ${notificationsOn ? styles.toggleOn : ''}`}>
                            <div className={styles.toggleKnob} />
                        </div>
                    </button>
                    <button className={styles.navItem} onClick={() => window.open('https://o2o.vn/help', '_blank')}>
                        <div className={`${styles.navIcon} ${styles.teal}`}><HelpCircle size={18} /></div>
                        <span className={styles.navLabel}>Trợ giúp</span>
                        <ChevronRight size={16} className={styles.navChevron} />
                    </button>
                    <button className={styles.navItem} onClick={() => window.open('https://o2o.vn/terms', '_blank')}>
                        <div className={`${styles.navIcon} ${styles.gray}`}><ScrollText size={18} /></div>
                        <span className={styles.navLabel}>Điều khoản</span>
                        <ChevronRight size={16} className={styles.navChevron} />
                    </button>
                </div>
            </div>

            {onLogout && (
                <button className={styles.logoutBtn} onClick={onLogout}>
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                </button>
            )}

            {/* ═══ Check-in Modal ═══ */}
            {showCheckin && (
                <CheckInModal
                    userId={userId}
                    userName={userData.name || 'Khách hàng'}
                    onClose={() => setShowCheckin(false)}
                />
            )}
        </div>
    );
};
