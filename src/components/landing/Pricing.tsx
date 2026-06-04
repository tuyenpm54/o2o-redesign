import Link from 'next/link';
import { Sparkles, CheckCircle2 } from 'lucide-react';

const plans = [
    {
        name: 'Gói Cơ Bản',
        price: '299k',
        originalPrice: '',
        discountLabel: '',
        period: '/ tháng',
        desc: 'Vận hành trơn tru, dứt điểm sai sót order giờ cao điểm. Phù hợp quán nhỏ.',
        features: [
            'Menu điện tử quét mã gọi món',
            'Màn hình báo đơn thông minh cho Bếp',
            'Nút khách tự gọi nhân viên/tính tiền',
            'Báo cáo doanh thu chốt ca cơ bản'
        ],
        cta: 'Bắt đầu ngay',
        highlight: false,
    },
    {
        name: 'Gói Tăng Trưởng',
        price: '599k',
        originalPrice: '',
        discountLabel: '',
        period: '/ tháng',
        desc: 'Trợ lý bán hàng tự động giúp quán tăng vọt doanh thu. Bán chạy nhất.',
        features: [
            'Tất cả tính năng Gói Cơ Bản',
            'Trợ lý ảo tự động mời khách gọi thêm món',
            'Tạo băng rôn khuyến mãi giờ vàng',
            'Báo cáo soi điểm nghẽn hiệu suất bếp'
        ],
        cta: 'Đăng ký Tăng Trưởng',
        highlight: true,
    },
    {
        name: 'Gói Cho Chuỗi',
        price: 'Liên hệ',
        period: '',
        desc: 'Dành riêng cho hệ thống chi nhánh. May đo và tích hợp API chuyên sâu.',
        features: [
            'Tất cả tính năng Gói Tăng Trưởng',
            'Đồng bộ menu toàn hệ thống 1 chạm',
            'Tích hợp phần mềm Kế toán, Hóa đơn VAT',
            'Giao diện app thiết kế theo thương hiệu'
        ],
        cta: 'Gặp chuyên viên',
        highlight: false,
    }
];

export function Pricing() {
    return (
        <section id="pricing" className="py-32 relative bg-white dark:bg-[#08080A] transition-colors duration-300 overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-[#DF1B41]/5 via-[#F56B0F]/5 to-transparent dark:from-[#DF1B41]/10 dark:via-[#F56B0F]/10 blur-[120px] rounded-[100%] pointer-events-none z-0 mix-blend-multiply dark:mix-blend-screen opacity-80" />

            <div className="container mx-auto px-6 relative z-10">

                <div className="text-center max-w-3xl mx-auto mb-24 relative">
                    <h2 className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#F56B0F] mb-6">
                        Chi phí minh bạch
                    </h2>
                    <h3 className="text-[44px] md:text-[64px] font-extrabold text-slate-900 dark:text-white tracking-tighter leading-[1.05] mb-6 text-balance">
                        Chỉ bằng một ly cafe.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#DF1B41] via-[#F56B0F] to-amber-500 pb-2">
                            Đổi lấy sự trơn tru tuyệt đối.
                        </span>
                    </h3>
                </div>

                <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-8 max-w-[1200px] mx-auto">
                    {plans.map((p, i) => (
                        <div
                            key={i}
                            className={`flex flex-col p-8 md:p-12 rounded-[40px] transition-all duration-500 relative w-full lg:w-[360px] group ${p.highlight
                                ? 'bg-slate-900 dark:bg-[#111115] border border-slate-800 dark:border-white/10 text-white shadow-[0_40px_80px_rgba(223,27,65,0.2)] transform lg:-translate-y-6 lg:scale-105 z-20'
                                : 'bg-slate-50 dark:bg-[#15151A] border border-slate-200 dark:border-white/5 text-slate-900 dark:text-white shadow-[0_20px_40px_rgba(0,0,0,0.02)] z-10'
                                }`}
                        >
                            {/* Popular/Highlight Badge */}
                            {p.highlight && (
                                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#DF1B41] to-[#F56B0F] text-white text-[12px] font-bold uppercase tracking-widest py-2 px-6 rounded-full flex items-center gap-2 shadow-[0_10px_20px_rgba(223,27,65,0.4)] whitespace-nowrap">
                                    <Sparkles size={14} fill="white" /> Bán chạy nhất
                                </div>
                            )}

                            <div className="mb-4 flex-1">
                                <h4 className={`text-[28px] font-extrabold tracking-tight mb-4 ${p.highlight ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{p.name}</h4>
                                <p className={`text-[15px] font-medium leading-relaxed mb-10 h-[66px] text-balance ${p.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{p.desc}</p>
                                
                                {/* Pronounced Pricing Area */}
                                <div className="flex flex-col justify-end mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className={`text-[56px] md:text-[64px] font-extrabold tracking-tighter leading-none ${p.highlight ? 'text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                            {p.price}
                                        </span>
                                        {p.period && <span className={`text-[16px] font-bold ml-1 ${p.highlight ? 'text-slate-500' : 'text-slate-400'}`}>{p.period}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 mb-12 pt-8 border-t border-slate-200 dark:border-white/10">
                                {p.features.map((f, j) => (
                                    <div key={j} className="flex items-start gap-4">
                                        <div className={`mt-0.5 shrink-0 ${p.highlight ? 'text-[#F56B0F]' : 'text-slate-400'}`}>
                                            <CheckCircle2 size={20} strokeWidth={2.5} />
                                        </div>
                                        <span className={`text-[15px] font-semibold leading-snug ${p.highlight ? 'text-slate-300' : 'text-slate-700 dark:text-slate-300'}`}>{f}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTAs */}
                            <Link
                                href="/login"
                                className={`flex items-center justify-center w-full py-4 rounded-full font-bold text-[16px] transition-all duration-300 ${p.highlight
                                    ? 'bg-gradient-to-r from-[#DF1B41] to-[#F56B0F] text-white hover:scale-[1.03] active:scale-[0.97] shadow-[0_10px_25px_rgba(223,27,65,0.4)]'
                                    : 'bg-white dark:bg-[#1A1A1F] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 shadow-sm'
                                    }`}
                            >
                                {p.cta}
                            </Link>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center flex justify-center">
                    <div className="inline-flex items-center gap-3 px-6 py-4 rounded-full bg-slate-900 dark:bg-white/10 border border-slate-800 dark:border-white/10 text-white text-[15px] font-bold shadow-2xl backdrop-blur-md hover:scale-[1.02] transition-transform cursor-pointer">
                        <span className="text-xl">🎁</span> Ưu đãi độc quyền: Đăng ký 1 năm - Tặng 2 tháng & Miễn phí in ấn mã QR để bàn
                    </div>
                </div>
            </div>
        </section>
    );
}
