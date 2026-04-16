"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Copy, Hourglass, Lock, FileText, ChevronRight, Check, Bell, Star, RefreshCw } from 'lucide-react';
import { useMenuContext } from '../menu/hooks/useMenuContext';

type OrderStatus = 'pending' | 'cooking' | 'ready' | 'completed';

export default function PrepaidOrderDetail() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fromUrl = searchParams.get('from') || '/menu';
    const resid = searchParams.get('resid');
    const tableid = searchParams.get('tableid');

    const { theme } = useMenuContext() || { theme: { bg: '#fff', textPrimary: '#000', textSecondary: '#666', border: '#eee' } };

    const [fetchedOrders, setFetchedOrders] = useState<any[]>([]);

    useEffect(() => {
        if (!resid || !tableid) return;
        const fetchOrders = async () => {
            try {
                const res = await fetch(`/api/orders?resid=${resid}&tableid=${tableid}`);
                const data = await res.json();
                if (data.success && data.data) {
                    setFetchedOrders(data.data);
                }
            } catch (e) {
                console.error(e);
            }
        };

        fetchOrders();
        const iv = setInterval(fetchOrders, 3000);
        return () => clearInterval(iv);
    }, [resid, tableid]);

    const status = useMemo<OrderStatus>(() => {
        if (!fetchedOrders || fetchedOrders.length === 0) return 'pending';
        
        let pending = 0, confirmed = 0, cooking = 0, ready = 0, served = 0;
        const total = fetchedOrders.reduce((sum, o) => sum + (Number(o.qty) || 1), 0);
        
        fetchedOrders.forEach(o => {
            const st = (o.status || 'pending').toLowerCase();
            const qty = Number(o.qty) || 1;
            if (st === 'pending' || st === 'chờ xác nhận') pending += qty;
            else if (st === 'confirmed' || st === 'đã xác nhận' || st === 'chờ chế biến') confirmed += qty;
            else if (st === 'cooking' || st === 'preparing' || st === 'đang nấu' || st === 'đang chế biến') cooking += qty;
            else if (st === 'ready' || st === 'đã sẵn sàng' || st === 'chuẩn bị mang ra' || st === 'đang mang ra' || st === 'chờ phục vụ' || st === 'chờ nhận đồ') ready += qty;
            else if (st === 'served' || st === 'đã phục vụ' || st === 'completed' || st === 'đã trả đồ') served += qty;
        });

        if (served > 0 && served === total) return 'completed';
        if (ready > 0) return 'ready';
        if (cooking > 0 || confirmed > 0) return 'cooking';
        return 'pending';
    }, [fetchedOrders]);

    // Format money helper
    const formatMoney = (amount: number) => {
        return amount.toLocaleString('vi-VN');
    };

    const firstOrder = fetchedOrders[0] || {};
    const totalAmount = fetchedOrders.reduce((sum, o) => sum + (Number(o.price) || 0) * (Number(o.qty) || 1), 0);
    const totalQty = fetchedOrders.reduce((sum, o) => sum + (Number(o.qty) || 1), 0);
    const orderCode = firstOrder.order_round_id ? firstOrder.order_round_id.slice(-5).toUpperCase() : 'ST2304A';
    // Format time and fix Invalid Date
    let orderTime = '';
    if (firstOrder.timestamp) {
        const ts = !isNaN(Number(firstOrder.timestamp)) ? Number(firstOrder.timestamp) : firstOrder.timestamp;
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
            orderTime = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        }
    }
    const paymentMethod = 'Chuyển khoản / Trực tuyến';

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert(`Đã copy: ${text}`);
    };

    const handleBack = () => {
        router.push(fromUrl);
    };

    // --- Helper for Stepper ---
    const statusSteps = ['pending', 'cooking', 'ready', 'completed'];
    const stepLabels = ['Đợi xác nhận', 'Đang làm đồ', 'Đã làm xong', 'Đã trả đồ'];
    const currentIndex = statusSteps.indexOf(status);
    const progressWidth = currentIndex === 0 ? 0 : (currentIndex / (statusSteps.length - 1)) * 100;

    return (
        <div style={{ backgroundColor: theme?.bg || '#F8FAFC', minHeight: '100vh', paddingBottom: status === 'completed' ? '100px' : '32px' }} className="text-slate-900 font-sans relative">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 pb-3 pt-safe-top flex items-center px-4">
                <button onClick={handleBack} className="w-10 h-10 mt-3 flex items-center justify-center rounded-full active:bg-slate-100 transition-colors -ml-2">
                    <ChevronLeft size={24} strokeWidth={2.5} className="text-slate-700" />
                </button>
                <h1 className="text-[1.15rem] font-bold mt-3 mx-auto pr-8 text-slate-800">Chi tiết đơn</h1>
            </div>

            <div className="px-4 mt-4 flex flex-col gap-5 relative z-10">
                
                {/* Modern Stepper */}
                <div className="w-full relative px-2 py-4 bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100">
                    <div className="absolute top-[32px] left-8 right-8 h-[3px] bg-slate-100 rounded-full z-0"></div>
                    <div 
                        className="absolute top-[32px] left-8 h-[3px] bg-blue-600 rounded-full z-0 transition-all duration-700 ease-out"
                        style={{ width: `calc(${progressWidth}% - 64px)` }}
                    ></div>
                    
                    <div className="relative z-10 flex justify-between">
                        {statusSteps.map((step, idx) => {
                            const isCompleted = idx < currentIndex || status === 'completed';
                            const isActive = idx === currentIndex && status !== 'completed';
                            
                            return (
                                <div key={step} className="flex flex-col items-center gap-3 w-16">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center relative transition-colors duration-500 ${
                                        isCompleted ? 'bg-blue-600 border-none' : 
                                        isActive ? 'bg-white border-[5px] border-blue-600 shadow-[0_0_0_3px_white]' : 
                                        'bg-white border-[3px] border-slate-200'
                                    }`}>
                                        {isCompleted && <Check size={12} strokeWidth={4} className="text-white" />}
                                    </div>
                                    <span className={`text-[0.65rem] text-center leading-tight uppercase tracking-wide px-1 ${
                                        isCompleted ? 'text-blue-700 font-bold' :
                                        isActive ? 'text-blue-700 font-black' :
                                        'text-slate-400 font-bold'
                                    }`}>
                                        {stepLabels[idx]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Banner states - Premium Design */}
                {status === 'pending' && (
                    <div className="bg-white rounded-3xl p-5 flex items-center gap-4 text-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
                        <div className="w-12 h-12 relative flex items-center justify-center shrink-0 bg-blue-50 text-blue-600 rounded-2xl">
                             <Hourglass size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex-1 font-bold text-[1.05rem]">Đang đợi xác nhận đơn</div>
                    </div>
                )}

                {status === 'cooking' && (
                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl p-5 flex items-center gap-4 text-white shadow-[0_12px_32px_rgba(245,158,11,0.25)] border border-amber-300">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                             <span className="text-3xl filter drop-shadow-sm">👨‍🍳</span>
                        </div>
                        <div className="flex-1 font-extrabold text-[1.15rem] tracking-tight">Cửa hàng đang làm đồ</div>
                    </div>
                )}

                {status === 'ready' && (
                    <div className="bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl p-5 flex items-center gap-4 text-white shadow-[0_12px_32px_rgba(16,185,129,0.25)] border border-emerald-300">
                        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                             <span className="text-3xl filter drop-shadow-sm">🏃‍♂️</span>
                        </div>
                        <div className="flex-1 font-extrabold text-[1.15rem] tracking-tight">Đồ của bạn đã làm xong!</div>
                    </div>
                )}

                {status === 'completed' && (
                    <div className="bg-white rounded-3xl p-5 flex items-center gap-4 text-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
                        <div className="w-12 h-12 relative flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-500 rounded-2xl">
                             <Check size={28} strokeWidth={3} />
                        </div>
                        <div className="flex-1 font-extrabold text-[1.1rem]">Đơn hàng đã giao xong</div>
                    </div>
                )}

                {/* Specific Action Alerts */}
                {(status === 'cooking' || status === 'pending') && (
                    <div className="bg-white rounded-3xl p-5 flex flex-col gap-5 shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                                <Bell size={20} fill="currentColor" strokeWidth={0} />
                            </div>
                            <p className="font-bold text-amber-600 text-[1rem] leading-relaxed pt-1">
                                Vui lòng đợi thông báo đồ làm xong để di chuyển ra quầy nhận đồ.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
                            <span className="text-slate-500 font-medium text-[0.95rem]">Mã nhận đồ</span>
                            <span className="font-black text-slate-800 text-[1.3rem] tracking-wide">{orderCode}</span>
                        </div>
                    </div>
                )}

                {status === 'ready' && (
                    <div className="bg-white rounded-3xl p-6 flex flex-col items-center gap-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-emerald-100 text-center">
                        <p className="font-bold text-[1.1rem] leading-snug px-2 text-slate-800">
                            Vui lòng ra quầy và <span className="text-emerald-500">đưa mã QR này</span> cho nhân viên
                        </p>
                        <div className="w-[180px] h-[180px] bg-white border-2 border-emerald-100 p-2 rounded-2xl flex items-center justify-center shadow-sm">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${orderCode}`} alt="QR Code" className="w-full h-full mix-blend-multiply rounded-xl" />
                        </div>
                        <div className="bg-emerald-50 w-full rounded-2xl py-4 flex flex-col items-center mt-2 border border-emerald-100/50">
                            <span className="font-medium text-emerald-800 text-[0.9rem] uppercase tracking-wider">Hoặc đọc mã này</span>
                            <span className="font-black text-emerald-500 text-4xl tracking-widest mt-1">{orderCode}</span>
                        </div>
                    </div>
                )}

                {/* Zalo OA Premium Card */}
                {(status === 'cooking' || status === 'pending') && (
                    <div className="bg-white border text-left border-blue-100 rounded-3xl p-5 flex flex-col gap-4 shadow-[0_8px_24px_rgba(0,104,255,0.06)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="flex gap-4 items-center relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-[#0068FF] text-white font-black flex items-center justify-center shrink-0 text-[12px] shadow-lg shadow-blue-500/30">
                                Zalo
                            </div>
                            <p className="text-[0.95rem] font-semibold leading-snug text-slate-700 flex-1">
                                Follow Zalo OA để nhận thông báo mới nhất về đơn hàng
                            </p>
                        </div>
                        <button className="bg-[#0068FF] text-white text-[0.95rem] font-bold py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all w-full relative z-10">
                            Follow OA Zalo <ChevronRight size={18} strokeWidth={3} />
                        </button>
                    </div>
                )}

                {/* Order Information Section */}
                <section className="mt-2">
                    <h3 className="font-bold text-[1.1rem] mb-3 px-1 text-slate-800">Thông tin đơn hàng</h3>
                    <div className="bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 border-dashed">
                            <span className="text-slate-500 text-[0.95rem] font-medium">Mã nhận đồ</span>
                            <div className="flex items-center gap-2 bg-slate-50 pl-3 pr-2 py-1.5 rounded-lg active:scale-95 transition-transform" onClick={() => copyToClipboard(orderCode)}>
                                <span className="font-extrabold text-[0.95rem] text-slate-800">{orderCode}</span>
                                <div className="text-blue-500 w-6 h-6 flex items-center justify-center"><Copy size={14} strokeWidth={2.5} /></div>
                            </div>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-slate-500 text-[0.95rem] font-medium">Loại đơn hàng</span>
                            <span className="font-bold text-[0.95rem] text-slate-800">Nhận đồ tại quầy</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-slate-500 text-[0.95rem] font-medium">Đặt lúc</span>
                            <span className="font-bold text-[0.95rem] text-slate-800">{orderTime}</span>
                        </div>
                        <div className="flex justify-between items-start">
                            <span className="text-slate-500 text-[0.95rem] font-medium">Thanh toán qua</span>
                            <span className="font-bold text-[0.95rem] text-slate-800 text-right max-w-[150px]">{paymentMethod}</span>
                        </div>
                    </div>
                </section>

                {/* Selected Items Section */}
                <section className="mt-2">
                    <h3 className="font-bold text-[1.1rem] mb-3 px-1 text-slate-800">Danh sách món đã chọn</h3>
                    <div className="bg-white border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] rounded-3xl p-5 flex flex-col">
                        
                        <div className="flex flex-col gap-5">
                            {fetchedOrders.length === 0 ? (
                                <p className="text-slate-400 text-[0.95rem] italic text-center py-4">Đang tải danh sách món...</p>
                            ) : (
                                fetchedOrders.map((item, idx) => (
                                    <div key={item.id || idx} className="flex gap-3">
                                        <div className="bg-amber-50 text-amber-600 font-bold w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[0.9rem]">
                                            {item.qty}
                                        </div>
                                        <div className="flex flex-col flex-1 pb-1">
                                            <div className="font-bold text-[1rem] text-slate-800 leading-snug">
                                                {item.name}
                                            </div>
                                            {item.selections && Object.keys(item.selections).length > 0 && (
                                                <div className="text-[0.85rem] text-slate-500 mt-1.5 leading-snug font-medium">
                                                    {Object.entries(item.selections).map(([group, selected]) => {
                                                        const arr = Array.isArray(selected) ? selected : [selected];
                                                        return arr.map((s: any) => s?.name).filter(Boolean).join(', ');
                                                    }).filter(Boolean).join(' • ')}
                                                </div>
                                            )}
                                        </div>
                                        <div className="font-bold text-[1rem] text-slate-800 shrink-0">
                                            {formatMoney((item.price || 0) * (item.qty || 1))} ₫
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="h-px bg-slate-100 w-full my-5 border-dashed border"></div>

                        <div className="bg-slate-50 -mx-5 px-5 py-4 flex flex-col gap-3 -mb-5 rounded-b-3xl">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 text-[0.95rem] font-medium">Tổng cộng {totalQty} phần</span>
                                <span className="font-bold text-[0.95rem] text-slate-700">{formatMoney(totalAmount)} ₫</span>
                            </div>
                            
                            <div className="h-px bg-slate-200 w-full my-0.5"></div>
                            
                            <div className="flex justify-between items-end mt-1">
                                <span className="text-slate-800 font-bold text-[1rem]">Tổng thanh toán</span>
                                <span className="font-black text-[1.4rem] text-blue-600">{formatMoney(totalAmount)} ₫</span>
                            </div>
                        </div>

                    </div>
                </section>

                {/* Footer Signature */}
                {status !== 'completed' && (
                    <div className="flex items-center justify-center gap-1.5 text-slate-400 mt-2 h-10">
                        <Lock size={12} strokeWidth={3} />
                        <span className="font-bold text-[0.75rem] tracking-widest uppercase">Safe Payment</span>
                    </div>
                )}
            </div>

            {/* Bottom Actions for Completed State */}
            {status === 'completed' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 pb-safe flex gap-3 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]">
                    <button className="flex-1 bg-amber-500 text-white shadow-lg shadow-amber-500/20 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-[0.95rem]">
                        <Star fill="white" size={18} />
                        Đánh giá
                    </button>
                    <button onClick={handleBack} className="flex-1 bg-blue-600 text-white shadow-lg shadow-blue-600/20 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform text-[0.95rem]">
                        <RefreshCw size={18} />
                        Làm mới
                    </button>
                </div>
            )}
        </div>
    );
}
