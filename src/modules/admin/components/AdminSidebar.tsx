"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, MonitorSmartphone, Settings, LogOut, LayoutGrid, Terminal, UtensilsCrossed, Building2, CreditCard, UserCog, User, QrCode } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserTierBadge } from '@/components/UserTierBadge';
import { useAuth } from '@/context/AuthContext';

export function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navLink = (href: string) =>
        `flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-[13px] ${
            pathname?.startsWith(href)
                ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-semibold shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white font-medium'
        }`;

    const handleLogout = async () => {
        await logout('/home');
    };

    return (
        <div className="w-64 h-full flex flex-col">
            <div className="p-6 border-b border-slate-200/50 dark:border-white/[0.05]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 rounded-lg flex items-center justify-center text-white dark:text-slate-900 font-bold text-lg shadow-sm">
                        O
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">O2O<span className="text-slate-400 dark:text-slate-500 font-medium ml-0.5">ADMIN</span></span>
                </div>
                {/* Restaurant Name Badge — chỉ hiển thị cho quản lý nhà hàng */}
                {user?.restaurant_name ? (
                    <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                        <Building2 size={14} className="text-slate-400 shrink-0" />
                        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 truncate leading-tight" title={user.restaurant_name}>
                            {user.restaurant_name}
                        </span>
                    </div>
                ) : (
                    <div className="mt-4 flex items-center gap-2 px-3 py-2 bg-amber-50/50 dark:bg-amber-500/10 rounded-xl">
                        <Building2 size={14} className="text-amber-500 shrink-0" />
                        <span className="text-[12px] font-medium text-amber-600/80 dark:text-amber-400 truncate leading-tight">
                            Chưa liên kết cửa hàng
                        </span>
                    </div>
                )}
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <Link href="/admin/dashboard" className={navLink('/admin/dashboard')}>
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </Link>
                <Link href="/admin/menu" className={navLink('/admin/menu')}>
                    <UtensilsCrossed size={18} />
                    <span>Thực đơn nhà hàng</span>
                </Link>
                <Link href="/admin/qrcodes" className={navLink('/admin/qrcodes')}>
                    <QrCode size={18} />
                    <span>Quản lý mã QR</span>
                </Link>
                <Link href="/admin/display" className={navLink('/admin/display')}>
                    <MonitorSmartphone size={18} />
                    <span>Cấu hình hiển thị</span>
                </Link>
                
                <div className="pt-4 mt-2 flex flex-col gap-1">
                    <span className="px-3 text-xs font-semibold text-slate-500 mb-1.5 block">Tính năng POS</span>
                    <Link href="/admin/tables" className={navLink('/admin/tables')}>
                        <LayoutGrid size={18} />
                        <span>Xác nhận - Thanh toán</span>
                    </Link>
                    <Link href="/admin/pos" className={navLink('/admin/pos')}>
                        <Terminal size={18} />
                        <span>KDS (Nhận bếp)</span>
                    </Link>
                </div>

                <div className="pt-4 mt-2 flex flex-col gap-1">
                    <span className="px-3 text-xs font-semibold text-slate-500 mb-1.5 block">Thiết lập</span>
                    <Link href="/admin/settings/restaurant" className={navLink('/admin/settings/restaurant')}>
                        <Building2 size={18} />
                        <span>Thông tin cửa hàng</span>
                    </Link>
                    <Link href="/admin/settings/billing" className={navLink('/admin/settings/billing')}>
                        <CreditCard size={18} />
                        <span>Thanh toán</span>
                    </Link>
                </div>
            </nav>

            <div className="p-4 border-t border-slate-200/50 dark:border-white/[0.05] flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <Link href="/home" className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors cursor-pointer" title="Về trang chủ">
                            <Settings size={18} />
                        </Link>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer" title="Đăng xuất">
                        <LogOut size={18} />
                    </button>
                </div>

                <Link href="/account/settings" className="block p-2 -mx-2 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer group">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-sm">
                            {user?.avatar ? (
                                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover relative z-10" />
                            ) : (
                                <span className="font-bold text-sm tracking-tighter">
                                    {(user?.name || 'A').charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate leading-none">{user?.name || 'Quản trị viên'}</span>
                                <UserTierBadge tier={user?.tier} />
                            </div>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none truncate tracking-wide">{user?.phone || user?.email || 'Chưa cung cấp liên hệ'}</span>
                        </div>
                    </div>
                    
                    {/* Quota Progress - iCloud Storage Style */}
                    {user?.tier !== 'ENTERPRISE' && (
                        <div className="mt-2.5 ml-12 pr-1 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex items-end justify-between leading-none mb-1.5">
                                <span className="text-[11px] font-semibold text-slate-500">Cước O2O</span>
                                <span className="text-[11px] font-semibold text-slate-900 dark:text-white">842<span className="font-medium text-slate-400">/1.000</span></span>
                            </div>
                            <div className="w-full h-1 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-800 dark:bg-slate-400 w-[84.2%]" />
                            </div>
                        </div>
                    )}
                </Link>
            </div>
        </div>
    );
}
