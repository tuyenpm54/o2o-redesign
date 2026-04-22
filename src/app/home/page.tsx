import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { Pricing } from '@/components/landing/Pricing';
import { ThemeToggle } from '@/components/ThemeToggle';
import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="bg-slate-50 dark:bg-[#0c0c0e] text-slate-500 dark:text-slate-400 min-h-screen selection:bg-slate-200 dark:selection:bg-white/20 selection:text-slate-900 dark:selection:text-white overflow-x-hidden font-sans relative transition-colors duration-300">

            {/* Subtle Minimalist Background */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] dark:opacity-[0.02] mix-blend-overlay" />
            </div>

            {/* Sleek Top Nav */}
            <header className="fixed top-0 left-0 right-0 z-50 h-[64px] bg-slate-50/80 dark:bg-[#0c0c0e]/80 backdrop-blur-2xl border-b border-black/[0.04] dark:border-white/[0.04] transition-all duration-300">
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#DF1B41] to-[#F56B0F] rounded-[10px] flex items-center justify-center text-white font-bold text-lg transition-transform shadow-[0_4px_12px_rgba(223,27,65,0.3)]">
                            O
                        </div>
                        <span className="text-[17px] font-semibold text-slate-900 dark:text-white tracking-tight">O2O<span className="text-slate-500 dark:text-slate-500 font-medium ml-0.5">ADMIN</span></span>
                    </div>

                    <nav className="hidden lg:flex items-center gap-8">
                        {['Tính năng', 'Giải pháp', 'Khách hàng', 'Bảng giá'].map((item) => (
                            <Link
                                key={item}
                                href={item === 'Bảng giá' ? '#pricing' : '#features'}
                                className="text-[13px] font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors tracking-wide"
                            >
                                {item}
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <Link href="/login" className="text-[13px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-2 transition-colors">Đăng nhập</Link>
                        <Link href="/admin/dashboard" className="px-5 py-2 bg-gradient-to-r from-[#DF1B41] to-[#F56B0F] text-white rounded-full text-[13px] font-bold hover:scale-105 transition-transform shadow-[0_4px_14px_rgba(223,27,65,0.3)]">
                            Bắt đầu ngay
                        </Link>
                    </div>
                </div>
            </header>

            <main className="relative z-10 pt-[64px]">
                <Hero />
                <Features />
                <Pricing />
            </main>

            {/* Minimalist Footer */}
            <footer className="py-20 border-t border-black/[0.04] dark:border-white/[0.04] bg-white dark:bg-[#0c0c0e] relative z-10 mt-10 transition-colors duration-300">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-2 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-300 rounded-[8px] flex items-center justify-center font-bold text-sm">O</div>
                                <span className="text-[15px] font-semibold text-slate-900 dark:text-white tracking-tight">O2O Cloud Solution</span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-500 max-w-sm text-[13px] leading-relaxed">
                                Nền tảng quản trị và phân tích dữ liệu chuyên sâu. <br/> Thiết kế trải nghiệm ẩm thực số cho nhà hàng hiện đại.
                            </p>
                        </div>

                        <div className="space-y-5">
                            <h4 className="text-[11px] font-semibold text-slate-900 dark:text-white uppercase tracking-widest">Sản phẩm</h4>
                            <ul className="space-y-3 text-[13px] font-medium text-slate-500 dark:text-slate-500">
                                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Tính năng</Link></li>
                                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Bảng điều khiển</Link></li>
                                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">API Docs</Link></li>
                            </ul>
                        </div>

                        <div className="space-y-5">
                            <h4 className="text-[11px] font-semibold text-slate-900 dark:text-white uppercase tracking-widest">Hỗ trợ</h4>
                            <ul className="space-y-3 text-[13px] font-medium text-slate-500 dark:text-slate-500">
                                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Trung tâm hỗ trợ</Link></li>
                                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Liên hệ</Link></li>
                                <li><Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Status</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-black/[0.04] dark:border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[12px] font-medium text-slate-400">&copy; 2026 TuyenPham. O2O Architecture.</p>
                        <div className="flex gap-8 text-[12px] font-medium text-slate-500">
                            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Bảo mật</Link>
                            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Điều khoản</Link>
                            <Link href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">Chính sách Cookie</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
