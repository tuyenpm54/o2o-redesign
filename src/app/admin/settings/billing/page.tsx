"use client";

import { useState } from 'react';
import { CreditCard, CheckCircle2, Zap, Star, Shield } from 'lucide-react';

export default function BillingPage() {
    const [currentPlan, setCurrentPlan] = useState("FREE");
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
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

    const plans = {
        PRO: {
            monthly: 99000,
            original: 198000,
            yearly: 89000, // ~10% off monthly price
        },
        PREMIUM: {
            monthly: 199000,
            original: 398000,
            yearly: 179000, // ~10% off monthly price
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto pb-24 relative min-h-screen">
            {showQR && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#11111a] w-full max-w-md rounded-3xl p-6 text-center animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold mb-2">Thanh toán chuyển khoản</h3>
                        <p className="text-slate-500 mb-6 font-medium">
                            Gói: {showQR === 'PRO' ? 'Pro' : 'Premium'} ({billingCycle === 'monthly' ? 'Tháng' : 'Năm'})
                        </p>
                        
                        <div className="aspect-square bg-slate-100 dark:bg-white/5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 mb-6 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MOCK_PAYMENT')] bg-center bg-contain bg-no-repeat opacity-50 blur-[2px]"></div>
                            <div className="relative z-10 font-bold text-lg px-4 py-2 bg-white/80 dark:bg-black/80 rounded-xl backdrop-blur-md text-slate-800 dark:text-slate-200">QR Giả lập</div>
                        </div>

                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl text-left border border-blue-100 dark:border-blue-500/20">
                            <div className="text-xs font-bold text-blue-500 uppercase mb-1">Số tiền cần thanh toán</div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">
                                {showQR === 'PRO' 
                                    ? (billingCycle === 'monthly' ? '99.000đ' : '1.068.000đ')
                                    : (billingCycle === 'monthly' ? '199.000đ' : '2.148.000đ')
                                }
                            </div>
                            <div className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                {billingCycle === 'yearly' ? 'Tiết kiệm thêm 10% phí năm' : 'Thanh toán theo tháng'}
                            </div>
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
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-[11px] font-black uppercase tracking-widest mb-4 animate-pulse">
                    <Zap size={14} className="fill-red-500" /> Ưu đãi giới hạn: Giảm 50% toàn bộ gói cước
                </div>
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Nâng cấp để không giới hạn</h1>
                <p className="text-slate-500 max-w-lg mx-auto font-medium">Bắt đầu miễn phí và nâng cấp khi quy mô của bạn mở rộng.</p>
                
                {/* Billing Cycle Toggle */}
                <div className="mt-8 flex items-center justify-center gap-4">
                    <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Tháng</span>
                    <button 
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="w-14 h-7 bg-slate-200 dark:bg-white/10 rounded-full relative p-1 transition-colors hover:bg-blue-100 dark:hover:bg-blue-500/20"
                    >
                        <div className={`w-5 h-5 bg-white dark:bg-blue-500 rounded-full shadow-sm transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}></div>
                    </button>
                    <div className="flex flex-col items-start gap-0.5">
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Năm</span>
                            <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter shadow-lg shadow-orange-500/30">-10%</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FREE PLAN */}
                <div className={`relative bg-white/80 dark:bg-[#11111a]/80 backdrop-blur-xl border-2 rounded-3xl p-6 transition-all ${currentPlan === 'FREE' ? 'border-green-500 shadow-xl shadow-green-500/10' : 'border-slate-200/50 dark:border-white/[0.05]'}`}>
                    <h2 className="text-xl font-bold mb-1">Dùng thử</h2>
                    <div className="text-3xl font-black mb-6">Miễn phí<span className="text-sm text-slate-500 font-medium ml-1">/vĩnh viễn</span></div>
                    
                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span className="font-medium">Tối đa 10 bàn</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span className="font-medium">100 lượt gọi món / tháng</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-green-500 shrink-0" size={20}/> <span className="font-medium">Giao diện O2O chuẩn</span></li>
                        <li className="flex items-start gap-3 text-slate-400"><Shield className="shrink-0" size={20}/> <span className="line-through">Mở khóa tính năng custom</span></li>
                    </ul>

                    <button className="w-full bg-slate-100 dark:bg-white/5 text-slate-400 py-3 rounded-xl font-bold cursor-not-allowed italic" disabled>Đang sử dụng</button>
                </div>

                {/* PRO PLAN */}
                <div className={`bg-blue-50/80 dark:bg-blue-500/5 backdrop-blur-xl border-2 rounded-3xl p-6 transition-all relative ${currentPlan === 'PRO' ? 'border-blue-500 shadow-xl shadow-blue-500/20' : 'border-blue-200 dark:border-blue-500/20'}`}>
                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-blue-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg shadow-blue-500/40 uppercase tracking-wider">
                        Phổ biến nhất
                    </div>
                    <h2 className="text-xl font-bold mb-1 text-blue-600 dark:text-blue-400 uppercase tracking-tighter">Gói Pro</h2>
                    
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-400 line-through text-sm font-bold">198k</span>
                            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">-50%</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">
                                {billingCycle === 'monthly' ? '99k' : '89k'}
                            </span>
                            <span className="text-base text-slate-500 font-medium tracking-tight">/tháng</span>
                        </div>
                        {billingCycle === 'yearly' && (
                            <div className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-tight italic">
                                Thanh toán 1.068.000đ/năm
                            </div>
                        )}
                    </div>
                    
                    <ul className="space-y-4 mb-8 text-slate-700 dark:text-slate-300">
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-blue-500 shrink-0" size={20}/> <span className="font-medium">Không giới hạn bàn</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-blue-500 shrink-0" size={20}/> <span className="font-medium">1000 lượt gọi món / tháng</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-blue-500 shrink-0" size={20}/> <span className="font-medium">Tùy chỉnh thương hiệu riêng</span></li>
                        <li className="flex items-start gap-3 text-slate-400"><Shield className="shrink-0" size={20}/> <span className="line-through tracking-tighter">API & Plugin tích hợp riêng</span></li>
                    </ul>

                    {currentPlan === 'PRO' ? (
                        <button className="w-full bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 py-3 rounded-xl font-bold" disabled>Đang sử dụng</button>
                    ) : (
                        <button onClick={() => handleUpgrade('PRO')} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95">Nâng cấp Pro</button>
                    )}
                </div>

                {/* PREMIUM PLAN */}
                <div className={`bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-500/5 dark:to-[#11111a] backdrop-blur-xl border-2 rounded-3xl p-6 transition-all relative ${currentPlan === 'PREMIUM' ? 'border-orange-500 shadow-xl shadow-orange-500/20' : 'border-orange-200 dark:border-orange-500/20'}`}>
                    <h2 className="text-xl font-bold mb-1 text-orange-600 dark:text-orange-400 flex items-center gap-2 uppercase tracking-tighter italic">
                        <Star size={20} className="fill-orange-500 text-orange-500"/> Premium
                    </h2>
                    
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-400 line-through text-sm font-bold">398k</span>
                            <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase">-50%</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-slate-900 dark:text-white">
                                {billingCycle === 'monthly' ? '199k' : '179k'}
                            </span>
                            <span className="text-base text-slate-500 font-medium tracking-tight">/tháng</span>
                        </div>
                        {billingCycle === 'yearly' && (
                            <div className="text-[10px] font-bold text-orange-500 mt-1 uppercase tracking-tight italic">
                                Thanh toán 2.148.000đ/năm
                            </div>
                        )}
                    </div>
                    
                    <ul className="space-y-4 mb-8 text-slate-700 dark:text-slate-300">
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-orange-500 shrink-0" size={20}/> <span className="font-medium italic">Không giới hạn lượt gọi món</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-orange-500 shrink-0" size={20}/> <span className="font-medium">Mọi ưu đãi của gói Pro</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-orange-500 shrink-0" size={20}/> <span className="font-medium">Phát triển module riêng biệt</span></li>
                        <li className="flex items-start gap-3"><CheckCircle2 className="text-orange-500 shrink-0" size={20}/> <span className="font-medium">Hỗ trợ 24/7 Priority</span></li>
                    </ul>

                    {currentPlan === 'PREMIUM' ? (
                        <button className="w-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 py-3 rounded-xl font-bold" disabled>Đang sử dụng</button>
                    ) : (
                        <button onClick={() => handleUpgrade('PREMIUM')} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 active:scale-95">Nâng cấp Premium</button>
                    )}
                </div>
            </div>
            <footer className="mt-12 text-center pb-8">
                <p className="text-slate-400 text-xs font-medium italic">* Giá đã bao gồm thuế và các ưu đãi hiện hành. Liên hệ hỗ trợ để biết thêm chi tiết.</p>
            </footer>
        </div>
    );
}
