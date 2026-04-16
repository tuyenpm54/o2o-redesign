import { CreditCard, Rocket, CheckCircle2, Shield, Search, ArrowRight, MoreHorizontal, AlertCircle, Clock } from 'lucide-react';

const STORE_LICENSES = [
    { id: 1, name: "Phở 24 Q1", plan: "PRO_99", status: "Active", usage: 18500, limit: 20000, unit: "PAX", renew: "12/05/2026" },
    { id: 2, name: "Highlands Q3", plan: "PRO_99", status: "Active", usage: 12480, limit: 20000, unit: "PAX", renew: "15/05/2026" },
    { id: 3, name: "KFC Q10", plan: "ENTERPRISE", status: "Active", usage: 85000, limit: 100000, unit: "PAX", renew: "01/01/2027" },
    { id: 4, name: "Phúc Long Q7", plan: "PRO_99", status: "Pending", usage: 19800, limit: 20000, unit: "PAX", renew: "Quá hạn 3 ngày" },
    { id: 5, name: "Texas TĐ", plan: "FREE", status: "Expired", usage: 500, limit: 500, unit: "PAX", renew: "-" },
    { id: 6, name: "License Trống", plan: "Unused", status: "Available", usage: 0, limit: 0, unit: "-", renew: "-" },
    { id: 7, name: "License Trống", plan: "Unused", status: "Available", usage: 0, limit: 0, unit: "-", renew: "-" },
];

