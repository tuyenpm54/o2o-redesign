"use client";

import { useState } from 'react';
import { CreditCard, CheckCircle2, Zap, Star, Shield } from 'lucide-react';

export default function BillingPage() {
    const [currentPlan, setCurrentPlan] = useState("FREE");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showQR, setShowQR] = useState<string | null>(null);

    const handleUpgrade = (plan: string) => {
        setShowQR(plan);
    };

    const confirmPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setCurrentPlan(showQR!);
            setShowQR(null);
        }, 1500);
    };

    return (
        <div className="p-8 max-w-5xl mx-auto pb-24 relative min-h-screen">
            {showQR && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#11111a] w-full max-w-md rounded-3xl p-6 text-center animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-2">Thanh toán chuyển khoản</h3>
                        <p className="text-slate-500 mb-6 font-medium">Gói: {showQR === 'PRO_99' ? 'Pro 99k' : 'Premium 199k'} / tháng</p>
                        
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 mb-6 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MOCK_PAYMENT')] bg-center bg-contain bg-no-repeat opacity-50 blur-[2px]"></div>
                            <div className="relative z-10 font-bold text-lg px-4 py-2 bg-white/80 dark:bg-black/80 rounded-xl backdrop-blur-md text-slate-800 dark:text-slate-200">QR Giả lập</div>
                        </div>

                        <button 
                            onClick={confirmPayment}
                            disabled={isProcessing}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-500/20 mb-3"
                        >
                            {isProcessing ? "Đang xử lý..." : "Xác nhận đã chuyển khoản"}
                        </button>
                        <button 
                            onClick={() => setShowQR(null)}
                            className="w-full bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 py-3.5 rounded-xl font-bold"
                        >
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            )}

            <header className="mb-10 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold mb-4">
                    <CreditCard size={16} /> Gói cước
                </div>
                <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Nâng cấp để không giới hạn</h1>
                <p className="text-slate-500 max-w-lg mx-auto">Chọn gói cước phù hợp với quy mô cửa hàng của bạn. Mở khóa POS, cấu hình giao diện nâng cao và tính năng độc quyền.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FREE PLAN */}
                <div className={`bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border-2 rounded-3xl p-6 transition-all ${currentPlan === 'FREE' ? 'border-green-500 shadow-xl shadow-green-500/10' : 'border-slate-200/50 dark:border-white/[0.05]'}`}>
                    <h2 className="text-xl font-bold mb-1">Cơ bản</h2>
                    <div className="text-3xl font-black mb-6">Miễn phí<span className="text-sm text-slate-500 font-medium ml-1">/tháng</span></div>
                    
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span className="font-medium">Quản lý tối đa 10 bàn</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span className="font-medium">100 lượt gọi món / tháng</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span className="font-medium">Giao diện mặc định</span></li>
                        <li className="flex items-start gap-3 text-slate-400"><Shield className="shrink-0" size={20}/> <span className="line-through">Tùy chỉnh giao diện nâng cao</span></li>
                    </ul>

                    {currentPlan === 'FREE' ? (
                        <button className="w-full bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 py-3 rounded-xl font-bold" disabled>Đang sử dụng</button>
                    ) : (
                        <button className="w-full bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-white py-3 rounded-xl font-bold">Downgrade</button>
                    )}
                </div>

                {/* PRO PLAN */}
                <div className={`bg-blue-50/80 dark:bg-blue-500/5 backdrop-blur-xl border-2 rounded-3xl p-6 transition-all relative ${currentPlan === 'PRO_99' ? 'border-blue-500 shadow-xl shadow-blue-500/20' : 'border-blue-200 dark:border-blue-500/20'}`}>
                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        <Zap size={12}/> PHỔ BIẾN NHẤT
                    </div>
                    <h2 className="text-xl font-bold mb-1 text-blue-600 dark:text-blue-400">Pro</h2>
                    <div className="text-4xl font-black mb-6 text-slate-900 dark:text-white">99k<span className="text-base text-slate-500 font-medium ml-1">/tháng</span></div>
                    
                    <ul className="space-y-4 mb-8 text-slate-700 dark:text-slate-300">
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-blue-500 shrink-0" size={20}/> <span className="font-medium">Không giới hạn số bàn</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-blue-500 shrink-0" size={20}/> <span className="font-medium">Tối đa 1000 lượt gọi món / tháng</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-blue-500 shrink-0" size={20}/> <span className="font-medium">Tùy chỉnh màu sắc & thương hiệu</span></li>
                        <li className="flex items-start gap-3 text-slate-400"><Shield className="shrink-0" size={20}/> <span className="line-through">Tính năng custom riêng biệt</span></li>
                    </ul>

                    {currentPlan === 'PRO_99' ? (
                        <button className="w-full bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-3 rounded-xl font-bold" disabled>Đang sử dụng</button>
                    ) : (
                        <button onClick={() => handleUpgrade('PRO_99')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all">Nâng cấp ngay</button>
                    )}
                </div>

                {/* PREMIUM PLAN */}
                <div className={`bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-500/5 dark:to-[#11111a] backdrop-blur-xl border-2 rounded-3xl p-6 transition-all ${currentPlan === 'PREMIUM_199' ? 'border-orange-500 shadow-xl shadow-orange-500/20' : 'border-orange-200 dark:border-orange-500/20'}`}>
                    <h2 className="text-xl font-bold mb-1 text-orange-600 dark:text-orange-400 flex items-center gap-2"><Star size={20} className="fill-orange-500 text-orange-500"/> Premium</h2>
                    <div className="text-4xl font-black mb-6 text-slate-900 dark:text-white">199k<span className="text-base text-slate-500 font-medium ml-1">/tháng</span></div>
                    
                    <ul className="space-y-4 mb-8 text-slate-700 dark:text-slate-300">
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-orange-500 shrink-0" size={20}/> <span className="font-medium">Mọi thứ của gói Pro</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-orange-500 shrink-0" size={20}/> <span className="font-medium">Không giới hạn lượt gọi món</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-orange-500 shrink-0" size={20}/> <span className="font-medium">Mở khóa tính năng custom riêng</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-orange-500 shrink-0" size={20}/> <span className="font-medium">Thiết kế tùy biến nhãn trắng</span></li>
                    </ul>

                    {currentPlan === 'PREMIUM_199' ? (
                        <button className="w-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 py-3 rounded-xl font-bold" disabled>Đang sử dụng</button>
                    ) : (
                        <button onClick={() => handleUpgrade('PREMIUM_199')} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all">Nâng cấp Premium</button>
                    )}
                </div>
            </div>
        </div>
    );
}
