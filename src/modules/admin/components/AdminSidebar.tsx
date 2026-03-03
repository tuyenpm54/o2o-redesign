"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, MonitorSmartphone, Settings, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AdminSidebar() {
    const router = useRouter();

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        router.push('/home');
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
            </div>

            <nav className="flex-1 p-4 space-y-2">
                <Link href="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white bg-transparent hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-xl transition-all font-semibold">
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>
                <Link href="/admin/display" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-white bg-transparent hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-xl transition-all font-semibold">
                    <MonitorSmartphone size={20} />
                    <span>Cấu hình hiển thị</span>
                </Link>
            </nav>

            <div className="p-4 border-t border-slate-200/50 dark:border-white/[0.05] space-y-3">
                <div className="flex justify-between items-center px-3 mb-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Giao diện</span>
                    <ThemeToggle />
                </div>

                <Link href="/home" className="flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent hover:bg-slate-100/50 dark:hover:bg-white/5 rounded-xl transition-all text-sm font-semibold">
                    <Settings size={18} />
                    <span>Về trang chủ</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-red-500/80 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold"
                >
                    <LogOut size={18} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}
