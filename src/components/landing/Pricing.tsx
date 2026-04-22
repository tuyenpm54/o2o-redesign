import Link from 'next/link';
import { Sparkles } from 'lucide-react';

const plans = [
    {
        name: 'Gói Dùng Thử',
        price: '0đ',
        originalPrice: '99k',
        discountLabel: 'Miễn phí Tháng Đầu',
        period: '',
        desc: 'Trải nghiệm tổng quan sức mạnh của hệ thống O2O Assistant cơ bản.',
        features: [
            'Gợi ý gọi món cơ bản',
            'Đồng bộ dữ liệu tĩnh',
            'Kiểm đồ tiêu chuẩn',
            'Giới hạn giao dịch'
        ],
        cta: 'Bắt đầu dùng ngay',
        highlight: false,
    },
    {
        name: 'Gói Premium',
        price: '149k',
        originalPrice: '299k',
        discountLabel: 'Giảm 50%',
        period: '/tháng',
        desc: 'Mở khóa toàn bộ dữ liệu phân tích và trợ lý thông minh tại bàn.',
        features: [
            'O2O Assistant Premium',
            'Không giới hạn băng thông',
            'Truyền tải POS & KDS thời gian thực',
            'Báo cáo & Phân tích Đa chiều'
        ],
        cta: 'Đăng ký Premium',
        highlight: true,
    },
    {
        name: 'Gói Chuỗi',
        price: 'Tùy chỉnh',
        period: '',
        desc: 'Dành riêng cho doanh nghiệp đa chi nhánh. Kiến trúc máy chủ độc lập.',
        features: [
            'Bản quyền Giao diện Độc quyền',
            'Phân quyền Chi nhánh HQ',
            'Tích hợp Hệ Sinh Thái thứ 3',
            'Kỹ thuật hỗ trợ 24/7 chuyên biệt'
        ],
        cta: 'Liên hệ Tư vấn',
        highlight: false,
    }
];

export function Pricing() {
    return (
        <section id="pricing" className="py-24 md:py-32 relative bg-slate-50 dark:bg-[#0c0c0e] transition-colors duration-300 overflow-hidden">
            {/* Ambient Glow from DESIGN.md */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-[#DF1B41]/10 to-[#F56B0F]/10 dark:from-[#DF1B41]/20 dark:to-[#F56B0F]/20 blur-[100px] rounded-[100%] pointer-events-none z-0" />

            <div className="container mx-auto px-6 relative z-10">

                <div className="text-center max-w-2xl mx-auto mb-20 relative">
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#DF1B41] mb-4">
                        Chi Phí Rõ Ràng
                    </h2>
                    <h3 className="text-[40px] md:text-[52px] font-medium text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6">
                        Đầu tư thông minh cho <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DF1B41] to-[#F56B0F] font-bold">Sự chuyên nghiệp.</span>
                    </h3>
                </div>

                <div className="flex flex-col lg:flex-row items-stretch justify-center gap-6 max-w-[1100px] mx-auto">
                    {plans.map((p, i) => (
                        <div
                            key={i}
                            className={`flex flex-col p-8 md:p-10 rounded-[36px] transition-all duration-300 relative w-full lg:w-[340px] group ${p.highlight
                                ? 'bg-slate-900 dark:bg-[#111115] border-[2px] border-[#DF1B41]/30 dark:border-white/10 text-white shadow-[0_30px_60px_rgba(223,27,65,0.15)] transform lg:-translate-y-4'
                                : 'bg-white/80 dark:bg-[#1A1A1F]/80 backdrop-blur-xl border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white shadow-[0_10px_40px_rgba(0,0,0,0.03)]'
                                }`}
                        >
                            {/* Popular/Highlight Badge */}
                            {p.highlight && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#DF1B41] to-[#F56B0F] text-white text-[11px] font-bold uppercase tracking-widest py-1.5 px-4 rounded-full flex items-center gap-1.5 shadow-lg shadow-red-500/30">
                                    <Sparkles size={12} fill="white" /> Phổ Biến Nhất
                                </div>
                            )}

                            <div className="mb-4 flex-1">
                                <h4 className={`text-[20px] font-bold tracking-tight mb-3 ${p.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{p.name}</h4>
                                <p className={`text-[14px] font-medium leading-relaxed mb-8 h-[42px] ${p.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{p.desc}</p>
                                
                                {/* Pronounced Pricing Area */}
                                <div className="flex flex-col justify-end h-[100px] mb-4">
                                    {p.originalPrice && (
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[18px] font-bold ${p.highlight ? 'text-slate-500' : 'text-slate-400'} line-through decoration-[#DF1B41] decoration-[3px] opacity-80`}>
                                                {p.originalPrice}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-[8px] text-[11px] font-bold tracking-wider uppercase ${p.highlight ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-red-50 dark:bg-red-500/10 text-[#DF1B41] border border-red-100 dark:border-red-500/20'}`}>
                                                {p.discountLabel}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-[56px] font-bold tracking-tighter leading-none ${p.highlight ? 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400' : 'text-[#DF1B41]'}`}>
                                            {p.price}
                                        </span>
                                        {p.period && <span className={`text-[15px] font-bold ml-1 ${p.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{p.period}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 mb-10 pt-6 border-t border-slate-100 dark:border-white/10">
                                {p.features.map((f, j) => (
                                    <div key={j} className="flex items-start gap-4">
                                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${p.highlight ? 'bg-[#DF1B41]' : 'bg-[#DF1B41]'}`} />
                                        <span className={`text-[15px] font-medium leading-snug ${p.highlight ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>{f}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Vibrant CTAs */}
                            <Link
                                href="/login"
                                className={`flex items-center justify-center w-full py-4 rounded-full font-bold text-[15px] transition-all duration-300 shadow-sm ${p.highlight
                                    ? 'bg-gradient-to-r from-[#DF1B41] to-[#F56B0F] text-white hover:scale-[1.02] active:scale-[0.98] shadow-[0_10px_25px_rgba(223,27,65,0.4)]'
                                    : 'bg-white dark:bg-[#1A1A1F] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                {p.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
