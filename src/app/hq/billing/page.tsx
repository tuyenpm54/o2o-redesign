"use client";

import { CreditCard, Rocket, CheckCircle2, Shield } from 'lucide-react';

export default function HQBillingPage() {
    return (
        <div className="p-8 max-w-6xl mx-auto pb-24">
            <header className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-sm font-bold mb-4">
                    <CreditCard size={16} /> Subscription Chuỗi
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Kinh doanh không giới hạn</h1>
                <p className="text-slate-500 max-w-2xl mx-auto">Các gói Enterprise cho phép phân bổ License tùy ý cho các chi nhánh trực thuộc, quản trị tập trung, xuất hóa đơn đầu vào định kỳ một đầu mối.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border-2 border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-8 transform transition-transform hover:-translate-y-2">
                    <h2 className="text-2xl font-bold mb-2">Thanh toán Lẻ theo Cơ sở</h2>
                    <p className="text-slate-500 mb-8">Nâng cấp độc lập từng chi nhánh theo đúng nhu cầu nội tại của cửa hàng đó. Phù hợp chuỗi nhỏ/dưới 5 node.</p>
                    
                    <ul className="space-y-4 mb-8 text-slate-700 dark:text-slate-300">
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> Tự nâng cấp trên tài khoản nhà hàng</li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> Support 8/5</li>
                        <li className="flex items-start gap-3 text-slate-400"><Shield className="shrink-0" size={20}/> <span className="line-through">Hóa đơn công ty một mối</span></li>
                    </ul>

                    <button className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white py-4 rounded-2xl font-bold transition-all">Ủy quyền Nhánh tự chịu</button>
                </div>

                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 transform transition-transform hover:-translate-y-2 text-white relative shadow-2xl shadow-orange-500/20">
                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-white text-orange-600 text-xs font-black px-4 py-1.5 rounded-full shadow-lg">Khuyên dùng</div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2"><Rocket size={24}/> Enterprise Volume</h2>
                    <p className="text-white/80 mb-8">Mua sỉ License và cấp phát xuống chi nhánh. Giá tốt hơn, quản lý chung một hợp đồng thanh toán duy nhất.</p>

                    <div className="bg-black/20 rounded-2xl p-4 mb-8 backdrop-blur-sm border border-white/10">
                        <div className="flex justify-between items-center mb-2"><span>Mua từ 5-10 Nodes:</span> <span className="font-bold">-10%</span></div>
                        <div className="flex justify-between items-center mb-2"><span>Mua từ 11-50 Nodes:</span> <span className="font-bold">-15%</span></div>
                        <div className="flex justify-between items-center text-amber-200"><span>Mua trên 50 Nodes:</span> <span className="font-bold">Deal trực tiếp</span></div>
                    </div>

                    <button className="w-full bg-white text-orange-600 hover:bg-slate-50 py-4 rounded-2xl font-black text-lg transition-all shadow-lg hover:shadow-white/20 cursor-pointer">Liên hệ Gói Doanh nghiệp</button>
                </div>
            </div>
            
            <div className="bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/[0.05] rounded-3xl p-8">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Chi tiết sử dụng hiện tại</h3>
                        <p className="text-sm text-slate-500">Giỏ License chung cấp cho hệ thống: <span className="font-bold text-amber-500">Kích hoạt 1/5 Licenses</span></p>
                    </div>
                </div>
                {/* Table for distributed licenses */}
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-200/50 dark:border-white/10">
                            <th className="py-3 text-slate-500 font-semibold text-sm">CƠ SỞ</th>
                            <th className="py-3 text-slate-500 font-semibold text-sm">GÓI</th>
                            <th className="py-3 text-slate-500 font-semibold text-sm text-right">TT</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-slate-100 dark:border-white/5 text-slate-900 dark:text-slate-200">
                            <td className="py-4 font-semibold">Highlands Coffee Landmark</td>
                            <td className="py-4"><span className="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded text-xs font-bold">PRO_99</span></td>
                            <td className="py-4 text-right"><span className="text-green-500 font-bold text-sm">Active</span></td>
                        </tr>
                        <tr>
                            <td className="py-4 font-semibold text-slate-400 dark:text-slate-500">Chưa cấp phát</td>
                            <td className="py-4"><span className="bg-slate-100 dark:bg-white/5 text-slate-500 px-2 py-1 rounded text-xs font-bold">Unused</span></td>
                            <td className="py-4 text-right">-</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
