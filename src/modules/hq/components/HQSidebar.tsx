"use client";

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Building2, Users, CreditCard, LogOut, Settings, UserCog, User } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserTierBadge } from '@/components/UserTierBadge';
import { useAuth } from '@/context/AuthContext';

export function HQSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const navLink = (href: string) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-semibold ${
            pathname?.startsWith(href)
                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-white bg-transparent hover:bg-slate-100/50 dark:hover:bg-white/5'
        }`;

    const handleLogout = async () => {
        await logout('/home');
    };

    return (
        <div className="w-64 h-full flex flex-col bg-slate-50/50 dark:bg-[#0a0a16]/50">
            <div className="p-6 border-b border-slate-200/50 dark:border-white/[0.05]">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-800 to-slate-900 border border-amber-500/30 rounded-lg flex items-center justify-center text-amber-400 font-bold text-lg shadow-lg shadow-amber-500/10">
                        H
                    </div>
                    <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">O2O<span className="text-amber-500 font-medium ml-0.5">HQ</span></span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <Link href="/hq/dashboard" className={navLink('/hq/dashboard')}>
                    <LayoutDashboard size={20} />
                    <span>Tổng quan</span>
                </Link>
                <Link href="/hq/restaurants" className={navLink('/hq/restaurants')}>
                    <Building2 size={20} />
                    <span>Danh sách cửa hàng</span>
                </Link>
                <Link href="/hq/accounts" className={navLink('/hq/accounts')}>
                    <Users size={20} />
                    <span>Tài khoản & Phân quyền</span>
                </Link>
                <Link href="/hq/billing" className={navLink('/hq/billing')}>
                    <CreditCard size={20} />
                    <span>Thanh toán</span>
                </Link>
                <div className="pt-4 mt-4 border-t border-slate-200/50 dark:border-white/[0.05]">
                    <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Thiết lập</span>
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
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-amber-500 text-white flex items-center justify-center shrink-0 relative transition-transform group-hover:scale-105 shadow-sm">
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-sm tracking-tighter">
                                {(user?.name || 'H').charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-900 dark:text-white truncate leading-none">{user?.name || 'Quản lý Chuỗi (HQ)'}</span>
                            <UserTierBadge tier={user?.tier} />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-none">
                            <span className="truncate tracking-wide">{user?.phone || user?.email || 'Chưa cung cấp liên hệ'}</span>
                            {user?.tier !== 'ENTERPRISE' && (
                                <span className="font-bold text-amber-600 dark:text-amber-500 group-hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
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