export default function HQBillingPage() {
    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24 space-y-8 bg-slate-50 dark:bg-[#050510] min-h-screen">
            <header className="mb-10 pt-4 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full text-xs font-black uppercase tracking-widest mb-4">
                    <CreditCard size={14} strokeWidth={2.5} /> Subscription Chuỗi
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Kinh doanh không giới hạn</h1>
                <p className="text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed text-sm md:text-base">Các gói Enterprise cho phép phân bổ License tùy ý cho các chi nhánh trực thuộc, quản trị tập trung, xuất hóa đơn đầu vào định kỳ về một đầu mối duy nhất.</p>
            </header>

            {/* UPSELL CARDS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                <div className="bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/10 rounded-[32px] p-8 shadow-sm transition hover:shadow-lg hover:-translate-y-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Thanh toán theo Cơ sở</h2>
                    <p className="text-slate-500 text-sm mb-8 font-medium">Nâng cấp độc lập từng chi nhánh theo đúng nhu cầu nội tại. Phù hợp chuỗi nhỏ (dưới 5 điểm).</p>
                    
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mt-0.5"><CheckCircle2 size={16} strokeWidth={3}/></div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Tự thanh toán trên tài khoản nhà hàng</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="p-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 mt-0.5"><CheckCircle2 size={16} strokeWidth={3}/></div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">Standard Support 8/5</span>
                        </li>
                        <li className="flex items-start gap-3 opacity-50">
                            <div className="p-1 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 mt-0.5"><Shield size={16} strokeWidth={3}/></div>
                            <span className="font-semibold text-slate-500 text-sm line-through">Xuất chung 1 hóa đơn VAT tổng</span>
                        </li>
                    </ul>

                    <button className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white py-3.5 rounded-2xl font-bold transition-all text-sm tracking-wide">Ủy quyền Nhánh tự chịu</button>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[32px] p-8 text-white relative shadow-2xl shadow-orange-500/20 transition hover:-translate-y-1 overflow-hidden">
                    <div className="absolute top-0 right-8 bg-white text-orange-600 text-[10px] uppercase font-black px-4 py-2 rounded-b-xl shadow-lg border border-t-0 border-orange-100">KHUYÊN DÙNG</div>
                    <div className="absolute -bottom-24 -right-24 text-white/10 rotate-12 pointer-events-none"><Rocket size={240} strokeWidth={1}/></div>
                    
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black mb-2 flex items-center gap-3 tracking-tight"><Rocket size={24} strokeWidth={2.5}/> Enterprise Volume</h2>
                        <p className="text-white/80 text-sm font-medium mb-8 pr-12">Mua sỉ License và cấp phát xuống chi nhánh. Giá chiết khấu cao, quản lý chung một hợp đồng thanh toán duy nhất.</p>

                        <div className="bg-black/20 rounded-2xl p-5 mb-8 backdrop-blur-md border border-white/10 shadow-inner">
                            <div className="flex justify-between items-center mb-3 text-sm font-semibold border-b border-white/10 pb-3"><span className="text-white/80">Mua từ 5-10 Nodes:</span> <span className="font-black bg-white/20 px-2 py-0.5 rounded text-white">-10%</span></div>
                            <div className="flex justify-between items-center mb-3 text-sm font-semibold border-b border-white/10 pb-3"><span className="text-white/80">Mua từ 11-50 Nodes:</span> <span className="font-black bg-white/20 px-2 py-0.5 rounded text-white">-15%</span></div>
                            <div className="flex justify-between items-center text-sm font-semibold text-amber-200 pt-1"><span>Trên 50 Nodes:</span> <span className="font-black border border-amber-300/30 px-2 py-0.5 rounded border-dashed">Deal trực tiếp</span></div>
                        </div>

                        <button className="w-full bg-white text-orange-600 hover:bg-slate-50 py-3.5 rounded-2xl font-black transition-all shadow-lg text-sm tracking-wide flex items-center justify-center gap-2">Liên hệ Gói Doanh nghiệp <ArrowRight size={16} strokeWidth={3}/></button>
                    </div>
                </div>
            </div>
            
            {/* LICENSE DISTRIBUTION TABLE */}
            <div className="bg-white dark:bg-[#11111a] border border-slate-200 dark:border-white/10 rounded-[32px] p-6 lg:p-8 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                                <CreditCard size={20} className="text-indigo-500" strokeWidth={2.5}/>
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Chi tiết phân bổ License</h3>
                        </div>
                        <p className="text-[13px] font-medium text-slate-500">
                            Trong giỏ chung: <span className="font-black text-slate-900 dark:text-white px-1.5 py-0.5 bg-slate-100 dark:bg-white/5 rounded-md ml-1">Tổng 8</span> <span className="font-black text-emerald-500 px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-md ml-1">Đã cấp 5</span> <span className="font-black text-amber-500 px-1.5 py-0.5 bg-amber-50 dark:bg-amber-500/10 rounded-md ml-1">Chưa cấp 3</span>
                        </p>
                    </div>
                    
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input type="text" placeholder="Tìm cơ sở..." className="pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold text-slate-900 dark:text-white w-full lg:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-slate-400 placeholder:font-medium" />
                    </div>
                </div>

                <div className="overflow-x-auto pb-4">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr>
                                <th className="pb-3 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest px-4 w-1/4">Cơ sở</th>
                                <th className="pb-3 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest px-4 w-1/6">Trạng thái</th>
                                <th className="pb-3 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest px-4 w-1/6">Gói</th>
                                <th className="pb-3 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest px-4 w-1/4">Lưu lượng sử dụng (Tháng)</th>
                                <th className="pb-3 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest px-4 text-right w-1/6">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {STORE_LICENSES.map((store, idx) => {
                                // Status styling
                                const isUnused = store.plan === 'Unused';
                                const isActive = store.status === 'Active';
                                const isPending = store.status === 'Pending';
                                const isExpired = store.status === 'Expired';
                                
                                const RowClass = isUnused ? 'opacity-60 grayscale' : 'hover:-translate-y-0.5 shadow-sm hover:shadow-md';
                                
                                const statusBadgeClass = isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' : 
                                                         isPending ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20' : 
                                                         isExpired ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20' : 
                                                         'bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10';
                                
                                const StatusIcon = isActive ? CheckCircle2 : isPending ? Clock : isExpired ? AlertCircle : CheckCircle2;

                                const planBadgeClass = store.plan === 'ENTERPRISE' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 bg-[url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAiPjwvcmVjdD4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiM2MzY2ZjEiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+")]' :
                                                       store.plan === 'PRO_99' ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' :
                                                       'bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400 dark:border-white/10';

                                // Progress calculation
                                const usagePercent = store.limit > 0 ? Math.min(100, Math.round((store.usage / store.limit) * 100)) : 0;
                                const isWarningUsage = usagePercent >= 90;
                                const progressColor = isUnused ? 'bg-slate-200 dark:bg-white/10' : isWarningUsage ? 'bg-rose-500' : 'bg-emerald-500';

                                return (
                                    <tr key={idx} className={`bg-white dark:bg-[#15151e] border border-slate-100 dark:border-white/5 transition-all duration-300 rounded-2xl group ${RowClass}`}>
                                        <td className="px-4 py-4 rounded-l-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${isUnused ? 'bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-white/10 text-slate-900 dark:text-white'}`}>
                                                    <span className="font-extrabold text-[10px]">{store.id}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-black text-[13px] tracking-tight ${isUnused ? 'text-slate-500 border-b border-dashed border-slate-300 pb-0.5' : 'text-slate-900 dark:text-white'}`}>{store.name}</span>
                                                    {!isUnused && <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Renews: {store.renew}</span>}
                                                </div>
                                            </div>
                                        </td>
                                        
                                        <td className="px-4 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${statusBadgeClass}`}>
                                                {!isUnused && <StatusIcon size={12} strokeWidth={3} />}
                                                <span className="text-[9px] font-extrabold uppercase tracking-widest">{store.status}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-4 py-4">
                                            <div className={`inline-flex items-center px-2 py-1 rounded-lg border ${planBadgeClass}`}>
                                                <span className="text-[10px] font-extrabold uppercase tracking-widest">{store.plan}</span>
                                            </div>
                                        </td>
                                        
                                        <td className="px-4 py-4">
                                            {isUnused ? (
                                                <span className="text-slate-400 text-xs font-bold italic">-</span>
                                            ) : (
                                                <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
                                                    <div className="flex justify-between items-end">
                                                        <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                                                            {new Intl.NumberFormat('vi-VN').format(store.usage)} <span className="text-slate-400 text-[9px]">/ {new Intl.NumberFormat('vi-VN').format(store.limit)} {store.unit}</span>
                                                        </span>
                                                        <span className={`text-[9px] font-black tracking-widest ${isWarningUsage ? 'text-rose-500' : 'text-slate-400'}`}>
                                                            {usagePercent}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all duration-1000 ${progressColor}`} style={{ width: `${usagePercent}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        <td className="px-4 py-4 rounded-r-2xl text-right">
                                            {isUnused ? (
                                                <button className="px-3 py-1.5 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
                                                    Cấp phát
                                                </button>
                                            ) : (
                                                <button className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
