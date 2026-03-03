import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="bg-slate-50 dark:bg-[#050510] text-slate-600 dark:text-slate-300 min-h-screen selection:bg-blue-500/20 dark:selection:bg-blue-500/30 selection:text-blue-900 dark:selection:text-white overflow-x-hidden font-sans relative transition-colors duration-300">

            {/* Dynamic Vibrant Background Blobs for Glassmorphism */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 dark:bg-blue-600/20 blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[30%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-blue-500/20 dark:bg-blue-900/30 blur-[150px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] dark:opacity-[0.02] mix-blend-overlay" />
            </div>

            {/* Glassmorphic Top Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-white/60 dark:bg-[#050510]/40 backdrop-blur-2xl border-b border-slate-200/50 dark:border-white/[0.08] shadow-sm transition-all duration-300">
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                            O
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">O2O<span className="text-blue-600 dark:text-blue-400 font-medium tracking-tighter ml-0.5">ADMIN</span></span>
                    </div>

                    <nav className="hidden lg:flex items-center gap-10">
                        {['Tính năng', 'Giải pháp', 'Khách hàng', 'Bảng giá'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Bảng giá' ? '#pricing' : '#features'}
                                className="text-[14px] font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/login" className="text-[14px] font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white px-2 sm:px-4 py-2 transition-colors">Đăng nhập</Link>
                        <Link href="/admin/dashboard" className="px-4 sm:px-5 py-2.5 bg-slate-900 dark:bg-white/10 hover:bg-slate-800 dark:hover:bg-white/20 text-white rounded-lg border border-transparent dark:border-white/10 text-[14px] font-bold backdrop-blur-md transition-all active:scale-95 shadow-lg shadow-slate-900/10 dark:shadow-black/20">
                            Bắt đầu ngay
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-[72px]">
                <Hero />
                <Features />
                <Pricing />
            </main>

            {/* Glassmorphic Footer */}
            <footer className="py-20 border-t border-slate-200/50 dark:border-white/[0.08] bg-white/40 dark:bg-[#050510]/60 backdrop-blur-xl relative z-10 mt-20 transition-colors duration-300">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 rounded-lg flex items-center justify-center font-bold">O</div>
                                <span className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">O2O Cloud Solution</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm leading-relaxed">
                                Nền tảng quản trị và phân tích dữ liệu chuyên sâu, thiết kế trải nghiệm ẩm thực số cho nhà hàng hiện đại.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Sản phẩm</h4>
                            <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tính năng</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Bảng điều khiển</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">API Docs</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-widest">Hỗ trợ</h4>
                            <ul className="space-y-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Trung tâm cứu trợ</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Liên hệ</Link></li>
                                <li><Link href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Status</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200/50 dark:border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-xs font-medium text-slate-500">&copy; 2026 O2O ADMIN. BẢN QUYỀN TRỰC THUỘC.</p>
                        <div className="flex gap-8 text-xs font-semibold text-slate-600 dark:text-slate-500">
                            <Link href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Bảo mật</Link>
                            <Link href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Điều khoản</Link>
                            <Link href="#" className="hover:text-slate-900 dark:hover:text-slate-300 transition-colors">Cookie</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
