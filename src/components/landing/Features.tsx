import { Sparkles, Replace, LayoutTemplate, Receipt, MousePointer2 } from 'lucide-react';

const features = [
    {
        title: 'Gợi ý món ăn thông minh',
        desc: 'Hệ thống tự động trò chuyện, gợi ý theo sở thích. Tự nhóm thành cấu trúc chuẩn nhà hàng (khai vị, chính, tráng miệng).',
        icon: <Sparkles className="text-blue-600 dark:text-blue-400" />,
    },
    {
        title: 'Đồng bộ POS/KDS tức thời',
        desc: 'Nền tảng giúp trạng thái món ăn (đang chế biến, đã xong) được cập nhật liên tục cho thực khách, giảm cảm giác sốt ruột.',
        icon: <Replace className="text-blue-600 dark:text-blue-400" />,
    },
    {
        title: 'Kiểm đồ minh bạch',
        desc: 'Hiển thị rành mạch các món đã gọi trong bàn và từng khoản phí dịch vụ, tạo sự an tâm tuyệt đối trước khi thanh toán.',
        icon: <Receipt className="text-blue-600 dark:text-blue-400" />,
    },
    {
        title: 'Giao diện tuỳ chỉnh linh hoạt',
        desc: 'Thay vì dùng chung 1 thiết kế, O2O cung cấp nhiều module xịn xò: Flash Sale, Món bán chạy, Combo, Gợi ý upsell cùng món.',
        icon: <LayoutTemplate className="text-blue-600 dark:text-blue-400" />,
    }
];

export function Features() {
    return (
        <section id="features" className="py-32 relative overflow-hidden transition-colors duration-300">

            {/* Background Decorators */}
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-100 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none transition-colors" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-64 bg-blue-100 dark:bg-blue-500/10 rounded-full blur-[150px] pointer-events-none transition-colors" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="max-w-3xl mb-24 text-center mx-auto">
                    <div className="inline-flex items-center px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.02] backdrop-blur-md mb-8 transition-colors">
                        <h2 className="text-[12px] font-bold uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 font-sans">Năng lực vượt trội</h2>
                    </div>
                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-8 leading-tight transition-colors">
                        Trở thành nhân viên chuyên nghiệp <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">Nhưng không bao giờ mệt mỏi</span>
                    </h3>
                    <p className="text-lg text-slate-500 dark:text-slate-400 font-medium transition-colors">
                        Không chỉ show danh sách món vô hồn, O2O tương tác, thấu hiểu và thúc đẩy doanh thu thông qua các module giao diện siêu linh hoạt.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-6xl mx-auto">
                    {features.map((f, i) => (
                        <div key={i} className="group flex flex-col md:flex-row items-start gap-8 p-10 rounded-[2rem] bg-white/60 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] hover:bg-white dark:hover:bg-white/[0.05] shadow-sm hover:shadow-xl dark:shadow-none hover:border-blue-200 dark:hover:border-white/[0.1] transition-all duration-500 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/5 dark:to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                            <div className="w-16 h-16 shrink-0 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-center justify-center shadow-inner shadow-blue-500/5 dark:shadow-blue-500/20 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 z-10">
                                <div className="group-hover:text-white transition-colors [&>svg]:w-8 [&>svg]:h-8">{f.icon}</div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight flex items-center gap-2 z-10 transition-colors">
                                    {f.title}
                                    <MousePointer2 size={16} className="text-blue-500 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-4 group-hover:translate-x-0 duration-300 -ml-1" />
                                </h4>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed z-10 transition-colors text-lg">
                                    {f.desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
