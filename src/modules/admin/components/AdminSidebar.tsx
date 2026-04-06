"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, MonitorSmartphone, Settings, LogOut, LayoutGrid, Terminal, UtensilsCrossed, Building2, CreditCard, UserCog, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserTierBadge } from '@/components/UserTierBadge';
import { useAuth } from '@/context/AuthContext';

export function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navLink = (href: string) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
            pathname?.startsWith(href)
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white bg-transparent hover:bg-slate-100/50 dark:hover:bg-white/5'
        }`;

    const handleLogout = async () => {
        await logout('/home');
    };

    return (
        <div className="w-64 h-full flex flex-col">
            <div className="p-6 border-b border-slate-200/50 dark:border-white/[0.05]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                        O
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">O2O<span className="text-blue-600 dark:text-blue-400 font-medium ml-0.5">ADMIN</span></span>
                </div>
                {/* Restaurant Name Badge — chỉ hiển thị cho quản lý nhà hàng */}
                {user?.restaurant_name ? (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200/60 dark:border-blue-500/20">
                        <Building2 size={13} className="text-blue-500 dark:text-blue-400 shrink-0" />
                        <span className="text-xs font-bold text-blue-700 dark:text-blue-300 truncate leading-tight" title={user.restaurant_name}>
                            {user.restaurant_name}
                        </span>
                    </div>
                ) : (
                    <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-200/60 dark:border-amber-500/20">
                        <Building2 size={13} className="text-amber-500 shrink-0" />
                        <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 truncate leading-tight">
                            Chưa liên kết cửa hàng
                        </span>
                    </div>
                )}
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <Link href="/admin/dashboard" className={navLink('/admin/dashboard')}>
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link href="/admin/menu" className={navLink('/admin/menu')}>
                    <UtensilsCrossed size={20} />
                    <span>Thực đơn nhà hàng</span>
                </Link>
                <Link href="/admin/display" className={navLink('/admin/display')}>
                    <MonitorSmartphone size={20} />
                    <span>Cấu hình hiển thị</span>
                </Link>
                
                <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-white/[0.05] flex flex-col gap-2">
                    <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Tính năng POS</span>
                    <Link href="/admin/tables" className={navLink('/admin/tables')}>
                        <LayoutGrid size={20} />
                        <span>Xác nhận - Thanh toán</span>
                    </Link>
                    <Link href="/admin/pos" className={navLink('/admin/pos')}>
                        <Terminal size={20} />
                        <span>KDS (Nhận bếp)</span>
                    </Link>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-white/[0.05] flex flex-col gap-2">
                    <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Thiết lập</span>
                    <Link href="/admin/settings/restaurant" className={navLink('/admin/settings/restaurant')}>
                        <Building2 size={20} />
                        <span>Thông tin cửa hàng</span>
                    </Link>
                    <Link href="/admin/settings/billing" className={navLink('/admin/settings/billing')}>
                        <CreditCard size={20} />
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

                <Link href="/account/settings" className="flex items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer group">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-blue-600 text-white flex items-center justify-center shrink-0 relative transition-transform group-hover:scale-105 shadow-sm">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-sm tracking-tighter">
                                {(user?.name || 'A').charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate leading-none">{user?.name || 'Quản trị viên'}</span>
                            <UserTierBadge tier={user?.tier} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                            <span className="truncate tracking-wide">{user?.phone || user?.email || 'Chưa cung cấp liên hệ'}</span>
                            {user?.tier !== 'ENTERPRISE' && (
                                <span className="font-bold text-blue-600 dark:text-blue-400 group-hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                    Nâng cấp &rarr;
                                </span>
                            )}
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
