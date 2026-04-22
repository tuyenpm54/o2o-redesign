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
            yearly: 89000, 
        },
        PREMIUM: {
            monthly: 199000,
            original: 398000,
            yearly: 179000, 
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-5xl mx-auto pb-24 relative min-h-screen">
            {showQR && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#11111a] w-full max-w-sm rounded-[24px] p-6 text-center animate-in zoom-in-95 duration-200 shadow-[0_20px_60px_rgba(0,0,0,0.1)]">
                        <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white tracking-tight">Thanh toán khoản phí</h3>
                        <p className="text-slate-500 mb-6 text-sm">
                            Gói {showQR === 'PRO' ? 'Chuyên nghiệp' : 'Cao cấp'} ({billingCycle === 'monthly' ? 'Tháng' : 'Năm'})
                        </p>
                        
                        <div className="aspect-square bg-slate-50 dark:bg-white/5 rounded-[20px] border border-slate-200 dark:border-white/10 mb-6 flex items-center justify-center relative overflow-hidden shadow-sm">
                            <div className="absolute inset-0 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MOCK_PAYMENT')] bg-center bg-contain bg-no-repeat opacity-40 blur-[1px]"></div>
                            <div className="relative z-10 font-bold text-sm px-4 py-2 bg-white/90 dark:bg-black/90 rounded-xl backdrop-blur-md text-slate-800 dark:text-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-slate-200/50 dark:border-white/10">QR Giao dịch</div>
                        </div>

                        <div className="mb-6 p-4 bg-slate-50 dark:bg-white/[0.02] rounded-[20px] text-left border border-slate-100 dark:border-white/5">
                            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Tổng thanh toán</div>
                            <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {showQR === 'PRO' 
                                    ? (billingCycle === 'monthly' ? '99.000đ' : '1.068.000đ')
                                    : (billingCycle === 'monthly' ? '199.000đ' : '2.148.000đ')
                                }
                            </div>
                            <div className="text-xs text-slate-500 mt-2 font-medium">
                                {billingCycle === 'yearly' ? 'Đã bao gồm chiết khấu gói năm.' : 'Chu kỳ thanh toán hàng tháng.'}
                            </div>
                        </div>

                        <button 
                            onClick={confirmPayment}
                            disabled={isProcessing}
                            className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-3.5 rounded-[16px] font-bold shadow-[0_4px_20px_rgba(0,0,0,0.08)] mb-3 transition-transform active:scale-95 text-[15px]"
                        >
                            {isProcessing ? "Đang xử lý..." : "Xác nhận chuyển khoản"}
                        </button>
                        <button 
                            onClick={() => setShowQR(null)}
                            className="w-full bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300 py-3 rounded-[16px] font-semibold transition-colors text-[15px]"
                        >
                            Hủy bỏ
                        </button>
                    </div>
                </div>
            )}

            <header className="mb-14 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 rounded-full text-[11px] font-bold tracking-widest mb-5 border border-slate-200/50 dark:border-white/5">
                    <Zap size={14} className="stroke-[2.5]" /> ƯU ĐÃI NÂNG CẤP HỆ THỐNG
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Quy mô mở rộng linh hoạt</h1>
                <p className="text-slate-500 max-w-lg mx-auto text-base">Bắt đầu ở mức cơ bản và nâng cấp khi nhà hàng của bạn lớn mạnh.</p>
                
                {/* Billing Cycle Toggle */}
                <div className="mt-10 flex items-center justify-center gap-5">
                    <span className={`text-[15px] font-medium transition-colors ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Hàng tháng</span>
                    <button 
                        onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                        className="w-[52px] h-7 bg-slate-200 dark:bg-white/10 rounded-full relative p-1 transition-colors hover:bg-slate-300 dark:hover:bg-white/20 ring-1 ring-inset ring-black/5"
                    >
                        <div className={`w-5 h-5 bg-white dark:bg-slate-300 rounded-full shadow-sm transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                    <div className="flex items-center gap-2.5">
                        <span className={`text-[15px] font-medium transition-colors ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Hàng năm</span>
                        <span className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-[10px] font-bold px-2 py-0.5 rounded-[6px] tracking-wide">-10%</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FREE PLAN */}
                <div className={`relative bg-white dark:bg-[#11111a] backdrop-blur-xl rounded-[24px] p-7 transition-all border ${currentPlan === 'FREE' ? 'border-slate-800 dark:border-slate-400 ring-1 ring-slate-800 dark:ring-slate-400 shadow-[0_8px_30px_rgba(0,0,0,0.04)]' : 'border-slate-200/80 dark:border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'}`}>
                    <h2 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Khởi đầu</h2>
                    <div className="text-3xl font-bold mb-8 text-slate-900 dark:text-white tracking-tight">Miễn phí</div>
                    
                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-slate-900 dark:text-white opacity-80" size={18} strokeWidth={2.5}/> <span className="text-slate-700 dark:text-slate-300 text-[15px]">Tối đa 10 bàn phục vụ</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-slate-900 dark:text-white opacity-80" size={18} strokeWidth={2.5}/> <span className="text-slate-700 dark:text-slate-300 text-[15px]">100 đơn hàng / tháng</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-slate-900 dark:text-white opacity-80" size={18} strokeWidth={2.5}/> <span className="text-slate-700 dark:text-slate-300 text-[15px]">Trình đơn chuẩn</span></li>
                        <li className="flex items-center gap-3 text-slate-400"><Shield className="opacity-50" size={18} strokeWidth={2.5}/> <span className="text-slate-500 text-[15px]">Lưu trữ hóa đơn</span></li>
                    </ul>

                    <button className="w-full bg-slate-50 dark:bg-black/20 text-slate-500 border border-slate-200 dark:border-white/5 py-3.5 rounded-[16px] font-medium text-[15px] cursor-not-allowed" disabled>Đã kích hoạt</button>
                </div>

                {/* PRO PLAN */}
                <div className={`relative bg-slate-50/80 dark:bg-[#1A1D27] backdrop-blur-xl rounded-[24px] p-7 transition-all border ${currentPlan === 'PRO' ? 'border-slate-800 dark:border-white ring-1 ring-slate-800 dark:ring-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]' : 'border-slate-200/80 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]'}`}>
                    <div className="absolute top-0 right-7 -translate-y-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm tracking-wide">
                        Phổ biến
                    </div>
                    <h2 className="text-lg font-semibold mb-2 text-slate-800 dark:text-slate-200">Chuyên nghiệp</h2>
                    
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-1 opacity-60">
                            <span className="text-slate-500 line-through text-sm">198k</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                                {billingCycle === 'monthly' ? '99k' : '89k'}
                            </span>
                            <span className="text-sm text-slate-500 font-medium tracking-tight">/tháng</span>
                        </div>
                        {billingCycle === 'yearly' && (
                            <div className="text-xs text-slate-500 mt-1.5 font-medium">
                                Kết toán năm 1.068.000đ
                            </div>
                        )}
                    </div>
                    
                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-slate-900 dark:text-white opacity-80" size={18} strokeWidth={2.5}/> <span className="text-slate-700 dark:text-slate-300 text-[15px]">Không giới hạn bàn</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-slate-900 dark:text-white opacity-80" size={18} strokeWidth={2.5}/> <span className="text-slate-700 dark:text-slate-300 text-[15px]">1000 đơn hàng / tháng</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-slate-900 dark:text-white opacity-80" size={18} strokeWidth={2.5}/> <span className="text-slate-700 dark:text-slate-300 text-[15px]">Quản lý module nổi bật</span></li>
                        <li className="flex items-center gap-3 text-slate-400"><Shield className="opacity-50" size={18} strokeWidth={2.5}/> <span className="text-slate-500 text-[15px]">Đồng bộ nhà bếp</span></li>
                    </ul>

                    {currentPlan === 'PRO' ? (
                        <button className="w-full bg-slate-50 dark:bg-black/20 text-slate-500 border border-slate-200 dark:border-white/5 py-3.5 rounded-[16px] font-medium text-[15px] cursor-not-allowed" disabled>Đã kích hoạt</button>
                    ) : (
                        <button onClick={() => handleUpgrade('PRO')} className="w-full bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-200 text-white dark:text-slate-900 py-3.5 rounded-[16px] font-bold shadow-[0_4px_15px_rgba(0,0,0,0.06)] transition-all transform hover:-translate-y-0.5 active:scale-95 text-[15px]">Nâng cấp ngay</button>
                    )}
                </div>

                {/* PREMIUM PLAN */}
                <div className={`relative bg-slate-900 dark:bg-black backdrop-blur-xl rounded-[24px] p-7 transition-all border ${currentPlan === 'PREMIUM' ? 'border-slate-500 shadow-[0_12px_40px_rgba(0,0,0,0.15)] ring-1 ring-slate-500' : 'border-slate-800 shadow-xl'}`}>
                    <h2 className="text-lg font-semibold mb-2 text-white">
                        Doanh nghiệp
                    </h2>
                    
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-1 opacity-60">
                            <span className="text-slate-400 line-through text-sm">398k</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-white tracking-tight">
                                {billingCycle === 'monthly' ? '199k' : '179k'}
                            </span>
                            <span className="text-sm text-slate-400 font-medium tracking-tight">/tháng</span>
                        </div>
                        {billingCycle === 'yearly' && (
                            <div className="text-xs text-slate-400 mt-1.5 font-medium">
                                Kết toán năm 2.148.000đ
                            </div>
                        )}
                    </div>
                    
                    <ul className="space-y-4 mb-10">
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-white opacity-80" size={18} strokeWidth={2.5}/> <span className="text-slate-200 text-[15px]">Không giới hạn lệnh gọi món</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-white opacity-80" size={18} strokeWidth={2.5}/> <span className="text-slate-200 text-[15px]">Mọi tính năng gói PRO</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-white opacity-80" size={18} strokeWidth={2.5}/> <span className="text-slate-200 text-[15px]">Tùy biến thương hiệu cấp cao</span></li>
                        <li className="flex items-center gap-3"><CheckCircle2 className="text-white opacity-80" size={18} strokeWidth={2.5}/> <span className="text-slate-200 text-[15px]">Hỗ trợ kỹ thuật 24/7 SLA</span></li>
                    </ul>

                    {currentPlan === 'PREMIUM' ? (
                        <button className="w-full bg-slate-800 text-slate-400 border border-slate-700 py-3.5 rounded-[16px] font-medium text-[15px] cursor-not-allowed" disabled>Đã kích hoạt</button>
                    ) : (
                        <button onClick={() => handleUpgrade('PREMIUM')} className="w-full bg-white hover:bg-slate-100 text-slate-900 py-3.5 rounded-[16px] font-bold shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 text-[15px]">Liên hệ nâng cấp</button>
                    )}
                </div>
            </div>
            <footer className="mt-16 text-center pb-8 border-t border-slate-200/50 dark:border-white/5 pt-8">
                <p className="text-slate-500 text-[13px] font-medium">Thuế và các lệ phí hiện hành sẽ được tính toán tại bước xác nhận thanh toán.<br/>Liên hệ chuyên viên O2O nếu quy mô của bạn vượt ngưỡng gói tiêu chuẩn.</p>
            </footer>
        </div>
    );
}
