import Link from 'next/link';
import { Check, Zap, Star, ShieldCheck } from 'lucide-react';

const plans = [
    {
        name: 'Gói Dùng Thử',
        price: '0đ',
        originalPrice: '99k',
        period: '',
        desc: 'Trải nghiệm sức mạnh của nhân viên O2O thông minh ngay hôm nay.',
        features: [
            'Gợi ý món ăn cơ bản',
            'Đồng bộ trạng thái tĩnh',
            'Kiểm đồ tiêu chuẩn',
            'Giao diện mặc định',
            'Giới hạn bàn/lượt khách'
        ],
        cta: 'Bắt đầu sử dụng',
        highlight: false,
        icon: <ShieldCheck size={20} className="text-slate-500" />
    },
    {
        name: 'Gói Premium',
        price: '149k',
        originalPrice: '299k',
        period: '/tháng',
        desc: 'Giải pháp hoàn hảo cho nhà hàng muốn tối ưu trải nghiệm và doanh thu.',
        features: [
            'Tất cả tính năng bản Dùng thử',
            'AI Gợi ý món ăn thông minh',
            'Đồng bộ POS & KDS tức thời',
            'Giao diện tuỳ chỉnh nâng cao',
            'Phân tích & Thống kê doanh thu',
            'Hỗ trợ kỹ thuật 24/7'
        ],
        cta: 'Nâng cấp Premium',
        highlight: true,
        icon: <Zap size={20} className="text-yellow-400" />
    },
    {
        name: 'Gói Ultra',
        price: 'Tuỳ chỉnh',
        period: '',
        desc: 'Dành cho chuỗi doanh nghiệp, cần thiết kế riêng biệt và độ ổn định tuyệt đối.',
        features: [
            'Mọi tính năng Premium',
            'Phí tuỳ chỉnh giao diện 1 lần',
            'Phí duy trì 399k / tháng',
            'Triển khai các tính năng riêng',
            'Kiến trúc Server độc lập',
            'Đội ngũ hỗ trợ chuyên trách'
        ],
        cta: 'Liên hệ tư vấn',
        highlight: false,
        icon: <Star size={20} className="text-indigo-400" />
    }
];

export function Pricing() {
    return (
        <section id="pricing" className="py-32 relative overflow-hidden transition-colors duration-300">
            <div className="container mx-auto px-6 relative z-10">

                <div className="text-center max-w-2xl mx-auto mb-20">
                    <div className="inline-flex items-center px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md mb-8 transition-colors">
                        <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 font-sans">Giá cả linh hoạt</h2>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6 font-sans italic transition-colors">
                        Đầu tư thông minh cho <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">Trải nghiệm đỉnh cao</span>
                    </h3>
                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed transition-colors">
                        Đăng ký ngay trong tháng này để nhận ưu đãi Gạch Giá hấp dẫn nhất.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {plans.map((p, i) => (
                        <div
                            key={i}
                            className={`relative p-10 rounded-[2.5rem] border transition-all duration-500 backdrop-blur-2xl overflow-hidden ${p.highlight
                                ? 'bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white/[0.04] dark:to-white/[0.02] border-slate-800 dark:border-blue-500/30 text-white shadow-2xl dark:shadow-[0_0_60px_rgba(59,130,246,0.15)] scale-100 md:scale-[1.05] z-10'
                                : 'bg-white/60 dark:bg-white/[0.015] border-slate-200 dark:border-white/[0.05] text-slate-900 dark:text-white hover:bg-white dark:hover:bg-white/[0.03] shadow-lg dark:shadow-none'
                                }`}
                        >
                            {p.highlight && (
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600/20 dark:bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 dark:text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                                        <Zap size={14} className="fill-blue-300" />
                                        Hot nhất
                                    </div>
                                </div>
                            )}

                            <div className="mb-8">
                                <div className="flex items-center gap-3 mb-4">
                                    {p.icon}
                                    <h4 className={`text-xl font-bold font-sans tracking-tight ${p.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{p.name}</h4>
                                </div>
                                <div className="mt-6 flex flex-col justify-start">
                                    {p.originalPrice && (
                                        <div className="text-lg font-bold text-slate-400 line-through decoration-red-500 decoration-2 mb-1">
                                            {p.originalPrice}
                                        </div>
                                    )}
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-5xl font-black tracking-tighter drop-shadow-sm ${p.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{p.price}</span>
                                        {p.period && <span className={`text-sm font-bold uppercase tracking-widest ml-2 ${p.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{p.period}</span>}
                                    </div>
                                </div>
                                <p className={`mt-6 text-sm font-medium leading-relaxed min-h-[60px] ${p.highlight ? 'text-blue-100/80' : 'text-slate-500 dark:text-slate-400'}`}>{p.desc}</p>
                            </div>

                            <div className={`space-y-4 mb-10 pt-8 border-t ${p.highlight ? 'border-white/10' : 'border-slate-200 dark:border-white/5'}`}>
                                {p.features.map((f, j) => (
                                    <div key={j} className="flex items-center gap-4">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${p.highlight
                                            ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                            : 'bg-blue-50 dark:bg-white/5 border-blue-100 dark:border-white/10 text-blue-600 dark:text-white/50'
                                            }`}>
                                            <Check size={12} strokeWidth={4} />
                                        </div>
                                        <span className={`text-[14px] font-medium tracking-tight leading-snug ${p.highlight ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>{f}</span>
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/login"
                                className={`flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-[15px] transition-all duration-300 mt-auto ${p.highlight
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-black/20 dark:shadow-blue-900/40'
                                    : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:text-white backdrop-blur-md shadow-sm dark:shadow-none'
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

